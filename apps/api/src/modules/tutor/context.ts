import type { TopicLesson } from "@studysmart/shared";

type L = { en: string; ta?: string };
const pick = (t: L | undefined, lang: "en" | "ta") => (t ? (lang === "ta" ? t.ta ?? t.en : t.en) : "");
export interface Passage { id: string; text: string }

/** The lesson as small passages the helper may use: everything it says comes from here. */
export function passagesOf(lesson: TopicLesson, lang: "en" | "ta"): Passage[] {
  const out: Passage[] = [];
  for (const b of lesson.blocks) {
    if (b.type === "explanation" || b.type === "story") out.push({ id: b.id, text: pick(b.text, lang) });
    else if (b.type === "worked_example") out.push({ id: b.id, text: [`Problem: ${pick(b.problem, lang)}`, ...b.steps.map((s, i) => `Step ${i + 1}: ${pick(s.text, lang)}${s.why ? ` (Why: ${pick(s.why, lang)})` : ""}`)].join("\n") });
    else if (b.type === "teacher_narration") {
      const lines = b.sentences.map((x) => pick(x.spoken ? { en: x.spoken.en ?? x.text.en, ta: x.spoken.ta ?? x.text.ta } : x.text, lang));
      for (let i = 0; i < lines.length; i += 3) out.push({ id: `${b.id}#${i / 3}`, text: lines.slice(i, i + 3).join(" ") });
    } else if (b.type === "summary") out.push({ id: b.id, text: [...b.points.map((p) => pick(p, lang)), ...b.formulas].join("\n") });
    else if (b.type === "teach_back") out.push({ id: b.id, text: [pick(b.prompt, lang), ...b.requiredIdeas.map((x) => pick(x, lang))].join("\n") });
  }
  return out.filter((p) => p.text.trim().length > 0);
}

const STOP = new Set("a an the is are was were am be been do does did of to in on at for and or but if it its this that these those what why how when which who whom can could will would should i you we they he she me my your our us with as by from about not no yes please tell explain give example again more".split(" "));
const tokens = (t: string) => (t.toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w)).filter((w) => w.length > 1 && !STOP.has(w));

/** Best matching passages for a question (simple word overlap: free, instant, works for Tamil too). */
export function retrieve(passages: Passage[], query: string, k: number): { passage: Passage; score: number }[] {
  const q = new Set(tokens(query));
  if (q.size === 0) return [];
  return passages
    .map((p) => { const pt = new Set(tokens(p.text)); let score = 0; for (const w of q) if (pt.has(w)) score += Math.min(3, 1 + w.length / 5); return { passage: p, score }; })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
