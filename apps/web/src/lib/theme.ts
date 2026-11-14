import { SETTINGS_BY_KEY, contrastRatio, type SettingValue } from "@studysmart/shared";

type Values = Record<string, SettingValue>;
const str = (v: Values, k: string) => String(v[k] ?? SETTINGS_BY_KEY.get(k)?.default);

const RADIUS = { sharp: 4, soft: 12, round: 22 } as const;
const DENSITY = { compact: 0.8, comfortable: 1, roomy: 1.25 } as const;

/** Pick whichever of two colours reads better on a background (used for text on admin-chosen colours). */
export function readableOn(bg: string, light = "#FFFFFF", dark = "#101828"): string {
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark;
}

export function resolveMode(mode: string, prefersDark: boolean): "light" | "dark" {
  return mode === "dark" ? "dark" : mode === "auto" ? (prefersDark ? "dark" : "light") : "light";
}

/** Turns settings into CSS custom properties. Pure, so it can be tested and used for live admin preview. */
export function themeVars(v: Values, prefersDark: boolean): { vars: Record<string, string>; attrs: Record<string, string> } {
  const mode = resolveMode(str(v, "theme.mode"), prefersDark);
  const dark = mode === "dark";
  const vars: Record<string, string> = {
    "--paper": dark ? str(v, "theme.dark.paper") : str(v, "theme.color.paper"),
    "--surface": dark ? str(v, "theme.dark.surface") : str(v, "theme.color.surface"),
    "--ink": dark ? str(v, "theme.dark.ink") : str(v, "theme.color.ink"),
    "--muted": dark ? str(v, "theme.dark.ink") : str(v, "theme.color.muted"),
    "--brand": str(v, "theme.color.brand"),
    "--margin": str(v, "theme.color.margin"),
    "--rule": dark ? "rgba(255,255,255,0.08)" : str(v, "theme.color.rule"),
    "--success": str(v, "theme.color.success"),
    "--warning": str(v, "theme.color.warning"),
    "--radius": `${RADIUS[str(v, "theme.radius") as keyof typeof RADIUS] ?? 12}px`,
    "--density": String(DENSITY[str(v, "theme.density") as keyof typeof DENSITY] ?? 1),
    "--text-scale": str(v, "theme.font.scale"),
    "--font-heading": str(v, "theme.font.heading") === "baloo" ? '"Baloo Thambi 2", "Mukta Malar", system-ui, sans-serif' : "system-ui, sans-serif",
    "--font-body": str(v, "theme.font.body") === "mukta" ? '"Mukta Malar", system-ui, sans-serif' : "system-ui, sans-serif",
    "--on-brand": readableOn(str(v, "theme.color.brand")),
  };
  for (const s of ["maths", "evs", "english", "tamil", "science", "social", "other"]) vars[`--subject-${s}`] = str(v, `theme.subject.${s}`);
  return {
    vars,
    attrs: {
      "data-mode": mode,
      "data-rules": String(v["theme.paper.rules"] !== false),
      "data-margin": String(v["theme.paper.margin"] !== false),
      "data-motion": str(v, "theme.motion"),
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
