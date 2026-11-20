import { describe, expect, it } from "vitest";
import { dailySteps } from "./daily";
const node = { id: "t", href: "/x", name: { en: "T" }, subject: { en: "S" }, state: "now" as const };
const all = { revise: true, lesson: true, puzzle: true };
describe("dailySteps", () => {
  it("skips revise when nothing is due", () => { expect(dailySteps(all, 0, node, 0, false).map((x) => x.id)).toEqual(["lesson", "puzzle"]); });
  it("lists all three", () => { expect(dailySteps(all, 3, node, 0, false).map((x) => x.id)).toEqual(["revise", "lesson", "puzzle"]); });
  it("marks lesson done after one lesson", () => { expect(dailySteps(all, 0, node, 1, false)[0]!.done).toBe(true); });
  it("respects switches and a missing next topic", () => { expect(dailySteps({ revise: false, lesson: false, puzzle: true }, 5, node, 0, true)).toEqual([{ id: "puzzle", href: "#puzzle", done: true }]); expect(dailySteps(all, 0, undefined, 0, false).map((x) => x.id)).toEqual(["puzzle"]); });
});
