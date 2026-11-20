import { z } from "zod";

/**
 * Free question papers, quizzes and test papers collected by tools/papers (see HANDOVER.md).
 * Stored compactly as content/papers/<id>.json.gz plus one small content/papers/index.json.
 */
export const PAPER_BOARDS = ["cbse", "matric", "stateboard", "ncert"] as const;
export const PAPER_KINDS = ["sample", "previous", "model", "quiz", "worksheet", "test"] as const;

export const PaperQuestionSchema = z.object({
  n: z.string().max(12),
  text: z.string().min(1).max(4000),
  marks: z.number().min(0).max(100).optional(),
  type: z.enum(["mcq", "short", "long", "fill", "tf"]),
  /** A, B, C, D ... in order */
  options: z.array(z.string().max(600)).max(8).optional(),
  /** MCQ/true-false: the correct letter ("B"); others: short correct answer when the key gives one */
  answer: z.string().max(400).optional(),
  /** marking-scheme / model answer text shown to the reviewer */
  model: z.string().max(3000).optional(),
  /** chapter this question was matched to (title as in the curriculum), when known */
  chapter: z.string().max(200).optional(),
});
export const PaperSectionSchema = z.object({
  title: z.string().max(200),
  instructions: z.string().max(1200).optional(),
  questions: z.array(PaperQuestionSchema).min(1).max(200),
});
export const PaperSchema = z.object({
  v: z.literal(1),
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{3,100}$/),
  title: z.string().min(3).max(200),
  board: z.enum(PAPER_BOARDS),
  cls: z.number().int().min(1).max(12),
  subject: z.string().min(2).max(80),
  year: z.string().max(20).optional(),
  kind: z.enum(PAPER_KINDS),
  maxMarks: z.number().optional(),
  minutes: z.number().optional(),
  source: z.object({ site: z.string().max(120), url: z.string().url().max(600), license: z.string().max(300).optional() }),
  hash: z.string().max(64),
  sections: z.array(PaperSectionSchema).min(1).max(20),
});
export type PaperQuestion = z.infer<typeof PaperQuestionSchema>;
export type Paper = z.infer<typeof PaperSchema>;

export interface PaperIndexEntry {
  /** "hi" for Hindi papers; missing or "en" for the rest. */
  lang?: string;
  id: string; title: string; board: Paper["board"]; cls: number; subject: string; year?: string; kind: Paper["kind"];
  questions: number; mcq: number; keyed: number; maxMarks?: number; source: { site: string; url: string }; chapters: string[]; added: string;
}
export interface PaperIndex { updated: string; papers: PaperIndexEntry[] }

export function indexEntry(p: Paper, added = new Date().toISOString().slice(0, 10)): PaperIndexEntry {
  const qs = p.sections.flatMap((s) => s.questions);
  return {
    id: p.id, title: p.title, board: p.board, cls: p.cls, subject: p.subject, year: p.year, kind: p.kind,
    questions: qs.length, mcq: qs.filter((q) => q.type === "mcq" || q.type === "tf").length, keyed: qs.filter((q) => q.answer || q.model).length,
    maxMarks: p.maxMarks ?? (qs.reduce((a, q) => a + (q.marks ?? 0), 0) || undefined),
    source: { site: p.source.site, url: p.source.url }, chapters: [...new Set(qs.map((q) => q.chapter).filter((c): c is string => !!c))].sort(), added,
  };
}

/** one student attempt (kept on the device; nothing is sent to a server) */
export interface PaperAttempt {
  paperId: string;
  answers: Record<string, string>; // key = "<section>.<question>" e.g. "0.3": MCQ letter or written text
  notes: Record<string, string>; // student's own notes
  given: Record<string, number>; // marks awarded by the reviewer for written answers
  startedAt?: string;
  submittedAt?: string;
}
export const qKey = (si: number, qi: number) => `${si}.${qi}`;

export interface PaperScore { auto: number; autoOf: number; reviewer: number; reviewerOf: number; total: number; of: number; unanswered: number; wrong: string[]; right: string[] }
/** MCQ / true-false with a key are marked automatically; every other question is marked by the reviewer (given marks). */
export function scorePaper(p: Paper, a: Pick<PaperAttempt, "answers" | "given">, opt: { negative?: number } = {}): PaperScore {
  const r: PaperScore = { auto: 0, autoOf: 0, reviewer: 0, reviewerOf: 0, total: 0, of: 0, unanswered: 0, wrong: [], right: [] };
  p.sections.forEach((s, si) => s.questions.forEach((q, qi) => {
    const k = qKey(si, qi); const m = q.marks ?? 1; const ans = (a.answers[k] ?? "").trim();
    if (!ans) r.unanswered++;
    if ((q.type === "mcq" || q.type === "tf") && q.answer) {
      r.autoOf += m;
      if (ans && ans.toUpperCase() === q.answer.toUpperCase()) { r.auto += m; r.right.push(k); } else if (ans) { r.wrong.push(k); r.auto -= m * Math.min(1, Math.max(0, opt.negative ?? 0)); }
    } else {
      r.reviewerOf += m;
      r.reviewer += Math.min(m, Math.max(0, a.given[k] ?? 0));
    }
  }));
  r.auto = Math.max(0, Math.round(r.auto * 100) / 100); r.total = Math.max(0, Math.round((r.auto + r.reviewer) * 100) / 100); r.of = r.autoOf + r.reviewerOf;
  return r;
}

export interface ChapterScore { chapter: string; got: number; of: number }
/** marks per chapter (questions without a matched chapter are grouped as "Other"), weakest first; unmarked written answers count as 0 */
export function scoreByChapter(p: Paper, a: Pick<PaperAttempt, "answers" | "given">): ChapterScore[] {
  const m = new Map<string, ChapterScore>();
  p.sections.forEach((s, si) => s.questions.forEach((q, qi) => {
    const k = qKey(si, qi); const max = q.marks ?? 1; const c = q.chapter ?? "Other";
    const row = m.get(c) ?? m.set(c, { chapter: c, got: 0, of: 0 }).get(c)!;
    row.of += max;
    if ((q.type === "mcq" || q.type === "tf") && q.answer) { if ((a.answers[k] ?? "").trim().toUpperCase() === q.answer.toUpperCase()) row.got += max; }
    else row.got += Math.min(max, Math.max(0, a.given[k] ?? 0));
  }));
  return [...m.values()].sort((x, y) => x.got / x.of - y.got / y.of || x.chapter.localeCompare(y.chapter));
}
