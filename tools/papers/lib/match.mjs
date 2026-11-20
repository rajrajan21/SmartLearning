// Matches a question to a chapter of the curriculum (content/curriculum/*.json) by shared words. Best effort: unmatched questions simply have no chapter.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./store.mjs";

const STOP = new Set("the and for with that this from into what which when where about their have your are was were has had how why who whom does did not you can will shall one two three using use give state write name explain describe define find class chapter".split(" "));
const toks = (s) => (s.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !STOP.has(w)).map((w) => w.replace(/(ing|es|s)$/, ""));

export function loadCurriculum(dir = join(ROOT, "content/curriculum")) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    try { const j = JSON.parse(readFileSync(join(dir, f), "utf8")); for (const c of j.classes ?? []) for (const s of c.subjects ?? []) out.push({ board: String(j.boardCode ?? "").toLowerCase(), cls: c.classLevel, subject: s.name?.en ?? s.slug, chapters: (s.chapters ?? []).map((ch) => ({ name: ch.name?.en ?? ch.slug, words: new Set(toks([ch.name?.en ?? "", ...(ch.topics ?? []).map((t) => t.name?.en ?? "")].join(" "))), title: new Set(toks(ch.name?.en ?? "")) })) }); } catch { /* skip unreadable file */ }
  }
  return out;
}
export function chapterMatcher(curr, cls, subject) {
  const subj = (subject ?? "").toLowerCase();
  const pool = curr.filter((c) => c.cls === cls && (c.subject.toLowerCase().includes(subj) || subj.includes(c.subject.toLowerCase())));
  if (!pool.length) return () => undefined;
  const chapters = pool.flatMap((p) => p.chapters);
  return (text) => {
    const t = new Set(toks(text)); let best = null, bs = 0;
    for (const ch of chapters) {
      let hit = 0; for (const w of ch.title) if (t.has(w)) hit += 2; for (const w of ch.words) if (t.has(w)) hit += 1;
      if (hit > bs) { bs = hit; best = ch; }
    }
    return bs >= 3 ? best.name : undefined;
  };
}
