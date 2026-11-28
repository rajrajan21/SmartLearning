import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createLibraryStore } from "../src/modules/library/store.js";
import { makeRepo } from "./helpers.js";

const KEY = "k".repeat(40);
const pdf = Buffer.from("%PDF-1.4\n" + "x".repeat(3000) + "\n%%EOF\n");
let app: ReturnType<typeof createApp>;
let dir: string;
const admin = (r: request.Test) => r.set("x-admin-key", KEY);
const row = (id: string, extra: Record<string, unknown> = {}) => ({ id, title: `Book ${id}`, authors: ["A. Writer"], language: "en", ageBand: "4-6", ageSource: "guess", pages: 12, licence: { code: "by", name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" }, source: { site: "internet-archive", siteName: "Internet Archive", url: `https://archive.org/details/${id}` }, tags: ["animals"], addedAt: "2026-11-17T00:00:00Z", ...extra });

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "lib-"));
  mkdirSync(join(dir, "files/pdf"), { recursive: true });
  mkdirSync(join(dir, "files/cover"), { recursive: true });
  writeFileSync(join(dir, "files/pdf/ia-one.pdf"), pdf);
  writeFileSync(join(dir, "files/pdf/ia-two.pdf"), pdf);
  writeFileSync(join(dir, "files/cover/ia-one.jpg"), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  writeFileSync(join(dir, "outside.pdf"), pdf);
  try { symlinkSync(join(dir, "outside.pdf"), join(dir, "files/pdf/ia-link.pdf")); }
  catch (err) { if (process.platform !== "win32" || (err as NodeJS.ErrnoException).code !== "EPERM") throw err; }
  writeFileSync(join(dir, "catalog.json"), JSON.stringify({ version: 1, books: [
    row("ia-one"), row("ia-two", { ageBand: "10-12", language: "ta", title: "Tamil tale" }),
    row("ia-missing"), // PDF not on this machine
    row("ia-link"), // symlink leaving the folder
    { id: "../evil", title: "x" }, { id: "ia-one", title: "dup" }, { nope: 1 },
  ] }));
  const { settings, lessons, practice, repo } = await makeRepo();
  app = createApp({ curriculum: repo, settings, lessons, practice, library: createLibraryStore(join(dir, "catalog.json"), join(dir, "files")), adminKey: KEY });
});

describe("E-Library API", () => {
  it("lists only books whose PDF is here, with age bands and languages counted", async () => {
    const res = await request(app).get("/api/v1/library").expect(200);
    expect(res.body.books.map((b: { id: string }) => b.id).sort()).toEqual(["ia-one", "ia-two"]);
    expect(res.body.books.find((b: { id: string }) => b.id === "ia-one")).toMatchObject({ hasCover: true, bytes: pdf.length, licence: { code: "by" } });
    expect(res.body.bands).toEqual([{ band: "4-6", count: 1 }, { band: "10-12", count: 1 }]);
    expect(res.body.languages.map((l: { code: string }) => l.code).sort()).toEqual(["en", "ta"]);
    expect(res.body.bytes).toBe(pdf.length * 2);
  });
  it("serves the PDF in pieces (range) and refuses unsafe names and symlinks", async () => {
    const part = await request(app).get("/api/v1/library/ia-one/file").set("Range", "bytes=0-9").expect(206);
    expect(part.headers["content-type"]).toContain("application/pdf");
    expect(part.headers["accept-ranges"]).toBe("bytes");
    await request(app).get("/api/v1/library/ia-link/file").expect(404);
    await request(app).get("/api/v1/library/ia-missing/file").expect(404);
    await request(app).get("/api/v1/library/..%2Fevil/file").expect(404);
    await request(app).get("/api/v1/library/ia-one/file").set("Range", "bytes=99999-").expect(416);
  });
  it("keeps unlisted files private and preserves collected-book contents", () => {
    const collector = join(dir, "collected-test");
    mkdirSync(collector, { recursive: true });
    writeFileSync(join(dir, "files/pdf/collected.pdf"), pdf);
    const store = createLibraryStore(join(dir, "catalog.json"), join(dir, "files"), undefined, collector);
    expect(store.filePath("collected")).toBeNull();
    writeFileSync(join(collector, "catalog.json"), JSON.stringify({ books: [row("collected", {
      toc: [{ title: "Story", page: 2, level: 0 }, { title: "Invalid", page: 999, level: 0 }],
    })] }));
    expect(store.filePath("collected")).toBeTruthy();
    expect(store.list().books.find((book) => book.id === "collected")?.toc).toEqual([{ title: "Story", page: 2, level: 0 }]);
    writeFileSync(join(collector, "moderation.json"), JSON.stringify({ removed: ["collected"] }));
    expect(store.filePath("collected")).toBeNull();
  });
  it("serves covers, 404 when a book has none", async () => {
    await request(app).get("/api/v1/library/ia-one/cover").expect(200).expect("content-type", /image\/jpeg/);
    await request(app).get("/api/v1/library/ia-two/cover").expect(404);
  });
  it("is off when the feature switch is off", async () => {
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "feature.library": false } }).expect(200);
    await request(app).get("/api/v1/library").expect(404);
    await request(app).get("/api/v1/library/ia-one/file").expect(404);
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "feature.library": true } }).expect(200);
  });
  it("an empty shelf is an empty list, not an error", async () => {
    const empty = createLibraryStore(join(dir, "nope.json"), join(dir, "nodir")).list();
    expect(empty).toEqual({ books: [], bands: [], languages: [], bytes: 0 });
  });
});

describe("E-Library admin page API", () => {
  it("needs the admin key", async () => {
    await request(app).get("/api/v1/admin/library").expect(401);
  });
  it("shows storage against the cap, the tallies, the books and no status yet", async () => {
    const res = await admin(request(app).get("/api/v1/admin/library")).expect(200);
    expect(res.body.usage).toMatchObject({ books: 2, capGB: 10, plannedServerCapGB: 10, usingServerCap: false, hidden: 0 });
    expect(res.body.usage.missingFiles).toBe(3); // ia-missing, ia-link and the unsafe id have no usable file here
    expect(res.body.by.age.map((x: { key: string }) => x.key).sort()).toEqual(["10-12", "4-6", "unknown"]); // "unknown" = a row on disk without a valid age band
    expect(res.body.job).toMatchObject({ enabled: false, perRun: 11 }); // the collector is OFF by default
    expect(res.body.status).toBeNull();
    expect(res.body.books[0]).toHaveProperty("title");
  });
  it("uses the server cap once that switch is on", async () => {
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "library.storage.useServerCap": true } }).expect(200);
    const res = await admin(request(app).get("/api/v1/admin/library")).expect(200);
    expect(res.body.usage).toMatchObject({ capGB: 10, usingServerCap: true });
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "library.storage.useServerCap": false } }).expect(200);
  });
  it("hides a book from the shelf without deleting it, and shows it again", async () => {
    await admin(request(app).post("/api/v1/admin/library/hide")).send({ id: "ia-two", hidden: true }).expect(200);
    expect((await request(app).get("/api/v1/library")).body.books.map((b: { id: string }) => b.id)).toEqual(["ia-one"]);
    expect(existsSync(join(dir, "files/pdf/ia-two.pdf"))).toBe(true);
    await admin(request(app).post("/api/v1/admin/library/hide")).send({ id: "ia-two", hidden: false }).expect(200);
    expect((await request(app).get("/api/v1/library")).body.books).toHaveLength(2);
    await admin(request(app).post("/api/v1/admin/library/hide")).send({ id: "nope", hidden: true }).expect(404);
  });
  it("queues collector commands and validates them", async () => {
    await admin(request(app).post("/api/v1/admin/library/command")).send({ action: "reset-site", site: "internet-archive" }).expect(200);
    await admin(request(app).post("/api/v1/admin/library/command")).send({ action: "clear-skipped" }).expect(200);
    await admin(request(app).post("/api/v1/admin/library/command")).send({ action: "reset-site" }).expect(400);
    await admin(request(app).post("/api/v1/admin/library/command")).send({ action: "rm -rf", site: "x" }).expect(400);
    const cmds = JSON.parse(readFileSync(join(dir, "files/commands.json"), "utf8")).commands;
    expect(cmds.map((c: { action: string }) => c.action)).toEqual(["reset-site", "clear-skipped"]);
    expect((await admin(request(app).get("/api/v1/admin/library"))).body.pendingCommands).toHaveLength(2);
  });
  it("removes a book for good: files, catalogue row, and it is blocked from coming back", async () => {
    await admin(request(app).post("/api/v1/admin/library/remove")).send({ id: "ia-two" }).expect(200);
    expect(existsSync(join(dir, "files/pdf/ia-two.pdf"))).toBe(false);
    expect((await request(app).get("/api/v1/library")).body.books.map((b: { id: string }) => b.id)).toEqual(["ia-one"]);
    expect(JSON.parse(readFileSync(join(dir, "blocklist.json"), "utf8")).ids).toEqual(["ia-two"]);
    await admin(request(app).post("/api/v1/admin/library/remove")).send({ id: "../x" }).expect(400);
  });
});
