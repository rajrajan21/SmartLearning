import { and, desc, eq } from "drizzle-orm";
import { LessonImport, TopicLesson } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";
import type { AudioStore } from "../audio/manifest.js";
import type { CurriculumRepository } from "../curriculum/repository.js";

export class LessonImportError extends Error {}

export interface BoardSummary { code: string; name: string; lessons: number; topics: number; classes: { classLevel: number; lessons: number }[] }

export interface LessonService {
  /** Idempotent: identical content adds no version; changed content adds the next version. */
  importLesson(raw: unknown): Promise<{ topicId: string; version: number; changed: boolean }>;
  getPublished(board: string, classLevel: number, subject: string, chapter: string, topic: string): Promise<TopicLesson | null>;
  publishedTopicIds(): Promise<string[]>;
  /** Per board: how many published lessons it has, in total and per class (the home page uses this to list every board with lessons). */
  boardSummary(): Promise<BoardSummary[]>;
  /** the newest published lesson for a topic id (used by the question helper) */
  getPublishedById(topicId: string): Promise<TopicLesson | null>;
}

export function createLessonService(db: Db, curriculum: CurriculumRepository, audio?: AudioStore): LessonService {
  const latest = (topicId: string) =>
    db.select().from(s.topicVersions).where(eq(s.topicVersions.topicId, topicId)).orderBy(desc(s.topicVersions.version)).limit(1);

  let summaryCache: { at: number; rows: BoardSummary[] } | null = null;
  return {
    async importLesson(raw) {
      const d = LessonImport.parse(raw);
      const detail = await curriculum.getTopic(d.board, d.classLevel, d.subject, d.chapter, d.topic);
      if (!detail) throw new LessonImportError(`No topic ${d.classLevel}/${d.subject}/${d.chapter}/${d.topic} in ${d.board}. Add the topic to the curriculum file first.`);
      const topicId = detail.topic.id;
      const body = JSON.stringify(d.lesson);
      const [last] = await latest(topicId);
      if (last && JSON.stringify((({ topicId: _t, version: _v, ...rest }) => rest)(JSON.parse(last.lessonJson))) === body) {
        return { topicId, version: last.version, changed: false };
      }
      const version = (last?.version ?? 0) + 1;
      await db.insert(s.topicVersions).values({ topicId, version, status: d.lesson.status, lessonJson: JSON.stringify({ topicId, version, ...d.lesson }) });
      return { topicId, version, changed: true };
    },

    async getPublished(board, classLevel, subject, chapter, topic) {
      const detail = await curriculum.getTopic(board, classLevel, subject, chapter, topic);
      if (!detail) return null;
      const [row] = await db
        .select()
        .from(s.topicVersions)
        .where(and(eq(s.topicVersions.topicId, detail.topic.id), eq(s.topicVersions.status, "published")))
        .orderBy(desc(s.topicVersions.version))
        .limit(1);
      if (!row) return null;
      const parsed = TopicLesson.safeParse(JSON.parse(row.lessonJson));
      if (!parsed.success) { console.error("invalid_stored_lesson", row.topicId, row.version); return null; }
      return audio ? audio.enrich(parsed.data) : parsed.data;
    },

    async getPublishedById(topicId) {
      const [row] = await db.select().from(s.topicVersions).where(and(eq(s.topicVersions.topicId, topicId), eq(s.topicVersions.status, "published"))).orderBy(desc(s.topicVersions.version)).limit(1);
      if (!row) return null;
      const parsed = TopicLesson.safeParse(JSON.parse(row.lessonJson));
      return parsed.success ? parsed.data : null;
    },

    async boardSummary() {
      if (summaryCache && Date.now() - summaryCache.at < 60_000) return summaryCache.rows;
      const published = new Set(await this.publishedTopicIds());
      const rows: BoardSummary[] = [];
      for (const b of await curriculum.listBoards()) {
        const tree = await curriculum.getBoard(b.boardCode);
        if (!tree) continue;
        let lessons = 0, topics = 0;
        const classes: { classLevel: number; lessons: number }[] = [];
        for (const c of tree.classes) {
          let n = 0;
          for (const sub of c.subjects) for (const ch of sub.chapters) for (const t of ch.topics) { topics++; if (published.has(t.id)) n++; }
          lessons += n;
          classes.push({ classLevel: c.classLevel, lessons: n });
        }
        rows.push({ code: b.boardCode, name: b.boardName, lessons, topics, classes });
      }
      summaryCache = { at: Date.now(), rows };
      return rows;
    },

    async publishedTopicIds() {
      const rows = await db.selectDistinct({ id: s.topicVersions.topicId }).from(s.topicVersions).where(eq(s.topicVersions.status, "published"));
      return rows.map((r) => r.id);
    },
  };
}
