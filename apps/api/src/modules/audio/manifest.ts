import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { AudioRef, TopicLesson } from "@studysmart/shared";

export type Lang = "en" | "ta";
export const LANGS: Lang[] = ["en", "ta"];

/** Teacher id (used in lesson files) -> the speech-engine voice per language. Edit content/audio/voices.json to add teachers. */
export const VoiceMap = z.record(z.string(), z.object({ en: z.object({ voice: z.string(), speed: z.number().default(1) }).optional(), ta: z.object({ voice: z.string(), speed: z.number().default(1) }).optional() }));
export type VoiceMap = z.infer<typeof VoiceMap>;

export const ManifestEntry = z.object({
  file: z.string().regex(/^[a-f0-9]{16}\.mp3$/),
  durationMs: z.number().int().positive(),
  bytes: z.number().int().nonnegative(),
  voice: z.string(),
  lang: z.enum(["en", "ta"]),
  text: z.string(), // kept so a person can see what each clip says
  words: z.array(z.object({ w: z.string(), t: z.number(), d: z.number() })).default([]),
});
export const Manifest = z.object({ version: z.literal(1), entries: z.record(z.string(), ManifestEntry) });
export type Manifest = z.infer<typeof Manifest>;
export const emptyManifest = (): Manifest => ({ version: 1, entries: {} });

/** Same sentence + voice + speed + language always gives the same key, so unchanged sentences are never regenerated. */
export const audioKey = (p: { lang: Lang; voice: string; speed: number; text: string }): string =>
  createHash("sha1").update([p.lang, p.voice, p.speed.toFixed(2), p.text].join("|")).digest("hex").slice(0, 16);

export interface AudioStore {
  /** Adds `audio` to every narration sentence that has a recording. Never changes the stored lesson. */
  enrich(lesson: TopicLesson): TopicLesson;
  filePath(file: string): string | null;
}

export function createAudioStore(opts: { manifestPath: string; voicesPath: string; filesDir: string; urlBase?: string }): AudioStore {
  const base = opts.urlBase ?? "/api/v1/audio";
  let manifest = emptyManifest(), voices: VoiceMap = {};
  let mTime = -1, vTime = -1;
  const fresh = () => {
    // Pick up newly generated audio without restarting the server.
    if (existsSync(opts.manifestPath)) {
      const t = statSync(opts.manifestPath).mtimeMs;
      if (t !== mTime) { const r = Manifest.safeParse(JSON.parse(readFileSync(opts.manifestPath, "utf8"))); if (r.success) { manifest = r.data; mTime = t; } else console.error("invalid_audio_manifest"); }
    }
    if (existsSync(opts.voicesPath)) {
      const t = statSync(opts.voicesPath).mtimeMs;
      if (t !== vTime) { const r = VoiceMap.safeParse(JSON.parse(readFileSync(opts.voicesPath, "utf8"))); if (r.success) { voices = r.data; vTime = t; } }
    }
  };
  return {
    enrich(lesson) {
      fresh();
      return {
        ...lesson,
        blocks: lesson.blocks.map((b) => {
          if (b.type !== "teacher_narration") return b;
          const v = voices[b.teacher];
          if (!v) return b;
          return {
            ...b,
            sentences: b.sentences.map((sen) => {
              const audio: { en?: AudioRef; ta?: AudioRef } = {};
              for (const lang of LANGS) {
                const cfg = v[lang], text = sen.text[lang];
                if (!cfg || !text) continue;
                const e = manifest.entries[audioKey({ lang, voice: cfg.voice, speed: cfg.speed, text })];
                if (e && existsSync(join(opts.filesDir, e.file))) audio[lang] = { url: `${base}/${e.file}`, durationMs: e.durationMs, words: e.words };
              }
              return { ...sen, audio };
            }),
          };
        }),
      };
    },
    filePath(file) {
      if (!/^[a-f0-9]{16}\.mp3$/.test(file)) return null;
      const p = join(opts.filesDir, file);
      return existsSync(p) ? p : null;
    },
  };
}
