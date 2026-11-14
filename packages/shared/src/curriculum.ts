import { z } from "zod";

export const LocalizedText = z.object({
  en: z.string().min(1),
  ta: z.string().min(1).optional(),
});
export type LocalizedText = z.infer<typeof LocalizedText>;

export const TopicSummary = z.object({
  id: z.string(),
  slug: z.string(),
  name: LocalizedText,
});
export const ChapterSummary = z.object({
  id: z.string(),
  slug: z.string(),
  position: z.number().int().positive(),
  name: LocalizedText,
  topics: z.array(TopicSummary),
});
export const SubjectOffering = z.object({
  id: z.string(),
  slug: z.string(),
  name: LocalizedText,
  chapters: z.array(ChapterSummary),
});
export const ClassOffering = z.object({
  classLevel: z.number().int().min(1).max(12),
  subjects: z.array(SubjectOffering),
});
export const BoardCurriculum = z.object({
  boardCode: z.string(),
  boardName: z.string(),
  academicYear: z.string(),
  classes: z.array(ClassOffering),
});
export type BoardCurriculum = z.infer<typeof BoardCurriculum>;
