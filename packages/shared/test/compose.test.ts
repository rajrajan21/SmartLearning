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
  it("announces each worked-example step once and omits label-only explanations", () => {
    const file = "cbse-4-evs-our-sky-sun-moon-and-stars.json";
    const { board, classLevel, subject, chapter, topic, lesson } = LessonImport.parse(load("lessons", file));
    const out = composeClassroom({ meta: { board, classLevel, subject, chapter, topic }, lesson });
    expect(out.steps.filter((step) => step.section === "Example").map((step) => step.narration.en)).toEqual([
      "Let us work through an example. Describe the sky at three times.",
      "Step 1. Morning: orange Sun.",
      "Step 2. Afternoon: strong sunlight.",
      "Step 3. Night: Moon and stars.",
    ]);
  });
  it("keeps the number and narration together in the animal-counts example", () => {
    const file = "cbse-4-maths-elephants-tigers-and-leopards-adding-and-subtracting-animal-counts.json";
    const { board, classLevel, subject, chapter, topic, lesson } = LessonImport.parse(load("lessons", file));
    const meta = { board, classLevel, subject, chapter, topic };
    const examples = (input: typeof lesson) => composeClassroom({ meta, lesson: input }).steps
      .filter((step) => step.section === "Example").map((step) => step.narration.en);
    expect(examples(lesson)).toEqual([
      "Let us work through an example. Find 5719 - 3965.",
      "Step 1. Ones 9 - 5 = 4.",
      "Step 2. Tens 11 - 6 = 5 after regrouping.",
      "Step 3. Result 1754.",
    ]);
    const example = lesson.blocks.find((block) => block.type === "worked_example");
    if (!example) throw new Error("The animal-counts fixture has no worked example");
    const longInstruction = "Regroup the tens and the ones to check each column carefully. ".repeat(6).replaceAll(". ", " ").trim() + ".";
    example.steps[0]!.text.en = longInstruction;
    example.steps[0]!.why = { en: "Regrouping keeps the value the same." };
    const lines = examples(lesson);
    expect(lines[1]).toBe("Step 1. " + longInstruction);
    expect(lines[2]).toBe("Regrouping keeps the value the same.");
    expect(lines.filter((line) => /^Step \d+\.$/.test(line))).toEqual([]);
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
