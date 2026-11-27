import { describe, expect, it } from "vitest";
import {
  Question,
  answersMatch,
  defaultMarksFor,
  parseNumericValue,
  smartNormalizeAnswer,
} from "../src/question.js";
// @ts-expect-error ESM script without .d.ts
import { convertPaperQuestion, dedupeQuestions, normalizeStemHash } from "../../../tools/papers/enrich-chapter-questions.mjs";

describe("smartNormalizeAnswer & answersMatch", () => {
  it("normalizes case, whitespace, trailing punctuation, and thousands commas", () => {
    expect(smartNormalizeAnswer("  21,600. ")).toBe("21600");
    expect(smartNormalizeAnswer("1,25,000")).toBe("125000");
    expect(smartNormalizeAnswer("  40cm! ")).toBe("40 cm");
    expect(smartNormalizeAnswer("15 cm²")).toBe("15 cm2");
    expect(smartNormalizeAnswer("15 sq. cm")).toBe("15 cm2");
  });

  it("matches fill-in answers across units, commas, case, and decimals/fractions", () => {
    expect(answersMatch("40cm", ["40 cm", "40"], "cm")).toBe(true);
    expect(answersMatch("40", ["40 cm"], "cm")).toBe(true);
    expect(answersMatch("40 CM.", ["40 cm"], "cm")).toBe(true);
    expect(answersMatch("21,600 sq m", ["21600 m2"], "sq m")).toBe(true);
    expect(answersMatch("21600", ["21,600 sq m"], "sq m")).toBe(true);
    expect(answersMatch("0.5", ["1/2"])).toBe(true);
    expect(answersMatch("1/4", ["0.25"])).toBe(true);
    expect(answersMatch("15 sq cm", ["15.0 cm2"], "sq cm")).toBe(true);
    expect(answersMatch("42 cm", ["40 cm"], "cm")).toBe(false);
    expect(answersMatch("", ["40 cm"], "cm")).toBe(false);
  });

  it("parses numeric and fraction values accurately", () => {
    expect(parseNumericValue("0.25")).toBe(0.25);
    expect(parseNumericValue("1/4")).toBe(0.25);
    expect(parseNumericValue("3/0")).toBeNull();
    expect(parseNumericValue("abc")).toBeNull();
  });

  it("computes default marks by tier and explicit override", () => {
    expect(defaultMarksFor({ tier: "textbook" })).toBe(1);
    expect(defaultMarksFor({ tier: "exam" })).toBe(2);
    expect(defaultMarksFor({ tier: "advanced" })).toBe(3);
    expect(defaultMarksFor({ tier: "exam", marks: 4 })).toBe(4);
    expect(defaultMarksFor({ type: "mcq" })).toBe(1);
    expect(defaultMarksFor({ type: "long" })).toBe(3);
  });

  it("validates fill-in-the-blank question schema with tiers, hints, and solutionSteps", () => {
    const parsed = Question.parse({
      key: "c6-fill-1",
      round: 1,
      tier: "textbook",
      marks: 1,
      type: "fill",
      stem: { en: "Perimeter of a square of side 5 cm is ___." },
      accepted: ["20 cm", "20"],
      unit: { en: "cm" },
      hint: { en: "Multiply side by 4." },
      explanation: { en: "4 × 5 = 20 cm." },
      solutionSteps: [{ en: "Perimeter = 4 × side" }, { en: "4 × 5 = 20 cm" }],
      source: "NCERT Class 6 Maths",
      provenance: "original",
      status: "published",
    });
    expect(parsed.type).toBe("fill");
    expect(parsed.tier).toBe("textbook");
    expect(parsed.solutionSteps).toHaveLength(2);
  });
});

describe("online question enrichment deduplication", () => {
  it("deduplicates by normalized stem hash across punctuation/case differences", () => {
    const h1 = normalizeStemHash("What is the perimeter of a square of side 9 cm?");
    const h2 = normalizeStemHash("what is the perimeter of a square of side 9 cm");
    expect(h1).toBe(h2);

    const existing = [{ key: "q1", stem: { en: "What is the perimeter of a square of side 9 cm?" } }];
    const incoming = [
      { key: "q2", stem: { en: "what is the perimeter of a square of side 9 cm" } },
      { key: "q3", stem: { en: "Find the area of a rectangle 12 cm by 5 cm." } },
      { key: "q4", stem: { en: "Find the area of a rectangle 12 cm by 5 cm!" } },
    ];
    const { kept, duplicates } = dedupeQuestions(existing, incoming);
    expect(kept).toHaveLength(1);
    expect(kept[0].key).toBe("q3");
    expect(duplicates).toBe(2);
  });

  it("converts valid harvested MCQ & filters instruction noise", () => {
    const paper = {
      title: "CBSE Class 6 Maths Sample Paper",
      year: "2025-26",
      source: { site: "CBSE Academic", url: "https://cbseacademic.nic.in/sqp.pdf" },
    };
    const noise = convertPaperQuestion(paper, { n: "1", text: "This question paper contains 38 questions. All Questions are compulsory.", type: "short" }, 1);
    expect(noise).toBeNull();

    const ok = convertPaperQuestion(
      paper,
      { n: "2", text: "The perimeter of a regular hexagon of side 6 cm is:", type: "mcq", options: ["A. 24 cm", "B. 36 cm", "C. 18 cm", "D. 12 cm"], answer: "B", marks: 1 },
      2,
    );
    expect(ok).not.toBeNull();
    expect(ok.tier).toBe("exam");
    expect(ok.options[1].correct).toBe(true);
    expect(ok.source).toContain("CBSE Academic");
  });
});
