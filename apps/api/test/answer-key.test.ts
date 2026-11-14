import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { questionsDir } from "../src/server-paths.js";
import { makeRepo, seedFile, shapesJson } from "./helpers.js";

let m: Awaited<ReturnType<typeof makeRepo>>;
let app: ReturnType<typeof createApp>;
let ids: string[];
beforeEach(async () => {
  m = await makeRepo(seedFile());
  await m.practice.importQuestions(shapesJson(questionsDir));
  app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, tutor: m.tutor, adminKey: "k" });
  ids = (await request(app).get("/api/v1/practice/boards/CBSE/3/maths/fun-with-shapes/sides-and-corners")).body.questions.slice(0, 3).map((q: { id: string }) => q.id);
});
const signUp = async () => {
  const r = await request(app).post("/api/v1/account/register").send({ email: "mum@example.com", password: "correct horse", consent: true, child: { nickname: "Riya", classLevel: 3, avatar: "fox", language: "en" } });
  return String((r.headers["set-cookie"] as unknown as string[])[0]).split(";")[0]!;
};

describe("worksheet answer key", () => {
  it("is refused for visitors who are not signed in", async () => {
    await request(app).post("/api/v1/practice/answer-key").send({ ids }).expect(403);
  });
  it("gives a signed-in parent the right answers", async () => {
    const cookie = await signUp();
    const r = await request(app).post("/api/v1/practice/answer-key").set("Cookie", cookie).send({ ids }).expect(200);
    expect(r.body.answers).toHaveLength(3);
    expect(r.body.answers[0].answer.en).toBeTruthy();
  });
  it("is refused when the admin switches the key off", async () => {
    const cookie = await signUp();
    await m.settings.update({ "worksheets.answerKey": false }, "test");
    await request(app).post("/api/v1/practice/answer-key").set("Cookie", cookie).send({ ids }).expect(403);
  });
  it("rejects bad ids", async () => {
    const cookie = await signUp();
    await request(app).post("/api/v1/practice/answer-key").set("Cookie", cookie).send({ ids: ["x"] }).expect(400);
  });
});
