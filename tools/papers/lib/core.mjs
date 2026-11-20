import { applyKey, inferMeta, isKeyName, pairKey, parseKey, parsePaper } from "./parse.mjs";
import { isPdf, links, pageTitle } from "./http.mjs";
import { pdfToText } from "./pdf.mjs";
import { savePaper, sha, slug } from "./store.mjs";

const BOARD_NAME = { cbse: "CBSE", matric: "Matric", stateboard: "State Board", ncert: "NCERT" };
const TERM_NAME = { quarterly: "Quarterly", "half-yearly": "Half-yearly", annual: "Annual", "mid-term": "Mid-term", "pre-board": "Pre-board", public: "Public exam", revision: "Revision" };
const KIND_NAME = { sample: "Sample paper", previous: "Previous year", model: "Model paper", quiz: "Quiz", worksheet: "Worksheet", test: "Test paper" };
const isPdfUrl = (u) => /\.pdf(\?|$)/i.test(u);
// Never followed: link shorteners and chat apps (their targets cannot be checked, and some need an app or a sign-in).
const NEVER_HOST = /(^|\.)(bit\.ly|tinyurl\.com|t\.co|goo\.gl|cutt\.ly|rebrand\.ly|is\.gd|t\.me|telegram\.me|telegram\.org|wa\.me|whatsapp\.com|chat\.whatsapp\.com|facebook\.com|instagram\.com|youtube\.com|youtu\.be)$/i;
/** A public Google Drive file link -> its direct-download address (null when it is not a Drive file link). Folders and sign-in pages are not files and are ignored. */
export function driveDirect(href) {
  let u; try { u = new URL(href); } catch { return null; }
  if (u.host !== "drive.google.com" && u.host !== "docs.google.com") return null;
  const m = u.pathname.match(/\/file\/d\/([\w-]{15,})/) ?? (u.pathname === "/open" || u.pathname === "/uc" ? [null, u.searchParams.get("id")] : null);
  return m?.[1] && /^[\w-]{15,}$/.test(m[1]) ? `https://drive.google.com/uc?export=download&id=${m[1]}` : null;
}
const SIGNIN = /accounts\.google\.com|servicelogin|sign in to continue|you need access|request access|quota exceeded|too many users have viewed or downloaded/i;

/** Reads a site's entry pages (and, up to `depth`, pages they link to on the same site) and lists every PDF link found. */
export async function crawlSite(site, { fetcher, maxPages = 40 }) {
  const cands = new Map(); const visited = new Set(); const rep = { pages: 0, blocked: null, errors: [], outbound: new Map() };
  const queue = site.entries.map((u) => ({ u, d: 0 }));
  const follow = site.follow ? new RegExp(site.follow, "i") : null;
  while (queue.length && rep.pages < maxPages) {
    const { u, d } = queue.shift();
    if (visited.has(u)) continue; visited.add(u);
    if (isPdfUrl(u)) { cands.set(u, { url: u, text: "", page: "" }); continue; }
    const r = await fetcher(u, { accept: "text/html" });
    if (!r.ok) { rep.errors.push(`${u}: ${r.error}`); if (r.blocked === "robots" || r.blocked === "challenge") rep.blocked = r.blocked; continue; }
    rep.pages++;
    const html = r.buf.toString("utf8"); const title = pageTitle(html);
    for (const l of links(html, u)) {
      let host; try { host = new URL(l.href).host; } catch { continue; }
      const sameSite = host.replace(/^www\./, "") === new URL(u).host.replace(/^www\./, "");
      if (NEVER_HOST.test(host)) continue;
      const drive = driveDirect(l.href);
      if (drive) { if (!cands.has(drive)) cands.set(drive, { url: drive, text: l.text, page: title, pageUrl: u, drive: true }); }
      else if (isPdfUrl(l.href)) { if (!cands.has(l.href)) cands.set(l.href, { url: l.href, text: l.text, page: title, pageUrl: u }); }
      else if (!sameSite) { if (/question\s*paper|sample\s*paper|model\s*paper|previous\s*year|worksheet|quiz/i.test(l.text) && !rep.outbound.has(host)) rep.outbound.set(host, { url: l.href, text: l.text.slice(0, 80) }); }
      else if (d < (site.depth ?? 1) && follow && follow.test(l.href + " " + l.text)) queue.push({ u: l.href, d: d + 1 });
    }
  }
  return { candidates: [...cands.values()], ...rep, outbound: [...rep.outbound.entries()].map(([host, v]) => ({ host, ...v })) };
}

const base = (u) => decodeURIComponent(u.split("?")[0].split("/").pop() ?? "");
/** Splits the PDF list into papers and their marking schemes and pairs them. */
export function planCandidates(cands, site, cfg) {
  const items = cands.map((c) => ({ ...c, name: c.drive ? (c.text || "drive-file") : base(c.url), isKey: isKeyName(`${c.text} ${base(c.url)}`), meta: inferMeta(`${c.page} ${c.text} ${base(c.url)}`) }));
  const keys = items.filter((i) => i.isKey);
  const plan = [];
  for (const p of items.filter((i) => !i.isKey)) {
    const cls = p.meta.cls ?? site.defaults?.cls; const subject = p.meta.subject ?? site.defaults?.subject;
    if (!cls || !subject) { plan.push({ ...p, skip: "no-class-or-subject" }); continue; }
    if (cfg.classes?.length && !cfg.classes.includes(cls)) { plan.push({ ...p, skip: "class-not-selected" }); continue; }
    if (cfg.subjects?.length && !cfg.subjects.some((x) => x.toLowerCase() === String(subject).toLowerCase())) { plan.push({ ...p, skip: "subject-not-selected" }); continue; }
    if (cfg.kinds?.length && !cfg.kinds.includes(p.meta.kind)) { plan.push({ ...p, skip: "kind-not-selected" }); continue; }
    const k = pairKey(p.name);
    const key = keys.find((x) => pairKey(x.name) === k && (x.meta.cls ?? cls) === cls) ?? keys.find((x) => k.length > 6 && pairKey(x.name).includes(k));
    plan.push({ ...p, meta: { ...p.meta, cls, subject }, key: key?.url ?? null });
  }
  return plan;
}

/** Downloads one paper (and its key), turns it into questions and stores it. Returns { result, detail }. */
export async function ingest(item, site, { fetcher, matcherFor, dir, text, cfg = {} }) {
  const getText = async (url) => {
    const r = await fetcher(url, { accept: "application/pdf" });
    if (!r.ok) return { err: r.blocked ? `${r.blocked}: ${r.error}` : r.error, blocked: r.blocked };
    if (cfg.maxFileMB && r.buf.length > cfg.maxFileMB * 1048576) return { err: `file larger than ${cfg.maxFileMB} MB`, tooBig: true };
    if (!isPdf(r.buf)) { const head = r.buf.subarray(0, 6000).toString("utf8"); return SIGNIN.test(head) ? { err: "not public (needs a sign-in, access request or the file's download quota is used up): skipped, never bypassed", signin: true } : { err: "not a PDF" }; }
    try { return { text: await pdfToText(r.buf), bytes: r.buf.length }; } catch (e) { return { err: "cannot read PDF: " + e.message }; }
  };
  const t = text ?? (await getText(item.url));
  if (t.tooBig) return { result: "skipped", detail: t.err };
  if (t.signin) return { result: "skipped", detail: t.err };
  if (t.err) return { result: t.blocked === "robots" || t.blocked === "challenge" ? "blocked" : "failed", detail: t.err };
  const parsed = parsePaper(t.text);
  const n = parsed.sections.reduce((a, s) => a + s.questions.length, 0);
  const minQ = cfg.minQuestions ?? 5;
  if (n < minQ) return { result: "skipped", detail: `only ${n} questions found (fewer than ${minQ}, or a scanned image / unusual layout)` };
  let keyed = 0;
  if (item.key) { const k = await getText(item.key); if (k.text) keyed = applyKey(parsed, parseKey(k.text)); }
  if (cfg.requireKey && !keyed) return { result: "skipped", detail: "no answer key found (Admin: keep only papers with a key)" };
  const m = item.meta; const board = site.board;
  const match = matcherFor ? matcherFor(m.cls, m.subject) : () => undefined;
  for (const s of parsed.sections) for (const q of s.questions) { const ch = match(q.text + " " + (q.options ?? []).join(" ")); if (ch) q.chapter = ch; }
  const norm = parsed.sections.flatMap((s) => s.questions.map((q) => q.text.toLowerCase().replace(/\W+/g, ""))).join("|");
  const hash = sha(norm);
  const title = `${BOARD_NAME[board]} Class ${m.cls} ${m.subject} ${m.term ? TERM_NAME[m.term] + " " + KIND_NAME[m.kind].toLowerCase() : KIND_NAME[m.kind]}${m.year ? " " + m.year : ""}`;
  const paper = { v: 1, id: slug(`${board}-${m.cls}-${m.subject}-${m.kind}-${m.year ?? "na"}`) + "-" + hash.slice(0, 6), title, board, cls: m.cls, subject: m.subject, ...(m.year ? { year: m.year } : {}), ...(m.term ? { term: m.term } : {}), kind: m.kind, ...(parsed.meta.maxMarks ? { maxMarks: parsed.meta.maxMarks } : {}), ...(parsed.meta.minutes ? { minutes: parsed.meta.minutes } : {}), source: { site: site.name, url: item.drive ? (item.pageUrl ?? item.url) : item.url, ...(item.pageUrl && !item.drive && item.pageUrl !== item.url ? { page: item.pageUrl } : {}), ...(site.license ? { license: site.license.slice(0, 300) } : {}) }, hash, sections: parsed.sections };
  const r = savePaper(paper, dir);
  if (r === "saved") return { result: "saved", detail: `${paper.id}: ${n} questions, ${keyed} with answers`, id: paper.id, hash };
  if (r === "duplicate") return { result: "duplicate", detail: paper.id, hash };
  return { result: "invalid", detail: r.join(", ") };
}
