import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { makeRepo } from "./helpers.js";

const KEY = "test-key-0123456789abcdef0123";
let app: ReturnType<typeof createApp>;
let noAdmin: ReturnType<typeof createApp>;
const admin = (r: request.Test) => r.set("x-admin-key", KEY);

beforeEach(async () => {
  const m = await makeRepo(); // fresh in-memory database per test
  app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, adminKey: KEY });
  noAdmin = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, adminKey: null });
});

describe("public settings", () => {
  it("returns only public values with an ETag and honours If-None-Match", async () => {
    const res = await request(app).get("/api/v1/settings/public");
    expect(res.status).toBe(200);
    expect(res.body.values["theme.color.brand"]).toBe("#1F4FD1");
    expect(res.body.values["site.cache.maxAgeSeconds"]).toBeUndefined();
    const again = await request(app).get("/api/v1/settings/public").set("If-None-Match", res.headers.etag!);
    expect(again.status).toBe(304);
  });
});

describe("admin access", () => {
  it("rejects missing or wrong key, and is disabled when no key is configured", async () => {
    expect((await request(app).get("/api/v1/admin/settings")).status).toBe(401);
    expect((await request(app).get("/api/v1/admin/settings").set("x-admin-key", "wrong")).status).toBe(401);
    expect((await admin(request(app).get("/api/v1/admin/session"))).status).toBe(200);
    expect((await request(noAdmin).get("/api/v1/admin/settings").set("x-admin-key", KEY)).status).toBe(403);
  });
  it("rate limits repeated wrong keys", async () => {
    for (let i = 0; i < 8; i++) await request(app).get("/api/v1/admin/session").set("x-admin-key", "bad");
    expect((await request(app).get("/api/v1/admin/session").set("x-admin-key", "bad")).status).toBe(429);
    expect((await admin(request(app).get("/api/v1/admin/session"))).status).toBe(429); // blocked until the window ends
  });
});

describe("admin settings", () => {
  it("lists panels, definitions, presets and current values", async () => {
    const res = await admin(request(app).get("/api/v1/admin/settings"));
    expect(res.body.panels.map((p: { id: string }) => p.id)).toContain("theme");
    expect(res.body.definitions.length).toBeGreaterThan(50);
    expect(res.body.presets.map((p: { id: string }) => p.id)).toContain("chalkboard");
    expect(res.body.overridden).toEqual([]);
  });
  it("updates, shows publicly, records an audit trail, and skips no-op changes", async () => {
    const res = await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "feature.search": false, "theme.color.brand": "#aa3300", "feature.browse": true } });
    expect(res.status).toBe(200);
    expect(res.body.overridden.sort()).toEqual(["feature.search", "theme.color.brand"]); // unchanged "feature.browse" not stored
    const pub = await request(app).get("/api/v1/settings/public");
    expect(pub.body.values["feature.search"]).toBe(false);
    expect(pub.body.values["theme.color.brand"]).toBe("#AA3300");
    const audit = await admin(request(app).get("/api/v1/admin/settings/audit"));
    expect(audit.body.entries).toHaveLength(2);
    expect(audit.body.entries[0]).toMatchObject({ action: "update", changedBy: "admin" });
  });
  it("is all-or-nothing and explains what is wrong", async () => {
    const res = await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "feature.search": false, "theme.color.brand": "blue", "site.search.maxResults": 500, "feature.aiTutor": true } });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/colour/);
    expect(res.body.error.message).toMatch(/between 5 and 50/);
    expect(res.body.error.message).toMatch(/not built yet/);
    expect((await request(app).get("/api/v1/settings/public")).body.values["feature.search"]).toBe(true); // nothing applied
    expect((await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "made.up": 1 } })).status).toBe(400);
    expect((await admin(request(app).put("/api/v1/admin/settings")).send({})).status).toBe(400);
  });
  it("resets to defaults", async () => {
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "feature.search": false } });
    const res = await admin(request(app).post("/api/v1/admin/settings/reset")).send({ keys: ["feature.search"] });
    expect(res.body.values["feature.search"]).toBe(true);
    expect(res.body.overridden).toEqual([]);
    expect((await admin(request(app).post("/api/v1/admin/settings/reset")).send({ keys: ["nope"] })).status).toBe(400);
  });
  it("exports and imports a backup", async () => {
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "theme.radius": "round", "catalog.openClasses": [3, 4] } });
    const exp = await admin(request(app).get("/api/v1/admin/settings/export"));
    expect(exp.body.values).toEqual({ "theme.radius": "round", "catalog.openClasses": [3, 4] });
    await admin(request(app).post("/api/v1/admin/settings/reset")).send({ keys: ["theme.radius", "catalog.openClasses"] });
    const imp = await admin(request(app).post("/api/v1/admin/settings/import")).send({ values: exp.body.values });
    expect(imp.body.values["theme.radius"]).toBe("round");
    expect((await admin(request(app).get("/api/v1/admin/settings/audit"))).body.entries.some((e: { action: string }) => e.action === "import")).toBe(true);
  });
});

describe("settings change real behaviour", () => {
  it("maintenance mode returns 503 for curriculum but not for settings or health", async () => {
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "site.maintenance.enabled": true } });
    const res = await request(app).get("/api/v1/curriculum/boards");
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("maintenance");
    expect((await request(app).get("/api/v1/settings/public")).status).toBe(200);
    expect((await request(app).get("/health")).status).toBe(200);
  });
  it("cache time setting controls Cache-Control, 0 disables caching", async () => {
    expect((await request(app).get("/api/v1/curriculum/boards")).headers["cache-control"]).toMatch(/max-age=300/);
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "site.cache.maxAgeSeconds": 0 } });
    expect((await request(app).get("/api/v1/curriculum/boards")).headers["cache-control"]).toBe("no-store");
  });
});
