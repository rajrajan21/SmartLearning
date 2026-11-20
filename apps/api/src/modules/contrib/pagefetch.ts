// "Fetch details": reads a public web page (never anything private) and suggests the contribution form fields from the
// page's own labels (JSON-LD, citation_*, Dublin Core, OpenGraph, schema.org microdata, plain text). Nothing is saved:
// the contributor checks and edits every field, and the normal review pipeline is unchanged.
import { checkUrl, FetchError, guardedLookup, httpGet, robotsAllows, type LinkRules, type LookupFn } from "./ssrf.js";

export type Conf = "high" | "medium" | "low";
export interface PdfLink { url: string; label: string }
export interface Details {
  finalUrl: string;
  kind: "page" | "pdf";
  fields: Partial<Record<"title" | "author" | "description" | "language" | "publisher" | "year" | "licence" | "sourceUrl" | "coverUrl" | "classLevel" | "subject" | "licenceProof", string>>;
  confidence: Record<string, Conf>;
  origin: Record<string, string>;
  pdfLinks: PdfLink[];
  notes: string[];
}
export interface PageOptions {
  rules: LinkRules; maxBytes: number; timeoutMs: number; maxRedirects: number; respectRobots: boolean;
  languages?: string[]; licences?: string[]; coverUrl?: boolean; lookup?: LookupFn; transport?: typeof httpGet; userAgent?: string;
}
const UA = "SharpStudyBot/1.0 (+https://sharpstudy.in/library/contribute)";
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };
export const decode = (s: string): string => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
  if (e[0] === "#") { const n = e[1]!.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) && n > 8 && n < 0x10ffff ? String.fromCodePoint(n) : " "; }
  return ENT[e.toLowerCase()] ?? m;
});
const clean = (s: unknown, n = 300): string => (typeof s === "string" ? decode(s).replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, n) : "");

/** reads one tag's attributes */
function attrs(tag: string): Record<string, string> {
  const o: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) o[m[1]!.toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return o;
}
const abs = (href: string, base: string): string | null => { if (!href.trim()) return null; try { const u = new URL(decode(href.trim()), base); return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null; } catch { return null; } };

/** the plain-language language codes the form accepts */
export function langCode(raw: string, allowed: string[]): string | null {
  const l = raw.toLowerCase().replace(/_/g, "-").trim();
  const names: Record<string, string> = { english: "en", tamil: "ta", hindi: "hi", telugu: "te", kannada: "kn", malayalam: "ml", bengali: "bn", gujarati: "gu", punjabi: "pa", urdu: "ur", eng: "en", tam: "ta", hin: "hi", tel: "te", kan: "kn", mal: "ml", ben: "bn", guj: "gu", pan: "pa", urd: "ur" };
  const c = names[l] ?? names[l.split("-")[0]!] ?? l.split("-")[0]!;
  return /^[a-z]{2}$/.test(c) && allowed.includes(c) ? c : null;
}
/** a licence link or phrase → one of the form's licence ids */
export function licenceId(text: string, allowed: string[]): string | null {
  const t = text.toLowerCase();
  let id: string | null = null;
  const cc = t.match(/creativecommons\.org\/(licenses|publicdomain)\/([a-z-]+)/);
  if (cc) {
    if (cc[1] === "publicdomain") id = cc[2] === "zero" ? "cc0" : "pd";
    else id = ["by", "by-sa", "by-nc", "by-nc-sa"].includes(cc[2]!) ? cc[2]! : null; // by-nd / by-nc-nd are not offered
  } else if (/\bcc0\b|public domain dedication/.test(t)) id = "cc0";
  else if (/public domain|publicdomain/.test(t)) id = "pd";
  else { const m = t.match(/\bcc[ -]by(-nc)?(-sa)?\b/); if (m) id = `by${m[1] ? "-nc" : ""}${m[2] ? "-sa" : ""}`; }
  return id && allowed.includes(id) ? id : null;
}

interface Meta { name: string; content: string }
function readMeta(html: string): Meta[] {
  const out: Meta[] = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    const name = (a.property ?? a.name ?? a.itemprop ?? a["http-equiv"] ?? "").toLowerCase();
    if (name && a.content) out.push({ name, content: decode(a.content) });
  }
  return out;
}
/** JSON-LD nodes (flattened, including @graph) that describe a book or creative work */
function jsonLd(html: string): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  const add = (v: unknown, depth = 0) => {
    if (!v || typeof v !== "object" || depth > 4) return;
    if (Array.isArray(v)) { for (const x of v.slice(0, 40)) add(x, depth + 1); return; }
    const o = v as Record<string, unknown>;
    nodes.push(o);
    if (o["@graph"]) add(o["@graph"], depth + 1);
    for (const k of ["mainEntity", "mainEntityOfPage", "about", "workExample", "exampleOfWork"]) if (o[k] && typeof o[k] === "object") add(o[k], depth + 1);
  };
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { add(JSON.parse(m[1]!.trim().replace(/^<!--|-->$/g, ""))); } catch { /* a broken block is skipped */ }
  }
  const typeOf = (o: Record<string, unknown>) => [o["@type"]].flat().map((x) => String(x ?? "").toLowerCase());
  const rank = (o: Record<string, unknown>) => { const t = typeOf(o); return t.some((x) => x === "book") ? 0 : t.some((x) => ["creativework", "publication", "scholarlyarticle", "article", "ebook", "digitaldocument", "mediaobject", "report"].includes(x)) ? 1 : t.some((x) => x === "webpage" || x === "itempage") ? 2 : 3; };
  return nodes.filter((o) => rank(o) < 3).sort((a, b) => rank(a) - rank(b));
}
const names = (v: unknown): string[] => {
  if (!v) return [];
  if (typeof v === "string") return [clean(v, 100)].filter(Boolean);
  if (Array.isArray(v)) return v.flatMap(names);
  if (typeof v === "object") { const o = v as Record<string, unknown>; return names(o.name ?? o["@value"] ?? o.legalName); }
  return [];
};
const text1 = (v: unknown): string => { const a = names(v)[0]; return a ?? ""; };

const SUBJECTS: [RegExp, string][] = [
  [/\b(fairy ?tales?|folk ?tales?|stor(?:y|ies)|tales?|fables?|picture book)\b/i, "Stories"], [/\b(poems?|poetry|rhymes?|nursery)\b/i, "Poems and rhymes"],
  [/\b(maths?|mathematics|arithmetic|numbers?)\b/i, "Maths"], [/\b(science|physics|chemistry|biology|nature|animals?)\b/i, "Science and nature"],
  [/\b(history|geography|social studies|civics)\b/i, "Social studies"], [/\b(grammar|english|reading|writing|alphabet|phonics)\b/i, "Language"],
  [/\b(art|craft|drawing|colou?ring|music)\b/i, "Arts"], [/\b(health|yoga|sports?)\b/i, "Health"],
];
function audience(text: string): string {
  const a = text.match(/\bages?\s*(\d{1,2})\s*(?:[-–—]|to|and)\s*(\d{1,2})\b/i) ?? text.match(/\b(\d{1,2})\s*(?:[-–—]|to)\s*(\d{1,2})\s*(?:years?|yrs?)(?:\s*old)?\b/i);
  if (a && +a[1]! < +a[2]! && +a[2]! <= 18) return `Ages ${a[1]}-${a[2]}`;
  const p = text.match(/\bages?\s*(\d{1,2})\s*\+/i); if (p && +p[1]! <= 18) return `Ages ${p[1]}+`;
  const g = text.match(/\b(?:class|grade|std|standard)\s*(\d{1,2})\b/i); if (g && +g[1]! >= 1 && +g[1]! <= 12) return `Class ${g[1]}`;
  return "";
}

export function extractDetails(html: string, finalUrl: string, o: Pick<PageOptions, "rules" | "languages" | "licences" | "coverUrl">): Details {
  const langs = o.languages ?? ["en", "ta", "hi", "te", "kn", "ml", "bn", "gu", "pa", "ur"];
  const lic = o.licences ?? ["own", "pd", "cc0", "by", "by-sa", "by-nc", "by-nc-sa", "gov-open", "permission"];
  const d: Details = { finalUrl, kind: "page", fields: {}, confidence: {}, origin: {}, pdfLinks: [], notes: [] };
  const rank = { high: 3, medium: 2, low: 1 } as const;
  const put = (k: keyof Details["fields"], v: string, c: Conf, from: string) => {
    const val = v.trim(); if (!val) return;
    if (!d.fields[k] || rank[c] > rank[d.confidence[k] as Conf]) { d.fields[k] = val; d.confidence[k] = c; d.origin[k] = from; }
  };
  const head = html.slice(0, 600_000);
  const metas = readMeta(head);
  const m1 = (...keys: string[]) => { for (const k of keys) { const f = metas.find((m) => m.name === k && clean(m.content)); if (f) return clean(f.content, 600); } return ""; };
  const mAll = (...keys: string[]) => metas.filter((m) => keys.includes(m.name)).map((m) => clean(m.content, 100)).filter(Boolean);
  const ld = jsonLd(head);

  // --- title
  for (const n of ld) { const t = clean(n.name ?? n.headline, 150); if (t) { put("title", t, "high", "JSON-LD"); break; } }
  put("title", m1("citation_title", "dc.title", "dcterms.title"), "high", "citation / Dublin Core");
  put("title", m1("og:title", "twitter:title"), "medium", "OpenGraph");
  const siteName = m1("og:site_name");
  const pageTitle = clean(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "", 200);
  if (pageTitle) { const parts = pageTitle.split(/\s+[|–—·»]\s+|\s+-\s+/).map((x) => x.trim()).filter(Boolean); const part = parts.find((x) => !siteName || x.toLowerCase() !== siteName.toLowerCase()) ?? parts[0] ?? pageTitle; put("title", part.slice(0, 150), "low", "page title"); }
  const h1 = clean(head.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "", 150); put("title", h1, "low", "page heading");
  if (d.fields.title && d.confidence.title !== "low" && siteName) { const t = d.fields.title; const sfx = t.match(new RegExp(`\\s+[|–—-]\\s+${siteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")); if (sfx) d.fields.title = t.slice(0, t.length - sfx[0].length); }

  // --- author(s)
  for (const n of ld) { const a = [...new Set([...names(n.author), ...names(n.creator)])]; if (a.length) { put("author", a.slice(0, 4).join(", "), "high", "JSON-LD"); break; } }
  const cit = [...new Set(mAll("citation_author", "dc.creator", "dcterms.creator", "book:author"))];
  put("author", cit.slice(0, 4).join(", "), "high", "citation / Dublin Core");
  const ma = m1("author", "article:author", "twitter:creator");
  if (ma && !/^https?:|^@/i.test(ma)) put("author", ma, "medium", "page meta");
  const byline = clean(head.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "), 6000).match(/\b(?:written\s+)?by\s+([A-Z][\p{L}.'’-]+(?:\s+[A-Z][\p{L}.'’-]+){0,3})/u);
  if (byline) put("author", byline[1]!, "low", "text on the page");

  // --- description, publisher, year, language
  for (const n of ld) { const t = clean(n.description, 600); if (t) { put("description", t, "high", "JSON-LD"); break; } }
  put("description", m1("citation_abstract", "dc.description", "dcterms.abstract", "og:description"), "medium", "page meta");
  put("description", m1("description", "twitter:description"), "medium", "page meta");
  for (const n of ld) { const p = text1(n.publisher); if (p) { put("publisher", p, "high", "JSON-LD"); break; } }
  put("publisher", m1("citation_publisher", "dc.publisher", "dcterms.publisher"), "high", "citation / Dublin Core");
  put("publisher", siteName, "low", "site name");
  const yr = (s: string) => s.match(/\b(1[5-9]\d\d|20\d\d)\b/)?.[1] ?? "";
  for (const n of ld) { const y = yr(String(n.datePublished ?? n.copyrightYear ?? n.dateCreated ?? "")); if (y) { put("year", y, "high", "JSON-LD"); break; } }
  put("year", yr(m1("citation_publication_date", "citation_date", "dc.date", "dcterms.issued", "book:release_date", "article:published_time")), "high", "citation / Dublin Core");
  const htmlLang = head.match(/<html\b[^>]*\blang\s*=\s*["']?([A-Za-z-]+)/i)?.[1] ?? "";
  for (const n of ld) { const l = langCode(text1(n.inLanguage), langs); if (l) { put("language", l, "high", "JSON-LD"); break; } }
  const lm = langCode(m1("citation_language", "dc.language", "dcterms.language", "og:locale", "content-language"), langs);
  if (lm) put("language", lm, "high", "page meta");
  const hl = langCode(htmlLang, langs); if (hl) put("language", hl, "medium", "page language");

  // --- licence (always only a suggestion: the contributor must confirm and give proof)
  const licSrc: string[] = [];
  for (const n of ld) licSrc.push(String(typeof n.license === "string" ? n.license : text1(n.license) || ""));
  for (const m of head.matchAll(/<(?:link|a)\b[^>]*>/gi)) { const a = attrs(m[0]); if (/\blicen[cs]e\b/i.test(a.rel ?? "") && a.href) licSrc.push(a.href); else if (a.href && /creativecommons\.org\/(licenses|publicdomain)\//i.test(a.href)) licSrc.push(a.href); }
  licSrc.push(m1("dc.rights", "dcterms.license", "dcterms.rights", "dc.license", "citation_license"));
  for (const s of licSrc) { const id = licenceId(s, lic); if (id) { put("licence", id, /creativecommons/i.test(s) ? "medium" : "low", "licence link on the page"); d.fields.licenceProof ??= (/^https?:/i.test(s.trim()) ? s.trim() : "").slice(0, 300); break; } }
  if (!d.fields.licence) { const t = clean(head.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "), 20000); const id = licenceId(t, lic); if (id) put("licence", id, "low", "words on the page"); }

  // --- source page and cover
  const canon = head.match(/<link\b[^>]*rel\s*=\s*["']?canonical["']?[^>]*>/i); const canonHref = canon ? abs(attrs(canon[0]).href ?? "", finalUrl) : null;
  put("sourceUrl", canonHref ?? finalUrl, "medium", "this page's address");
  if (o.coverUrl !== false) {
    let img = ""; for (const n of ld) { const i = Array.isArray(n.image) ? n.image[0] : n.image; const s = typeof i === "string" ? i : String((i as { url?: unknown } | undefined)?.url ?? ""); if (s) { img = s; break; } }
    const c = abs(img, finalUrl); if (c) put("coverUrl", c, "high", "JSON-LD");
    const oi = abs(m1("og:image", "og:image:url", "twitter:image", "thumbnail"), finalUrl); if (oi) put("coverUrl", oi, "medium", "OpenGraph");
  }

  // --- suggestions: age or class, and subject
  const kw = [d.fields.title, d.fields.description, m1("keywords", "citation_keywords", "article:tag"), ...ld.map((n) => clean(n.keywords ?? n.genre ?? n.audience, 200)), pageTitle].join(" . ");
  const aud = audience(kw); if (aud) put("classLevel", aud, "low", "words on the page");
  const sj = SUBJECTS.find(([re]) => re.test(kw)); if (sj) put("subject", sj[1], "low", "words on the page");
  const prov = [d.fields.publisher && `Published by ${d.fields.publisher}`, d.fields.year && `(${d.fields.year})`].filter(Boolean).join(" ");
  if (prov && d.fields.licence) d.fields.licenceProof = [d.fields.licenceProof, prov].filter(Boolean).join(" — ").slice(0, 300);

  // --- PDF links
  const seen = new Set<string>(); const links: PdfLink[] = [];
  const addLink = (href: string | null, label: string) => {
    if (!href || seen.has(href) || links.length >= 8) return;
    try { checkUrl(href, o.rules); } catch { return; } // a link to a blocked website is not offered
    seen.add(href); links.push({ url: href, label: clean(label, 80) || href.split("/").pop() || "PDF" });
  };
  addLink(abs(m1("citation_pdf_url"), finalUrl), "PDF (listed by the page)");
  for (const m of head.matchAll(/<link\b[^>]*>/gi)) { const a = attrs(m[0]); if (/pdf/i.test(a.type ?? "") && a.href) addLink(abs(a.href, finalUrl), a.title ?? "PDF"); }
  for (const m of head.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const a = attrs(`<a ${m[1]}>`); const href = a.href ? abs(a.href, finalUrl) : null; if (!href) continue;
    const label = clean(m[2]!, 80) || a.title || a["aria-label"] || "";
    let path = ""; try { path = new URL(href).pathname; } catch { continue; }
    if (/\.pdf$/i.test(path) || (/\bpdf\b/i.test(label) && /download|\/bitstream\/|\/pdf\b|\/file/i.test(href)) || /\/download\/[^/]+\/[^/]+\.pdf/i.test(href)) addLink(href, label);
  }
  d.pdfLinks = links;
  if (!d.fields.title) d.notes.push("No title was found on that page. Please type it in.");
  if (!links.length) d.notes.push("No PDF link was found on that page. Open the PDF itself, copy its address and paste it into the link box.");
  return d;
}

/** Reads one web page with every protection of the PDF downloader (public addresses only, each redirect re-checked, robots.txt, size and time caps). */
export async function fetchDetails(link: string, o: PageOptions): Promise<Details> {
  const lookup = o.lookup ?? guardedLookup(); const get = o.transport ?? httpGet; const ua = o.userAgent ?? UA;
  const deadline = Date.now() + o.timeoutMs;
  let u = checkUrl(link, o.rules);
  if (/\.pdf$/i.test(u.pathname)) return pdfOnly(u);
  if (o.respectRobots) {
    try {
      const rb = await get(new URL("/robots.txt", u), { maxBytes: 200_000, deadline: Math.min(deadline, Date.now() + 8000), lookup, ua });
      if (rb.status === 200 && !robotsAllows(rb.body.toString("utf8"), u.pathname + u.search)) throw new FetchError("robots", "That website asks robots not to read this page, so details cannot be fetched. Please type them in.");
    } catch (e) { if (e instanceof FetchError && e.code === "robots") throw e; }
  }
  for (let hop = 0; hop <= o.maxRedirects; hop++) {
    let r;
    try { r = await get(u, { maxBytes: o.maxBytes, deadline, lookup, ua, accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" }); }
    catch (e) { if (e instanceof FetchError && e.code === "too_big") throw new FetchError("too_big", "That page is too large to read. Please type the details in."); throw e; }
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.location;
      if (!loc) throw new FetchError("redirect", "The link redirected somewhere we cannot follow.");
      if (hop === o.maxRedirects) throw new FetchError("redirects", "The link redirected too many times.");
      u = checkUrl(new URL(loc, u).toString(), o.rules); continue;
    }
    if (r.status < 200 || r.status >= 300) throw new FetchError("http", `The website answered with an error (${r.status}). Please type the details in.`);
    const ct = String(r.headers["content-type"] ?? "").toLowerCase().split(";")[0]!.trim();
    if (/pdf/.test(ct) || r.body.subarray(0, 8).toString("latin1").startsWith("%PDF-")) return pdfOnly(u);
    if (ct && !/^(text\/html|application\/xhtml\+xml|text\/plain)$/.test(ct)) throw new FetchError("not_page", "That link is not a web page, so there is nothing to read details from.");
    const charset = String(r.headers["content-type"] ?? "").match(/charset=([\w-]+)/i)?.[1]?.toLowerCase() ?? r.body.subarray(0, 2048).toString("latin1").match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1]?.toLowerCase() ?? "utf-8";
    let html: string; try { html = new TextDecoder(/^(utf-?8|)$/.test(charset) ? "utf-8" : charset).decode(r.body); } catch { html = r.body.toString("utf8"); }
    return extractDetails(html, u.toString(), o);
  }
  throw new FetchError("redirects", "The link redirected too many times.");
}

/** The link itself is a PDF: nothing to read from a page, but its file name often hints at the title. */
function pdfOnly(u: URL): Details {
  const base = decodeURIComponent(u.pathname.split("/").pop() ?? "").replace(/\.pdf$/i, "").replace(/[_+]+|-{1,}/g, " ").replace(/\s+/g, " ").trim();
  const d: Details = { finalUrl: u.toString(), kind: "pdf", fields: {}, confidence: {}, origin: {}, pdfLinks: [], notes: ["That link goes straight to a PDF file, so there is no web page to read. To fill in details automatically, paste the address of the page where the book is described."] };
  if (base.length >= 4 && !/^\d+$/.test(base)) { d.fields.title = base.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 150); d.confidence.title = "low"; d.origin.title = "file name"; }
  return d;
}
