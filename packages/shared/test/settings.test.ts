import { describe, expect, it } from "vitest";
import { SETTINGS, SETTINGS_BY_KEY, THEME_PRESETS, contrastRatio, defaults, parseSetting, publicSettings, resolveSettings } from "../src/index.js";

describe("settings registry", () => {
  it("has unique keys and every default passes its own validation (live settings)", () => {
    expect(new Set(SETTINGS.map((d) => d.key)).size).toBe(SETTINGS.length);
    for (const d of SETTINGS.filter((x) => x.availability !== "planned")) expect(() => parseSetting(d.key, d.default)).not.toThrow();
  });
  it("dependsOn points at real boolean settings", () => {
    for (const d of SETTINGS) if (d.dependsOn) expect(SETTINGS_BY_KEY.get(d.dependsOn)?.type).toBe("boolean");
  });
  it("planned features cannot be switched on yet, and default off", () => {
    expect(() => parseSetting("feature.adminEmails", true)).toThrow(/not built yet/);
    expect(defaults()["feature.adminEmails"]).toBe(false);
  });
  it("validates by type", () => {
    expect(() => parseSetting("feature.browse", "yes")).toThrow();
    expect(() => parseSetting("site.search.maxResults", 500)).toThrow(/between/);
    expect(() => parseSetting("theme.radius", "huge")).toThrow(/options/);
    expect(parseSetting("theme.color.brand", "#1f4fd1")).toBe("#1F4FD1");
    expect(() => parseSetting("theme.color.brand", "blue")).toThrow(/colour/);
    expect(parseSetting("catalog.openClasses", [5, 3, 3])).toEqual([3, 5]);
    expect(() => parseSetting("catalog.openClasses", [99])).toThrow();
    expect(() => parseSetting("nope.key", 1)).toThrow(/Unknown/);
    expect(parseSetting("home.hero.title", { en: " Hi ", ta: "" })).toEqual({ en: "Hi" });
    expect(() => parseSetting("home.hero.title", { en: "x".repeat(200) })).toThrow();
  });
  it("resolve ignores stale or invalid stored values", () => {
    const v = resolveSettings({ "feature.search": false, "site.search.maxResults": 9999, "removed.key": 1 });
    expect(v["feature.search"]).toBe(false);
    expect(v["site.search.maxResults"]).toBe(20);
    expect(v["removed.key"]).toBeUndefined();
  });
  it("public settings never include admin-only keys", () => {
    const p = publicSettings(defaults());
    expect(p["site.cache.maxAgeSeconds"]).toBeUndefined();
    expect(p["theme.color.ink"]).toBeDefined();
  });
  it("default text colours meet WCAG AA (4.5:1) on their backgrounds", () => {
    const d = defaults() as Record<string, string>;
    for (const def of SETTINGS) if (def.type === "color" && def.contrastAgainst) {
      expect(contrastRatio(d[def.key]!, d[def.contrastAgainst]!), `${def.key} on ${def.contrastAgainst}`).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("every preset sets only valid values and keeps text readable", () => {
    for (const p of THEME_PRESETS) {
      const merged = { ...defaults(), ...p.values } as Record<string, string>;
      for (const [k, v] of Object.entries(p.values)) expect(() => parseSetting(k, v), `${p.id}/${k}`).not.toThrow();
      expect(contrastRatio(merged["theme.color.ink"]!, merged["theme.color.paper"]!), p.id).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(merged["theme.dark.ink"]!, merged["theme.dark.paper"]!), p.id).toBeGreaterThanOrEqual(4.5);
    }
  });
});
