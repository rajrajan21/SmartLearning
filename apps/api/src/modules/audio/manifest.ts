import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { PhraseSet, type AudioRef, type LangAudio, type TopicLesson } from "@studysmart/shared";

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

/**
 * Turns written text into text that is read well: symbols and arrows become words, brackets become pauses,
 * and every sentence ends with punctuation so the voice finishes it naturally. Used for the audio key AND for what is spoken,
 * so a lesson's written text can differ from its spoken text without regenerating audio by mistake.
 */
export function speechText(text: string, lang: Lang = "en"): string {
  let t = text.normalize("NFC").replace(/[*_`#>]+/g, "").replace(/\s+/g, " ").trim();
  if (lang === "en") {
    t = t
      .replace(/\s*→\s*/g, ", then ").replace(/\s*=\s*/g, " equals ").replace(/\s*×\s*/g, " times ").replace(/\s*÷\s*/g, " divided by ")
      .replace(/(\d)\s*\+\s*(\d)/g, "$1 plus $2").replace(/(\d)\s*[−]\s*(\d)/g, "$1 minus $2").replace(/(\d)\s+-\s+(\d)/g, "$1 minus $2")
      .replace(/(\d)\s*%/g, "$1 percent").replace(/\s*&\s*/g, " and ").replace(/\be\.g\./gi, "for example").replace(/\bi\.e\./gi, "that is");
  }
  t = t.replace(/\s*\(([^)]*)\)/g, ", $1,").replace(/,\s*,/g, ",").replace(/,\s*([.!?])/g, "$1").replace(/\s+([,.!?])/g, "$1").replace(/\s+/g, " ").trim();
  if (t && !/[.!?…।]$/u.test(t)) t += ".";
  return t;
}

export interface AudioStore {
  /** Recording for any one piece of text (question stems, explanations, phrases); undefined when none exists yet. */
  ref(teacher: string, lang: Lang, text: string | undefined): AudioRef | undefined;
  refs(teacher: string, text: { en?: string; ta?: string } | undefined): LangAudio | undefined;
  phrases(): PhraseSet;
  /** Adds `audio` to every narration sentence that has a recording. Never changes the stored lesson. */
  enrich(lesson: TopicLesson): TopicLesson;
  filePath(file: string): string | null;
}

export function createAudioStore(opts: { manifestPath: string; voicesPath: string; phrasesPath: string; filesDir: string; urlBase?: string }): AudioStore {
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
  const lookup = (teacher: string, lang: Lang, text: string | undefined): AudioRef | undefined => {
    fresh();
    const cfg = voices[teacher]?.[lang];
    if (!cfg || !text?.trim()) return undefined;
    const e = manifest.entries[audioKey({ lang, voice: cfg.voice, speed: cfg.speed, text: speechText(text, lang) })];
    return e && existsSync(join(opts.filesDir, e.file)) ? { url: `${base}/${e.file}`, durationMs: e.durationMs, words: e.words } : undefined;
  };
  const refs = (teacher: string, text: { en?: string; ta?: string } | undefined): LangAudio | undefined => {
    if (!text) return undefined;
    const out: LangAudio = {};
    for (const lang of LANGS) { const r = lookup(teacher, lang, text[lang]); if (r) out[lang] = r; }
    return out.en || out.ta ? out : undefined;
  };
  return {
    ref: lookup,
    refs,
    phrases() {
      fresh();
      if (!existsSync(opts.phrasesPath)) return {};
      const r = PhraseSet.safeParse(JSON.parse(readFileSync(opts.phrasesPath, "utf8")));
      if (!r.success) return {};
      return Object.fromEntries(Object.entries(r.data).map(([k, list]) => [k, list.map((p) => ({ text: p.text, ...(refs("malar", p.text) ? { audio: refs("malar", p.text) } : {}) }))]));
    },
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
                const r = lookup(b.teacher, lang, sen.spoken?.[lang] ?? sen.text[lang]);
                if (r) audio[lang] = r;
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
