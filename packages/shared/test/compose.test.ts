import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ClassroomLesson, chunks, composeClassroom, LessonImport, QuestionImport, sceneAt, wrap } from "../src/index.js";

const root = join(__dirname, "../../../content");
const load = (d: string, f: string) => JSON.parse(readFileSync(join(root, d, f), "utf8"));

describe("composeClassroom", () => {
  it("splits text into short spoken chunks and wraps lines", () => {
    expect(chunks("One. Two. Three. Four.")).toEqual(["One. Two.", "Three. Four."]);
    expect(wrap("aaa bbb ccc ddd", 7)).toEqual(["aaa bbb", "ccc ddd"]);
  });
  it("turns every shipped lesson into a valid whole-lesson board", () => {
    const files = readdirSync(join(root, "lessons")).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThanOrEqual(13);
    for (const f of files) {
      const imp = LessonImport.parse(load("lessons", f));
      const qs = (() => { try { return QuestionImport.parse(load("questions", f)).questions; } catch { return []; } })();
      const out = composeClassroom({ meta: { board: imp.board, classLevel: imp.classLevel, subject: imp.subject, chapter: imp.chapter, topic: imp.topic }, lesson: imp.lesson, questions: qs });
      const r = ClassroomLesson.safeParse(out);
      expect(r.success, `${f}: ${r.success ? "" : JSON.stringify(r.error.issues[0])}`).toBe(true);
      expect(out.steps.length).toBeGreaterThan(5);
      expect(out.steps.some((s) => s.check)).toBe(true);
      for (const s of out.steps) expect(s.narration.en.length, `${f} ${s.id}`).toBeLessThanOrEqual(480);
      sceneAt(out, out.steps.length - 1, 99999, { durMs: 5000 }); // the whole lesson plays through
    }
  });
});
