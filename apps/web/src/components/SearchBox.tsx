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
  if (!s.get("feature.search")) return null;
  const searching = q.trim().length >= s.get<number>("site.search.minChars");
  return (
    <div className={`search${compact ? " compact" : ""}`} role="search">
      <label htmlFor={id} className="sr">{ui("search", s.lang)}</label>
      <input ref={ref} id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setQ(""); }} placeholder={ui("search", s.lang)} autoComplete="off" />
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
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") onChange(""); }} placeholder={text} autoComplete="off" />
    </div>
  );
}

/** True when every word typed appears in the text. */
export function matches(q: string, ...texts: (string | undefined)[]): boolean {
  const words = q.toLocaleLowerCase("en").split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const hay = texts.filter(Boolean).join(" ").toLocaleLowerCase("en");
  return words.every((w) => hay.includes(w));
}
