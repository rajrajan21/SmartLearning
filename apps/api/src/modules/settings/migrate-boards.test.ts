import { describe, it, expect } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrateBoards } from "./migrate-boards.js";

function fake(values: Record<string, unknown>) {
  const calls: Record<string, unknown>[] = [];
  return { calls, svc: { all: async () => values, update: async (c: Record<string, unknown>) => { calls.push(c); Object.assign(values, c); return values; } } as never };
}
const lessons = { boardSummary: async () => [
  { code: "CBSE", name: "CBSE", lessons: 5, topics: 9, classes: [{ classLevel: 3, lessons: 2 }, { classLevel: 8, lessons: 3 }, { classLevel: 12, lessons: 0 }] },
  { code: "TNMATRIC", name: "Matric", lessons: 4, topics: 4, classes: [{ classLevel: 9, lessons: 2 }, { classLevel: 10, lessons: 2 }] },
] };
describe("boards migration", () => {
  it("opens classes that have lessons, turns on all boards once, then leaves admin choices alone", async () => {
    const dir = mkdtempSync(join(tmpdir(), "migb-")), marker = join(dir, "m", "boards.json");
    const f = fake({ "catalog.openClasses": [3, 4, 5, 6, 7], "catalog.boards.showAll": false, "catalog.defaultBoard": "CBSE" });
    const first = await migrateBoards(f.svc, lessons, marker);
    expect(first.sort()).toEqual(["catalog.boards.showAll", "catalog.openClasses"]);
    expect(f.calls[0]?.["catalog.openClasses"]).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
    expect(f.calls[0]?.["catalog.defaultBoard"]).toBeUndefined();
    expect(existsSync(marker)).toBe(true);
    const g = fake({ "catalog.openClasses": [3] });
    expect(await migrateBoards(g.svc, lessons, marker)).toEqual([]);
    expect(g.calls.length).toBe(0);
  });
  it("waits (no marker) while no lessons are loaded yet", async () => {
    const dir = mkdtempSync(join(tmpdir(), "migb-")), marker = join(dir, "m", "boards.json");
    const f = fake({ "catalog.openClasses": [3] });
    expect(await migrateBoards(f.svc, { boardSummary: async () => [] }, marker)).toEqual([]);
    expect(existsSync(marker)).toBe(false);
  });
});
