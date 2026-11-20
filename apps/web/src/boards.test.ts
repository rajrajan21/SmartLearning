import { describe, expect, it } from "vitest";
import { boardFromPath, chooseBoards, type BoardInfo } from "./lib/boards";
import { defaults } from "@studysmart/shared";

const info: BoardInfo[] = [
  { code: "CBSE", name: "CBSE", lessons: 120, topics: 200, classes: [{ classLevel: 3, lessons: 6 }, { classLevel: 10, lessons: 94 }] },
  { code: "TNMATRIC", name: "Tamil Nadu Matriculation", lessons: 40, topics: 60, classes: [{ classLevel: 9, lessons: 20 }, { classLevel: 10, lessons: 20 }] },
  { code: "TNSTATE", name: "Tamil Nadu State Board", lessons: 0, topics: 0, classes: [] },
];
const d = defaults() as Record<string, unknown>;
const make = (over: Record<string, unknown> = {}) => ({ info, get: (k: string) => ({ ...d, ...over })[k], text: (k: string) => ((d[k] as { en: string } | undefined)?.en ?? "") });

describe("boards on the home page", () => {
  it("lists every board that has lessons, CBSE first, with a greyed 'coming soon' for an empty known board", () => {
    const r = chooseBoards(make());
    expect(r.ready.map((b) => b.code)).toEqual(["CBSE", "TNMATRIC"]);
    expect(r.soon.map((b) => b.code)).toEqual(["TNSTATE"]);
    expect(r.ready[1]?.lessons).toBe(40);
    expect(r.ready[1]?.label).toBe("Tamil Nadu Matriculation");
  });
  it("old behaviour with 'Show every board' off: only the default board", () => {
    const r = chooseBoards(make({ "catalog.boards.showAll": false, "catalog.defaultBoard": "TNMATRIC" }));
    expect(r.ready.map((b) => b.code)).toEqual(["TNMATRIC"]);
    expect(r.soon).toEqual([]);
  });
  it("respects per-board hide, order, hide-empty off and 'coming soon' off", () => {
    expect(chooseBoards(make({ "catalog.board.cbse.show": false })).ready.map((b) => b.code)).toEqual(["TNMATRIC"]);
    expect(chooseBoards(make({ "catalog.boards.order": "TNMATRIC, CBSE" })).ready.map((b) => b.code)).toEqual(["TNMATRIC", "CBSE"]);
    expect(chooseBoards(make({ "catalog.boards.hideEmpty": false })).ready.map((b) => b.code)).toEqual(["CBSE", "TNMATRIC", "TNSTATE"]);
    expect(chooseBoards(make({ "catalog.showComingSoon": false })).soon).toEqual([]);
  });
  it("lists a board loaded later by its own name, unless others are switched off", () => {
    const more = [...info, { code: "ICSE", name: "ICSE", lessons: 3, topics: 3, classes: [{ classLevel: 5, lessons: 3 }] }];
    expect(chooseBoards({ ...make(), info: more }).ready.map((b) => b.code)).toContain("ICSE");
    expect(chooseBoards({ ...make({ "catalog.boards.showOthers": false }), info: more }).ready.map((b) => b.code)).not.toContain("ICSE");
  });
  it("falls back to the default board while the list is loading", () => {
    expect(chooseBoards({ ...make(), info: null }).ready.map((b) => b.code)).toEqual(["CBSE"]);
  });
  it("reads the board from the address", () => {
    const codes = ["CBSE", "TNMATRIC"];
    expect(boardFromPath("/tnmatric/10/science", codes)).toBe("TNMATRIC");
    expect(boardFromPath("/classroom/cbse/8/maths/a/b", codes)).toBe("CBSE");
    expect(boardFromPath("/play/quiz/tnmatric/10/x/y", codes)).toBe("TNMATRIC");
    expect(boardFromPath("/library", codes)).toBeNull();
    expect(boardFromPath("/", codes)).toBeNull();
  });
});
