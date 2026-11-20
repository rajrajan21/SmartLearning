import { describe, expect, it } from "vitest";
import type { PublicQuestion } from "@studysmart/shared";
import { chooseQuestions } from "./pages/Exam";

const q = (id: string, round: number) => ({ id, key: id, round, type: "true_false", stem: { en: id }, hints: [] }) as PublicQuestion;
describe("exam blueprint", () => {
  it("balanced takes a share from every round, easy to hard", () => {
    const all = [...[1, 2, 3, 4].flatMap((r) => [q(`a${r}`, r), q(`b${r}`, r), q(`c${r}`, r)])];
    const out = chooseQuestions(all, 8, true);
    expect(out).toHaveLength(8);
    for (const r of [1, 2, 3, 4]) expect(out.filter((x) => x.round === r)).toHaveLength(2);
    expect(out.map((x) => x.round)).toEqual([...out.map((x) => x.round)].sort());
  });
  it("never returns more than exist", () => { expect(chooseQuestions([q("x", 1)], 5, true)).toHaveLength(1); });
});
