import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";
import { coverage, diffYears, search, toBoardCurriculum, topicDetail, type Graph } from "./graph.js";
import type { CurriculumRepository } from "./repository.js";

const loc = (en: string, ta: string | null) => ({ en, ...(ta ? { ta } : {}) });

async function loadGraph(db: Db, code: string, year?: string): Promise<Graph | null> {
  const [cv] = await db
    .select({ boardCode: s.boards.code, boardName: s.boards.name, academicYear: s.curriculumVersions.academicYear, cvId: s.curriculumVersions.id })
    .from(s.curriculumVersions)
    .innerJoin(s.boards, eq(s.boards.id, s.curriculumVersions.boardId))
    .where(and(sql`lower(${s.boards.code}) = ${code.toLowerCase()}`, year ? eq(s.curriculumVersions.academicYear, year) : eq(s.curriculumVersions.isCurrent, true)))
    .limit(1);
  if (!cv) return null;

  const offered = await db
    .select({ offeredId: s.subjectsOffered.id, classLevel: s.subjectsOffered.classLevel, slug: s.subjects.slug, nameEn: s.subjects.nameEn, nameTa: s.subjects.nameTa })
    .from(s.subjectsOffered)
    .innerJoin(s.subjects, eq(s.subjects.id, s.subjectsOffered.subjectId))
    .where(eq(s.subjectsOffered.curriculumVersionId, cv.cvId))
    .orderBy(asc(s.subjectsOffered.classLevel), asc(s.subjects.slug));
  const offeredIds = offered.map((o) => o.offeredId);
  const books = offeredIds.length ? await db.select().from(s.textbooks).where(inArray(s.textbooks.subjectOfferedId, offeredIds)) : [];
  const bookIds = books.map((b) => b.id);
  const chapterRows = bookIds.length ? await db.select().from(s.chapters).where(inArray(s.chapters.textbookId, bookIds)).orderBy(asc(s.chapters.position)) : [];
  const chapterIds = chapterRows.map((c) => c.id);
  const lessonRows = chapterIds.length ? await db.select().from(s.lessons).where(inArray(s.lessons.chapterId, chapterIds)) : [];
  const lessonIds = lessonRows.map((l) => l.id);
  const topicRows = lessonIds.length ? await db.select().from(s.topics).where(inArray(s.topics.lessonId, lessonIds)).orderBy(asc(s.topics.position)) : [];
  const topicIds = topicRows.map((t) => t.id);
  const objRows = topicIds.length ? await db.select().from(s.objectives).where(inArray(s.objectives.topicId, topicIds)).orderBy(asc(s.objectives.position)) : [];
  const preRows = topicIds.length ? await db.select().from(s.topicPrerequisites).where(inArray(s.topicPrerequisites.topicId, topicIds)) : [];

  const lessonToChapter = new Map(lessonRows.map((l) => [l.id, l.chapterId]));
  return {
    boardCode: cv.boardCode,
    boardName: cv.boardName,
    academicYear: cv.academicYear,
    subjects: offered.map((o) => {
      const book = books.find((b) => b.subjectOfferedId === o.offeredId);
      return {
        id: o.offeredId, classLevel: o.classLevel, slug: o.slug, name: loc(o.nameEn, o.nameTa),
        ...(book ? { textbook: { title: book.title, ...(book.edition ? { edition: book.edition } : {}), ...(book.sourceRef ? { sourceRef: book.sourceRef } : {}) } } : {}),
        chapters: chapterRows.filter((c) => c.textbookId === book?.id).map((c) => ({
          id: c.id, slug: c.slug, position: c.position, name: loc(c.nameEn, c.nameTa),
          topics: topicRows.filter((t) => lessonToChapter.get(t.lessonId) === c.id).map((t) => ({
            id: t.id, slug: t.slug, position: t.position, name: loc(t.nameEn, t.nameTa),
            objectives: objRows.filter((x) => x.topicId === t.id).map((x) => ({ text: loc(x.textEn, x.textTa), ...(x.competencyCode ? { competencyCode: x.competencyCode } : {}) })),
            prerequisiteIds: preRows.filter((p) => p.topicId === t.id).map((p) => p.prerequisiteTopicId),
          })),
        })),
      };
    }),
  };
}

export function createDbCurriculumRepository(db: Db): CurriculumRepository {
  return {
    async listBoards() {
      return db
        .select({ boardCode: s.boards.code, boardName: s.boards.name, academicYear: s.curriculumVersions.academicYear })
        .from(s.curriculumVersions)
        .innerJoin(s.boards, eq(s.boards.id, s.curriculumVersions.boardId))
        .where(eq(s.curriculumVersions.isCurrent, true))
        .orderBy(asc(s.boards.code));
    },
    async listYears(code) {
      return db
        .select({ academicYear: s.curriculumVersions.academicYear, isCurrent: s.curriculumVersions.isCurrent })
        .from(s.curriculumVersions)
        .innerJoin(s.boards, eq(s.boards.id, s.curriculumVersions.boardId))
        .where(sql`lower(${s.boards.code}) = ${code.toLowerCase()}`)
        .orderBy(asc(s.curriculumVersions.academicYear));
    },
    async getBoard(code, year) {
      const g = await loadGraph(db, code, year);
      return g ? toBoardCurriculum(g) : null;
    },
    async getTopic(code, classLevel, subject, chapter, topic) {
      const g = await loadGraph(db, code);
      return g ? topicDetail(g, classLevel, subject, chapter, topic) : null;
    },
    async search(code, query, limit) {
      const g = await loadGraph(db, code);
      return g ? search(g, query, limit) : [];
    },
    async diff(code, from, to) {
      const [a, b] = await Promise.all([loadGraph(db, code, from), loadGraph(db, code, to)]);
      return a && b ? diffYears(a, b) : null;
    },
    async coverage(code, year) {
      const g = await loadGraph(db, code, year);
      return g ? coverage(g) : null;
    },
  };
}
