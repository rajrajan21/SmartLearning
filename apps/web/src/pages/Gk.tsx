import { PuzzleOfDay } from "../components/PuzzleOfDay";
import { ProjectOfWeek } from "../components/ProjectOfWeek";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { GK_AGES, GK_AGE_LABEL, GK_ANIMATED_VISUALS, type GkAge, type GkIndex, type GkListItem } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { Crumbs, ErrorBox, Loading, NotFound } from "../components/bits";
import { GkVisual } from "../components/gk/visuals";
import { useNarrator } from "../lib/narrator";
import { csv, gkDone, gt, markGkDone, narrationOf, orderCategories, pickDaily, saveAge, savedAge, sortItems, useGkIndex, useGkLesson, visibleItems, type GkLessonOut } from "../lib/gk";

const speedOf = (v: unknown) => (v === "slow" ? 0.6 : v === "fast" ? 1.6 : 1);

function useGkConfig() {
  const s = useSettings();
  return {
    s,
    on: s.get("feature.gk") === true,
    hiddenCats: csv(s.get("gk.categoriesHidden")),
    hiddenLessons: csv(s.get("gk.lessonsHidden")),
    bands: csv(s.get("gk.ageBands")) as GkAge[],
    title: s.text("gk.tab.label") || gt("title", s.lang),
  };
}

/* ---------- cards ---------- */
export function GkCard({ it, done, compact }: { it: GkListItem; done: boolean; compact: boolean }) {
  const s = useSettings();
  const animBadge = s.get("gk.anim.enabled") === true && s.get("gk.showAnimBadge") === true && it.hasAnimation;
  return (
    <li className={`gk-card${compact ? " compact" : ""}`}>
      <Link href={`/gk/${it.id}`} className="gk-card-link">
        <span className="gk-emoji" aria-hidden="true">{it.emoji}</span>
        <span className="gk-card-body">
          <b className="gk-card-title">{it.title}</b>
          {!compact && <span className="gk-card-sum">{it.summary}</span>}
          <span className="gk-badges">
            {s.get("gk.showAgeBadge") === true && <span className="gk-badge">{gt("ageLabel", s.lang)} {it.age}</span>}
            {s.get("gk.showMinutes") === true && <span className="gk-badge">{it.minutes} {gt("min", s.lang)}</span>}
            {it.kind === "puzzle" && <span className="gk-badge pz">🧩 {gt("kindPuzzle", s.lang)}</span>}
            {animBadge && <span className="gk-badge an">▶ {gt("plays", s.lang)}</span>}
            {done && s.get("gk.showDone") === true && <span className="gk-badge ok">✓ {gt("doneBadge", s.lang)}</span>}
          </span>
        </span>
      </Link>
    </li>
  );
}
const Grid = ({ items, done, compact }: { items: GkListItem[]; done: string[]; compact: boolean }) => (
  <ul className="gk-grid">{items.map((it) => <GkCard key={it.id} it={it} done={done.includes(it.id)} compact={compact} />)}</ul>
);

/* ---------- daily cards (GK page and home) ---------- */
function pool(ix: GkIndex, base: GkListItem[], mode: string, s: ReturnType<typeof useSettings>, kind: "lesson" | "puzzle", age: string): GkListItem[] {
  let p = base.filter((i) => i.kind === kind);
  if (age && age !== "any") p = p.filter((i) => i.age === age);
  if (kind === "lesson") {
    if (mode === "featured") { const f = csv(s.get("gk.featured")); p = f.map((id) => p.find((i) => i.id === id)).filter((x): x is GkListItem => !!x); }
    else if (mode === "category") p = p.filter((i) => i.category === String(s.get("gk.daily.category")));
    else if (mode === "pinned") { const id = String(s.get("gk.daily.pinnedId")); p = p.filter((i) => i.id === id); }
  } else {
    if (mode === "pinned") { const id = String(s.get("gk.puzzle.pinnedId")); p = p.filter((i) => i.id === id); }
    // "method" needs lesson detail; the list item carries the method in its tags
    else if (mode === "method") { const m = String(s.get("gk.puzzle.method")).toLowerCase(); p = p.filter((i) => i.tags.some((t) => t.toLowerCase() === m)); }
  }
  void ix;
  return p;
}

function DailyCard({ item }: { item: GkListItem }) {
  const s = useSettings();
  const showFact = s.get("gk.daily.showFact") === true;
  const l = useGkLesson(item.id, showFact);
  const fact = l.data?.facts?.[0];
  return (
    <article className="gk-daily" data-testid="gk-daily">
      <h2>🌟 {gt("daily", s.lang)}</h2>
      <p className="gk-daily-title"><span aria-hidden="true">{item.emoji}</span> <b>{item.title}</b></p>
      <p className="small">{item.summary}</p>
      {fact && <p className="gk-fact"><b>{gt("facts", s.lang)}</b> {fact}</p>}
      <Link className="btn sm" href={`/gk/${item.id}`}>{gt("openLesson", s.lang)}</Link>
    </article>
  );
}

function PuzzleCard({ item, home }: { item: GkListItem; home?: boolean }) {
  const s = useSettings();
  const l = useGkLesson(item.id, true);
  const think = Number(s.get("gk.puzzle.thinkSeconds") ?? 20);
  const reveal = String(s.get("gk.puzzle.reveal") ?? "after-think");
  const [left, setLeft] = useState(think);
  const [hint, setHint] = useState(false);
  const [ans, setAns] = useState(false);
  const [tries, setTries] = useState(0);
  useEffect(() => { setLeft(think); }, [think, item.id]);
  useEffect(() => { if (left <= 0) return; const id = setTimeout(() => setLeft((x) => x - 1), 1000); return () => clearTimeout(id); }, [left]);
  const p = l.data;
  const steps = p?.steps ?? [];
  const canShow = reveal === "button" || (reveal === "after-think" && left <= 0) || (reveal === "after-tries" && tries >= Number(s.get("gk.puzzle.tries") ?? 2));
  return (
    <article className="gk-puzzle" id={home ? "puzzle" : undefined} data-testid="gk-puzzle">
      <h2>🧩 {gt("puzzleDay", s.lang)}</h2>
      {!p ? <p className="small">{item.title}</p> : (
        <>
          <p className="gk-puzzle-q">{steps[0]?.sentences.join(" ")}</p>
          {s.get("gk.puzzle.showMethod") === true && p.method && <p className="small">{gt("method", s.lang)}: <b>{p.method}</b></p>}
          {s.get("gk.puzzle.showHint") === true && steps[1] && (hint ? <p className="gk-fact"><b>{gt("hint", s.lang)}</b> {steps[1].sentences.join(" ")}</p> : <button type="button" className="btn ghost sm" onClick={() => setHint(true)}>💡 {gt("hint", s.lang)}</button>)}
          {reveal !== "never" && steps.length > 2 && (ans ? <p className="gk-answer"><b>{steps[steps.length - 1]!.title}</b> {steps[steps.length - 1]!.sentences.join(" ")}</p> : (
            <button type="button" className="btn sm" disabled={!canShow && reveal !== "after-tries"} onClick={() => { if (canShow) setAns(true); else setTries((x) => x + 1); }}>
              {canShow ? gt("showAnswer", s.lang) : reveal === "after-think" ? `${gt("think", s.lang)} (${left})` : gt("check", s.lang)}
            </button>
          ))}
        </>
      )}
      <p><Link href={`/gk/${item.id}`}>{gt("openLesson", s.lang)} →</Link></p>
    </article>
  );
}

export function GkTodayCards({ home, preferPuzzle }: { home?: boolean; preferPuzzle?: boolean }) {
  const { s, on, hiddenCats, hiddenLessons } = useGkConfig();
  const ixr = useGkIndex(on);
  const date = useMemo(() => new Date(), []);
  if (!on || !ixr.data) return preferPuzzle ? <PuzzleOfDay /> : null;
  const base = visibleItems(ixr.data, { hiddenCats, hiddenLessons });
  const age = (s.get("gk.rememberAge") === true && savedAge()) || String(s.get("gk.daily.age") ?? "any");
  const dOn = s.get("gk.daily.enabled") === true && (!home || s.get("gk.daily.showOnHome") === true);
  const pOn = s.get("gk.puzzle.enabled") === true && (!home || ((preferPuzzle || s.get("puzzle.show") !== true) && s.get("gk.puzzle.showOnHome") === true));
  const daily = dOn ? pickDaily(pool(ixr.data, base, String(s.get("gk.daily.mode")), s, "lesson", age), date, Number(s.get("gk.daily.shuffle") ?? 0), Number(s.get("gk.daily.count") ?? 1)) : [];
  const puz = pOn ? pickDaily(pool(ixr.data, base, String(s.get("gk.puzzle.mode")), s, "puzzle", String(s.get("gk.puzzle.age") ?? "any")), date, Number(s.get("gk.puzzle.shuffle") ?? 0) + 5, 1) : [];
  if (!daily.length && !puz.length) return preferPuzzle ? <PuzzleOfDay /> : null;
  if (preferPuzzle) {
    return <>
      {daily.length > 0 && <div className="activity-daily-gk">
        {daily.map((d) => <DailyCard key={d.id} item={d} />)}
      </div>}
      <div className="activity-puzzle">
        {puz[0] ? <PuzzleCard key={puz[0].id} item={puz[0]} home={home} /> : <PuzzleOfDay />}
        <Link className="btn ghost sm activity-open-gk" href="/gk">{gt("gotoGk", s.lang)} →</Link>
      </div>
    </>;
  }
  return (
    <section className={`gk-today${home ? " home" : ""}`} aria-label="GK today">
      {daily.map((d) => <DailyCard key={d.id} item={d} />)}
      {puz[0] && <PuzzleCard key={puz[0].id} item={puz[0]} home={home} />}
      {home && <p className="gk-today-more"><Link className="btn ghost sm" href="/gk">{gt("gotoGk", s.lang)} →</Link></p>}
    </section>
  );
}

/* ---------- the GK page ---------- */
export function GkPage() {
  const { s, on, hiddenCats, hiddenLessons, bands, title } = useGkConfig();
  const { state, data, retry } = useGkIndex(on);
  const defAge = String(s.get("gk.defaultAge") ?? "any");
  const [age, setAge] = useState<string>(() => (s.get("gk.rememberAge") === true && savedAge()) || (defAge === "any" ? "" : defAge));
  const [kind, setKind] = useState<"all" | "lesson" | "puzzle">("all");
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const per = Number(s.get("gk.perPage") ?? 24);
  const [shown, setShown] = useState(per);
  useEffect(() => setShown(per), [age, kind, cat, q, per]);
  const done = useMemo(() => gkDone(), []);

  const all = useMemo(() => (data ? visibleItems(data, { hiddenCats, hiddenLessons }) : []), [data, hiddenCats.join(), hiddenLessons.join()]);
  const lang = s.lang;
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    const f = all.filter((i) => (!age || i.age === age) && (kind === "all" || i.kind === kind) && (!cat || i.category === cat) && (!n || `${i.title} ${i.summary} ${i.tags.join(" ")}`.toLowerCase().includes(n)));
    return sortItems(f, String(s.get("gk.sort")));
  }, [all, age, kind, cat, q, s]);

  if (!on || state === "off") return <NotFound />;
  if (state === "loading") return <Loading />;
  if (state === "error" || !data) return <ErrorBox onRetry={retry} />;

  const cats = orderCategories(data.categories.filter((c) => !hiddenCats.includes(c.id) && all.some((i) => i.category === c.id)), csv(s.get("gk.categoryOrder")));
  const countOf = (f: (i: GkListItem) => boolean) => all.filter(f).length;
  const showCounts = s.get("gk.showCounts") === true;
  const featIds = csv(s.get("gk.featured"));
  const featured = featIds.map((id) => all.find((i) => i.id === id)).filter((x): x is GkListItem => !!x).slice(0, Number(s.get("gk.featured.max") ?? 6));
  const compact = s.get<string>("gk.cards.style") === "compact";
  const filtering = !!(q.trim() || cat);
  const view = filtering ? "list" : String(s.get("gk.view.default") ?? "categories");
  const shelf = Number(s.get("gk.shelf.size") ?? 6);
  const chooseAge = (a: string) => { setAge(a); if (s.get("gk.rememberAge") === true) saveAge(a); };
  const intro = s.text("gk.intro") || gt("title", lang);
  const bandList = GK_AGES.filter((a) => bands.includes(a));
  const groups: { title: string; list: typeof cats }[] = [
    { title: lang === "ta" ? "அறிவு" : "Knowledge", list: cats.filter((c) => c.group === "knowledge") },
    { title: lang === "ta" ? "சிந்தனை மற்றும் புதிர்கள்" : "Puzzles and brain training", list: cats.filter((c) => c.group === "thinking") },
  ];
  return (
    <main className="gk" data-testid="gk-page">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: title }]} />
      <h1>{title}</h1>
      <p className="lead">{intro}</p>
      <GkTodayCards />
      <ProjectOfWeek />
      <div className="gk-filters noprint">
        {s.get("gk.showSearch") === true && <input type="search" className="gk-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={gt("search", lang)} aria-label={gt("search", lang)} />}
        {s.get("gk.showAgeFilter") === true && (
          <div className="gk-chips" role="group" aria-label={gt("age", lang)}>
            <button type="button" className={`chip${age === "" ? " on" : ""}`} aria-pressed={age === ""} onClick={() => chooseAge("")}>{gt("anyAge", lang)}</button>
            {bandList.map((a) => <button key={a} type="button" className={`chip${age === a ? " on" : ""}`} aria-pressed={age === a} onClick={() => chooseAge(a)} title={GK_AGE_LABEL[a]}>{a}{showCounts ? ` (${countOf((i) => i.age === a)})` : ""}</button>)}
          </div>
        )}
        {s.get("gk.showKindFilter") === true && (
          <div className="gk-chips" role="group" aria-label="Type">
            {(["all", "lesson", "puzzle"] as const).map((k) => <button key={k} type="button" className={`chip${kind === k ? " on" : ""}`} aria-pressed={kind === k} onClick={() => setKind(k)}>{gt(k === "all" ? "kindAll" : k === "lesson" ? "kindLesson" : "kindPuzzle", lang)}</button>)}
          </div>
        )}
        {s.get("gk.showCategoryFilter") === true && (
          <div className="gk-chips" role="group" aria-label={gt("cat", lang)}>
            <button type="button" className={`chip${cat === "" ? " on" : ""}`} aria-pressed={cat === ""} onClick={() => setCat("")}>{gt("all", lang)}</button>
            {cats.map((c) => <button key={c.id} type="button" className={`chip${cat === c.id ? " on" : ""}`} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.emoji} {c.title}{showCounts ? ` (${countOf((i) => i.category === c.id && (!age || i.age === age))})` : ""}</button>)}
          </div>
        )}
      </div>
      {!filtering && featured.length > 0 && !age && kind === "all" && <section><h2>⭐ {gt("featured", lang)}</h2><Grid items={featured} done={done} compact={compact} /></section>}
      {filtered.length === 0 && <p className="notice">{all.length === 0 ? gt("none", lang) : gt("noMatch", lang)}</p>}
      {filtered.length > 0 && view === "categories" && groups.map((g) => g.list.length > 0 && (
        <div key={g.title}>
          <h2 className="gk-group">{g.title}</h2>
          {g.list.map((c) => {
            const its = filtered.filter((i) => i.category === c.id);
            if (!its.length) return null;
            return (
              <section key={c.id} className="gk-shelf" aria-label={c.title}>
                <h3>{c.emoji} {c.title} <span className="small">{c.blurb}</span></h3>
                <Grid items={its.slice(0, shelf)} done={done} compact={compact} />
                {its.length > shelf && <button type="button" className="btn ghost sm" onClick={() => { setCat(c.id); }}>{gt("seeAll", lang)} ({its.length})</button>}
              </section>
            );
          })}
        </div>
      ))}
      {filtered.length > 0 && view === "ages" && bandList.map((a) => { const its = filtered.filter((i) => i.age === a); return its.length > 0 && <section key={a}><h2>{GK_AGE_LABEL[a]}</h2><Grid items={its.slice(0, shelf * 2)} done={done} compact={compact} /></section>; })}
      {filtered.length > 0 && view === "list" && (
        <section>
          <Grid items={filtered.slice(0, shown)} done={done} compact={compact} />
          {filtered.length > shown && <button type="button" className="btn ghost" onClick={() => setShown((n) => n + per)}>{gt("more", lang)}</button>}
        </section>
      )}
      <p className="small">{all.length} {gt("items", lang)} · {data.counts.animations} animations</p>
    </main>
  );
}

/* ---------- a lesson ---------- */
function shuffled(n: number, seed: string): number[] {
  const a = Array.from({ length: n }, (_, i) => i); let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = n - 1; i > 0; i--) { h = (h * 1664525 + 1013904223) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

function Quiz({ lesson, onDone }: { lesson: GkLessonOut; onDone: () => void }) {
  const s = useSettings();
  const max = Number(s.get("gk.quiz.max") ?? 4);
  const qs = lesson.quiz.slice(0, max);
  const [run, setRun] = useState(0);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const order = useMemo(() => qs.map((q, i) => (s.get("gk.quiz.shuffle") === true ? shuffled(q.options.length, `${lesson.id}${i}${run}`) : q.options.map((_, k) => k))), [lesson.id, run, qs.length]);
  const answered = Object.keys(picked).length;
  const score = qs.filter((q, i) => picked[i] === q.answer).length;
  const finished = answered === qs.length && qs.length > 0;
  const pass = Number(s.get("gk.quiz.passPercent") ?? 60);
  useEffect(() => { if (finished) onDone(); }, [finished]);
  if (!qs.length) return null;
  return (
    <section className="gk-quiz" data-testid="gk-quiz">
      <h2>🎯 {gt("quiz", s.lang)}</h2>
      {qs.map((q, i) => (
        <fieldset key={`${run}-${i}`} className="gk-q" disabled={picked[i] !== undefined}>
          <legend>{i + 1}. {q.q}</legend>
          {order[i]!.map((oi) => {
            const chosen = picked[i] === oi, right = picked[i] !== undefined && oi === q.answer;
            return <button key={oi} type="button" className={`gk-opt${chosen ? " chosen" : ""}${right ? " right" : ""}${chosen && !right ? " wrong" : ""}`} onClick={() => setPicked((p) => ({ ...p, [i]: oi }))}>{q.options[oi]}</button>;
          })}
          {picked[i] !== undefined && (
            <p className="gk-why" role="status"><b>{picked[i] === q.answer ? gt("right", s.lang) : gt("wrong", s.lang)}</b> {s.get("gk.quiz.showWhy") === true && q.why}</p>
          )}
        </fieldset>
      ))}
      {finished && (
        <p className="gk-score" role="status"><b>{gt("score", s.lang)} {score} {gt("outOf", s.lang)} {qs.length}.</b> {Math.round((score / qs.length) * 100) >= pass && `⭐ ${gt("star", s.lang)}`}{" "}
          {s.get("gk.quiz.retry") === true && <button type="button" className="btn ghost sm" onClick={() => { setPicked({}); setRun((r) => r + 1); }}>{gt("again", s.lang)}</button>}</p>
      )}
    </section>
  );
}

export function GkLessonPage() {
  const { id = "" } = useParams<{ id: string }>();
  const s = useSettings();
  const lang = s.lang;
  const on = s.get("feature.gk") === true;
  const hiddenLessons = csv(s.get("gk.lessonsHidden")), hiddenCats = csv(s.get("gk.categoriesHidden"));
  const r = useGkLesson(id, on && !hiddenLessons.includes(id));
  const ixr = useGkIndex(on);
  const slidesOk = s.get("gk.slides.enabled") === true;
  const [view, setView] = useState<"lesson" | "slides">(slidesOk && s.get<string>("gk.slides.default") === "slides" ? "slides" : "lesson");
  const [slide, setSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const lesson = r.data;
  const nar = useMemo(() => (lesson ? narrationOf(lesson) : { all: [], stepStart: [] }), [lesson]);
  const audioOn = s.get("gk.audio.enabled") === true;
  const narrator = useNarrator(nar.all, { lang: "en", autoAdvance: view === "slides" ? s.get("gk.slides.autoAdvance") === true : true, initialRate: Number(s.get("gk.audio.rate") ?? 1), deviceVoice: s.get("gk.audio.deviceVoice") === true, pauseMs: Number(s.get("player.sentencePauseMs") ?? 250) || 250 });
  const curStep = useMemo(() => { let k = 0; nar.stepStart.forEach((st, i) => { if (narrator.index >= st) k = i; }); return k; }, [nar, narrator.index]);
  useEffect(() => { if (narrator.playing && view === "slides") setSlide(curStep); }, [curStep, narrator.playing, view]);
  useEffect(() => { if (s.get("gk.audio.autoplay") === true && lesson && audioOn && narrator.source !== "none") narrator.play(0); }, [lesson?.id]);
  useEffect(() => {
    if (view !== "slides" || s.get("gk.slides.keys") !== true) return;
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setSlide((x) => Math.min(x + 1, (lesson?.steps.length ?? 1) - 1)); }
      if (e.key === "ArrowLeft") setSlide((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [view, lesson?.steps.length]);

  if (!on || r.state === "off" || hiddenLessons.includes(id)) return <NotFound />;
  if (r.state === "loading") return <Loading />;
  if (r.state === "error" || !lesson) return <ErrorBox onRetry={r.retry} />;
  const cat = ixr.data?.categories.find((c) => c.id === lesson.category);
  if (hiddenCats.includes(lesson.category) && false) return <NotFound />;
  const animOn = s.get("gk.anim.enabled") === true;
  const offIds = csv(s.get("gk.anim.disabledIds"));
  const speed = speedOf(s.get("gk.anim.speed"));
  const visual = (vid?: string) => (vid ? <GkVisual id={vid} animate={animOn && s.get("gk.anim.autoplay") === true && !offIds.includes(vid)} speed={speed} controls={animOn && s.get("gk.anim.controls") === true && !offIds.includes(vid)} caption={s.get("gk.anim.caption") === true} lang={lang} /> : null);
  const nameOf = (st: GkLessonOut["steps"][number], i: number) => `${i + 1}. ${st.title}`;
  const finish = () => { if (s.get("gk.progress.track") === true) markGkDone(lesson.id); };
  const related = ixr.data ? sortItems(visibleItems(ixr.data, { hiddenCats, hiddenLessons }).filter((i) => i.id !== lesson.id && (i.category === lesson.category || i.tags.some((t) => lesson.tags.includes(t)))), "curated").slice(0, Number(s.get("gk.related.max") ?? 3)) : [];
  const listen = audioOn && narrator.source !== "none" && (
    <button type="button" className="btn sm" onClick={() => (narrator.playing ? narrator.pause() : narrator.play(view === "slides" ? nar.stepStart[slide] : undefined))}>{narrator.playing ? `⏸ ${gt("pause", lang)}` : `🔊 ${gt("listen", lang)}`}</button>
  );
  const fs = () => { void stage.current?.requestFullscreen?.(); };
  const stepBody = (st: GkLessonOut["steps"][number], i: number, slideMode: boolean) => (
    <>
      {visual(st.visual)}
      {slideMode && s.get("gk.slides.bullets") === true && st.points.length > 0 ? <ul className="gk-points">{st.points.map((p) => <li key={p}>{p}</li>)}</ul> : (
        <p className="gk-says">{st.sentences.map((t, k) => { const gi = nar.stepStart[i]! + k; return <span key={k} className={narrator.playing && narrator.index === gi ? "gk-now" : undefined}>{t} </span>; })}</p>
      )}
    </>
  );
  return (
    <main className="gk gk-lesson" data-testid="gk-lesson">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/gk", label: s.text("gk.tab.label") || gt("title", lang) }, { label: lesson.title }]} />
      <p className="gk-kicker">{cat ? `${cat.emoji} ${cat.title} · ` : ""}{gt("ageLabel", lang)} {lesson.age}{lesson.kind === "puzzle" ? ` · 🧩 ${gt("kindPuzzle", lang)}` : ""}</p>
      <h1><span aria-hidden="true">{lesson.emoji}</span> {lesson.title}</h1>
      <p className="lead">{lesson.summary}</p>
      {s.get("gk.asOf.show") === true && lesson.asOf && <p className="small">{gt("asOf", lang)} {lesson.asOf}</p>}
      {lesson.kind === "puzzle" && lesson.method && s.get("gk.puzzle.showMethod") === true && <p className="gk-method">{gt("method", lang)}: <b>{lesson.method}</b></p>}
      <div className="gk-bar noprint">
        {slidesOk && (
          <span className="gk-chips" role="group" aria-label="View">
            <button type="button" className={`chip${view === "lesson" ? " on" : ""}`} aria-pressed={view === "lesson"} onClick={() => setView("lesson")}>{gt("lessonView", lang)}</button>
            <button type="button" className={`chip${view === "slides" ? " on" : ""}`} aria-pressed={view === "slides"} onClick={() => { setView("slides"); setSlide(0); }}>{gt("slidesView", lang)}</button>
          </span>
        )}
        {listen}
        {s.get("gk.share.show") === true && <button type="button" className="btn ghost sm" onClick={() => { void navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true), () => { /* ignore */ }); }}>🔗 {copied ? gt("copied", lang) : gt("share", lang)}</button>}
        {s.get("gk.print.enabled") === true && <button type="button" className="btn ghost sm" onClick={() => window.print()}>🖨 {gt("print", lang)}</button>}
      </div>
      {view === "lesson" ? (
        <div className="gk-steps">
          {lesson.steps.map((st, i) => <section key={st.id} className="gk-step"><h2>{nameOf(st, i)}</h2>{stepBody(st, i, false)}</section>)}
        </div>
      ) : (
        <div className="gk-slides" ref={stage} data-testid="gk-slides">
          <div className="gk-slide">
            <p className="small">{slide + 1} / {lesson.steps.length}</p>
            <h2>{lesson.steps[slide]!.title}</h2>
            {stepBody(lesson.steps[slide]!, slide, true)}
          </div>
          <div className="gk-slide-nav noprint">
            <button type="button" className="btn ghost" disabled={slide === 0} onClick={() => setSlide((x) => x - 1)}>← {gt("prev", lang)}</button>
            {s.get("gk.slides.fullscreen") === true && <button type="button" className="btn ghost sm" onClick={fs}>⛶ {gt("fullscreen", lang)}</button>}
            {slide < lesson.steps.length - 1 ? <button type="button" className="btn" onClick={() => setSlide((x) => x + 1)}>{gt("next", lang)} →</button> : <button type="button" className="btn" onClick={() => { finish(); setView("lesson"); }}>{gt("finish", lang)} ✓</button>}
          </div>
        </div>
      )}
      {s.get("gk.facts.enabled") === true && lesson.facts.length > 0 && (
        <section className="gk-facts"><h2>💡 {gt("facts", lang)}</h2><ul>{lesson.facts.slice(0, Number(s.get("gk.facts.max") ?? 3)).map((f) => <li key={f}>{f}</li>)}</ul></section>
      )}
      {s.get("gk.quiz.enabled") === true && <Quiz lesson={lesson} onDone={finish} />}
      {s.get("gk.notes.show") === true && lesson.notes && <aside className="gk-notes"><h2>{gt("notes", lang)}</h2><p>{lesson.notes}</p></aside>}
      {s.get("gk.related.show") === true && related.length > 0 && <section className="noprint"><h2>{gt("related", lang)}</h2><Grid items={related} done={gkDone()} compact={s.get<string>("gk.cards.style") === "compact"} /></section>}
      <p className="noprint"><Link className="btn ghost" href="/gk">← {gt("back", lang)}</Link>{" "}
        {!(quizHas(lesson) && s.get("gk.quiz.enabled") === true) && s.get("gk.progress.track") === true && <button type="button" className="btn sm" onClick={finish}>✓ {gt("finish", lang)}</button>}</p>
    </main>
  );
}
const quizHas = (l: GkLessonOut) => l.quiz.length > 0;
void GK_ANIMATED_VISUALS;
