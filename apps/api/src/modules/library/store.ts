import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";

/**
 * The E-Library. The collector (tools/library) saves each book as <filesDir>/pdf/<id>.pdf and a small picture
 * <filesDir>/cover/<id>.jpg, and records it in catalog.json (small, kept in git). The big files are never in git.
 * A catalogue entry whose PDF is not on this machine yet is simply not listed.
 */
export const AGE_BANDS = ["0-3", "4-6", "7-9", "10-12", "13+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export interface LibraryBook {
  id: string;
  title: string;
  authors: string[];
  /** ISO 639-1 code where known (en, ta, hi ...), otherwise the source's code */
  language: string;
  ageBand: AgeBand;
  /** where the age came from: "source" (the website said) or "guess" (our own rule of thumb) */
  ageSource: "source" | "guess";
  pages: number | null;
  bytes: number;
  licence: { code: string; name: string; url: string };
  source: { site: string; siteName: string; url: string };
  tags: string[];
  addedAt: string;
  hasCover: boolean;
  toc?: { title: string; page: number; level: number }[];
  /** set for books added through "Contribute to the E-Library" */
  contributed?: { by: string; handle: string; submissionId: string; download: boolean; hasText: boolean; hasOutline: boolean; licenceNote: string };
}
export interface LibraryList {
  books: LibraryBook[];
  bands: { band: AgeBand; count: number }[];
  languages: { code: string; count: number }[];
  bytes: number;
}
export interface LibraryStore {
  list(): LibraryList;
  /** absolute path of the PDF, or null (unknown id, unsafe name, file missing) */
  filePath(id: string): string | null;
  coverPath(id: string): string | null;
  /** where the catalogue and the book files live (used by the admin page) */
  paths: { catalog: string; files: string; collector?: string };
}

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;
const isBand = (v: unknown): v is AgeBand => typeof v === "string" && (AGE_BANDS as readonly string[]).includes(v);
const str = (v: unknown, max = 300) => (typeof v === "string" ? v.slice(0, max) : "");

function cleanContributed(c: Record<string, unknown>): NonNullable<LibraryBook["contributed"]> {
  return { by: str(c.by, 60) || "Anonymous", handle: /^[a-f0-9]{12}$/.test(str(c.handle, 12)) ? str(c.handle, 12) : "", submissionId: str(c.submissionId, 20), download: c.download === true, hasText: c.hasText === true, hasOutline: c.hasOutline === true, licenceNote: str(c.licenceNote, 300) };
}

/** Reads one catalogue row defensively: anything odd is cleaned or the row is dropped. */
export function cleanBook(raw: unknown, bytesOnDisk: number, hasCover: boolean): LibraryBook | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.hidden === true) return null; // hidden by an admin: kept on disk, not shown
  const id = str(r.id, 121);
  if (!ID.test(id) || id.includes("..")) return null;
  const title = str(r.title, 200).trim();
  if (!title) return null;
  const lic = (r.licence && typeof r.licence === "object" ? r.licence : {}) as Record<string, unknown>;
  const src = (r.source && typeof r.source === "object" ? r.source : {}) as Record<string, unknown>;
  const url = (u: unknown) => { const s = str(u, 500); return /^https?:\/\//i.test(s) ? s : ""; };
  return {
    id,
    title,
    authors: Array.isArray(r.authors) ? r.authors.map((a) => str(a, 120)).filter(Boolean).slice(0, 8) : [],
    language: str(r.language, 12).toLowerCase() || "en",
    ageBand: isBand(r.ageBand) ? r.ageBand : "7-9",
    ageSource: r.ageSource === "source" ? "source" : "guess",
    pages: Number.isInteger(r.pages) && (r.pages as number) > 0 ? (r.pages as number) : null,
    bytes: bytesOnDisk,
    licence: { code: str(lic.code, 20), name: str(lic.name, 80), url: url(lic.url) },
    source: { site: str(src.site, 40), siteName: str(src.siteName, 80), url: url(src.url) },
    tags: Array.isArray(r.tags) ? r.tags.map((t) => str(t, 40)).filter(Boolean).slice(0, 12) : [],
    addedAt: str(r.addedAt, 30),
    hasCover,
    ...(Array.isArray(r.toc) ? { toc: r.toc.slice(0, 120).flatMap((item: unknown) => {
      const e = item as { title?: unknown; page?: unknown; level?: unknown } | null;
      return e && typeof e.title === "string" && typeof e.page === "number" && Number.isInteger(e.page) &&
        e.page >= 1 && e.page <= Number(r.pages)
        ? [{ title: e.title.slice(0, 140), page: e.page, level: typeof e.level === "number" ? Math.max(0, Math.min(3, e.level)) : 0 }] : [];
    }) } : {}),
    ...(r.contributed && typeof r.contributed === "object" ? { contributed: cleanContributed(r.contributed as Record<string, unknown>) } : {}),
  };
}

/** `contributedPath` is the file the contribution feature writes (books people sent in); it is merged in so the collector can never overwrite those rows. */
export function createLibraryStore(catalogPath: string, filesDir: string, contributedPath?: string, collector?: string): LibraryStore {
  const pdfRoot = resolve(filesDir, "pdf");
  const coverRoot = resolve(filesDir, "cover");
  const collectedPath = collector && join(collector, "catalog.json");
  const moderationPath = collector && join(collector, "moderation.json");
  let cache: { key: string; list: LibraryList; visible: Set<string> } | null = null;

  function safe(root: string, name: string): string | null {
    if (!ID.test(name) || name.includes("..")) return null;
    const p = resolve(root, name);
    if (!p.startsWith(root + sep)) return null;
    try {
      const real = realpathSync(p), realRoot = realpathSync(root);
      return real.startsWith(realRoot + sep) ? real : null; // refuses a symlink that leaves the folder
    } catch { return null; }
  }

  function list(): LibraryList {
    let key = "none";
    try { const st = statSync(catalogPath); key = `${st.mtimeMs}:${st.size}`; } catch { /* no catalogue yet: an empty shelf */ }
    // the number of files changes the answer too, so key on the folder time as well
    try { key += `:${statSync(join(pdfRoot)).mtimeMs}`; } catch { /* no files yet */ }
    if (contributedPath) { try { const st = statSync(contributedPath); key += `:c${st.mtimeMs}:${st.size}`; } catch { /* none yet */ } }
    for (const p of [collectedPath, moderationPath]) if (p) {
      try { const st = statSync(p); key += `:${st.mtimeMs}:${st.size}`; } catch { /* no collector data yet */ }
    }
    if (cache && cache.key === key) return cache.list;
    let rows: unknown[] = [];
    try {
      const j = JSON.parse(readFileSync(catalogPath, "utf8")) as { books?: unknown };
      if (Array.isArray(j.books)) rows = j.books;
    } catch { /* missing or broken catalogue: empty shelf */ }
    if (contributedPath) {
      try {
        const j = JSON.parse(readFileSync(contributedPath, "utf8")) as { books?: unknown };
        if (Array.isArray(j.books)) rows = rows.concat(j.books);
      } catch { /* none yet */ }
    }
    if (collectedPath) {
      try { const j = JSON.parse(readFileSync(collectedPath, "utf8")); if (Array.isArray(j.books)) rows = rows.concat(j.books); } catch { /* no collector data yet */ }
    }
    const books: LibraryBook[] = [];
    const hidden = new Set<string>();
    if (moderationPath) {
      try {
        const m = JSON.parse(readFileSync(moderationPath, "utf8"));
        for (const id of [...(m.hidden ?? []), ...(m.removed ?? [])]) if (typeof id === "string") hidden.add(id);
      } catch { /* no collector moderation yet */ }
    }
    for (const raw of rows) { const r = raw as { id?: unknown; hidden?: unknown }; if (r && r.hidden === true && typeof r.id === "string") hidden.add(r.id); }
    const seen = new Set<string>();
    let total = 0;
    for (const raw of rows) {
      const id = typeof (raw as { id?: unknown })?.id === "string" ? (raw as { id: string }).id : "";
      if (seen.has(id) || hidden.has(id)) continue;
      const p = safe(pdfRoot, `${id}.pdf`);
      if (!p) continue;
      let bytes = 0;
      try { bytes = statSync(p).size; } catch { continue; }
      const b = cleanBook(raw, bytes, safe(coverRoot, `${id}.jpg`) !== null);
      if (!b) continue;
      seen.add(id);
      total += bytes;
      books.push(b);
    }
    books.sort((a, b) => (b.addedAt || "").localeCompare(a.addedAt || "") || a.title.localeCompare(b.title));
    const bands = AGE_BANDS.map((band) => ({ band, count: books.filter((b) => b.ageBand === band).length })).filter((x) => x.count > 0);
    const langs = new Map<string, number>();
    for (const b of books) langs.set(b.language, (langs.get(b.language) ?? 0) + 1);
    const languages = [...langs].map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
    cache = { key, list: { books, bands, languages, bytes: total }, visible: seen };
    return cache.list;
  }

  return {
    list,
    // a book hidden by an admin (or by a takedown) is not served by its direct link either
    filePath: (id) => { if (!existsSync(pdfRoot)) return null; list(); return cache?.visible.has(id) ? safe(pdfRoot, `${id}.pdf`) : null; },
    coverPath: (id) => { if (!existsSync(coverRoot)) return null; list(); return cache?.visible.has(id) ? safe(coverRoot, `${id}.jpg`) : null; },
    paths: { catalog: catalogPath, files: filesDir, collector },
  };
}
