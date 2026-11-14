import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Mp3Encoder } from "@breezystack/lamejs";
import { LessonImport, PhraseSet, QuestionImport } from "@studysmart/shared";
import { audioKey, emptyManifest, LANGS, Manifest, speechText, VoiceMap, type Lang } from "./manifest.js";

/** What the Malar Teacher speech API returns for one sentence (HeadTTS format). */
export interface SpeechResult { audio: string; words?: string[]; wtimes?: number[]; wdurations?: number[] }
export type Speak = (text: string, voice: string, speed: number) => Promise<SpeechResult>;

export interface BuildOptions {
  lessonsDir: string; audioDir: string; speak: Speak;
  /** content/questions: questions and their feedback are spoken too (optional) */
  questionsDir?: string;
  langs?: Lang[]; force?: boolean; prune?: boolean; log?: (m: string) => void;
}
export interface BuildReport { wanted: number; generated: number; reused: number; skipped: string[]; pruned: number; bytes: number }

const MAX_CHARS = 480; // the speech API cuts text longer than this
const BITRATE = 64; // kbps mono: clear consonants for young listeners, about 8 KB per second

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

/**
 * Makes every clip sound like the same teacher in the same room:
 *  - trims the silence the engine leaves at both ends (keeps a natural breath of lead-in and tail),
 *  - brings the speech to one comfortable loudness (so no sentence is louder or quieter than the next),
 *  - fades the edges so there are no clicks.
 * Returns how much was trimmed from the start so word timings can be shifted to match.
 */
export function polish(samples: Int16Array, rate: number): { samples: Int16Array; headTrimMs: number } {
  const thr = 0.008 * 32768, head = Math.round(rate * 0.06), tail = Math.round(rate * 0.15);
  let first = 0, last = samples.length - 1;
  while (first < samples.length && Math.abs(samples[first]!) < thr) first++;
  while (last > first && Math.abs(samples[last]!) < thr) last--;
  if (first >= last) return { samples, headTrimMs: 0 }; // silent or tiny: leave as it is
  const from = Math.max(0, first - head), to = Math.min(samples.length, last + tail);
  const out = Float64Array.from(samples.subarray(from, to));

  let sum = 0, n = 0, peak = 0;
  for (const v of out) { const a = Math.abs(v); if (a > peak) peak = a; if (a >= thr) { sum += v * v; n++; } }
  const rms = n ? Math.sqrt(sum / n) : 0;
  if (rms > 0) {
    const gain = Math.min(4, Math.max(0.5, Math.min((0.1 * 32768) / rms, (0.89 * 32768) / peak))); // target -20 dBFS speech, never above -1 dB peak
    for (let i = 0; i < out.length; i++) out[i]! *= gain;
  }
  const fi = Math.round(rate * 0.008), fo = Math.round(rate * 0.03);
  for (let i = 0; i < fi && i < out.length; i++) out[i]! *= i / fi;
  for (let i = 0; i < fo && i < out.length; i++) out[out.length - 1 - i]! *= i / fo;
  return { samples: Int16Array.from(out, (v) => Math.max(-32768, Math.min(32767, Math.round(v)))), headTrimMs: Math.round((from / rate) * 1000) };
}

/** Speech-quality MP3 (mono). */
export function wavToMp3(wav: Buffer): { mp3: Buffer; durationMs: number; headTrimMs: number } {
  const { sampleRate, channels, samples } = readWav(wav);
  let mono = samples;
  if (channels > 1) { mono = new Int16Array(samples.length / channels); for (let i = 0; i < mono.length; i++) mono[i] = samples[i * channels]!; }
  const p = polish(mono, sampleRate);
  const enc = new Mp3Encoder(1, sampleRate, BITRATE);
  const parts: Buffer[] = [];
  const raw = (c: ArrayBufferView) => Buffer.from(Buffer.from(c.buffer, c.byteOffset, c.byteLength)); // reinterpret bytes (not values) and copy
  for (let i = 0; i < p.samples.length; i += 1152) { const c = enc.encodeBuffer(p.samples.subarray(i, i + 1152)); if (c.length) parts.push(raw(c)); }
  const end = enc.flush(); if (end.length) parts.push(raw(end));
  return { mp3: Buffer.concat(parts), durationMs: Math.round((p.samples.length / sampleRate) * 1000), headTrimMs: p.headTrimMs };
}

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const jsonFiles = (dir?: string) => (dir && existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith(".json")).sort() : []);

interface Job { where: string; teacher: string; lang: Lang; text: string }

/** Everything the teacher says: lesson sentences, question stems and feedback, and stock phrases. */
export function collectJobs(o: Pick<BuildOptions, "lessonsDir" | "questionsDir" | "audioDir">, langs: Lang[]): Job[] {
  const jobs: Job[] = [];
  const add = (where: string, teacher: string, t: { en?: string; ta?: string } | undefined) => { for (const lang of langs) { const text = t?.[lang]?.trim(); if (text) jobs.push({ where, teacher, lang, text }); } };
  for (const f of jsonFiles(o.lessonsDir)) {
    const lesson = LessonImport.parse(readJson(join(o.lessonsDir, f)));
    for (const b of lesson.lesson.blocks) if (b.type === "teacher_narration") for (const sen of b.sentences) add(`${f} ${sen.id}`, b.teacher, { en: sen.spoken?.en ?? sen.text.en, ta: sen.spoken?.ta ?? sen.text.ta });
  }
  for (const f of jsonFiles(o.questionsDir)) {
    const qs = QuestionImport.parse(readJson(join(o.questionsDir!, f)));
    for (const q of qs.questions.filter((x) => x.status === "published")) {
      const w = `${f} ${q.key}`;
      add(`${w} stem`, "malar", q.stem); add(`${w} explanation`, "malar", q.explanation);
      if (q.type === "mcq") for (const op of q.options) add(`${w} why-wrong`, "malar", op.whyWrong);
      if (q.type === "number" || q.type === "short") for (const wa of q.wrongAnswers) add(`${w} why-wrong`, "malar", wa.why);
    }
  }
  const phrases = join(o.audioDir, "phrases.json");
  if (existsSync(phrases)) for (const [kind, list] of Object.entries(PhraseSet.parse(readJson(phrases)))) list.forEach((p, i) => add(`phrases ${kind} ${i + 1}`, "malar", p.text));
  return jobs;
}

/** Generates any missing audio. Safe to re-run: unchanged text is skipped. */
export async function buildAudio(o: BuildOptions): Promise<BuildReport> {
  const log = o.log ?? (() => {});
  const filesDir = join(o.audioDir, "files"), manifestPath = join(o.audioDir, "manifest.json");
  mkdirSync(filesDir, { recursive: true });
  const voices = VoiceMap.parse(readJson(join(o.audioDir, "voices.json")));
  const manifest = existsSync(manifestPath) ? Manifest.parse(readJson(manifestPath)) : emptyManifest();
  const report: BuildReport = { wanted: 0, generated: 0, reused: 0, skipped: [], pruned: 0, bytes: 0 };
  const used = new Set<string>();

  for (const job of collectJobs(o, o.langs ?? LANGS)) {
    const cfg = voices[job.teacher]?.[job.lang];
    if (!cfg) { report.skipped.push(`${job.where}: no ${job.lang} voice for teacher "${job.teacher}"`); continue; }
    const text = speechText(job.text, job.lang);
    if (text.length > MAX_CHARS) { report.skipped.push(`${job.where} (${job.lang}): longer than ${MAX_CHARS} characters, split it into two sentences`); continue; }
    const key = audioKey({ lang: job.lang, voice: cfg.voice, speed: cfg.speed, text });
    if (used.has(key)) continue; // same words said twice (a phrase in two places): one recording serves both
    used.add(key); report.wanted++;
    const have = manifest.entries[key];
    if (!o.force && have && existsSync(join(filesDir, have.file))) { report.reused++; continue; }
    const r = await o.speak(text, cfg.voice, cfg.speed);
    const { mp3, durationMs, headTrimMs } = wavToMp3(Buffer.from(r.audio, "base64"));
    const file = `${key}.mp3`;
    writeFileSync(join(filesDir, file), mp3);
    const words = (r.words ?? []).map((w, i) => ({ w: w.trim(), t: Math.max(0, Math.round((r.wtimes?.[i] ?? 0) - headTrimMs)), d: Math.round(r.wdurations?.[i] ?? 0) }));
    manifest.entries[key] = { file, durationMs, bytes: mp3.length, voice: cfg.voice, lang: job.lang, text, words };
    report.generated++; report.bytes += mp3.length;
    log(`${job.lang} ${job.where}: ${durationMs} ms, ${mp3.length} bytes`);
    writeManifest(manifestPath, manifest); // save as we go so an interrupted run loses nothing
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
