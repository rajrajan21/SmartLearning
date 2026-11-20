import { contrastRatio, fitColor, mixHex, readableOn } from "./color.js";

/**
 * Whole-site looks. A THEME is the structure (page background, surfaces, borders, shadows, corners, heading style,
 * decoration; its CSS lives in apps/web/src/themes.css). A PALETTE is the colours. Any theme can be combined with any palette.
 * Palettes are written as a few seed colours; every derived colour (muted text, rules, status colours, dark mode) is
 * adjusted here so text and buttons always keep WCAG AA contrast (4.5:1).
 */
export type ThemeId = string;
export interface ThemeDef {
  id: ThemeId; label: string; description: string; inspiredBy?: string;
  /** palette that suits this theme best */
  palette: string;
  /** light or dark suits it best (every theme works in both) */
  mode: "light" | "dark";
  /** corner roundness in px when the admin leaves "Corner style" on "Follow the theme" */
  radius: number;
  heading: "rounded" | "system" | "serif";
}

export const THEMES: ThemeDef[] = [
  { id: "playful", label: "Playful Pop", description: "Bright and friendly: chunky rounded buttons that press down, bold tiles, a little confetti in the background.", inspiredBy: "Duolingo", palette: "indigo-dawn", mode: "light", radius: 18, heading: "rounded" },
  { id: "notebook", label: "Notebook", description: "The original look: ruled paper, blue ink and a red margin line.", palette: "notebook-blue", mode: "light", radius: 12, heading: "rounded" },
  { id: "calm", label: "Calm Classroom", description: "Quiet, clean and focused: white cards, a thin top line and lots of breathing room.", inspiredBy: "Khan Academy", palette: "khan-teal", mode: "light", radius: 10, heading: "system" },
  { id: "code-navy", label: "Code Lab", description: "Deep navy with a sunny accent, a faint dot grid and square-edged panels.", inspiredBy: "Codecademy", palette: "navy-sun", mode: "dark", radius: 6, heading: "system" },
  { id: "friendly-mesh", label: "Friendly Mesh", description: "Soft teal and purple colour blobs behind rounded, welcoming cards.", inspiredBy: "Code.org", palette: "code-org", mode: "light", radius: 16, heading: "rounded" },
  { id: "cinematic", label: "Cinematic Gold", description: "Elegant dark stage with serif headings, thin gold lines and a soft spotlight.", inspiredBy: "MasterClass", palette: "black-gold", mode: "dark", radius: 4, heading: "serif" },
  { id: "vivid-clean", label: "Vivid Clean", description: "Crisp white pages, big bold headings and vivid pill-shaped buttons.", inspiredBy: "Skillshare", palette: "skill-green", mode: "light", radius: 20, heading: "system" },
  { id: "trusted", label: "Trusted Blue", description: "Professional and clear: a blue top band, soft shadows, tidy cards.", inspiredBy: "Coursera", palette: "coursera-blue", mode: "light", radius: 8, heading: "system" },
  { id: "utility", label: "Crisp Utility", description: "Flat, compact and no-nonsense: thin borders, small corners, a strong accent edge.", inspiredBy: "Canvas LMS", palette: "canvas-red", mode: "light", radius: 4, heading: "system" },
  { id: "aurora", label: "Aurora Glass", description: "Frosted-glass panels floating over a soft aurora gradient.", palette: "grape-soda", mode: "light", radius: 20, heading: "rounded" },
  { id: "brutalist", label: "Bold Blocks", description: "Neo-brutalist: thick black outlines, hard offset shadows, flat bright colour.", palette: "sky-sunshine", mode: "light", radius: 6, heading: "system" },
  { id: "paper-grain", label: "Quiet Paper", description: "A calm, minimal page with fine paper grain and hairline borders.", palette: "soft-ink", mode: "light", radius: 6, heading: "serif" },
  { id: "hardcover", label: "Hardcover Desk", description: "A wood desk with cream book pages, brass edges and cloth-bound subject books.", inspiredBy: "Textbook reader style A", palette: "walnut-cream", mode: "light", radius: 6, heading: "serif" },
  { id: "pastel", label: "Pastel Digital", description: "Soft lilac page, pastel tiles and rounded pill buttons.", inspiredBy: "Textbook reader style B", palette: "pastel-digital", mode: "light", radius: 20, heading: "rounded" },
  { id: "library", label: "Sage Library", description: "Sage-green wall, card-catalogue panels and ribbon accents; night mode is a lamp-lit library.", inspiredBy: "Textbook reader style C", palette: "sage-library", mode: "light", radius: 8, heading: "serif" },
  { id: "editorial", label: "Official Editorial", description: "Clean institutional look: white panels, hairline borders, serif headings and a quiet accent line. Pairs with Indigo & Gold.", palette: "inst-gold", mode: "light", radius: 10, heading: "serif" },
];
export const DEFAULT_THEME = "playful";

export interface SubjectColors { maths: string; evs: string; english: string; tamil: string; science: string; social: string; other: string }
export interface LookColors {
  paper: string; surface: string; ink: string; muted: string; brand: string; onBrand: string;
  /** decoration colour (borders, glows); never used for text */
  accent: string;
  /** the "margin" colour: accent, darkened enough to carry white text (badges) */
  margin: string;
  rule: string; success: string; warning: string; subjects: SubjectColors;
}
export interface PaletteDef { id: string; label: string; description: string; light: LookColors; dark: LookColors }

const SUBJECT_SETS = {
  classic: ["#2D5BE3", "#178F63", "#C2410C", "#7C3AED", "#0E7C86", "#A16207"],
  bright: ["#2563EB", "#16A34A", "#EA580C", "#9333EA", "#0891B2", "#CA8A04"],
  earthy: ["#3B5BA5", "#4D7C4A", "#B5532D", "#7E4A8C", "#2F7F85", "#A67C1E"],
  candy: ["#4F6BED", "#1FA87A", "#F0532D", "#B83CE0", "#0FA3C4", "#E0A100"],
  deep: ["#1E40AF", "#166534", "#9A3412", "#5B21B6", "#155E75", "#854D0E"],
} as const;
type SubjectSet = keyof typeof SUBJECT_SETS;

interface Seed {
  id: string; label: string; description: string; subjects: SubjectSet;
  brand: string; accent: string; paper: string; surface: string; ink: string; muted?: string; rule?: string;
  dark: { brand: string; accent?: string; paper: string; surface: string; ink: string };
}
const WHITE = "#FFFFFF";

function build(seed: Seed, dark: boolean): LookColors {
  const d = dark ? seed.dark : seed;
  const { paper, surface, ink } = d;
  const toward = dark ? WHITE : ink;
  const onBg = (c: string, min: number) => contrastRatio(c, paper) >= min && contrastRatio(c, surface) >= min;
  const rule = (!dark && seed.rule) || mixHex(paper, ink, dark ? 0.2 : 0.14);
  // text-like colours must read on both the page and the panels; brand also needs readable text on top of it
  const brand = fitColor(d.brand, toward, (c) => onBg(c, 4.5) && contrastRatio(c, readableOn(c)) >= 4.5);
  const muted = fitColor((!dark && seed.muted) || mixHex(ink, paper, 0.32), toward, (c) => onBg(c, 5));
  const success = fitColor(dark ? "#5ED4A5" : "#17785A", toward, (c) => onBg(c, 4.5));
  const warning = fitColor(dark ? "#F5B94A" : "#9A5B00", toward, (c) => onBg(c, 4.5));
  const accent = (dark && seed.dark.accent) || seed.accent;
  const margin = fitColor(accent, "#000000", (c) => contrastRatio(c, WHITE) >= 4.5);
  const set = SUBJECT_SETS[seed.subjects];
  const names = ["maths", "evs", "english", "tamil", "science", "social"] as const;
  const subjects = Object.fromEntries(names.map((n, i) => [n, fitColor(set[i]!, "#000000", (c) => contrastRatio(c, WHITE) >= 4.5)])) as unknown as SubjectColors;
  subjects.other = "#475569";
  return { paper, surface, ink, muted, brand, onBrand: readableOn(brand), accent, margin, rule, success, warning, subjects };
}

const SEEDS: Seed[] = [
  { id: "indigo-dawn", label: "Indigo Dawn", description: "Friendly indigo with a warm amber spark. Calm for long reading.", subjects: "bright",
    brand: "#4F46E5", accent: "#F59E0B", paper: "#F5F5FF", surface: "#FFFFFF", ink: "#1E1B4B", dark: { brand: "#A5B4FC", paper: "#14132B", surface: "#1E1D40", ink: "#EEF0FF" } },
  { id: "mint-fresh", label: "Mint Fresh", description: "Cool green mint with a coral accent.", subjects: "bright",
    brand: "#0F9D77", accent: "#FF7A59", paper: "#F0FBF6", surface: "#FFFFFF", ink: "#0B3B2E", dark: { brand: "#5EEAC0", paper: "#0B211B", surface: "#12332A", ink: "#E8FBF3" } },
  { id: "sunset-coral", label: "Sunset Coral", description: "Warm coral and golden yellow on a peach page.", subjects: "candy",
    brand: "#E8503A", accent: "#FFB020", paper: "#FFF6F1", surface: "#FFFFFF", ink: "#3B1D1A", dark: { brand: "#FF9A85", paper: "#261310", surface: "#3A1D18", ink: "#FFEFE9" } },
  { id: "ocean-teal", label: "Ocean Teal", description: "Deep sea teal with a tangerine accent.", subjects: "classic",
    brand: "#0E7C86", accent: "#F2994A", paper: "#F0FAFB", surface: "#FFFFFF", ink: "#0B2F3A", dark: { brand: "#5FD4DE", paper: "#08222B", surface: "#0F3440", ink: "#E6F8FA" } },
  { id: "grape-soda", label: "Grape Soda", description: "Fizzy purple with hot-pink pops.", subjects: "candy",
    brand: "#7C3AED", accent: "#FF4FA3", paper: "#FAF5FF", surface: "#FFFFFF", ink: "#2E1065", dark: { brand: "#C4A6FF", paper: "#1A0F33", surface: "#271748", ink: "#F5EEFF" } },
  { id: "forest-calm", label: "Forest Calm", description: "Soft forest green and honey. Gentle and natural.", subjects: "earthy",
    brand: "#2F6B4F", accent: "#D9A441", paper: "#F4F7F2", surface: "#FFFFFF", ink: "#1B2E24", dark: { brand: "#8FD3AF", paper: "#0F1F18", surface: "#18312A", ink: "#EAF4EE" } },
  { id: "berry-pop", label: "Berry Pop", description: "Juicy berry pink with an electric violet accent.", subjects: "candy",
    brand: "#C2185B", accent: "#7C4DFF", paper: "#FFF5F9", surface: "#FFFFFF", ink: "#3A0E24", dark: { brand: "#FF8FBF", paper: "#26101B", surface: "#3A1A2A", ink: "#FFEEF5" } },
  { id: "slate-lime", label: "Slate & Lime", description: "Serious slate with a zesty lime highlight.", subjects: "deep",
    brand: "#334155", accent: "#84CC16", paper: "#F6F8FA", surface: "#FFFFFF", ink: "#0F172A", dark: { brand: "#A3E635", paper: "#0F172A", surface: "#1B2638", ink: "#F1F5F9" } },
  { id: "warm-sand", label: "Warm Sand", description: "Terracotta on soft sand, with a sea-blue accent.", subjects: "earthy",
    brand: "#B4581E", accent: "#3B82A0", paper: "#FAF4EA", surface: "#FFFDF8", ink: "#3A2B1E", dark: { brand: "#F0A26B", paper: "#241A12", surface: "#33261B", ink: "#FBF1E4" } },
  { id: "midnight-neon", label: "Midnight Neon", description: "Night-sky navy with electric cyan and magenta.", subjects: "candy",
    brand: "#5B21B6", accent: "#0891B2", paper: "#EEF2FF", surface: "#FFFFFF", ink: "#0B1020", dark: { brand: "#22D3EE", accent: "#FF3DCB", paper: "#0B1020", surface: "#141B33", ink: "#EAF0FF" } },
  { id: "rose-quartz", label: "Rose Quartz", description: "Dusty rose with a calm blue-grey accent.", subjects: "earthy",
    brand: "#B83A6B", accent: "#5E8C9A", paper: "#FDF4F6", surface: "#FFFFFF", ink: "#3C1F2B", dark: { brand: "#F2A1BF", paper: "#251319", surface: "#381F29", ink: "#FFEFF4" } },
  { id: "sky-sunshine", label: "Sky & Sunshine", description: "Open-sky blue with a sunny yellow accent.", subjects: "bright",
    brand: "#1473E6", accent: "#FFC400", paper: "#F2F8FF", surface: "#FFFFFF", ink: "#102A43", dark: { brand: "#7DB8FF", paper: "#0B1B2E", surface: "#122B47", ink: "#EAF3FF" } },
  { id: "notebook-blue", label: "Notebook Blue", description: "The original blue ink and red margin colours.", subjects: "classic",
    brand: "#1F4FD1", accent: "#D9444F", paper: "#F4F8FC", surface: "#FFFFFF", ink: "#16253F", muted: "#51617D", rule: "#D3E1F0", dark: { brand: "#8FAEFF", paper: "#0F1A2B", surface: "#18273F", ink: "#E8EEF8" } },
  { id: "walnut-cream", label: "Walnut & Cream", description: "Oak desk, cream paper, cloth-red and brass.", subjects: "earthy",
    brand: "#7B2230", accent: "#B8963E", paper: "#E6D3B0", surface: "#FBF6E8", ink: "#2B1A10", dark: { brand: "#E9B4A8", paper: "#22130B", surface: "#3A2216", ink: "#F5EAD0" } },
  { id: "pastel-digital", label: "Pastel Digital", description: "Soft lilac, violet and peach.", subjects: "candy",
    brand: "#5140D6", accent: "#FF9E7A", paper: "#F1EEFB", surface: "#FFFFFF", ink: "#25213D", dark: { brand: "#B7ADFF", paper: "#17142B", surface: "#231F40", ink: "#EEEBFF" } },
  { id: "sage-library", label: "Sage Library", description: "Sage walls, deep green and a ribbon-red accent; lamp-lit navy and gold at night.", subjects: "earthy",
    brand: "#1F4C3E", accent: "#C22F4C", paper: "#DFE8D6", surface: "#FBF7EA", ink: "#1D3A30", dark: { brand: "#F0C96A", paper: "#151C33", surface: "#1F2743", ink: "#ECE5D0" } },
  { id: "parrot-green", label: "Parrot Green", description: "Lively green with a sky-blue and sun-yellow supporting cast.", subjects: "bright",
    brand: "#58A700", accent: "#1CB0F6", paper: "#F7F7F7", surface: "#FFFFFF", ink: "#2B3A2B", dark: { brand: "#89E219", paper: "#131F13", surface: "#1D2E1D", ink: "#F0F8E8" } },
  { id: "khan-teal", label: "Teal & Navy", description: "Calm teal with navy text and a gentle blue accent.", subjects: "classic",
    brand: "#0F766E", accent: "#1D4ED8", paper: "#F6FAFA", surface: "#FFFFFF", ink: "#0B2540", dark: { brand: "#5EEAD4", paper: "#0A1B2E", surface: "#112A44", ink: "#E8F2FA" } },
  { id: "navy-sun", label: "Navy & Sun", description: "Deep navy with a sunny yellow button colour.", subjects: "candy",
    brand: "#2B2F7E", accent: "#FFD300", paper: "#F3F4FB", surface: "#FFFFFF", ink: "#10162F", dark: { brand: "#FFD300", paper: "#10162F", surface: "#1A2347", ink: "#FFFFFF" } },
  { id: "code-org", label: "Teal & Purple", description: "Friendly teal and soft purple.", subjects: "bright",
    brand: "#007C89", accent: "#7665A0", paper: "#F8FAFB", surface: "#FFFFFF", ink: "#1F2A44", dark: { brand: "#4DD6E3", accent: "#B7A6E8", paper: "#101A2C", surface: "#1A2740", ink: "#EEF3FA" } },
  { id: "black-gold", label: "Black & Gold", description: "Cinematic black and warm gold; cream paper by day.", subjects: "deep",
    brand: "#7A5B14", accent: "#C8A24A", paper: "#F6F2EA", surface: "#FFFFFF", ink: "#141414", dark: { brand: "#D9B44A", paper: "#0B0B0C", surface: "#161618", ink: "#F2EDE3" } },
  { id: "skill-green", label: "Vivid Green", description: "Clean white with a vivid green and a deep green ink.", subjects: "bright",
    brand: "#00A650", accent: "#00E676", paper: "#F7FAF8", surface: "#FFFFFF", ink: "#0F1F17", dark: { brand: "#2EF08A", paper: "#0B1510", surface: "#13241B", ink: "#EAF7EF" } },
  { id: "coursera-blue", label: "Trusted Blue", description: "Dependable blue on clean white.", subjects: "classic",
    brand: "#0056D2", accent: "#FF9F1C", paper: "#F5F8FF", surface: "#FFFFFF", ink: "#0F1F3D", dark: { brand: "#8DB8FF", paper: "#0A1428", surface: "#122140", ink: "#EAF1FF" } },
  { id: "canvas-red", label: "Classic Red", description: "Slate text with a crisp red accent.", subjects: "classic",
    brand: "#E4002B", accent: "#0B874B", paper: "#F5F5F5", surface: "#FFFFFF", ink: "#2D3B45", dark: { brand: "#FF8A9B", paper: "#161B20", surface: "#212A31", ink: "#F1F4F6" } },
  { id: "soft-ink", label: "Soft Ink", description: "Warm off-white with charcoal text and a calm blue.", subjects: "earthy",
    brand: "#2383E2", accent: "#EB5757", paper: "#FBFBFA", surface: "#FFFFFF", ink: "#37352F", dark: { brand: "#6CB4FF", paper: "#191919", surface: "#252525", ink: "#EDEDEB" } },
  { id: "inst-navy", label: "Navy & Slate", description: "Formal navy on cool white with slate text.", subjects: "deep",
    brand: "#1E3A8A", accent: "#0369A1", paper: "#F8FAFC", surface: "#FFFFFF", ink: "#0F172A", muted: "#475569", rule: "#E2E8F0", dark: { brand: "#93B4FF", paper: "#0B1220", surface: "#131C2E", ink: "#EAF0FA" } },
  { id: "inst-amber", label: "Amber & Stone", description: "Burnt amber on warm stone white.", subjects: "deep",
    brand: "#9A3412", accent: "#57534E", paper: "#FAFAF9", surface: "#FFFFFF", ink: "#1C1917", muted: "#57534E", rule: "#E7E5E4", dark: { brand: "#FDBA74", paper: "#1A1512", surface: "#262019", ink: "#F5EFE8" } },
  { id: "inst-teal", label: "Teal & Alabaster", description: "Deep teal on alabaster.", subjects: "deep",
    brand: "#0F766E", accent: "#0369A1", paper: "#F8FAFC", surface: "#FFFFFF", ink: "#0F172A", muted: "#475569", rule: "#E2E8F0", dark: { brand: "#5EEAD4", paper: "#0A1A1C", surface: "#10282B", ink: "#E6F6F5" } },
  { id: "inst-crimson", label: "Crimson University", description: "Collegiate crimson with graphite text.", subjects: "deep",
    brand: "#881337", accent: "#52525B", paper: "#FAF9F9", surface: "#FFFFFF", ink: "#18181B", muted: "#52525B", rule: "#E4E4E7", dark: { brand: "#FDA4AF", paper: "#1A0F13", surface: "#27161C", ink: "#F8ECEF" } },
  { id: "inst-forest", label: "Forest Academy", description: "Academy green on pale sage.", subjects: "deep",
    brand: "#166534", accent: "#4A5D54", paper: "#F7F9F8", surface: "#FFFFFF", ink: "#14221C", muted: "#4A5D54", rule: "#DCE3DF", dark: { brand: "#86EFAC", paper: "#0C1711", surface: "#14261C", ink: "#E8F4EC" } },
  { id: "inst-midnight", label: "Midnight Slate", description: "Slate and sky blue; a deep night look in dark mode.", subjects: "deep",
    brand: "#0369A1", accent: "#38BDF8", paper: "#F1F5F9", surface: "#FFFFFF", ink: "#0F172A", muted: "#475569", rule: "#E2E8F0", dark: { brand: "#38BDF8", paper: "#0B1120", surface: "#111827", ink: "#F8FAFC" } },
  { id: "inst-gold", label: "Indigo & Gold", description: "Deep indigo text with an amber-gold accent. The official look.", subjects: "deep",
    brand: "#B45309", accent: "#4338CA", paper: "#F8F9FC", surface: "#FFFFFF", ink: "#1E1B4B", muted: "#4338CA", rule: "#E0E7FF", dark: { brand: "#FBBF24", paper: "#0F0E24", surface: "#1A1840", ink: "#EEF0FF" } },
  { id: "inst-violet", label: "Royal Violet", description: "Royal violet on soft lavender white.", subjects: "deep",
    brand: "#6D28D9", accent: "#5B4B7A", paper: "#FAF9FF", surface: "#FFFFFF", ink: "#1E1035", muted: "#5B4B7A", rule: "#E9D5FF", dark: { brand: "#C4A6FF", paper: "#150C26", surface: "#211339", ink: "#F3EBFF" } },
  { id: "inst-terracotta", label: "Terracotta & Slate", description: "Terracotta accents with slate text.", subjects: "deep",
    brand: "#C2410C", accent: "#475569", paper: "#F8FAFC", surface: "#FFFFFF", ink: "#0F172A", muted: "#475569", rule: "#E2E8F0", dark: { brand: "#FDBA74", paper: "#101826", surface: "#192336", ink: "#EEF2F7" } },
];
export const PALETTES: PaletteDef[] = SEEDS.map((s) => ({ id: s.id, label: s.label, description: s.description, light: build(s, false), dark: build(s, true) }));
export const DEFAULT_PALETTE = "indigo-dawn";
export const CUSTOM_PALETTE = "custom";

export const themeById = (id: string): ThemeDef => THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME)!;
export const paletteById = (id: string): PaletteDef | undefined => PALETTES.find((p) => p.id === id);
export const recommendedFor = (themeId: string) => { const t = themeById(themeId); return { preset: t.id, palette: t.palette, mode: t.mode }; };

type Vals = Record<string, unknown>;
const s = (v: Vals, k: string, d: string) => (typeof v[k] === "string" ? (v[k] as string) : d);

/** The colours the admin set one by one (the "Custom" palette), exactly as before palettes existed. */
export function customColors(v: Vals, dark: boolean): LookColors {
  const c = (k: string, d: string) => s(v, k, d);
  const brand = c("theme.color.brand", "#1F4FD1");
  const subjects = { maths: c("theme.subject.maths", "#2D5BE3"), evs: c("theme.subject.evs", "#178F63"), english: c("theme.subject.english", "#C2410C"), tamil: c("theme.subject.tamil", "#7C3AED"), science: c("theme.subject.science", "#0E7C86"), social: c("theme.subject.social", "#A16207"), other: c("theme.subject.other", "#475569") };
  const margin = c("theme.color.margin", "#D9444F");
  return {
    paper: dark ? c("theme.dark.paper", "#0F1A2B") : c("theme.color.paper", "#F4F8FC"),
    surface: dark ? c("theme.dark.surface", "#18273F") : c("theme.color.surface", "#FFFFFF"),
    ink: dark ? c("theme.dark.ink", "#E8EEF8") : c("theme.color.ink", "#16253F"),
    muted: dark ? c("theme.dark.ink", "#E8EEF8") : c("theme.color.muted", "#51617D"),
    brand, onBrand: readableOn(brand), accent: margin, margin,
    rule: dark ? "rgba(255,255,255,0.08)" : c("theme.color.rule", "#D3E1F0"),
    success: c("theme.color.success", "#17785A"), warning: c("theme.color.warning", "#9A5B00"), subjects,
  };
}

export interface Look { themeId: string; theme: ThemeDef; paletteId: string; mode: "light" | "dark"; colors: LookColors }
/** Pure: settings -> the theme, palette and colours to paint. Unknown ids fall back to the defaults. */
export function resolveLook(v: Vals, prefersDark: boolean): Look {
  const m = s(v, "theme.mode", "light");
  const mode: "light" | "dark" = m === "dark" ? "dark" : m === "auto" ? (prefersDark ? "dark" : "light") : "light";
  const theme = themeById(s(v, "theme.preset", DEFAULT_THEME));
  const wanted = s(v, "theme.palette", DEFAULT_PALETTE);
  const pal = wanted === CUSTOM_PALETTE ? undefined : (paletteById(wanted) ?? paletteById(DEFAULT_PALETTE));
  return { themeId: theme.id, theme, paletteId: pal ? pal.id : CUSTOM_PALETTE, mode, colors: pal ? pal[mode] : customColors(v, mode === "dark") };
}
