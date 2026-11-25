import { describe, expect, it } from "vitest";
import { PANELS, SETTINGS, SETTINGS_BY_KEY, THEME_PRESETS, contrastRatio, defaults, parseSetting, publicSettings, resolveSettings } from "../src/index.js";

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

describe("textbook reader settings", () => {
  it("has its own admin panel with helpful text on every setting", () => {
    expect(PANELS.some((p) => p.id === "textbooks" && p.label === "Textbooks")).toBe(true);
    const defs = SETTINGS.filter((d) => d.panel === "textbooks");
    expect(defs.map((d) => d.key).sort()).toEqual(["reader.allowStylePicker", "reader.autoTurn", "reader.defaultSpeed", "reader.disclaimer.show", "reader.disclaimer.text", "reader.fastPages", "reader.readAloud", "reader.showDownload", "reader.showPrint", "reader.style", "reader.tamilVoiceHelp", "reader.toc.show", "reader.voiceLang", "textbooks.nav.show"]);
    for (const d of [...defs, SETTINGS_BY_KEY.get("feature.textbooks")!]) { expect(d.public, d.key).toBe(true); expect((d.help ?? "").length, d.key).toBeGreaterThan(20); }
  });
  it("defaults: feature on, style C (Library) with all three styles offered, picker on, read aloud at 0.9 with an Indian English voice", () => {
    const v = defaults();
    expect(v["feature.textbooks"]).toBe(true);
    expect(v["reader.style"]).toBe("c");
    const style = SETTINGS_BY_KEY.get("reader.style")!;
    expect(style.type === "select" && style.options.map((o) => o.value)).toEqual(["a", "b", "c"]);
    expect(style.type === "select" && style.options.map((o) => o.label.slice(0, 11))).toEqual(["A Hardcover", "B Digital (", "C Library ("]);
    expect(v["reader.allowStylePicker"]).toBe(true);
    expect(v["reader.readAloud"]).toBe(true);
    expect(v["reader.voiceLang"]).toBe("en-IN");
    expect(v["reader.tamilVoiceHelp"]).toBe(true);
    expect(v["reader.showDownload"]).toBe(true);
    expect(v["reader.showPrint"]).toBe(true);
    expect(v["reader.autoTurn"]).toBe(true);
    expect(v["reader.defaultSpeed"]).toBe(0.9);
  });
  it("validates values and sends them to every browser", () => {
    expect(parseSetting("reader.style", "a")).toBe("a");
    expect(() => parseSetting("reader.style", "d")).toThrow(/options/);
    expect(() => parseSetting("reader.defaultSpeed", 3)).toThrow(/between/);
    expect(parseSetting("reader.voiceLang", "ta-IN")).toBe("ta-IN");
    expect(() => parseSetting("reader.voiceLang", "fr-FR")).toThrow();
    const pub = publicSettings(resolveSettings({ "reader.style": "b", "feature.textbooks": false }));
    expect(pub["reader.style"]).toBe("b");
    expect(pub["feature.textbooks"]).toBe(false);
    expect(pub["reader.defaultSpeed"]).toBe(0.9);
  });
});

describe("lesson completion hub and spotlight tour settings", () => {
  it("registers all public completion hub and spotlight tour settings with valid defaults", () => {
    const v = defaults();
    expect(v["lesson.completionHub.enabled"]).toBe(true);
    expect(v["lesson.completionHub.progressStrip"]).toBe(true);
    expect(v["lesson.completionHub.adaptivePrimary"]).toBe(true);
    expect(v["lesson.completionHub.showWorksheet"]).toBe(true);
    expect(v["lesson.completionHub.showGames"]).toBe(true);
    expect(v["lesson.completionHub.showNextLesson"]).toBe(true);
    expect(v["ux.spotlightTour.enabled"]).toBe(true);
    expect(v["ux.spotlightTour.autoOpen"]).toBe(true);
    expect(v["ux.spotlightTour.maxAutoPerSession"]).toBe(1);
    expect(v["ux.spotlightTour.autoDelayMs"]).toBe(900);
    expect(v["ux.spotlightTour.pages.home"]).toBe(true);
    expect(v["ux.spotlightTour.pages.subject"]).toBe(true);
    expect(v["ux.spotlightTour.pages.chapter"]).toBe(true);
    expect(v["ux.spotlightTour.pages.lesson"]).toBe(true);
    expect(v["ux.spotlightTour.pages.results"]).toBe(true);
    expect(v["ux.helpHub.enabled"]).toBe(true);
    expect(v["ux.helpHub.quickJumps"]).toBe(true);
    expect(v["ux.helpHub.position"]).toBe("right");
    expect(v["ux.helpHub.title"]).toEqual({ en: "Study help", ta: "படிப்பு உதவி" });
    expect(v["classroom.fitViewport"]).toBe(true);

    expect(parseSetting("ux.spotlightTour.maxAutoPerSession", 0)).toBe(0);
    expect(() => parseSetting("ux.spotlightTour.maxAutoPerSession", 9)).toThrow(/between/);
    expect(parseSetting("ux.spotlightTour.autoDelayMs", 1200)).toBe(1200);
    expect(() => parseSetting("ux.spotlightTour.autoDelayMs", -100)).toThrow(/between/);

    const pub = publicSettings(resolveSettings({ "lesson.completionHub.showGames": false, "ux.helpHub.enabled": false }));
    expect(pub["lesson.completionHub.showGames"]).toBe(false);
    expect(pub["ux.helpHub.enabled"]).toBe(false);
    expect(pub["ux.spotlightTour.enabled"]).toBe(true);
  });
});
