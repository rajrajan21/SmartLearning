// Usage: pnpm --filter @studysmart/api audio:build [-- --server http://localhost:8080] [--lang en] [--force] [--prune] [--jobs 3]
// Needs the Malar Teacher speech server running (Start Malar Teacher.bat). No internet or keys needed.
import { readFileSync } from "node:fs";
import { audioDir, classroomDir, lessonsDir, questionsDir } from "../server-paths.js";
import { buildAudio, type Speak } from "../modules/audio/build.js";
import type { Lang } from "../modules/audio/manifest.js";

const args = process.argv.slice(2);
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const server = (opt("server") ?? process.env.MALAR_URL ?? "http://localhost:8080").replace(/\/$/, "");
const lang = opt("lang") as Lang | undefined;
const voicesOpt = opt("voices");
const teachers = args.includes("--all-voices") ? Object.keys(JSON.parse(readFileSync(`${audioDir}/voices.json`, "utf8"))) : voicesOpt ? voicesOpt.split(",") : undefined;

const health = await fetch(`${server}/api/health`).then((r) => r.json() as Promise<{ tts: boolean }>).catch(() => null);
if (!health) { console.error(`Cannot reach the Malar Teacher speech server at ${server}. Start "Start Malar Teacher.bat" first.`); process.exit(2); }
if (!health.tts) { console.error("The speech server is still starting its voice engine. Wait a minute and run this again."); process.exit(2); }

const speak: Speak = async (text, voice, speed) => {
  const r = await fetch(`${server}/api/speak`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, voice, speed, priority: "low" }) });
  if (!r.ok) throw new Error(`speech server answered ${r.status}`);
  return r.json();
};
const report = await buildAudio({ lessonsDir, questionsDir, classroomDir, audioDir, teachers, speak, langs: lang ? [lang] : undefined, concurrency: Number(opt("jobs") ?? process.env.AUDIO_JOBS ?? 1), force: args.includes("--force"), prune: args.includes("--prune"), log: console.log });
const mins = (ms: number) => (ms / 60000).toFixed(1);
console.log(`\nSentences wanted ${report.wanted}: generated ${report.generated}, already done ${report.reused}${report.pruned ? `, removed ${report.pruned} unused` : ""}.`);
for (const s of report.skipped) console.log("  skipped:", s);
if (report.generated > 0) console.log(`\nTIMING: made ${report.generated} clips = ${mins(report.audioMs)} min of speech in ${mins(report.elapsedMs)} min (${(report.elapsedMs / Math.max(1, report.audioMs)).toFixed(2)}x the speech length; ${(report.elapsedMs / 1000 / report.generated).toFixed(1)} s per clip).`);
