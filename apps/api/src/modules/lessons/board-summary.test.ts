import { describe, expect, it } from "vitest";
import { createLessonService } from "./service.js";

const tree = (code: string, topics: Record<number, string[]>) => ({
  boardCode: code, boardName: code, academicYear: "2026-27",
  classes: Object.entries(topics).map(([lvl, ids]) => ({ classLevel: Number(lvl), subjects: [{ id: "s", slug: "maths", name: { en: "Maths" }, chapters: [{ id: "c", slug: "c", position: 1, name: { en: "C" }, topics: ids.map((id) => ({ id, slug: id, name: { en: id } })) }] }] })),
});
describe("board summary", () => {
  it("counts published lessons per board and per class", async () => {
    const db = { selectDistinct: () => ({ from: () => ({ where: async () => [{ id: "a" }, { id: "b" }, { id: "m1" }] }) }) } as never;
    const curriculum = {
      listBoards: async () => [{ boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27" }, { boardCode: "TNMATRIC", boardName: "TN Matric", academicYear: "2026-27" }],
      getBoard: async (code: string) => (code === "CBSE" ? tree("CBSE", { 3: ["a", "x"], 8: ["b"] }) : tree("TNMATRIC", { 10: ["m1", "m2"] })),
    } as never;
    const rows = await createLessonService(db, curriculum).boardSummary();
    expect(rows.map((r) => [r.code, r.lessons, r.topics])).toEqual([["CBSE", 2, 3], ["TNMATRIC", 1, 2]]);
    expect(rows[0]?.classes).toEqual([{ classLevel: 3, lessons: 1 }, { classLevel: 8, lessons: 1 }]);
  });
});
