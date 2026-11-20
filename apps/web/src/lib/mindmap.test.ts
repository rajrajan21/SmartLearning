import { describe, expect, it } from "vitest";
import { branchPoints, wrapLabel } from "./mindmap";
describe("mind map", () => {
  it("puts the first branch at the top and spreads the rest", () => { const p = branchPoints(4, 640, 420); expect(p[0]!.x).toBe(320); expect(p[0]!.y).toBeLessThan(210); expect(new Set(p.map((x) => `${x.x},${x.y}`)).size).toBe(4); });
  it("wraps to two lines at most", () => { expect(wrapLabel("Introduction to whole numbers and more", 16).length).toBe(2); expect(wrapLabel("Fractions")).toEqual(["Fractions"]); });
});
