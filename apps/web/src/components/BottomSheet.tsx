import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

/** Slides up from the bottom; drag the handle down (or press Escape, or tap outside) to close. */
export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const s = useSettings();
  const [dy, setDy] = useState(0);
  const start = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    addEventListener("keydown", key);
    return () => { removeEventListener("keydown", key); prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  const down = (e: React.PointerEvent) => { start.current = e.clientY; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); };
  const move = (e: React.PointerEvent) => { if (start.current !== null) setDy(Math.max(0, e.clientY - start.current)); };
  const up = () => { if (start.current === null) return; start.current = null; if (dy > 90) onClose(); setDy(0); };
  return (
    <div className="sheet-wrap">
      <div className="sheet-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} style={{ transform: dy ? `translateY(${dy}px)` : undefined }}>
        <div className="sheet-handle" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-hidden="true"><span /></div>
        <div className="sheet-head"><h2>{title}</h2><button type="button" className="btn ghost sm" onClick={onClose}>{ui("appClose", s.lang)}</button></div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
