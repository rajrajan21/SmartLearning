import { describe, expect, it } from "vitest";
import { chapterPct, nextReview, topicMastery } from "../src/mastery.js";

const r = (best: number, stars: number, passed: boolean) => ({ best, stars, passed, tries: 1 });
const done = { step: 5, total: 5, done: true, updatedAt: 1 };

describe("topic mastery", () => {
  it("is new until the child does something", () => {
    expect(topicMastery({ available: [1, 2], hasLesson: true })).toEqual({ level: "new", pct: 0 });
  });
  it("moves through learning, practising, strong and mastered by what was actually achieved", () => {
    expect(topicMastery({ lesson: { ...done, done: false, step: 1 }, available: [1, 2], hasLesson: true }).level).toBe("learning");
    expect(topicMastery({ lesson: done, rounds: { "1": r(50, 0, false) }, available: [1, 2], hasLesson: true }).level).toBe("practising");
    expect(topicMastery({ lesson: done, rounds: { "1": r(80, 1, true), "2": r(75, 1, true) }, available: [1, 2], hasLesson: true }).level).toBe("strong");
    const m = topicMastery({ lesson: done, rounds: { "1": r(100, 3, true), "2": r(92, 2, true) }, available: [1, 2], hasLesson: true });
    expect(m.level).toBe("mastered"); expect(m.pct).toBe(Math.round(20 + 0.8 * 96));
  });
  it("a lesson-only topic is measured by the lesson, and practice-only by practice", () => {
    expect(topicMastery({ lesson: done, available: [], hasLesson: true })).toEqual({ level: "learning", pct: 100 });
    expect(topicMastery({ rounds: { "1": r(100, 3, true) }, available: [1], hasLesson: false })).toMatchObject({ level: "mastered", pct: 100 });
  });
  it("chapter progress averages only topics that have content", () => {
    expect(chapterPct([{ level: "strong", pct: 80 }, { level: "new", pct: 0 }])).toBe(40);
    expect(chapterPct([])).toBe(0);
  });
});

describe("spaced revision", () => {
  const iv = [1, 3, 7, 14, 30];
  it("a wrong answer comes back tomorrow from the first box", () => {
    expect(nextReview({ box: 4, due: 100 }, false, 100, iv)).toEqual({ box: 1, due: 101 });
    expect(nextReview(undefined, false, 100, iv)).toEqual({ box: 1, due: 101 });
  });
  it("right answers climb the boxes with longer gaps, up to the top", () => {
    expect(nextReview(undefined, true, 100, iv)).toEqual({ box: 2, due: 103 });
    expect(nextReview({ box: 2, due: 100 }, true, 100, iv)).toEqual({ box: 3, due: 107 });
    expect(nextReview({ box: 5, due: 100 }, true, 100, iv)).toEqual({ box: 5, due: 130 });
  });
  it("repeating a question that is not due yet does not inflate its box", () => {
    expect(nextReview({ box: 3, due: 107 }, true, 100, iv)).toEqual({ box: 3, due: 107 });
    expect(nextReview({ box: 3, due: 107 }, false, 100, iv)).toEqual({ box: 1, due: 101 });
  });
  it("copes with fewer intervals than boxes", () => {
    expect(nextReview({ box: 4, due: 0 }, true, 10, [2, 5])).toEqual({ box: 5, due: 15 });
  });
});
