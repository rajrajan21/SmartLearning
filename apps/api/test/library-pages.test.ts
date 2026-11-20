import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createLibraryStore } from "../src/modules/library/store.js";
import { createLibraryPages } from "../src/modules/library/pages.js";
import { makeRepo } from "./helpers.js";

const pdf = Buffer.from("%PDF-1.4\n" + "x".repeat(2000) + "\n%%EOF\n");
const KEY = "k".repeat(40);
const row = (id: string) => ({ id, title: `Book ${id}`, authors: ["A"], language: "en", ageBand: "4-6", ageSource: "guess", pages: 3, licence: { code: "by", name: "CC BY", url: "" }, source: { site: "s", url: "https://s.example" }, addedAt: "2026-01-01T00:00:00Z" });
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "libpg-")); const files = join(dir, "files");
  mkdirSync(join(files, "pdf"), { recursive: true }); mkdirSync(join(files, "cover"), { recursive: true });
  for (const id of ["one", "two", "three"]) writeFileSync(join(files, "pdf", `${id}.pdf`), pdf);
  writeFileSync(join(dir, "catalog.json"), JSON.stringify({ version: 1, books: [row("one"), row("two"), row("three")] }));
  return { dir, files, catalog: join(dir, "catalog.json") };
}
const fakeRun = (files: string, log: string[], ok = true) => async (id: string) => {
  log.push(id); if (!ok) return false;
  const d = join(files, "pages", id); mkdirSync(d, { recursive: true });
  for (const n of [1, 2, 3]) for (const k of ["t", "s", "l"]) writeFileSync(join(d, `${n}-${k}.webp`), Buffer.from(`RIFF${id}${n}${k}`));
  writeFileSync(join(d, "meta.json"), JSON.stringify({ pages: 3, ratio: 0.7, done: true }));
  return true;
};
const wait = async (f: () => boolean) => { for (let i = 0; i < 100 && !f(); i++) await new Promise((r) => setTimeout(r, 10)); };

describe("library page pictures", () => {
  it("draws on first ask, one at a time, never twice, and reports state", async () => {
    const { files } = setup(); const calls: string[] = [];
    const p = createLibraryPages({ filesDir: files, settings: async () => ({}), run: fakeRun(files, calls) });
    expect(p.state("one")).toBe("none");
    expect(await p.ensure("one")).toBe("queued"); await p.ensure("one");
    await wait(() => p.state("one") === "ready");
    expect(p.info("one")).toEqual({ pages: 3, ratio: 0.7 }); expect(calls).toEqual(["one"]);
    expect(await p.ensure("one")).toBe("ready"); expect(calls).toEqual(["one"]);
    expect(p.info("../x")).toBeNull();
  });
  it("respects the switches, remembers failures, and sweeps only books without pictures", async () => {
    const { files } = setup(); const calls: string[] = [];
    let v: Record<string, unknown> = { "feature.library": true, "library.pages.enabled": false };
    const p = createLibraryPages({ filesDir: files, settings: async () => v, run: fakeRun(files, calls) });
    expect(await p.ensure("one")).toBe("off"); expect(await p.sweep()).toBe(0);
    v = { "feature.library": true, "library.pages.preRender": false };
    expect(await p.ensure("one", "added")).toBe("none"); expect(await p.sweep()).toBe(0);
    v = { "feature.library": true };
    expect(await p.sweep()).toBe(3); await wait(() => calls.length === 3 && p.stats().building === null);
    expect(await p.sweep()).toBe(0);
    const bad = setup(); const calls2: string[] = [];
    const q = createLibraryPages({ filesDir: bad.files, settings: async () => ({}), run: fakeRun(bad.files, calls2, false) });
    await q.ensure("two"); await wait(() => q.state("two") === "failed"); expect(await q.ensure("two")).toBe("failed"); expect(calls2).toEqual(["two"]);
  });
  it("removes pictures of deleted books on sweep and trims the cache, oldest first", async () => {
    const { files } = setup(); const calls: string[] = [];
    const p = createLibraryPages({ filesDir: files, settings: async () => ({ "feature.library": true }), run: fakeRun(files, calls) });
    await p.sweep(); await wait(() => calls.length === 3 && p.stats().building === null);
    mkdirSync(join(files, "pages", "gone")); writeFileSync(join(files, "pages", "gone", "meta.json"), "{}");
    await p.sweep(); expect(existsSync(join(files, "pages", "gone"))).toBe(false);
    expect(p.stats().books).toBe(3);
    const r = p.trim(0); expect(r.removed).toBe(3); expect(readdirSync(join(files, "pages"))).toEqual([]);
  });
});

describe("library reader routes", () => {
  it("info starts the drawing, then serves ready pictures with safe names only", async () => {
    const { files, catalog } = setup(); const calls: string[] = [];
    const store = createLibraryStore(catalog, files);
    const { settings, lessons, practice, repo } = await makeRepo();
    const pages = createLibraryPages({ filesDir: files, settings: () => settings.all() as Promise<Record<string, unknown>>, run: fakeRun(files, calls) });
    const app = createApp({ curriculum: repo, settings, lessons, practice, library: store, libraryPages: pages, adminKey: KEY });
    const first = await request(app).get("/api/v1/library/one/info").expect(200);
    expect(first.body).toMatchObject({ reader: true, fallbackPdf: true, fast: null }); expect(["queued", "building", "ready"]).toContain(first.body.state);
    await wait(() => pages.state("one") === "ready");
    const second = await request(app).get("/api/v1/library/one/info").expect(200);
    expect(second.body).toMatchObject({ state: "ready", fast: { pages: 3, ratio: 0.7, base: "/api/v1/library/one/pages/" } });
    const img = await request(app).get("/api/v1/library/one/pages/2-s.webp").expect(200);
    expect(img.headers["content-type"]).toBe("image/webp"); expect(img.headers["cache-control"]).toMatch(/max-age/);
    for (const f of ["meta.json", "..%2Fx.webp", "0-q.webp", "9999999-s.webp"]) await request(app).get(`/api/v1/library/one/pages/${f}`).expect(404);
    await request(app).get("/api/v1/library/nope/info").expect(404);
    await request(app).get("/api/v1/library/two/pages/1-s.webp").expect(404); // nothing drawn for it
    await request(app).post("/api/v1/admin/library/pages/clear").set("x-admin-key", KEY).expect(200);
    await request(app).get("/api/v1/library/one/pages/2-s.webp").expect(404);
    const st = await request(app).get("/api/v1/admin/library/pages").set("x-admin-key", KEY).expect(200); expect(st.body.available).toBe(true);
  });
  it("the reader can be switched off in settings", async () => {
    const { files, catalog } = setup(); const calls: string[] = [];
    const { settings, lessons, practice, repo } = await makeRepo();
    await settings.update({ "library.pages.enabled": false }, "test");
    const pages = createLibraryPages({ filesDir: files, settings: () => settings.all() as Promise<Record<string, unknown>>, run: fakeRun(files, calls) });
    const app = createApp({ curriculum: repo, settings, lessons, practice, library: createLibraryStore(catalog, files), libraryPages: pages, adminKey: KEY });
    const r = await request(app).get("/api/v1/library/one/info").expect(200);
    expect(r.body).toMatchObject({ reader: false, state: "off", fast: null }); expect(calls).toEqual([]);
  });
});
