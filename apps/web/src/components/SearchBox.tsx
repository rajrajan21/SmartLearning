import { normalizeSearch, searchCost, type SearchHit } from "@studysmart/shared";
import { VoiceSearchInput } from "./VoiceSearchInput";
import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useSettings } from "../lib/settings";
import { useSearch } from "../lib/curriculum";
import { ui } from "../lib/i18n";

export function SearchBox({ board, compact }: { board: string; compact?: boolean }) {
  const s = useSettings();
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [loc] = useLocation();
  const shortcut = s.get("search.shortcut.enabled") === true;
  const { hits, busy } = useSearch(board, q, s.get<number>("site.search.maxResults"), s.get<number>("site.search.minChars"));
  useEffect(() => { setQ(""); }, [loc]);
  useEffect(() => {
    if (!shortcut) return;
    const on = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); ref.current?.focus(); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [shortcut]);
  const chooseVoice = async (alternatives: string[], signal: AbortSignal) => {
    const ranked = await Promise.all([...new Set(alternatives)].slice(0, 3).map(async text => {
      const r = await fetch(`/api/v1/curriculum/boards/${board}/search?q=${encodeURIComponent(text)}&limit=5`, { signal });
      if (!r.ok) return { text, cost: Infinity };
      const { hits } = await r.json() as { hits: SearchHit[] };
      const tokens = normalizeSearch(text).split(" ").filter(Boolean);
      return { text, cost: Math.min(...hits.map(hit => searchCost(tokens, normalizeSearch(`${hit.name.en} ${hit.name.ta ?? ""}`)))) };
    }));
    return ranked.sort((a, b) => a.cost - b.cost)[0]?.text ?? alternatives[0]!;
  };
  if (!s.get("feature.search")) return null;
  const searching = q.trim().length >= s.get<number>("site.search.minChars");
  return (
    <div className={`search${compact ? " compact" : ""}`} role="search">
      <label htmlFor={id} className="sr">{ui("search", s.lang)}</label>
      <VoiceSearchInput ref={ref} id={id} chooseVoice={chooseVoice} onVoice={setQ} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setQ(""); }} placeholder={ui("search", s.lang)} autoComplete="off" />
      {searching && (
        <ul className="hits" aria-live="polite">
          {hits.map((h, i) => {
            const href = `/${board.toLowerCase()}/${h.classLevel}/${h.subjectSlug}${h.chapterSlug ? `/${h.chapterSlug}` : ""}${h.topicSlug ? `/${h.topicSlug}` : ""}`;
            return <li key={i}><Link href={href}><strong>{s.name(h.name)}</strong><span className="ctx">{h.context}</span></Link></li>;
          })}
          {!busy && hits.length === 0 && <li className="none">{ui("searchNone", s.lang)}</li>}
        </ul>
      )}
    </div>
  );
}

/** A small box that narrows the list on the page you are on (chapters, topics, notes). */
export function FilterBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const s = useSettings();
  const id = useId();
  if (s.get("feature.search") !== true || s.get("search.filter.show") !== true) return null;
  const text = label ?? ui("filterList", s.lang);
  return (
    <div className="filter" role="search">
      <label htmlFor={id} className="sr">{text}</label>
      <VoiceSearchInput id={id} onVoice={onChange} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") onChange(""); }} placeholder={text} autoComplete="off" />
    </div>
  );
}

/** True when every word typed appears in the text. */
export function matches(q: string, ...texts: (string | undefined)[]): boolean {
  const words = normalizeSearch(q).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  return Number.isFinite(searchCost(words, normalizeSearch(texts.filter(Boolean).join(" "))));
}
