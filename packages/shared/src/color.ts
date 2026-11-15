/** Small colour helpers (WCAG 2.1 contrast, mixing, fitting). Pure; used by the palettes, the admin page and tests. */
const rgb = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();

function luminance(hex: string): number {
  const c = rgb(hex).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}
/** Mix two #RRGGBB colours: t = 0 gives a, t = 1 gives b. */
export function mixHex(a: string, b: string, t: number): string {
  const x = rgb(a), y = rgb(b);
  return toHex(x.map((v, i) => v + (y[i]! - v) * t));
}
/** Pick whichever of two colours reads better on a background (text on admin-chosen colours). */
export function readableOn(bg: string, light = "#FFFFFF", dark = "#101828"): string {
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark;
}
/** Nudge `fg` towards `towards` in small steps until `ok` accepts it (never loops forever). */
export function fitColor(fg: string, towards: string, ok: (c: string) => boolean): string {
  for (let i = 0; i <= 40; i++) { const c = i === 0 ? fg : mixHex(fg, towards, i * 0.025); if (ok(c)) return c; }
  return towards;
}
