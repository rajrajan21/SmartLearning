import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { indexEntry, PaperSchema, scoreByChapter, scorePaper, type Paper } from "@studysmart/shared";
import { createApp } from "../src/app.js";
import { createPaperStore } from "../src/modules/papers/store.js";
import { makeRepo, seedFile } from "./helpers.js";

const paper: Paper = {
  v: 1, id: "cbse-10-science-sample-2025-26-abc123", title: "CBSE Class 10 Science Sample paper 2025-26", board: "cbse", cls: 10, subject: "Science", year: "2025-26", kind: "sample", maxMarks: 6,
  source: { site: "CBSE Academic Unit", url: "https://cbseacademic.nic.in/x.pdf" }, hash: "abc",
  sections: [{ title: "Section A", questions: [
    { n: "1", text: "Which gas is released in photosynthesis?", marks: 1, type: "mcq", options: ["CO2", "Oxygen", "N2", "H2"], answer: "B" },
    { n: "2", text: "True or false: acids turn blue litmus red.", marks: 1, type: "tf", answer: "A" },
    { n: "3", text: "Explain respiration.", marks: 4, type: "long", model: "Glucose is broken down to release energy." },
  ] }],
};
const KEY = "test-key-0123456789abcdef0123";
const adm = (r: request.Test) => r.set("x-admin-key", KEY);
let app: ReturnType<typeof createApp>; let dir: string;
beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "papers-api-"));
  writeFileSync(join(dir, `${paper.id}.json.gz`), gzipSync(JSON.stringify(paper)));
  writeFileSync(join(dir, "index.json"), JSON.stringify({ updated: "x", papers: [indexEntry(paper, "2026-11-16")] }));
  writeFileSync(join(dir, "bad-paper-1.json.gz"), gzipSync('{"v":1}'));
  const m = await makeRepo(seedFile());
  await m.settings.update({ "papers.list.minQuestions": 1 }, "test", "test");
  app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, papers: createPaperStore(dir), papersDir: dir, adminKey: KEY });
});

describe("question papers API", () => {
  it("lists papers and serves one", async () => {
    const l = await request(app).get("/api/v1/papers").expect(200);
    expect(l.body.papers[0]).toMatchObject({ id: paper.id, questions: 3, mcq: 2, keyed: 3 });
    const p = await request(app).get(`/api/v1/papers/${paper.id}`).expect(200);
    expect(PaperSchema.safeParse(p.body).success).toBe(true);
  });
  it("answers 404 for unknown, unsafe and invalid files", async () => {
    await request(app).get("/api/v1/papers/nope-nope-1").expect(404);
    await request(app).get("/api/v1/papers/bad-paper-1").expect(404);
    await request(app).get("/api/v1/papers/..%2Findex").expect(404);
  });
});

describe("papers admin", () => {
  it("needs the admin key", async () => { await request(app).get("/api/v1/admin/papers/status").expect(401); });
  it("shows status, hides and shows a paper, resets the collector", async () => {
    const s = await adm(request(app).get("/api/v1/admin/papers/status")).expect(200);
    expect(s.body).toMatchObject({ total: 1, visible: 1, questions: 3 });
    await adm(request(app).post("/api/v1/admin/papers/hide")).send({ ids: [paper.id] }).expect(200);
    expect((await request(app).get("/api/v1/papers")).body.papers).toHaveLength(0);
    await request(app).get(`/api/v1/papers/${paper.id}`).expect(404);
    expect((await adm(request(app).get("/api/v1/admin/papers/status"))).body.papers[0].hidden).toBe(true);
    await adm(request(app).post("/api/v1/admin/papers/show")).send({ ids: [paper.id] }).expect(200);
    expect((await request(app).get("/api/v1/papers")).body.papers).toHaveLength(1);
    const r = await adm(request(app).post("/api/v1/admin/papers/reset-collector")).send({}).expect(200);
    expect(r.body.resetCounter).toBeGreaterThan(0);
  });
});

describe("marking", () => {
  it("marks choices automatically and written answers from reviewer marks", () => {
    const s = scorePaper(paper, { answers: { "0.0": "B", "0.1": "B", "0.2": "text" }, given: { "0.2": 3 } });
    expect(s).toMatchObject({ auto: 1, autoOf: 2, reviewer: 3, reviewerOf: 4, total: 4, of: 6, wrong: ["0.1"], right: ["0.0"] });
    expect(scoreByChapter({ ...paper, sections: [{ title: "A", questions: [{ ...paper.sections[0]!.questions[0]!, chapter: "Life Processes" }, { ...paper.sections[0]!.questions[2]!, chapter: "Electricity" }] }] }, { answers: { "0.0": "B" }, given: {} })).toEqual([{ chapter: "Electricity", got: 0, of: 4 }, { chapter: "Life Processes", got: 1, of: 1 }]);
    expect(scorePaper(paper, { answers: {}, given: { "0.2": 99 } })).toMatchObject({ reviewer: 4, unanswered: 3 });
  });
});
