import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSettings } from "../lib/settings";

export interface TodayItem { id: string; label: { en: string; ta: string }; icon: string; node: ReactNode }
export type TodayMode = "inline" | "rail" | "tabs" | "drawer";

/**
 * Where the 'today' extras (daily challenge, GK and puzzle, project of the week, did you know) appear on the home page.
 * inline = in the long page as before; rail = a sticky side column; tabs = one card with tabs; drawer = a button that slides a panel in.
 * Panels that have nothing to show (feature off, nothing today) are detected from the page and left out, so there are no empty tabs.
 */
export function TodayWidgets({ mode, items }: { mode: TodayMode; items: TodayItem[] }) {
  const s = useSettings();
  const lang = s.lang === "ta" ? "ta" : "en";
  const list = items.filter((i) => s.get(`layout.today.item.${i.id}`) !== false);
  const root = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState<string[]>([]);
  const [tab, setTab] = useState("");
  const [open, setOpen] = useState(false);
  const title = s.text("layout.today.title") || (lang === "ta" ? "இன்று" : "Today");
  const side = s.get("layout.today.side") === "left" ? "left" : "right";

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const scan = () => {
      const ids = [...el.querySelectorAll<HTMLElement>("[data-today-panel]")].filter((p) => (p.textContent ?? "").trim() !== "" || !!p.querySelector("img,svg,canvas")).map((p) => p.dataset.todayPanel as string);
      setFilled((prev) => (prev.join() === ids.join() ? prev : ids));
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [mode, list.length]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const panels = list.map((i) => (
    <div key={i.id} className="today-panel" data-today-panel={i.id} hidden={mode === "tabs" && i.id !== (filled.includes(tab) ? tab : filled[0])}>{i.node}</div>
  ));
  const empty = filled.length === 0;
  const active = filled.includes(tab) ? tab : filled[0];

  if (mode === "rail") return <aside ref={root as never} className="today today-rail" aria-label={title} hidden={empty}><h2 className="today-title">{title}</h2>{panels}</aside>;
  if (mode === "tabs") {
    return (
      <section ref={root as never} className="today today-tabs paper-block" aria-label={title} hidden={empty}>
        <div className="today-tablist" role="tablist">
          {list.filter((i) => filled.includes(i.id)).map((i) => (
            <button key={i.id} type="button" role="tab" aria-selected={i.id === active} className={`today-tab${i.id === active ? " on" : ""}`} onClick={() => setTab(i.id)}>
              <span aria-hidden="true">{i.icon}</span> {i.label[lang]}
            </button>
          ))}
        </div>
        {panels}
      </section>
    );
  }
  if (mode === "drawer") {
    return (
      <div ref={root} className="today today-drawer-wrap" data-side={side}>
        <button type="button" className="today-fab" hidden={empty} aria-expanded={open} onClick={() => setOpen(true)}><span aria-hidden="true">✨</span> {title}</button>
        <div className="today-drawer" data-open={open ? "true" : "false"} data-side={side}>
          <div className="today-scrim" onClick={() => setOpen(false)} />
          <aside className="today-sheet" role="dialog" aria-label={title} aria-hidden={!open}>
            <div className="today-head"><h2>{title}</h2><button type="button" className="btn ghost sm" onClick={() => setOpen(false)} aria-label={lang === "ta" ? "மூடு" : "Close"}>✕</button></div>
            {panels}
          </aside>
        </div>
      </div>
    );
  }
  return <div ref={root} className="today today-inline">{panels}</div>;
}
