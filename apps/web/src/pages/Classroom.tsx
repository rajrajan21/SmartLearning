import { LessonCompletionHub, Timeline } from "../components/LessonFlow";
import { usePageTour } from "../components/SpotlightTour";
import { setClassroomAudioPlaying, type HelpQuickJump } from "../lib/spotlightTour";
import { ReportProblem } from "../components/ReportProblem";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAccountOptional } from "../lib/account";
import { getProgress, saveProgress } from "../lib/progress";
import { dayNumber } from "../lib/streak";
import { recordLessonOpened } from "../lib/lesson-guide";
import { Link, useParams } from "wouter";
import { estimateDurationMs, sceneAt, type PublicClassroom, type VoiceInfo } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { visualsPolicy, withoutGeneratedSteps, withoutVisualSteps } from "../lib/visuals";
import { ui } from "../lib/i18n";
import { useRetry } from "../lib/curriculum";
import { matchesSample, sample } from "../lib/sampleLesson";
import { useClassroom, useClassroomIndex } from "../lib/classroom";
import { usePhrases } from "../lib/practice";
import { ClassBoard, type BoardStyle } from "../components/ClassBoard";
import { store } from "../lib/storage";
import { toggleNote, useNotebook } from "../lib/tier2";
import { ErrorBox, Loading, NotFound } from "../components/bits";

type Phase = "idle" | "playing" | "paused" | "gap" | "check" | "feedback" | "done";
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

function ClassroomGroup({ label, count, initiallyOpen, children }: { label: string; count: number; initiallyOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <details className="classroom-group" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>{label}<span className="small">({count})</span></summary>
    {open && children}
  </details>;
}

function classroomGroups<T, K>(items: T[], key: (item: T) => K) {
  const result = new Map<K, T[]>();
  for (const item of items) {
    const name = key(item);
    const group = result.get(name);
    if (group) group.push(item);
    else result.set(name, [item]);
  }
  return [...result.entries()];
}
const classroomLabel = (slug: string) => slug.replace(/-/g, " ").replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());

export function ClassroomHub() {
  const s = useSettings();
  const on = s.get("feature.classroom") === true;
  const [attempt, retry] = useRetry();
  const idx = useClassroomIndex(on, attempt);
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  if (!on) return <NotFound />;
  if (idx.status === "loading") return <Loading />;
  if (idx.status === "error") return <ErrorBox onRetry={retry} />;
  const ta = s.lang === "ta";
  const items = idx.data.items;
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = items.filter((item) => {
    const text = [item.title.en, item.title.ta, item.chapter, item.topic, item.board, item.classLevel, item.subject].join(" ").toLowerCase().replace(/-/g, " ");
    return (!board || item.board === board) && (!grade || String(item.classLevel) === grade)
      && (!subject || item.subject === subject) && words.every((word) => text.includes(word));
  });
  const classes = classroomGroups(matches, (item) => item.classLevel).sort(([a], [b]) => a - b);
  const openMatches = words.length > 0 || Boolean(grade);
  const filterKey = [query, board, grade, subject].join("|");
  const boards = [...new Set(items.map((item) => item.board))].sort();
  const grades = [...new Set(items.map((item) => item.classLevel))].sort((a, b) => a - b);
  const subjects = [...new Set(items.map((item) => item.subject))].sort();
  return (
    <div className="paper">
      <h1>{ui("classroomTitle", s.lang)}</h1>
      <p className="lead">{ui("classroomIntro", s.lang)}</p>
      {items.length > 0 && <>
        <div className="classroom-filters" role="group" aria-label={ta ? "பாட வடிகட்டிகள்" : "Lesson filters"}>
          <label className="classroom-query">{ta ? "வகுப்பறைப் பாடத்தைத் தேடுங்கள்" : "Find a Classroom lesson"}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ta ? "பாடம் அல்லது தலைப்பு" : "Try magnets, fractions, or English"} /></label>
          <label>{ta ? "பாடத்திட்டம்" : "Board"}<select value={board} onChange={(event) => setBoard(event.target.value)}><option value="">{ta ? "அனைத்தும்" : "All boards"}</option>{boards.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>{ta ? "வகுப்பு" : "Class"}<select value={grade} onChange={(event) => setGrade(event.target.value)}><option value="">{ta ? "அனைத்தும்" : "All classes"}</option>{grades.map((value) => <option key={value} value={value}>{ui("classWord", s.lang)} {value}</option>)}</select></label>
          <label>{ta ? "பாடம்" : "Subject"}<select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="">{ta ? "அனைத்தும்" : "All subjects"}</option>{subjects.map((value) => <option key={value} value={value}>{value.replace(/-/g, " ")}</option>)}</select></label>
          <button type="button" className="btn ghost" onClick={() => { setQuery(""); setBoard(""); setGrade(""); setSubject(""); }}>{ta ? "அழி" : "Clear filters"}</button>
        </div>
        <p className="small" role="status">{matches.length} {ta ? "பாடங்கள்" : matches.length === 1 ? "lesson" : "lessons"}</p>
      </>}
      {items.length === 0 ? <p>{ui("classroomNone", s.lang)}</p> : matches.length === 0 ? <p>{ta ? "பொருந்தும் பாடங்கள் இல்லை." : "No matching lessons. Try another search or clear the filters."}</p> : (
        <div className="classroom-groups" key={filterKey}>
          {classes.map(([level, lessons]) => {
            const groups = classroomGroups(lessons, (item) => item.subject).sort(([a], [b]) => a.localeCompare(b));
            return <ClassroomGroup key={level} label={ui("classWord", s.lang) + " " + level} count={lessons.length} initiallyOpen={openMatches || classes.length === 1}>
              <div className="classroom-groups">
                {groups.map(([name, subjectLessons]) => {
                  const chapters = classroomGroups(subjectLessons, (item) => item.chapter).sort(([a], [b]) => a.localeCompare(b));
                  return <ClassroomGroup key={name} label={classroomLabel(name)} count={subjectLessons.length} initiallyOpen={words.length > 0 || groups.length === 1}>
                    <div className="classroom-groups">
                      {chapters.map(([chapter, chapterLessons]) => (
                        <ClassroomGroup key={chapter} label={classroomLabel(chapter)} count={chapterLessons.length} initiallyOpen={words.length > 0 || chapters.length === 1}>
                          <ul className="class-list">
                            {[...chapterLessons].sort((a, b) => s.name(a.title).localeCompare(s.name(b.title), s.lang)).map((i) => (
                              <li key={[i.board, i.classLevel, i.subject, i.chapter, i.topic].join("/")}>
                                <Link className="class-card" href={["", "classroom", i.board.toLowerCase(), i.classLevel, i.subject, i.chapter, i.topic].join("/")}>
                                  <b>{s.name(i.title)}</b><span>{i.board} · {i.steps} {ui("classroomSteps", s.lang)}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </ClassroomGroup>
                      ))}
                    </div>
                  </ClassroomGroup>;
                })}
              </div>
            </ClassroomGroup>;
          })}
        </div>
      )}
    </div>
  );
}

export function ClassroomPage() {
  const s = useSettings();
  const profile = useAccountOptional()?.me?.activeProfileId ?? "guest";
  const { board = "", cls = "", subject = "", chapter = "", topic = "" } = useParams<{ board: string; cls: string; subject: string; chapter: string; topic: string }>();
  const on = s.get("feature.classroom") === true;
  const [attempt, retry] = useRetry();
  const idx = useClassroomIndex(on);
  const voices = idx.status === "ready" ? idx.data.voices : [];
  const demo = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("sample")
    && matchesSample({ board, classLevel: Number(cls), subject, chapter, topic });
  const [voice, setVoice] = useState(() => demo ? "kani" : store.get("ss_class_voice") ?? "");
  const chosen = voices.some((v) => v.id === voice && v.ready) ? voice : "";
  const st = useClassroom(board, cls, subject, chapter, topic, on && idx.status !== "loading", attempt, chosen);
  if (!on) return <NotFound />;
  if (idx.status === "loading" || st.status === "loading") return <Loading />;
  if (st.status === "error") return <ErrorBox onRetry={retry} />;
  if (!st.data) return <NotFound />;
  const sameSubject = idx.status === "ready"
    ? idx.data.items.filter((i) => i.board.toLowerCase() === board.toLowerCase() && String(i.classLevel) === String(cls) && i.subject === subject)
    : [];
  const curIdx = sameSubject.findIndex((i) => i.chapter === chapter && i.topic === topic);
  const nextItem = curIdx >= 0 ? sameSubject[curIdx + 1] : undefined;
  const nextHref = nextItem ? `/classroom/${nextItem.board.toLowerCase()}/${nextItem.classLevel}/${nextItem.subject}/${nextItem.chapter}/${nextItem.topic}` : null;
  const nextLabel = nextItem ? s.name(nextItem.title) : null;
  return <Player key={JSON.stringify([profile, board, cls, subject, chapter, topic])} profile={profile} lesson={st.data} voices={voices} voice={chosen} onVoice={(v) => { setVoice(v); if (!demo) store.set("ss_class_voice", v); }} related={demo ? sample.chapterHref : undefined} back={`/${board}/${cls}/${subject}/${chapter}/${topic}`} nextHref={nextHref} nextLabel={nextLabel} />;
}

const recording = (step: PublicClassroom["steps"][number], lang: "en" | "ta", mute: boolean) => mute ? undefined : step.audio?.[lang] ?? step.audio?.en;
function timeIndex<T>(entries: readonly T[], at: number, start: (entry: T) => number) {
  const next = entries.findIndex(entry => start(entry) > at);
  return (next < 0 ? entries.length : next) - 1;
}
const timelineTime = (ms: number) => { const seconds = Math.floor(ms / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; };

function Player({ lesson: lessonIn, back, voices, voice, onVoice, related, profile, nextHref, nextLabel }: { profile: string; lesson: PublicClassroom; back: string; related?: string; voices: VoiceInfo[]; voice: string; onVoice: (v: string) => void; nextHref?: string | null; nextLabel?: string | null }) {
  const s = useSettings();
  const { lang } = s;
  const narrationLang = related ? "en" : lang;
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
  const text = cur.narration[narrationLang] ?? cur.narration.en;
  const rec = recording(cur, narrationLang, mute);
  const durMs = rec ? rec.durationMs : estimateDurationMs(cur.narration.en);
  const words = rec?.words;
  const timeline = useMemo(() => {
    let total = 0;
    const starts = lesson.steps.map(item => {
      const start = total;
      total += recording(item, narrationLang, mute)?.durationMs ?? estimateDurationMs(item.narration.en);
      return start;
    });
    return { starts, total };
  }, [lesson.steps, narrationLang, mute]);

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

  const begin = useCallback((i: number, offset = 0, autoplay = true) => {
    recordLessonOpened(`classroom:${back}`);
    const topicId = R.current.lesson.topicId;
    if (topicId) {
      const progress = getProgress(topicId);
      if (!progress || dayNumber(progress.updatedAt) !== dayNumber(Date.now())) {
        saveProgress(topicId, { step: progress?.step ?? 0, total: progress?.total ?? 1, done: progress?.done ?? false });
      }
    }
    run.current++; stopVoice(); clearTimer();
    const stp = R.current.lesson.steps[i]!;
    const rr = recording(stp, narrationLang, R.current.mute);
    const deviceVoice = !rr && R.current.browserVoice && hasSpeech() && !R.current.mute;
    const start = deviceVoice ? 0 : offset;
    tRef.current = start; setT(start); setStep(i); setPicked(null); setWrongNote(null); setTalking(false);
    setWordIdx(rr ? timeIndex(rr.words, start, word => word.t) : -1);
    setPhase(autoplay ? "playing" : "paused");
    speechDone.current = !autoplay || !deviceVoice;
    if (!autoplay) return;
    const id = run.current;
    bound.current = null;
    if (rr) { const a = pre.current.get(rr.url) ?? new Audio(rr.url); a.currentTime = start / 1000; a.playbackRate = R.current.rate; audioEl.current = a; void a.play().catch(() => { if (run.current === id && audioEl.current === a) audioEl.current = null; }); }
    else if (!speechDone.current) {
      const u = new SpeechSynthesisUtterance(stp.narration.en); u.lang = "en-IN"; u.rate = R.current.rate;
      const total = stp.narration.en.length, dur = estimateDurationMs(stp.narration.en);
      u.onboundary = (e) => { if (run.current === id) bound.current = { t: (e.charIndex / Math.max(1, total)) * dur, at: performance.now() }; };
      u.onend = () => { if (run.current === id) speechDone.current = true; }; u.onerror = u.onend; speechSynthesis.speak(u);
    }
    // load the recordings of the next steps now, so there is no wait between scenes
    for (let n = i + 1; n <= i + 2 && n < R.current.lesson.steps.length; n++) {
      const nx = R.current.lesson.steps[n]!, ref = nx.audio?.[narrationLang] ?? nx.audio?.en;
      if (ref && !pre.current.has(ref.url)) { const pa = new Audio(); pa.preload = "auto"; pa.src = ref.url; pre.current.set(ref.url, pa); }
    }
  }, [back, narrationLang, stopVoice]);

  const afterNarration = useCallback(() => {
    const { lesson: ls, step: i } = R.current, stp = ls.steps[i]!;
    if (stp.check) { setPhase("check"); say(stp.checkAudio?.stem?.[narrationLang] ?? stp.checkAudio?.stem?.en, stp.check.stem.en); return; }
    if (i + 1 >= ls.steps.length) { setPhase("done"); return; }
    if (!R.current.autoAdvance || (!vp.autoplay && ls.steps[i + 1]?.id.startsWith("v-") && !stp.id.startsWith("v-"))) { setPhase("paused"); return; }
    setPhase("gap");
    const id = run.current;
    timer.current = window.setTimeout(() => { if (run.current === id) begin(i + 1); }, R.current.pauseMs);
  }, [begin, narrationLang, say]);
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
      const previousTime = tRef.current;
      let ms: number;
      if (a && r.rec) ms = a.currentTime * 1000;
      else if (!speechDone.current && bound.current) ms = Math.max(tRef.current, bound.current.t + Math.min(now - bound.current.at, 320) * r.rate);
      else if (!speechDone.current && R.current.browserVoice && tRef.current < 1) ms = tRef.current; // the device voice has not started yet
      else { tRef.current += dt * r.rate; ms = tRef.current; }
      tRef.current = ms; setT(ms);
      const elapsed = Math.max(0, ms - previousTime);
      if (elapsed) setClock((c) => c + elapsed / 1000);
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

  const frame = useRef<HTMLDivElement>(null);
  const play = () => {
    const view = frame.current;
    if (view && view.getBoundingClientRect().top < 0) view.scrollIntoView({ block: "start", behavior: "auto" });
    if (phase === "idle" || phase === "done") { begin(0); return; }
    if (phase === "paused") {
      if (tRef.current >= durMs - 30) { if (step + 1 < lesson.steps.length) begin(step + 1); else setPhase("done"); return; }
      if (!audioEl.current && speechDone.current) { begin(step, tRef.current); return; }
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
    const sayPhrase = (ph: ReturnType<typeof pick>, then: () => void) => { if (!ph) return then(); say(ph.audio?.[narrationLang] ?? ph.audio?.en, s.name(ph.text), then); };
    if (o.correct) { setPhase("feedback"); setWrongNote(null); sayPhrase(pick(phrases.praise), () => say(cur.checkAudio?.explanation?.[narrationLang] ?? cur.checkAudio?.explanation?.en, cur.check!.explanation.en)); }
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
  const samplePoster = related && vp.animations ? lesson.steps.findIndex((item) => item.id === "v-mg-intro") : -1;
  const scene = useMemo(() => {
    if (phase === "idle" && samplePoster >= 0) {
      return sceneAt(lesson, samplePoster, 4000, { durMs: 4000, instant: true });
    }
    return sceneAt(lesson, step, phase === "idle" ? 0 : shownT, { durMs, words, instant, lang: "en" });
  }, [lesson, step, shownT, durMs, words, instant, phase, samplePoster]);
  const tokens = text.split(/\s+/);
  const wordsMatch = !!words && words.length === tokens.length;
  const playing = phase === "playing", started = phase !== "idle";
  useEffect(() => {
    if (phase !== "done" || !lesson.topicId) return;
    const progress = getProgress(lesson.topicId);
    if (!progress?.done) saveProgress(lesson.topicId, { step: progress?.step ?? 0, total: progress?.total ?? 1, done: true });
  }, [phase, lesson.topicId]);
  const speaking = (playing && !mute) || talking;
  useEffect(() => {
    setClassroomAudioPlaying(playing || talking);
    return () => setClassroomAudioPlaying(false);
  }, [playing, talking]);
  const [, routeBoard = "", routeCls = "", routeSubject = "", routeChapter = ""] = back.split("/");
  const chapterHref = back.split("/").slice(0, -1).join("/");
  const quickJumps = useMemo<HelpQuickJump[]>(() => {
    const ta = lang === "ta";
    const items: HelpQuickJump[] = [
      { id: "topics", href: chapterHref, icon: "📚", label: ui("topics", lang) },
    ];
    if (s.get("feature.practice") === true) {
      items.push({ id: "practice", href: `${back}/practice`, icon: "✏️", label: ta ? "பயிற்சியைத் தொடங்கு" : "Start practice" });
      if (s.get("feature.exams") === true) {
        items.push({ id: "exam", href: `/exam/${routeBoard}/${routeCls}/${routeSubject}/${routeChapter}`, icon: "📝", label: ui("chapterTest", lang) });
      }
      if (s.get("feature.worksheets") === true) {
        items.push({ id: "worksheet", href: `/worksheet/${routeBoard}/${routeCls}/${routeSubject}/${routeChapter}`, icon: "📄", label: ui("worksheetWord", lang) });
      }
      if (s.get("feature.games") === true && (s.get("games.quickfire") === true || s.get("games.survival") === true)) {
        const mode = s.get("games.quickfire") === true ? "quickfire" : "survival";
        items.push({ id: "games", href: `/play/${mode}/${routeBoard}/${routeCls}/${routeSubject}/${routeChapter}`, icon: "🎮", label: ui("gamesWord", lang) });
      }
    }
    if (nextHref) {
      items.push({ id: "next", href: nextHref, icon: "➡️", label: nextLabel ? `${ui("nextTopic", lang)}: ${nextLabel}` : (ta ? "அடுத்த பாடம்" : "Next lesson") });
    }
    return items;
  }, [back, chapterHref, lang, nextHref, nextLabel, routeBoard, routeChapter, routeCls, routeSubject, s]);
  usePageTour({ pageType: "lesson", tourActive: phase === "idle", quickJumps });
  const sections = lesson.steps.reduce<{ name: string; first: number }[]>((acc, st, i) => { const n = st.section ?? ""; if (n && acc[acc.length - 1]?.name !== n) acc.push({ name: n, first: i }); return acc; }, []);
  const curSection = lesson.steps[step]?.section;
  const notes = useNotebook(), noteOn = s.get("notebook.enabled") === true;
  const noteId = ("cr:" + back.replace(/^\//, "").replace(/\//g, "-")).slice(0, 60), noteSaved = !!notes[noteId], subjectSlug = back.split("/")[3] ?? "";
  const resume = s.get("classroom.resume") === true, saveKey = `ss.class.${profile}.${back}`;
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
  const locate = (at: number) => Math.max(0, timeIndex(timeline.starts, at, start => start));
  const seek = (at: number) => {
    const i = locate(at);
    setClock(at / 1000);
    begin(i, Math.max(0, Math.min(at, (timeline.starts[i + 1] ?? timeline.total) - 1) - timeline.starts[i]!), phase === "playing" || phase === "gap");
  };

  return (
    <div className="paper classroom" ref={frame} data-sample={related ? "true" : undefined}>
      <p className="small"><Link href={back}>← {L("backToTopic")}</Link>{noteOn && <> <button type="button" className="link heart" aria-pressed={noteSaved} onClick={() => toggleNote({ id: noteId, href: `/classroom${back}`, title: lesson.title, subject: { en: subjectSlug.replace(/-/g, " ") } })}><span aria-hidden="true">{noteSaved ? "❤️" : "🤍"}</span> {noteSaved ? L("nbSaved") : L("nbSave")}</button></>}</p>
      <h1>{s.name(related ? sample.title : lesson.title)}</h1>
      {related && <p className="sample-intro">{lang === "ta" ? "காந்தம் எதை ஈர்க்கும்? பலகையில் பார்த்து, விடையைச் சோதித்துப் பாருங்கள்." : "What will a magnet pick up? Watch the board, make a prediction and check your answer."}</p>}
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

        <div className="class-stage" data-tour="lesson-stage">
          <ClassBoard quiet={!!cur.check && (phase === "check" || phase === "feedback")} objects={lesson.objects} scene={scene} style={style} show3d={show3d} clock={vp.motion ? clock * vp.speed : 2} visuals={{ pictures: vp.pictures, credits: vp.credits }} yaw={yaw} onYaw={(d) => setYaw((y) => y + d)} label={s.name(related ? sample.title : lesson.title)} />
          {phase === "idle" && <button type="button" className="class-start" onClick={play}><span aria-hidden>▶</span> {L("classroomStart")}</button>}
          {phase === "done" && (
            <LessonCompletionHub
              mode="classroom"
              topicId={lesson.topicId}
              topicHref={back}
              chapterHref={chapterHref}
              nextHref={nextHref}
              nextLabel={nextLabel}
              heading={L("classroomDone")}
              onReplay={() => begin(0)}
            />
          )}
        </div>
        {captions && (
          <aside className={`class-subs${speaking ? " speaking" : ""}`} aria-label={L("classroomSubtitles")} aria-live="off">
            {started && !mute && !rec && !browserVoice && <p className="class-caption small" role="note">{L("classroomNoRecording")}</p>}
            {started ? (<>
              <p className="class-caption">{tokens.map((w, i) => <span key={i} className={wordsMatch && i === wordIdx ? "on" : undefined}>{w} </span>)}</p>
              {(both || (related && lang === "ta")) && cur.narration.ta && <p className="class-caption ta" lang="ta">{cur.narration.ta}</p>}
            </>) : <p className="class-caption small">{L("classroomSubtitlesHint")}</p>}
          </aside>
        )}
      </div>

      <Timeline value={phase === "done" ? timeline.total : timeline.starts[step]! + shownT} max={timeline.total}
        describe={at => `${lesson.steps[locate(at)]?.section ?? L("stepOf") + " " + (locate(at) + 1)} · ${timelineTime(at)} / ${timelineTime(timeline.total)}`}
        onSeek={seek} />
      <div className="class-controls" role="group" aria-label={L("classroomControls")} data-tour="lesson-controls">
        {playing ? <button type="button" className="btn" onClick={pause}>⏸ {L("classroomPause")}</button> : <button type="button" className="btn" onClick={play} disabled={phase === "check" || phase === "feedback"}>▶ {started ? L("classroomResume") : L("classroomStart")}</button>}
        <button type="button" className="btn ghost" onClick={() => begin(step)} disabled={!started}>↺ {L("classroomReplay")}</button>
        <button type="button" className="btn ghost" onClick={() => go(step - 1)} disabled={!started || step === 0}>← {L("back")}</button>
        <button type="button" className="btn ghost" onClick={() => go(step + 1)} disabled={!started || step + 1 >= lesson.steps.length}>{L("next")} →</button>
        <button type="button" className="btn ghost" onClick={() => go(0)} disabled={!started}>⟲ {L("classroomRestart")}</button>
        <label className="class-rate">{L("classroomSpeed")}
          <select value={rate} onChange={(e) => {
            const nextRate = Number(e.target.value);
            const restartSpeech = !speechDone.current && !audioEl.current;
            R.current.rate = nextRate;
            setRate(nextRate);
            if (audioEl.current) audioEl.current.playbackRate = nextRate;
            else if (restartSpeech && playing) begin(step);
            else if (restartSpeech) stopVoice();
          }}>
            <option value={0.75}>0.75×</option><option value={0.85}>0.85×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option>
          </select>
        </label>
        <label className="class-rate">{L("classroomLanguage")}
          <select value={both ? "both" : "en"} onChange={(e) => setBoth(e.target.value === "both")}>
            <option value="en">English</option><option value="both">English + தமிழ்</option>
          </select>
        </label>
        {pickable.length > 1 && s.get("classroom.voicePicker") === true && (
          <label className="class-rate">{L("classroomTeacher")}
            <select value={lessonIn.voiceUsed ?? voice} onChange={(e) => { stopVoice(); setPhase((p) => (p === "playing" ? "paused" : p)); onVoice(e.target.value); }}>
              {pickable.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="class-sub-controls">
        <button type="button" className="btn ghost" aria-pressed={mute} onClick={toggleMute}>{mute ? "🔇" : "🔊"} {mute ? L("classroomVoiceOff") : L("classroomVoiceOn")}</button>
        <ReportProblem kind="lesson" about={back} where="onLessons" />
      </div>
      {related && <p className="actions"><Link className="btn ghost" href={related}>{lang === "ta" ? "காந்தங்கள் பற்றிய பிற பாடங்கள்" : "Explore more lessons about magnets"} →</Link></p>}
      <p className="small class-count" aria-live="polite">{L("stepOf")} {step + 1} {L("ofWord")} {lesson.steps.length}{show3d ? ` · ${L("classroomDrag")}` : ""}</p>

    </div>
  );
}
