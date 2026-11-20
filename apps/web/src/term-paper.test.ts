import { describe, expect, it } from "vitest";
import { termChapters } from "./pages/TermPaper";

describe("term papers", () => {
  it("cover the first share of the chapters, at least one", () => {
    const ch = Array.from({ length: 12 }, (_, i) => i + 1);
    expect(termChapters(ch, 25)).toEqual([1, 2, 3]);
    expect(termChapters(ch, 50)).toHaveLength(6);
    expect(termChapters(ch, 100)).toHaveLength(12);
    expect(termChapters([1], 10)).toEqual([1]);
  });
});
