import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import type { Model3Lesson, Model3Step } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { store } from "../lib/storage";
import { ChalkVisual } from "./ChalkVisual";
import { LessonAssessments, type LessonTab } from "./LessonAssessments";

type LevelKey = "1" | "2";
type VoiceMode = "tanglish" | "en" | "en-ta" | "ta";
type BoardEdition = "2.0" | "3.0";

function pickCloudVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const all = window.speechSynthesis.getVoices();
  const cloud = all.filter((v) => v.localService === false && /^(en|ta)/i.test(v.lang));
  return cloud.length > 0 ? cloud : all.filter((v) => /^(en|ta)/i.test(v.lang));
}

function ChalkLab({ step, onContinue }: { step: Model3Step; onContinue: () => void }) {
  const [valA, setValA] = useState(Number(step.labParams?.defaultA ?? 7));
  const [valB, setValB] = useState(Number(step.labParams?.defaultB ?? 4));
  const [sw, setSw] = useState(true);
  const lab = step.labType || "concept-explorer";

  return (
    <div className="m3-lab-wrap">
      <div className="m3-lab-visual">
        {lab === "circle-radius-slider" && (
          <div className="m3-lab-calc">
            <svg viewBox="0 0 320 150" className="m3-lab-svg" aria-label="Interactive circle radius explorer">
              <circle cx="160" cy="75" r={Math.min(62, Math.max(18, valA * 4.5))} fill="rgba(56,189,248,0.14)" stroke="#38bdf8" strokeWidth="3" />
              <line x1="160" y1="75" x2={160 + Math.min(62, Math.max(18, valA * 4.5))} y2="75" stroke="#f472b6" strokeWidth="3" />
              <text x="160" y="18" textAnchor="middle" fill="#fde047" fontSize="13" fontWeight="700">r = {valA} · d = {valA * 2} · C ≈ {(2 * 3.14 * valA).toFixed(2)}</text>
            </svg>
            <div className="m3-lab-bar">
              <label>Radius (r): <b>{valA}</b>
                <input type="range" min={2} max={14} value={valA} onChange={(e) => setValA(Number(e.target.value))} />
              </label>
              <span>C ÷ d = <b>3.14 (π)</b></span>
            </div>
          </div>
        )}
        {lab === "area-perimeter-grid" && (
          <div className="m3-lab-calc">
            <p className="m3-chalk-green">Length = {valA} · Breadth = {valB} → Perimeter = {2 * (valA + valB)} · Area = {valA * valB} sq units</p>
            <div className="m3-lab-bar">
              <label>Length: <b>{valA}</b> <input type="range" min={2} max={12} value={valA} onChange={(e) => setValA(Number(e.target.value))} /></label>
              <label>Breadth: <b>{valB}</b> <input type="range" min={2} max={10} value={valB} onChange={(e) => setValB(Number(e.target.value))} /></label>
            </div>
          </div>
        )}
        {lab === "fraction-explorer" && (
          <div className="m3-lab-calc">
            <p className="m3-chalk-yellow">Fraction = {valA}/{valB} = {((valA / Math.max(1, valB)) * 100).toFixed(1)}%</p>
            <div className="m3-frac-bar">
              {Array.from({ length: valB }, (_, idx) => (
                <span key={idx} className={`m3-frac-cell${idx < valA ? " on" : ""}`} />
              ))}
            </div>
            <div className="m3-lab-bar">
              <label>Parts Shaded: <b>{valA}</b> <input type="range" min={1} max={valB} value={Math.min(valA, valB)} onChange={(e) => setValA(Number(e.target.value))} /></label>
              <label>Total Parts: <b>{valB}</b> <input type="range" min={2} max={10} value={valB} onChange={(e) => { const nb = Number(e.target.value); setValB(nb); if (valA > nb) setValA(nb); }} /></label>
            </div>
          </div>
        )}
        {lab === "circuit-builder" && (
          <div className="m3-lab-calc">
            <p className={sw ? "m3-chalk-green" : "m3-chalk-red"}>
              {sw ? "💡 Switch CLOSED → Complete path → Bulb GLOWS!" : "⭕ Switch OPEN → Broken path → Bulb OFF"}
            </p>
            <button type="button" className="btn" onClick={() => setSw((x) => !x)}>{sw ? "Open Switch" : "Close Switch"}</button>
          </div>
        )}
        {!["circle-radius-slider", "area-perimeter-grid", "fraction-explorer", "circuit-builder"].includes(lab) && (
          <div className="m3-lab-calc">
            <p className="m3-chalk-cyan">{step.labTitle || "Interactive Concept Explorer"} · Parameter: <b>{valA}</b> → Result: <b>{valA * valB}</b></p>
            <div className="m3-lab-bar">
              <label>Adjust Value: <b>{valA}</b> <input type="range" min={1} max={12} value={valA} onChange={(e) => setValA(Number(e.target.value))} /></label>
              <label>Multiplier: <b>{valB}</b> <input type="range" min={1} max={10} value={valB} onChange={(e) => setValB(Number(e.target.value))} /></label>
            </div>
          </div>
        )}
      </div>

      {step.autoStop !== false && (
        <div className="m3-lab-gate" role="region" aria-label="Interactive Lab Checkpoint">
          <span>🧪 Take your time exploring! {step.confirmPrompt || "Done with this Interactive Lab?"}</span>
          <div className="m3-lab-gate-btns">
            <button type="button" className="btn ghost" onClick={() => setValA((x) => (x % 10) + 2)}>Keep Exploring</button>
            <button type="button" className="btn" onClick={onContinue}>✓ Done — Continue to Next Step →</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Model3Player({
  lesson,
  topic,
  back,
  onSwitchModel1,
}: {
  lesson: Model3Lesson;
  topic?: string;
  back: string;
  onSwitchModel1: () => void;
}) {
  const s = useSettings();
  const [level, setLevel] = useState<LevelKey>("1");
  const [tab, setTab] = useState<LessonTab>("lesson");
  const [stepIdx, setStepIdx] = useState(0);
  const [beatIdx, setBeatIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [lightBoard, setLightBoard] = useState(s.get("classroom.model3.darkBoard") === false);
  const [edition, setEdition] = useState<BoardEdition>("3.0");
  const [wide, setWide] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourIdx, setTourIdx] = useState(0);
  const [speed, setSpeed] = useState(() => Number(store.get("ss_class_speed_v2")) || 0.78);
  const [speedSaved, setSpeedSaved] = useState(false);
  const stepPauseMs = s.get<number>("classroom.stepPauseMs") || 1000;
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("en");
  const [mute, setMute] = useState(false);
  const [beatProg, setBeatProg] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const steps = lesson.levels[level];
  const step = steps[stepIdx] ?? steps[0]!;

  useEffect(() => {
    const load = () => {
      const list = pickCloudVoices();
      setVoices(list);
      if (!voiceUri && list.length) {
        const pref = list.find((v) => /AvaMultilingual|Neerja|Sonia/i.test(v.name)) ?? list[0]!;
        setVoiceUri(pref.voiceURI);
      }
    };
    load();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", load);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
    }
    return undefined;
  }, [voiceUri]);

  const stopSpeech = useCallback(() => {
    runRef.current++;
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const jumpTo = useCallback((nextStep: number, nextBeat = 0, autoPlay = false) => {
    stopSpeech();
    if (nextStep >= steps.length) {
      setDone(true);
      setPlaying(false);
      return;
    }
    const clamped = Math.max(0, nextStep);
    setStepIdx(clamped);
    setBeatIdx(nextBeat);
    setBeatProg(autoPlay ? 0 : 1);
    setDone(false);
    setPlaying(autoPlay);
  }, [steps.length, stopSpeech]);

  useEffect(() => {
    const vp = viewportRef.current;
    const active = vp?.querySelector(".m3-beat.active") as HTMLElement | null;
    if (vp && active) active.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [beatIdx, stepIdx, level]);

  useEffect(() => {
    if (!playing || tab !== "lesson" || done) return;
    const curBeat = step.beats[beatIdx];
    if (!curBeat) return;
    const myRun = ++runRef.current;
    setBeatProg(0);

    const text = voiceMode === "ta" && curBeat.ta ? (curBeat.speakTa ?? curBeat.ta)
      : voiceMode === "tanglish" && curBeat.tanglish ? (curBeat.speakTanglish ?? curBeat.tanglish)
      : (curBeat.speakEn ?? curBeat.en);

    const estMs = Math.max(2600, Math.round((text.length * 88) / speed));
    const started = performance.now();
    let speechDone = mute || typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined";
    let animDone = false;
    let advanced = false;

    const tryAdvance = () => {
      if (advanced || runRef.current !== myRun) return;
      if (!speechDone || !animDone) return;
      advanced = true;
      setBeatProg(1);
      if (beatIdx + 1 < step.beats.length) {
        window.setTimeout(() => { if (runRef.current === myRun) setBeatIdx((b) => b + 1); }, 450);
      } else if (step.kind === "interactive-lab" && step.autoStop !== false) {
        setPlaying(false);
      } else if (stepIdx + 1 < steps.length) {
        window.setTimeout(() => {
          if (runRef.current === myRun) { setStepIdx((i) => i + 1); setBeatIdx(0); setBeatProg(0); }
        }, stepPauseMs);
      } else {
        window.setTimeout(() => {
          if (runRef.current === myRun) { setPlaying(false); setDone(true); }
        }, stepPauseMs);
      }
    };

    const tick = (now: number) => {
      if (runRef.current !== myRun) return;
      const p = Math.min(1, (now - started) / estMs);
      setBeatProg((prev) => Math.max(prev, p));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        animDone = true;
        tryAdvance();
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    if (!speechDone) {
      const u = new SpeechSynthesisUtterance(text);
      const pickedVoice = voices.find((v) => v.voiceURI === voiceUri);
      if (pickedVoice) u.voice = pickedVoice;
      u.lang = voiceMode === "ta" ? "ta-IN" : "en-IN";
      u.rate = speed;
      u.pitch = 1;
      u.onboundary = (ev) => {
        if (runRef.current === myRun && text.length > 0) {
          setBeatProg((prev) => Math.max(prev, Math.min(0.99, ev.charIndex / text.length)));
        }
      };
      const markSpeechDone = () => {
        if (runRef.current !== myRun) return;
        speechDone = true;
        tryAdvance();
      };
      u.onend = markSpeechDone;
      u.onerror = markSpeechDone;
      window.speechSynthesis.speak(u);
      // Safety fallback if a browser TTS engine silently drops onend
      window.setTimeout(markSpeechDone, estMs + 4000);
    }

    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [playing, tab, done, stepIdx, beatIdx, step, steps.length, speed, voiceMode, mute, voices, voiceUri, stepPauseMs]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  // Show pencil writing only for formulas, calculations, or equations; display plain explanatory lines straight away
  const visibleCues = useMemo(() => {
    const isFormulaOrCalc = (txt: string) => /[=×÷+\-−π²³]|Formula:|Step\s*\d|^\s*\d+\)/i.test(txt);
    return step.cues.map((c) => {
      const [id, fullText] = c.type;
      if (c.b < beatIdx || (!playing && beatProg >= 1)) return { id, text: fullText, done: true, color: c.color ?? "green" };
      if (c.b > beatIdx) return null;
      if (!isFormulaOrCalc(fullText)) {
        return beatProg >= Math.min(0.1, c.at) ? { id, text: fullText, done: true, color: c.color ?? "green" } : null;
      }
      if (beatProg < c.at) return null;
      const frac = Math.min(1, (beatProg - c.at) / Math.max(0.15, 1 - c.at));
      const chars = Math.max(1, Math.round(fullText.length * frac));
      return { id, text: fullText.slice(0, chars), done: chars >= fullText.length, color: c.color ?? "green" };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [step.cues, beatIdx, beatProg, playing]);

  return (
    <div className={`m3-shell${lightBoard ? " light-board" : ""}${wide ? " board-wide" : ""}`}>
      <div className="m3-topbar no-print">
        <div className="m3-top-left">
          <Link href={back} className="m3-back">← Topic</Link>
          <span className="m3-crumb">{lesson.board.toUpperCase()} Class {lesson.classLevel} · {lesson.subject}</span>
          <div className="m3-mode-switch" role="group" aria-label="Lesson teaching mode">
            <button type="button" className="m3-mode-btn" onClick={() => { stopSpeech(); onSwitchModel1(); }}>📚 Foundation</button>
            <button type="button" className={`m3-mode-btn${edition === "2.0" ? " active" : ""}`} aria-current={edition === "2.0" ? "true" : undefined} onClick={() => setEdition("2.0")}>📖 Model 2.0 · Textbook</button>
            <button type="button" className={`m3-mode-btn${edition === "3.0" ? " active" : ""}`} aria-current={edition === "3.0" ? "true" : undefined} onClick={() => setEdition("3.0")}>🎓 Model 3.0 · Khan Classroom</button>
          </div>
        </div>
        <div className="m3-level-bar" role="group" aria-label="Lesson Level">
          <button type="button" className={`m3-lvl-btn l1${level === "1" ? " active" : ""}`} onClick={() => { stopSpeech(); setLevel("1"); setStepIdx(0); setBeatIdx(0); setDone(false); setPlaying(false); }}>🟢 Level 1 · Core Concepts</button>
          <button type="button" className={`m3-lvl-btn l2${level === "2" ? " active" : ""}`} onClick={() => { stopSpeech(); setLevel("2"); setStepIdx(0); setBeatIdx(0); setDone(false); setPlaying(false); }}>🔵 Level 2 · Advanced</button>
        </div>
      </div>

      <div className="lesson-title-row no-print">
        <h1>{lesson.title}</h1>
        <nav className="lesson-tabs" aria-label="Lesson modes">
          {([
            ["lesson", "🖍️ Chalkboard"],
            ["practice", "📝 Practice"],
            ["worksheet", "📄 Worksheet"],
            ["exam", "🏆 Chapter Test"],
          ] as const).map(([id, label]) => (
            <button key={id} type="button" className={`lesson-tab${tab === id ? " active" : ""}`} onClick={() => { if (id !== "lesson") { stopSpeech(); setPlaying(false); } setTab(id); }}>{label}</button>
          ))}
        </nav>
      </div>

      {tab !== "lesson" ? (
        <LessonAssessments tab={tab} board={lesson.board} cls={lesson.classLevel} subject={lesson.subject} chapter={lesson.chapter} topic={topic ?? lesson.chapter} />
      ) : (
        <>
          <nav className="m3-phases" aria-label="Lesson steps">
            {steps.map((st, idx) => (
              <button key={st.id} type="button" className={`m3-phase-pill${idx === stepIdx ? " active" : idx < stepIdx ? " done" : ""}`} onClick={() => jumpTo(idx, 0, true)}>
                {idx < stepIdx ? "✓ " : ""}{st.pill}
              </button>
            ))}
          </nav>

          <div className="m3-stage-grid">
            <section className="m3-board-window" aria-label="Live Chalkboard">
              <div className="m3-window-bar">
                <div className="m3-win-left">
                  <span className="m3-dots"><i className="r" /><i className="y" /><i className="g" /></span>
                  <span className="m3-window-label">{step.pill}</span>
                  <span className="m3-beat-dots">{step.beats.map((_, i) => <i key={i} className={`m3-bdot${i === beatIdx ? " on" : i < beatIdx ? " past" : ""}`} />)}</span>
                </div>
                <div className="m3-win-right">
                  <button type="button" className="m3-win-btn" onClick={() => jumpTo(stepIdx, 0, true)}>↺ Replay Chalk</button>
                  <button type="button" className="m3-win-btn" onClick={() => setLightBoard((x) => !x)}>{lightBoard ? "🌙 Chalkboard" : "☀️ Light Board"}</button>
                  <button type="button" className="m3-win-btn" onClick={() => setWide((x) => !x)}>{wide ? "⊟ Restore" : "⛶ Expand"}</button>
                </div>
              </div>

              <div className="m3-board-body">
                {step.textbookBox && (
                  <div className="m3-tb-card">
                    <div className="m3-tb-head">📘 {step.textbookBox.ref}</div>
                    <div><strong>{step.textbookBox.concept}</strong>{step.textbookBox.example ? ` · Example: ${step.textbookBox.example}` : ""}</div>
                  </div>
                )}

                {done ? (
                  <div className="m3-done-hub">
                    <h2>🎉 {level === "1" ? "Level 1 Core Concepts Complete!" : "Level 2 Mastery Complete!"}</h2>
                    <p>You finished all {steps.length} chalkboard steps in {lesson.title}.</p>
                    <div className="m3-done-actions">
                      {level === "1" && <button type="button" className="btn" onClick={() => { setLevel("2"); setStepIdx(0); setBeatIdx(0); setDone(false); }}>🔵 Try Level 2 Advanced</button>}
                      <button type="button" className="btn" onClick={() => setTab("practice")}>📝 Start Practice</button>
                      <button type="button" className="btn ghost" onClick={() => setTab("exam")}>🏆 Chapter Test</button>
                      <button type="button" className="btn ghost" onClick={() => jumpTo(0, 0, true)}>↺ Replay Level</button>
                    </div>
                  </div>
                ) : (
                  <div className="m3-chalk-stage">
                    {step.visual && (
                      <ChalkVisual
                        visual={step.visual}
                        beatIdx={beatIdx}
                        beatProg={beatProg}
                        playing={playing}
                        lightBoard={lightBoard}
                      />
                    )}
                    <div className="m3-chalk-lines">
                      {visibleCues.map((c) => (
                        <div key={c.id} className={`m3-chalk-line chalk-${c.color}`}>
                          {c.text}{!c.done && <span className="m3-cursor">✎</span>}
                        </div>
                      ))}
                      {visibleCues.length === 0 && !step.visual && (
                        <div className="m3-chalk-line chalk-yellow">{step.beats[beatIdx]?.en}</div>
                      )}
                    </div>
                    {step.kind === "interactive-lab" && (
                      <ChalkLab step={step} onContinue={() => jumpTo(stepIdx + 1, 0, true)} />
                    )}
                  </div>
                )}
              </div>
            </section>

            <aside className="m3-caption-card" aria-label="Rolling Teacher Script">
              <div className="m3-caption-head">
                <span><i className={`m3-speak-dot${playing ? " live" : ""}`} /> Live Teacher Script</span>
                <span>Beat {beatIdx + 1}/{step.beats.length}</span>
              </div>
              <div className="m3-beat-viewport" ref={viewportRef}>
                {step.beats.map((b, i) => (
                  <button key={i} type="button" className={`m3-beat${i === beatIdx ? " active" : ""}`} onClick={() => jumpTo(stepIdx, i, true)}>
                    <div className="m3-beat-main">{b.en}</div>
                    {(voiceMode === "tanglish" || voiceMode === "en-ta") && b.tanglish && <div className="m3-beat-sub">{b.tanglish}</div>}
                    {voiceMode === "ta" && b.ta && <div className="m3-beat-sub">{b.ta}</div>}
                  </button>
                ))}
              </div>
              {step.tip && <div className="m3-tip">💡 {step.tip}</div>}
            </aside>
          </div>

          <div className="m3-timeline-wrap no-print">
            <div className="m3-timeline-head">
              <span>Chalkboard timeline ({edition === "3.0" ? "Khan-style live diagrams & equations" : "equations & visuals"} synced to teacher voice)</span>
              <span>Level {level} · {step.pill} ({stepIdx + 1}/{steps.length})</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, steps.length - 1)}
              value={stepIdx}
              aria-label="Chalkboard lesson timeline"
              className="m3-timeline"
              onChange={(e) => jumpTo(Number(e.target.value), 0, playing)}
            />
          </div>

          <div className="m3-controls no-print">
            <button type="button" className="btn" onClick={() => { if (playing) { stopSpeech(); setPlaying(false); } else { setDone(false); setPlaying(true); } }}>
              {playing ? "⏸ Pause" : "▶ Play"}
            </button>
            <button type="button" className="btn ghost" onClick={() => jumpTo(stepIdx, beatIdx, true)}>↺ Replay Beat</button>
            <button type="button" className="btn ghost" disabled={stepIdx === 0} onClick={() => jumpTo(stepIdx - 1, 0, playing)}>← Back</button>
            <button type="button" className="btn ghost" disabled={stepIdx + 1 >= steps.length} onClick={() => jumpTo(stepIdx + 1, 0, playing)}>Next →</button>
            <button type="button" className="btn ghost" onClick={() => jumpTo(0, 0, true)}>⟳ Restart</button>
            <label className="m3-ctrl">Speed
              <select value={String(speed)} onChange={(e) => { setSpeed(Number(e.target.value)); setSpeedSaved(false); }}>
                <option value="0.7">0.7× Very Slow</option>
                <option value="0.78">0.78× Calm Teacher</option>
                <option value="0.85">0.85× Steady</option>
                <option value="0.95">0.95× Normal</option>
                <option value="1.1">1.1× Quick</option>
                <option value="1.25">1.25× Faster</option>
              </select>
            </label>
            <button type="button" className="btn ghost" onClick={() => { store.set("ss_class_speed_v2", String(speed)); setSpeedSaved(true); }}>
              {speedSaved ? "✓ Saved default" : "Set as default"}
            </button>
            <label className="m3-ctrl">Mode
              <select value={voiceMode} onChange={(e) => setVoiceMode(e.target.value as VoiceMode)}>
                <option value="en">English Only</option>
                <option value="tanglish">Chennai Classroom (Tanglish)</option>
                <option value="en-ta">English + Tamil</option>
                <option value="ta">Tamil Only</option>
              </select>
            </label>
            {voices.length > 0 && (
              <label className="m3-ctrl">Teacher
                <select value={voiceUri} onChange={(e) => { stopSpeech(); setVoiceUri(e.target.value); }}>
                  {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
                </select>
              </label>
            )}
            <button type="button" className="btn ghost" onClick={() => { stopSpeech(); setMute((m) => !m); }}>{mute ? "🔇 Voice Off" : "🔊 Voice On"}</button>
            <button type="button" className="btn ghost m3-help-fab" title="Lesson Help Tour" onClick={() => { setShowTour((x) => !x); setTourIdx(0); }}>?</button>
          </div>
          {showTour && (
            <div className="m3-tour-pop no-print" role="dialog" aria-label="Classroom Quick Tour">
              <strong>
                {tourIdx === 0 && "1/4 · Step Pills & Timeline: Jump directly to any concept, worked example, or interactive lab."}
                {tourIdx === 1 && "2/4 · Dark & Light Board: Switch between Chalkboard and Light Board anytime using the top-right board button."}
                {tourIdx === 2 && "3/4 · Calm Pace & Sync: Default is 0.78× Calm Teacher. Adjust speed and click 'Set as default' to save."}
                {tourIdx === 3 && "4/4 · Level 1 & Level 2: Master Core Concepts in Level 1, then switch to Level 2 Advanced + Practice & Chapter Test."}
              </strong>
              <div className="m3-tour-actions">
                <button type="button" className="btn ghost" onClick={() => setTourIdx((i) => Math.max(0, i - 1))} disabled={tourIdx === 0}>Previous</button>
                <button type="button" className="btn ghost" onClick={() => tourIdx < 3 ? setTourIdx((i) => i + 1) : setShowTour(false)}>{tourIdx < 3 ? "Next →" : "Done"}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
