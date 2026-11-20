// Adds: 9 "institutional" colour palettes (from the Gemini preview), the "Official Editorial" theme, and scroll aids (progress line + back-to-top).
// Nothing changes by default except the scroll aids; choose the theme and palette in Admin > Look and feel. Safe to re-run.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (...p) => join(root, ...p);
const problems = [], edits = [];

function edit(file, label, pairs, append) {
  const path = P(file);
  if (!existsSync(path)) { problems.push(`${file}: not found`); return; }
  let t = readFileSync(path, "utf8");
  const eol = t.includes("\r\n") ? "\r\n" : "\n";
  const n = (s) => s.replace(/\r?\n/g, eol);
  let changed = false;
  for (const [old, neu, done] of pairs) {
    if (t.includes(n(done))) continue;
    const i = t.indexOf(n(old));
    if (i < 0 || t.indexOf(n(old), i + 1) >= 0) { problems.push(`${file}: no unique spot for "${label}" (${old.slice(0, 50)}...)`); return; }
    t = t.slice(0, i) + n(neu) + t.slice(i + n(old).length); changed = true;
  }
  if (append && !t.includes(append.marker)) { t = t.replace(/\s*$/, eol) + n(append.text); changed = true; }
  if (changed) edits.push({ path, text: t, file });
}

// 1) palettes
const SEED = (id, label, description, brand, accent, paper, ink, muted, rule, d) =>
  `  { id: "${id}", label: "${label}", description: "${description}", subjects: "deep",\n    brand: "${brand}", accent: "${accent}", paper: "${paper}", surface: "#FFFFFF", ink: "${ink}", muted: "${muted}", rule: "${rule}", dark: { brand: "${d[0]}", paper: "${d[1]}", surface: "${d[2]}", ink: "${d[3]}" } },\n`;
const palettes =
  SEED("inst-navy", "Navy & Slate", "Formal navy on cool white with slate text.", "#1E3A8A", "#0369A1", "#F8FAFC", "#0F172A", "#475569", "#E2E8F0", ["#93B4FF", "#0B1220", "#131C2E", "#EAF0FA"]) +
  SEED("inst-amber", "Amber & Stone", "Burnt amber on warm stone white.", "#9A3412", "#57534E", "#FAFAF9", "#1C1917", "#57534E", "#E7E5E4", ["#FDBA74", "#1A1512", "#262019", "#F5EFE8"]) +
  SEED("inst-teal", "Teal & Alabaster", "Deep teal on alabaster.", "#0F766E", "#0369A1", "#F8FAFC", "#0F172A", "#475569", "#E2E8F0", ["#5EEAD4", "#0A1A1C", "#10282B", "#E6F6F5"]) +
  SEED("inst-crimson", "Crimson University", "Collegiate crimson with graphite text.", "#881337", "#52525B", "#FAF9F9", "#18181B", "#52525B", "#E4E4E7", ["#FDA4AF", "#1A0F13", "#27161C", "#F8ECEF"]) +
  SEED("inst-forest", "Forest Academy", "Academy green on pale sage.", "#166534", "#4A5D54", "#F7F9F8", "#14221C", "#4A5D54", "#DCE3DF", ["#86EFAC", "#0C1711", "#14261C", "#E8F4EC"]) +
  SEED("inst-midnight", "Midnight Slate", "Slate and sky blue; a deep night look in dark mode.", "#0369A1", "#38BDF8", "#F1F5F9", "#0F172A", "#475569", "#E2E8F0", ["#38BDF8", "#0B1120", "#111827", "#F8FAFC"]) +
  SEED("inst-gold", "Indigo & Gold", "Deep indigo text with an amber-gold accent. The official look.", "#B45309", "#4338CA", "#F8F9FC", "#1E1B4B", "#4338CA", "#E0E7FF", ["#FBBF24", "#0F0E24", "#1A1840", "#EEF0FF"]) +
  SEED("inst-violet", "Royal Violet", "Royal violet on soft lavender white.", "#6D28D9", "#5B4B7A", "#FAF9FF", "#1E1035", "#5B4B7A", "#E9D5FF", ["#C4A6FF", "#150C26", "#211339", "#F3EBFF"]) +
  SEED("inst-terracotta", "Terracotta & Slate", "Terracotta accents with slate text.", "#C2410C", "#475569", "#F8FAFC", "#0F172A", "#475569", "#E2E8F0", ["#FDBA74", "#101826", "#192336", "#EEF2F7"]);
edit("packages/shared/src/look.ts", "palettes", [
  ["];\nexport const PALETTES: PaletteDef[]", palettes + "];\nexport const PALETTES: PaletteDef[]", '{ id: "inst-gold"'],
  ["];\nexport const DEFAULT_THEME", '  { id: "editorial", label: "Official Editorial", description: "Clean institutional look: white panels, hairline borders, serif headings and a quiet accent line. Pairs with Indigo & Gold.", palette: "inst-gold", mode: "light", radius: 10, heading: "serif" },\n];\nexport const DEFAULT_THEME', 'id: "editorial"'],
]);

// 2) theme CSS + scroll-aid CSS
const css = `
/* ---------- Official Editorial (institutional look) ---------- */
[data-theme="editorial"] {
  --bg-image: none; --top-bd: 1px solid var(--rule); --top-shadow: 0 1px 0 color-mix(in srgb, var(--brand) 18%, transparent);
  --card-bd: var(--rule); --card-shadow: none; --paper-bd: var(--rule); --paper-shadow: 0 1px 3px rgba(15, 23, 42, .05);
  --btn-bw: 1px; --btn-weight: 600; --btn-shadow: none; --btn-ghost-shadow: none;
  --h-weight: 700; --h-ls: -.01em; --cover-radius: 10px; --cover-shadow: 0 1px 3px rgba(15, 23, 42, .18); --cover-sheen: none;
}
[data-theme="editorial"] .class-tab.on { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 8%, var(--surface)); }
[data-theme="editorial"] .chapters a:hover { background: color-mix(in srgb, var(--brand) 7%, transparent); }
[data-theme="editorial"][data-mode="dark"] { --paper-shadow: none; }
`;
edit("apps/web/src/themes.css", "editorial theme", [], { marker: "Official Editorial (institutional look)", text: css });
const scrollCss = `
/* scroll-aids: reading progress line and back-to-top button */
.scroll-track { position: fixed; top: 0; left: 0; width: 100%; height: 3px; background: transparent; z-index: 60; pointer-events: none; }
.scroll-fill { height: 100%; width: 0; background: var(--brand); transition: width .12s linear; }
.scroll-top-fab { position: fixed; right: clamp(1rem, 3vw, 2rem); bottom: calc(var(--tabbar-h, 0px) + 1.2rem); z-index: 55; min-height: 40px; padding: 0 .9rem; border-radius: 999px; border: 1px solid var(--rule); background: var(--surface); color: var(--ink); font: 700 .85rem var(--font-body); box-shadow: 0 6px 18px rgba(15, 23, 42, .14); cursor: pointer; opacity: 0; transform: translateY(10px); pointer-events: none; transition: opacity .2s ease, transform .2s ease; }
.scroll-top-fab.visible { opacity: 1; transform: none; pointer-events: auto; }
.scroll-top-fab:hover, .scroll-top-fab:focus-visible { border-color: var(--brand); color: var(--brand); }
@media (prefers-reduced-motion: reduce) { .scroll-fill, .scroll-top-fab { transition: none; } }
@media print { .scroll-track, .scroll-top-fab { display: none !important; } }
`;
edit("apps/web/src/styles.css", "scroll css", [], { marker: "scroll-aids: reading progress line", text: scrollCss });

// 3) settings
edit("packages/shared/src/settings.ts", "scroll settings", [[
  '  { key: "layout.width", panel: "theme",',
  '  bool("layout.scrollBar", "theme", "Scrolling", "Show a reading-progress line at the top", true, { help: "A thin line that fills as the page is scrolled." }),\n  bool("layout.backToTop", "theme", "Scrolling", "Show a back-to-top button", true, { help: "Appears after scrolling down a little." }),\n  { key: "layout.width", panel: "theme",',
  '"layout.backToTop"']]);

// 4) component, wording and mounting
edit("apps/web/src/lib/i18n.ts", "wording", [[
  "  classroomNotRecorded:",
  '  backToTop: { en: "Top", ta: "மேலே" },\n  classroomNotRecorded:',
  "backToTop: {"]]);
edit("apps/web/src/components/Layout.tsx", "mount", [
  ['import { InstallPopup } from "./InstallPopup";', 'import { InstallPopup } from "./InstallPopup";\nimport { ScrollAids } from "./ScrollAids";', 'import { ScrollAids } from "./ScrollAids";'],
  ["      <ScrollToTop />", "      <ScrollToTop />\n      <ScrollAids />", "<ScrollAids />"],
]);

if (problems.length) { console.error("STOPPED - nothing was changed:\n  " + problems.join("\n  ")); process.exit(1); }
const comp = P("apps", "web", "src", "components", "ScrollAids.tsx");
for (const e of edits) { copyFileSync(e.path, e.path + ".before-theme"); writeFileSync(e.path, e.text); console.log("updated", e.file); }
console.log(existsSync(comp) ? "ScrollAids.tsx in place" : "WARNING: ScrollAids.tsx missing - extract the whole zip again");
console.log("\nDone. Admin > Look and feel > Theme: choose Official Editorial and the Indigo & Gold palette to try the new look.");
