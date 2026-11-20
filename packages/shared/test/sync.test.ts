import { describe, expect, it } from "vitest";
import { emptySync, mergeSync, SyncData } from "../src/sync.js";

describe("progress merge", () => {
  it("never loses a finished lesson, a better score or a passed round, and is the same whichever side goes first", () => {
    const a = SyncData.parse({ lesson: { t: { step: 7, total: 7, done: true, updatedAt: 1 } }, practice: { t: { "1": { best: 90, stars: 2, passed: true, tries: 2 } } } });
    const b = SyncData.parse({ lesson: { t: { step: 1, total: 7, done: false, updatedAt: 9 } }, practice: { t: { "1": { best: 50, stars: 0, passed: false, tries: 3 }, "2": { best: 100, stars: 3, passed: true, tries: 1 } } } });
    const m = mergeSync(a, b);
    expect(m.lesson.t!.done).toBe(true);
    expect(m.practice.t!["1"]).toEqual({ best: 90, stars: 2, passed: true, tries: 3 });
    expect(m.practice.t!["2"]!.stars).toBe(3);
    expect(mergeSync(b, a)).toEqual(m);
    expect(mergeSync(m, m)).toEqual(m);
    expect(mergeSync(emptySync(), a)).toEqual(a);
  });
});

describe("saved lessons sync", () => {
  const n = (savedAt: number, removedAt?: number) => ({ id: "t1", href: "/x", title: { en: "A" }, subject: { en: "Maths" }, savedAt, ...(removedAt ? { removedAt } : {}) });
  it("keeps a lesson saved on either device", () => {
    const a = { ...emptySync(), notes: { t1: n(10) } }, b = { ...emptySync(), notes: { t2: { ...n(20), id: "t2" } } };
    expect(Object.keys(mergeSync(a, b).notes).sort()).toEqual(["t1", "t2"]);
  });
  it("an un-save made later beats an older save, and a re-save beats an older un-save", () => {
    const saved = { ...emptySync(), notes: { t1: n(10) } }, removed = { ...emptySync(), notes: { t1: n(10, 30) } }, resaved = { ...emptySync(), notes: { t1: n(50) } };
    expect(mergeSync(saved, removed).notes.t1?.removedAt).toBe(30);
    expect(mergeSync(removed, resaved).notes.t1?.removedAt).toBeUndefined();
    expect(mergeSync(removed, saved)).toEqual(mergeSync(saved, removed));
  });
});
