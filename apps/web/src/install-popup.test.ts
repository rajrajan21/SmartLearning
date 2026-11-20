import { describe, expect, it } from "vitest";
import { snoozed } from "./components/InstallPopup";

describe("install pop-up memory", () => {
  it("stays quiet while snoozed or after 'don't ask again'", () => {
    expect(snoozed({}, 1000)).toBe(false);
    expect(snoozed({ until: 5000 }, 1000)).toBe(true);
    expect(snoozed({ until: 5000 }, 6000)).toBe(false);
    expect(snoozed({ never: true }, 1)).toBe(true);
  });
});
