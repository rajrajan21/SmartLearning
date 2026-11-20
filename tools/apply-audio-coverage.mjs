// Adds the Admin > "Audio coverage" page. Safe to run twice. Changes 4 existing files by exact-text anchors; if an anchor is not found nothing is changed.
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
const root = process.argv[2] ?? ".";
const P = (f) => `${root}/${f}`;
const edits = [];
function patch(file, marker, steps) {
  const path = P(file); if (!existsSync(path)) throw new Error(`missing file ${file}`);
  let s = readFileSync(path, "utf8"); if (s.includes(marker)) { console.log(`already done: ${file}`); return; }
  const crlf = s.includes("\r\n"); if (crlf) s = s.replace(/\r\n/g, "\n");
  for (const [anchor, fn] of steps) { const i = s.indexOf(anchor); if (i < 0) throw new Error(`${file}: anchor not found: ${anchor.slice(0, 60)}`); s = fn(s, i); }
  edits.push([path, crlf ? s.replace(/\n/g, "\r\n") : s]);
}
const afterLine = (text) => (s, i) => { const e = s.indexOf("\n", i) + 1; return s.slice(0, e) + text + s.slice(e); };
const beforeAnchor = (text) => (s, i) => s.slice(0, i) + text + s.slice(i);
try {
  patch("packages/shared/src/settings.ts", "audiocover", [
    ['| "papers" |', (s, i) => s.slice(0, i) + '| "papers" | "audiocover" |' + s.slice(i + '| "papers" |'.length)],
    ['{ id: "papers", label:', afterLine('  { id: "audiocover", label: "Audio coverage", help: "Which lessons, questions, classroom boards and GK lessons already have recorded teacher audio, and which do not: per voice, with the missing lines and a downloadable list." },\n')],
    ['key: "papers.storage.maxPapers"', afterLine(
`  { key: "audio.coverage.voices", panel: "audiocover", section: "Audio coverage page", label: "Voices to check (ids from voices.json, comma separated; empty = all)", public: false, type: "text", maxLength: 120, default: "", help: "For example priya2,ravi2. A lesson counts as complete only when every listed voice has all its sentences." },
  { key: "audio.coverage.checkFiles", panel: "audiocover", section: "Audio coverage page", label: "Also check that each sound file exists on disk", public: false, type: "boolean", default: true, help: "Slower but catches a listed recording whose .mp3 file is missing." },
  { key: "audio.coverage.perPage", panel: "audiocover", section: "Audio coverage page", label: "Rows per page", public: false, type: "number", default: 50, min: 10, max: 500, step: 10 },
  { key: "audio.coverage.defaultFilter", panel: "audiocover", section: "Audio coverage page", label: "Show first", public: false, type: "select", default: "all", options: [{ value: "all", label: "Everything" }, { value: "none", label: "Only items with no audio" }, { value: "partial", label: "Only items with some audio" }, { value: "complete", label: "Only items with all audio" }] },
  { key: "audio.coverage.cacheSeconds", panel: "audiocover", section: "Audio coverage page", label: "Keep the result for", public: false, type: "number", default: 60, min: 0, max: 3600, step: 10, unit: "seconds", help: "Working it out reads every lesson, so the answer is kept briefly. The Check again button always recalculates." },
`)],
  ]);
  patch("apps/web/src/admin/api.ts", "audioCoverage", [
    ["  papersStatus:", beforeAnchor('  audioCoverage: (refresh = false) => call<AudioCoverage>("GET", `/audio-coverage${refresh ? "?refresh=1" : ""}`),\n')],
    ["export interface PapersStatus", beforeAnchor('export interface AudioCoverageRow { kind: string; item: string; board: string; cls: number | null; subject: string; total: number; have: number[]; status: "complete" | "partial" | "none"; missing: string[] }\nexport interface AudioCoverage { generatedAt: string; voices: string[]; voiceLabels: Record<string, string>; checkedFiles: boolean; manifestClips: number; manifestMissingFiles: number; skippedNoVoice: string[]; rows: AudioCoverageRow[] }\n')],
  ]);
  patch("apps/web/src/admin/AdminApp.tsx", "AudioAdmin", [
    ["import { PapersAdmin }", beforeAnchor('import { AudioAdmin } from "./AudioAdmin";\n')],
    ['{panel.id === "papers" && <PapersAdmin />}', afterLine('              {panel.id === "audiocover" && <AudioAdmin perPage={Number(saved["audio.coverage.perPage"] ?? 50)} defaultFilter={String(saved["audio.coverage.defaultFilter"] ?? "all")} />}\n')],
  ]);
  patch("apps/api/src/app.ts", "adminAudioCoverageRoutes", [
    ['import { audioRoutes }', beforeAnchor('import { adminAudioCoverageRoutes } from "./modules/audio/coverage.js";\n')],
    ['  app.use("/api/v1/admin/perf"', beforeAnchor('  app.use("/api/v1/admin/audio-coverage", adminAudioCoverageRoutes(deps.settings, deps.adminKey, deps.adminUserId));\n')],
  ]);
} catch (e) { console.error("\nNOT APPLIED (nothing was changed):", e.message); process.exit(1); }
for (const [path, text] of edits) { copyFileSync(path, path + ".before-audio-coverage"); writeFileSync(path, text); console.log("updated", path); }
console.log("Audio coverage page added. Restart the site, then open Admin > Audio coverage.");
