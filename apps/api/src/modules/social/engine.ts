import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Candidate, LedgerEntry, Platform, SettingsMap, SocialState } from "./types.js";

/* ---------- small helpers ---------- */
const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);
const num = (v: unknown, d: number): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const on = (v: unknown, d = false): boolean => (typeof v === "boolean" ? v : d);
export const csv = (v: unknown): string[] => str(v).split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
const isAll = (l: string[]) => l.length === 0 || l.includes("all");
const isNone = (l: string[]) => l.length === 0 || l.includes("none");

const SENT = /(?<=[.!?])\s+(?=[A-Z0-9"'(])/;
export function sentences(text: string): string[] {
  return text.split(/\n+/).flatMap((p) => p.trim().split(SENT)).map((s) => s.replace(/\s+/g, " ").trim()).filter((s) => s.length >= 15 && s.length <= 260);
}
const loc = (v: unknown): string => { if (typeof v === "string") return v; if (v && typeof v === "object") { const o = v as Record<string, unknown>; return str(o.en) || str(o.ta); } return ""; };

/* ---------- reading the lessons ---------- */
export interface Dirs { lessonsDir: string; classroomDir: string; gkDir?: string }

export function loadCandidates(dirs: Dirs, s: SettingsMap): Candidate[] {
  const out: Candidate[] = [];
  const onlyPub = on(s["social.pick.onlyPublished"], true);
  if (on(s["social.source.lessons"], true) && existsSync(dirs.lessonsDir)) {
    for (const f of readdirSync(dirs.lessonsDir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const d = JSON.parse(readFileSync(join(dirs.lessonsDir, f), "utf8"));
        const stem = f.slice(0, -5);
        if (onlyPub && d.lesson?.status && d.lesson.status !== "published") continue;
        const blocks: any[] = d.lesson?.blocks ?? [];
        const expl = blocks.filter((b) => b.type === "explanation").map((b) => loc(b.text)).join("\n");
        const story = blocks.filter((b) => b.type === "story").map((b) => loc(b.text)).join("\n");
        const narr = blocks.filter((b) => b.type === "teacher_narration").flatMap((b) => (b.sentences ?? []).map((x: any) => loc(x.text))).join(" ");
        const sents = sentences(expl || narr || story);
        const narration = blocks.filter((b) => b.type === "teacher_narration").flatMap((b) => (b.sentences ?? []).map((x: any) => ({ teacher: String(b.teacher ?? "malar"), text: loc(x.text) }))).filter((x) => x.text);
        const summaryBlock = blocks.find((b) => b.type === "summary");
        const points: string[] = (summaryBlock?.points ?? []).map((p: unknown) => loc(p)).filter(Boolean);
        const title = loc(d.lesson?.title) || stem;
        if (!title) continue;
        const board = String(d.board ?? "").toLowerCase();
        out.push({ id: stem, source: "lesson", board, cls: Number(d.classLevel), subject: String(d.subject), chapter: String(d.chapter), topic: String(d.topic), title, sentences: sents, narration, points: points.length ? points : sents.slice(0, 3), hasBoard: existsSync(join(dirs.classroomDir, stem + ".json")), path: `/${board}/${d.classLevel}/${d.subject}/${d.chapter}/${d.topic}/learn` });
      } catch { /* a broken lesson file is skipped */ }
    }
  }
  if (on(s["social.source.gk"], true) && dirs.gkDir && existsSync(dirs.gkDir)) {
    for (const f of readdirSync(dirs.gkDir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const d = JSON.parse(readFileSync(join(dirs.gkDir, f), "utf8"));
        const id = String(d.id ?? f.slice(0, -5));
        const title = loc(d.title);
        if (!title || (onlyPub && d.status && d.status !== "published")) continue;
        const text = [loc(d.summary), loc(d.intro), ...(Array.isArray(d.sections) ? d.sections.map((x: any) => loc(x.text ?? x.body)) : []), ...(Array.isArray(d.facts) ? d.facts.map((x: unknown) => loc(x)) : [])].filter(Boolean).join("\n");
        const sents = sentences(text);
        out.push({ id: "gk-" + id, source: "gk", board: "gk", cls: 0, subject: String(d.category ?? "gk"), chapter: String(d.category ?? "gk"), topic: id, title, sentences: sents, narration: sents.map((t) => ({ teacher: "malar", text: t })), points: sents.slice(0, 3), hasBoard: false, path: `/gk/${id}` });
      } catch { /* skip */ }
    }
  }
  return out;
}

/* ---------- eligibility, rotation ---------- */
export function eligible(c: Candidate, s: SettingsMap): boolean {
  const boards = csv(s["social.include.boards"]), classes = csv(s["social.include.classes"]), subs = csv(s["social.include.subjects"]);
  const exS = csv(s["social.exclude.subjects"]), exL = csv(s["social.exclude.lessons"]);
  if (!isAll(boards) && !boards.includes(c.board)) return false;
  if (c.source === "lesson" && !isAll(classes) && !classes.includes(String(c.cls))) return false;
  if (!isAll(subs) && !subs.includes(c.subject.toLowerCase())) return false;
  if (!isNone(exS) && exS.includes(c.subject.toLowerCase())) return false;
  if (!isNone(exL) && exL.includes(c.id.toLowerCase())) return false;
  if (c.sentences.length < 1 && c.points.length < 1) return false; // nothing to say about it
  if (str(s["social.image.style"], "auto") === "board" && !c.hasBoard) return false;
  return true;
}

/** a lesson counts as "posted" when a live post of it exists on this platform (previews and held posts never count) */
export function postedIds(ledger: LedgerEntry[], platform?: Platform): Set<string> {
  return new Set(ledger.filter((e) => e.status === "posted" && (!platform || e.platform === platform)).map((e) => e.lessonId));
}

export const bucketKey = (c: Pick<Candidate, "board" | "cls" | "subject">) => `${c.board}|${c.cls}|${c.subject}`;

export interface PickInput { candidates: Candidate[]; ledger: LedgerEntry[]; state: SocialState; settings: SettingsMap; count: number; platforms: Platform[]; now?: number; avoid?: Set<string> }

/**
 * Chooses `count` lessons that have never been posted, rotating fairly: every class/subject bucket gets its turn (the one that waited longest
 * goes first), the same class or subject does not follow itself, and a bucket does not return within `minGapPosts` posts when others are available.
 * Pure: it does not change the state; it returns the picks and the updated state.
 */
export function pickLessons(inp: PickInput): { picks: Candidate[]; state: SocialState; exhausted: boolean } {
  const { settings: s } = inp;
  const recycleDays = on(s["social.recycle.enabled"]) ? num(s["social.recycle.afterDays"], 180) : 0;
  const now = inp.now ?? Date.now();
  const posted = new Map<string, number>();
  for (const e of inp.ledger) if (e.status === "posted") { const t = Date.parse(e.postedAt ?? e.createdAt); posted.set(e.lessonId, Math.max(posted.get(e.lessonId) ?? 0, t)); }
  const unposted = (c: Candidate) => { const t = posted.get(c.id); return t === undefined || (recycleDays > 0 && now - t > recycleDays * 86400000); };
  const pool = inp.candidates.filter((c) => eligible(c, s) && unposted(c) && !inp.avoid?.has(c.id));
  const byBucket = new Map<string, Candidate[]>();
  for (const c of pool) { const k = bucketKey(c); (byBucket.get(k) ?? byBucket.set(k, []).get(k)!).push(c); }
  const prefer = on(s["social.pick.preferPictures"], true);
  for (const list of byBucket.values()) list.sort((a, b) => (prefer ? Number(b.hasBoard) - Number(a.hasBoard) : 0) || a.id.localeCompare(b.id));
  const st: SocialState = { ...inp.state, bucketUsed: { ...inp.state.bucketUsed }, recent: [...inp.state.recent] };
  const picks: Candidate[] = [];
  const noSameGrade = on(s["social.rotate.avoidSameGrade"], true), noSameSub = on(s["social.rotate.avoidSameSubject"], true), gap = num(s["social.rotate.minGapPosts"], 6);
  for (let n = 0; n < inp.count; n++) {
    const keys = [...byBucket.entries()].filter(([, l]) => l.length > 0).map(([k]) => k);
    if (keys.length === 0) break;
    const last = st.recent[st.recent.length - 1];
    const recentKeys = new Set(st.recent.slice(-gap).map((r) => `${r.board}|${r.cls}|${r.subject}`));
    const score = (k: string, strict: number): boolean => {
      const [board, cls, subject] = k.split("|");
      if (strict >= 2 && recentKeys.has(k)) return false;
      if (strict >= 1 && last) { if (noSameGrade && String(last.cls) === cls && last.board === board && cls !== "0") return false; if (noSameSub && last.subject === subject) return false; }
      return true;
    };
    let usable: string[] = [];
    for (const strict of [2, 1, 0]) { usable = keys.filter((k) => score(k, strict)); if (usable.length) break; }
    // longest-waiting bucket first (never used = 0), then prefer buckets that still have a picture lesson, then a stable order
    usable.sort((a, b) => (st.bucketUsed[a] ?? 0) - (st.bucketUsed[b] ?? 0) || Number(byBucket.get(b)![0]!.hasBoard) - Number(byBucket.get(a)![0]!.hasBoard) || a.localeCompare(b));
    const k = usable[0]!;
    const c = byBucket.get(k)!.shift()!;
    picks.push(c);
    st.counter += 1; st.bucketUsed[k] = st.counter;
    st.recent.push({ cls: c.cls, subject: c.subject, board: c.board });
    if (st.recent.length > 80) st.recent.splice(0, st.recent.length - 80);
  }
  return { picks, state: st, exhausted: picks.length < inp.count };
}

/* ---------- captions ---------- */
const TITLE_CASE = (s: string) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
export const subjectName = (id: string) => ({ evs: "EVS", gk: "GK", maths: "Maths", english: "English", science: "Science", social: "Social Science" } as Record<string, string>)[id] ?? TITLE_CASE(id);
export const boardName = (id: string) => ({ cbse: "CBSE", tnmatric: "Tamil Nadu Matric", gk: "GK" } as Record<string, string>)[id] ?? id.toUpperCase();

export function hashtags(c: Candidate, s: SettingsMap): string {
  const base = str(s["social.hashtags.base"]).split(/\s+/).filter((t) => /^#\w+$/.test(t));
  const extra: string[] = [];
  if (on(s["social.hashtags.perSubject"], true)) {
    extra.push("#" + subjectName(c.subject).replace(/[^A-Za-z0-9]/g, ""));
    if (c.cls > 0) extra.push(`#Class${c.cls}`);
  }
  const all = [...new Set([...base, ...extra])];
  return all.slice(0, num(s["social.hashtags.max"], 10)).join(" ");
}

export function lessonLink(c: Candidate, s: SettingsMap, platform: Platform, base: string): string {
  const u = new URL(base.replace(/\/$/, "") + c.path);
  if (on(s["social.link.utm"], true)) {
    u.searchParams.set("utm_source", platform === "facebook" ? "facebook" : "instagram");
    u.searchParams.set("utm_medium", "social");
    u.searchParams.set("utm_campaign", str(s["social.link.utmCampaign"], "lesson-of-the-day").replace(/[^\w-]/g, "") || "lesson");
  }
  return u.toString();
}

export function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function captionVars(c: Candidate, s: SettingsMap, platform: Platform, base: string): Record<string, string> {
  const n = num(s["social.caption.summarySentences"], 2);
  const summary = (c.sentences.length ? c.sentences : c.points).slice(0, n).join(" ");
  return { title: c.title, summary, board: boardName(c.board), grade: c.cls > 0 ? String(c.cls) : "all ages", subject: subjectName(c.subject), chapter: TITLE_CASE(c.chapter), link: lessonLink(c, s, platform, base), hashtags: hashtags(c, s), brand: str(s["social.brand.name"], "SharpStudy") };
}

export function buildCaption(c: Candidate, s: SettingsMap, platform: Platform, base: string): string {
  const tpl = str(s[platform === "facebook" ? "social.caption.fb" : "social.caption.ig"]);
  let cap = fill(tpl, captionVars(c, s, platform, base));
  const max = num(s["social.caption.maxLength"], 1800);
  if (cap.length > max) { // shorten the summary part, never cut the link or hashtags
    const v = captionVars(c, s, platform, base); const over = cap.length - max;
    const sm = v.summary ?? ""; v.summary = sm.length > over + 1 ? sm.slice(0, sm.length - over - 1).replace(/\s+\S*$/, "") + "…" : "";
    cap = fill(tpl, v);
  }
  return cap.slice(0, 2200);
}
export const buildAlt = (c: Candidate, s: SettingsMap): string => fill(str(s["social.alt.template"], "{title}"), captionVars(c, s, "facebook", "https://x.invalid")).slice(0, 400);

/** Why this caption must not be posted ("" = fine). */
export function captionProblem(caption: string, s: SettingsMap, siteBase: string): string {
  if (on(s["social.onlyOwnLinks"], true)) {
    const host = (() => { try { return new URL(siteBase).host.replace(/^www\./, ""); } catch { return ""; } })();
    for (const m of caption.matchAll(/https?:\/\/[^\s)]+|\bwww\.[^\s)]+/gi)) {
      let h = ""; try { h = new URL(m[0].startsWith("www.") ? "https://" + m[0] : m[0]).host.replace(/^www\./, ""); } catch { return `a web address that cannot be read: ${m[0]}`; }
      if (!host || h !== host) return `a link to another website (${h}); only ${host || "this site"} may be linked`;
    }
  }
  const block = csv(s["social.caption.blockWords"]).filter((w) => w !== "none");
  const low = caption.toLowerCase();
  for (const w of block) if (low.includes(w)) return `contains the blocked word "${w}"`;
  return "";
}

/* ---------- schedule (India time) ---------- */
const IST_MS = 5.5 * 3600000;
export const istParts = (t: number) => { const d = new Date(t + IST_MS); return { date: d.toISOString().slice(0, 10), h: d.getUTCHours(), m: d.getUTCMinutes() }; };
const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** the run times of a day as "HH:MM" India time */
export function runTimes(s: SettingsMap): string[] {
  const typed = str(s["social.runTimes"]).split(",").map((x) => x.trim()).filter((x) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(x)).map((x) => { const [h, m] = x.split(":").map(Number); return hhmm(h! * 60 + m!); });
  if (typed.length) return [...new Set(typed)].sort();
  const runs = Math.max(1, Math.min(12, num(s["social.runsPerDay"], 4)));
  const a = Math.max(0, Math.min(23, num(s["social.window.startHour"], 7))) * 60, b = Math.max(a + 30, Math.min(24, num(s["social.window.endHour"], 21)) * 60);
  if (runs === 1) return [hhmm(Math.round((a + b) / 2))];
  return Array.from({ length: runs }, (_v, i) => hhmm(Math.round(a + ((b - a) * i) / (runs - 1))));
}

/** which slot (if any) is due now: the earliest run time already passed today that has not run yet (within 3 hours of its time) */
export function dueSlot(now: number, s: SettingsMap, slotsDone: string[], jitter: (slot: string) => number = () => 0): string | null {
  const { date, h, m } = istParts(now); const cur = h * 60 + m;
  for (const t of runTimes(s)) {
    const [th, tm] = t.split(":").map(Number); const at = th! * 60 + tm! + jitter(t);
    const key = `${date}@${t}`;
    if (!slotsDone.includes(key) && cur >= at && cur <= at + 180) return key;
  }
  return null;
}
