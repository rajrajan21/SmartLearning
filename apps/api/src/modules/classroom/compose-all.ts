import { existsSync, readdirSync, readFileSync } from "node:fs";
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
