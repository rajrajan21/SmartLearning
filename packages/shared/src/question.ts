import { z } from "zod";
import { LocalizedText } from "./curriculum.js";
import { ContentStatus, LangAudio, Provenance } from "./lesson.js";

/** The four practice rounds. Difficulty rises with the round; each round tests a different kind of thinking. */
export const ROUNDS = [1, 2, 3, 4] as const;
export const ROUND_KEYS = { 1: "warmup", 2: "remember", 3: "apply", 4: "challenge" } as const;

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase letters, numbers and hyphens");

const base = {
  key: slug, // unique within the topic
  round: z.number().int().min(1).max(4),
  stem: LocalizedText,
  image: z.object({ assetKey: z.string(), altText: LocalizedText }).optional(), // alt text is mandatory for pictures
  hints: z.array(LocalizedText).max(2).default([]),
  explanation: LocalizedText, // shown after every answer: why the right answer is right
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
  accepted: z.array(z.string().min(1).max(60)).min(1), // every spelling or language that counts as right
  wrongAnswers: z.array(z.object({ text: z.string().min(1).max(60), why: LocalizedText })).default([]),
});
const OrderObj = z.object({
  ...base,
  type: z.literal("order"),
  items: z.array(z.object({ id: slug, text: LocalizedText })).min(2).max(8), // written in the CORRECT order
});

export const Question = z.discriminatedUnion("type", [McqObj, TrueFalseObj, NumberObj, ShortObj, OrderObj]).superRefine((q, ctx) => {
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
const pubBase = { id: z.string(), key: z.string(), round: z.number().int(), stem: LocalizedText, image: base.image, hints: z.array(LocalizedText), audio: z.object({ stem: LangAudio.optional() }).optional() };
export const PublicQuestion = z.discriminatedUnion("type", [
  z.object({ ...pubBase, type: z.literal("mcq"), options: z.array(z.object({ id: z.string(), text: LocalizedText })) }),
  z.object({ ...pubBase, type: z.literal("true_false") }),
  z.object({ ...pubBase, type: z.literal("number"), unit: LocalizedText.optional() }),
  z.object({ ...pubBase, type: z.literal("short") }),
  z.object({ ...pubBase, type: z.literal("order"), items: z.array(z.object({ id: z.string(), text: LocalizedText })) }),
]);
export type PublicQuestion = z.infer<typeof PublicQuestion>;

export const PracticeSet = z.object({ topicId: z.string(), questions: z.array(PublicQuestion) });
export type PracticeSet = z.infer<typeof PracticeSet>;

// ================= Answer contract =================
export const AnswerResponse = z.discriminatedUnion("type", [
  z.object({ type: z.literal("mcq"), optionId: z.string().max(60) }),
  z.object({ type: z.literal("true_false"), value: z.boolean() }),
  z.object({ type: z.literal("number"), value: z.number().finite() }),
  z.object({ type: z.literal("short"), text: z.string().max(100) }),
  z.object({ type: z.literal("order"), ids: z.array(z.string().max(60)).min(2).max(8) }),
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
  whyWrong: LocalizedText.optional(),
  correctAnswer: LocalizedText,
  audio: z.object({ explanation: LangAudio.optional(), whyWrong: LangAudio.optional() }).optional(),
  replay: z.boolean(), // true when this attemptId had already been recorded
});
export type AnswerFeedback = z.infer<typeof AnswerFeedback>;

/** Spoken stock phrases (praise, encouragement) so feedback sounds varied and human. Served by /api/v1/audio/phrases. */
/** A phrase may be written plainly as {"en": "...", "ta": "..."}; it is read as {text: {...}}. */
const Phrase = z.preprocess((v) => (v && typeof v === "object" && !("text" in v) ? { text: v } : v), z.object({ text: LocalizedText, audio: LangAudio.optional() }));
export const PhraseSet = z.record(z.string(), z.array(Phrase));
export type PhraseSet = z.infer<typeof PhraseSet>;
