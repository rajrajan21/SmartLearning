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

/** Recorded speech for one sentence in one language (filled in by the server from the audio manifest). */
export const AudioRef = z.object({
  url: z.string(),
  durationMs: z.number().int().positive(),
  /** word timings in ms from the start of the clip, for highlighting */
  words: z.array(z.object({ w: z.string(), t: z.number(), d: z.number() })).default([]),
});
export type AudioRef = z.infer<typeof AudioRef>;

export const LangAudio = z.object({ en: AudioRef.optional(), ta: AudioRef.optional() });
export type LangAudio = z.infer<typeof LangAudio>;

export const NarrationSentence = z.object({
  id: z.string(),
  text: LocalizedText,
  /** How it is SPOKEN when that differs from how it is written (numbers, symbols, hard words). Defaults to `text`. */
  spoken: z.object({ en: z.string().optional(), ta: z.string().optional() }).optional(),
  /** Pause after this sentence (ms) to let the student act; overrides the site-wide gap. */
  pauseAfterMs: z.number().int().min(0).max(15000).optional(),
  audioKey: z.string().nullable().default(null),
  audio: LangAudio.default({}),
  videoKey: z.string().nullable().default(null), // reserved for later lip-sync clips
  board: z.array(BoardAction).default([]),
  checkpointQuestionId: z.string().nullable().default(null),
});

export type NarrationSentence = z.infer<typeof NarrationSentence>;

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

// ================= Lesson import files (content/lessons/*.json) =================
const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Authors write the lesson without topicId/version: the server finds the topic by its path and numbers versions itself. */
export const LessonBody = TopicLesson.omit({ topicId: true, version: true });
export const LessonImport = z
  .object({
    board: z.string().regex(/^[A-Za-z0-9_-]{1,20}$/),
    classLevel: z.number().int().min(1).max(12),
    subject: z.string().regex(slugRe),
    chapter: z.string().regex(slugRe),
    topic: z.string().regex(slugRe),
    lesson: LessonBody,
  })
  .superRefine((d, ctx) => {
    const seen = new Set<string>();
    d.lesson.blocks.forEach((b, i) => {
      if (seen.has(b.id)) ctx.addIssue({ code: "custom", path: ["lesson", "blocks", i, "id"], message: `Duplicate block id "${b.id}"` });
      seen.add(b.id);
      if (b.type === "teacher_narration") {
        const ids = new Set<string>();
        b.sentences.forEach((s, j) => {
          if (ids.has(s.id)) ctx.addIssue({ code: "custom", path: ["lesson", "blocks", i, "sentences", j, "id"], message: `Duplicate sentence id "${s.id}"` });
          ids.add(s.id);
        });
      }
    });
  });
export type LessonImport = z.infer<typeof LessonImport>;
export const lessonPath = (d: Pick<LessonImport, "classLevel" | "subject" | "chapter" | "topic">) => `${d.classLevel}/${d.subject}/${d.chapter}/${d.topic}`;
