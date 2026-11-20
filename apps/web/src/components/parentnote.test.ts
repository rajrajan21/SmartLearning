import { describe, expect, it } from "vitest";
import { noteDecision } from "./ParentNote";
describe("noteDecision", () => {
  it("shows once a day", () => { const a = noteDecision(null, 10000, "d1", 1); expect(a.show).toBe(true); expect(noteDecision(a.next, 99999, "d1", 1).show).toBe(false); expect(noteDecision(a.next, 99999, "d2", 1).show).toBe(true); });
  it("shows twice when set to two", () => { const a = noteDecision(null, 10000, "d1", 2); const b = noteDecision(a.next, 20000, "d1", 2); expect(b.show).toBe(true); expect(noteDecision(b.next, 30000, "d1", 2).show).toBe(false); });
  it("a quick repeat (same page load) still shows", () => { const a = noteDecision(null, 10000, "d1", 1); expect(noteDecision(a.next, 10500, "d1", 1).show).toBe(true); });
});
