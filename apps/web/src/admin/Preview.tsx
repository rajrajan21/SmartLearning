import { SITE } from "@studysmart/shared";
import { themeVars } from "../lib/theme";
import type { Values } from "./api";

/**
 * Live sample of the public site, styled only by the (unsaved) settings. It uses the real site classes, so every theme
 * and palette shows exactly as visitors will see it. `compact` is the small swatch used in the theme picker.
 */
export function PreviewSite({ values, compact = false }: { values: Values; compact?: boolean }) {
  const prefersDark = typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
  const { vars, attrs } = themeVars(values, prefersDark);
  const title = (values["home.hero.title"] as { en: string } | undefined)?.en ?? "";
  const open = (values["catalog.openClasses"] as number[] | undefined) ?? [];
  return (
    <div className={`p-site ${compact ? "mini" : ""}`} style={vars as React.CSSProperties} data-theme={attrs["data-theme"]} data-palette={attrs["data-palette"]} data-rules={attrs["data-rules"]} data-margin={attrs["data-margin"]} data-mode={attrs["data-mode"]} data-motion="off" data-mobile="false">
      <header className="top">
        <span className="brand"><span className="brand-mark" aria-hidden="true">S</span><span>{String(values["site.name"] ?? SITE.name)}</span></span>
        <span className="btn ghost sm" aria-hidden="true">தமிழ்</span>
      </header>
      {!compact && values["home.announcement.show"] === true && <div className={`banner tone-${String(values["home.announcement.tone"])}`}>{(values["home.announcement.text"] as { en: string } | undefined)?.en || "Banner text"}</div>}
      <div className="p-page">
        <div className="paper">
          {values["home.hero.show"] !== false && <h3 className="p-hero">{title}</h3>}
          <div className="p-classes">{[3, 4, 5].map((n) => <span key={n} className={`class-tab ${open.includes(n) || compact ? "on" : "off"}`}><b>{n}</b></span>)}</div>
          <div className="p-books">
            {(["maths", "evs", "english", "tamil"] as const).slice(0, compact ? 3 : 4).map((s) => <div key={s} className="notebook" style={{ ["--cover" as string]: `var(--subject-${s})` }}><span className="nb-title">{s}</span></div>)}
          </div>
          <p className="p-text">Chapter 2 · Toy Joy</p>
          <span className="btn" aria-hidden="true">Start</span>
        </div>
      </div>
    </div>
  );
}

export function Preview({ values }: { values: Values }) {
  return (
    <aside className="preview" aria-label="Live preview">
      <h2 className="p-h">Live preview</h2>
      <PreviewSite values={values} />
    </aside>
  );
}
