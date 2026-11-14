import { z } from "zod";

export const LocalizedText = z.object({
  en: z.string().min(1),
  ta: z.string().min(1).optional(),
});
export type LocalizedText = z.infer<typeof LocalizedText>;

export const TextbookInfo = z.object({
  title: z.string().min(1),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  sourceRef: z.string().optional(), // reference only; never copied textbook text
});
export type TextbookInfo = z.infer<typeof TextbookInfo>;

// ================= API response shapes (what the web app consumes) =================
export const TopicSummary = z.object({ id: z.string(), slug: z.string(), name: LocalizedText });
export const ChapterSummary = z.object({
  id: z.string(),
  slug: z.string(),
  position: z.number().int().positive(),
  name: LocalizedText,
  topics: z.array(TopicSummary).default([]),
});
export const SubjectOffering = z.object({
  id: z.string(),
  slug: z.string(),
  name: LocalizedText,
  textbook: TextbookInfo.optional(),
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

export const Objective = z.object({
  text: LocalizedText,
  competencyCode: z.string().optional(),
});
export const TopicRef = z.object({
  classLevel: z.number().int(),
  subjectSlug: z.string(),
  chapterSlug: z.string(),
  topicSlug: z.string(),
  name: LocalizedText,
});
export type TopicRef = z.infer<typeof TopicRef>;
export const TopicDetail = z.object({
  topic: TopicSummary,
  chapter: z.object({ slug: z.string(), position: z.number(), name: LocalizedText }),
  subject: z.object({ slug: z.string(), name: LocalizedText }),
  classLevel: z.number().int(),
  objectives: z.array(Objective),
  prerequisites: z.array(TopicRef),
  unlocks: z.array(TopicRef), // topics that list this one as a prerequisite
  previous: TopicRef.nullable(),
  next: TopicRef.nullable(),
});
export type TopicDetail = z.infer<typeof TopicDetail>;

export const SearchHit = z.object({
  kind: z.enum(["subject", "chapter", "topic"]),
  classLevel: z.number().int(),
  subjectSlug: z.string(),
  chapterSlug: z.string().optional(),
  topicSlug: z.string().optional(),
  name: LocalizedText,
  context: z.string(),
});
export type SearchHit = z.infer<typeof SearchHit>;

export const YearDiff = z.object({
  boardCode: z.string(),
  from: z.string(),
  to: z.string(),
  addedChapters: z.array(z.object({ classLevel: z.number(), subjectSlug: z.string(), chapter: z.string() })),
  removedChapters: z.array(z.object({ classLevel: z.number(), subjectSlug: z.string(), chapter: z.string() })),
  textbookChanges: z.array(z.object({ classLevel: z.number(), subjectSlug: z.string(), from: z.string().nullable(), to: z.string().nullable() })),
});
export type YearDiff = z.infer<typeof YearDiff>;

export const CoverageReport = z.object({
  boardCode: z.string(),
  academicYear: z.string(),
  totals: z.object({ chapters: z.number(), chaptersWithTopics: z.number(), topics: z.number(), topicsWithObjectives: z.number(), chaptersWithTamil: z.number() }),
  subjects: z.array(z.object({ classLevel: z.number(), subjectSlug: z.string(), chapters: z.number(), chaptersWithTopics: z.number() })),
});
export type CoverageReport = z.infer<typeof CoverageReport>;

// ================= Import file format (content/curriculum/*.json) =================
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be lowercase-kebab");
/** class/subject/chapter/topic, e.g. "3/maths/toy-joy/counting-toys" */
const topicKey = z.string().regex(/^\d{1,2}\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/, "prerequisite must be class/subject/chapter/topic");

export const ImportTopic = z.object({
  slug,
  name: LocalizedText,
  objectives: z.array(Objective).default([]),
  prerequisites: z.array(topicKey).default([]),
});

export const CurriculumImport = z
  .object({
    boardCode: z.string().regex(/^[A-Z0-9_]{2,12}$/),
    boardName: z.string().min(1),
    academicYear: z.string().regex(/^\d{4}-\d{2}$/),
    isCurrent: z.boolean().default(false),
    verifiedOn: z.string().optional(),
    verificationNote: z.string().optional(),
    classes: z
      .array(
        z.object({
          classLevel: z.number().int().min(1).max(12),
          subjects: z.array(
            z.object({
              slug,
              name: LocalizedText,
              textbook: TextbookInfo,
              chapters: z.array(z.object({ slug, name: LocalizedText, topics: z.array(ImportTopic).default([]) })).min(1),
            }),
          ),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: "custom", message });
    const keys = new Set<string>();
    for (const c of data.classes) {
      const seenSubjects = new Set<string>();
      for (const s of c.subjects) {
        if (seenSubjects.has(s.slug)) issue(`duplicate subject slug ${s.slug} in class ${c.classLevel}`);
        seenSubjects.add(s.slug);
        const seenChapters = new Set<string>();
        for (const ch of s.chapters) {
          if (seenChapters.has(ch.slug)) issue(`duplicate chapter slug ${ch.slug} in ${s.slug}`);
          seenChapters.add(ch.slug);
          const seenTopics = new Set<string>();
          for (const t of ch.topics) {
            if (seenTopics.has(t.slug)) issue(`duplicate topic slug ${t.slug} in ${ch.slug}`);
            seenTopics.add(t.slug);
            keys.add(`${c.classLevel}/${s.slug}/${ch.slug}/${t.slug}`);
          }
        }
      }
    }
    // Prerequisites must exist, not point at themselves, and form no cycle (depth-first search).
    const edges = new Map<string, string[]>();
    for (const c of data.classes) for (const s of c.subjects) for (const ch of s.chapters) for (const t of ch.topics) {
      const key = `${c.classLevel}/${s.slug}/${ch.slug}/${t.slug}`;
      for (const pre of t.prerequisites) {
        if (!keys.has(pre)) issue(`prerequisite ${pre} of ${key} does not exist`);
        if (pre === key) issue(`topic ${key} cannot be its own prerequisite`);
      }
      edges.set(key, t.prerequisites);
    }
    const state = new Map<string, 1 | 2>();
    const visit = (k: string, path: string[]): void => {
      if (state.get(k) === 2) return;
      if (state.get(k) === 1) { issue(`prerequisite cycle: ${[...path.slice(path.indexOf(k)), k].join(" -> ")}`); return; }
      state.set(k, 1);
      for (const n of edges.get(k) ?? []) if (keys.has(n)) visit(n, [...path, k]);
      state.set(k, 2);
    };
    for (const k of keys) visit(k, []);
  });
export type CurriculumImport = z.infer<typeof CurriculumImport>;
