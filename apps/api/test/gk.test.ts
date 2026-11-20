import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { GK_ANIMATED_VISUALS } from "@studysmart/shared";
import { createApp } from "../src/app.js";
import { createGkStore } from "../src/modules/gk/store.js";
import { makeRepo } from "./helpers.js";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "content", "gk");
const KEY = "k".repeat(40);
let app: ReturnType<typeof createApp>;
const store = createGkStore(dir);
const admin = (r: request.Test) => r.set("x-admin-key", KEY);

beforeAll(async () => {
  const { repo, settings, lessons, practice, access } = await makeRepo();
  app = createApp({ curriculum: repo, settings, lessons, practice, access, gk: store, adminKey: KEY });
});

describe("GK content files", () => {
  it("every lesson and category passes the schema (nothing skipped)", () => {
    expect(store.report().invalid).toEqual([]);
  });
  it("meets the size targets: 15+ categories, lessons, 40+ puzzle sets, 15+ animations", () => {
    const r = store.report();
    expect(r.byCategory.length).toBeGreaterThanOrEqual(15);
    expect(r.lessons).toBeGreaterThanOrEqual(50);
    expect(r.puzzles).toBeGreaterThanOrEqual(40);
    expect(r.animations).toBeGreaterThanOrEqual(15);
    expect(r.unknownCategories).toEqual([]);
  });
  it("covers every age band and only uses pictures that the browser can draw", () => {
    const r = store.report();
    for (const a of r.byAge) expect(a.lessons + a.puzzles).toBeGreaterThan(0);
    for (const x of r.ids) {
      const l = store.lesson(x.id)!;
      for (const s of l.steps) if (s.visual) expect(GK_ANIMATED_VISUALS.has(s.visual), `${x.id}: ${s.visual}`).toBe(true);
    }
  });
});

describe("GK routes", () => {
  it("serves the index and a lesson", async () => {
    const ix = await request(app).get("/api/v1/gk/index").expect(200);
    expect(ix.body.items.length).toBeGreaterThan(50);
    const id = ix.body.items[0].id as string;
    const l = await request(app).get(`/api/v1/gk/lessons/${id}`).expect(200);
    expect(l.body.steps[0].audio).toHaveLength(l.body.steps[0].sentences.length);
    await request(app).get("/api/v1/gk/lessons/not-there").expect(404);
  });
  it("is hidden when the feature is switched off", async () => {
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "feature.gk": false } }).expect(200);
    await request(app).get("/api/v1/gk/index").expect(404);
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "feature.gk": true } }).expect(200);
  });
  it("shows the admin report only with the admin key", async () => {
    await request(app).get("/api/v1/admin/gk/report").expect(401);
    const r = await admin(request(app).get("/api/v1/admin/gk/report")).expect(200);
    expect(r.body.lessons).toBeGreaterThan(0);
    await admin(request(app).post("/api/v1/admin/gk/reload")).expect(200);
  });
});
