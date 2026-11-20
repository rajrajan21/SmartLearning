import { describe, expect, it } from "vitest";
import { emptySync, mergeSync, SyncData } from "../src/sync";
const m = (id: string, at: number, removedAt?: number) => ({ id, stem: { en: "q" }, answer: { en: "a" }, why: { en: "w" }, at, ...(removedAt ? { removedAt } : {}) });
describe("mistake notebook sync", () => {
  it("old data without mistakes still parses", () => { expect(SyncData.parse({ lesson: {} }).mistakes).toEqual({}); });
  it("keeps mistakes from both devices", () => { const a = { ...emptySync(), mistakes: { x: m("x", 1) } }, b = { ...emptySync(), mistakes: { y: m("y", 2) } }; expect(Object.keys(mergeSync(a, b).mistakes).sort()).toEqual(["x", "y"]); });
  it("'learned it' on one device removes it on the other", () => { const a = { ...emptySync(), mistakes: { x: m("x", 1) } }, b = { ...emptySync(), mistakes: { x: m("x", 1, 5) } }; expect(mergeSync(a, b).mistakes.x!.removedAt).toBe(5); });
  it("a newer miss beats an older 'learned it'", () => { const a = { ...emptySync(), mistakes: { x: m("x", 9) } }, b = { ...emptySync(), mistakes: { x: m("x", 1, 5) } }; expect(mergeSync(a, b).mistakes.x!.removedAt).toBeUndefined(); });
});
