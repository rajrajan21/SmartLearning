import { z } from "zod";

export const TUTOR_MODES = ["explain", "example", "hint", "free"] as const;
export const AskRequest = z.object({
  topicId: z.string().uuid().optional(),
  questionId: z.string().uuid().optional(), // asking about a practice question; the topic is found from it
  anonId: z.string().uuid().optional(),
  question: z.string().trim().min(1).max(500),
  mode: z.enum(TUTOR_MODES).default("free"),
  lang: z.enum(["en", "ta"]).default("en"),
  history: z.array(z.object({ role: z.enum(["child", "teacher"]), text: z.string().max(800) })).max(4).default([]),
}).refine((d) => d.topicId || d.questionId, { message: "say which topic or question this is about" });
export type AskRequest = z.infer<typeof AskRequest>;

export const AskResponse = z.object({
  answer: z.string(),
  /** ai = written by the language model from the lesson; lesson = taken straight from the stored lesson */
  source: z.enum(["ai", "lesson", "safety"]),
  /** AI answers left today for this child (null when not limited) */
  remaining: z.number().nullable(),
});
export type AskResponse = z.infer<typeof AskResponse>;
