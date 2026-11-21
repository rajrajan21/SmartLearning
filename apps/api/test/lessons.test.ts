import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { CurriculumImport, LessonImport, QuestionImport } from "@studysmart/shared";
import { createApp } from "../src/app.js";
import { curriculumDir, lessonsDir, questionsDir } from "../src/server-paths.js";
import { LessonImportError } from "../src/modules/lessons/service.js";
import { importCurriculum } from "../src/modules/curriculum/importer.js";
import { makeRepo, seedFile } from "./helpers.js";

const lessonFor = (over: Record<string, unknown> = {}) => ({
  board: "CBSE", classLevel: 3, subject: "maths", chapter: "toy-joy", topic: "counting-toys",
  lesson: { status: "published", title: { en: "Counting toys" }, blocks: [
    { id: "b1", type: "explanation", provenance: "original", text: { en: "Count in tens." } },
    { id: "b2", type: "summary", provenance: "original", points: [{ en: "Tens help." }] }] },
  ...over,
});

describe("lesson content files", () => {
  it("every file in content/lessons is valid", () => {
    const files = readdirSync(lessonsDir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(LessonImport.safeParse(JSON.parse(readFileSync(join(lessonsDir, f), "utf8"))).success, f).toBe(true);
  });
  it("the shipped lessons import against the shipped curriculum and are served", async () => {
    const curriculums = ["cbse-2026-27.json", "tn-matric-2026-27.json"].map((f) =>
      CurriculumImport.parse(JSON.parse(readFileSync(join(curriculumDir, f), "utf8"))));
    const [cbse, matric] = curriculums;
    const m = await makeRepo(cbse!);
    await importCurriculum(m.db, matric!);
    const registered = new Set<string>();
    for (const curriculum of curriculums) for (const cls of curriculum.classes) {
      for (const subject of cls.subjects) for (const chapter of subject.chapters) for (const topic of chapter.topics ?? []) {
        registered.add([curriculum.boardCode, cls.classLevel, subject.slug, chapter.slug, topic.slug].join("/"));
      }
    }
    for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json"))) {
      const les = LessonImport.parse(JSON.parse(readFileSync(join(lessonsDir, f), "utf8")));
      const qs = QuestionImport.parse(JSON.parse(readFileSync(join(questionsDir, f), "utf8")));
      const id = [les.board, les.classLevel, les.subject, les.chapter, les.topic].join("/");
      expect(registered.has(id), f).toBe(true);
      expect([qs.board, qs.classLevel, qs.subject, qs.chapter, qs.topic].join("/"), f).toBe(id);
      const keys = new Set(qs.questions.map((q) => q.key));
      for (const b of les.lesson.blocks) if (b.type === "quiz") for (const id of b.questionIds) expect(keys.has(id), `${f}: quiz question ${id}`).toBe(true);
    }
    for (const f of ["cbse-3-maths-fun-with-shapes-sides-and-corners.json", "tnm-10-english-unit-1-his-first-flight.json"]) {
      const lesson = LessonImport.parse(JSON.parse(readFileSync(join(lessonsDir, f), "utf8")));
      await m.lessons.importLesson(lesson);
      await m.practice.importQuestions(JSON.parse(readFileSync(join(questionsDir, f), "utf8")));
      expect(await m.lessons.getPublished(lesson.board, lesson.classLevel, lesson.subject, lesson.chapter, lesson.topic)).toMatchObject({ title: lesson.lesson.title });
    }
  }, 30_000);
});

describe("lesson import and API", () => {
  let m: Awaited<ReturnType<typeof makeRepo>>;
  let app: ReturnType<typeof createApp>;
  beforeAll(async () => { m = await makeRepo(); app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, adminKey: null }); });

  it("is idempotent, versions only on real change", async () => {
    const a = await m.lessons.importLesson(lessonFor());
    expect(a).toMatchObject({ version: 1, changed: true });
    expect(await m.lessons.importLesson(lessonFor())).toMatchObject({ version: 1, changed: false });
    const edited = lessonFor({ lesson: { status: "published", title: { en: "Counting toys!" }, blocks: [{ id: "b1", type: "explanation", provenance: "original", text: { en: "Count." } }] } });
    expect(await m.lessons.importLesson(edited)).toMatchObject({ version: 2, changed: true });
  });
  it("serves the newest published lesson and lists available topics", async () => {
    const res = await request(app).get("/api/v1/lessons/boards/CBSE/3/maths/toy-joy/counting-toys").expect(200);
    expect(res.body.version).toBe(2);
    expect(res.body.title.en).toBe("Counting toys!");
    const avail = await request(app).get("/api/v1/lessons/available").expect(200);
    expect(avail.body.topicIds).toContain(res.body.topicId);
  });
  it("draft lessons are never served", async () => {
    await m.lessons.importLesson(lessonFor({ topic: "toy-patterns", lesson: { status: "draft", title: { en: "Draft" }, blocks: [{ id: "b", type: "summary", provenance: "original", points: [{ en: "x" }] }] } }));
    await request(app).get("/api/v1/lessons/boards/CBSE/3/maths/toy-joy/toy-patterns").expect(404);
  });
  it("rejects unknown topics, bad content and bad paths", async () => {
    await expect(m.lessons.importLesson(lessonFor({ topic: "nope" }))).rejects.toBeInstanceOf(LessonImportError);
    await expect(m.lessons.importLesson(lessonFor({ lesson: { status: "published", title: { en: "x" }, blocks: [{ id: "a", type: "summary", provenance: "original", points: [{ en: "x" }] }, { id: "a", type: "summary", provenance: "original", points: [{ en: "y" }] }] } }))).rejects.toThrow(/Duplicate block id/);
    await request(app).get("/api/v1/lessons/boards/CBSE/99/maths/toy-joy/counting-toys").expect(400);
    await request(app).get("/api/v1/lessons/boards/CBSE/3/maths/toy-joy/missing").expect(404);
  });
  it("maintenance mode also pauses lessons", async () => {
    await m.settings.update({ "site.maintenance.enabled": true }, "test");
    await request(app).get("/api/v1/lessons/available").expect(503);
    await m.settings.update({ "site.maintenance.enabled": false }, "test");
  });
});
