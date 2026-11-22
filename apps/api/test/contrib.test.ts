import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createLibraryStore } from "../src/modules/library/store.js";
import { createContribStore } from "../src/modules/contrib/store.js";
import { createContribService } from "../src/modules/contrib/service.js";
import { safeFetch } from "../src/modules/contrib/ssrf.js";
import { verhoeff } from "../src/modules/contrib/detectors.js";
import { makeRepo } from "./helpers.js";
import { cleanPdf, rawPdf } from "./contrib-fixtures.js";

const KEY = "k".repeat(40);
const STORY = ["Once upon a time a little fox lived near a quiet river and loved to read.", "Every morning the fox read a new page and told the birds what she had learned.", "At night the stars came out and the fox dreamed of the wide and wonderful world."];
const reg = { email: "mum@example.com", password: "correct horse", consent: true, child: { nickname: "Riya", classLevel: 3, avatar: "fox", language: "en" } };
const meta = (over: Record<string, unknown> = {}) => ({ title: "The Fox and the River", author: "A. Writer", board: "General reading", classLevel: "3", subject: "English", language: "en", licence: "own", consent: true, displayName: "Riya's mum", ...over });

let m: Awaited<ReturnType<typeof makeRepo>>;
let app: ReturnType<typeof createApp>;
let dir: string, store: ReturnType<typeof createContribStore>, svc: ReturnType<typeof createContribService>, lib: ReturnType<typeof createLibraryStore>;
let cookie = "";
const admin = (r: request.Test) => r.set("x-admin-key", KEY);
const cookieOf = (res: request.Response) => String((res.headers["set-cookie"] as unknown as string[] | undefined)?.[0] ?? "").split(";")[0]!;
const fake = Buffer.from("%PDF-1.4 fake");

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "contrib-"));
  mkdirSync(join(dir, "lib/pdf"), { recursive: true });
  writeFileSync(join(dir, "catalog.json"), JSON.stringify({ version: 1, books: [] }));
  m = await makeRepo();
  await m.settings.update({ "feature.library": true, "contrib.enabled": true, "contrib.minSecondsToSubmit": 0 }, "test");
  store = createContribStore(join(dir, "contrib"), join(dir, "lib"));
  lib = createLibraryStore(join(dir, "catalog.json"), join(dir, "lib"), store.dirs.contributed);
  svc = createContribService({ store, settings: m.settings, library: lib, secret: "test-secret-0123456789", libraryFilesDir: join(dir, "lib"), fetcher: (u, o) => (u.includes("files.example.org") ? Promise.resolve({ buffer: pdfBuf, finalUrl: u, contentType: "application/pdf" }) : safeFetch(u, o)) });
  app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, library: lib, contrib: { svc, store }, adminKey: KEY });
  const r = await request(app).post("/api/v1/account/register").send(reg);
  cookie = cookieOf(r);
});
let pdfBuf: Buffer;
beforeEach(async () => { pdfBuf = await cleanPdf(STORY); });

async function send(buf: Buffer, over: Record<string, unknown> = {}, who: string | null = cookie) {
  const cfg = await (who ? request(app).get("/api/v1/library/contribute/config").set("Cookie", who) : request(app).get("/api/v1/library/contribute/config"));
  const q = String(cfg.body.challenge?.question ?? "");
  const a = (q.match(/(\d+) \+ (\d+)/) ?? []).slice(1).reduce((x, y) => x + Number(y), 0);
  const body = { ...meta(), token: cfg.body.challenge?.token, answer: String(a), fileName: "fox.pdf", ...over };
  const r = request(app).post("/api/v1/library/contribute/upload").set("Content-Type", "application/pdf").set("X-Contrib-Meta", Buffer.from(JSON.stringify(body)).toString("base64url"));
  if (who) r.set("Cookie", who);
  return r.send(buf);
}
const mine = async () => (await request(app).get("/api/v1/library/contribute/mine").set("Cookie", cookie)).body.submissions as { id: string; status: string; reasons: string[]; checks: { id: string; status: string }[] }[];

describe("Contribute to the E-Library", () => {
  it("shows the form settings, and guests cannot contribute by default", async () => {
    const cfg = await request(app).get("/api/v1/library/contribute/config").expect(200);
    expect(cfg.body).toMatchObject({ enabled: true, signedIn: false, canContribute: false, linkEnabled: true });
    const r = await send(pdfBuf, {}, null);
    expect(r.status).toBe(401);
    const cfg2 = await request(app).get("/api/v1/library/contribute/config").set("Cookie", cookie);
    expect(cfg2.body).toMatchObject({ signedIn: true, canContribute: true });
    expect(cfg2.body.licences.map((l: { id: string }) => l.id)).toContain("by");
  });

  it("takes a clean PDF into review, then an admin approves it and it shows up with a reader, text search and credit", async () => {
    const r = await send(pdfBuf);
    expect(r.status).toBe(202);
    await svc.waitIdle();
    const [s] = await mine();
    expect(s!.status).toBe("in_review");
    expect(s!.checks.find((c) => c.id === "structure")!.status).toBe("pass");
    expect((await request(app).get("/api/v1/library")).body.books).toHaveLength(0);
    const q = await admin(request(app).get("/api/v1/admin/contrib/submissions?status=in_review")).expect(200);
    expect(q.body.items).toHaveLength(1);
    const prev = await admin(request(app).get(`/api/v1/admin/contrib/submissions/${s!.id}/preview?page=1`)).expect(200);
    expect(prev.body.text).toContain("little fox");
    await admin(request(app).post(`/api/v1/admin/contrib/submissions/${s!.id}/decision`)).send({ action: "approve" }).expect(200);
    const list = (await request(app).get("/api/v1/library").expect(200)).body.books;
    expect(list).toHaveLength(1);
    const book = list[0];
    expect(book).toMatchObject({ title: "The Fox and the River", ageBand: "7-9", language: "en", contributed: { by: "Riya's mum", hasText: true } });
    expect(book.id).toMatch(/^c-[a-f0-9]{12}$/);
    expect(book.tags).toContain("Class 3");
    await request(app).get(`/api/v1/library/${book.id}/file`).set("Range", "bytes=0-9").expect(206);
    await request(app).get(`/api/v1/library/${book.id}/cover`).expect(200);
    const text = await request(app).get(`/api/v1/library/${book.id}/text`).expect(200);
    expect(text.body.pages[0]).toContain("little fox");
    const found = (await request(app).get("/api/v1/library/search?q=stars%20came")).body.hits;
    expect(found[0]).toMatchObject({ id: book.id, page: 3 });
    const prof = await request(app).get(`/api/v1/library/contributor/${book.contributed.handle}`).expect(200);
    expect(prof.body.books).toHaveLength(1);
    expect((await mine())[0]!.status).toBe("published");
    expect(readdirSync(store.dirs.quarantine)).toEqual([]); // the quarantined copy is gone
    const notices = (await request(app).get("/api/v1/library/contribute/mine").set("Cookie", cookie)).body.notices;
    expect(notices[0].text).toContain("is now in the E-Library");
  });

  it("rejects a PDF with JavaScript, with a friendly reason, and deletes the file", async () => {
    await send(rawPdf("/OpenAction << /S /JavaScript /JS (app.alert(1)) >>"));
    await svc.waitIdle();
    const [s] = await mine();
    expect(s!.status).toBe("rejected");
    expect(s!.reasons[0]).toContain("JavaScript");
    expect(readdirSync(store.dirs.quarantine)).toEqual([]);
  });

  it("rejects a PDF full of personal data and never stores the values", async () => {
    let base = "23456789012", d = 0; while (!verhoeff(base + d)) d++; const aadhaar = base + d;
    const pdf = await cleanPdf([`Student sheet Aadhaar ${aadhaar} please keep safe for the school records.`, "PAN number ABCPE1234F for the school fees records of the child here.", "Pay with card 4111 1111 1111 1111 for the tour and keep the receipt safe."]);
    await send(pdf, { title: "School sheet" });
    await svc.waitIdle();
    const [s] = await mine();
    expect(s!.status).toBe("rejected");
    expect(s!.reasons.join(" ")).toContain("personal or sensitive");
    const full = JSON.stringify(store.db);
    for (const v of [aadhaar, "ABCPE1234F", "4111 1111 1111 1111", "4111111111111111"]) expect(full).not.toContain(v);
    expect(store.db.submissions[0]!.report!.checks.find((c) => c.id === "pii")!.status).toBe("fail");
  });

  it("rejects a book that says All rights reserved but was declared open, and one from a blocked publisher", async () => {
    await send(await cleanPdf(["Copyright 2021 Pearson Education. All rights reserved. ISBN 978-0-306-40615-7.", STORY[1]!, STORY[2]!]), { licence: "by", sourceUrl: "https://example.org/b", licenceProof: "The page says this book is licensed CC BY 4.0 for everyone." });
    await svc.waitIdle();
    const [s] = await mine();
    expect(s!.status).toBe("rejected");
    expect(s!.checks.find((c) => c.id === "copyright")!.status).toBe("fail");
  });

  it("never auto-approves an unknown licence, but auto-approves a verifiably open one when the admin enables it", async () => {
    await m.settings.update({ "contrib.autoApprove.enabled": true }, "test");
    await send(pdfBuf, { title: "Own work", licence: "own" });
    await svc.waitIdle();
    expect((await mine())[0]!.status).toBe("in_review");
    const cc = await cleanPdf(["This work is licensed under https://creativecommons.org/licenses/by/4.0/ .", ...STORY.slice(1)]);
    await send(cc, { title: "Open Fox", licence: "by", sourceUrl: "https://example.org/openfox", licenceProof: "The first page of the PDF carries the CC BY 4.0 notice." });
    await svc.waitIdle();
    const all = await mine();
    expect(all.find((x) => x.status === "published")).toBeTruthy();
    expect((await request(app).get("/api/v1/library")).body.books.map((b: { title: string }) => b.title)).toEqual(["Open Fox"]);
  });

  it("publishes an eligible PDF with an advisory language difference", async () => {
    const cc = await cleanPdf(["This work is licensed under https://creativecommons.org/licenses/by/4.0/ .", ...STORY]);
    await send(cc, { title: "Open Fox", language: "ta", licence: "by", sourceUrl: "https://example.org/openfox", licenceProof: "The first page carries the CC BY 4.0 notice." });
    await svc.waitIdle();
    expect((await mine())[0]!.status).toBe("published");
  });

  it("keeps a book with only an image credit in manual review", async () => {
    const cc = await cleanPdf(["Image Attribution: Photo under CC BY-SA.", ...STORY]);
    await send(cc, { title: "Illustrated Fox", licence: "by-sa", sourceUrl: "https://example.org/illustratedfox", licenceProof: "Photo under CC BY-SA." });
    await svc.waitIdle();
    expect((await mine())[0]!.status).toBe("in_review");
  });

  it("refuses duplicates of a file already sent", async () => {
    await send(pdfBuf); await svc.waitIdle();
    await send(pdfBuf, { title: "Same again" }); await svc.waitIdle();
    const all = await mine();
    expect(all.map((x) => x.status).sort()).toEqual(["in_review", "rejected"]);
    expect(all.find((x) => x.status === "rejected")!.reasons[0]).toContain("already");
  });

  it("adds by link: fetches through the guard, and refuses private addresses", async () => {
    const ok = await request(app).post("/api/v1/library/contribute/link").set("Cookie", cookie).send({ ...meta(), link: "https://files.example.org/fox.pdf", ...(await token()) });
    expect(ok.status).toBe(202);
    await svc.waitIdle();
    const bad = await request(app).post("/api/v1/library/contribute/link").set("Cookie", cookie).send({ ...meta({ title: "Metadata" }), link: "https://169.254.169.254/latest/meta-data", ...(await token()) });
    expect(bad.status).toBe(202);
    await svc.waitIdle();
    const all = await mine();
    const rej = all.find((x) => x.status === "rejected")!;
    expect(rej.reasons[0]).toContain("not on the public internet");
    expect(all.find((x) => x.status === "in_review")).toBeTruthy();
  });

  it("fetch details: needs sign-in, refuses private and blocked addresses, can be switched off", async () => {
    const post = (url: string, who: string | null = cookie) => { const r = request(app).post("/api/v1/library/contribute/fetch-details").send({ url }); return who ? r.set("Cookie", who) : r; };
    expect((await post("https://127.0.0.1/x", null)).status).toBe(401);
    const priv = await post("https://169.254.169.254/latest/meta-data");
    expect(priv.status).toBe(400); expect(priv.body.error.code).toBe("private_host");
    expect((await post("https://scribd.com/doc/1")).body.error.code).toBe("denied_domain");
    expect((await post("not a link")).body.error.code).toBe("bad_url");
    const pdfLink = await post("https://files.example.org/the_fox.pdf");
    expect(pdfLink.body).toMatchObject({ kind: "pdf", fields: { title: "The Fox" } });
    expect((await request(app).get("/api/v1/library/contribute/config").set("Cookie", cookie)).body.fetchEnabled).toBe(true);
    await m.settings.update({ "contrib.fetch.enabled": false }, "test");
    expect((await post("https://files.example.org/x")).status).toBe(404);
  });

  it("stops bots: honeypot is dropped silently, the sum must be right, the form cannot be too fast", async () => {
    const hp = await send(pdfBuf, { website: "http://spam" });
    expect(hp.status).toBe(202);
    expect(store.db.submissions).toHaveLength(0);
    const wrong = await send(pdfBuf, { answer: "999" });
    expect(wrong.status).toBe(400);
    expect(wrong.body.error.code).toBe("challenge");
    await m.settings.update({ "contrib.minSecondsToSubmit": 60 }, "test");
    const fast = await send(pdfBuf);
    expect(fast.body.error.code).toBe("too_fast");
    await m.settings.update({ "contrib.minSecondsToSubmit": 0 }, "test");
    const first = await send(pdfBuf);
    expect(first.status).toBe(202);
    const cfg = await request(app).get("/api/v1/library/contribute/config").set("Cookie", cookie);
    const reuse = await request(app).post("/api/v1/library/contribute/link").set("Cookie", cookie).send({ ...meta(), link: "https://files.example.org/a.pdf", token: cfg.body.challenge.token, answer: String((cfg.body.challenge.question.match(/\d+/g) as string[]).reduce((x, y) => x + Number(y), 0)) });
    expect(reuse.status).toBe(202);
    const replay = await request(app).post("/api/v1/library/contribute/link").set("Cookie", cookie).send({ ...meta({ title: "Replay" }), link: "https://files.example.org/a.pdf", token: cfg.body.challenge.token, answer: String((cfg.body.challenge.question.match(/\d+/g) as string[]).reduce((x, y) => x + Number(y), 0)) });
    expect(replay.status).toBe(400); // a token works once
    await svc.waitIdle();
  });

  it("enforces the daily limit, the size limit, the PDF magic bytes and the contributor block list", async () => {
    await m.settings.update({ "contrib.perUserPerDay": 1 }, "test");
    expect((await send(pdfBuf)).status).toBe(202);
    const second = await send(pdfBuf, { title: "Second" });
    expect(second.status).toBe(429);
    await m.settings.update({ "contrib.perUserPerDay": 50, "contrib.maxMB": 1 }, "test");
    expect((await send(Buffer.concat([fake, Buffer.alloc(2 * 1024 * 1024)]))).status).toBe(413);
    expect((await send(Buffer.from("MZ not a pdf at all, just text".repeat(10)))).status).toBe(415);
    await svc.waitIdle();
    const id = store.db.submissions[0]!.id;
    await admin(request(app).post("/api/v1/admin/contrib/blocked")).send({ submissionId: id, kind: "user" }).expect(200);
    const blocked = await send(pdfBuf, { title: "After block" });
    expect(blocked.status).toBe(403);
  });

  it("lets an admin reject or ask for changes with a reason, and the contributor is told", async () => {
    await send(pdfBuf); await svc.waitIdle();
    const id = store.db.submissions[0]!.id;
    await admin(request(app).post(`/api/v1/admin/contrib/submissions/${id}/decision`)).send({ action: "changes" }).expect(400);
    await admin(request(app).post(`/api/v1/admin/contrib/submissions/${id}/decision`)).send({ action: "changes", canned: "incomplete" }).expect(200);
    expect((await mine())[0]!.status).toBe("changes_requested");
    await admin(request(app).post(`/api/v1/admin/contrib/submissions/${id}/decision`)).send({ action: "reject", canned: "copyright" }).expect(200);
    const n = (await request(app).get("/api/v1/library/contribute/mine").set("Cookie", cookie)).body.notices;
    expect(n.map((x: { text: string }) => x.text).join(" ")).toContain("could not be added");
    await admin(request(app).post(`/api/v1/admin/contrib/submissions/${id}/decision`)).send({ action: "approve" }).expect(409);
  });

  it("keeps a rejected file only as long as the retention setting says", async () => {
    await m.settings.update({ "contrib.retention.rejectedDays": 5 }, "test");
    await send(pdfBuf); await svc.waitIdle();
    const id = store.db.submissions[0]!.id;
    await admin(request(app).post(`/api/v1/admin/contrib/submissions/${id}/decision`)).send({ action: "reject", canned: "quality" }).expect(200);
    expect(readdirSync(store.dirs.quarantine).length).toBeGreaterThan(0);
    const r = await svc.sweep(new Date(Date.now() + 6 * 864e5));
    expect(r.filesDeleted).toBe(1);
    expect(readdirSync(store.dirs.quarantine)).toEqual([]);
  });

  it("a takedown hides the book at once (also its direct link) until the admin decides", async () => {
    await send(pdfBuf); await svc.waitIdle();
    const sid = store.db.submissions[0]!.id;
    await admin(request(app).post(`/api/v1/admin/contrib/submissions/${sid}/decision`)).send({ action: "approve" }).expect(200);
    const id = store.db.books[0]!.id as string;
    await request(app).post(`/api/v1/library/${id}/takedown`).send({ name: "A Publisher", email: "legal@pub.example", message: "This is our book and we did not give permission." }).expect(201);
    expect((await request(app).get("/api/v1/library")).body.books).toHaveLength(0);
    await request(app).get(`/api/v1/library/${id}/file`).expect(404);
    const t = (await admin(request(app).get("/api/v1/admin/contrib/takedowns"))).body.items[0];
    await admin(request(app).post(`/api/v1/admin/contrib/takedowns/${t.id}`)).send({ decision: "dismissed" }).expect(200);
    expect((await request(app).get("/api/v1/library")).body.books).toHaveLength(1);
    await request(app).post(`/api/v1/library/${id}/takedown`).send({ name: "A", email: "bad", message: "short" }).expect(400);
    await request(app).post(`/api/v1/library/${id}/problem`).send({ kind: "personal", message: "Page 2 shows a phone number." }).expect(201);
    expect((await admin(request(app).get("/api/v1/admin/contrib/problems"))).body.items).toHaveLength(1);
  });

  it("is off for everyone when the admin switches it off, and the admin API needs the key", async () => {
    await request(app).get("/api/v1/admin/contrib/overview").expect(401);
    await m.settings.update({ "contrib.enabled": false }, "test");
    expect((await request(app).get("/api/v1/library/contribute/config")).body).toEqual({ enabled: false });
    expect((await send(pdfBuf)).status).toBe(404);
  });

  it("lets a contributor withdraw, and exports a CSV without formula injection", async () => {
    await send(pdfBuf, { title: "=HYPERLINK(\"http://x\")" }); await svc.waitIdle();
    const id = store.db.submissions[0]!.id;
    await request(app).post(`/api/v1/library/contribute/${id}/withdraw`).set("Cookie", cookie).expect(200);
    expect((await mine())[0]!.status).toBe("withdrawn");
    const csv = (await admin(request(app).get("/api/v1/admin/contrib/export?format=csv")).expect(200)).text;
    expect(csv).toContain("\"'=HYPERLINK");
    expect(existsSync(join(store.dirs.quarantine, `${id}.pdf`))).toBe(false);
  });
});

async function token() {
  const cfg = await request(app).get("/api/v1/library/contribute/config").set("Cookie", cookie);
  return { token: cfg.body.challenge.token, answer: String((cfg.body.challenge.question.match(/\d+/g) as string[]).reduce((x, y) => x + Number(y), 0)) };
}
