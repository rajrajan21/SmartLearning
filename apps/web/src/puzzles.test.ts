import { describe, expect, it } from "vitest";
import { PUZZLES, puzzleFor } from "./lib/puzzles";

describe("puzzle of the day", () => {
  it("has English and Tamil for every puzzle", () => {
    for (const p of PUZZLES) for (const t of [p.q, p.a]) { expect(t.en.length).toBeGreaterThan(0); expect(t.ta.length).toBeGreaterThan(0); }
  });
  it("is the same all day and changes the next day", () => {
    const a = puzzleFor(new Date(2026, 10, 15, 8)), b = puzzleFor(new Date(2026, 10, 15, 22)), c = puzzleFor(new Date(2026, 10, 16, 8));
    expect(a).toBe(b); expect(c).not.toBe(a);
  });
});
