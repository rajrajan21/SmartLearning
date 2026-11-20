import { useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

/** The text that goes with a shared link. */
export const shareText = (intro: string, what: string, url: string): string => `${intro.trim()} ${what}\n${url}`.trim();

/** For teachers, mentors and parents: send a chapter or topic to a class or a child. Admin: on/off, WhatsApp button, opening line. */
export function ShareLink({ what, url }: { what: string; url?: string }) {
  const s = useSettings();
  const [done, setDone] = useState(false);
  if (s.get("share.link.show") !== true) return null;
  const link = url ?? (typeof window === "undefined" ? "" : window.location.href);
  const text = shareText(String(s.get("share.link.intro") ?? ""), what, link);
  const nav = typeof navigator === "undefined" ? undefined : (navigator as Navigator & { share?: (d: { text: string }) => Promise<void> });
  const go = async () => {
    try { if (nav?.share) await nav.share({ text }); else { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); } } catch { /* cancelled */ }
  };
  return (
    <p className="actions noprint share-link">
      <button type="button" className="btn ghost sm" onClick={() => void go()}>🔗 {done ? ui("shareCopied", s.lang) : ui("shareThis", s.lang)}</button>
      {s.get("share.link.whatsapp") === true && <a className="btn ghost sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(text)}`}>{ui("shareWhatsapp", s.lang)}</a>}
    </p>
  );
}
