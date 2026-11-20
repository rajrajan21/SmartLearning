// Usage: pnpm --filter @studysmart/api audio:build [-- --server http://localhost:8080] [--lang en] [--force] [--prune] [--jobs 3]
// Malar-style voices need the Malar Teacher speech server running (Start Malar Teacher.bat). No internet or keys needed.
// Voices whose id starts with "edge:" (Kani, Arul) are made by tools/edge/edge_speak.py (Python + internet while generating; the MP3s are then stored and served by this site).
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { audioDir, classroomDir, gkDir, lessonsDir, questionsDir } from "../server-paths.js";
import { buildAudio, type Speak, type SpeechResult } from "../modules/audio/build.js";
import type { Lang } from "../modules/audio/manifest.js";

const args = process.argv.slice(2);
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const server = (opt("server") ?? process.env.MALAR_URL ?? "http://localhost:8080").replace(/\/$/, "");
const lang = opt("lang") as Lang | undefined;
const voicesOpt = opt("voices");
const only = opt("only");
const teachers = args.includes("--all-voices") ? Object.keys(JSON.parse(readFileSync(`${audioDir}/voices.json`, "utf8"))) : voicesOpt ? voicesOpt.split(",") : undefined;

// which engines are needed for the voices chosen (so a run of only Kani/Arul does not need the Malar speech server)
const voiceMap = JSON.parse(readFileSync(`${audioDir}/voices.json`, "utf8")) as Record<string, { en?: { voice: string }; ta?: { voice: string } }>;
const wantedIds = (teachers ?? ["malar"]).flatMap((t) => (lang ? [voiceMap[t]?.[lang]?.voice] : [voiceMap[t]?.en?.voice, voiceMap[t]?.ta?.voice])).filter((v): v is string => !!v);
const needEdge = wantedIds.some((v) => v.startsWith("edge:"));
const needMalar = wantedIds.length === 0 || wantedIds.some((v) => !v.startsWith("edge:") && !v.startsWith("parler:"));

const py = process.env.EDGE_PY ?? (process.platform === "win32" ? "py" : "python3");
const helper = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "tools", "edge", "edge_speak.py");
if (needEdge) {
  const ok = spawnSync(py, ["-c", "import edge_tts, miniaudio"], { stdio: "ignore" });
  if (ok.status !== 0) { console.error(`The Kani/Arul voices need Python with two small packages. Run this once, then try again:\n  ${py} -m pip install edge-tts miniaudio`); process.exit(2); }
}
if (teachers?.some((t) => ["jaya", "murali"].includes(t)) || args.includes("--all-voices")) {
  const ph = await fetch(`${process.env.PARLER_URL ?? "http://localhost:8090"}/api/health`).then((r) => r.json() as Promise<{ tts: boolean }>).catch(() => null);
  if (!ph?.tts) { console.error("The Tamil-teacher voice server (port 8090) is not running. Use Generate-Lesson-Audio.bat, which starts it."); process.exit(2); }
}
if (needMalar) {
  const health = await fetch(`${server}/api/health`).then((r) => r.json() as Promise<{ tts: boolean }>).catch(() => null);
  if (!health) { console.error(`Cannot reach the Malar Teacher speech server at ${server}. Start "Start Malar Teacher.bat" first.`); process.exit(2); }
  if (!health.tts) { console.error("The speech server is still starting its voice engine. Wait a minute and run this again."); process.exit(2); }
}

const edgeSpeak = (text: string, voice: string, speed: number): Promise<SpeechResult> => new Promise((resolve, reject) => {
  const p = spawn(py, [helper], { stdio: ["pipe", "pipe", "pipe"] });
  let out = "", err = "";
  p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
  p.on("error", reject);
  p.on("close", (code) => { if (code !== 0) return reject(new Error(`edge voice failed: ${err.trim().split("\n").pop() ?? code}`)); try { resolve(JSON.parse(out)); } catch { reject(new Error("edge voice gave an unreadable answer")); } });
  p.stdin.end(JSON.stringify({ text, voice: voice.slice(5), speed }));
});

const parler = (process.env.PARLER_URL ?? "http://localhost:8090").replace(/\/$/, "");
const speak: Speak = async (text, voice, speed) => {
  if (voice.startsWith("edge:")) return edgeSpeak(text, voice, speed);
  // the Tamil-teacher voices (Indic Parler-TTS) come from their own small local server
  const r = await fetch(`${voice.startsWith("parler:") ? parler : server}/api/speak`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, voice, speed, priority: "low" }) });
  if (!r.ok) throw new Error(`speech server answered ${r.status}`);
  return r.json();
};
const report = await buildAudio({ only, lessonsDir, questionsDir, classroomDir, gkDir, audioDir, teachers, speak, langs: lang ? [lang] : undefined, concurrency: Number(opt("jobs") ?? process.env.AUDIO_JOBS ?? 1), force: args.includes("--force"), prune: args.includes("--prune"), log: console.log });
const mins = (ms: number) => (ms / 60000).toFixed(1);
console.log(`\nSentences wanted ${report.wanted}: generated ${report.generated}, already done ${report.reused}${report.pruned ? `, removed ${report.pruned} unused` : ""}.`);
for (const s of report.skipped) console.log("  skipped:", s);
if (report.generated > 0) console.log(`\nTIMING: made ${report.generated} clips = ${mins(report.audioMs)} min of speech in ${mins(report.elapsedMs)} min (${(report.elapsedMs / Math.max(1, report.audioMs)).toFixed(2)}x the speech length; ${(report.elapsedMs / 1000 / report.generated).toFixed(1)} s per clip).`);
