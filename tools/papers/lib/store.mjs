// Compact storage: content/papers/<id>.json.gz (one paper) + content/papers/index.json (one line per paper) + tools/papers/state.json.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, "../../..");
export const PAPERS_DIR = process.env.PAPERS_DIR ?? join(ROOT, "content/papers");
export const STATE_FILE = process.env.PAPERS_STATE ?? join(here, "../state.json");
export const sha = (x) => createHash("sha1").update(x).digest("hex");
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);

const BOARDS = ["cbse", "matric", "stateboard", "ncert"], KINDS = ["sample", "previous", "model", "quiz", "worksheet", "test"], TYPES = ["mcq", "short", "long", "fill", "tf"];
/** same limits as PaperSchema in packages/shared/src/papers.ts (the API drops a file that fails them) */
export function validate(p) {
  const e = [];
  if (p.v !== 1) e.push("v");
  if (!/^[a-z0-9][a-z0-9-]{3,100}$/.test(p.id ?? "")) e.push("id");
  if (!p.title || p.title.length < 3 || p.title.length > 200) e.push("title");
  if (!BOARDS.includes(p.board)) e.push("board");
  if (!Number.isInteger(p.cls) || p.cls < 1 || p.cls > 12) e.push("cls");
  if (!p.subject || p.subject.length < 2) e.push("subject");
  if (!KINDS.includes(p.kind)) e.push("kind");
  try { new URL(p.source?.url); } catch { e.push("source.url"); }
  if (!Array.isArray(p.sections) || !p.sections.length || p.sections.length > 20) e.push("sections");
  for (const s of p.sections ?? []) {
    if (!s.questions?.length || s.questions.length > 200) e.push("section questions");
    for (const q of s.questions ?? []) {
      if (!TYPES.includes(q.type) || !q.text || q.text.length > 4000 || q.n.length > 12) e.push(`question ${q.n}`);
      if (q.options && (q.options.length > 8 || q.options.some((o) => o.length > 600))) e.push(`options ${q.n}`);
    }
  }
  return e;
}
/** "hi" when most of the letters in the paper are Devanagari (Hindi), otherwise "en". Used for the Hindi question papers tab. */
export function detectLang(p) {
  const text = [p.title, ...p.sections.flatMap((s) => s.questions.flatMap((q) => [q.text, ...(q.options ?? [])]))].join(" ");
  const dev = (text.match(/[\u0900-\u097F]/g) ?? []).length, lat = (text.match(/[A-Za-z]/g) ?? []).length;
  return dev > 20 && dev > lat * 0.4 ? "hi" : "en";
}
export function indexEntry(p, added = new Date().toISOString().slice(0, 10)) {
  const qs = p.sections.flatMap((s) => s.questions);
  return { id: p.id, lang: detectLang(p), title: p.title, board: p.board, cls: p.cls, subject: p.subject, ...(p.year ? { year: p.year } : {}), kind: p.kind, questions: qs.length, mcq: qs.filter((q) => q.type === "mcq" || q.type === "tf").length, keyed: qs.filter((q) => q.answer || q.model).length, ...(p.maxMarks ?? qs.reduce((a, q) => a + (q.marks ?? 0), 0) ? { maxMarks: p.maxMarks ?? qs.reduce((a, q) => a + (q.marks ?? 0), 0) } : {}), source: { site: p.source.site, url: p.source.url }, chapters: [...new Set(qs.map((q) => q.chapter).filter(Boolean))].sort(), added };
}
export function readIndex(dir = PAPERS_DIR) {
  try { const j = JSON.parse(readFileSync(join(dir, "index.json"), "utf8")); if (Array.isArray(j.papers)) return j; } catch { /* first run */ }
  return { updated: "", papers: [] };
}
export function dirSizeMB(dir = PAPERS_DIR) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).reduce((a, f) => a + statSync(join(dir, f)).size, 0) / 1048576;
}
/** @returns {"saved"|"duplicate"|string[]} */
export function savePaper(paper, dir = PAPERS_DIR) {
  const errs = validate(paper); if (errs.length) return errs;
  mkdirSync(dir, { recursive: true });
  const idx = readIndex(dir);
  if (idx.papers.some((p) => p.id === paper.id) || existsSync(join(dir, `${paper.id}.json.gz`))) return "duplicate";
  const tmp = join(dir, `.${paper.id}.tmp`);
  writeFileSync(tmp, gzipSync(JSON.stringify(paper), { level: 9 })); renameSync(tmp, join(dir, `${paper.id}.json.gz`));
  idx.papers.push(indexEntry(paper)); idx.updated = new Date().toISOString();
  writeFileSync(join(dir, "index.tmp"), JSON.stringify(idx)); renameSync(join(dir, "index.tmp"), join(dir, "index.json"));
  return "saved";
}
export function loadState() { try { return JSON.parse(readFileSync(STATE_FILE, "utf8")); } catch { return { sites: {}, seen: {} }; } }
export function saveState(s) { writeFileSync(STATE_FILE, JSON.stringify(s, null, 1)); }
