import { z } from "zod";
import { LocalizedText } from "./curriculum.js";
import { ContentStatus, LangAudio, Provenance } from "./lesson.js";

/** The four practice rounds. Difficulty rises with the round; each round tests a different kind of thinking. */
export const ROUNDS = [1, 2, 3, 4] as const;
export const ROUND_KEYS = { 1: "warmup", 2: "remember", 3: "apply", 4: "challenge" } as const;

/** Question source/difficulty tiers: Textbook exercises first, then School/Online Exam extra, then Level 2 / Advanced. */
export const QUESTION_TIERS = ["textbook", "exam", "advanced"] as const;
export const QuestionTier = z.enum(QUESTION_TIERS);
export type QuestionTier = z.infer<typeof QuestionTier>;

/** Default marks for a question based on explicit marks or tier. */
export function defaultMarksFor(q: { marks?: number; tier?: QuestionTier; round?: number; type?: string }): number {
  if (typeof q.marks === "number" && Number.isInteger(q.marks) && q.marks >= 1) return q.marks;
  if (q.tier === "advanced") return 3;
  if (q.tier === "exam") return 2;
  if (q.tier === "textbook") return 1;
  if (q.type === "long") return 3;
  return 1;
}

const UNIT_ALIASES: [RegExp, string][] = [
  [/\bsq\.?\s*cm\b|\bsquare\s+centimet(?:re|er)s?\b|\bcm\s*[²^]2?\b|\bcm2\b/gi, "cm2"],
  [/\bsq\.?\s*m\b|\bsquare\s+met(?:re|er)s?\b|\bm\s*[²^]2?\b|\bm2\b/gi, "m2"],
  [/\bsq\.?\s*mm\b|\bsquare\s+millimet(?:re|er)s?\b|\bmm\s*[²^]2?\b|\bmm2\b/gi, "mm2"],
  [/\bsq\.?\s*km\b|\bsquare\s+kilomet(?:re|er)s?\b|\bkm\s*[²^]2?\b|\bkm2\b/gi, "km2"],
  [/\bsq\.?\s*units?\b|\bsquare\s+units?\b/gi, "sq units"],
  [/\bcentimet(?:re|er)s?\b/gi, "cm"],
  [/\bmillimet(?:re|er)s?\b/gi, "mm"],
  [/\bkilomet(?:re|er)s?\b/gi, "km"],
  [/\bmet(?:re|er)s?\b/gi, "m"],
  [/\bkilograms?\b/gi, "kg"],
  [/\bgrams?\b/gi, "g"],
  [/\blit(?:re|er)s?\b/gi, "l"],
  [/\bdegrees?\b|°/gi, "deg"],
];

/** Normalizes a fill-in-the-blank or short answer fairly (case, spaces, commas, trailing punctuation, unit spellings). */
export function smartNormalizeAnswer(raw: string): string {
  let s = raw.normalize("NFC").trim().toLowerCase();
  s = s.replace(/[.!?,;:]+$/u, "");
  // Normalize superscripts and caret powers (e.g. cm² / cm^2 -> cm2)
  s = s.replace(/²|\^\s*2/g, "2").replace(/³|\^\s*3/g, "3");
  // Remove thousands commas inside numbers (e.g. 21,600 or 1,25,000 -> 21600 / 125000)
  s = s.replace(/(?<=\d),(?=\d{2,3}\b)/g, "");
  // Separate glued number + unit (e.g. "40cm" -> "40 cm", "15cm2" -> "15 cm2")
  s = s.replace(/(\d)([a-zA-Z°])/g, "$1 $2");
  for (const [rx, rep] of UNIT_ALIASES) s = s.replace(rx, rep);
  s = s.replace(/\s+/gu, " ").trim();
  return s;
}

/** Parses simple numeric or fraction strings ("0.5", "1/2", "-3.50") to a finite number, or null. */
export function parseNumericValue(norm: string): number | null {
  const frac = norm.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (frac) {
    const den = Number(frac[2]);
    if (den !== 0 && Number.isFinite(den)) return Number(frac[1]) / den;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(norm)) {
    const n = Number(norm);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Smart auto-grader for fill-in-the-blank and short answers.
 * Accepts case/space/comma/punctuation/unit variations and simple fraction/decimal equivalents.
 */
export function answersMatch(studentRaw: string, acceptedList: string[], unit?: string): boolean {
  const st = smartNormalizeAnswer(studentRaw);
  if (!st) return false;
  const normUnit = unit ? smartNormalizeAnswer(unit) : "";
  const stripUnit = (s: string) => {
    const m = s.match(/^(-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?)\s+([a-z0-9 ]+)$/);
    return m ? { numPart: m[1]!.trim(), unitPart: m[2]!.trim() } : null;
  };
  const stSplit = stripUnit(st);
  const stNum = parseNumericValue(st) ?? (stSplit && (!normUnit || stSplit.unitPart === normUnit) ? parseNumericValue(stSplit.numPart) : null);

  for (const accRaw of acceptedList) {
    const acc = smartNormalizeAnswer(accRaw);
    if (st === acc) return true;
    // Match when one omits the optional unit and the other includes it
    const accSplit = stripUnit(acc);
    if (stSplit && !accSplit && stSplit.numPart === acc && (!normUnit || stSplit.unitPart === normUnit)) return true;
    if (accSplit && !stSplit && accSplit.numPart === st) return true;
    if (stSplit && accSplit && stSplit.unitPart === accSplit.unitPart && stSplit.numPart === accSplit.numPart) return true;
    // Fraction / decimal equivalence (e.g. 1/2 == 0.5, 40.0 == 40, "15 sq cm" == "15.0 cm2")
    const accNum = parseNumericValue(acc) ?? (accSplit ? parseNumericValue(accSplit.numPart) : null);
    if (stNum !== null && accNum !== null && Math.abs(stNum - accNum) <= 1e-6) {
      if (!stSplit || !accSplit || stSplit.unitPart === accSplit.unitPart) return true;
    }
  }
  return false;
}

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase letters, numbers and hyphens");

const base = {
  key: slug, // unique within the topic
  round: z.number().int().min(1).max(4),
  tier: QuestionTier.optional(),
  marks: z.number().int().min(1).max(10).optional(),
  stem: LocalizedText,
  passage: LocalizedText.optional(), // case-based questions: a short passage, table or situation shown above the question
  image: z.object({ assetKey: z.string(), altText: LocalizedText }).optional(), // alt text is mandatory for pictures
  hint: LocalizedText.optional(), // single-hint shorthand (merged with hints)
  hints: z.array(LocalizedText).max(2).default([]),
  explanation: LocalizedText, // shown after every answer: why the right answer is right
  solutionSteps: z.array(LocalizedText).max(8).optional(),
  source: z.string().max(120).optional(),
  sourceUrl: z.string().max(300).optional(),
  provenance: Provenance,
  status: ContentStatus,
};

const McqObj = z.object({
  ...base,
  type: z.literal("mcq"),
  options: z.array(z.object({
    id: slug,
    text: LocalizedText,
    correct: z.boolean().default(false),
    whyWrong: LocalizedText.optional(), // shown when a student picks this wrong option
  })).min(2).max(5),
});
const TrueFalseObj = z.object({ ...base, type: z.literal("true_false"), answer: z.boolean() });
const NumberObj = z.object({
  ...base,
  type: z.literal("number"),
  answer: z.number(),
  tolerance: z.number().min(0).default(0),
  unit: LocalizedText.optional(),
  wrongAnswers: z.array(z.object({ value: z.number(), why: LocalizedText })).default([]), // typical slips and what they mean
});
const ShortObj = z.object({
  ...base,
  type: z.literal("short"),
  accepted: z.array(z.string().min(1).max(80)).min(1), // every spelling or language that counts as right
  unit: LocalizedText.optional(),
  wrongAnswers: z.array(z.object({ text: z.string().min(1).max(80), why: LocalizedText })).default([]),
});
const FillObj = z.object({
  ...base,
  type: z.literal("fill"), // fill-in-the-blank (supports inline ___ blanks and multiple acceptable aliases)
  accepted: z.array(z.string().min(1).max(80)).min(1),
  unit: LocalizedText.optional(),
  wrongAnswers: z.array(z.object({ text: z.string().min(1).max(80), why: LocalizedText })).default([]),
});
const OrderObj = z.object({
  ...base,
  type: z.literal("order"),
  items: z.array(z.object({ id: slug, text: LocalizedText })).min(2).max(8), // written in the CORRECT order
});

const MultiObj = z.object({
  ...base,
  type: z.literal("multi"), // choose ALL the right answers
  options: z.array(z.object({ id: slug, text: LocalizedText, correct: z.boolean().default(false) })).min(3).max(6),
});
const MatchObj = z.object({
  ...base,
  type: z.literal("match"), // matching pairs; with an image and letters A, B, C on the left it is diagram labelling
  pairs: z.array(z.object({ id: slug, left: LocalizedText, right: LocalizedText })).min(2).max(6), // written as the CORRECT pairs
});
const LongObj = z.object({
  ...base,
  type: z.literal("long"), // written answer marked by key points (a point counts when any of its words appears)
  modelAnswer: LocalizedText,
  keyPoints: z.array(z.object({ label: LocalizedText, anyOf: z.array(z.string().min(1).max(40)).min(1).max(8) })).min(2).max(6),
  passAt: z.number().int().min(1).max(6).optional(), // key points needed; default is half, rounded up
});

export const Question = z.discriminatedUnion("type", [McqObj, TrueFalseObj, NumberObj, ShortObj, FillObj, OrderObj, MultiObj, MatchObj, LongObj]).superRefine((q, ctx) => {
  if (q.type === "multi") {
    const n = q.options.filter((o) => o.correct).length;
    if (n < 1 || n >= q.options.length) ctx.addIssue({ code: "custom", path: ["options"], message: "mark at least one and not all options as correct" });
    if (new Set(q.options.map((o) => o.id)).size !== q.options.length) ctx.addIssue({ code: "custom", path: ["options"], message: "option ids must be unique" });
  }
  if (q.type === "match" && new Set(q.pairs.map((p) => p.id)).size !== q.pairs.length) ctx.addIssue({ code: "custom", path: ["pairs"], message: "pair ids must be unique" });
  if (q.type === "long" && q.passAt && q.passAt > q.keyPoints.length) ctx.addIssue({ code: "custom", path: ["passAt"], message: "passAt is more than the key points" });
  if (q.type === "mcq") {
    if (q.options.filter((o) => o.correct).length !== 1) ctx.addIssue({ code: "custom", path: ["options"], message: "exactly one option must be correct" });
    if (new Set(q.options.map((o) => o.id)).size !== q.options.length) ctx.addIssue({ code: "custom", path: ["options"], message: "option ids must be unique" });
    q.options.forEach((o, i) => { if (!o.correct && !o.whyWrong) ctx.addIssue({ code: "custom", path: ["options", i, "whyWrong"], message: "every wrong option needs a 'why wrong' explanation" }); });
  }
  if (q.type === "order" && new Set(q.items.map((i) => i.id)).size !== q.items.length) ctx.addIssue({ code: "custom", path: ["items"], message: "item ids must be unique" });
});
export type Question = z.infer<typeof Question>;

/** content/questions/*.json */
export const QuestionImport = z.object({
  board: z.string().regex(/^[A-Za-z0-9_-]{1,20}$/),
  classLevel: z.number().int().min(1).max(12),
  subject: slug,
  chapter: slug,
  topic: slug,
  questions: z.array(Question).min(1),
}).superRefine((d, ctx) => {
  const seen = new Set<string>();
  d.questions.forEach((q, i) => { if (seen.has(q.key)) ctx.addIssue({ code: "custom", path: ["questions", i, "key"], message: `duplicate question key "${q.key}"` }); seen.add(q.key); });
});
export type QuestionImport = z.infer<typeof QuestionImport>;

// ================= What students receive (never contains answers) =================
const pubBase = {
  id: z.string(),
  key: z.string(),
  round: z.number().int(),
  tier: QuestionTier.optional(),
  marks: z.number().int().min(1).max(10).optional(),
  source: z.string().max(120).optional(),
  sourceUrl: z.string().max(300).optional(),
  hasSolutionSteps: z.boolean().optional(),
  stem: LocalizedText,
  passage: LocalizedText.optional(),
  image: base.image,
  hints: z.array(LocalizedText),
  audio: z.object({ stem: LangAudio.optional() }).optional(),
};
export const PublicQuestion = z.discriminatedUnion("type", [
  z.object({ ...pubBase, type: z.literal("mcq"), options: z.array(z.object({ id: z.string(), text: LocalizedText })) }),
  z.object({ ...pubBase, type: z.literal("true_false") }),
  z.object({ ...pubBase, type: z.literal("number"), unit: LocalizedText.optional() }),
  z.object({ ...pubBase, type: z.literal("short"), unit: LocalizedText.optional() }),
  z.object({ ...pubBase, type: z.literal("fill"), unit: LocalizedText.optional() }),
  z.object({ ...pubBase, type: z.literal("order"), items: z.array(z.object({ id: z.string(), text: LocalizedText })) }),
  z.object({ ...pubBase, type: z.literal("multi"), options: z.array(z.object({ id: z.string(), text: LocalizedText })) }),
  z.object({ ...pubBase, type: z.literal("match"), lefts: z.array(z.object({ id: z.string(), text: LocalizedText })), rights: z.array(z.object({ id: z.string(), text: LocalizedText })) }),
  z.object({ ...pubBase, type: z.literal("long") }),
]);
export type PublicQuestion = z.infer<typeof PublicQuestion>;

export const PracticeSet = z.object({ topicId: z.string(), questions: z.array(PublicQuestion) });
export type PracticeSet = z.infer<typeof PracticeSet>;

// ================= Answer contract =================
export const AnswerResponse = z.discriminatedUnion("type", [
  z.object({ type: z.literal("mcq"), optionId: z.string().max(60) }),
  z.object({ type: z.literal("true_false"), value: z.boolean() }),
  z.object({ type: z.literal("number"), value: z.number().finite() }),
  z.object({ type: z.literal("short"), text: z.string().max(120) }),
  z.object({ type: z.literal("fill"), text: z.string().max(120) }),
  z.object({ type: z.literal("order"), ids: z.array(z.string().max(60)).min(2).max(8) }),
  z.object({ type: z.literal("multi"), ids: z.array(z.string().max(60)).max(6) }),
  z.object({ type: z.literal("match"), pairs: z.array(z.object({ left: z.string().max(60), right: z.string().max(60) })).min(2).max(6) }),
  z.object({ type: z.literal("long"), text: z.string().max(600) }),
]);
export type AnswerResponse = z.infer<typeof AnswerResponse>;

export const AnswerRequest = z.object({
  attemptId: z.string().uuid(), // made by the app once per question shown: retrying the same request never double counts
  anonId: z.string().uuid(), // random id kept on the device until accounts arrive; no personal data
  questionId: z.string().uuid(),
  hintsUsed: z.number().int().min(0).max(2).default(0),
  response: AnswerResponse,
});
export type AnswerRequest = z.infer<typeof AnswerRequest>;

export const AnswerFeedback = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  correct: z.boolean(),
  explanation: LocalizedText,
  solutionSteps: z.array(LocalizedText).optional(),
  whyWrong: LocalizedText.optional(),
  correctAnswer: LocalizedText,
  marksAwarded: z.number().int().min(0).optional(),
  maxMarks: z.number().int().min(1).optional(),
  audio: z.object({ explanation: LangAudio.optional(), whyWrong: LangAudio.optional() }).optional(),
  replay: z.boolean(), // true when this attemptId had already been recorded
});
export type AnswerFeedback = z.infer<typeof AnswerFeedback>;

/** Spoken stock phrases (praise, encouragement) so feedback sounds varied and human. Served by /api/v1/audio/phrases. */
/** A phrase may be written plainly as {"en": "...", "ta": "..."}; it is read as {text: {...}}. */
const Phrase = z.preprocess((v) => (v && typeof v === "object" && !("text" in v) ? { text: v } : v), z.object({ text: LocalizedText, audio: LangAudio.optional() }));
export const PhraseSet = z.record(z.string(), z.array(Phrase));
export type PhraseSet = z.infer<typeof PhraseSet>;
