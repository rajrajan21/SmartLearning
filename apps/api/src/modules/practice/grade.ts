import { createHash } from "node:crypto";
import type { AnswerResponse, LocalizedText, PublicQuestion, Question } from "@studysmart/shared";

type L = { en: string; ta?: string };
export interface Grade { correct: boolean; whyWrong?: L; correctAnswer: L }

/** Compare short answers fairly: ignore case, extra spaces, and trailing punctuation. */
export const normText = (s: string): string => s.normalize("NFC").trim().toLowerCase().replace(/[.!?,;:]+$/u, "").replace(/\s+/gu, " ");

const both = (en: string, ta?: string): L => ({ en, ...(ta ? { ta } : {}) });

/** Grades one response. Pure function: easy to test and the single place that decides right or wrong. */
export function grade(q: Question, r: AnswerResponse): Grade | { error: string } {
  if (q.type !== r.type) return { error: `This question needs a "${q.type}" answer` };
  switch (q.type) {
    case "mcq": {
      const chosen = q.options.find((o) => o.id === (r as { optionId: string }).optionId);
      if (!chosen) return { error: "That choice does not exist" };
      const right = q.options.find((o) => o.correct)!;
      return { correct: chosen.correct, ...(chosen.correct || !chosen.whyWrong ? {} : { whyWrong: chosen.whyWrong }), correctAnswer: right.text };
    }
    case "true_false": {
      const v = (r as { value: boolean }).value;
      return { correct: v === q.answer, correctAnswer: q.answer ? both("True", "சரி") : both("False", "தவறு") };
    }
    case "number": {
      const v = (r as { value: number }).value;
      const correct = Math.abs(v - q.answer) <= q.tolerance + 1e-9;
      const slip = correct ? undefined : q.wrongAnswers.find((w) => Math.abs(w.value - v) <= 1e-9);
      const unit = q.unit;
      const show = (u?: string) => `${q.answer}${u ? ` ${u}` : ""}`;
      return { correct, ...(slip ? { whyWrong: slip.why } : {}), correctAnswer: both(show(unit?.en), show(unit?.ta ?? unit?.en)) };
    }
    case "short": {
      const t = normText((r as { text: string }).text);
      const correct = q.accepted.some((a) => normText(a) === t);
      const slip = correct ? undefined : q.wrongAnswers.find((w) => normText(w.text) === t);
      return { correct, ...(slip ? { whyWrong: slip.why } : {}), correctAnswer: both(q.accepted[0]!) };
    }
    case "order": {
      const ids = (r as { ids: string[] }).ids;
      const want = q.items.map((i) => i.id);
      if (ids.length !== want.length || new Set(ids).size !== ids.length || !ids.every((x) => want.includes(x))) return { error: "Send every item exactly once" };
      const correct = ids.every((x, i) => x === want[i]);
      const join = (lang: "en" | "ta") => q.items.map((i) => i.text[lang] ?? i.text.en).join(" → ");
      return { correct, correctAnswer: both(join("en"), q.items.every((i) => i.text.ta) ? join("ta") : undefined) };
    }
  }
}

/** The version students receive: no answers, no explanations. Ordering items are scrambled so the list does not give the answer away. */
export function toPublic(id: string, q: Question): PublicQuestion {
  const common = { id, key: q.key, round: q.round, stem: q.stem, ...(q.image ? { image: q.image } : {}), hints: q.hints };
  switch (q.type) {
    case "mcq": return { ...common, type: "mcq", options: q.options.map((o) => ({ id: o.id, text: o.text })) };
    case "true_false": return { ...common, type: "true_false" };
    case "number": return { ...common, type: "number", ...(q.unit ? { unit: q.unit as LocalizedText } : {}) };
    case "short": return { ...common, type: "short" };
    case "order": {
      const items = q.items.map((i) => ({ id: i.id, text: i.text })).sort((a, b) => sha(id + a.id).localeCompare(sha(id + b.id)));
      // if the scramble happens to equal the answer, rotate by one
      if (items.every((x, i) => x.id === q.items[i]!.id)) items.push(items.shift()!);
      return { ...common, type: "order", items };
    }
  }
}
const sha = (s: string) => createHash("sha1").update(s).digest("hex");
