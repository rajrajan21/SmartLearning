import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

const base = "/opt/studysmart";
const { LessonImport, QuestionImport, ClassroomLesson, composeClassroom, sceneAt } = await import(base + "/packages/shared/src/index.ts");
const { speechText } = await import(base + "/apps/api/src/modules/audio/manifest.ts");
const [dir, gradeStr, ...filenames] = process.argv.slice(2);
const grade = Number(gradeStr);
const subject = process.env.BATCH_SUBJECT ?? "maths";
const prefix = process.env.BATCH_PREFIX ?? "cbse";
const boardCode = prefix === "tnm" ? "TNMATRIC" : "CBSE";
const read = (filename) => JSON.parse(fs.readFileSync(filename, "utf8"));
const same = (a, b) => ["board", "classLevel", "subject", "chapter", "topic"].every(key => a[key] === b[key]);
const teacher = (d) => d.lesson.blocks.flatMap(b => b.type === "teacher_narration" ? b.sentences : []);
const attachmentPrefix = prefix + "-" + grade + "-" + subject + "-";
const attachments = fs.readdirSync(base + "/content/classroom").filter(f => (f.startsWith("auto-" + attachmentPrefix) || f.startsWith(attachmentPrefix)) && f.endsWith(".json"));
const corrections = new Set((process.env.ALLOWED_CORRECTIONS ?? "").split(","));
let failures = 0;
for (const f of filenames) {
  try {
    const next = LessonImport.parse(read(path.join(dir, f)));
    const old = LessonImport.parse(read(path.join(dir, "baseline", f)));
    if (!same(next, old) || next.board !== boardCode || next.classLevel !== grade || next.subject !== subject || !["whole-chapter", "full-chapter-lesson"].includes(next.topic)) throw Error("Lesson identity changed");
    const before = teacher(old), after = teacher(next);
    const byId = new Map(after.map(s => [s.id, s]));
    if (after.length < 30 || byId.size !== after.length) throw Error("Narration depth or duplicate IDs");
    for (const s of before) {
      if (!byId.has(s.id) || (!corrections.has(f + ":" + s.id) && !isDeepStrictEqual(s, byId.get(s.id)))) throw Error("Original narration changed: " + s.id);
    }
    const questions = QuestionImport.parse(read(path.join(dir, "questions", f)));
    const keys = new Set(questions.questions.filter(q => q.status === "published").map(q => q.key));
    for (const b of next.lesson.blocks) {
      if (b.type === "quiz" && b.questionIds.some(k => !keys.has(k))) throw Error("Missing published practice questions");
      if (b.type === "diagram" && !fs.existsSync(base + "/apps/web/public/assets/lessons/" + b.assetKey)) throw Error("Missing diagram " + b.assetKey);
    }
    const meta = { board: next.board, classLevel: next.classLevel, subject: next.subject, chapter: next.chapter, topic: next.topic };
    const previousInsert = attachments.map(f => read(base + "/content/classroom/" + f)).find(a => a.status === "published" && same(a, meta));
    const staged = [f, "auto-" + f].map(name => path.join(dir, "classroom", name)).filter(file => fs.existsSync(file));
    if (staged.length > 1) throw Error("Multiple Classroom inserts for the same lesson");
    const insert = staged.length === 1 ? read(staged[0]) : previousInsert;
    if (staged.length === 1 && (insert.status !== "published" || !same(insert, meta))) throw Error("Classroom insert identity changed");
    const board = ClassroomLesson.parse(composeClassroom({ meta, lesson: next.lesson, questions: questions.questions, insert }));
    const oldBoard = composeClassroom({ meta, lesson: old.lesson, questions: questions.questions, insert: previousInsert });
    const existingLong = new Set(oldBoard.steps.map(s => s.narration.en));
    const long = board.steps.filter(s => speechText(s.narration.en, "en").length > 480);
    if (long.some(s => !existingLong.has(s.narration.en))) throw Error("New narration exceeds the audio limit");
    sceneAt(board, board.steps.length - 1, 99999, { durMs: 5000 });
    console.log(JSON.stringify({ f, before: before.length, after: after.length, practice: keys.size, boardSteps: board.steps.length, existingLongSteps: long.length }));
  } catch (error) {
    failures++;
    console.error(f + ": " + error.message);
  }
}
if (failures || !filenames.length) process.exitCode = 1;
