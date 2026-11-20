import { describe, expect, it } from "vitest";
import { inQuiet, shouldRemind } from "./components/Reminder";

describe("study reminder", () => {
  it("quiet hours can cross midnight", () => {
    expect(inQuiet(22, 21, 7)).toBe(true);
    expect(inQuiet(3, 21, 7)).toBe(true);
    expect(inQuiet(12, 21, 7)).toBe(false);
  });
  it("shows only after the hour, outside quiet time, when the goal is not met and not dismissed", () => {
    expect(shouldRemind(17, 17, 21, 7, false, false)).toBe(true);
    expect(shouldRemind(16, 17, 21, 7, false, false)).toBe(false);
    expect(shouldRemind(22, 17, 21, 7, false, false)).toBe(false);
    expect(shouldRemind(18, 17, 21, 7, true, false)).toBe(false);
    expect(shouldRemind(18, 17, 21, 7, false, true)).toBe(false);
  });
});
