import { describe, expect, it } from "vitest";
import { daysInLastWeek, lastDays, streakOf } from "../src/parent.js";

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
