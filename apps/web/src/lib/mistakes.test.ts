import { beforeEach, describe, expect, it } from "vitest";
import { readAllMistakes, readMistakes, recordMistake, removeMistake } from "./mistakes";
const q = (id: string) => ({ id, stem: { en: "Q" } }) as never;
const bad = { correct: false, correctAnswer: { en: "A" }, explanation: { en: "W" } } as never;
const good = { correct: true } as never;
describe("mistake notebook with sync marks", () => {
  beforeEach(() => { localStorage.clear(); });
  it("saves a miss and hides it after 'learned it' but keeps the mark for sync", () => {
    recordMistake(q("a"), bad, 50);
    expect(readMistakes()).toHaveLength(1);
    removeMistake("a");
    expect(readMistakes()).toHaveLength(0);
    expect(readAllMistakes().a!.removedAt).toBeGreaterThan(0);
  });
  it("a right answer clears it, a later miss brings it back", () => {
    recordMistake(q("b"), bad, 50); recordMistake(q("b"), good, 50);
    expect(readMistakes()).toHaveLength(0);
    recordMistake(q("b"), bad, 50);
    expect(readMistakes()).toHaveLength(1); expect(readAllMistakes().b!.removedAt).toBeUndefined();
  });
});
