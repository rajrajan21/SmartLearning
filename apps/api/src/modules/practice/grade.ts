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
    case "multi": {
      const ids = (r as { ids: string[] }).ids;
      if (new Set(ids).size !== ids.length || !ids.every((x) => q.options.some((o) => o.id === x))) return { error: "That choice does not exist" };
      const right = q.options.filter((o) => o.correct);
      const correct = ids.length === right.length && right.every((o) => ids.includes(o.id));
      return { correct, correctAnswer: joinText(right.map((o) => o.text)) };
    }
    case "match": {
      const pairs = (r as { pairs: { left: string; right: string }[] }).pairs;
      const lefts = new Set(pairs.map((p) => p.left));
      if (pairs.length !== q.pairs.length || lefts.size !== pairs.length || !pairs.every((p) => q.pairs.some((x) => x.id === p.left) && q.pairs.some((x) => x.id === p.right))) return { error: "Match every item exactly once" };
      const correct = pairs.every((p) => p.left === p.right);
      return { correct, correctAnswer: matchText(q) };
    }
    case "long": {
      const t = normText((r as { text: string }).text);
      const hit = q.keyPoints.filter((k) => k.anyOf.some((w) => t.includes(normText(w)))).length;
      const need = q.passAt ?? Math.ceil(q.keyPoints.length / 2);
      return { correct: hit >= need, ...(hit >= need ? {} : { whyWrong: both(`You covered ${hit} of the ${q.keyPoints.length} key points. Try to mention: ${q.keyPoints.map((k) => k.label.en).join("; ")}.`) }), correctAnswer: q.modelAnswer };
    }
  }
}

const joinText = (xs: L[]): L => both(xs.map((x) => x.en).join(", "), xs.every((x) => x.ta) ? xs.map((x) => x.ta).join(", ") : undefined);
const matchText = (q: Extract<Question, { type: "match" }>): L => {
  const j = (lang: "en" | "ta") => q.pairs.map((p) => `${p.left[lang] ?? p.left.en} = ${p.right[lang] ?? p.right.en}`).join("; ");
  return both(j("en"), q.pairs.every((p) => p.left.ta && p.right.ta) ? j("ta") : undefined);
};

/** The right answer as text, for the parent's answer key. Never sent to students. */
export function correctAnswerOf(q: Question): L {
  switch (q.type) {
    case "mcq": return q.options.find((o) => o.correct)!.text;
    case "true_false": return q.answer ? both("True", "சரி") : both("False", "தவறு");
    case "number": return both(`${q.answer}${q.unit ? ` ${q.unit.en}` : ""}`, `${q.answer}${q.unit ? ` ${q.unit.ta ?? q.unit.en}` : ""}`);
    case "short": return both(q.accepted[0]!);
    case "order": return both(q.items.map((i) => i.text.en).join(" → "), q.items.every((i) => i.text.ta) ? q.items.map((i) => i.text.ta).join(" → ") : undefined);
    case "multi": return joinText(q.options.filter((o) => o.correct).map((o) => o.text));
    case "match": return matchText(q);
    case "long": return q.modelAnswer;
  }
}

/** The version students receive: no answers, no explanations. Ordering items are scrambled so the list does not give the answer away. */
export function toPublic(id: string, q: Question): PublicQuestion {
  const common = { id, key: q.key, round: q.round, stem: q.stem, ...(q.passage ? { passage: q.passage } : {}), ...(q.image ? { image: q.image } : {}), hints: q.hints };
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
    case "multi": return { ...common, type: "multi", options: q.options.map((o) => ({ id: o.id, text: o.text })) };
    case "match": {
      const rights = q.pairs.map((p) => ({ id: p.id, text: p.right })).sort((a, b) => sha(id + a.id).localeCompare(sha(id + b.id)));
      if (rights.every((x, i) => x.id === q.pairs[i]!.id)) rights.push(rights.shift()!);
      return { ...common, type: "match", lefts: q.pairs.map((p) => ({ id: p.id, text: p.left })), rights };
    }
    case "long": return { ...common, type: "long" };
  }
}
const sha = (s: string) => createHash("sha1").update(s).digest("hex");
