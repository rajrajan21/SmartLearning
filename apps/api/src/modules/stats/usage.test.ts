import { describe, expect, it } from "vitest";
import { fillDays } from "./usage.js";
describe("fillDays", () => {
  it("returns a full window with zeros", () => { const d = fillDays([{ day: 99, n: 4 }], 100, 3); expect(d).toEqual([{ day: 98, aiAnswers: 0 }, { day: 99, aiAnswers: 4 }, { day: 100, aiAnswers: 0 }]); });
});
