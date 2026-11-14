import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { dayNumber } from "@studysmart/shared";
import { createApp } from "../src/app.js";
import { questionsDir } from "../src/server-paths.js";
import { makeRepo, seedFile } from "./helpers.js";

let m: Awaited<ReturnType<typeof makeRepo>>;
let app: ReturnType<typeof createApp>;
let qs: { id: string; key: string }[];
beforeEach(async () => {
  m = await makeRepo(seedFile());
  await m.practice.importQuestions(JSON.parse(readFileSync(join(questionsDir, readdirSync(questionsDir).filter((f) => f.endsWith(".json"))[0]!), "utf8")));
  app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, tutor: m.tutor, adminKey: "k" });
  qs = (await request(app).get("/api/v1/practice/boards/CBSE/3/maths/fun-with-shapes/sides-and-corners")).body.questions;
});
const reg = (email: string, nick: string) => ({ email, password: "correct horse", consent: true, child: { nickname: nick, classLevel: 3, avatar: "fox", language: "en" } });
const signUp = async (email = "mum@example.com", nick = "Riya") => { const r = await request(app).post("/api/v1/account/register").send(reg(email, nick)); return { cookie: String((r.headers["set-cookie"] as unknown as string[])[0]).split(";")[0]!, me: r.body }; };
const answer = (cookie: string | null, key: string, response: object) => {
  const q = qs.find((x) => x.key === key)!;
  const req = request(app).post("/api/v1/practice/answers");
  return (cookie ? req.set("Cookie", cookie) : req).send({ attemptId: randomUUID(), anonId: randomUUID(), questionId: q.id, hintsUsed: 0, response });
};
const wrong = { type: "mcq", optionId: "square" }, right = { type: "mcq", optionId: "circle" };
const dash = (cookie: string, tz = 0) => request(app).get(`/api/v1/account/dashboard?tz=${tz}`).set("Cookie", cookie);

describe("parent dashboard", () => {
  it("needs a signed-in parent", async () => {
    await request(app).get("/api/v1/account/dashboard").expect(401);
    await request(app).get("/api/v1/account/export").expect(401);
  });

  it("counts a signed-in child's answers, finds the tricky question, and lists active days", async () => {
    const { cookie } = await signUp();
    await answer(cookie, "r1-no-corners", wrong).then((r) => expect(r.status).toBe(200));
    await answer(cookie, "r1-no-corners", wrong);
    await answer(cookie, "r1-no-corners", right);
    await answer(cookie, "r1-side-meaning", { type: "true_false", value: true });
    await answer(null, "r1-no-corners", wrong); // a guest on the same device is not counted for the child
    const d = (await dash(cookie).expect(200)).body.children[0];
    expect(d.profile.nickname).toBe("Riya");
    expect(d.attempts).toBe(4);
    expect(d.correct).toBe(2);
    const today = dayNumber(new Date(Date.now())) - 0; // tz=0 => UTC day
    expect(d.activeDays).toEqual([Math.floor(Date.now() / 86_400_000)]);
    expect(d.daily[String(Math.floor(Date.now() / 86_400_000))]).toEqual({ n: 4, right: 2 });
    expect(d.weak).toHaveLength(1);
    expect(d.weak[0]).toMatchObject({ questionId: qs.find((x) => x.key === "r1-no-corners")!.id, wrong: 2, total: 3 });
    void today;
  });

  it("buckets days by the parent's time zone", async () => {
    const { cookie } = await signUp();
    await answer(cookie, "r1-no-corners", right);
    const utcDay = Math.floor(Date.now() / 86_400_000);
    // 14 hours ahead of UTC (tz = -840) and 12 hours behind (tz = 720): at most one of them can fall on a different day
    const ahead = (await dash(cookie, -840)).body.children[0].activeDays[0], behind = (await dash(cookie, 720)).body.children[0].activeDays[0];
    expect([utcDay, utcDay + 1]).toContain(ahead); expect([utcDay - 1, utcDay]).toContain(behind);
  });

  it("includes the child's synced progress, and only the parent's own children", async () => {
    const a = await signUp("mum@example.com", "Riya"), b = await signUp("dad@example.com", "Kabir");
    await request(app).put("/api/v1/account/sync").set("Cookie", a.cookie).send({ lesson: { t1: { step: 3, total: 3, done: true, updatedAt: Date.now() } }, practice: {}, revision: {} });
    const da = (await dash(a.cookie)).body.children, db = (await dash(b.cookie)).body.children;
    expect(da).toHaveLength(1); expect(db).toHaveLength(1);
    expect(da[0].progress.lesson.t1.done).toBe(true);
    expect(da[0].activeDays).toHaveLength(1); // finishing a lesson counts as a day of learning
    expect(db[0].profile.nickname).toBe("Kabir"); expect(JSON.stringify(db)).not.toMatch(/Riya/);
  });

  it("covers every child of the parent, with none of the secrets", async () => {
    const { cookie } = await signUp();
    await request(app).post("/api/v1/account/children").set("Cookie", cookie).send({ nickname: "Arun", classLevel: 3 });
    const body = (await dash(cookie)).body;
    expect(body.children.map((c: { profile: { nickname: string } }) => c.profile.nickname).sort()).toEqual(["Arun", "Riya"]);
    expect(JSON.stringify(body)).not.toMatch(/hash|password|token/i);
  });

  it("exports everything stored, without password hashes or session tokens", async () => {
    const { cookie } = await signUp();
    await answer(cookie, "r1-no-corners", wrong);
    const r = await request(app).get("/api/v1/account/export").set("Cookie", cookie).expect(200);
    expect(r.headers["content-disposition"]).toMatch(/attachment/);
    expect(r.body.parent.email).toBe("mum@example.com");
    expect(r.body.children[0].attempts).toHaveLength(1);
    expect(r.body.children[0].consents[0]).toMatchObject({ purpose: "learning_progress" });
    expect(JSON.stringify(r.body)).not.toMatch(/passwordHash|scrypt|s1\$|tokenHash/);
  });

  it("admin can switch the dashboard or the downloads off", async () => {
    const { cookie } = await signUp();
    await m.settings.update({ "parent.export": false }, "t");
    await request(app).get("/api/v1/account/export").set("Cookie", cookie).expect(404);
    await dash(cookie).expect(200);
    await m.settings.update({ "feature.parentDashboard": false }, "t");
    await dash(cookie).expect(404);
  });
});
