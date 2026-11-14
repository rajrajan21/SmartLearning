import { useCallback, useEffect, useRef, useState } from "react";
import type { NarrationSentence } from "@studysmart/shared";
import type { Lang } from "./i18n";

const SPEECH_LANG: Record<Lang, string> = { en: "en-IN", ta: "ta-IN" };
const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

/** True when this device has a voice for the language (voices load late on some browsers). */
export function useDeviceVoice(lang: Lang, enabled: boolean): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!enabled || !hasSpeech()) { setOk(false); return; }
    const check = () => setOk(speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(lang)));
    check();
    speechSynthesis.addEventListener?.("voiceschanged", check);
    return () => speechSynthesis.removeEventListener?.("voiceschanged", check);
  }, [lang, enabled]);
  return ok;
}

export interface NarratorOptions { lang: Lang; autoAdvance: boolean; initialRate: number; deviceVoice: boolean }
export interface Narrator {
  /** recorded = every sentence has a recording; mixed = some do; device = device voice only; none = cannot speak */
  source: "recorded" | "mixed" | "device" | "none";
  playing: boolean;
  index: number;
  wordIndex: number;
  rate: number;
  setRate(r: number): void;
  play(from?: number): void;
  pause(): void;
  restart(): void;
}

export function useNarrator(sentences: NarrationSentence[], o: NarratorOptions): Narrator {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(-1);
  const [rate, setRateState] = useState(o.initialRate);
  const audio = useRef<HTMLAudioElement | null>(null);
  const run = useRef(0); // bumps on every start/stop so stale callbacks do nothing
  const rateRef = useRef(rate); rateRef.current = rate;
  const opts = useRef(o); opts.current = o;

  const recorded = sentences.filter((s) => s.audio[o.lang]).length;
  const source: Narrator["source"] = recorded === sentences.length && recorded > 0 ? "recorded"
    : recorded > 0 ? (o.deviceVoice ? "mixed" : "recorded") : o.deviceVoice && hasSpeech() ? "device" : "none";

  const halt = useCallback(() => {
    run.current++;
    if (audio.current) { audio.current.pause(); audio.current.onended = null; audio.current.ontimeupdate = null; audio.current = null; }
    if (hasSpeech()) speechSynthesis.cancel();
  }, []);

  const speakFrom = useCallback((i: number) => {
    const id = ++run.current;
    const step = (n: number) => {
      if (run.current !== id) return;
      if (n >= sentences.length) { setPlaying(false); setIndex(0); setWordIndex(-1); return; }
      const sen = sentences[n]!, { lang, autoAdvance, deviceVoice } = opts.current;
      setIndex(n); setWordIndex(-1);
      const done = () => { if (run.current !== id) return; if (autoAdvance) step(n + 1); else { setPlaying(false); setWordIndex(-1); } };
      const rec = sen.audio[lang];
      if (rec) {
        const a = new Audio(rec.url); audio.current = a; a.playbackRate = rateRef.current;
        a.ontimeupdate = () => { const ms = a.currentTime * 1000; let w = -1; for (let k = 0; k < rec.words.length; k++) if (rec.words[k]!.t <= ms) w = k; setWordIndex(w); };
        a.onended = done; a.onerror = done;
        void a.play().catch(() => { if (run.current === id) setPlaying(false); });
      } else if (deviceVoice && hasSpeech() && sen.text[lang]) {
        const u = new SpeechSynthesisUtterance(sen.text[lang]); u.lang = SPEECH_LANG[lang]; u.rate = rateRef.current;
        u.onend = done; u.onerror = done; speechSynthesis.speak(u);
      } else done();
    };
    setPlaying(true); step(i);
  }, [sentences]);

  const play = useCallback((from?: number) => { halt(); speakFrom(from ?? index); }, [halt, speakFrom, index]);
  const pause = useCallback(() => { halt(); setPlaying(false); }, [halt]);
  const restart = useCallback(() => { halt(); setIndex(0); setWordIndex(-1); speakFrom(0); }, [halt, speakFrom]);
  const setRate = useCallback((r: number) => { setRateState(r); if (audio.current) audio.current.playbackRate = r; }, []);

  useEffect(() => halt, [halt]); // stop speaking when the step changes or the page closes
  return { source, playing, index, wordIndex, rate, setRate, play, pause, restart };
}
