import { mkdirSync, mkdtempSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { SITE } from "@studysmart/shared";
import { createApp } from "../src/app.js";
import { createAccessService, formatCode, generateCode, normalizeCode } from "../src/modules/access/service.js";
import { makeRepo, seedFile } from "./helpers.js";

const KEY = "test-key-0123456789abcdef0123";
let m: Awaited<ReturnType<typeof makeRepo>>;
let app: ReturnType<typeof createApp>;
const admin = (r: request.Test) => r.set("x-admin-key", KEY);
const cookieOf = (res: request.Response) => String((res.headers["set-cookie"] as unknown as string[] | undefined)?.[0] ?? "").split(";")[0]!;
const mode = (v: "public" | "invite", extra: Record<string, unknown> = {}) => admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "access.mode": v, ...extra } }).expect(200);
const newCode = async (body: Record<string, unknown> = {}) => (await admin(request(app).post("/api/v1/admin/access/codes")).send(body).expect(201)).body.code as { id: string; code: string };

function build(extra: Record<string, unknown> = {}, web?: string) {
  return createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, access: m.access, adminKey: KEY, webDir: web, ...extra });
}
beforeEach(async () => { m = await makeRepo(seedFile()); app = build(); });

describe("code helpers", () => {
  it("makes readable codes and treats case, spaces and dashes as the same code", () => {
    const c = generateCode();
    expect(c).toMatch(new RegExp(`^${SITE.inviteCodePrefix}[2-9A-HJKMNP-Z]{8}$`));
    expect(formatCode(c)).toMatch(new RegExp(`^${SITE.inviteCodePrefix}-[A-Z0-9]{4}-[A-Z0-9]{4}$`));
    expect(normalizeCode(" sharp-7k3m 9qpd ")).toBe("SHARP7K3M9QPD");
  });
});

describe("default is public", () => {
  it("lets everyone in until the mode is switched", async () => {
    expect((await request(app).get("/api/access/status")).body).toMatchObject({ mode: "public", granted: true });
    await request(app).get("/api/v1/curriculum/boards").expect(200);
  });
});

describe("admin manages codes", () => {
  it("needs the admin key", async () => {
    await request(app).get("/api/v1/admin/access/codes").expect(401);
    await request(app).post("/api/v1/admin/access/codes").send({}).expect(401);
  });
  it("creates, lists and revokes codes with label, max uses and expiry", async () => {
    const c = await newCode({ label: "Class 3 parents", maxUses: 2, expiresInDays: 7 });
    expect(c.code).toMatch(/^SHARP-/);
    const list = (await admin(request(app).get("/api/v1/admin/access/codes"))).body.codes;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ label: "Class 3 parents", maxUses: 2, uses: 0, status: "active" });
    expect(new Date(list[0].expiresAt).getTime()).toBeGreaterThan(Date.now() + 6 * 86400_000);
    await admin(request(app).post(`/api/v1/admin/access/codes/${c.id}/revoke`)).expect(200);
    await admin(request(app).post(`/api/v1/admin/access/codes/${c.id}/revoke`)).expect(404);
    expect((await admin(request(app).get("/api/v1/admin/access/codes"))).body.codes[0].status).toBe("revoked");
  });
  it("uses the default max uses and expiry settings, and rejects bad input", async () => {
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "access.newCode.maxUses": 5, "access.newCode.expiryDays": 3 } }).expect(200);
    const list = async () => (await admin(request(app).get("/api/v1/admin/access/codes"))).body.codes;
    await newCode();
    expect((await list())[0]).toMatchObject({ maxUses: 5 });
    expect((await list())[0].expiresAt).not.toBeNull();
    await newCode({ maxUses: 0, expiresInDays: 0 }); // 0 = no limit, never expires
    const unlimited = (await list()).find((x: { maxUses: number | null }) => x.maxUses === null);
    expect(unlimited.expiresAt).toBeNull();
    await admin(request(app).post("/api/v1/admin/access/codes")).send({ maxUses: -1 }).expect(400);
    await admin(request(app).post("/api/v1/admin/access/codes")).send({ expiresAt: "2001-01-01T00:00:00.000Z" }).expect(400);
  });
});

describe("invite mode: the door", () => {
  it("blocks API data routes with access_required, but not health, status, admin or icons", async () => {
    await mode("invite");
    const r = await request(app).get("/api/v1/curriculum/boards");
    expect(r.status).toBe(401);
    expect(r.body.error.code).toBe("access_required");
    await request(app).get("/api/v1/settings/public").expect(401);
    await request(app).get("/api/v1/lessons/x").expect(401);
    await request(app).get("/health").expect(200);
    expect((await request(app).get("/api/access/status")).body).toMatchObject({ mode: "invite", granted: false });
    await admin(request(app).get("/api/v1/admin/settings")).expect(200);
    await request(app).get("/robots.txt").expect(200).expect((x) => expect(x.text).toContain("Disallow: /"));
  });
  it("serves site verification on the invite page while keeping the site gated", async () => {
    const web = mkdtempSync(join(tmpdir(), "sharpstudy-verification-"));
    try {
      const tag = '<meta name="google-site-verification" content="sample-verification_123" />';
      writeFileSync(join(web, "index.html"), `<html><head>${tag}</head><body>Signed-in app shell</body></html>`);
      app = build({}, web);
      await mode("invite");
      const { text } = await request(app).get("/").expect(200);
      expect(text).toContain(tag);
      expect(text).toContain('name="robots" content="noindex"');
      expect(text).not.toContain("Signed-in app shell");
      await request(app).get("/api/v1/curriculum/boards").expect(401);
    } finally {
      rmSync(join(web, "index.html"), { force: true });
      rmdirSync(web);
    }
  });
  it("redeems a good code, sets an httpOnly cookie, and then lets the visitor in", async () => {
    const c = await newCode();
    await mode("invite");
    const res = await request(app).post("/api/access/redeem").send({ code: c.code.toLowerCase().replace(/-/g, " ") }).expect(200);
    const setCookie = String((res.headers["set-cookie"] as unknown as string[])[0]);
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/SameSite=Lax/);
    const cookie = cookieOf(res);
    await request(app).get("/api/v1/curriculum/boards").set("Cookie", cookie).expect(200);
    expect((await request(app).get("/api/access/status").set("Cookie", cookie)).body.granted).toBe(true);
    expect((await admin(request(app).get("/api/v1/admin/access/codes"))).body.codes[0].uses).toBe(1);
  });
  it("sets the Secure flag in production", async () => {
    const c = await newCode();
    const prod = build({ secureCookie: true });
    expect(String((await request(prod).post("/api/access/redeem").send({ code: c.code })).headers["set-cookie"])).toContain("Secure");
  });
  it("rejects wrong, forged and tampered cookies", async () => {
    const c = await newCode();
    await mode("invite");
    await request(app).post("/api/access/redeem").send({ code: "SHARP-AAAA-BBBB" }).expect(401);
    await request(app).post("/api/access/redeem").send({}).expect(400);
    await request(app).get("/api/v1/curriculum/boards").set("Cookie", "ss_access=abc.def").expect(401);
    const good = cookieOf(await request(app).post("/api/access/redeem").send({ code: c.code }));
    await request(app).get("/api/v1/curriculum/boards").set("Cookie", good.slice(0, -2) + "xx").expect(401);
    // a cookie signed with another secret (another server) is no good here
    const other = createAccessService(m.db, "a-different-secret-0123456789");
    await request(app).get("/api/v1/curriculum/boards").set("Cookie", `ss_access=${other.signCookie(c.id, 600)}`).expect(401);
  });
  it("stops at max uses, and expired or revoked codes do not work", async () => {
    const once = await newCode({ maxUses: 1 });
    await request(app).post("/api/access/redeem").send({ code: once.code }).expect(200);
    await request(app).post("/api/access/redeem").send({ code: once.code }).expect(401);
    const gone = await newCode();
    await admin(request(app).post(`/api/v1/admin/access/codes/${gone.id}/revoke`)).expect(200);
    await request(app).post("/api/access/redeem").send({ code: gone.code }).expect(401);
    const exp = await m.access.create({ expiresAt: new Date(Date.now() + 50) });
    await new Promise((r) => setTimeout(r, 80));
    await request(app).post("/api/access/redeem").send({ code: exp.code }).expect(401);
    expect((await m.access.list()).find((x) => x.id === exp.id)?.status).toBe("expired");
  });
  it("two people racing for a one-use code: only one gets in", async () => {
    const c = await newCode({ maxUses: 1 });
    const rs = await Promise.all([1, 2, 3].map(() => request(app).post("/api/access/redeem").send({ code: c.code })));
    expect(rs.filter((r) => r.status === 200)).toHaveLength(1);
  });
  it("cancelling a code locks out people who already used it", async () => {
    const c = await newCode();
    await mode("invite");
    const cookie = cookieOf(await request(app).post("/api/access/redeem").send({ code: c.code }));
    await request(app).get("/api/v1/curriculum/boards").set("Cookie", cookie).expect(200);
    await admin(request(app).post(`/api/v1/admin/access/codes/${c.id}/revoke`)).expect(200);
    await request(app).get("/api/v1/curriculum/boards").set("Cookie", cookie).expect(401);
  });
  it("an expired cookie is refused", async () => {
    const c = await newCode();
    await mode("invite");
    await request(app).get("/api/v1/curriculum/boards").set("Cookie", `ss_access=${m.access.signCookie(c.id, -10)}`).expect(401);
  });
  it("the pause switch and switching back to public open the doors again", async () => {
    await mode("invite");
    await request(app).get("/api/v1/curriculum/boards").expect(401);
    await mode("invite", { "access.inviteCodeRequired": false });
    await request(app).get("/api/v1/curriculum/boards").expect(200);
    await mode("invite", { "access.inviteCodeRequired": true });
    await request(app).get("/api/v1/curriculum/boards").expect(401);
    await mode("public");
    await request(app).get("/api/v1/curriculum/boards").expect(200);
  });
  it("rate limits code guessing", async () => {
    const limited = build({ accessRedeemMax: 3 });
    for (let i = 0; i < 3; i++) await request(limited).post("/api/access/redeem").send({ code: "SHARP-NOPE-NOPE" }).expect(401);
    await request(limited).post("/api/access/redeem").send({ code: "SHARP-NOPE-NOPE" }).expect(429);
  });
  it("without the access service the feature is simply off", async () => {
    const off = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, adminKey: KEY });
    await admin(request(off).put("/api/v1/admin/settings")).send({ changes: { "access.mode": "invite" } }).expect(200);
    await request(off).get("/api/v1/curriculum/boards").expect(200);
  });
});

describe("invite mode: the website", () => {
  const web = () => {
    const dir = mkdtempSync(join(tmpdir(), "web-"));
    mkdirSync(join(dir, "assets"));
    writeFileSync(join(dir, "index.html"), "<html>SHELL</html>");
    writeFileSync(join(dir, "manifest.webmanifest"), "{}");
    writeFileSync(join(dir, "icon.svg"), "<svg/>");
    writeFileSync(join(dir, "assets", "app.js"), "1");
    return dir;
  };
  it("shows the bilingual invite page instead of the app, and the app once let in", async () => {
    const site = build({}, web());
    await request(site).get("/cbse/3/maths").expect(200).expect((r) => expect(r.text).toContain("SHELL"));
    await mode("invite");
    const gate = await request(site).get("/cbse/3/maths").expect(200);
    expect(gate.text).not.toContain("SHELL");
    expect(gate.text).toContain("Enter your invite code");
    expect(gate.text).toContain("அழைப்புக் குறியீட்டை");
    expect(gate.text).toContain(SITE.name);
    expect(gate.headers["cache-control"]).toBe("no-store");
    for (const p of ["/manifest.webmanifest", "/icon.svg", "/assets/app.js", "/health", "/robots.txt", "/sitemap.xml", "/admin"]) {
      const t = (await request(site).get(p)).text ?? "";
      expect(t, p).not.toContain("Enter your invite code");
    }
    const c = await newCode();
    const cookie = cookieOf(await request(site).post("/api/access/redeem").send({ code: c.code }));
    await request(site).get("/cbse/3/maths").set("Cookie", cookie).expect(200).expect((r) => expect(r.text).toContain("SHELL"));
  });
  it("serves robots.txt and sitemap.xml from the site constant", async () => {
    const site = build({}, web());
    const robots = await request(site).get("/robots.txt").expect(200);
    expect(robots.text).toContain(`Sitemap: ${SITE.url}/sitemap.xml`);
    expect((await request(site).get("/sitemap.xml").expect(200)).text).toContain(`<loc>${SITE.url}/about</loc>`);
  });
});
