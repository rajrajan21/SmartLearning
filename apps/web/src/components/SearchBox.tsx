import { useId, useState } from "react";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { useSearch } from "../lib/curriculum";
import { ui } from "../lib/i18n";

export function SearchBox({ board }: { board: string }) {
  const s = useSettings();
  const id = useId();
  const [q, setQ] = useState("");
  const { hits, busy } = useSearch(board, q, s.get<number>("site.search.maxResults"), s.get<number>("site.search.minChars"));
  if (!s.get("feature.search")) return null;
  const searching = q.trim().length >= s.get<number>("site.search.minChars");
  return (
    <div className="search" role="search">
      <label htmlFor={id} className="sr">{ui("search", s.lang)}</label>
      <input id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={ui("search", s.lang)} autoComplete="off" />
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
