import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createBookStore } from "../src/modules/books/store.js";
import { makeRepo } from "./helpers.js";

/** Made-up test books written by tools/make_book_fixture.py (same layout as tools/download_books.py). */
const fixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "books");
const KEY = "k".repeat(40);
let app: ReturnType<typeof createApp>;
let access: Awaited<ReturnType<typeof makeRepo>>["access"];
const admin = (r: request.Test) => r.set("x-admin-key", KEY);
const set = (changes: Record<string, unknown>) => admin(request(app).put("/api/v1/admin/settings")).send({ changes }).expect(200);

beforeAll(async () => {
  const { repo, settings, lessons, practice, access: a } = await makeRepo();
  access = a;
  app = createApp({ curriculum: repo, settings, lessons, practice, access: a, books: createBookStore(fixture), adminKey: KEY });
});

describe("textbooks: list", () => {
  it("lists the books of the manifest that are really on disk, grouped by class and subject", async () => {
    const res = await request(app).get("/api/books").expect(200);
    const books = res.body.books as { id: string; classLevel: number; subject: string; title: string; language: string; file: string; bytes: number; pages: number | null; url: string | null; chapters?: { file: string; url: string }[] }[];
    expect(books.map((b) => b.id)).toEqual(["3/maths.pdf", "3/tamil.pdf", "4/evs/"]);
    expect(books[0]).toMatchObject({ classLevel: 3, subject: "Maths", title: "Mango Market Maths", language: "English", file: "maths.pdf", pages: 8, url: "/api/books/file/3/maths.pdf" });
    expect(books[0]!.bytes).toBe(readFileSync(join(fixture, "pdf/class-3/maths.pdf")).length);
    expect(books[1]!.language).toBe("Tamil");
    // a book kept as separate chapter files
    expect(books[2]).toMatchObject({ url: null, file: "evs" });
    expect(books[2]!.chapters!.map((c) => c.url)).toEqual(["/api/books/file/4/evs/ch1.pdf", "/api/books/file/4/evs/ch2.pdf"]);
    // the manifest row whose PDF was never downloaded is left out
    expect(books.some((b) => b.title === "Missing Book")).toBe(false);
    expect(res.body.classes.map((c: { classLevel: number; subjects: { subject: string }[] }) => [c.classLevel, c.subjects.map((s) => s.subject)])).toEqual([[3, ["Maths", "Tamil"]], [4, ["EVS"]]]);
  });
  it("is an empty list, not an error, when nothing was downloaded or the manifest is broken", async () => {
    const none = createBookStore(join(tmpdir(), "no-such-books-folder"));
    expect(none.list()).toEqual({ books: [], classes: [] });
    const dir = mkdtempSync(join(tmpdir(), "books-"));
    mkdirSync(join(dir, "pdf"));
    writeFileSync(join(dir, "manifest.json"), "{ not json");
    expect(createBookStore(dir).list()).toEqual({ books: [], classes: [] });
    const { repo, settings, lessons, practice } = await makeRepo();
    const empty = createApp({ curriculum: repo, settings, lessons, practice, books: none, adminKey: null });
    expect((await request(empty).get("/api/books").expect(200)).body).toEqual({ books: [], classes: [] });
    // and with no store at all the route does not exist
    await request(createApp({ curriculum: repo, settings, lessons, practice, adminKey: null })).get("/api/books").expect(404);
  });
  it("accepts classLevel/file rows too and refuses unsafe names in a manifest", () => {
    const dir = mkdtempSync(join(tmpdir(), "books-"));
    mkdirSync(join(dir, "pdf", "class-6"), { recursive: true });
    writeFileSync(join(dir, "pdf", "class-6", "science.pdf"), "%PDF-1.4 test");
    writeFileSync(join(dir, "secret.pdf"), "%PDF-1.4 outside");
    writeFileSync(join(dir, "manifest.json"), JSON.stringify({ books: [
      { classLevel: 6, subject: "Science", title: "Curiosity", language: "English", file: "science", pages: 3 },
      { classLevel: 6, subject: "Science", title: "Escape", file: "../../secret.pdf" },
      { class: 6, subject: "Science", title: "Escape 2", path: "content/books/pdf/class-6/../../secret.pdf" },
      { class: 99, subject: "X", title: "Bad class", file: "science.pdf" },
      { class: 6, subject: "Science", title: "Failed", file: "science.pdf", status: "failed" },
      "nonsense",
    ] }));
    const l = createBookStore(dir).list();
    expect(l.books.map((b) => b.title)).toEqual(["Curiosity"]);
    expect(l.books[0]).toMatchObject({ file: "science.pdf", pages: 3, url: "/api/books/file/6/science.pdf" });
  });
});

describe("textbooks: PDF file route", () => {
  it("streams the PDF inline with the right headers", async () => {
    const res = await request(app).get("/api/books/file/3/maths.pdf").buffer(true).parse((r, cb) => { const c: Buffer[] = []; r.on("data", (d: Buffer) => c.push(d)); r.on("end", () => cb(null, Buffer.concat(c))); }).expect(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toBe('inline; filename="maths.pdf"');
    expect(res.headers["accept-ranges"]).toBe("bytes");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect((res.body as Buffer).subarray(0, 5).toString()).toBe("%PDF-");
    expect((res.body as Buffer).length).toBe(readFileSync(join(fixture, "pdf/class-3/maths.pdf")).length);
  });
  it("answers range requests with 206 and exactly the bytes asked for", async () => {
    const all = readFileSync(join(fixture, "pdf/class-3/maths.pdf"));
    const res = await request(app).get("/api/books/file/3/maths.pdf").set("Range", "bytes=100-299").buffer(true).parse((r, cb) => { const c: Buffer[] = []; r.on("data", (d: Buffer) => c.push(d)); r.on("end", () => cb(null, Buffer.concat(c))); }).expect(206);
    expect(res.headers["content-range"]).toBe(`bytes 100-299/${all.length}`);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect((res.body as Buffer).equals(all.subarray(100, 300))).toBe(true);
    const tail = await request(app).get("/api/books/file/3/maths.pdf").set("Range", "bytes=-10").expect(206);
    expect(tail.headers["content-length"]).toBe("10");
    await request(app).get("/api/books/file/3/maths.pdf").set("Range", `bytes=${all.length + 5}-`).expect(416);
  });
  it("offers the file as a download with ?download=1", async () => {
    const res = await request(app).get("/api/books/file/3/maths.pdf?download=1").expect(200);
    expect(res.headers["content-disposition"]).toBe('attachment; filename="maths.pdf"');
  });
  it("serves chapter files of a chapters-only book", async () => {
    const res = await request(app).get("/api/books/file/4/evs/ch2.pdf").expect(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toBe('inline; filename="evs-ch2.pdf"');
  });
  it("cannot be used to read anything outside the books folder", async () => {
    for (const p of [
      "/api/books/file/3/..%2F..%2Fmanifest.json", "/api/books/file/3/%2e%2e%2f%2e%2e%2fmanifest.json", "/api/books/file/3/..%5C..%5Cmanifest.json",
      "/api/books/file/..%2F..%2F/manifest.json", "/api/books/file/3/manifest.json", "/api/books/file/3/.hidden.pdf", "/api/books/file/3/maths.pdf%00.txt",
      "/api/books/file/3/nope.pdf", "/api/books/file/03/maths.pdf", "/api/books/file/abc/maths.pdf", "/api/books/file/3/_chapters/x.pdf",
      "/api/books/file/4/evs/..%2F..%2F..%2Fclass-3%2Fmaths.pdf", "/api/books/file/4/..%2Fclass-3/maths.pdf", "/api/books/file/3/%2Fetc%2Fpasswd",
      "/api/books/file/3/maths.pdf/extra/more",
    ]) {
      const res = await request(app).get(p);
      expect([400, 404], p).toContain(res.status);
      expect(String(res.text), p).not.toContain("%PDF-");
      expect(String(res.text), p).not.toContain("Made-up test books");
    }
    const store = createBookStore(fixture);
    expect(store.filePath("3", "../class-3/maths.pdf")).toBeNull();
    expect(store.filePath("3", "maths.pdf\0")).toBeNull();
    expect(store.filePath("3", "..")).toBeNull();
    expect(store.filePath("4", "..", "maths.pdf")).toBeNull();
    expect(store.filePath("3", "maths.pdf")).toMatch(/class-3[\\/]maths\.pdf$/);
  });
  it("does not follow a link that points out of the books folder", () => {
    const dir = mkdtempSync(join(tmpdir(), "books-"));
    mkdirSync(join(dir, "pdf", "class-3"), { recursive: true });
    writeFileSync(join(dir, "outside.pdf"), "%PDF-1.4 outside");
    try { symlinkSync(join(dir, "outside.pdf"), join(dir, "pdf", "class-3", "link.pdf")); } catch { return; /* no symlink rights on this machine */ }
    expect(createBookStore(dir).filePath("3", "link.pdf")).toBeNull();
  });
});

describe("textbooks: switches and the invite-code door", () => {
  it("is hidden when the feature is switched off, and when the site is in maintenance", async () => {
    await set({ "feature.textbooks": false });
    await request(app).get("/api/books").expect(404);
    await request(app).get("/api/books/file/3/maths.pdf").expect(404);
    await set({ "feature.textbooks": true, "site.maintenance.enabled": true });
    await request(app).get("/api/books").expect(503);
    await set({ "site.maintenance.enabled": false });
    await request(app).get("/api/books").expect(200);
  });
  it("needs the access cookie while the site is invitation only", async () => {
    await set({ "access.mode": "invite" });
    expect((await request(app).get("/api/books").expect(401)).body.error.code).toBe("access_required");
    await request(app).get("/api/books/file/3/maths.pdf").expect(401);
    const c = await access.create({ label: "t", maxUses: null, expiresAt: null });
    const redeemed = await request(app).post("/api/access/redeem").send({ code: c.code }).expect(200);
    const cookie = String(redeemed.headers["set-cookie"]).split(";")[0]!;
    await request(app).get("/api/books").set("Cookie", cookie).expect(200);
    const pdf = await request(app).get("/api/books/file/3/maths.pdf").set("Cookie", cookie).set("Range", "bytes=0-4").expect(206);
    expect(pdf.headers["content-range"]).toMatch(/^bytes 0-4\//);
    await set({ "access.mode": "public" });
  });
});
