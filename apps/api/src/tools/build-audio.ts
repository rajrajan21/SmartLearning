// Usage: pnpm --filter @studysmart/api audio:build [-- --server http://localhost:8080] [--lang en] [--force] [--prune]
// Needs the Malar Teacher speech server running (Start Malar Teacher.bat). No internet or keys needed.
import { audioDir, lessonsDir } from "../server-paths.js";
import { buildAudio, type Speak } from "../modules/audio/build.js";
import type { Lang } from "../modules/audio/manifest.js";

const args = process.argv.slice(2);
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const server = (opt("server") ?? process.env.MALAR_URL ?? "http://localhost:8080").replace(/\/$/, "");
const lang = opt("lang") as Lang | undefined;

const health = await fetch(`${server}/api/health`).then((r) => r.json() as Promise<{ tts: boolean }>).catch(() => null);
if (!health) { console.error(`Cannot reach the Malar Teacher speech server at ${server}. Start "Start Malar Teacher.bat" first.`); process.exit(2); }
if (!health.tts) { console.error("The speech server is still starting its voice engine. Wait a minute and run this again."); process.exit(2); }

const speak: Speak = async (text, voice, speed) => {
  const r = await fetch(`${server}/api/speak`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, voice, speed, priority: "low" }) });
  if (!r.ok) throw new Error(`speech server answered ${r.status}`);
  return r.json();
};
const report = await buildAudio({ lessonsDir, audioDir, speak, langs: lang ? [lang] : undefined, force: args.includes("--force"), prune: args.includes("--prune"), log: console.log });
console.log(`\nSentences wanted ${report.wanted}: generated ${report.generated}, already done ${report.reused}${report.pruned ? `, removed ${report.pruned} unused` : ""}.`);
for (const s of report.skipped) console.log("  skipped:", s);
