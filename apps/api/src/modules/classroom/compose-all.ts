import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ClassroomLesson, composeClassroom, LessonImport, QuestionImport } from "@studysmart/shared";

const jsonFiles = (dir?: string) => (dir && existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : []);
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const same = (a: { board: string; classLevel: number; subject: string; chapter: string; topic: string }, b: typeof a) =>
  a.board.toLowerCase() === b.board.toLowerCase() && a.classLevel === b.classLevel && a.subject === b.subject && a.chapter === b.chapter && a.topic === b.topic;

/**
 * Every classroom lesson: each published lesson in content/lessons composed into a whole-lesson board (story, learning,
 * examples, questions, summary), with a hand-made picture page from content/classroom slotted in when one exists
 * for the same topic. Hand-made files for topics without a lesson are served as they are.
 */
export function composeAll(dirs: { lessonsDir: string; questionsDir?: string; classroomDir?: string }): ClassroomLesson[] {
  const hand: ClassroomLesson[] = [];
  for (const f of jsonFiles(dirs.classroomDir)) {
    const r = ClassroomLesson.safeParse(read(join(dirs.classroomDir!, f)));
    if (r.success && r.data.status === "published") hand.push(r.data);
    else if (!r.success) console.warn(`classroom: skipped ${f}: ${r.error.issues[0]?.message}`);
  }
  const out: ClassroomLesson[] = [];
  const used = new Set<ClassroomLesson>();
  for (const f of jsonFiles(dirs.lessonsDir)) {
    const imp = LessonImport.safeParse(read(join(dirs.lessonsDir, f)));
    if (!imp.success || imp.data.lesson.status !== "published") continue;
    let questions: QuestionImport["questions"] = [];
    const qf = join(dirs.questionsDir ?? "", f);
    if (dirs.questionsDir && existsSync(qf)) { const q = QuestionImport.safeParse(read(qf)); if (q.success) questions = q.data.questions.filter((x) => x.status === "published"); }
    const meta = { board: imp.data.board, classLevel: imp.data.classLevel, subject: imp.data.subject, chapter: imp.data.chapter, topic: imp.data.topic };
    const insert = hand.find((h) => same(h, meta));
    if (insert) used.add(insert);
    const lesson = composeClassroom({ meta, lesson: imp.data.lesson, questions, insert });
    const parsed = ClassroomLesson.safeParse(lesson);
    if (parsed.success) out.push(parsed.data); else console.warn(`classroom: could not compose ${f}: ${parsed.error.issues[0]?.message}`);
  }
  for (const h of hand) if (!used.has(h)) out.push(h);
  return out;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Incremental version used by the running server. Only lessons whose own file, question file or matching hand-made
 * picture page changed are built again, so adding one lesson no longer rebuilds all of them. Same output as composeAll.
 * ---------------------------------------------------------------------------------------------------------------- */
type Meta = { board: string; classLevel: number; subject: string; chapter: string; topic: string };
const topicKey = (m: Meta) => `${m.board.toLowerCase()}|${m.classLevel}|${m.subject}|${m.chapter}|${m.topic}`;
const sigOf = (p: string): string => { try { const st = statSync(p); return `${st.size}:${Math.floor(st.mtimeMs)}`; } catch { return ""; } };

export interface ComposeEntry { sig: string; meta: Meta | null; out: ClassroomLesson | null }
export interface HandEntry { sig: string; lesson: ClassroomLesson | null }
export interface ComposeCache { lessons: Record<string, ComposeEntry>; hands: Record<string, HandEntry> }
export const emptyComposeCache = (): ComposeCache => ({ lessons: {}, hands: {} });
export interface ComposeStats { read: number; reused: number }

export function composeIncremental(dirs: { lessonsDir: string; questionsDir?: string; classroomDir?: string }, cache: ComposeCache): { lessons: ClassroomLesson[]; stats: ComposeStats; changed: boolean } {
  const stats: ComposeStats = { read: 0, reused: 0 };
  let changed = false;
  const handFiles = jsonFiles(dirs.classroomDir);
  const hands: Record<string, HandEntry> = {};
  const handByTopic = new Map<string, { file: string; entry: HandEntry; lesson: ClassroomLesson }>();
  for (const f of handFiles) {
    const sig = sigOf(join(dirs.classroomDir!, f));
    let e = cache.hands[f];
    if (!e || e.sig !== sig) {
      changed = true;
      const r = ClassroomLesson.safeParse(read(join(dirs.classroomDir!, f)));
      if (!r.success) console.warn(`classroom: skipped ${f}: ${r.error.issues[0]?.message}`);
      e = { sig, lesson: r.success && r.data.status === "published" ? r.data : null };
    }
    hands[f] = e;
    if (e.lesson) { const k = topicKey(e.lesson); if (!handByTopic.has(k)) handByTopic.set(k, { file: f, entry: e, lesson: e.lesson }); }
  }
  if (Object.keys(cache.hands).length !== handFiles.length) changed = true;
  const out: ClassroomLesson[] = [];
  const used = new Set<ClassroomLesson>();
  const lessons: Record<string, ComposeEntry> = {};
  for (const f of jsonFiles(dirs.lessonsDir)) {
    const lp = join(dirs.lessonsDir, f), qp = join(dirs.questionsDir ?? "", f);
    const base = `${sigOf(lp)}|${dirs.questionsDir ? sigOf(qp) : ""}`;
    const prev = cache.lessons[f];
    const handFor = prev?.meta ? handByTopic.get(topicKey(prev.meta)) : undefined;
    const sig = `${base}|${handFor?.entry.sig ?? ""}`;
    let entry: ComposeEntry;
    if (prev && prev.sig === sig) { entry = prev; stats.reused++; }
    else {
      changed = true; stats.read++;
      const imp = LessonImport.safeParse(read(lp));
      if (!imp.success || imp.data.lesson.status !== "published") {
        const meta = imp.success ? { board: imp.data.board, classLevel: imp.data.classLevel, subject: imp.data.subject, chapter: imp.data.chapter, topic: imp.data.topic } : null;
        entry = { sig: `${base}|${meta ? handByTopic.get(topicKey(meta))?.entry.sig ?? "" : ""}`, meta, out: null };
      }
      else {
        let questions: QuestionImport["questions"] = [];
        if (dirs.questionsDir && existsSync(qp)) { const q = QuestionImport.safeParse(read(qp)); if (q.success) questions = q.data.questions.filter((x) => x.status === "published"); }
        const meta = { board: imp.data.board, classLevel: imp.data.classLevel, subject: imp.data.subject, chapter: imp.data.chapter, topic: imp.data.topic };
        const hand = handByTopic.get(topicKey(meta));
        const parsed = ClassroomLesson.safeParse(composeClassroom({ meta, lesson: imp.data.lesson, questions, insert: hand?.lesson }));
        if (!parsed.success) console.warn(`classroom: could not compose ${f}: ${parsed.error.issues[0]?.message}`);
        entry = { sig: `${base}|${hand?.entry.sig ?? ""}`, meta, out: parsed.success ? parsed.data : null };
      }
    }
    lessons[f] = entry;
    if (entry.out) {
      out.push(entry.out);
      if (entry.meta) { const h = handByTopic.get(topicKey(entry.meta)); if (h) used.add(h.lesson); }
    }
  }
  if (Object.keys(cache.lessons).length !== Object.keys(lessons).length) changed = true;
  for (const f of handFiles) { const l = hands[f]!.lesson; if (l && !used.has(l)) out.push(l); }
  cache.lessons = lessons; cache.hands = hands;
  return { lessons: out, stats, changed };
}
