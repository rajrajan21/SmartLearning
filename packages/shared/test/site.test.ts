import { describe, expect, it } from "vitest";
import { SETTINGS_BY_KEY, SITE, PANELS, defaults, pageTitle, parseSetting, publicSettings } from "../src/index.js";

describe("site constant and access settings", () => {
  it("names the product once", () => {
    expect(SITE.name).toBe("SharpStudy");
    expect(SITE.domain).toBe("sharpstudy.in");
    expect(pageTitle("About")).toBe("About – SharpStudy");
    expect(defaults()["site.name"]).toBe(SITE.name);
    expect(JSON.stringify(defaults())).not.toMatch(/StudySmart/i);
  });
  it("has a Site access panel, public by default, and keeps access settings private", () => {
    expect(PANELS.map((p) => p.id)).toContain("access");
    expect(defaults()["access.mode"]).toBe("public");
    expect(parseSetting("access.mode", "invite")).toBe("invite");
    expect(() => parseSetting("access.mode", "secret")).toThrow();
    expect(() => parseSetting("access.cookieDays", 0)).toThrow();
    const pub = publicSettings(defaults());
    for (const d of SETTINGS_BY_KEY.values()) if (d.key.startsWith("access.")) expect(pub[d.key], d.key).toBeUndefined();
  });
});
