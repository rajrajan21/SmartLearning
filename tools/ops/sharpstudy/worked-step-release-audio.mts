import { execFile } from "node:child_process";
import { chmodSync, chownSync, copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { promisify } from "node:util";

const [dir, mode] = process.argv.slice(2);
if (!dir) throw new Error("Specify the release folder");
const app = "/opt/studysmart";
const live = "/srv/studysmart/audio";
const worker = "/home/ubuntu/sharpstudy-audio-worker";
const staging = join(worker, "staging");
const { wavToMp3 } = await import(app + "/apps/api/src/modules/audio/build.ts");
const { audioKey, ManifestEntry, speechText, VoiceMap } = await import(app + "/apps/api/src/modules/audio/manifest.ts");
type Entry = ReturnType<typeof ManifestEntry.parse>;
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const id = process.env.SHARPSTUDY_VOICE_ID ?? "kani";
const config = VoiceMap.parse(json(join(live, "voices.json")))[id]?.en;
if (!config) throw new Error("Live English voice is missing: " + id);
const configured = config;
const liveManifestPath = join(live, "manifest.json");
const before = statSync(liveManifestPath);
const liveManifest = json(liveManifestPath);
const staged = json(join(staging, "manifest.json")).entries;
const clips = join(dir, "files");
const checkpoint = join(dir, "generated.json");
mkdirSync(clips, { recursive: true });
const generated: Record<string, Entry> = existsSync(checkpoint) ? json(checkpoint) : {};
const available = (entry: Entry | undefined, file: string) => entry && entry.bytes > 0 && existsSync(file) && statSync(file).size === entry.bytes;
const pending = new Map<string, string>();
const wanted = new Set<string>();
const toPublish = new Map<string, { entry: Entry; path: string }>();
for (const raw of json(join(dir, "worked-step-lines.json")) as string[]) {
  const text = speechText(raw, "en");
  if (!text || (text.length > 480 && !process.env.SHARPSTUDY_EDGE_HELPER)) throw new Error("Clip is outside the Kani length range");
  const key = audioKey({ lang: "en", ...configured, text });
  if (wanted.has(key)) continue;
  wanted.add(key);
  const file = key + ".mp3";
  if (available(liveManifest.entries[key], join(live, "files", file))) continue;
  for (const [entry, path] of [[generated[key], join(clips, file)], [staged[key], join(staging, "files", file)]] as const) {
    if (entry?.text === text && entry?.voice === configured.voice && entry.file === file && available(entry, path)) {
      toPublish.set(key, { entry: ManifestEntry.parse(entry), path });
      break;
    }
  }
  if (!toPublish.has(key)) pending.set(key, text);
}
console.log(JSON.stringify({mode, wanted: wanted.size, staged: toPublish.size, missing: pending.size, live: wanted.size - toPublish.size - pending.size}));
if (!wanted.size) throw new Error("No affected recordings were collected");
if (mode === "generate") {
  const execute = promisify(execFile);
  const jobs = pending.entries();
  const save = () => {
    writeFileSync(checkpoint + ".tmp", JSON.stringify(generated));
    renameSync(checkpoint + ".tmp", checkpoint);
  };
  let completed = 0;
  const failed: string[] = [];
  async function speak(text: string) {
    for (let attempt = 1; ; attempt++) {
      try {
        if (process.env.SHARPSTUDY_TTS_WAIT && process.env.SHARPSTUDY_EDGE_HELPER) {
          await execute("/usr/bin/bash", [join(dirname(process.env.SHARPSTUDY_EDGE_HELPER), "wait-quiet.sh")]);
        }
        const child = execute(join(worker, ".venv/bin/python"), [process.env.SHARPSTUDY_EDGE_HELPER ?? app + "/tools/edge/edge_speak.py"], {
          encoding: "utf8", timeout: process.env.SHARPSTUDY_TTS_WAIT ? 600_000 : 90_000,
          maxBuffer: 16 * 1024 * 1024,
        });
        child.child.stdin?.on("error", () => {});
        child.child.stdin?.end(JSON.stringify({
          text, voice: configured.voice.replace(/^edge:/, ""), speed: configured.speed,
        }));
        return JSON.parse((await child).stdout);
      } catch (error) {
        if (attempt === 4) throw error;
        await setTimeout(attempt * 4000);
      }
    }
  }
  async function record() {
    for (const [key, text] of jobs) {
      try {
        const spoken = await speak(text);
        const { mp3, durationMs, headTrimMs } = wavToMp3(Buffer.from(spoken.audio, "base64"));
        const words = (spoken.words ?? []).map((word: string, i: number) => ({
          w: word.trim(),
          t: Math.max(0, Math.round((spoken.wtimes?.[i] ?? 0) - headTrimMs)),
          d: Math.round(spoken.wdurations?.[i] ?? 0),
        }));
        const file = key + ".mp3";
        generated[key] = ManifestEntry.parse({file, durationMs, bytes: mp3.length, voice: configured.voice, lang: "en", text, words});
        writeFileSync(join(clips, file), mp3);
        if (++completed % (process.env.SHARPSTUDY_TTS_WAIT ? 5 : 10) === 0) {
          save();
          if (completed % 10 === 0) console.log(`Generated ${completed}/${pending.size}`);
        }
      } catch {
        failed.push(key);
      }
    }
  }
  await Promise.all(Array.from({ length: id === "kani" ? 2 : 1 }, record));
  save();
  console.log(JSON.stringify({ generated: completed, failed }));
  if (failed.length) process.exitCode = 1;
} else if (mode === "publish") {
  if (pending.size) throw new Error("Some recordings are still missing");
  if (toPublish.size) {
    copyFileSync(liveManifestPath, join(dir, "manifest-before.json"));
    for (const [key, { entry, path }] of toPublish) {
      const target = join(live, "files", entry.file);
      if (!available(entry, target)) {
        const temp = target + ".worked-steps-" + process.pid;
        copyFileSync(path, temp);
        chmodSync(temp, 0o644);
        chownSync(temp, before.uid, before.gid);
        renameSync(temp, target);
      }
      liveManifest.entries[key] = entry;
    }
    const temp = liveManifestPath + ".worked-steps-" + process.pid;
    writeFileSync(temp, JSON.stringify(liveManifest));
    chownSync(temp, before.uid, before.gid);
    chmodSync(temp, before.mode & 0o777);
    const now = statSync(liveManifestPath);
    if (now.ino !== before.ino || now.mtimeMs !== before.mtimeMs || now.size !== before.size) throw new Error("Live manifest changed concurrently");
    renameSync(temp, liveManifestPath);
    console.log("Published " + toPublish.size + " " + id + " clips");
  }
}
