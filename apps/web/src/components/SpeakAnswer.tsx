import { useRef, useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

type Rec = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start(): void; stop(): void };
type Ctor = new () => Rec;
export const recognitionCtor = (w: unknown = typeof window === "undefined" ? undefined : window): Ctor | null => { const x = w as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor } | undefined; return x?.SpeechRecognition ?? x?.webkitSpeechRecognition ?? null; };
/** Adds spoken words to what is already typed, with one space between. */
export const addSpoken = (typed: string, spoken: string): string => { const t = typed.trimEnd(), p = spoken.trim(); return !p ? typed : t ? `${t} ${p}` : p; };

/** "Speak your answer": fills the answer box from the microphone. Admin switch; hidden when the browser cannot do it. */
export function SpeakAnswer({ value, onText }: { value: string; onText: (v: string) => void }) {
  const s = useSettings();
  const [on, setOn] = useState(false);
  const rec = useRef<Rec | null>(null);
  const Ctor = recognitionCtor();
  if (s.get("lesson.teachBack.speech") !== true || !Ctor) return null;
  const toggle = () => {
    if (on) { rec.current?.stop(); return; }
    const r = new Ctor();
    r.lang = s.lang === "ta" ? "ta-IN" : "en-IN"; r.interimResults = false; r.continuous = false;
    r.onresult = (e) => { const last = e.results[e.results.length - 1]; onText(addSpoken(value, last?.[0]?.transcript ?? "")); };
    r.onend = () => setOn(false); r.onerror = () => setOn(false);
    rec.current = r; setOn(true); r.start();
  };
  return <button type="button" className="btn ghost sm" aria-pressed={on} onClick={toggle}>🎤 {on ? ui("speakStop", s.lang) : ui("speakStart", s.lang)}</button>;
}
