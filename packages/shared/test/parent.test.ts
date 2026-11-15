import { describe, expect, it } from "vitest";
import { daysInLastWeek, lastDays, streakOf, weeklySummary, type ChildReport } from "../src/parent.js";

describe("dashboard helpers", () => {
  it("streak counts back from today, or from yesterday if today has not started, and breaks on a gap", () => {
    expect(streakOf([8, 9, 10], 10)).toBe(3);
    expect(streakOf([8, 9], 10)).toBe(2);
    expect(streakOf([7, 9, 10], 10)).toBe(2);
    expect(streakOf([5], 10)).toBe(0);
    expect(streakOf([], 10)).toBe(0);
  });
  it("counts distinct learning days in the last seven days", () => {
    expect(daysInLastWeek([3, 4, 4, 9, 10, 11], 10)).toBe(3); // the window is days 4 to 10: day 3 is too old, day 11 is in the future
    expect(daysInLastWeek([2, 3], 10)).toBe(0);
  });
  it("fills the chart with zeros for quiet days", () => {
    expect(lastDays({ "9": { n: 3, right: 2 } }, 10, 3)).toEqual([{ day: 8, n: 0, right: 0 }, { day: 9, n: 3, right: 2 }, { day: 10, n: 0, right: 0 }]);
  });
});

describe("weeklySummary", () => {
  const child = {
    profile: { id: "1", nickname: "Asha", classLevel: 3, avatar: "owl", language: "en" },
    progress: {
      lesson: { a: { step: 3, total: 3, done: true, updatedAt: 9 * 86_400_000 }, b: { step: 1, total: 4, done: false, updatedAt: 10 * 86_400_000 }, old: { step: 3, total: 3, done: true, updatedAt: 1 * 86_400_000 } },
      practice: { w1: { "1": { best: 30, stars: 0, passed: false, tries: 2 } }, w2: { "1": { best: 50, stars: 0, passed: false, tries: 1 } }, ok: { "1": { best: 90, stars: 3, passed: true, tries: 1 } }, none: { "1": { best: 0, stars: 0, passed: false, tries: 0 } } },
      revision: {},
    },
    activeDays: [8, 9, 10], daily: { "9": { n: 10, right: 8 }, "10": { n: 10, right: 6 }, "2": { n: 50, right: 50 } }, attempts: 70, correct: 64, weak: [],
  } as unknown as ChildReport;
  it("summarises only the last seven days", () => {
    const w = weeklySummary(child, 10);
    expect(w.daysLearned).toBe(3);
    expect(w.answers).toBe(20); expect(w.right).toBe(14); expect(w.accuracyPct).toBe(70);
    expect(w.topicsDone).toEqual(["a"]);
    expect(w.estMinutes).toBe(18); // 20 answers x 0.5 + 2 lessons x 4
  });
  it("lists tricky topics, worst first, and ignores untried or passed ones", () => {
    expect(weeklySummary(child, 10).weakTopics).toEqual([{ topicId: "w1", best: 30 }, { topicId: "w2", best: 50 }]);
  });
  it("copes with a quiet week", () => {
    const w = weeklySummary({ ...child, daily: {}, activeDays: [], progress: { lesson: {}, practice: {}, revision: {} } }, 10);
    expect(w).toMatchObject({ daysLearned: 0, answers: 0, accuracyPct: null, estMinutes: 0, topicsDone: [], weakTopics: [] });
  });
});
