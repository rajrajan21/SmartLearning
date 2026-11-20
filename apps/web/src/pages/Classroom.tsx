import { ReportProblem } from "../components/ReportProblem";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { estimateDurationMs, sceneAt, type PublicClassroom, type VoiceInfo } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { visualsPolicy, withoutGeneratedSteps, withoutVisualSteps } from "../lib/visuals";
import { ui } from "../lib/i18n";
import { useRetry } from "../lib/curriculum";
import { useClassroom, useClassroomIndex } from "../lib/classroom";
import { usePhrases } from "../lib/practice";
import { ClassBoard, type BoardStyle } from "../components/ClassBoard";
import { store } from "../lib/storage";
import { toggleNote, useNotebook } from "../lib/tier2";
import { ErrorBox, Loading, NotFound } from "../components/bits";

type Phase = "idle" | "playing" | "paused" | "gap" | "check" | "feedback" | "done";
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

export function ClassroomHub() {
  const s = useSettings();
  const on = s.get("feature.classroom") === true;
  const [attempt, retry] = useRetry();
  const idx = useClassroomIndex(on, attempt);
  if (!on) return <NotFound />;
  if (idx.status === "loading") return <Loading />;
  if (idx.status === "error") return <ErrorBox onRetry={retry} />;
  return (
    <div className="paper">
      <h1>{ui("classroomTitle", s.lang)}</h1>
      <p className="lead">{ui("classroomIntro", s.lang)}</p>
      {idx.data.items.length === 0 ? <p>{ui("classroomNone", s.lang)}</p> : (
        <ul className="class-list">
          {idx.data.items.map((i) => (
            <li key={`${i.subject}/${i.chapter}/${i.topic}`}>
              <Link className="class-card" href={`/classroom/${i.board.toLowerCase()}/${i.classLevel}/${i.subject}/${i.chapter}/${i.topic}`}>
                <b>{s.name(i.title)}</b>
                <span>{ui("classWord", s.lang)} {i.classLevel} · {i.subject} · {i.steps} {ui("classroomSteps", s.lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ClassroomPage() {
  const s = useSettings();
  const { board = "", cls = "", subject = "", chapter = "", topic = "" } = useParams<{ board: string; cls: string; subject: string; chapter: string; topic: string }>();
  const on = s.get("feature.classroom") === true;
  const [attempt, retry] = useRetry();
  const idx = useClassroomIndex(on);
  const voices = idx.status === "ready" ? idx.data.voices : [];
  const [voice, setVoice] = useState(() => store.get("ss_class_voice") ?? "");
  const chosen = voices.some((v) => v.id === voice && v.ready) ? voice : "";
  const st = useClassroom(board, cls, subject, chapter, topic, on && idx.status !== "loading", attempt, chosen);
  if (!on) return <NotFound />;
  if (st.status === "loading") return <Loading />;
  if (st.status === "error") return <ErrorBox onRetry={retry} />;
  if (!st.data) return <NotFound />;
  return <Player lesson={st.data} voices={voices} voice={chosen} onVoice={(v) => { setVoice(v); store.set("ss_class_voice", v); }} back={`/${board}/${cls}/${subject}/${chapter}/${topic}`} />;
}

function Player({ lesson: lessonIn, back, voices, voice, onVoice }: { lesson: PublicClassroom; back: string; voices: VoiceInfo[]; voice: string; onVoice: (v: string) => void }) {
  const s = useSettings();
  const { lang } = s;
  const L = (k: Parameters<typeof ui>[0]) => ui(k, lang);
  const vp = visualsPolicy(s, lessonIn, reduced());
  const lesson = useMemo(() => (vp.animations ? (vp.generated ? lessonIn : withoutGeneratedSteps(lessonIn)) : withoutVisualSteps(lessonIn)), [lessonIn, vp.animations, vp.generated]);
  const autoAdvance = s.get("classroom.autoAdvance") === true, pauseMs = s.get<number>("classroom.stepPauseMs");
  const captions = s.get("classroom.showCaptions") === true, show3d = s.get("classroom.show3d") === true;
  const style = s.get<string>("classroom.boardStyle") as BoardStyle, browserVoice = s.get("classroom.browserVoice") === true;
  const instant = useMemo(reduced, []);

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [t, setT] = useState(0);
  const [rate, setRate] = useState(Number(s.get<string>("classroom.speed")) || 1);
  const [mute, setMute] = useState(false);
  const [yaw, setYaw] = useState(0);
  const [clock, setClock] = useState(0);
  const [wordIdx, setWordIdx] = useState(-1);
  const [picked, setPicked] = useState<string | null>(null);
  const phrases = usePhrases(true);
  const [wrongNote, setWrongNote] = useState<string | null>(null);
  const [both, setBoth] = useState(s.get<string>("classroom.language") === "both");
  const [talking, setTalking] = useState(false);
  const bothRef = useRef(both); bothRef.current = both;
  const info = voices.find((v) => v.id === (lessonIn.voiceUsed ?? voice));
  const pickable = s.get("classroom.voicePicker.onlyRecorded") !== false && lessonIn.voicesReady ? voices.filter((v) => lessonIn.voicesReady!.includes(v.id)) : voices;

  const cur = lesson.steps[step]!;
  const text = cur.narration[lang] ?? cur.narration.en;
  const rec = mute ? undefined : cur.audio?.[lang] ?? (lang !== "en" ? undefined : cur.audio?.en);
  const durMs = rec ? rec.durationMs : estimateDurationMs(cur.narration.en) / rate;
  const words = rec?.words;

  // refs so the animation loop never sees stale values
  const R = useRef({ phase, step, rate, mute, durMs, rec, lesson, autoAdvance, pauseMs, browserVoice });
  R.current = { phase, step, rate, mute, durMs, rec, lesson, autoAdvance, pauseMs, browserVoice };
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const tRef = useRef(0);
  const run = useRef(0);
  const speechDone = useRef(true);
  const bound = useRef<{ t: number; at: number } | null>(null); // where the device voice has reached (word boundaries)
  const pre = useRef(new Map<string, HTMLAudioElement>()); // recordings of the next steps, loaded before they are needed
  const timer = useRef<number | null>(null);

  const stopVoice = useCallback(() => {
    if (audioEl.current) { audioEl.current.pause(); audioEl.current.onended = null; audioEl.current = null; }
    if (hasSpeech()) speechSynthesis.cancel();
    speechDone.current = true;
  }, []);
  const clearTimer = () => { if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; } };

  /** plays a recording, or the device voice when allowed and there is no recording */
  const say = useCallback((ref: { url: string } | undefined, fallbackText: string | undefined, onEnd?: () => void) => {
    const { mute: m, rate: r, browserVoice: bv } = R.current;
    const end = () => { setTalking(false); onEnd?.(); };
    if (m) { end(); return; }
    if (ref) { const a = new Audio(ref.url); a.playbackRate = r; a.onended = end; a.onerror = end; audioEl.current = a; setTalking(true); void a.play().catch(end); return; }
    if (bv && hasSpeech() && fallbackText) { const u = new SpeechSynthesisUtterance(fallbackText); u.lang = "en-IN"; u.rate = r; u.onend = end; u.onerror = end; setTalking(true); speechSynthesis.speak(u); return; }
    end();
  }, []);

  const begin = useCallback((i: number) => {
    run.current++; stopVoice(); clearTimer();
    const stp = R.current.lesson.steps[i]!;
    tRef.current = 0; setT(0); setStep(i); setPicked(null); setWrongNote(null); setWordIdx(-1); setPhase("playing");
    const rr = R.current.mute ? undefined : stp.audio?.[lang] ?? stp.audio?.en;
    speechDone.current = !(!rr && R.current.browserVoice && hasSpeech() && !R.current.mute);
    const id = run.current;
    bound.current = null;
    if (rr) { const a = pre.current.get(rr.url) ?? new Audio(rr.url); try { a.currentTime = 0; } catch { /* not loaded yet */ } a.playbackRate = R.current.rate; audioEl.current = a; void a.play().catch(() => { /* blocked: the virtual clock still runs */ }); }
    else if (!speechDone.current) {
      const u = new SpeechSynthesisUtterance(stp.narration.en); u.lang = "en-IN"; u.rate = R.current.rate;
      const total = stp.narration.en.length, dur = estimateDurationMs(stp.narration.en) / R.current.rate;
      u.onboundary = (e) => { if (run.current === id) bound.current = { t: (e.charIndex / Math.max(1, total)) * dur, at: performance.now() }; };
      u.onend = () => { if (run.current === id) speechDone.current = true; }; u.onerror = u.onend; speechSynthesis.speak(u);
    }
    // load the recordings of the next steps now, so there is no wait between scenes
    for (let n = i + 1; n <= i + 2 && n < R.current.lesson.steps.length; n++) {
      const nx = R.current.lesson.steps[n]!, ref = nx.audio?.[lang] ?? nx.audio?.en;
      if (ref && !pre.current.has(ref.url)) { const pa = new Audio(); pa.preload = "auto"; pa.src = ref.url; pre.current.set(ref.url, pa); }
    }
  }, [lang, stopVoice]);

  const afterNarration = useCallback(() => {
    const { lesson: ls, step: i } = R.current, stp = ls.steps[i]!;
    if (stp.check) { setPhase("check"); say(stp.checkAudio?.stem?.[lang] ?? stp.checkAudio?.stem?.en, stp.check.stem.en); return; }
    if (i + 1 >= ls.steps.length) { setPhase("done"); return; }
    if (!R.current.autoAdvance || (!vp.autoplay && ls.steps[i + 1]?.id.startsWith("v-") && !stp.id.startsWith("v-"))) { setPhase("paused"); return; }
    setPhase("gap");
    const id = run.current;
    timer.current = window.setTimeout(() => { if (run.current === id) begin(i + 1); }, R.current.pauseMs);
  }, [begin, lang, say]);
  const finishStep = useCallback(() => {
    const stp = R.current.lesson.steps[R.current.step]!, ta = stp.audio?.ta;
    if (bothRef.current && ta && !R.current.mute) { setPhase("gap"); const id = run.current; say(ta, undefined, () => { if (run.current === id) afterNarration(); }); return; }
    afterNarration();
  }, [afterNarration, say]);

  // the clock: audio position when a recording plays, otherwise a virtual clock
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = now - last; last = now;
      const a = audioEl.current, r = R.current;
      let ms: number;
      if (a && r.rec) ms = a.currentTime * 1000;
      else if (!speechDone.current && bound.current) ms = Math.max(tRef.current, bound.current.t + Math.min(now - bound.current.at, 320));
      else if (!speechDone.current && R.current.browserVoice && tRef.current < 1) ms = tRef.current; // the device voice has not started yet
      else { tRef.current += dt * r.rate; ms = tRef.current; }
      tRef.current = ms; setT(ms); setClock((c) => c + dt / 1000);
      if (a && r.rec) { const w = r.rec.words; let k = -1; for (let n = 0; n < w.length; n++) if (w[n]!.t <= ms) k = n; setWordIdx(k); }
      else if (!speechDone.current && ms > r.durMs * 2.5) speechDone.current = true;
      const over = a && r.rec ? a.ended || ms >= r.durMs + 50 : speechDone.current && (bound.current !== null || ms >= r.durMs);
      if (over) { setT(r.durMs); finishStep(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, step, finishStep]);

  useEffect(() => () => { run.current++; stopVoice(); clearTimer(); }, [stopVoice]);

  const play = () => {
    if (phase === "idle" || phase === "done") { begin(0); return; }
    if (phase === "paused") {
      if (tRef.current >= durMs - 30) { if (step + 1 < lesson.steps.length) begin(step + 1); else setPhase("done"); return; }
      setPhase("playing"); void audioEl.current?.play().catch(() => {}); if (hasSpeech()) speechSynthesis.resume(); return;
    }
  };
  const pause = () => { if (phase !== "playing") return; audioEl.current?.pause(); if (hasSpeech()) speechSynthesis.pause(); setPhase("paused"); };
  const go = (i: number) => begin(Math.max(0, Math.min(lesson.steps.length - 1, i)));
  const toggleMute = () => { const m = !mute; setMute(m); if (m) stopVoice(); };

  const choose = (id: string) => {
    if (!cur.check || phase !== "check") return;
    const o = cur.check.options.find((x) => x.id === id)!;
    stopVoice(); setPicked(id);
    const pick = (list: typeof phrases.praise) => (list && list.length ? list[Math.floor(Math.random() * list.length)] : undefined);
    const sayPhrase = (ph: ReturnType<typeof pick>, then: () => void) => { if (!ph) return then(); say(ph.audio?.[lang] ?? ph.audio?.en, s.name(ph.text), then); };
    if (o.correct) { setPhase("feedback"); setWrongNote(null); sayPhrase(pick(phrases.praise), () => say(cur.checkAudio?.explanation?.[lang] ?? cur.checkAudio?.explanation?.en, cur.check!.explanation.en)); }
    else { setWrongNote(s.name(o.whyWrong ?? { en: "" })); sayPhrase(pick(phrases.tryAgain), () => say(undefined, o.whyWrong?.en)); }
  };
  const proceed = () => { stopVoice(); if (step + 1 >= lesson.steps.length) setPhase("done"); else begin(step + 1); };

  useEffect(() => { // keyboard: space plays or pauses
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("button, select, input, textarea, a")) return;
      if (e.key === " ") { e.preventDefault(); if (R.current.phase === "playing") pause(); else play(); }
      if (e.key === "ArrowRight") go(R.current.step + 1);
      if (e.key === "ArrowLeft") go(R.current.step - 1);
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });

  const shownT = phase === "idle" ? 0 : Math.min(t, durMs);
  const scene = useMemo(() => sceneAt(lesson, step, phase === "idle" ? 0 : shownT, { durMs, words, instant, lang: "en" }), [lesson, step, shownT, durMs, words, instant, phase]);
  const tokens = text.split(/\s+/);
  const wordsMatch = !!words && words.length === tokens.length;
  const playing = phase === "playing", started = phase !== "idle";
  const speaking = (playing && !mute) || talking;
  const sections = lesson.steps.reduce<{ name: string; first: number }[]>((acc, st, i) => { const n = st.section ?? ""; if (n && acc[acc.length - 1]?.name !== n) acc.push({ name: n, first: i }); return acc; }, []);
  const curSection = lesson.steps[step]?.section;
  const notes = useNotebook(), noteOn = s.get("notebook.enabled") === true;
  const noteId = ("cr:" + back.replace(/^\//, "").replace(/\//g, "-")).slice(0, 60), noteSaved = !!notes[noteId], subjectSlug = back.split("/")[3] ?? "";
  const resume = s.get("classroom.resume") === true, saveKey = `ss.class.${lesson.title.en}`;
  const [seen, setSeen] = useState<{ last: number; done: string[] }>(() => { try { return JSON.parse(localStorage.getItem(saveKey) ?? "") as { last: number; done: string[] }; } catch { return { last: 0, done: [] }; } });
  useEffect(() => {
    if (!resume || !started) return;
    const idx = sections.findIndex((x) => x.name === curSection);
    const done = [...seen.done]; const prev = idx > 0 ? sections[idx - 1]!.name : ""; if (prev && !done.includes(prev)) done.push(prev);
    if (done.length === seen.done.length && seen.last === step) return;
    const next = { last: step, done }; setSeen(next); try { localStorage.setItem(saveKey, JSON.stringify(next)); } catch { /* storage may be blocked */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, resume, started]);
  const nextPart = sections.find((x) => x.first > step);
  const savedSection = lesson.steps[seen.last]?.section;

  return (
    <div className="paper classroom">
      <p className="small"><Link href={back}>← {L("backToTopic")}</Link>{noteOn && <> <button type="button" className="link heart" aria-pressed={noteSaved} onClick={() => toggleNote({ id: noteId, href: `/classroom${back}`, title: lesson.title, subject: { en: subjectSlug.replace(/-/g, " ") } })}><span aria-hidden="true">{noteSaved ? "❤️" : "🤍"}</span> {noteSaved ? L("nbSaved") : L("nbSave")}</button></>}</p>
      <h1>{s.name(lesson.title)}</h1>
      {sections.length > 1 && (
        <nav className="class-rail" aria-label={L("classroomParts")}>
          {sections.map((x) => <button type="button" key={x.first} className={x.name === curSection ? "on" : undefined} aria-current={x.name === curSection ? "step" : undefined} onClick={() => go(x.first)}>{resume && seen.done.includes(x.name) ? "✓ " : ""}{x.name}</button>)}
          {resume && nextPart && started && <button type="button" className="next-part" onClick={() => go(nextPart.first)}>{L("classroomNextPart")}</button>}
        </nav>
      )}
      {resume && !started && seen.last > 0 && savedSection && <p><button type="button" className="btn" onClick={() => go(seen.last)}>{L("classroomResumeAt")}{savedSection}</button></p>}
      <div className={`class-room${cur.check && (phase === "check" || phase === "feedback") ? " has-check" : ""}`}>
        {cur.check && (phase === "check" || phase === "feedback") && (
        <section className="class-check" aria-label={L("classroomQuestion")}>
          <h2>{L("classroomQuestion")}</h2>
          <p><b>{s.name(cur.check.stem)}</b></p>
          <ul className="options">
            {cur.check.options.map((o) => {
              const right = phase === "feedback" && o.correct, bad = picked === o.id && !o.correct;
              return <li key={o.id}><button type="button" className={`option${right ? " right" : ""}${bad ? " wrong" : ""}`} disabled={phase === "feedback"} onClick={() => choose(o.id)}>{s.name(o.text)}</button></li>;
            })}
          </ul>
          {wrongNote && <p className="notice" role="alert">{L("classroomTryAgain")} {wrongNote}</p>}
          {phase === "feedback" && (<div role="status"><p className="good"><b>{L("classroomCorrect")}</b> {s.name(cur.check.explanation)}</p>
            <button type="button" className="btn" onClick={proceed}>{step + 1 >= lesson.steps.length ? L("finish") : L("classroomContinue")}</button></div>)}
        </section>
      )}

        <div className="class-stage">
          <ClassBoard quiet={!!cur.check && (phase === "check" || phase === "feedback")} objects={lesson.objects} scene={scene} style={style} show3d={show3d} clock={vp.motion ? clock * vp.speed : 2} visuals={{ pictures: vp.pictures, credits: vp.credits }} yaw={yaw} onYaw={(d) => setYaw((y) => y + d)} label={s.name(lesson.title)} />
          {phase === "idle" && <button type="button" className="class-start" onClick={play}><span aria-hidden>▶</span> {L("classroomStart")}</button>}
          {phase === "done" && (
            <div className="class-done" role="status"><b>{L("classroomDone")}</b>
              <div className="chips-row"><button type="button" className="btn" onClick={() => begin(0)}>{L("classroomAgain")}</button><Link className="btn ghost" href={back}>{L("classroomBack")}</Link></div></div>
          )}
        </div>
        {captions && (
          <aside className={`class-subs${speaking ? " speaking" : ""}`} aria-label={L("classroomSubtitles")} aria-live="off">
            {started && !mute && !rec && !browserVoice && <p className="class-caption small" role="note">{L("classroomNoRecording")}</p>}
            {started ? (<>
              <p className="class-caption">{tokens.map((w, i) => <span key={i} className={wordsMatch && i === wordIdx ? "on" : undefined}>{w} </span>)}</p>
              {both && cur.narration.ta && <p className="class-caption ta" lang="ta">{cur.narration.ta}</p>}
            </>) : <p className="class-caption small">{L("classroomSubtitlesHint")}</p>}
          </aside>
        )}
      </div>

      <div className="class-controls" role="group" aria-label={L("classroomControls")}>
        {playing ? <button type="button" className="btn" onClick={pause}>⏸ {L("classroomPause")}</button> : <button type="button" className="btn" onClick={play} disabled={phase === "check" || phase === "feedback"}>▶ {started ? L("classroomResume") : L("classroomStart")}</button>}
        <button type="button" className="btn ghost" onClick={() => begin(step)} disabled={!started}>↺ {L("classroomReplay")}</button>
        <button type="button" className="btn ghost" onClick={() => go(step - 1)} disabled={!started || step === 0}>← {L("back")}</button>
        <button type="button" className="btn ghost" onClick={() => go(step + 1)} disabled={!started || step + 1 >= lesson.steps.length}>{L("next")} →</button>
        <button type="button" className="btn ghost" onClick={() => go(0)} disabled={!started}>⟲ {L("classroomRestart")}</button>
        <label className="class-rate">{L("classroomSpeed")}
          <select value={rate} onChange={(e) => { const r = Number(e.target.value); setRate(r); if (audioEl.current) audioEl.current.playbackRate = r; }}>
            <option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option>
          </select>
        </label>
        <button type="button" className="btn ghost" aria-pressed={mute} onClick={toggleMute}>{mute ? "🔇" : "🔊"} {mute ? L("classroomVoiceOff") : L("classroomVoiceOn")}</button>
        {pickable.length > 1 && s.get("classroom.voicePicker") === true && (
          <label className="class-rate">{L("classroomTeacher")}
            <select value={lessonIn.voiceUsed ?? voice} onChange={(e) => { stopVoice(); setPhase((p) => (p === "playing" ? "paused" : p)); onVoice(e.target.value); }}>
              {pickable.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </label>
        )}
        <label className="class-rate">{L("classroomLanguage")}
          <select value={both ? "both" : "en"} onChange={(e) => setBoth(e.target.value === "both")}>
            <option value="en">English</option><option value="both">English + தமிழ்</option>
          </select>
        </label>
      </div>
      <ReportProblem kind="lesson" about={back} where="onLessons" />
      <p className="small class-count" aria-live="polite">{L("stepOf")} {step + 1} {L("ofWord")} {lesson.steps.length}{show3d ? ` · ${L("classroomDrag")}` : ""}</p>

    </div>
  );
}
