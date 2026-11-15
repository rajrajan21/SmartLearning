import { describe, expect, it } from "vitest";
import { ClassroomLesson, clockAngles, sceneAt, startMs } from "../src/classroom.js";

const base = { board: "CBSE", classLevel: 3, subject: "maths", chapter: "fair-share", topic: "halves-and-quarters", title: { en: "T" } };
const lesson = (over: object = {}) => ClassroomLesson.parse({
  ...base,
  objects: [
    { kind: "circle", id: "c", cx: 200, cy: 200, r: 100 },
    { kind: "text", id: "t", x: 400, y: 100, text: "1/4 + 1/4" },
    { kind: "sector", id: "q1", cx: 200, cy: 200, r: 100, from: 0, to: 90 },
    { kind: "clock", id: "k", cx: 600, cy: 250, r: 120 },
  ],
  steps: [
    { id: "a", narration: { en: "This circle is one whole." }, actions: [{ do: "draw", target: "c", at: 0, ms: 1000 }] },
    { id: "b", narration: { en: "Shade one quarter, then write it." }, actions: [{ do: "fill", target: "q1", color: "accent", on: "quarter", ms: 500 }, { do: "write", target: "t", at: 0.5, ms: 1000 }, { do: "time", target: "k", hour: 3, minute: 30, at: 0 }] },
  ],
  ...over,
});
const opts = { durMs: 4000 };

describe("classroom lesson format", () => {
  it("accepts a valid lesson and rejects authoring mistakes", () => {
    expect(() => lesson()).not.toThrow();
    const bad = (steps: unknown) => ClassroomLesson.safeParse({ ...base, objects: [{ kind: "circle", id: "c", cx: 1, cy: 1, r: 5 }, { kind: "text", id: "t", x: 1, y: 1, text: "x" }], steps }).success;
    expect(bad([{ id: "a", narration: { en: "Hi." }, actions: [{ do: "draw", target: "nope" }] }])).toBe(false);
    expect(bad([{ id: "a", narration: { en: "Hi." }, actions: [{ do: "write", target: "c" }] }])).toBe(false);
    expect(bad([{ id: "a", narration: { en: "Hello there." }, actions: [{ do: "draw", target: "c", on: "goodbye" }] }])).toBe(false);
    expect(bad([{ id: "a", narration: { en: "Hello there." }, actions: [{ do: "draw", target: "c", on: "hello", at: 0.2 }] }])).toBe(false);
    expect(bad([{ id: "a", narration: { en: "Hello." }, actions: [{ do: "fill", target: "c" }] }])).toBe(false);
    expect(bad([{ id: "a", narration: { en: "Hello." }, check: { stem: { en: "?" }, explanation: { en: "e" }, options: [{ id: "x", text: { en: "1" }, correct: true }, { id: "y", text: { en: "2" }, correct: true }] } }])).toBe(false);
  });
  it("rejects duplicate ids and unsafe path data", () => {
    expect(ClassroomLesson.safeParse({ ...base, objects: [{ kind: "circle", id: "c", cx: 1, cy: 1, r: 5 }, { kind: "circle", id: "c", cx: 1, cy: 1, r: 5 }], steps: [{ id: "a", narration: { en: "Hi." } }] }).success).toBe(false);
    expect(ClassroomLesson.safeParse({ ...base, objects: [{ kind: "path", id: "p", d: "M0 0 <script>" }], steps: [{ id: "a", narration: { en: "Hi." } }] }).success).toBe(false);
  });
});

describe("timeline", () => {
  it("draws progressively and shows the final picture once a step is over", () => {
    const l = lesson();
    expect(sceneAt(l, 0, 0, opts).c!.vis).toBe(1);
    const half = sceneAt(l, 0, 500, opts).c!;
    expect(half.draw).toBeGreaterThan(0.3); expect(half.draw).toBeLessThan(0.7);
    expect(sceneAt(l, 0, 2000, opts).c!.draw).toBe(1);
  });
  it("keeps earlier steps on the board in the next step", () => {
    const s = sceneAt(lesson(), 1, 0, opts);
    expect(s.c!.draw).toBe(1); expect(s.c!.vis).toBe(1);
  });
  it("starts an action when the teacher says its phrase, and writes text progressively", () => {
    const l = lesson();
    expect(sceneAt(l, 1, 0, { durMs: 4000 }).q1!.fillA).toBe(0);
    expect(sceneAt(l, 1, 3000, { durMs: 4000 }).q1!.fill).toBe("accent");
    const a = sceneAt(l, 1, 2000 + 500, { durMs: 4000 }).t!, b = sceneAt(l, 1, 4000, { durMs: 4000 }).t!;
    expect(a.chars).toBeGreaterThan(0); expect(a.chars).toBeLessThan(1); expect(b.chars).toBe(1);
  });
  it("uses the recorded word times when they are available", () => {
    const words = "Shade one quarter, then write it.".split(" ").map((w, i) => ({ w, t: i * 1000 }));
    expect(startMs({ do: "fill", on: "quarter" }, "Shade one quarter, then write it.", 6000, words)).toBe(2000);
    expect(startMs({ do: "fill", on: "quarter" }, "Shade one quarter, then write it.", 6000)).toBeCloseTo((10 / 33) * 6000, 0);
  });
  it("moves a clock forward and never backwards", () => {
    const l = lesson();
    expect(sceneAt(l, 1, 4000, opts).k!.tot).toBe(3 * 60 + 30);
    const mid = sceneAt(l, 1, 750, opts).k!.tot;
    expect(mid).toBeGreaterThan(0); expect(mid).toBeLessThan(210);
    expect(clockAngles(210)).toEqual({ minute: 180, hour: 105 });
  });
  it("shows everything at once when motion is reduced", () => {
    expect(sceneAt(lesson(), 0, 10, { ...opts, instant: true }).c!.draw).toBe(1);
  });
});
