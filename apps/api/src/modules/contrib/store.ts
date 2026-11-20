import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { cleanTerms, type TermLists } from "./detectors.js";
import type { Declared, Report } from "./review.js";

export type SubStatus = "received" | "checking" | "in_review" | "changes_requested" | "published" | "rejected" | "withdrawn" | "failed";
export interface Submission {
  id: string;
  userId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  status: SubStatus;
  source: "upload" | "link";
  sourceLink: string;
  meta: Declared;
  fileName: string;
  bytes: number;
  sha256: string;
  report: Report | null;
  /** friendly sentences shown to the contributor */
  reasons: string[];
  decision: { by: "auto" | "admin" | "system"; at: string; reason: string } | null;
  bookId: string;
  ipHash: string;
  fileKept: boolean;
  history: { at: string; status: SubStatus; note: string }[];
  /** the admin's private notes */
  adminNote: string;
}
export interface Notice { id: string; userId: string; at: string; text: string; link: string; read: boolean }
export interface Takedown { id: string; bookId: string; at: string; name: string; email: string; relationship: string; message: string; status: "open" | "upheld" | "dismissed"; decidedAt: string; ipHash: string }
export interface ProblemReport { id: string; bookId: string; at: string; kind: string; message: string; status: "open" | "done"; ipHash: string }
export interface AuditEntry { at: string; actor: string; action: string; target: string; note: string }
export interface Blocked { key: string; kind: "user" | "ip"; at: string; note: string }
export interface Db {
  version: 1;
  submissions: Submission[];
  notices: Notice[];
  takedowns: Takedown[];
  problems: ProblemReport[];
  blocked: Blocked[];
  audit: AuditEntry[];
  /** per day counters: "2026-11-17|u:<id>" / "2026-11-17|i:<hash>" */
  counters: Record<string, number>;
  /** the book rows that the E-Library merges in */
  books: Record<string, unknown>[];
  stats: Record<string, number>;
}
const EMPTY = (): Db => ({ version: 1, submissions: [], notices: [], takedowns: [], problems: [], blocked: [], audit: [], counters: {}, books: [], stats: {} });

export const newId = (prefix: string) => `${prefix}${randomBytes(6).toString("hex")}`;
export const hashOf = (secret: string, v: string) => createHash("sha256").update(`${secret}|${v}`).digest("hex").slice(0, 24);
export const today = () => new Date().toISOString().slice(0, 10);

export interface ContribStore {
  dirs: { root: string; quarantine: string; db: string; contributed: string; text: string };
  db: Db;
  save(): void;
  terms(): TermLists;
  saveTerms(t: unknown): TermLists;
  audit(actor: string, action: string, target: string, note?: string): void;
  notify(userId: string, text: string, link?: string): void;
  bump(key: string): number;
  count(key: string): number;
  stat(name: string, by?: number): void;
  find(id: string): Submission | undefined;
  quarantinePath(id: string): string | null;
  writeQuarantine(id: string, buf: Buffer): string;
  readQuarantine(id: string): Buffer | null;
  removeQuarantine(id: string): void;
  isBlocked(kind: "user" | "ip", key: string): boolean;
  prune(now?: Date): { removed: number };
}

function readJson<T>(p: string, d: T): T { try { return JSON.parse(readFileSync(p, "utf8")) as T; } catch { return d; } }
function writeJson(p: string, data: unknown) { mkdirSync(dirname(p), { recursive: true }); const t = `${p}.tmp-${process.pid}`; writeFileSync(t, JSON.stringify(data) + "\n"); renameSync(t, p); }

/** Everything the contribution feature remembers lives in a few small JSON files and a quarantine folder. Uploads are never placed in a folder the website serves. */
export function createContribStore(root: string, libraryFilesDir: string): ContribStore {
  const dirs = { root: resolve(root), quarantine: resolve(root, "quarantine"), db: resolve(root, "contrib.json"), contributed: resolve(root, "contributed.json"), text: resolve(libraryFilesDir, "text") };
  mkdirSync(dirs.quarantine, { recursive: true });
  const db: Db = { ...EMPTY(), ...readJson<Partial<Db>>(dirs.db, {}) };
  for (const k of Object.keys(EMPTY()) as (keyof Db)[]) if (db[k] === undefined) (db as unknown as Record<string, unknown>)[k] = (EMPTY() as unknown as Record<string, unknown>)[k];
  const termsPath = join(dirs.root, "terms.json");
  let termsCache: TermLists | null = null;

  const save = () => { writeJson(dirs.db, db); writeJson(dirs.contributed, { version: 1, books: db.books }); };
  const qPath = (id: string) => { if (!/^s-[a-f0-9]{12}$/.test(id)) return null; const p = resolve(dirs.quarantine, `${id}.pdf`); return p.startsWith(dirs.quarantine + sep) ? p : null; };
  if (!existsSync(dirs.contributed)) writeJson(dirs.contributed, { version: 1, books: db.books });

  return {
    dirs, db, save,
    terms() { return (termsCache ??= cleanTerms(readJson<unknown>(termsPath, null))); },
    saveTerms(t) { termsCache = cleanTerms(t); writeJson(termsPath, termsCache); return termsCache; },
    audit(actor, action, target, note = "") { db.audit.push({ at: new Date().toISOString(), actor: actor.slice(0, 60), action, target: target.slice(0, 80), note: note.slice(0, 300) }); if (db.audit.length > 5000) db.audit.splice(0, db.audit.length - 5000); },
    notify(userId, text, link = "/library/my-contributions") { if (!userId || userId === "guest") return; db.notices.push({ id: newId("n-"), userId, at: new Date().toISOString(), text: text.slice(0, 300), link, read: false }); },
    bump(key) { const k = `${today()}|${key}`; db.counters[k] = (db.counters[k] ?? 0) + 1; return db.counters[k]!; },
    count(key) { return db.counters[`${today()}|${key}`] ?? 0; },
    stat(name, by = 1) { db.stats[name] = (db.stats[name] ?? 0) + by; },
    find: (id) => db.submissions.find((s) => s.id === id),
    quarantinePath: qPath,
    writeQuarantine(id, buf) { const p = qPath(id); if (!p) throw new Error("bad id"); writeFileSync(p, buf, { mode: 0o600 }); return p; },
    readQuarantine(id) { const p = qPath(id); try { return p ? readFileSync(p) : null; } catch { return null; } },
    removeQuarantine(id) { const p = qPath(id); if (p) for (const f of [p, `${p}.cover`, `${p}.extract.gz`]) try { rmSync(f, { force: true }); } catch { /* already gone */ } },
    isBlocked: (kind, key) => db.blocked.some((b) => b.kind === kind && b.key === key),
    prune(now = new Date()) {
      let removed = 0;
      for (const k of Object.keys(db.counters)) if (k.slice(0, 10) < new Date(now.getTime() - 3 * 864e5).toISOString().slice(0, 10)) { delete db.counters[k]; removed++; }
      return { removed };
    },
  };
}
