import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Mp3Encoder } from "@breezystack/lamejs";
import { LessonImport } from "@studysmart/shared";
import { audioKey, emptyManifest, LANGS, Manifest, VoiceMap, type Lang } from "./manifest.js";

/** What the Malar Teacher speech API returns for one sentence (HeadTTS format). */
export interface SpeechResult { audio: string; words?: string[]; wtimes?: number[]; wdurations?: number[] }
export type Speak = (text: string, voice: string, speed: number) => Promise<SpeechResult>;

export interface BuildOptions {
  lessonsDir: string; audioDir: string; speak: Speak; langs?: Lang[]; force?: boolean; prune?: boolean; log?: (m: string) => void;
}
export interface BuildReport { wanted: number; generated: number; reused: number; skipped: string[]; pruned: number; bytes: number }

const MAX_CHARS = 480; // the speech API cuts text longer than this

/** Minimal WAV (PCM 16-bit) reader. */
export function readWav(buf: Buffer): { sampleRate: number; channels: number; samples: Int16Array } {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") throw new Error("not a WAV file");
  let pos = 12, sampleRate = 0, channels = 0, bits = 0, data: Buffer | null = null;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4), size = buf.readUInt32LE(pos + 4), body = pos + 8;
    if (id === "fmt ") { channels = buf.readUInt16LE(body + 2); sampleRate = buf.readUInt32LE(body + 4); bits = buf.readUInt16LE(body + 14); }
    else if (id === "data") { data = buf.subarray(body, Math.min(buf.length, body + size)); break; }
    pos = body + size + (size % 2);
  }
  if (!data || bits !== 16) throw new Error("only 16-bit PCM WAV is supported");
  const samples = new Int16Array(data.length >> 1);
  for (let i = 0; i < samples.length; i++) samples[i] = data.readInt16LE(i * 2);
  return { sampleRate, channels, samples };
}

/** Speech-quality MP3: mono, 48 kbps (about 6 KB per second). */
export function wavToMp3(wav: Buffer): { mp3: Buffer; durationMs: number } {
  const { sampleRate, channels, samples } = readWav(wav);
  let mono = samples;
  if (channels > 1) { mono = new Int16Array(samples.length / channels); for (let i = 0; i < mono.length; i++) mono[i] = samples[i * channels]!; }
  const enc = new Mp3Encoder(1, sampleRate, 48);
  const parts: Buffer[] = [];
  const raw = (c: ArrayBufferView) => Buffer.from(Buffer.from(c.buffer, c.byteOffset, c.byteLength)); // reinterpret bytes (not values) and copy
  for (let i = 0; i < mono.length; i += 1152) { const c = enc.encodeBuffer(mono.subarray(i, i + 1152)); if (c.length) parts.push(raw(c)); }
  const end = enc.flush(); if (end.length) parts.push(raw(end));
  return { mp3: Buffer.concat(parts), durationMs: Math.round((mono.length / sampleRate) * 1000) };
}

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));

/** Generates any missing sentence audio. Safe to re-run: unchanged sentences are skipped. */
export async function buildAudio(o: BuildOptions): Promise<BuildReport> {
  const log = o.log ?? (() => {});
  const filesDir = join(o.audioDir, "files"), manifestPath = join(o.audioDir, "manifest.json");
  mkdirSync(filesDir, { recursive: true });
  const voices = VoiceMap.parse(readJson(join(o.audioDir, "voices.json")));
  const manifest = existsSync(manifestPath) ? Manifest.parse(readJson(manifestPath)) : emptyManifest();
  const langs = o.langs ?? LANGS;
  const report: BuildReport = { wanted: 0, generated: 0, reused: 0, skipped: [], pruned: 0, bytes: 0 };
  const used = new Set<string>();

  for (const f of readdirSync(o.lessonsDir).filter((x) => x.endsWith(".json")).sort()) {
    const lesson = LessonImport.parse(readJson(join(o.lessonsDir, f)));
    for (const b of lesson.lesson.blocks) {
      if (b.type !== "teacher_narration") continue;
      for (const sen of b.sentences) for (const lang of langs) {
        const text = sen.text[lang]?.trim();
        const cfg = voices[b.teacher]?.[lang];
        if (!text) continue;
        if (!cfg) { report.skipped.push(`${f}: no ${lang} voice for teacher "${b.teacher}"`); continue; }
        if (text.length > MAX_CHARS) { report.skipped.push(`${f} ${sen.id} (${lang}): longer than ${MAX_CHARS} characters, split it into two sentences`); continue; }
        report.wanted++;
        const key = audioKey({ lang, voice: cfg.voice, speed: cfg.speed, text });
        used.add(key);
        const have = manifest.entries[key];
        if (!o.force && have && existsSync(join(filesDir, have.file))) { report.reused++; continue; }
        const r = await o.speak(text, cfg.voice, cfg.speed);
        const { mp3, durationMs } = wavToMp3(Buffer.from(r.audio, "base64"));
        const file = `${key}.mp3`;
        writeFileSync(join(filesDir, file), mp3);
        const words = (r.words ?? []).map((w, i) => ({ w: w.trim(), t: Math.round(r.wtimes?.[i] ?? 0), d: Math.round(r.wdurations?.[i] ?? 0) }));
        manifest.entries[key] = { file, durationMs, bytes: mp3.length, voice: cfg.voice, lang, text, words };
        report.generated++; report.bytes += mp3.length;
        log(`${lang} ${f} ${sen.id}: ${durationMs} ms, ${mp3.length} bytes`);
        writeManifest(manifestPath, manifest); // save as we go so an interrupted run loses nothing
      }
    }
  }
  if (o.prune) {
    for (const [k, e] of Object.entries(manifest.entries)) if (!used.has(k)) { delete manifest.entries[k]; try { unlinkSync(join(filesDir, e.file)); } catch { /* already gone */ } report.pruned++; }
  }
  writeManifest(manifestPath, manifest);
  report.skipped = [...new Set(report.skipped)];
  return report;
}

function writeManifest(path: string, m: Manifest): void {
  const sorted = Manifest.parse({ version: 1, entries: Object.fromEntries(Object.entries(m.entries).sort(([a], [b]) => a.localeCompare(b))) });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(sorted, null, 1) + "\n");
  renameSync(tmp, path);
}
