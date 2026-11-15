import { describe, expect, it } from "vitest";
import { CUSTOM_PALETTE, DEFAULT_PALETTE, DEFAULT_THEME, PALETTES, SETTINGS_BY_KEY, THEMES, contrastRatio, defaults, paletteById, parseSetting, readableOn, recommendedFor, resolveLook, resolveSettings, themeById } from "../src/index.js";

const AA = 4.5;
describe("themes", () => {
  it("has at least 10 themes with unique ids, including the notebook and the three reader styles", () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length);
    for (const id of ["notebook", "hardcover", "pastel", "library"]) expect(THEMES.some((t) => t.id === id), id).toBe(true);
    expect(THEMES.filter((t) => t.inspiredBy).length).toBeGreaterThanOrEqual(6);
  });
  it("every theme recommends a palette that exists and has a description", () => {
    for (const t of THEMES) { expect(paletteById(t.palette), t.id).toBeTruthy(); expect(t.description.length, t.id).toBeGreaterThan(20); expect(t.radius).toBeGreaterThan(0); }
  });
  it("the default theme and palette exist, are the select defaults, and the select options list every theme", () => {
    expect(themeById(DEFAULT_THEME).id).toBe(DEFAULT_THEME);
    expect(paletteById(DEFAULT_PALETTE)).toBeTruthy();
    expect(defaults()["theme.preset"]).toBe(DEFAULT_THEME);
    expect(defaults()["theme.palette"]).toBe(DEFAULT_PALETTE);
    const opts = (SETTINGS_BY_KEY.get("theme.preset") as { options: { value: string }[] }).options.map((o) => o.value);
    expect(opts).toEqual(THEMES.map((t) => t.id));
    const pal = (SETTINGS_BY_KEY.get("theme.palette") as { options: { value: string }[] }).options.map((o) => o.value);
    expect(pal).toEqual([...PALETTES.map((p) => p.id), CUSTOM_PALETTE]);
  });
  it("unknown theme ids fall back to the default; recommendedFor returns the pairing", () => {
    expect(themeById("nope").id).toBe(DEFAULT_THEME);
    expect(recommendedFor("cinematic")).toEqual({ preset: "cinematic", palette: "black-gold", mode: "dark" });
  });
});

describe("palettes", () => {
  it("has at least 10 palettes with unique ids", () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(PALETTES.length);
    for (const id of ["indigo-dawn", "mint-fresh", "sunset-coral", "ocean-teal", "grape-soda", "forest-calm", "berry-pop", "slate-lime", "warm-sand", "midnight-neon", "rose-quartz", "sky-sunshine"]) expect(paletteById(id), id).toBeTruthy();
  });
  for (const p of PALETTES) for (const mode of ["light", "dark"] as const) {
    it(`${p.id} (${mode}) keeps WCAG AA contrast for text and buttons`, () => {
      const c = p[mode];
      expect(contrastRatio(c.ink, c.paper), "ink on paper").toBeGreaterThanOrEqual(AA);
      expect(contrastRatio(c.ink, c.surface), "ink on surface").toBeGreaterThanOrEqual(AA);
      expect(contrastRatio(c.muted, c.paper), "muted on paper").toBeGreaterThanOrEqual(AA);
      expect(contrastRatio(c.muted, c.surface), "muted on surface").toBeGreaterThanOrEqual(AA);
      expect(contrastRatio(c.brand, c.paper), "links on paper").toBeGreaterThanOrEqual(AA);
      expect(contrastRatio(c.brand, c.surface), "links on surface").toBeGreaterThanOrEqual(AA);
      expect(contrastRatio(c.onBrand, c.brand), "button text on brand").toBeGreaterThanOrEqual(AA);
      expect(c.onBrand).toBe(readableOn(c.brand));
      expect(contrastRatio(c.success, c.surface), "success").toBeGreaterThanOrEqual(AA);
      expect(contrastRatio(c.warning, c.surface), "warning").toBeGreaterThanOrEqual(AA);
      expect(contrastRatio("#FFFFFF", c.margin), "badge text on margin colour").toBeGreaterThanOrEqual(AA);
      for (const [k, col] of Object.entries(c.subjects)) expect(contrastRatio("#FFFFFF", col), `white on subject ${k}`).toBeGreaterThanOrEqual(AA);
      for (const col of Object.values({ paper: c.paper, surface: c.surface, ink: c.ink, brand: c.brand })) expect(col).toMatch(/^#[0-9A-F]{6}$/);
    });
  }
  it("the Notebook Blue palette is exactly the original colours", () => {
    const l = paletteById("notebook-blue")!.light;
    const d = defaults() as Record<string, string>;
    expect(l.paper).toBe(d["theme.color.paper"]); expect(l.surface).toBe(d["theme.color.surface"]); expect(l.ink).toBe(d["theme.color.ink"]);
    expect(l.muted).toBe(d["theme.color.muted"]); expect(l.brand).toBe(d["theme.color.brand"]); expect(l.rule).toBe(d["theme.color.rule"]);
    expect(l.accent).toBe(d["theme.color.margin"]); // the margin line itself is darkened a touch so the white badge text passes AA
  });
});

describe("resolveLook", () => {
  it("resolves the default pair, mode and fallback ids", () => {
    const l = resolveLook(defaults(), false);
    expect([l.themeId, l.paletteId, l.mode]).toEqual([DEFAULT_THEME, DEFAULT_PALETTE, "light"]);
    expect(resolveLook({ ...defaults(), "theme.mode": "dark" }, false).colors).toEqual(paletteById(DEFAULT_PALETTE)!.dark);
    expect(resolveLook({ ...defaults(), "theme.mode": "auto" }, true).mode).toBe("dark");
    expect(resolveLook({ ...defaults(), "theme.mode": "auto" }, false).mode).toBe("light");
    expect(resolveLook({ "theme.preset": "zzz", "theme.palette": "zzz" }, false).paletteId).toBe(DEFAULT_PALETTE);
  });
  it("any theme combines with any palette", () => {
    for (const t of THEMES) for (const p of PALETTES) {
      const l = resolveLook({ "theme.preset": t.id, "theme.palette": p.id }, false);
      expect(l.themeId).toBe(t.id); expect(l.colors).toEqual(p.light);
    }
  });
  it("Custom passes the individual colour settings straight through, light and dark", () => {
    const v = { ...defaults(), "theme.palette": "custom", "theme.color.brand": "#123456", "theme.color.paper": "#FEFEFE", "theme.dark.paper": "#010203", "theme.dark.ink": "#F0F0F0", "theme.subject.maths": "#111111" };
    const light = resolveLook(v, false);
    expect(light.paletteId).toBe("custom");
    expect(light.colors.brand).toBe("#123456"); expect(light.colors.paper).toBe("#FEFEFE"); expect(light.colors.subjects.maths).toBe("#111111");
    const dark = resolveLook({ ...v, "theme.mode": "dark" }, false);
    expect(dark.colors.paper).toBe("#010203"); expect(dark.colors.ink).toBe("#F0F0F0"); expect(dark.colors.muted).toBe("#F0F0F0"); expect(dark.colors.brand).toBe("#123456");
  });
});

describe("settings", () => {
  it("validates the new selects", () => {
    expect(parseSetting("theme.preset", "aurora")).toBe("aurora");
    expect(() => parseSetting("theme.preset", "nope")).toThrow();
    expect(parseSetting("theme.palette", "custom")).toBe("custom");
    expect(() => parseSetting("theme.palette", "nope")).toThrow();
    expect(parseSetting("theme.radius", "theme")).toBe("theme");
  });
  it("a site that already stored its own colours keeps them (Notebook + Custom) until the admin chooses otherwise", () => {
    const old = resolveSettings({ "theme.color.brand": "#AA1122" });
    expect(old["theme.palette"]).toBe("custom"); expect(old["theme.preset"]).toBe("notebook");
    const chosen = resolveSettings({ "theme.color.brand": "#AA1122", "theme.palette": "mint-fresh", "theme.preset": "aurora" });
    expect(chosen["theme.palette"]).toBe("mint-fresh"); expect(chosen["theme.preset"]).toBe("aurora");
    expect(resolveSettings({})["theme.palette"]).toBe(DEFAULT_PALETTE);
  });
});
