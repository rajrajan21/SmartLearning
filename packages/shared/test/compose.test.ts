import { picturesFor } from "../src/illustrate.js";
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


it("draws letters as alphabet symbols or postal mail according to the sentence", () => {
  expect(picturesFor("Names are made of letters, and we can count the letters in a name.")[0]?.emoji).toBe("A B C");
  expect(picturesFor("Write a letter and put it in an envelope.")[0]?.emoji).toBe("✉️");
  expect(picturesFor("Consider these letters.")).toEqual([]);
});

it("avoids misleading homonym pictures across geography, history, science and maths", () => {
  // Tectonic plates must NOT show an eating plate
  expect(picturesFor("According to plate tectonics, the lithosphere is broken into large and small plates.").some((p) => p.word === "plate")).toBe(false);
  expect(picturesFor("The potato on your plate comes from a farm.").some((p) => p.word === "plate" && p.emoji === "🍽️")).toBe(true);

  // History rulers must NOT show a measuring ruler
  expect(picturesFor("The Mughal ruler built forts across the empire.").some((p) => p.word === "ruler")).toBe(false);
  expect(picturesFor("Measure the line in centimetres using a ruler.").some((p) => p.word === "ruler" && p.emoji === "📏")).toBe(true);

  // Optical glass must NOT show a glass of milk
  expect(picturesFor("Going from air to glass, light bends towards the normal.").some((p) => p.word === "glass")).toBe(false);
  expect(picturesFor("Drink a clean glass of water every hour.").some((p) => p.word === "glass" && p.emoji === "🥛")).toBe(true);

  // Verbs and scientific/abstract homonyms must NOT trigger unrelated icons
  expect(picturesFor("Watch carefully and describe the result.").some((p) => p.word === "watch")).toBe(false);
  expect(picturesFor("Gently tap the spoon on each object.").some((p) => p.word === "tap")).toBe(false);
  expect(picturesFor("Close the running tap to save water.").some((p) => p.word === "tap" && p.emoji === "🚰")).toBe(true);
  expect(picturesFor("Dialogues need a speaker and listener.").some((p) => p.word === "speaker")).toBe(false);
  expect(picturesFor("Pancreatic juice has trypsin and lipase.").some((p) => p.word === "juice")).toBe(false);
  expect(picturesFor("We speak our mother tongue at home.").some((p) => p.word === "tongue")).toBe(false);
  expect(picturesFor("Prabhat could not bear to lose.").some((p) => p.word === "bear")).toBe(false);
  expect(picturesFor("A motor uses a coil, magnet, commutator and brushes.").some((p) => p.word === "brush")).toBe(false);
  expect(picturesFor("Brush your teeth every morning.").some((p) => p.word === "brush" && p.emoji === "🪥")).toBe(true);
  expect(picturesFor("A compass needle moves near a wire.").some((p) => p.word === "needle")).toBe(false);
  expect(picturesFor("Are my nails trimmed cleanly?").some((p) => p.word === "nail")).toBe(false);
  expect(picturesFor("Surface area of a cube and sphere in square centimetres.").some((p) => ["cube", "sphere", "square"].includes(p.word))).toBe(false);
  expect(picturesFor("In 1944 the Bretton Woods conference met.").some((p) => p.word === "wood")).toBe(false);
  expect(picturesFor("Flower beds in the park and cotton plug in a funnel.").some((p) => ["bed", "plug"].includes(p.word))).toBe(false);
});
