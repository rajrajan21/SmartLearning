import { z } from "zod";
import { LocalizedText } from "./curriculum.js";

export const Provenance = z.enum([
  "original",
  "ai_drafted_reviewed",
  "licensed",
  "govt_open",
]);
export type Provenance = z.infer<typeof Provenance>;

const base = {
  id: z.string().min(1),
  provenance: Provenance,
  objectiveIds: z.array(z.string()).optional(),
};

export const BoardAction = z.discriminatedUnion("op", [
  z.object({ op: z.literal("write"), text: z.string() }),
  z.object({
    op: z.literal("draw"),
    shape: z.enum(["circle", "rect", "line", "triangle", "arrow"]),
    label: z.string().optional(),
  }),
  z.object({ op: z.literal("point"), target: z.string() }),
  z.object({ op: z.literal("clear") }),
]);

export const NarrationSentence = z.object({
  id: z.string(),
  text: LocalizedText,
  audioKey: z.string().nullable().default(null),
  videoKey: z.string().nullable().default(null), // reserved for later lip-sync clips
  board: z.array(BoardAction).default([]),
  checkpointQuestionId: z.string().nullable().default(null),
});

export const ExplanationBlock = z.object({
  ...base,
  type: z.literal("explanation"),
  text: LocalizedText,
  keepEnglishTerms: z.array(z.string()).default([]),
});
export const StoryBlock = z.object({
  ...base,
  type: z.literal("story"),
  title: LocalizedText,
  text: LocalizedText,
});
export const WorkedExampleBlock = z.object({
  ...base,
  type: z.literal("worked_example"),
  problem: LocalizedText,
  steps: z.array(z.object({ text: LocalizedText, why: LocalizedText.optional() })).min(1),
});
export const DiagramBlock = z.object({
  ...base,
  type: z.enum(["image", "diagram"]),
  assetKey: z.string(),
  altText: LocalizedText, // mandatory for accessibility
  caption: LocalizedText.optional(),
});
export const TeacherNarrationBlock = z.object({
  ...base,
  type: z.literal("teacher_narration"),
  teacher: z.string(),
  sentences: z.array(NarrationSentence).min(1),
});
export const QuizBlock = z.object({
  ...base,
  type: z.literal("quiz"),
  questionIds: z.array(z.string()).min(1),
});
export const TeachBackBlock = z.object({
  ...base,
  type: z.literal("teach_back"),
  prompt: LocalizedText,
  requiredIdeas: z.array(LocalizedText).min(1),
  commonMisconceptions: z.array(LocalizedText).default([]),
});
export const SummaryBlock = z.object({
  ...base,
  type: z.literal("summary"),
  points: z.array(LocalizedText).min(1),
  formulas: z.array(z.string()).default([]),
});

export const ContentBlock = z.discriminatedUnion("type", [
  ExplanationBlock,
  StoryBlock,
  WorkedExampleBlock,
  DiagramBlock,
  TeacherNarrationBlock,
  QuizBlock,
  TeachBackBlock,
  SummaryBlock,
]);
export type ContentBlock = z.infer<typeof ContentBlock>;

export const ContentStatus = z.enum(["draft", "review", "approved", "published", "archived"]);

export const TopicLesson = z.object({
  topicId: z.string(),
  version: z.number().int().positive(),
  status: ContentStatus,
  title: LocalizedText,
  blocks: z.array(ContentBlock).min(1),
});
export type TopicLesson = z.infer<typeof TopicLesson>;
