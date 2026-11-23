import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { hashPassword, verifyPassword } from "../src/modules/accounts/crypto.js";
import { makeRepo, seedFile } from "./helpers.js";

let m: Awaited<ReturnType<typeof makeRepo>>;
let app: ReturnType<typeof createApp>;
beforeEach(async () => {
  m = await makeRepo(seedFile());
  app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, adminKey: "k" });
});
const reg = (over: Record<string, unknown> = {}) => ({ email: "Mum@Example.com", password: "correct horse", consent: true, child: { nickname: "Riya", classLevel: 3, avatar: "fox", language: "en" }, ...over });
const cookieOf = (res: request.Response) => String((res.headers["set-cookie"] as unknown as string[] | undefined)?.[0] ?? "").split(";")[0]!;
const signUp = async () => { const r = await request(app).post("/api/v1/account/register").send(reg()); return { r, cookie: cookieOf(r) }; };

describe("password hashing", () => {
  it("verifies the right password only and never stores it in the clear", () => {
    const h = hashPassword("secret-pass");
    expect(h).not.toContain("secret-pass");
    expect(verifyPassword("secret-pass", h)).toBe(true);
    expect(verifyPassword("secret-pasz", h)).toBe(false);
    expect(verifyPassword("anything", null)).toBe(false);
    expect(hashPassword("secret-pass")).not.toBe(h); // fresh salt every time
  });
});

describe("accounts API", () => {
  it("registers a parent with a first child, signs them in with a safe cookie, and returns who they are", async () => {
    const { r, cookie } = await signUp();
    expect(r.status).toBe(201);
    expect(r.body.user.email).toBe("mum@example.com");
    expect(r.body.profiles).toHaveLength(1);
    expect(r.body.activeProfileId).toBe(r.body.profiles[0].id);
    expect(JSON.stringify(r.body)).not.toMatch(/password|hash/i);
    const raw = String((r.headers["set-cookie"] as unknown as string[])[0]);
    expect(raw).toMatch(/HttpOnly/); expect(raw).toMatch(/SameSite=Lax/);
    const me = await request(app).get("/api/v1/account/me").set("Cookie", cookie);
    expect(me.body.user.email).toBe("mum@example.com");
    expect((await request(app).get("/api/v1/account/me")).body).toBeNull(); // signed out is not an error
  });

  it("checks consent, password length and duplicate emails", async () => {
    expect((await request(app).post("/api/v1/account/register").send(reg({ consent: false }))).status).toBe(400);
    expect((await request(app).post("/api/v1/account/register").send(reg({ password: "short" }))).status).toBe(400);
    await signUp();
    expect((await request(app).post("/api/v1/account/register").send(reg())).status).toBe(409);
  });

  it("signs in and out; a wrong password or unknown email gets the same answer", async () => {
    await signUp();
    const bad1 = await request(app).post("/api/v1/account/login").send({ email: "mum@example.com", password: "wrong wrong" });
    const bad2 = await request(app).post("/api/v1/account/login").send({ email: "nobody@example.com", password: "wrong wrong" });
    expect(bad1.status).toBe(401); expect(bad2.status).toBe(401); expect(bad1.body.error.message).toBe(bad2.body.error.message);
    const ok = await request(app).post("/api/v1/account/login").send({ email: "MUM@example.com", password: "correct horse" });
    expect(ok.status).toBe(200);
    const cookie = cookieOf(ok);
    await request(app).post("/api/v1/account/logout").set("Cookie", cookie).send({}).expect(204);
    expect((await request(app).get("/api/v1/account/me").set("Cookie", cookie)).body).toBeNull(); // the old cookie is dead
  });

  it("limits repeated sign-in attempts", async () => {
    let last = 0;
    for (let i = 0; i < 25; i++) last = (await request(app).post("/api/v1/account/login").send({ email: "a@b.co", password: "xxxxxxxxx" })).status;
    expect(last).toBe(429);
  });

  it("locks an existing parent session to a single learner in student mode", async () => {
    const { cookie, r } = await signUp();
    const id = r.body.activeProfileId;
    await request(app).post("/api/v1/account/children").set("Cookie", cookie).send({ nickname: "Sibling", classLevel: 5 }).expect(201);
    const selected = await request(app).post(`/api/v1/account/children/${id}/select`).set("Cookie", cookie).send({ childMode: true }).expect(200);
    expect(selected.body.childMode).toBe(true);
    expect(selected.body.profiles.map((p: { id: string }) => p.id)).toEqual([id]);
    expect(selected.body.user.email).toBe("");
    await request(app).put(`/api/v1/account/children/${id}`).set("Cookie", cookie).send({}).expect(403);
    await request(app).delete(`/api/v1/account/children/${id}`).set("Cookie", cookie).expect(403);
    await request(app).post(`/api/v1/account/children/${id}/select`).set("Cookie", cookie).send({}).expect(403);
    await request(app).get("/api/v1/account/dashboard").set("Cookie", cookie).expect(403);
    await request(app).get("/api/v1/account/export").set("Cookie", cookie).expect(403);
    await request(app).put("/api/v1/account/sync").set("Cookie", cookie).set("X-Study-Profile", "another-profile").send({}).expect(409);
    await request(app).put("/api/v1/account/sync").set("Cookie", cookie).set("X-Study-Profile", id).send({}).expect(200);
  });

  it("adds, switches, edits and removes children, up to the admin's limit, and only your own", async () => {
    const { cookie, r } = await signUp();
    const add = await request(app).post("/api/v1/account/children").set("Cookie", cookie).send({ nickname: "Arun", classLevel: 3, avatar: "lion", language: "ta" });
    expect(add.status).toBe(201); expect(add.body.profiles).toHaveLength(2);
    const arun = add.body.profiles.find((p: { nickname: string }) => p.nickname === "Arun");
    const sel = await request(app).post(`/api/v1/account/children/${arun.id}/select`).set("Cookie", cookie).send({});
    expect(sel.body.activeProfileId).toBe(arun.id);
    const upd = await request(app).put(`/api/v1/account/children/${arun.id}`).set("Cookie", cookie).send({ nickname: "Arunan", classLevel: 4, avatar: "panda", language: "en" });
    expect(upd.body.profiles.find((p: { id: string }) => p.id === arun.id).nickname).toBe("Arunan");
    // someone else's child cannot be touched
    const other = await request(app).post("/api/v1/account/register").send(reg({ email: "dad@example.com" }));
    const strangers = other.body.profiles[0].id;
    expect((await request(app).post(`/api/v1/account/children/${strangers}/select`).set("Cookie", cookie).send({})).status).toBe(404);
    expect((await request(app).delete(`/api/v1/account/children/${strangers}`).set("Cookie", cookie)).status).toBe(404);
    await m.settings.update({ "accounts.maxChildren": 2 }, "test");
    expect((await request(app).post("/api/v1/account/children").set("Cookie", cookie).send({ nickname: "Third", classLevel: 3 })).status).toBe(409);
    const del = await request(app).delete(`/api/v1/account/children/${arun.id}`).set("Cookie", cookie);
    expect(del.body.profiles).toHaveLength(1); expect(del.body.activeProfileId).toBeNull();
    void r;
  });

  it("needs a session for children and sync, and JSON bodies only", async () => {
    expect((await request(app).post("/api/v1/account/children").send({ nickname: "x", classLevel: 3 })).status).toBe(401);
    expect((await request(app).get("/api/v1/account/sync")).status).toBe(401);
    expect((await request(app).post("/api/v1/account/login").type("form").send("email=a@b.co&password=x")).status).toBe(415);
  });

  it("saves favourite lessons in the account and keeps an un-save", async () => {
    const { cookie } = await signUp();
    const note = (savedAt: number, removedAt?: number) => ({ id: "t1", href: "/cbse/6/maths/a/b", title: { en: "Fractions" }, subject: { en: "Maths" }, savedAt, ...(removedAt ? { removedAt } : {}) });
    const put = (notes: unknown) => request(app).put("/api/v1/account/sync").set("Cookie", cookie).send({ notes });
    expect((await put({ t1: note(100) })).body.notes.t1.savedAt).toBe(100);
    expect((await put({ t1: note(100, 200) })).body.notes.t1.removedAt).toBe(200);
    // an older save arriving late cannot bring the lesson back
    expect((await put({ t1: note(100) })).body.notes.t1.removedAt).toBe(200);
    expect((await request(app).get("/api/v1/account/sync").set("Cookie", cookie)).body.notes.t1.removedAt).toBe(200);
  });

  it("keeps progress per child and merges devices without losing anything", async () => {
    const { cookie } = await signUp();
    const a = { lesson: { t1: { step: 2, total: 7, done: false, updatedAt: 1000 } }, practice: { t1: { "1": { best: 60, stars: 0, passed: false, tries: 1 } } } };
    expect((await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send(a)).status).toBe(200);
    const b = { lesson: { t1: { step: 7, total: 7, done: true, updatedAt: 2000 }, t2: { step: 1, total: 5, done: false, updatedAt: 1500 } }, practice: { t1: { "1": { best: 80, stars: 1, passed: true, tries: 1 }, "2": { best: 100, stars: 3, passed: true, tries: 1 } } } };
    const merged = await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send(b);
    expect(merged.body.lesson.t1.done).toBe(true);
    expect(merged.body.lesson.t2.step).toBe(1);
    expect(merged.body.practice.t1["1"]).toMatchObject({ best: 80, stars: 1, passed: true });
    expect(merged.body.practice.t1["2"].stars).toBe(3);
    // an older, lower upload can never undo a finished lesson or a better score
    const stale = await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send(a);
    expect(stale.body.lesson.t1.done).toBe(true); expect(stale.body.practice.t1["1"].best).toBe(80);
    expect((await request(app).get("/api/v1/account/sync").set("Cookie", cookie)).body.lesson.t2.step).toBe(1);
    const mk = { id: "q1", stem: { en: "Q" }, answer: { en: "A" }, why: { en: "W" }, at: 5 };
    expect((await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send({ mistakes: { q1: mk } })).status).toBe(200);
    expect((await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send({ mistakes: { q1: { ...mk, removedAt: 9 } } })).body.mistakes.q1.removedAt).toBe(9);
    expect((await request(app).get("/api/v1/account/sync").set("Cookie", cookie)).body.mistakes.q1.removedAt).toBe(9);
    // another child starts clean
    const add = await request(app).post("/api/v1/account/children").set("Cookie", cookie).send({ nickname: "Arun", classLevel: 3 });
    const arun = add.body.profiles.find((p: { nickname: string }) => p.nickname === "Arun").id;
    await request(app).post(`/api/v1/account/children/${arun}/select`).set("Cookie", cookie).send({});
    expect((await request(app).get("/api/v1/account/sync").set("Cookie", cookie)).body).toEqual({ lesson: {}, practice: {}, revision: {}, notes: {}, mistakes: {} });
  });

  it("keeps the latest revision review for each question", async () => {
    const { cookie } = await signUp();
    const q = "00000000-0000-4000-8000-0000000000aa";
    await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send({ revision: { [q]: { box: 2, due: 20000, updatedAt: 100 } } });
    const r = await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send({ revision: { [q]: { box: 1, due: 19000, updatedAt: 50 } } }); // older: ignored
    expect(r.body.revision[q]).toEqual({ box: 2, due: 20000, updatedAt: 100 });
    const r2 = await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send({ revision: { [q]: { box: 1, due: 20001, updatedAt: 200 } } });
    expect(r2.body.revision[q].box).toBe(1);
  });

  it("rejects junk sync data", async () => {
    const { cookie } = await signUp();
    expect((await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send({ lesson: { t: { step: -5, total: 1, done: false, updatedAt: 1 } } })).status).toBe(400);
  });

  it("deletes the account and everything with it, only with the right password", async () => {
    const { cookie } = await signUp();
    await request(app).put("/api/v1/account/sync").set("Cookie", cookie).send({ lesson: { t1: { step: 1, total: 2, done: false, updatedAt: 1 } }, practice: {} });
    expect((await request(app).post("/api/v1/account/delete").set("Cookie", cookie).send({ password: "nope nope nope" })).status).toBe(401);
    expect((await request(app).post("/api/v1/account/delete").set("Cookie", cookie).send({ password: "correct horse" })).status).toBe(204);
    expect((await request(app).post("/api/v1/account/login").send({ email: "mum@example.com", password: "correct horse" })).status).toBe(401);
    const left = await m.db.execute("select (select count(*) from student_profiles) as p, (select count(*) from student_progress) as g, (select count(*) from consents) as c" as never) as unknown as { rows: Record<string, unknown>[] };
    expect(left.rows[0]).toMatchObject({ p: 0, g: 0, c: 0 });
  });

  it("admin switches: sign-ups closed, or accounts off entirely", async () => {
    await m.settings.update({ "accounts.signup": false }, "test");
    expect((await request(app).post("/api/v1/account/register").send(reg())).status).toBe(403);
    await m.settings.update({ "accounts.signup": true, "feature.accounts": false }, "test");
    expect((await request(app).get("/api/v1/account/me")).status).toBe(404);
  });
});
