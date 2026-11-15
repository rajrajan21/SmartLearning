import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { ClassroomLesson } from "@studysmart/shared";
import { classroomDir, curriculumDir } from "../src/server-paths.js";
import { createClassroomService } from "../src/modules/classroom/service.js";
import { collectJobs } from "../src/modules/audio/build.js";
import { createApp } from "../src/app.js";
import { makeRepo, seedFile } from "./helpers.js";
import { lessonsDir, questionsDir } from "../src/server-paths.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
const audioDir = mkdtempSync(join(tmpdir(), "aud-")); // no phrases file: only the lesson narration is counted

const files = readdirSync(classroomDir).filter((f) => f.endsWith(".json"));
const load = (f: string) => JSON.parse(readFileSync(join(classroomDir, f), "utf8"));

describe("shipped classroom lessons", () => {
  it("has the review samples and all of them are valid", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
    for (const f of files) { const r = ClassroomLesson.safeParse(load(f)); expect(r.success, `${f}: ${r.success ? "" : JSON.stringify(r.error.issues[0])}`).toBe(true); }
  });
  it("belongs to topics that exist in the curriculum", () => {
    const cur = JSON.parse(readFileSync(join(curriculumDir, "cbse-2026-27.json"), "utf8"));
    for (const f of files) {
      const l = load(f), ch = cur.classes.find((c: { classLevel: number }) => c.classLevel === l.classLevel)?.subjects.find((s: { slug: string }) => s.slug === l.subject)?.chapters.find((c: { slug: string }) => c.slug === l.chapter);
      expect(ch, f).toBeTruthy();
      expect(ch.topics.some((t: { slug: string }) => t.slug === l.topic), `${f} topic`).toBe(true);
    }
  });
  it("keeps every spoken sentence short enough to record", () => {
    for (const j of collectJobs({ lessonsDir, classroomDir, audioDir }, ["en"]).filter((x) => x.where.includes("cbse-") && files.some((f) => x.where.startsWith(f)))) expect(j.text.length, j.where).toBeLessThanOrEqual(300);
  });
  it("adds the classroom narration to the audio jobs", () => {
    const jobs = collectJobs({ lessonsDir, classroomDir, audioDir }, ["en"]);
    expect(jobs.some((j) => j.where.startsWith("classroom-3-maths-halves") || j.where.includes("halves-and-quarters"))).toBe(true);
    expect(jobs.some((j) => j.where.endsWith("question"))).toBe(true);
    expect(jobs.some((j) => j.where.includes("explanation"))).toBe(true);
  });
});

describe("classroom API", () => {
  const svc = createClassroomService({ lessonsDir, questionsDir, classroomDir });
  it("lists and fetches lessons (board name in any case)", () => {
    expect(svc.index().items.length).toBeGreaterThanOrEqual(13);
    const l = svc.get("cbse", 3, "maths", "fair-share", "halves-and-quarters");
    expect(l?.steps.length).toBeGreaterThan(20);
    expect(l?.steps.some((s) => s.section === "Picture it")).toBe(true); // the hand-made picture page is included
    expect(svc.get("CBSE", 3, "maths", "fair-share", "nope")).toBeNull();
  });
  it("is served over HTTP and can be switched off", async () => {
    const m = await makeRepo(seedFile());
    const settings = m.settings;
    const app = createApp({ curriculum: m.repo, settings, lessons: m.lessons, practice: m.practice, classroom: svc, adminKey: null });
    expect((await request(app).get("/api/v1/classroom/index")).body.items.length).toBeGreaterThanOrEqual(13);
    expect((await request(app).get("/api/v1/classroom/CBSE/3/maths/fair-share/halves-and-quarters")).status).toBe(200);
    expect((await request(app).get("/api/v1/classroom/CBSE/3/maths/fair-share/zzz")).status).toBe(404);
    expect((await request(app).get("/api/v1/classroom/CBSE/x/maths/a/b")).status).toBe(400);
    await settings.update({ "feature.classroom": false }, "test");
    expect((await request(app).get("/api/v1/classroom/index")).status).toBe(404);
  });
});

describe("the real phrases file", () => {
  it("is readable by the audio builder (it crashed on this once)", async () => {
    const { audioDir: real } = await import("../src/server-paths.js");
    const jobs = collectJobs({ lessonsDir, classroomDir, audioDir: real }, ["en"]);
    expect(jobs.some((j) => j.where.startsWith("phrases praise"))).toBe(true);
  });
});
