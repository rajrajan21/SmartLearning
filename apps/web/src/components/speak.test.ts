import { describe, expect, it } from "vitest";
import { addSpoken, recognitionCtor } from "./SpeakAnswer";
describe("speak answer", () => {
  it("joins spoken words with one space", () => { expect(addSpoken("Plants", " make food ")).toBe("Plants make food"); expect(addSpoken("", "hi")).toBe("hi"); expect(addSpoken("x", "  ")).toBe("x"); });
  it("detects missing support", () => { expect(recognitionCtor({})).toBeNull(); const C = class {}; expect(recognitionCtor({ webkitSpeechRecognition: C })).toBe(C); });
});
