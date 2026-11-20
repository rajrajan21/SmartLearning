import { useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

const KEY = "ss_parentnote_v1";
/** Decides if the note shows now, and counts it. A repeat call within 3 seconds counts as the same view. */
export function noteDecision(raw: string | null, now: number, day: string, limit: number): { show: boolean; next: string } {
  let c = 0, last = 0;
  try { const j = raw ? JSON.parse(raw) as { day?: string; count?: number; last?: number } : {}; if (j.day === day) { c = j.count ?? 0; last = j.last ?? 0; } } catch { /* start fresh */ }
  if (now - last < 3000 && c > 0) return { show: c <= limit, next: JSON.stringify({ day, count: c, last: now }) };
  if (c >= limit) return { show: false, next: JSON.stringify({ day, count: c, last }) };
  return { show: true, next: JSON.stringify({ day, count: c + 1, last: now }) };
}

/** "A note for parents" on subject pages: shown only a few times a day (Admin > Site pages). The footer copy is separate. */
export function ParentNote({ now = Date.now() }: { now?: number }) {
  const s = useSettings();
  const limit = Number(s.get("site.disclaimer.perDay"));
  const [show] = useState(() => {
    if (s.get("site.disclaimer.show") !== true || !(limit > 0)) return false;
    if (limit >= 99) return true;
    let raw: string | null = null;
    try { raw = localStorage.getItem(KEY); } catch { /* ignore */ }
    const d = noteDecision(raw, now, new Date(now).toISOString().slice(0, 10), limit);
    try { localStorage.setItem(KEY, d.next); } catch { /* ignore */ }
    return d.show;
  });
  const [closed, setClosed] = useState(false);
  if (!show || closed) return null;
  return (
    <aside className="parent-note" role="note">
      {s.get("site.disclaimer.closable") === true && <button type="button" className="note-close" aria-label={ui("closeNote", s.lang)} onClick={() => setClosed(true)}>✕</button>}
      <b>{ui("parentNoteTitle", s.lang)}</b>{ui("parentNoteText", s.lang)}
    </aside>
  );
}
