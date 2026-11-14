import { and, desc, eq } from "drizzle-orm";
import { LessonImport, TopicLesson } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";
import type { AudioStore } from "../audio/manifest.js";
import type { CurriculumRepository } from "../curriculum/repository.js";

export class LessonImportError extends Error {}

export interface LessonService {
  /** Idempotent: identical content adds no version; changed content adds the next version. */
  importLesson(raw: unknown): Promise<{ topicId: string; version: number; changed: boolean }>;
  getPublished(board: string, classLevel: number, subject: string, chapter: string, topic: string): Promise<TopicLesson | null>;
  publishedTopicIds(): Promise<string[]>;
  /** the newest published lesson for a topic id (used by the question helper) */
  getPublishedById(topicId: string): Promise<TopicLesson | null>;
}

export function createLessonService(db: Db, curriculum: CurriculumRepository, audio?: AudioStore): LessonService {
  const latest = (topicId: string) =>
    db.select().from(s.topicVersions).where(eq(s.topicVersions.topicId, topicId)).orderBy(desc(s.topicVersions.version)).limit(1);

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

    async publishedTopicIds() {
      const rows = await db.selectDistinct({ id: s.topicVersions.topicId }).from(s.topicVersions).where(eq(s.topicVersions.status, "published"));
      return rows.map((r) => r.id);
    },
  };
}
