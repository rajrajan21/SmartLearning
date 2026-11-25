import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { perf } from "../perf/config.js";
import { PhraseSet, type AudioRef, type LangAudio, type TopicLesson } from "@studysmart/shared";

export type Lang = "en" | "ta";
export const LANGS: Lang[] = ["en", "ta"];

/** Teacher id (used in lesson files) -> the speech-engine voice per language. Edit content/audio/voices.json to add teachers. */
export const VoiceMap = z.record(z.string(), z.object({ label: z.string().optional(), gender: z.enum(["female", "male"]).optional(), accent: z.enum(["us", "uk", "in"]).optional(), en: z.object({ voice: z.string(), speed: z.number().default(1) }).optional(), ta: z.object({ voice: z.string(), speed: z.number().default(1) }).optional() }));
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
  /** Checks the Admin default natural voice first, then fallback teachers, returning the best recorded clip per language. */
  refsPreferred?(fallbackTeacher: string, text: { en?: string; ta?: string } | undefined): LangAudio | undefined;
  phrases(): PhraseSet;
  /** The teacher voices that can be chosen (from voices.json). */
  teachers(): { id: string; label: string; gender: "female" | "male"; accent: "us" | "uk" | "in"; langs: Lang[] }[];
  /** changes whenever the recordings list or the teacher list changes (used to cache things built from them) */
  version?(): string;
  /** Adds `audio` to every narration sentence that has a recording. Never changes the stored lesson. */
  enrich(lesson: TopicLesson): TopicLesson;
  filePath(file: string): string | null;
}

export function createAudioStore(opts: { manifestPath: string; voicesPath: string; phrasesPath: string; filesDir: string; urlBase?: string }): AudioStore {
  const base = opts.urlBase ?? "/api/v1/audio";
  let manifest = emptyManifest(), voices: VoiceMap = {};
  let mTime = -1, vTime = -1;
  let lastCheck = 0;
  const fresh = () => {
    // Pick up newly generated audio without restarting the server. The files are looked at most once per "file check" interval (Admin > Site and performance).
    const every = perf().fileCheckSeconds * 1000, now = Date.now();
    if (every > 0 && mTime !== -1 && now - lastCheck < every) return;
    lastCheck = now;
    if (existsSync(opts.manifestPath)) {
      const t = statSync(opts.manifestPath).mtimeMs;
      if (t !== mTime) { const r = Manifest.safeParse(JSON.parse(readFileSync(opts.manifestPath, "utf8"))); if (r.success) { manifest = r.data; mTime = t; } else console.error("invalid_audio_manifest"); }
    }
    if (existsSync(opts.voicesPath)) {
      const t = statSync(opts.voicesPath).mtimeMs;
      if (t !== vTime) { const r = VoiceMap.safeParse(JSON.parse(readFileSync(opts.voicesPath, "utf8"))); if (r.success) { voices = r.data; vTime = t; } }
    }
  };
  const present = new Set<string>(); // a recording that was seen once stays on the list (files are only ever added)
  const hasFile = (file: string) => present.has(file) || (existsSync(join(opts.filesDir, file)) && (present.add(file), true));
  const lookup = (teacher: string, lang: Lang, text: string | undefined): AudioRef | undefined => {
    fresh();
    const cfg = voices[teacher]?.[lang];
    if (!cfg || !text?.trim()) return undefined;
    const e = manifest.entries[audioKey({ lang, voice: cfg.voice, speed: cfg.speed, text: speechText(text, lang) })];
    return e && hasFile(e.file) ? { url: `${base}/${e.file}`, durationMs: e.durationMs, words: e.words } : undefined;
  };
  const refs = (teacher: string, text: { en?: string; ta?: string } | undefined): LangAudio | undefined => {
    if (!text) return undefined;
    const out: LangAudio = {};
    for (const lang of LANGS) { const r = lookup(teacher, lang, text[lang]); if (r) out[lang] = r; }
    return out.en || out.ta ? out : undefined;
  };
  const candidates = (fallbackTeacher: string, lang: Lang = "en"): string[] => {
    if (lang === "ta") {
      const defTa = perf().defaultTamilVoice || "valluvar";
      const list = fallbackTeacher === "malar" || fallbackTeacher === "kani"
        ? [defTa, "valluvar", "divya", "jaya", "murali"]
        : [fallbackTeacher, defTa, "valluvar", "divya", "jaya", "murali"];
      return [...new Set(list)];
    }
    const def = perf().defaultAudioVoice || "kani";
    const list = fallbackTeacher === "malar"
      ? [def, "kani", "priya2", "malar", "ravi2"]
      : [fallbackTeacher, def, "kani", "malar"];
    return [...new Set(list)];
  };
  const refsPreferred = (fallbackTeacher: string, text: { en?: string; ta?: string } | undefined): LangAudio | undefined => {
    if (!text) return undefined;
    const out: LangAudio = {};
    for (const lang of LANGS) {
      for (const t of candidates(fallbackTeacher, lang)) { const r = lookup(t, lang, text[lang]); if (r) { out[lang] = r; break; } }
    }
    return out.en || out.ta ? out : undefined;
  };
  return {
    version() { fresh(); return `${mTime}:${vTime}`; },
    ref: lookup,
    refs,
    refsPreferred,
    teachers() { fresh(); return Object.entries(voices).map(([id, v]) => ({ id, label: v.label ?? id, gender: v.gender ?? "female", accent: v.accent ?? "us", langs: LANGS.filter((l) => v[l]) })); },
    phrases() {
      fresh();
      if (!existsSync(opts.phrasesPath)) return {};
      const r = PhraseSet.safeParse(JSON.parse(readFileSync(opts.phrasesPath, "utf8")));
      if (!r.success) return {};
      return Object.fromEntries(Object.entries(r.data).map(([k, list]) => [k, list.map((p) => { const a = refsPreferred("malar", p.text); return { text: p.text, ...(a ? { audio: a } : {}) }; })]));
    },
    enrich(lesson) {
      fresh();
      return {
        ...lesson,
        blocks: lesson.blocks.map((b) => {
          if (b.type !== "teacher_narration") return b;
          const enOrder = candidates(b.teacher, "en"), taOrder = candidates(b.teacher, "ta");
          if (!enOrder.some((t) => voices[t]) && !taOrder.some((t) => voices[t])) return b;
          return {
            ...b,
            sentences: b.sentences.map((sen) => {
              const audio: { en?: AudioRef; ta?: AudioRef } = {};
              for (const lang of LANGS) {
                const spoken = sen.spoken?.[lang] ?? sen.text[lang];
                const order = lang === "ta" ? taOrder : enOrder;
                for (const t of order) { const r = lookup(t, lang, spoken); if (r) { audio[lang] = r; break; } }
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
