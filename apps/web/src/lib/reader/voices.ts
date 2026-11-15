/**
 * Choosing the read-aloud voice. Only voices the device really reports (speechSynthesis.getVoices()) are ever
 * offered; nothing here invents a voice. Pure functions so the rules can be tested.
 */
export interface VoiceLike { name: string; lang: string; default?: boolean; localService?: boolean }
export type ReadLang = "en" | "ta";

const norm = (lang: string) => String(lang || "").replace(/_/g, "-").toLowerCase();
export const baseLang = (lang: string) => norm(lang).split("-")[0] ?? "";

/** Is this book in Tamil? (manifest language, or the subject itself) */
export function bookReadLang(language?: string | null, subject?: string | null): ReadLang {
  const tamil = (s?: string | null) => !!s && (/^\s*(tamil|ta|ta-in)\s*$/i.test(s) || /தமிழ்/.test(s));
  return tamil(language) || tamil(subject) ? "ta" : "en";
}

/** The exact voice language to look for first. `setting` is the admin's reader.voiceLang. */
export function preferredLang(read: ReadLang, setting?: string | null): string {
  if (read === "ta") return "ta-IN";
  const s = norm(setting ?? "");
  return baseLang(s) === "en" && /^en-[a-z]{2}$/.test(s) ? `en-${s.slice(3).toUpperCase()}` : "en-IN";
}

/**
 * How good a voice is for the wanted language: smaller is better, Infinity = cannot be used.
 * English: the wanted accent, then en-IN, then en-GB, then any English.
 * Tamil: ta-IN, then any Tamil. A voice of another language is never used.
 */
export function voiceRank(v: VoiceLike, want: string): number {
  const have = norm(v.lang), w = norm(want), base = baseLang(w);
  if (baseLang(have) !== base || base === "") return Infinity;
  if (base === "ta") return have === "ta-in" ? 0 : 1;
  if (base === "en") {
    const chain = [...new Set([w, "en-in", "en-gb"])];
    const at = chain.indexOf(have);
    return at >= 0 ? at : chain.length;
  }
  return have === w ? 0 : 1;
}

/** The device's usable voices for the wanted language, best first. */
export function voicesFor<V extends VoiceLike>(voices: readonly V[], want: string): V[] {
  const natural = (v: VoiceLike) => (/natural|neural|enhanced|premium/i.test(v.name) ? 0 : 1);
  return voices
    .filter((v) => v && typeof v.lang === "string" && voiceRank(v, want) !== Infinity)
    .slice()
    .sort((a, b) => voiceRank(a, want) - voiceRank(b, want) || natural(a) - natural(b) || a.name.localeCompare(b.name));
}

/**
 * The voice to use: the one the reader chose before (if the device still has it and it speaks the wanted
 * language), else the best match, else null (then the browser is only told the language and uses whatever it has).
 */
export function pickVoice<V extends VoiceLike>(voices: readonly V[], want: string, savedName?: string | null): V | null {
  const list = voicesFor(voices, want);
  if (savedName) { const kept = list.find((v) => v.name === savedName); if (kept) return kept; }
  return list[0] ?? null;
}

export const hasVoiceFor = (voices: readonly VoiceLike[], read: ReadLang) => voices.some((v) => baseLang(v.lang) === read);

/** "Microsoft Heera - English (India)" is shown as "Heera - English (India) (en-IN)" */
export function voiceLabel(v: VoiceLike): string {
  const [a = "", b] = String(v.lang).replace(/_/g, "-").split("-");
  const tag = b ? `${a.toLowerCase()}-${b.toUpperCase()}` : a.toLowerCase();
  return `${v.name.replace(/^(Microsoft|Google)\s+/, "")} (${tag})`;
}

export const clampRate = (r: unknown, fallback = 0.9) => { const n = Number(r); return Number.isFinite(n) && n >= 0.5 && n <= 1.5 ? Math.round(n * 10) / 10 : fallback; };
