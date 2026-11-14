import { useId } from "react";
import { contrastRatio, type SettingDef, type SettingValue } from "@studysmart/shared";

interface Props {
  def: SettingDef;
  value: SettingValue;
  values: Record<string, SettingValue>;
  changed: boolean;
  disabled: boolean;
  onChange: (v: SettingValue) => void;
  onReset: () => void;
}

export function Field({ def, value, values, changed, disabled, onChange, onReset }: Props) {
  const id = useId();
  const planned = def.availability === "planned";
  const off = disabled || planned;
  const label = (
    <label htmlFor={id} className="f-label">
      {def.label}
      {planned && <span className="tag">Coming later</span>}
      {changed && <span className="tag dot">Edited</span>}
    </label>
  );
  const help = def.help ? <p className="f-help" id={`${id}-h`}>{def.help}</p> : null;
  const described = def.help ? `${id}-h` : undefined;
  let control;
  switch (def.type) {
    case "boolean":
      return (
        <div className={`field row ${off ? "is-off" : ""}`}>
          <div>{label}{help}</div>
          <button id={id} type="button" role="switch" aria-checked={value === true} aria-describedby={described} disabled={off} className="switch" onClick={() => onChange(!(value === true))}>
            <span className="knob" /><span className="sr">{value === true ? "On" : "Off"}</span>
          </button>
          <Reset show={changed} onReset={onReset} />
        </div>
      );
    case "number":
      control = (
        <div className="num-in">
          <input type="range" min={def.min} max={def.max} step={def.step ?? 1} value={Number(value)} disabled={off} onChange={(e) => onChange(Number(e.target.value))} aria-label={def.label} />
          <input id={id} type="number" min={def.min} max={def.max} step={def.step ?? 1} value={Number(value)} disabled={off} aria-describedby={described} onChange={(e) => onChange(Number(e.target.value))} />
          {def.unit && <span className="unit">{def.unit}</span>}
        </div>
      );
      break;
    case "select":
      control = (
        <select id={id} value={String(value)} disabled={off} aria-describedby={described} onChange={(e) => onChange(e.target.value)}>
          {def.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case "color": {
      const hex = String(value);
      const against = def.contrastAgainst ? String(values[def.contrastAgainst] ?? "") : "";
      const ratio = /^#[0-9a-f]{6}$/i.test(hex) && /^#[0-9a-f]{6}$/i.test(against) ? contrastRatio(hex, against) : null;
      control = (
        <div className="color-in">
          <input id={id} type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000"} disabled={off} aria-describedby={described} onChange={(e) => onChange(e.target.value.toUpperCase())} />
          <input type="text" className="hex" value={hex} disabled={off} maxLength={7} aria-label={`${def.label} hex code`} onChange={(e) => onChange(e.target.value.toUpperCase())} />
          {ratio !== null && (
            <span className={`ratio ${ratio >= 4.5 ? "good" : "bad"}`} role="status">
              {ratio >= 4.5 ? `Easy to read (${ratio.toFixed(1)}:1)` : `Hard to read (${ratio.toFixed(1)}:1). Aim for 4.5 or more.`}
            </span>
          )}
        </div>
      );
      break;
    }
    case "text":
      control = <input id={id} type="text" value={String(value)} maxLength={def.maxLength} disabled={off} aria-describedby={described} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "localized": {
      const v = value as { en: string; ta?: string };
      const Tag = def.multiline ? "textarea" : "input";
      control = (
        <div className="loc">
          <label className="loc-l"><span>English</span><Tag id={id} value={v.en} maxLength={def.maxLength} disabled={off} rows={2} onChange={(e) => onChange({ ...v, en: e.target.value })} /></label>
          <label className="loc-l"><span>தமிழ் (Tamil)</span><Tag lang="ta" value={v.ta ?? ""} maxLength={def.maxLength} disabled={off} rows={2} onChange={(e) => onChange({ ...v, ta: e.target.value })} /></label>
          <p className="f-help">{v.en.length}/{def.maxLength} characters</p>
        </div>
      );
      break;
    }
    case "numberlist": {
      const list = value as number[];
      control = (
        <div className="checks" role="group" aria-label={def.label}>
          {def.options.map((n) => (
            <label key={n} className={`pill ${list.includes(n) ? "on" : ""}`}>
              <input type="checkbox" checked={list.includes(n)} disabled={off} onChange={(e) => onChange(e.target.checked ? [...list, n].sort((a, b) => a - b) : list.filter((x) => x !== n))} />
              <span>{n}</span>
            </label>
          ))}
        </div>
      );
      break;
    }
  }
  return (
    <div className={`field ${off ? "is-off" : ""}`}>
      <div className="f-head">{label}<Reset show={changed} onReset={onReset} /></div>
      {help}
      {control}
    </div>
  );
}

function Reset({ show, onReset }: { show: boolean; onReset: () => void }) {
  return show ? <button type="button" className="link" onClick={onReset}>Undo</button> : <span />;
}
