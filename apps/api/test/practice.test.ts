import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { Question, QuestionImport } from "@studysmart/shared";
import { createApp } from "../src/app.js";
import { grade, normText, toPublic } from "../src/modules/practice/grade.js";
import { questionsDir } from "../src/server-paths.js";
import { makeRepo, seedFile, shapesJson } from "./helpers.js";

const L = (en: string) => ({ en });
const common = { round: 1, stem: L("Q?"), hints: [], explanation: L("Because."), provenance: "original", status: "published" };
const mcq = Question.parse({ ...common, key: "m", type: "mcq", options: [{ id: "a", text: L("A"), correct: true }, { id: "b", text: L("B"), whyWrong: L("B is wrong because...") }] });
const num = Question.parse({ ...common, key: "n", type: "number", answer: 4.5, tolerance: 0.1, unit: L("cm"), wrongAnswers: [{ value: 9, why: L("You doubled it") }] });
const short = Question.parse({ ...common, key: "s", type: "short", accepted: ["Triangle", "முக்கோணம்"], wrongAnswers: [{ text: "square", why: L("Square has 4") }] });
const order = Question.parse({ ...common, key: "o", type: "order", items: [{ id: "x", text: L("one") }, { id: "y", text: L("two") }, { id: "z", text: L("three") }] });
const tf = Question.parse({ ...common, key: "t", type: "true_false", answer: false });

const multi = Question.parse({ ...common, key: "mu", type: "multi", options: [{ id: "a", text: L("A"), correct: true }, { id: "b", text: L("B") }, { id: "c", text: L("C"), correct: true }] });
const match = Question.parse({ ...common, key: "ma", passage: L("A small case."), type: "match", pairs: [{ id: "p1", left: L("Cat"), right: L("Meows") }, { id: "p2", left: L("Dog"), right: L("Barks") }] });
const long = Question.parse({ ...common, key: "lo", type: "long", modelAnswer: L("Plants make food using light."), keyPoints: [{ label: L("light"), anyOf: ["light", "sun"] }, { label: L("food"), anyOf: ["food", "sugar"] }] });

describe("new question types", () => {
  it("multi needs every right option and nothing else", () => {
    expect(grade(multi, { type: "multi", ids: ["c", "a"] })).toMatchObject({ correct: true });
    expect(grade(multi, { type: "multi", ids: ["a"] })).toMatchObject({ correct: false });
    expect(grade(multi, { type: "multi", ids: ["a", "b", "c"] })).toMatchObject({ correct: false });
    expect(grade(multi, { type: "multi", ids: ["zz"] })).toHaveProperty("error");
  });
  it("match checks every pair; public copy keeps the passage and hides answers", () => {
    expect(grade(match, { type: "match", pairs: [{ left: "p1", right: "p1" }, { left: "p2", right: "p2" }] })).toMatchObject({ correct: true });
    expect(grade(match, { type: "match", pairs: [{ left: "p1", right: "p2" }, { left: "p2", right: "p1" }] })).toMatchObject({ correct: false });
    expect(grade(match, { type: "match", pairs: [{ left: "p1", right: "p1" }] })).toHaveProperty("error");
    const pub = toPublic("id1", match) as unknown as Record<string, unknown>;
    expect(pub.passage).toEqual(L("A small case."));
    expect(pub).toHaveProperty("lefts");
  });
  it("long answers pass on half the key points", () => {
    expect(grade(long, { type: "long", text: "They use the Sun" })).toMatchObject({ correct: true });
    expect(grade(long, { type: "long", text: "They grow" })).toMatchObject({ correct: false, correctAnswer: L("Plants make food using light.") });
  });
});

describe("grading", () => {
  it("mcq: right, wrong with its own explanation, and unknown choice", () => {
    expect(grade(mcq, { type: "mcq", optionId: "a" })).toMatchObject({ correct: true });
    expect(grade(mcq, { type: "mcq", optionId: "b" })).toMatchObject({ correct: false, whyWrong: L("B is wrong because..."), correctAnswer: L("A") });
    expect(grade(mcq, { type: "mcq", optionId: "zz" })).toHaveProperty("error");
  });
  it("numbers: tolerance, known slips, unit in the shown answer", () => {
    expect(grade(num, { type: "number", value: 4.55 })).toMatchObject({ correct: true });
    expect(grade(num, { type: "number", value: 9 })).toMatchObject({ correct: false, whyWrong: L("You doubled it") });
    expect(grade(num, { type: "number", value: 1 })).toMatchObject({ correct: false, correctAnswer: { en: "4.5 cm" } });
  });
  it("short answers ignore case, spaces and end punctuation, and accept Tamil", () => {
    expect(normText("  A   Triangle! ")).toBe("a triangle");
    expect(grade(short, { type: "short", text: "triangle." })).toMatchObject({ correct: true });
    expect(grade(short, { type: "short", text: "முக்கோணம்" })).toMatchObject({ correct: true });
    expect(grade(short, { type: "short", text: "Square" })).toMatchObject({ correct: false, whyWrong: L("Square has 4") });
  });
  it("true/false and ordering; wrong type or incomplete order is an error", () => {
    expect(grade(tf, { type: "true_false", value: false })).toMatchObject({ correct: true });
    expect(grade(order, { type: "order", ids: ["x", "y", "z"] })).toMatchObject({ correct: true, correctAnswer: L("one → two → three") });
    expect(grade(order, { type: "order", ids: ["y", "x", "z"] })).toMatchObject({ correct: false });
    expect(grade(order, { type: "order", ids: ["x", "x", "z"] })).toHaveProperty("error");
    expect(grade(tf, { type: "number", value: 1 })).toHaveProperty("error");
  });
  it("what students receive has no answers, and ordering is not given away", () => {
    for (const q of [mcq, num, short, order, tf]) {
      const text = JSON.stringify(toPublic("id1", q));
      for (const secret of ["correct", "whyWrong", "explanation", "accepted", "tolerance", "wrongAnswers", "\"answer\""]) expect(text).not.toContain(secret);
    }
    const pub = toPublic("id1", order);
    expect(pub.type === "order" && pub.items.map((i) => i.id).join()).not.toBe("x,y,z");
  });
});

describe("question files", () => {
  it("every shipped file is valid", () => {
    const files = readdirSync(questionsDir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const r = QuestionImport.safeParse(JSON.parse(readFileSync(join(questionsDir, f), "utf8")));
      expect(r.success, f).toBe(true);
      if (r.success) for (const n of [1, 2, 3]) expect(r.data.questions.some((q) => q.round === n), `${f} round ${n}`).toBe(true);
    }
    const fullPractice = QuestionImport.parse(shapesJson(questionsDir));
    expect(fullPractice.questions.some((q) => q.round === 4)).toBe(true);
  });
  it("authoring mistakes are caught", () => {
    const bad = (q: object) => QuestionImport.safeParse({ board: "CBSE", classLevel: 3, subject: "maths", chapter: "c", topic: "t", questions: [{ ...common, ...q }] });
    expect(bad({ key: "a", type: "mcq", options: [{ id: "a", text: L("A"), correct: true }, { id: "b", text: L("B") }] }).success).toBe(false); // missing why-wrong
    expect(bad({ key: "a", type: "mcq", options: [{ id: "a", text: L("A") , whyWrong: L("x")}, { id: "b", text: L("B"), whyWrong: L("y") }] }).success).toBe(false); // no correct
    expect(bad({ key: "a", type: "mcq", options: [{ id: "a", text: L("A"), correct: true }, { id: "b", text: L("B"), correct: true }] }).success).toBe(false); // two correct
    expect(bad({ key: "Bad Key", type: "true_false", answer: true }).success).toBe(false);
    expect(bad({ key: "a", type: "true_false", answer: true, image: { assetKey: "x.png" } }).success).toBe(false); // picture without alt text
    const dup = QuestionImport.safeParse({ board: "CBSE", classLevel: 3, subject: "maths", chapter: "c", topic: "t", questions: [{ ...common, key: "a", type: "true_false", answer: true }, { ...common, key: "a", type: "true_false", answer: false }] });
    expect(dup.success).toBe(false);
  });
});

describe("practice API", () => {
  let m: Awaited<ReturnType<typeof makeRepo>>;
  let app: ReturnType<typeof createApp>;
  const file = () => shapesJson(questionsDir);
  const questionCount = file().questions.length;
  const path = "/api/v1/practice/boards/CBSE/3/maths/fun-with-shapes/sides-and-corners";
  beforeAll(async () => {
    m = await makeRepo(seedFile());
    app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, adminKey: null });
    expect(await m.practice.importQuestions(file())).toMatchObject({ added: questionCount, updated: 0 });
  });
  const anon = randomUUID();
  const get = async () => (await request(app).get(path).expect(200)).body as { topicId: string; questions: { id: string; key: string; round: number }[] };

  it("import is idempotent and bumps the version only when a question changes", async () => {
    expect(await m.practice.importQuestions(file())).toMatchObject({ added: 0, updated: 0, unchanged: questionCount });
    const f = file(); f.questions[0].explanation.en = "Changed words.";
    expect(await m.practice.importQuestions(f)).toMatchObject({ updated: 1, unchanged: questionCount - 1 });
    await m.practice.importQuestions(file()); // put it back
  });
  it("serves the question set without any answers", async () => {
    const set = await get();
    expect(set.questions).toHaveLength(questionCount);
    expect(JSON.stringify(set)).not.toMatch(/whyWrong|"correct"|explanation|accepted/);
    const avail = await request(app).get("/api/v1/practice/available").expect(200);
    expect(avail.body.topicIds).toContain(set.topicId);
    expect(avail.body.rounds[set.topicId]).toEqual([1, 2, 3, 4]);
  });
  it("loads a chapter in one request and keeps answers private", async () => {
    const pool = await request(app).get("/api/v1/practice/boards/CBSE/3/maths/fun-with-shapes").expect(200);
    expect(pool.body.questions).toHaveLength(questionCount);
    expect(JSON.stringify(pool.body)).not.toMatch(/whyWrong|"correct"|explanation|accepted/);
    await request(app).get("/api/v1/practice/boards/CBSE/3/maths/no-such-chapter").expect(404);
  });
  it("fetches questions by id for revision, without answers, and ignores unknown ids", async () => {
    const set = await get();
    const ids = [set.questions[0]!.id, set.questions[5]!.id, randomUUID()];
    const r = await request(app).post("/api/v1/practice/by-ids").send({ ids }).expect(200);
    expect(r.body.questions.map((q: { id: string }) => q.id).sort()).toEqual([ids[0], ids[1]].sort());
    expect(JSON.stringify(r.body)).not.toMatch(/whyWrong|"correct"|explanation|accepted/);
    await request(app).post("/api/v1/practice/by-ids").send({ ids: [] }).expect(400);
    await request(app).post("/api/v1/practice/by-ids").send({ ids: ["nope"] }).expect(400);
  });
  it("grades a wrong answer with the specific reason, and records it once even if sent twice", async () => {
    const set = await get();
    const q = set.questions.find((x) => x.key === "r1-no-corners")!;
    const body = { attemptId: randomUUID(), anonId: anon, questionId: q.id, hintsUsed: 1, response: { type: "mcq", optionId: "square" } };
    const first = await request(app).post("/api/v1/practice/answers").send(body).expect(200);
    expect(first.body).toMatchObject({ correct: false, replay: false });
    expect(first.body.whyWrong.en).toMatch(/4 corners/);
    expect(first.body.correctAnswer.en).toBe("Circle");
    const again = await request(app).post("/api/v1/practice/answers").send(body).expect(200);
    expect(again.body).toMatchObject({ correct: false, replay: true });
    const stats = await m.practice.stats(set.topicId);
    expect(stats.find((s) => s.key === "r1-no-corners")).toMatchObject({ attempts: 1, correct: 0 });
  });
  it("an attempt id cannot be reused for another question or person", async () => {
    const set = await get();
    const tfq = set.questions.find((x) => x.key === "r1-side-meaning")!, other = set.questions.find((x) => x.key === "r2-rectangle")!;
    const id = randomUUID();
    await request(app).post("/api/v1/practice/answers").send({ attemptId: id, anonId: anon, questionId: tfq.id, response: { type: "true_false", value: true } }).expect(200);
    await request(app).post("/api/v1/practice/answers").send({ attemptId: id, anonId: anon, questionId: other.id, response: { type: "true_false", value: true } }).expect(409);
    await request(app).post("/api/v1/practice/answers").send({ attemptId: id, anonId: randomUUID(), questionId: tfq.id, response: { type: "true_false", value: true } }).expect(409);
  });
  it("rejects malformed answers, wrong answer types and unknown questions", async () => {
    const set = await get();
    const q = set.questions.find((x) => x.key === "r2-square-corners")!;
    await request(app).post("/api/v1/practice/answers").send({ attemptId: "nope" }).expect(400);
    await request(app).post("/api/v1/practice/answers").send({ attemptId: randomUUID(), anonId: anon, questionId: q.id, response: { type: "mcq", optionId: "a" } }).expect(400);
    await request(app).post("/api/v1/practice/answers").send({ attemptId: randomUUID(), anonId: anon, questionId: randomUUID(), response: { type: "number", value: 4 } }).expect(404);
    const ok = await request(app).post("/api/v1/practice/answers").send({ attemptId: randomUUID(), anonId: anon, questionId: q.id, response: { type: "number", value: 3 } }).expect(200);
    expect(ok.body.whyWrong.en).toMatch(/triangle/);
  });
  it("draft questions are never served or accepted", async () => {
    const f = file(); f.questions = [{ ...f.questions[0], key: "draft-one", status: "draft" }];
    await m.practice.importQuestions(f);
    const set = await get();
    const draft = (await m.practice.stats(set.topicId)).find((s) => s.key === "draft-one");
    expect(draft).toBeTruthy();
    expect(set.questions.find((q) => q.key === "draft-one")).toBeUndefined();
  });
  it("unknown topics and topics without questions give 404; maintenance pauses practice", async () => {
    await request(app).get("/api/v1/practice/boards/CBSE/3/maths/toy-joy/missing").expect(404);
    await request(app).get("/api/v1/practice/boards/CBSE/3/maths/fun-with-shapes/shapes-around-us").expect(404);
    await m.settings.update({ "site.maintenance.enabled": true }, "test");
    await request(app).get(path).expect(503);
    await m.settings.update({ "site.maintenance.enabled": false }, "test");
  });
  it("rate limits floods of answers", async () => {
    const set = await get();
    const q = set.questions.find((x) => x.key === "r1-side-meaning")!;
    let limited = 0;
    for (let i = 0; i < 130; i++) {
      const r = await request(app).post("/api/v1/practice/answers").send({ attemptId: randomUUID(), anonId: anon, questionId: q.id, response: { type: "true_false", value: true } });
      if (r.status === 429) limited++;
    }
    expect(limited).toBeGreaterThan(0);
  });
});
