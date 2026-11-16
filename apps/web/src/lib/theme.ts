import { SETTINGS_BY_KEY, resolveLook, readableOn as readable, type SettingValue } from "@studysmart/shared";

type Values = Record<string, SettingValue>;
const str = (v: Values, k: string) => String(v[k] ?? SETTINGS_BY_KEY.get(k)?.default);

const RADIUS = { sharp: 4, soft: 12, round: 22 } as const;
const DENSITY = { compact: 0.8, comfortable: 1, roomy: 1.25 } as const;
const HEADING = {
  rounded: '"Baloo Thambi 2", "Mukta Malar", system-ui, sans-serif',
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, "Mukta Malar", sans-serif',
  serif: 'Georgia, "Iowan Old Style", "Palatino Linotype", "Mukta Malar", serif',
} as const;

/** Pick whichever of two colours reads better on a background (used for text on admin-chosen colours). */
export const readableOn = readable;

export function resolveMode(mode: string, prefersDark: boolean): "light" | "dark" {
  return mode === "dark" ? "dark" : mode === "auto" ? (prefersDark ? "dark" : "light") : "light";
}

/** Corner radius in px: an explicit admin choice wins, otherwise the theme decides. */
export function radiusFor(choice: string, themeRadius: number): number {
  return RADIUS[choice as keyof typeof RADIUS] ?? themeRadius;
}
export function headingFont(choice: string, themeHeading: keyof typeof HEADING): string {
  return choice === "baloo" ? HEADING.rounded : choice === "system" ? HEADING.system : HEADING[themeHeading];
}

/** Turns settings into CSS custom properties. Pure, so it can be tested and used for live admin preview. */
export function themeVars(v: Values, prefersDark: boolean): { vars: Record<string, string>; attrs: Record<string, string> } {
  const look = resolveLook(v, prefersDark);
  const c = look.colors;
  const notebook = look.themeId === "notebook";
  const vars: Record<string, string> = {
    "--paper": c.paper, "--surface": c.surface, "--ink": c.ink, "--muted": c.muted, "--brand": c.brand, "--on-brand": c.onBrand, "--on-success": readable(c.success),
    "--accent": c.accent, "--margin": c.margin, "--rule": c.rule, "--success": c.success, "--warning": c.warning,
    "--radius": `${radiusFor(str(v, "theme.radius"), look.theme.radius)}px`,
    "--density": String(DENSITY[str(v, "theme.density") as keyof typeof DENSITY] ?? 1),
    "--text-scale": str(v, "theme.font.scale"),
    "--font-heading": headingFont(str(v, "theme.font.heading"), look.theme.heading),
    "--hl1": str(v, "text.accent.c1") || "#E8590C", "--hl2": str(v, "text.accent.c2") || "#7C3AED", "--hl3": str(v, "text.accent.c3") || "#0EA5A4", "--h-weight": str(v, "text.heading.weight") || "800",
    "--font-body": str(v, "theme.font.body") === "mukta" ? '"Mukta Malar", system-ui, sans-serif' : "system-ui, sans-serif",
  };
  for (const s of ["maths", "evs", "english", "tamil", "science", "social", "other"] as const) vars[`--subject-${s}`] = c.subjects[s];
  return {
    vars,
    attrs: {
      "data-mode": look.mode,
      "data-theme": look.themeId,
      "data-palette": look.paletteId,
      // ruled lines and the red margin belong to the Notebook theme only
      "data-rules": String(notebook && v["theme.paper.rules"] !== false),
      "data-margin": String(notebook && v["theme.paper.margin"] !== false),
      "data-motion": str(v, "theme.motion"),
      "data-transition": v["ui.pageTransition"] === false ? "off" : "on",
      "data-focus": v["a11y.focus.strong"] === false ? "normal" : "strong",
      "data-targets": v["a11y.targets.large"] === false ? "normal" : "large",
      "data-mobile": String(v["ui.mobile.polish"] !== false),
      "data-accent": str(v, "text.accent.style") || "gradient",
      "data-headings": str(v, "text.heading.style") || "colourful",
      "data-layout": str(v, "layout.style") || "grand",
      "data-width": str(v, "layout.width") || "wide",
      "data-picker": str(v, "layout.picker") || "left",
    },
  };
}

export function applyTheme(v: Values, prefersDark: boolean, root: HTMLElement = document.documentElement): void {
  const { vars, attrs } = themeVars(v, prefersDark);
  for (const [k, val] of Object.entries(vars)) root.style.setProperty(k, val);
  for (const [k, val] of Object.entries(attrs)) root.setAttribute(k, val);
  root.style.colorScheme = attrs["data-mode"]!;
}

export const SUBJECT_COLOR_KEYS = ["maths", "evs", "english", "tamil", "science", "social"] as const;
export const subjectVar = (slug: string) => `var(--subject-${(SUBJECT_COLOR_KEYS as readonly string[]).includes(slug) ? slug : "other"})`;
