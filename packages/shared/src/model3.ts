import { z } from "zod";

export const Model3Beat = z.object({
  en: z.string().min(1),
  speakEn: z.string().optional(),
  tanglish: z.string().optional(),
  speakTanglish: z.string().optional(),
  ta: z.string().optional(),
  speakTa: z.string().optional(),
});
export type Model3Beat = z.infer<typeof Model3Beat>;

export const Model3Cue = z.object({
  b: z.number().int().min(0),
  at: z.number().min(0).max(1),
  type: z.tuple([z.string().min(1), z.string().min(1), z.number().int().min(100).max(8000)]),
  color: z.enum(["green", "yellow", "cyan", "pink", "red", "white"]).optional(),
});
export type Model3Cue = z.infer<typeof Model3Cue>;

export const Model3Step = z.object({
  id: z.string().min(1),
  pill: z.string().min(1),
  kind: z.enum(["chalkboard", "interactive-lab"]),
  autoStop: z.boolean().optional(),
  confirmPrompt: z.string().optional(),
  labType: z.string().optional(),
  labTitle: z.string().optional(),
  labParams: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).optional(),
  textbookBox: z.object({
    ref: z.string().min(1),
    concept: z.string().min(1),
    example: z.string().optional(),
  }).optional(),
  tip: z.string().optional(),
  beats: z.array(Model3Beat).min(1),
  cues: z.array(Model3Cue).default([]),
});
export type Model3Step = z.infer<typeof Model3Step>;

export const Model3Lesson = z.object({
  id: z.string().min(1),
  model: z.literal("3.0"),
  board: z.string().min(1),
  classLevel: z.number().int().min(1).max(12),
  subject: z.string().min(1),
  chapter: z.string().min(1),
  title: z.string().min(1),
  textbookRef: z.string().min(1),
  levels: z.object({
    "1": z.array(Model3Step).min(1),
    "2": z.array(Model3Step).min(1),
  }),
});
export type Model3Lesson = z.infer<typeof Model3Lesson>;
