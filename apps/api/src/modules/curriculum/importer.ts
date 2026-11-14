import { eq, inArray } from "drizzle-orm";
import { CurriculumImport } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";

export interface ImportSummary {
  board: string;
  academicYear: string;
  subjects: number;
  chapters: number;
  topics: number;
}

/** Idempotent: running it twice with the same file changes nothing. Validates before touching the database. */
export async function importCurriculum(db: Db, raw: unknown): Promise<ImportSummary> {
  const data = CurriculumImport.parse(raw);
  let subjects = 0, chapters = 0, topics = 0;
  const topicIds = new Map<string, string>();

  await db.transaction(async (tx) => {
    const [board] = await tx
      .insert(s.boards)
      .values({ code: data.boardCode, name: data.boardName })
      .onConflictDoUpdate({ target: s.boards.code, set: { name: data.boardName, updatedAt: new Date() } })
      .returning({ id: s.boards.id });
    if (!board) throw new Error("board upsert failed");

    if (data.isCurrent) {
      await tx.update(s.curriculumVersions).set({ isCurrent: false }).where(eq(s.curriculumVersions.boardId, board.id));
    }
    const [cv] = await tx
      .insert(s.curriculumVersions)
      .values({ boardId: board.id, academicYear: data.academicYear, isCurrent: data.isCurrent })
      .onConflictDoUpdate({
        target: [s.curriculumVersions.boardId, s.curriculumVersions.academicYear],
        set: { isCurrent: data.isCurrent, updatedAt: new Date() },
      })
      .returning({ id: s.curriculumVersions.id });
    if (!cv) throw new Error("curriculum version upsert failed");

    for (const cls of data.classes) {
      for (const subj of cls.subjects) {
        subjects++;
        const [subject] = await tx
          .insert(s.subjects)
          .values({ slug: subj.slug, nameEn: subj.name.en, nameTa: subj.name.ta ?? null })
          .onConflictDoUpdate({ target: s.subjects.slug, set: { nameEn: subj.name.en, nameTa: subj.name.ta ?? null, updatedAt: new Date() } })
          .returning({ id: s.subjects.id });
        if (!subject) throw new Error("subject upsert failed");

        const [offered] = await tx
          .insert(s.subjectsOffered)
          .values({ curriculumVersionId: cv.id, classLevel: cls.classLevel, subjectId: subject.id })
          .onConflictDoUpdate({
            target: [s.subjectsOffered.curriculumVersionId, s.subjectsOffered.classLevel, s.subjectsOffered.subjectId],
            set: { updatedAt: new Date() },
          })
          .returning({ id: s.subjectsOffered.id });
        if (!offered) throw new Error("offering upsert failed");

        let textbook = (await tx.select({ id: s.textbooks.id }).from(s.textbooks).where(eq(s.textbooks.subjectOfferedId, offered.id)).limit(1))[0];
        const tbValues = { title: subj.textbook.title, edition: subj.textbook.edition ?? null, sourceRef: subj.textbook.sourceRef ?? null };
        if (textbook) {
          await tx.update(s.textbooks).set({ ...tbValues, updatedAt: new Date() }).where(eq(s.textbooks.id, textbook.id));
        } else {
          textbook = (await tx.insert(s.textbooks).values({ subjectOfferedId: offered.id, ...tbValues }).returning({ id: s.textbooks.id }))[0];
        }
        if (!textbook) throw new Error("textbook upsert failed");

        for (const [i, ch] of subj.chapters.entries()) {
          chapters++;
          const [chapter] = await tx
            .insert(s.chapters)
            .values({ textbookId: textbook.id, slug: ch.slug, position: i + 1, nameEn: ch.name.en, nameTa: ch.name.ta ?? null })
            .onConflictDoUpdate({
              target: [s.chapters.textbookId, s.chapters.slug],
              set: { position: i + 1, nameEn: ch.name.en, nameTa: ch.name.ta ?? null, updatedAt: new Date() },
            })
            .returning({ id: s.chapters.id });
          if (!chapter) throw new Error("chapter upsert failed");
          if (ch.topics.length === 0) continue;

          // NCERT chapters rarely have sub-lessons, so topics hang under one default lesson.
          const [lesson] = await tx
            .insert(s.lessons)
            .values({ chapterId: chapter.id, slug: "main", position: 1, nameEn: ch.name.en, nameTa: ch.name.ta ?? null })
            .onConflictDoUpdate({ target: [s.lessons.chapterId, s.lessons.slug], set: { nameEn: ch.name.en, updatedAt: new Date() } })
            .returning({ id: s.lessons.id });
          if (!lesson) throw new Error("lesson upsert failed");
          for (const [j, t] of ch.topics.entries()) {
            topics++;
            const [topic] = await tx
              .insert(s.topics)
              .values({ lessonId: lesson.id, slug: t.slug, position: j + 1, nameEn: t.name.en, nameTa: t.name.ta ?? null })
              .onConflictDoUpdate({
                target: [s.topics.lessonId, s.topics.slug],
                set: { position: j + 1, nameEn: t.name.en, nameTa: t.name.ta ?? null, updatedAt: new Date() },
              })
              .returning({ id: s.topics.id });
            if (!topic) throw new Error("topic upsert failed");
            topicIds.set(`${cls.classLevel}/${subj.slug}/${ch.slug}/${t.slug}`, topic.id);
            // The file is the source of truth for objectives: replace the set.
            await tx.delete(s.objectives).where(eq(s.objectives.topicId, topic.id));
            if (t.objectives.length) {
              await tx.insert(s.objectives).values(t.objectives.map((o, k) => ({
                topicId: topic.id, position: k + 1, textEn: o.text.en, textTa: o.text.ta ?? null, competencyCode: o.competencyCode ?? null,
              })));
            }
          }
        }
      }
    }

    // Second pass: prerequisites (all topics now have ids). Replace each topic's set.
    const ids = [...topicIds.values()];
    if (ids.length) await tx.delete(s.topicPrerequisites).where(inArray(s.topicPrerequisites.topicId, ids));
    for (const cls of data.classes) for (const subj of cls.subjects) for (const ch of subj.chapters) for (const t of ch.topics) {
      const from = topicIds.get(`${cls.classLevel}/${subj.slug}/${ch.slug}/${t.slug}`);
      const rows = t.prerequisites.flatMap((key) => { const to = topicIds.get(key); return from && to ? [{ topicId: from, prerequisiteTopicId: to }] : []; });
      if (rows.length) await tx.insert(s.topicPrerequisites).values(rows);
    }
  });

  return { board: data.boardCode, academicYear: data.academicYear, subjects, chapters, topics };
}
