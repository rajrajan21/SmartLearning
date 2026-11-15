import { CUSTOM_PALETTE, DEFAULT_PALETTE, DEFAULT_THEME, PALETTES, THEMES, paletteById, themeById } from "@studysmart/shared";
import { PreviewSite } from "./Preview";
import type { Values } from "./api";

interface Props { values: Values; onChange: (changes: Values) => void }

/** Visual choosers for the theme and the colour palette, shown above the individual settings of "Look and feel". */
export function LookPicker({ values, onChange }: Props) {
  const themeId = String(values["theme.preset"] ?? DEFAULT_THEME);
  const paletteId = String(values["theme.palette"] ?? DEFAULT_PALETTE);
  const theme = themeById(themeId);
  const rec = themeById(DEFAULT_THEME);
  const recPalette = paletteById(DEFAULT_PALETTE)!;
  const atRecommended = themeId === DEFAULT_THEME && paletteId === DEFAULT_PALETTE && values["theme.radius"] === "theme" && values["theme.font.heading"] === "theme";
  return (
    <section className="look" aria-label="Theme and palette chooser">
      <div className="look-rec">
        <div>
          <b>Recommended: {rec.label} + {recPalette.label}</b>
          <p>Best for children aged 8 to 12 and their parents: bright but calm, large rounded buttons that look pressable, strong text contrast and no heavy images, so it stays fast on phones.</p>
        </div>
        <button type="button" className="btn ghost sm" disabled={atRecommended} onClick={() => onChange({ "theme.preset": DEFAULT_THEME, "theme.palette": DEFAULT_PALETTE, "theme.mode": rec.mode, "theme.radius": "theme", "theme.font.heading": "theme" })}>Reset to recommended</button>
      </div>

      <h3 className="look-h">Theme <span>({THEMES.length} looks, each works in light and dark)</span></h3>
      <div className="look-grid" role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => {
          const on = t.id === themeId;
          return (
            <button key={t.id} type="button" role="radio" aria-checked={on} className={`look-card ${on ? "on" : ""}`} onClick={() => onChange({ "theme.preset": t.id })}>
              <span className="look-thumb" aria-hidden="true"><PreviewSite compact values={{ ...values, "theme.preset": t.id }} /></span>
              <b>{t.label}{t.id === DEFAULT_THEME && <span className="tag rec">Recommended</span>}</b>
              <span className="look-d">{t.description}{t.inspiredBy ? ` (Inspired by ${t.inspiredBy}.)` : ""}</span>
            </button>
          );
        })}
      </div>
      <p className="look-actions">
        <button type="button" className="btn ghost sm" disabled={paletteId === theme.palette && values["theme.mode"] === theme.mode} onClick={() => onChange({ "theme.palette": theme.palette, "theme.mode": theme.mode })}>
          Use the recommended palette for {theme.label}: {paletteById(theme.palette)?.label}
        </button>
      </p>

      <h3 className="look-h">Colour palette <span>({PALETTES.length} palettes + your own)</span></h3>
      <div className="pal-grid" role="radiogroup" aria-label="Colour palette">
        {PALETTES.map((p) => {
          const on = p.id === paletteId;
          const c = p.light, d = p.dark;
          return (
            <button key={p.id} type="button" role="radio" aria-checked={on} className={`pal-card ${on ? "on" : ""}`} onClick={() => onChange({ "theme.palette": p.id })} title={p.description}>
              <span className="pal-sw" aria-hidden="true">
                {[c.paper, c.brand, c.accent, c.subjects.evs, c.ink].map((x, i) => <i key={i} style={{ background: x }} />)}
                <em />{[d.paper, d.brand, d.accent].map((x, i) => <i key={`d${i}`} style={{ background: x }} />)}
              </span>
              <b>{p.label}{p.id === theme.palette && <span className="tag rec">Suits {theme.label}</span>}</b>
            </button>
          );
        })}
        <button type="button" role="radio" aria-checked={paletteId === CUSTOM_PALETTE} className={`pal-card ${paletteId === CUSTOM_PALETTE ? "on" : ""}`} onClick={() => onChange({ "theme.palette": CUSTOM_PALETTE })}>
          <span className="pal-sw" aria-hidden="true">{[values["theme.color.paper"], values["theme.color.brand"], values["theme.color.margin"], values["theme.subject.evs"], values["theme.color.ink"]].map((x, i) => <i key={i} style={{ background: String(x) }} />)}</span>
          <b>Custom</b>
        </button>
      </div>
      <p className="f-help">Each palette has a matching dark version. Choose Custom to set every colour yourself (the pickers appear below).</p>
    </section>
  );
}
