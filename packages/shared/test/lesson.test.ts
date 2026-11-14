import { describe, expect, it } from "vitest";
import { TopicLesson } from "../src/index.js";

const valid = {
  topicId: "t1",
  version: 1,
  status: "draft",
  title: { en: "Fractions" },
  blocks: [
    { id: "b1", type: "explanation", provenance: "original", text: { en: "A fraction is part of a whole." } },
    {
      id: "b2",
      type: "teacher_narration",
      provenance: "original",
      teacher: "malar-english",
      sentences: [{ id: "s1", text: { en: "Let's start with a pizza." }, board: [{ op: "draw", shape: "circle" }] }],
    },
  ],
};

describe("TopicLesson schema", () => {
  it("accepts a valid lesson and fills defaults", () => {
    const lesson = TopicLesson.parse(valid);
    const nar = lesson.blocks[1];
    expect(nar?.type).toBe("teacher_narration");
    if (nar?.type === "teacher_narration") expect(nar.sentences[0]?.audioKey).toBeNull();
  });
  it("rejects a diagram without alt text", () => {
    const bad = { ...valid, blocks: [{ id: "d", type: "diagram", provenance: "original", assetKey: "x.svg" }] };
    expect(TopicLesson.safeParse(bad).success).toBe(false);
  });
  it("rejects missing provenance", () => {
    const bad = { ...valid, blocks: [{ id: "b", type: "explanation", text: { en: "x" } }] };
    expect(TopicLesson.safeParse(bad).success).toBe(false);
  });
  it("rejects empty lessons", () => {
    expect(TopicLesson.safeParse({ ...valid, blocks: [] }).success).toBe(false);
  });
});
