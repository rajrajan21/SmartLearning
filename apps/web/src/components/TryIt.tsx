import { useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { buzz } from "../lib/appview";

/** Plates with dots: change the groups and see a × b update at once. Plain SVG, no libraries. */
function Plates({ groups, per }: { groups: number; per: number }) {
  const cols = Math.min(groups, 5);
  return (
    <svg className="plates" viewBox={`0 0 ${cols * 64} ${Math.ceil(groups / 5) * 64}`} role="img" aria-label={`${groups} × ${per} = ${groups * per}`}>
      {Array.from({ length: groups }, (_, g) => {
        const cx = (g % 5) * 64 + 32, cy = Math.floor(g / 5) * 64 + 32;
        return (
          <g key={g} className="plate">
            <circle cx={cx} cy={cy} r="28" />
            {Array.from({ length: per }, (_, k) => { const ang = (k / per) * Math.PI * 2; const r = per === 1 ? 0 : 14; return <circle key={k} className="dot-item" cx={cx + Math.cos(ang) * r} cy={cy + Math.sin(ang) * r} r="5" />; })}
          </g>
        );
      })}
    </svg>
  );
}

function Stepper({ label, value, min, max, onChange, lessLabel, moreLabel }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; lessLabel: string; moreLabel: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <span className="small">{label}</span>
      <button type="button" className="btn ghost" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={lessLabel}>−</button>
      <b aria-live="polite">{value}</b>
      <button type="button" className="btn ghost" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={moreLabel}>+</button>
    </div>
  );
}

/** One reusable component, two uses: a puzzle with a target (target set) or a free explorer (no target). */
export function Groups({ target }: { target?: { groups: number; per: number } }) {
  const s = useSettings();
  const [groups, setGroups] = useState(target ? 1 : 3), [per, setPer] = useState(target ? 1 : 4);
  const [result, setResult] = useState<"yes" | "no" | null>(null);
  const change = (fn: () => void) => { setResult(null); fn(); };
  const check = () => { const ok = !!target && groups === target.groups && per === target.per; setResult(ok ? "yes" : "no"); if (ok && s.get("app.vibrate") === true) buzz(); };
  return (
    <div className={`tryit${result === "yes" ? " won" : ""}`}>
      {target && <p className="lead">{ui("tryMake", s.lang).replace("{a}", String(target.groups)).replace("{b}", String(target.per))}</p>}
      <Plates groups={groups} per={per} />
      <p className="eq" aria-live="polite"><b>{groups}</b> × <b>{per}</b> = <b>{groups * per}</b></p>
      <div className="steppers">
        <Stepper label={ui("tryPlates", s.lang)} value={groups} min={1} max={10} onChange={(n) => change(() => setGroups(n))} lessLabel={ui("tryLess", s.lang)} moreLabel={ui("tryMore", s.lang)} />
        <Stepper label={ui("tryPer", s.lang)} value={per} min={1} max={10} onChange={(n) => change(() => setPer(n))} lessLabel={ui("tryLessItems", s.lang)} moreLabel={ui("tryMoreItems", s.lang)} />
      </div>
      {target && <p><button type="button" className="btn" onClick={check}>{ui("tryCheck", s.lang)}</button></p>}
      {result && <p className={result === "yes" ? "try-msg yes" : "try-msg"} role="status">{result === "yes" ? `🎉 ${ui("tryYes", s.lang).replace("{a}", String(groups)).replace("{b}", String(per)).replace("{c}", String(groups * per))}` : ui("tryNo", s.lang)}</p>}
    </div>
  );
}

/** Drag a slider to step a picture through stages (water cycle). Reusable: pass your own stages. */
export interface Stage { icon: string; text: string }
export function Scrub({ title, stages }: { title: string; stages: Stage[] }) {
  const s = useSettings();
  const [i, setI] = useState(0);
  const st = stages[i]!;
  return (
    <div className="scrub">
      <h3>{title}</h3>
      <div className="scrub-scene" aria-live="polite"><span className="scrub-icon" key={i} aria-hidden="true">{st.icon}</span><p>{st.text}</p></div>
      <label className="scrub-range">{ui("scrubLabel", s.lang)} {i + 1}/{stages.length}
        <input type="range" min={0} max={stages.length - 1} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-valuetext={st.text} />
      </label>
    </div>
  );
}
export function WaterCycle() {
  const s = useSettings();
  return <Scrub title={ui("scrubTitle", s.lang)} stages={[{ icon: "☀️🌊", text: ui("wc1", s.lang) }, { icon: "☁️", text: ui("wc2", s.lang) }, { icon: "🌧️", text: ui("wc3", s.lang) }, { icon: "🏞️", text: ui("wc4", s.lang) }]} />;
}
