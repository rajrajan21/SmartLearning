import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { join } from "node:path";
import type { SettingsService } from "../settings/service.js";
import { hashOf, newId, type ContribStore, type Notice, type Submission, type SubStatus } from "./store.js";
import { FetchError, parseDomains, safeFetch } from "./ssrf.js";
import { publisherBook } from "./publisher-evidence.js";
import { libraryBytes, libraryCap } from "../library/storage.js";
import { scanContributionPdf } from "./pdfscan.js";
import { extractPdf, type Extracted } from "./textextract.js";
import { reviewSubmission, type Declared, type ExistingBook, type Report } from "./review.js";
import { cleanTerms, maskPii, scanContent } from "./detectors.js";
import { cleanBook, type LibraryStore } from "../library/store.js";

export class ContribError extends Error { constructor(public code: string, message: string, public status = 400) { super(message); } }

export const LICENCES: Record<string, { name: string; url: string; copies: boolean }> = {
  own: { name: "Shared by the person who made it", url: "", copies: true },
  pd: { name: "Public domain", url: "", copies: true },
  cc0: { name: "CC0 1.0 (public domain dedication)", url: "https://creativecommons.org/publicdomain/zero/1.0/", copies: true },
  by: { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/", copies: true },
  "by-sa": { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/", copies: true },
  "by-nc": { name: "CC BY-NC 4.0", url: "https://creativecommons.org/licenses/by-nc/4.0/", copies: true },
  "by-nc-sa": { name: "CC BY-NC-SA 4.0", url: "https://creativecommons.org/licenses/by-nc-sa/4.0/", copies: true },
  "gov-open": { name: "Government open publication", url: "", copies: true },
  permission: { name: "Shared with the rights holder's permission", url: "", copies: false },
};
export const BOARDS = ["CBSE", "Tamil Nadu State Board", "ICSE", "Other board", "General reading"];
export const LANGS = ["en", "ta", "hi", "te", "kn", "ml", "bn", "gu", "pa", "ur", "other"];
export const CANNED_REASONS: Record<string, string> = {
  copyright: "We could not confirm that this book is free to share. Please send it again with a link to the licence or permission.",
  personal: "The book contains personal information. Please remove those pages and send it again.",
  quality: "The scan or text is hard to read. A clearer copy would help.",
  duplicate: "This book is already in the E-Library.",
  unsuitable: "This book is not suitable for a children's library.",
  incomplete: "Some details are missing or look wrong. Please correct them and send it again.",
};

type Vals = Record<string, unknown>;
export interface ContribService {
  settings(): Promise<Vals>;
  /** a signed form token and the sum to show */
  challenge(): { token: string; question: string; issuedAt: number };
  submit(i: SubmitInput): Promise<Submission>;
  run(id: string): Promise<void>;
  waitIdle(): Promise<void>;
  decide(id: string, action: "approve" | "reject" | "changes", o: { by: string; reason?: string; canned?: string }): Promise<Submission>;
  withdraw(userId: string, id: string): Submission;
  mine(userId: string): Submission[];
  notices(userId: string): Notice[];
  markRead(userId: string, id?: string): void;
  setHidden(bookId: string, hidden: boolean, actor: string, note?: string): boolean;
  removeBook(bookId: string, actor: string): boolean;
  sweep(now?: Date): Promise<{ filesDeleted: number; expired: number; reportsDeleted: number }>;
  startSweeper(): void;
  profile(handle: string): { name: string; handle: string; books: Record<string, unknown>[] } | null;
  handleOf(userId: string): string;
  textOf(bookId: string): { pages: string[]; outline: { title: string; page: number; level: number }[] } | null;
  previewOf(id: string, page: number): { page: number; pages: number; text: string; flaggedPages: number[] } | null;
  search(q: string, limit?: number): { id: string; title: string; page: number; snippet: string }[];
  stats(): Record<string, unknown>;
  hashIp(ip: string): string;
}
export interface SubmitInput { userId: string; ip: string; source: "upload" | "link"; buffer?: Buffer; fileName?: string; link?: string; meta: Record<string, unknown>; honeypot?: string; token?: string; answer?: string; displayName?: string; consent?: boolean }
export interface ContribDeps { store: ContribStore; settings: SettingsService; library: LibraryStore; secret: string; libraryFilesDir: string; /** called after a book is published (the E-Library draws its page pictures) */ onPublished?: (bookId: string) => void; fetcher?: typeof safeFetch; extract?: typeof extractPdf; log?: (m: string) => void }

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "");
const bandOf = (cls: string): "4-6" | "7-9" | "10-12" | "13+" => { const n = Number(cls); if (!n) return "7-9"; return n <= 1 ? "4-6" : n <= 4 ? "7-9" : n <= 7 ? "10-12" : "13+"; };

export function createContribService(d: ContribDeps): ContribService {
  const { store } = d;

  // Repair public attribution for verified publisher PDFs submitted before evidence was available.
  let repairedCredit = false;
  for (const submission of store.db.submissions) {
    if (submission.status !== "published" || !submission.bookId) continue;
    const publisher = publisherBook(submission.sha256);
    const book = publisher ? store.db.books.find((entry) => entry.id === submission.bookId) : undefined;
    const previous = cleanBook(book, 0, false);
    if (!publisher || !book || !previous || previous.licence.code !== "own") continue;
    const licence = LICENCES[publisher.licence]!;
    book.title = publisher.title;
    book.authors = [publisher.author];
    book.licence = { code: publisher.licence, name: licence.name, url: licence.url };
    book.source = { ...previous.source, url: publisher.url };
    if (previous.contributed) book.contributed = { ...previous.contributed, licenceNote: "Licence verified on the publisher’s page." };
    repairedCredit = true;
  }
  if (repairedCredit) store.save();
  const log = d.log ?? (() => {});
  const hashIp = (ip: string) => hashOf(d.secret, `ip:${ip}`);
  const handleOf = (userId: string) => hashOf(d.secret, `user:${userId}`).slice(0, 12);
  const used = new Set<string>();
  let queue: Promise<void> = Promise.resolve();
  const textCache = new Map<string, { pages: string[]; outline: { title: string; page: number; level: number }[] }>();

  const settings = async (): Promise<Vals> => (await d.settings.all()) as Vals;
  const sign = (p: string) => createHmac("sha256", d.secret).update(`contrib-form|${p}`).digest("hex").slice(0, 32);
  const setStatus = (s: Submission, status: SubStatus, note: string) => { s.status = status; s.updatedAt = new Date().toISOString(); s.history.push({ at: s.updatedAt, status, note: note.slice(0, 200) }); store.save(); };

  function challenge() {
    const a = 2 + Math.floor(Math.random() * 8), b = 2 + Math.floor(Math.random() * 8), now = Date.now(), nonce = Math.random().toString(36).slice(2, 10);
    const p = `${now}.${a + b}.${nonce}`;
    return { token: `${p}.${sign(p)}`, question: `What is ${a} + ${b}?`, issuedAt: now };
  }
  function checkChallenge(v: Vals, token?: string, answer?: string) {
    if (v["contrib.challenge.enabled"] === false) return;
    const bad = () => new ContribError("challenge", "Please answer the quick sum again and send once more.");
    const parts = String(token ?? "").split(".");
    if (parts.length !== 4) throw bad();
    const p = parts.slice(0, 3).join(".");
    const sig = Buffer.from(parts[3]!), want = Buffer.from(sign(p));
    if (sig.length !== want.length || !timingSafeEqual(sig, want)) throw bad();
    const age = (Date.now() - Number(parts[0])) / 1000;
    if (!(age < 3600)) throw new ContribError("challenge", "The form was open too long. Please reload the page and try again.");
    if (age < Number(v["contrib.minSecondsToSubmit"] ?? 8)) throw new ContribError("too_fast", "That was very quick. Please check the details and send again in a few seconds.");
    if (Number(answer) !== Number(parts[1]) || used.has(parts[2]!)) throw bad();
    used.add(parts[2]!);
    if (used.size > 5000) used.clear();
  }

  function cleanMeta(raw: Record<string, unknown>, v: Vals): Declared {
    const allowed = String(v["contrib.licences.allowed"] ?? "").split(",").map((x) => x.trim()).filter((x) => LICENCES[x]);
    const licence = str(raw.licence, 20);
    if (!LICENCES[licence] || !allowed.includes(licence)) throw new ContribError("licence", "Please choose one of the licence options.");
    const title = str(raw.title, 200);
    if (title.length < 3) throw new ContribError("title", "Please give the book a title (at least 3 letters).");
    const language = LANGS.includes(str(raw.language, 8)) ? str(raw.language, 8) : "en";
    const board = BOARDS.includes(str(raw.board, 40)) ? str(raw.board, 40) : "General reading";
    const classLevel = /^(?:[1-9]|1[0-2])$/.test(str(raw.classLevel, 3)) ? str(raw.classLevel, 3) : "";
    let sourceUrl = str(raw.sourceUrl, 500);
    if (sourceUrl && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(sourceUrl)) throw new ContribError("source", "The source link does not look like a web link.");
    const licenceProof = str(raw.licenceProof, 1200);
    if (licence !== "own" && v["contrib.requireProof"] !== false) {
      if (!sourceUrl) throw new ContribError("source", "Please paste the link of the page where this book was published.");
      if (licenceProof.length < 20) throw new ContribError("proof", "Please explain in a sentence or two how you know the book is free to share (for example, quote the licence line from the page).");
    }
    const attribution = raw.attribution === "anonymous" && v["contrib.anonymous.allowed"] !== false ? "anonymous" : "name";
    return { title, author: str(raw.author, 120), board, classLevel, subject: str(raw.subject, 60), language, licence, sourceUrl, licenceProof, attribution };
  }

  async function submit(i: SubmitInput): Promise<Submission> {
    const v = await settings();
    if (v["feature.library"] !== true || v["contrib.enabled"] !== true) throw new ContribError("off", "Contributions are switched off right now.", 404);
    if (i.honeypot && v["contrib.honeypot.enabled"] !== false) throw new ContribError("honeypot", "Thank you.", 202); // dropped silently by the route
    if (!i.consent) throw new ContribError("consent", "Please tick the box to confirm you are allowed to share this book.");
    const guest = !i.userId || i.userId === "guest";
    if (guest && v["contrib.guests.allowed"] !== true) throw new ContribError("signin", "Please sign in to contribute a book.", 401);
    const ipHash = hashIp(i.ip);
    if (store.isBlocked("ip", ipHash) || (!guest && store.isBlocked("user", i.userId))) throw new ContribError("blocked", "Contributions from this account or address have been switched off. Please contact us if you think this is a mistake.", 403);
    checkChallenge(v, i.token, i.answer);
    if (i.source === "link" && v["contrib.link.enabled"] !== true) throw new ContribError("link_off", "Adding by link is switched off. Please upload the PDF.");
    const meta = cleanMeta(i.meta, v);
    const displayName = meta.attribution === "anonymous" ? "Anonymous" : str(i.displayName, 40) || "A SharpStudy parent";
    const terms = store.terms();
    if (scanContent([`${meta.title} ${meta.author} ${displayName} ${meta.subject}`], terms, 99).score >= 12) throw new ContribError("title_content", "Please use a clean title and name.");
    // limits
    const ukey = guest ? `i:${ipHash}` : `u:${i.userId}`;
    if (store.count(ukey) >= Number(v["contrib.perUserPerDay"] ?? 3) && !guest) throw new ContribError("daily_limit", "You have reached today's limit for contributions. Please come back tomorrow.", 429);
    if (store.count(`i:${ipHash}`) >= Number(v["contrib.perIpPerDay"] ?? 5)) throw new ContribError("daily_limit", "Too many contributions came from this internet connection today. Please try again tomorrow.", 429);
    const open = store.db.submissions.filter((s) => s.userId === i.userId && ["received", "checking", "in_review", "changes_requested"].includes(s.status)).length;
    if (!guest && open >= Number(v["contrib.openPerUser"] ?? 10)) throw new ContribError("open_limit", "You already have many books waiting. Please wait for them to be checked first.", 429);

    const maxBytes = Number(v["contrib.maxMB"] ?? 60) * 1024 * 1024;
    let buffer: Buffer | undefined;
    if (i.source === "upload") {
      buffer = i.buffer;
      if (!buffer || !buffer.length) throw new ContribError("no_file", "Please choose a PDF file.");
      if (buffer.length > maxBytes) throw new ContribError("too_big", `That file is larger than ${Math.round(maxBytes / 1048576)} MB.`, 413);
      if (buffer.subarray(0, 1024).indexOf("%PDF-") === -1) throw new ContribError("not_pdf", "That does not look like a PDF file. Please choose a .pdf file.", 415);
    } else {
      const link = str(i.link, 600);
      if (!link) throw new ContribError("no_link", "Please paste the link to the PDF.");
    }
    const id = `s-${newId("").slice(0, 12)}`;
    const now = new Date().toISOString();
    const sub: Submission = { id, userId: i.userId || "guest", displayName, createdAt: now, updatedAt: now, status: "received", source: i.source, sourceLink: i.source === "link" ? str(i.link, 600) : "", meta, fileName: str(i.fileName, 120), bytes: buffer?.length ?? 0, sha256: "", report: null, reasons: [], decision: null, bookId: "", ipHash, fileKept: false, history: [{ at: now, status: "received", note: "Received" }], adminNote: "" };
    if (buffer) { sub.sha256 = createHash("sha256").update(buffer).digest("hex"); store.writeQuarantine(id, buffer); sub.fileKept = true; }
    store.db.submissions.push(sub);
    store.bump(ukey); if (ukey !== `i:${ipHash}`) store.bump(`i:${ipHash}`);
    store.stat("received"); store.audit(guest ? "guest" : "user", "submitted", id, `${i.source}`);
    store.save();
    queue = queue.then(() => run(id)).catch((e) => log(`contrib process failed: ${(e as Error).message}`));
    return sub;
  }

  async function run(id: string): Promise<void> {
    const sub = store.find(id);
    if (!sub || sub.status !== "received") return;
    const v = await settings();
    setStatus(sub, "checking", "Checking");
    const reject = (why: string[], note: string) => { sub.reasons = why; finishReject(sub, v, "system", note); };
    try {
      if (sub.source === "link") {
        try {
          const r = await (d.fetcher ?? safeFetch)(sub.sourceLink, { rules: { httpsOnly: v["contrib.link.httpsOnly"] !== false, allowDomains: parseDomains(String(v["contrib.link.allowDomains"] ?? "")), denyDomains: parseDomains(String(v["contrib.link.denyDomains"] ?? "")) }, maxBytes: Number(v["contrib.link.maxMB"] ?? 60) * 1048576, timeoutMs: Number(v["contrib.link.timeoutSec"] ?? 30) * 1000, maxRedirects: Number(v["contrib.link.maxRedirects"] ?? 3), respectRobots: v["contrib.link.respectRobots"] !== false });
          sub.sha256 = createHash("sha256").update(r.buffer).digest("hex");
          sub.bytes = r.buffer.length; sub.fileName = decodeURIComponent(new URL(r.finalUrl).pathname.split("/").pop() || "book.pdf").slice(0, 120);
          store.writeQuarantine(id, r.buffer); sub.fileKept = true;
          if (!sub.meta.sourceUrl) sub.meta.sourceUrl = r.finalUrl;
        } catch (e) {
          const msg = e instanceof FetchError ? e.message : "We could not download that link.";
          return reject([msg], `Link failed: ${e instanceof FetchError ? e.code : "error"}`);
        }
      }
      const buf = store.readQuarantine(id);
      if (!buf) return reject(["The file was not received. Please try again."], "No file");
      const maxMB = Number(v["contrib.maxMB"] ?? 60);
      if (buf.length > maxMB * 1048576) return reject([`That file is larger than ${maxMB} MB.`], "Too big");
      const scan = await scanContributionPdf(buf);
      const publisher = scan.ok ? publisherBook(sub.sha256) : undefined;
      if (publisher?.licence === sub.meta.licence) {
        sub.meta.author = publisher.author;
        sub.meta.sourceUrl = publisher.url;
        sub.meta.licenceProof = "Free Kids Books confirms the author's CC BY-SA licence on the publication page.";
      }
      const ex: Extracted = scan.ok
        ? await (d.extract ?? extractPdf)(buf, { maxPages: Math.min(Number(v["contrib.maxPages"] ?? 600) + 1, 1200), maxMs: 90_000, cover: true })
        : { engine: false, pageCount: 0, pages: [], outline: [], info: { title: "", author: "" }, coverJpeg: null };
      const existing: ExistingBook[] = [
        ...d.library.list().books.map((b) => ({ id: b.id, title: b.title, authors: b.authors })),
        ...store.db.submissions.filter((s) => s.id !== id && s.report && ["published", "in_review", "checking", "changes_requested"].includes(s.status)).map((s) => ({ id: s.id, title: s.meta.title, authors: s.meta.author ? [s.meta.author] : [], sha256: s.sha256, simhash: s.report!.simhash })),
      ];
      const report = reviewSubmission({ source: sub.source, meta: sub.meta, scan, ex, sha256: sub.sha256, bytes: buf.length, values: v, terms: store.terms(), existing });
      sub.report = report;
      if (report.outcome === "reject") { sub.reasons = report.reasons; return finishReject(sub, v, "system", "Failed checks"); }
      // keep what the reader needs next to the quarantined file (never in a public folder)
      const qp = store.quarantinePath(id)!;
      writeFileSync(`${qp}.extract.gz`, gzipSync(JSON.stringify({ pages: ex.pages.map((p) => p.slice(0, 6000)), outline: ex.outline, info: ex.info, pageCount: ex.pageCount })));
      if (ex.coverJpeg) writeFileSync(`${qp}.cover`, ex.coverJpeg);
      if (report.outcome === "approve") { await publish(sub, "auto", v); return; }
      sub.reasons = report.reasons;
      setStatus(sub, "in_review", "Waiting for a person to review");
      store.audit("system", "queued_for_review", id, `score ${report.score}`);
      store.notify(sub.userId, `“${sub.meta.title}” passed the automatic checks and is waiting for a person to review it.`);
      store.save();
    } catch (e) {
      log(`contrib ${id}: ${(e as Error).message}`);
      sub.reasons = ["Something went wrong while checking this book. A person will look at it."];
      setStatus(sub, "in_review", "Checking failed, needs a person");
    }
  }

  function finishReject(sub: Submission, v: Vals, by: "auto" | "admin" | "system", note: string) {
    const days = Number(v["contrib.retention.rejectedDays"] ?? 0);
    if (days <= 0) { store.removeQuarantine(sub.id); sub.fileKept = false; }
    if (sub.report) { sub.report.pii = sub.report.pii ? { counts: sub.report.pii.counts, pages: sub.report.pii.pages, samples: {} } : null; }
    sub.decision = { by, at: new Date().toISOString(), reason: note };
    setStatus(sub, "rejected", note);
    store.stat("rejected"); store.audit(by, "rejected", sub.id, note);
    store.notify(sub.userId, `“${sub.meta.title}” could not be added. ${sub.reasons[0] ?? ""}`.trim());
    store.save();
  }

  async function publish(sub: Submission, by: string, v: Vals): Promise<void> {
    const id = sub.id, bookId = `c-${id.slice(2)}`;
    let buf = store.readQuarantine(id);
    if (!buf) throw new ContribError("gone", "The file is no longer available.", 410);
    const qp = store.quarantinePath(id)!;
    let extra: { pages: string[]; outline: unknown[]; info: { title: string; author: string }; pageCount: number } | null = null;
    try { extra = JSON.parse(gunzipSync(readFileSync(`${qp}.extract.gz`)).toString("utf8")); } catch { /* re-read below */ }
    let cover: Buffer | null = existsSync(`${qp}.cover`) ? readFileSync(`${qp}.cover`) : null;
    if (!extra) {
      const ex = await (d.extract ?? extractPdf)(buf, { maxPages: Math.min(Number(v["contrib.maxPages"] ?? 600), 1200), maxMs: 90_000, cover: true });
      extra = { pages: ex.pages.map((p) => p.slice(0, 6000)), outline: ex.outline, info: ex.info, pageCount: ex.pageCount };
      cover = ex.coverJpeg;
    }
    buf = await sanitize(buf, sub.meta);
    const extracted = gzipSync(JSON.stringify({ pages: extra.pages, outline: extra.outline }));
    if (libraryBytes(d.libraryFilesDir) + buf.length + (cover?.length ?? 0) + extracted.length > libraryCap(v)) {
      throw new ContribError("library_full", "The E-Library has reached its storage limit. The book is held for review.", 409);
    }
    const pdfDir = join(d.libraryFilesDir, "pdf"), coverDir = join(d.libraryFilesDir, "cover");
    mkdirSync(pdfDir, { recursive: true }); mkdirSync(coverDir, { recursive: true }); mkdirSync(store.dirs.text, { recursive: true });
    const tmp = join(pdfDir, `.${bookId}.tmp`);
    writeFileSync(tmp, buf); renameSync(tmp, join(pdfDir, `${bookId}.pdf`));
    if (cover) writeFileSync(join(coverDir, `${bookId}.jpg`), cover);
    if (extra.pages.some((p) => p.trim())) writeFileSync(join(store.dirs.text, `${bookId}.json.gz`), extracted);
    const m = sub.meta, lic = LICENCES[m.licence]!;
    const dl = String(v["contrib.publish.download"] ?? "licence");
    const tags = [m.board !== "General reading" ? m.board : "", m.classLevel ? `Class ${m.classLevel}` : "", m.subject, "Community"].filter(Boolean);
    store.db.books.push({
      id: bookId, title: m.title, authors: m.author ? [m.author] : [], language: m.language, ageBand: bandOf(m.classLevel), ageSource: "guess", pages: extra.pageCount || null,
      licence: { code: m.licence, name: lic.name, url: lic.url }, source: { site: "community", siteName: "Community contribution", url: m.sourceUrl }, tags, addedAt: new Date().toISOString(),
      contributed: { by: sub.displayName, handle: m.attribution === "anonymous" ? "" : handleOf(sub.userId), submissionId: id, download: dl === "always" || (dl === "licence" && lic.copies), hasText: extra.pages.some((p) => p.trim()), hasOutline: extra.outline.length > 0, licenceNote: m.licence === "own" ? "Shared by the contributor" : m.licenceProof.slice(0, 300) },
    });
    sub.bookId = bookId; sub.decision = { by: by === "auto" ? "auto" : "admin", at: new Date().toISOString(), reason: by === "auto" ? "All checks passed" : "Approved" };
    sub.reasons = []; sub.fileKept = false;
    store.removeQuarantine(id);
    setStatus(sub, "published", by === "auto" ? "Published automatically" : "Published by a reviewer");
    store.stat("published"); store.audit(by, "published", id, bookId);
    try { d.onPublished?.(bookId); } catch { /* the sweep will notice the new book anyway */ }
    store.notify(sub.userId, `Your book “${m.title}” is now in the E-Library. Thank you!`, `/library?book=${bookId}`);
    store.save();
  }

  /** Removes the author/title/producer fields and the XMP block, and any start-up action, with pdf-lib when it is installed. Falls back to the original file. */
  async function sanitize(buf: Buffer, meta: Declared): Promise<Buffer> {
    try {
      const mod = (await import("pdf-lib")) as typeof import("pdf-lib");
      const doc = await mod.PDFDocument.load(buf, { updateMetadata: false, throwOnInvalidObject: false });
      doc.setTitle(meta.title); doc.setAuthor(meta.author || ""); doc.setSubject(""); doc.setKeywords([]); doc.setProducer("SharpStudy E-Library"); doc.setCreator("SharpStudy E-Library");
      const cat = doc.catalog;
      for (const k of ["Metadata", "OpenAction", "AA", "PieceInfo", "Names"]) cat.delete(mod.PDFName.of(k));
      const out = Buffer.from(await doc.save({ useObjectStreams: true }));
      return out.length > buf.length * 1.5 + 4096 || doc.getPageCount() < 1 ? buf : out;
    } catch { return buf; }
  }

  async function decide(id: string, action: "approve" | "reject" | "changes", o: { by: string; reason?: string; canned?: string }): Promise<Submission> {
    const sub = store.find(id);
    if (!sub) throw new ContribError("not_found", "Submission not found", 404);
    if (!["in_review", "received", "checking", "changes_requested", "failed"].includes(sub.status)) throw new ContribError("final", "That submission is already decided.", 409);
    const v = await settings();
    const msg = str(o.reason, 400) || (o.canned ? CANNED_REASONS[o.canned] ?? "" : "");
    if (action === "approve") {
      if (!store.quarantinePath(id) || !store.readQuarantine(id)) throw new ContribError("gone", "The file is no longer stored, so it cannot be approved.", 410);
      await publish(sub, o.by, v);
    } else if (action === "reject") {
      if (!msg) throw new ContribError("reason", "Please give a reason or choose a ready-made one.");
      sub.reasons = [msg]; finishReject(sub, v, "admin", msg);
    } else {
      if (!msg) throw new ContribError("reason", "Please say what should be changed.");
      sub.reasons = [msg]; sub.decision = { by: "admin", at: new Date().toISOString(), reason: msg };
      setStatus(sub, "changes_requested", msg); store.audit(o.by, "asked_for_changes", id, msg);
      store.notify(sub.userId, `Please update “${sub.meta.title}”: ${msg}`);
      store.save();
    }
    store.audit(o.by, action, id, msg);
    store.save();
    return sub;
  }

  function withdraw(userId: string, id: string) {
    const sub = store.find(id);
    if (!sub || sub.userId !== userId) throw new ContribError("not_found", "Submission not found", 404);
    if (!["received", "checking", "in_review", "changes_requested"].includes(sub.status)) throw new ContribError("final", "That submission is already finished.", 409);
    store.removeQuarantine(id); sub.fileKept = false;
    setStatus(sub, "withdrawn", "Withdrawn by the contributor");
    store.audit("user", "withdrawn", id);
    return sub;
  }

  function setHidden(bookId: string, hidden: boolean, actor: string, note = "") {
    const row = store.db.books.find((b) => b.id === bookId);
    if (!row) return false;
    if (hidden) row.hidden = true; else delete row.hidden;
    store.audit(actor, hidden ? "hid_book" : "showed_book", bookId, note); store.save();
    return true;
  }
  function removeBook(bookId: string, actor: string) {
    const i = store.db.books.findIndex((b) => b.id === bookId);
    if (i < 0 || !/^c-[a-f0-9]{12}$/.test(bookId)) return false;
    store.db.books.splice(i, 1);
    for (const p of [join(d.libraryFilesDir, "pdf", `${bookId}.pdf`), join(d.libraryFilesDir, "cover", `${bookId}.jpg`), join(store.dirs.text, `${bookId}.json.gz`)]) try { rmSync(p, { force: true }); } catch { /* ignore */ }
    textCache.delete(bookId);
    store.audit(actor, "removed_book", bookId); store.save();
    return true;
  }

  async function sweep(now = new Date()) {
    const v = await settings();
    const day = 864e5;
    let filesDeleted = 0, expired = 0, reportsDeleted = 0;
    const rejDays = Number(v["contrib.retention.rejectedDays"] ?? 0), repDays = Number(v["contrib.retention.reportDays"] ?? 180), pendDays = Number(v["contrib.retention.pendingDays"] ?? 30), noticeDays = Number(v["contrib.notifications.keepDays"] ?? 60);
    for (const s of store.db.submissions) {
      const age = (now.getTime() - Date.parse(s.updatedAt)) / day;
      if (s.status === "rejected" && s.fileKept && age >= rejDays) { store.removeQuarantine(s.id); s.fileKept = false; filesDeleted++; }
      if (["in_review", "changes_requested", "received"].includes(s.status) && age >= pendDays) {
        s.reasons = ["This submission was not finished in time and was removed."]; store.removeQuarantine(s.id); s.fileKept = false; setStatus(s, "rejected", "Expired"); expired++; filesDeleted++;
      }
    }
    const before = store.db.submissions.length;
    store.db.submissions = store.db.submissions.filter((s) => !(["rejected", "withdrawn"].includes(s.status) && (now.getTime() - Date.parse(s.updatedAt)) / day >= repDays));
    reportsDeleted = before - store.db.submissions.length;
    store.db.notices = store.db.notices.filter((n) => (now.getTime() - Date.parse(n.at)) / day < noticeDays);
    store.prune(now);
    if (filesDeleted || reportsDeleted || expired) store.save();
    return { filesDeleted, expired, reportsDeleted };
  }

  function loadText(bookId: string): { pages: string[]; outline: { title: string; page: number; level: number }[] } | null {
    if (textCache.has(bookId)) return textCache.get(bookId)!;
    if (!/^c-[a-f0-9]{12}$/.test(bookId)) return null;
    try {
      const j = JSON.parse(gunzipSync(readFileSync(join(store.dirs.text, `${bookId}.json.gz`))).toString("utf8")) as { pages: string[]; outline?: { title: string; page: number; level: number }[] };
      const v = { pages: j.pages, outline: j.outline ?? [] };
      textCache.set(bookId, v);
      if (textCache.size > 40) textCache.delete(textCache.keys().next().value as string);
      return v;
    } catch { return null; }
  }
  const visible = (b: Record<string, unknown>) => !b.hidden && d.library.filePath(String(b.id)) !== null;

  return {
    settings, challenge, submit, run, decide, withdraw, setHidden, removeBook, sweep, hashIp, handleOf,
    waitIdle: () => queue,
    mine: (userId) => store.db.submissions.filter((s) => s.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    notices: (userId) => store.db.notices.filter((n) => n.userId === userId).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 50),
    markRead(userId, id) { for (const n of store.db.notices) if (n.userId === userId && (!id || n.id === id)) n.read = true; store.save(); },
    startSweeper() { void sweep().catch(() => {}); const t = setInterval(() => void sweep().catch(() => {}), 6 * 3600 * 1000); t.unref?.(); },
    profile(handle) {
      if (!/^[a-f0-9]{12}$/.test(handle)) return null;
      const books = store.db.books.filter((b) => (b.contributed as { handle?: string } | undefined)?.handle === handle && visible(b));
      if (!books.length) return null;
      return { name: (books[0]!.contributed as { by: string }).by, handle, books: books.map((b) => ({ id: b.id, title: b.title, tags: b.tags, addedAt: b.addedAt })) };
    },
    textOf: (bookId) => { const row = store.db.books.find((b) => b.id === bookId); return row && visible(row) ? loadText(bookId) : null; },
    previewOf(id, page) {
      const qp = store.quarantinePath(id);
      if (!qp) return null;
      try {
        const j = JSON.parse(gunzipSync(readFileSync(`${qp}.extract.gz`)).toString("utf8")) as { pages: string[] };
        const flagged = store.find(id)?.report?.pii?.pages ?? {};
        const fl = [...new Set(Object.values(flagged).flat() as number[])].sort((a, b) => a - b);
        const n = Math.min(Math.max(1, Math.floor(page) || 1), j.pages.length);
        return { page: n, pages: j.pages.length, text: maskPii(j.pages[n - 1] ?? "").slice(0, 4000), flaggedPages: fl };
      } catch { return null; }
    },
    search(q, limit = 20) {
      const needle = q.trim().toLowerCase();
      if (needle.length < 3) return [];
      const out: { id: string; title: string; page: number; snippet: string }[] = [];
      for (const b of store.db.books) {
        if (!visible(b) || out.length >= limit) continue;
        const pages = loadText(String(b.id))?.pages;
        if (!pages) continue;
        let n = 0;
        for (let i = 0; i < pages.length && n < 3 && out.length < limit; i++) {
          const t = pages[i]!, at = t.toLowerCase().indexOf(needle);
          if (at < 0) continue;
          n++;
          out.push({ id: String(b.id), title: String(b.title), page: i + 1, snippet: (at > 40 ? "…" : "") + t.slice(Math.max(0, at - 40), at + needle.length + 80).replace(/\s+/g, " ") });
        }
      }
      return out;
    },
    stats() {
      const by: Record<string, number> = {};
      for (const s of store.db.submissions) by[s.status] = (by[s.status] ?? 0) + 1;
      const checks: Record<string, { pass: number; warn: number; fail: number }> = {};
      for (const s of store.db.submissions) for (const c of s.report?.checks ?? []) { const x = (checks[c.id] ??= { pass: 0, warn: 0, fail: 0 }); if (c.status === "pass") x.pass++; else if (c.status === "warn") x.warn++; else if (c.status === "fail") x.fail++; }
      const days: Record<string, number> = {};
      for (const s of store.db.submissions) { const k = s.createdAt.slice(0, 10); days[k] = (days[k] ?? 0) + 1; }
      return { totals: { ...store.db.stats }, byStatus: by, checks, perDay: Object.entries(days).sort().slice(-30), published: store.db.books.length, openTakedowns: store.db.takedowns.filter((t) => t.status === "open").length, openProblems: store.db.problems.filter((t) => t.status === "open").length, waiting: by.in_review ?? 0 };
    },
  };
}
export { cleanTerms };
