import "./voice-search.css";
import { useEffect, useRef, useState, type ComponentPropsWithRef } from "react";
import { useSettings } from "../lib/settings";

type SpeechResult = { isFinal: boolean; length: number; [index: number]: { transcript: string } };
type Recognition = {
  lang: string; maxAlternatives: number;
  start(): void; abort(): void; stop(): void;
  onresult: ((event: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type Props = Omit<ComponentPropsWithRef<"input">, "type"> & {
  onVoice: (text: string) => void;
  chooseVoice?: (alternatives: string[], signal: AbortSignal) => Promise<string>;
};
export function VoiceSearchInput({ onVoice, chooseVoice, ...input }: Props) {
  const s = useSettings();
  const win = typeof window === "undefined" ? undefined : window as Window & {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  const Constructor = win?.SpeechRecognition ?? win?.webkitSpeechRecognition;
  const active = useRef<Recognition | null>(null);
  const lookup = useRef<AbortController | null>(null);
  const [listening, setListening] = useState(false);
  const [failed, setFailed] = useState(false);
  const ta = s.lang === "ta";
  useEffect(() => () => { lookup.current?.abort(); active.current?.abort(); active.current = null; }, []);
  if (!Constructor || s.get("search.voice.enabled") === false) return <input {...input} type="search" />;
  const start = () => {
    if (active.current) { active.current.stop(); return; }
    lookup.current?.abort();
    const recognition = new Constructor();
    active.current = recognition;
    recognition.lang = ta ? "ta-IN" : "en-IN";
    recognition.maxAlternatives = 5;
    setFailed(false);
    const done = () => {
      if (active.current !== recognition) return;
      active.current = null;
      setListening(false);
    };
    recognition.onerror = () => { if (active.current === recognition) setFailed(true); done(); };
    recognition.onend = done;
    recognition.onresult = event => {
      if (active.current !== recognition) return;
      const result = event.results[event.results.length - 1];
      if (!result?.isFinal) return;
      const alternatives = Array.from(result, r => r.transcript.trim()).filter(Boolean);
      if (!alternatives.length) return;
      if (!chooseVoice || alternatives.length === 1) { onVoice(alternatives[0]!); return; }
      const controller = new AbortController();
      lookup.current = controller;
      void chooseVoice(alternatives, controller.signal).catch(() => alternatives[0]!).then(text => {
        if (!controller.signal.aborted) onVoice(text);
      });
    };
    try { recognition.start(); setListening(true); }
    catch { setFailed(true); done(); }
  };
  const label = listening ? (ta ? "கேட்பதை நிறுத்து" : "Stop listening") : (ta ? "குரல் தேடல்" : "Search by voice");
  return <span className="voice-search">
    <input {...input} type="search" onChange={e => { lookup.current?.abort(); input.onChange?.(e); }} />
    <button type="button" className="btn ghost voice-search-mic" aria-label={label} title={label} aria-pressed={listening} onClick={start}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-3 0h6"/>
      </svg>
    </button>
    {failed && <span className="small voice-search-status" role="status">{ta ? "குரல் கிடைக்கவில்லை. தட்டச்சு செய்து தேடலாம்." : "Voice input didn't work. Type to search or try the microphone again."}</span>}
  </span>;
}
