import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { verifySocial } from "../src/modules/accounts/social.js";
import { makeRepo, seedFile } from "./helpers.js";

let m: Awaited<ReturnType<typeof makeRepo>>;
let app: ReturnType<typeof createApp>;
const fake = (table: Record<string, unknown>) => async (url: string) => { const k = Object.keys(table).find((x) => url.startsWith(x)); return { ok: !!k, json: async () => (k ? table[k] : {}) }; };
beforeEach(async () => {
  m = await makeRepo(seedFile());
  app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, adminKey: "k" });
});
const cookieOf = (res: request.Response) => String((res.headers["set-cookie"] as unknown as string[] | undefined)?.[0] ?? "").split(";")[0]!;
const body = { email: "mum@example.com", password: "correct horse", consent: true, fatherEmail: "dad@example.com", motherEmail: "", child: { nickname: "Riya", classLevel: 3, extraClasses: [4, 3], avatar: "fox", language: "en", pin: "123456", secretQuestion: "Favourite fruit?", secretAnswer: " Mango " } };

describe("parent contacts, classes and child sign-in", () => {
  it("keeps father/mother e-mail and several classes, and never returns PIN or answer", async () => {
    const r = await request(app).post("/api/v1/account/register").send(body);
    expect(r.status).toBe(201);
    expect(r.body.user.fatherEmail).toBe("dad@example.com"); expect(r.body.user.motherEmail).toBeNull();
    expect(r.body.profiles[0].classes).toEqual([3, 4]);
    expect(r.body.profiles[0].hasPin).toBe(true);
    expect(JSON.stringify(r.body)).not.toMatch(/123456|mango|hash/i);
  });
  it("lets a child in with the PIN or the secret answer, but not with a wrong one", async () => {
    await request(app).post("/api/v1/account/register").send(body);
    const ok = await request(app).post("/api/v1/account/child-login").send({ email: "mum@example.com", nickname: "riya", pin: "123456" });
    expect(ok.status).toBe(200); expect(ok.body.childMode).toBe(true); expect(ok.body.user.email).toBe("");
    const ans = await request(app).post("/api/v1/account/child-login").send({ email: "mum@example.com", nickname: "Riya", answer: "mango" });
    expect(ans.status).toBe(200);
    expect((await request(app).post("/api/v1/account/child-login").send({ email: "mum@example.com", nickname: "Riya", pin: "000000" })).status).toBe(401);
    expect((await request(app).post("/api/v1/account/child-login").send({ email: "nobody@example.com", nickname: "Riya", pin: "123456" })).status).toBe(401);
    const q = await request(app).post("/api/v1/account/child-question").send({ email: "mum@example.com", nickname: "Riya" });
    expect(q.body.question).toBe("Favourite fruit?");
  });
  it("locks a child after five wrong tries", async () => {
    await request(app).post("/api/v1/account/register").send(body);
    for (let i = 0; i < 5; i++) await request(app).post("/api/v1/account/child-login").send({ email: "mum@example.com", nickname: "Riya", pin: "111111" });
    const r = await request(app).post("/api/v1/account/child-login").send({ email: "mum@example.com", nickname: "Riya", pin: "123456" });
    expect(r.status).toBe(429);
  });
  it("keeps a child out of parent-only pages", async () => {
    await request(app).post("/api/v1/account/register").send(body);
    const c = cookieOf(await request(app).post("/api/v1/account/child-login").send({ email: "mum@example.com", nickname: "Riya", pin: "123456" }));
    expect((await request(app).post("/api/v1/account/children").set("Cookie", c).send(body.child)).status).toBe(403);
    expect((await request(app).get("/api/v1/account/export").set("Cookie", c)).status).toBe(403);
    expect((await request(app).get("/api/v1/account/sync").set("Cookie", c)).status).toBe(200);
  });
  it("child sign-in can be switched off, and a PIN must be 6 digits", async () => {
    expect((await request(app).post("/api/v1/account/register").send({ ...body, child: { ...body.child, pin: "12ab" } })).status).toBe(400);
    await request(app).post("/api/v1/account/register").send(body);
    await m.settings.update({ "accounts.child.login": false }, "t");
    expect((await request(app).post("/api/v1/account/child-login").send({ email: "mum@example.com", nickname: "Riya", pin: "123456" })).status).toBe(403);
  });
});

describe("Google and Facebook sign-in", () => {
  it("accepts a verified Google token for our client ID only", async () => {
    const good = fake({ "https://oauth2.googleapis.com/tokeninfo": { aud: "cid", sub: "7", email: "A@B.com", email_verified: "true" } });
    expect(await verifySocial("google", "tok-tok-tok-tok", { googleClientId: "cid", facebookAppId: "" }, good)).toEqual({ id: "7", email: "a@b.com" });
    expect(await verifySocial("google", "tok-tok-tok-tok", { googleClientId: "other", facebookAppId: "" }, good)).toBeNull();
    expect(await verifySocial("google", "x", { googleClientId: "", facebookAppId: "" }, good)).toBeNull();
  });
  it("checks that a Facebook token belongs to our app", async () => {
    const f = fake({ "https://graph.facebook.com/app": { id: "99" }, "https://graph.facebook.com/me": { id: "5", email: "c@d.com" } });
    expect(await verifySocial("facebook", "tok-tok-tok-tok", { googleClientId: "", facebookAppId: "99" }, f)).toEqual({ id: "5", email: "c@d.com" });
    expect(await verifySocial("facebook", "tok-tok-tok-tok", { googleClientId: "", facebookAppId: "100" }, f)).toBeNull();
  });
  it("the route refuses when the method is off, and signs a new parent in when on", async () => {
    const f = fake({ "https://oauth2.googleapis.com/tokeninfo": { aud: "cid", sub: "7", email: "new@parent.com", email_verified: true } });
    const a2 = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, adminKey: "k", fetcher: f });
    expect((await request(a2).post("/api/v1/account/social").send({ provider: "google", token: "tok-tok-tok-tok" })).status).toBe(403);
    await m.settings.update({ "accounts.method.google": true, "accounts.google.clientId": "cid" }, "t");
    const r = await request(a2).post("/api/v1/account/social").send({ provider: "google", token: "tok-tok-tok-tok" });
    expect(r.status).toBe(201); expect(r.body.user.email).toBe("new@parent.com"); expect(r.body.profiles).toHaveLength(0);
  });
});
