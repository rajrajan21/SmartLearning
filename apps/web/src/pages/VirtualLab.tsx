import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { useSettings } from "../lib/settings";
import { NotFound } from "../components/bits";
import { LabScene } from "./virtualLabScene";
import { labs, narration, nominalPh, transformer, type LabId, type VoiceCue } from "./virtualLabData";
import "./virtualLab.css";

const label = (ta: boolean) => ta ? "மெய்நிகர் ஆய்வகம்" : "Virtual Lab";
const track = (cue: VoiceCue) => "/lab-audio/" + cue + ".mp3";
const guideKey = (id: LabId) => "ss-lab-guide-" + id;
const seen = (id: LabId) => { try { return localStorage.getItem(guideKey(id)) === "seen"; } catch { return false; } };
const recordSeen = (id: LabId) => { try { localStorage.setItem(guideKey(id), "seen"); } catch { /* storage off */ } };

export function VirtualLabHub() {
  const s = useSettings();
  const [filter, setFilter] = useState("all");
  if (s.get("feature.virtualLab") !== true) return <NotFound />;
  return <div className="paper vl">
    <header className="vl-hero">
      <h1>{label(s.lang === "ta")}</h1>
      <p>Change one thing at a time, watch what happens, and test your prediction.</p>
    </header>
    <label className="vl-filter">Show labs
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">All labs</option><option value="physics">Physics</option><option value="chemistry">Chemistry</option>
      </select>
    </label>
    <div className="vl-cards">
      {labs.filter(lab => filter === "all" || lab.subject === filter).map(lab => (
        <Link className="vl-card" href={"/virtual-lab/" + lab.id} key={lab.id}>
          <LabScene kind={lab.id} preview />
          <div><span className="vl-meta">{lab.subject} · {lab.level}</span><h2>{lab.title}</h2><p>{lab.description}</p><b>Open lab <span aria-hidden="true">→</span></b></div>
        </Link>
      ))}
    </div>
  </div>;
}

export function VirtualLabPage() {
  const s = useSettings();
  const { id } = useParams<{ id: string }>();
  const lab = labs.find(item => item.id === id);
  if (s.get("feature.virtualLab") !== true || !lab) return <NotFound />;
  return <Experiment key={lab.id} lab={lab} back={label(s.lang === "ta")} />;
}

function Experiment({ lab, back }: { lab: typeof labs[number]; back: string }) {
  const [step, setStep] = useState(seen(lab.id) ? -1 : 0);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [activeCue, setActiveCue] = useState<VoiceCue | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const audioRequest = useRef(0);
  const stop = () => { audioRequest.current++; audio.current?.pause(); setPlaying(false); setActiveCue(null); };
  const play = async (cue: VoiceCue) => {
    const player = audio.current;
    if (!player) return;
    if (playing && activeCue === cue) { stop(); return; }
    const request = ++audioRequest.current;
    player.pause();
    setAudioError(false);
    setActiveCue(cue);
    player.src = track(cue);
    try { await player.play(); if (request === audioRequest.current) setPlaying(true); }
    catch { if (request === audioRequest.current) { setAudioError(true); setPlaying(false); } }
  };
  const close = () => { stop(); recordSeen(lab.id); setStep(-1); };
  const guide = lab.guides[step];
  useEffect(() => {
    const player = audio.current;
    return () => { audioRequest.current++; player?.pause(); };
  }, []);
  return <div className="paper vl">
    <header className="vl-title">
      <div><Link href="/virtual-lab">← {back}</Link><h1>{lab.title}</h1><p>{lab.level} · {lab.description}</p></div>
      <button className="btn ghost" type="button" onClick={() => { stop(); setStep(0); }}>How to use</button>
    </header>
    <audio ref={audio} preload="none" onEnded={() => setPlaying(false)} onError={() => { setPlaying(false); setAudioError(true); }} />
    {lab.id === "transformer" ? <Transformer onVoice={play} active={playing ? activeCue : null} /> : <Chemistry onVoice={play} active={playing ? activeCue : null} />}
    {audioError && <p role="status">Audio is unavailable. The guide text is shown on this page.</p>}
    {guide && <aside className="vl-guide" aria-label="Lab walkthrough">
      <div><b>{guide.title}</b><button className="btn ghost" type="button" onClick={close} aria-label="Dismiss walkthrough">×</button></div>
      <p>{narration[guide.cue]}</p>
      <div className="vl-guide-actions"><button className="btn ghost" type="button" onClick={() => void play(guide.cue)}>{playing && activeCue === guide.cue ? "Stop audio" : "Listen"}</button>
        <span>{step + 1} / {lab.guides.length}</span>
        <button className="btn" type="button" onClick={() => { if (step + 1 === lab.guides.length) close(); else { stop(); setStep(step + 1); } }}>{step + 1 === lab.guides.length ? "Start exploring" : "Next tip"}</button>
      </div>
    </aside>}
  </div>;
}

type CoachProps = { onVoice: (cue: VoiceCue) => void; active: VoiceCue | null };
function Coach({ cue, active, onVoice }: CoachProps & { cue: VoiceCue }) {
  return <div className="vl-coach"><div><b>What happened?</b><p aria-live="polite">{narration[cue]}</p></div>
    <button className="btn ghost" type="button" onClick={() => onVoice(cue)}>{active === cue ? "Stop audio" : "Listen to result"}</button>
  </div>;
}
const goals = [
  { text: "Set the output to 5 V", check: (v: number, ac: boolean) => ac && v === 5 },
  { text: "Set the output to 20 V", check: (v: number, ac: boolean) => ac && v === 20 },
  { text: "Switch to steady DC", check: (_v: number, ac: boolean) => !ac },
];
function Transformer(props: CoachProps) {
  const [ac, setAc] = useState(true);
  const [input, setInput] = useState(10);
  const [primary, setPrimary] = useState(4);
  const [secondary, setSecondary] = useState(4);
  const [goal, setGoal] = useState(0);
  const [pause, setPause] = useState(false);
  const volts = transformer(ac, input, primary, secondary);
  const cue = !ac ? "tx-dc" : primary === secondary ? "tx-equal" : secondary > primary ? "tx-up" : "tx-down";
  return <>
    <div className="vl-workbench">
      <section className="vl-stage" aria-label="Transformer simulation">
        <div className="vl-meter"><span>Input <b>{input} V {ac ? "AC" : "DC"}</b></span><span>Output <b>{volts.toFixed(1)} V {ac ? "AC" : ""}</b></span></div>
        <LabScene kind="transformer" ac={ac} primary={primary} secondary={secondary} volts={volts} input={input} paused={pause} />
        <button type="button" className="btn ghost vl-motion" onClick={() => setPause(!pause)}>{pause ? "Resume animation" : "Pause animation"}</button>
      </section>
      <section className="vl-controls" aria-label="Transformer controls">
        <fieldset><legend>Power supply</legend>
          <label><input type="radio" name="power" checked={ac} onChange={() => setAc(true)} /> Alternating current (AC)</label>
          <label><input type="radio" name="power" checked={!ac} onChange={() => setAc(false)} /> Steady direct current (DC)</label>
        </fieldset>
        <Range label="Input voltage" value={input} set={setInput} min={2} max={20} unit=" V" />
        <Range label="Primary coil turns" value={primary} set={setPrimary} min={2} max={12} />
        <Range label="Secondary coil turns" value={secondary} set={setSecondary} min={2} max={12} />
        <label>Choose a challenge<select value={goal} onChange={e => setGoal(Number(e.target.value))}>{goals.map((item, i) => <option key={item.text} value={i}>{item.text}</option>)}</select></label>
        <p role="status">{goals[goal]!.check(volts, ac) ? "✓ Challenge complete" : "Try adjusting the controls."}</p>
        <button type="button" className="btn ghost" onClick={() => { setAc(true); setInput(10); setPrimary(4); setSecondary(4); setGoal(0); setPause(false); }}>Reset</button>
      </section>
    </div>
    <Coach {...props} cue={cue} />
    <details className="vl-details"><summary>The formula and its limits</summary><p>For an ideal transformer with an AC input, V₂ / V₁ = N₂ / N₁. The coils are separate circuits. A changing magnetic field links them. A step-up transformer raises voltage and lowers available current for the same power. This simulation ignores losses, load effects, and the brief pulse when DC is switched.</p></details>
  </>;
}
const samples = [
  { name: "Lemon juice", ph: 2, color: "#f88670" }, { name: "Water", ph: 7, color: "#56d8a9" }, { name: "Soap solution", ph: 10, color: "#a69aff" },
];
function Chemistry(props: CoachProps) {
  const [sample, setSample] = useState(0);
  const [dilution, setDilution] = useState(0);
  const [indicator, setIndicator] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tested, setTested] = useState<number[]>([]);
  const item = samples[sample]!;
  const ph = nominalPh(item.ph, dilution);
  const cue = sample === 0 ? "ph-acid" : sample === 1 ? "ph-neutral" : "ph-base";
  const tilt = dilution ? Math.min(0.2, dilution / 350) : 0;
  return <>
    <div className="vl-workbench">
      <section className="vl-stage" aria-label="Indicator simulation">
        <div className="vl-meter"><span>{item.name}</span><span>{indicator ? "Model pH " + ph.toFixed(1) : "Indicator off"}</span></div>
        <LabScene kind="indicator" color={indicator ? item.color : "#73cbef"} tilt={tilt} paused={paused} />
        <button type="button" className="btn ghost vl-motion" onClick={() => setPaused(!paused)}>{paused ? "Resume animation" : "Pause animation"}</button>
      </section>
      <section className="vl-controls" aria-label="Indicator controls">
        <label>Virtual sample<select value={sample} onChange={e => { setSample(Number(e.target.value)); setDilution(0); setIndicator(false); }}>{samples.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}</select></label>
        <Range label="Dilution" value={dilution} set={setDilution} min={0} max={90} unit="%" />
        <button className="btn" type="button" aria-pressed={indicator} onClick={() => { if (!indicator) setTested(Array.from(new Set([...tested, sample]))); setIndicator(!indicator); }}>{indicator ? "Remove indicator" : "Add indicator"}</button>
        <p role="status">{tested.length === 3 ? "✓ You tested an acid, a neutral sample, and a base." : "Compare all three samples · " + tested.length + " of 3"}</p>
        <button className="btn ghost" type="button" onClick={() => { setSample(0); setDilution(0); setIndicator(false); setTested([]); setPaused(false); }}>Reset</button>
      </section>
    </div>
    {indicator ? <Coach {...props} cue={cue} /> : <p className="vl-coach">Predict the result, then add the indicator to see it.</p>}
    <details className="vl-details"><summary>How to interpret the reading</summary><p>At room temperature, pH below 7 is acidic, 7 is neutral, and above 7 is basic. This simplified model uses representative starting values. Real pH varies with concentration, temperature and buffering. The indicator colours are schematic.</p></details>
  </>;
}
function Range({ label, value, set, min, max, unit = "" }: { label: string; value: number; set: (v: number) => void; min: number; max: number; unit?: string }) {
  return <label className="vl-range"><span>{label} <output>{value}{unit}</output></span><input type="range" aria-label={label} min={min} max={max} value={value} onInput={e => set(Number(e.currentTarget.value))} /></label>;
}
