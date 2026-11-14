import { themeVars } from "../lib/theme";
import type { Values } from "./api";

/** Live sample of the public site, styled only by the unsaved settings. */
export function Preview({ values }: { values: Values }) {
  const prefersDark = typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
  const { vars, attrs } = themeVars(values, prefersDark);
  const title = (values["home.hero.title"] as { en: string } | undefined)?.en ?? "";
  const open = (values["catalog.openClasses"] as number[] | undefined) ?? [];
  return (
    <aside className="preview" aria-label="Live preview">
      <h2 className="p-h">Live preview</h2>
      <div className="p-site" style={vars as React.CSSProperties} data-rules={attrs["data-rules"]} data-margin={attrs["data-margin"]} data-mode={attrs["data-mode"]}>
        <div className="p-top"><b>{String(values["site.name"] ?? "StudySmart")}</b><span className="p-btn">தமிழ்</span></div>
        {values["home.announcement.show"] === true && <div className={`banner tone-${String(values["home.announcement.tone"])}`}>{(values["home.announcement.text"] as { en: string } | undefined)?.en || "Banner text"}</div>}
        <div className="p-page">
          {values["home.hero.show"] !== false && <h3 className="p-hero">{title}</h3>}
          <div className="p-classes">{[3, 4, 5].map((n) => <span key={n} className={`p-class ${open.includes(n) ? "on" : "off"}`}>{n}</span>)}</div>
          <div className="p-books">
            {(["maths", "evs", "english", "tamil"] as const).map((s) => <span key={s} className="p-book" style={{ background: `var(--subject-${s})`, color: "#fff" }}>{s}</span>)}
          </div>
          <p className="p-text">Chapter 2 · Toy Joy</p>
          <button type="button" className="p-cta" tabIndex={-1}>Start</button>
        </div>
      </div>
    </aside>
  );
}
