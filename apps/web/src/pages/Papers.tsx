import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { qKey, scoreByChapter, scorePaper, type Paper, type PaperAttempt, type PaperIndex, type PaperIndexEntry } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { store } from "../lib/storage";
import { ErrorBox, Loading, NotFound } from "../components/bits";

const HISTORY = "papers.history";
type Hist = Record<string, { total: number; of: number; at: string }>;
const sorter = (m: string) => (a: PaperIndexEntry, b: PaperIndexEntry) => (m === "class" ? a.cls - b.cls || a.subject.localeCompare(b.subject) : m === "subject" ? a.subject.localeCompare(b.subject) || a.cls - b.cls : m === "questions" ? b.questions - a.questions : b.added.localeCompare(a.added)) || a.title.localeCompare(b.title);
const BOARD_NAME: Record<string, string> = { cbse: "CBSE", matric: "Matric", stateboard: "State Board", ncert: "NCERT" };
const KIND_NAME: Record<string, string> = { sample: "Sample paper", previous: "Previous year", model: "Model paper", quiz: "Quiz", worksheet: "Worksheet", test: "Test paper" };
const T = (lang: string, en: string, ta: string) => (lang === "ta" ? ta : en);

function useFetch<T>(url: string) {
  const [st, setSt] = useState<{ status: "loading" } | { status: "error" } | { status: "ready"; data: T }>({ status: "loading" });
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true; setSt({ status: "loading" });
    fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))).then((d: T) => live && setSt({ status: "ready", data: d })).catch(() => live && setSt({ status: "error" }));
    return () => { live = false; };
  }, [url, n]);
  return { st, retry: () => setN((x) => x + 1) };
}

/** /papers: every collected paper, filtered by board, class, subject and kind. */
export function PapersListPage() {
  const s = useSettings(); const { lang } = s;
  const on = s.get("feature.papers") === true;
  const { st, retry } = useFetch<PaperIndex>("/api/v1/papers");
  const [f, setF] = useState({ board: "", cls: "", subject: "", kind: "", q: "" });
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<"main" | "hi">("main");
  const per = Number(s.get("papers.perPage") ?? 24);
  const hist = store.getJson<Hist>(HISTORY) ?? {};
  const all: PaperIndexEntry[] = st.status === "ready" ? st.data.papers : [];
  const isHi = (p: PaperIndexEntry) => p.lang === "hi";
  const hiCount = all.filter(isHi).length;
  const showHiTab = s.get("papers.show.lang.hi") !== false && hiCount > 0;
  const inTab = useMemo(() => (showHiTab && tab === "hi" ? all.filter(isHi) : all.filter((p) => !isHi(p))), [all, tab, showHiTab]);
  const subjects = useMemo(() => [...new Set(inTab.map((p) => p.subject))].sort(), [inTab]);
  const rows = useMemo(() => inTab.filter((p) => (!f.board || p.board === f.board) && (!f.cls || p.cls === Number(f.cls)) && (!f.subject || p.subject === f.subject) && (!f.kind || p.kind === f.kind)
    && (!f.q || `${p.title} ${p.chapters.join(" ")}`.toLowerCase().includes(f.q.toLowerCase()))).sort(sorter(String(s.get("papers.list.defaultSort") ?? "newest"))), [inTab, f, s]);
  useEffect(() => setPage(0), [f, tab]);
  if (!on) return <NotFound />;
  if (st.status === "loading") return <Loading />;
  if (st.status === "error") return <ErrorBox onRetry={retry} />;
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const shown = rows.slice(page * per, page * per + per);
  return (
    <main className="papers">
      <h1>{T(lang, "Question papers and quizzes", "வினாத்தாள்கள் மற்றும் வினாடி வினா")}</h1>
      <p className="muted">{T(lang, "Free papers collected from official and open sources. Write your answers, pick options, then check your marks.", "அதிகாரப்பூர்வ மற்றும் திறந்த மூலங்களிலிருந்து சேகரித்த இலவச வினாத்தாள்கள். பதில் எழுதி, மதிப்பெண்களைச் சரிபாருங்கள்.")}</p>
      {showHiTab && <div className="papers-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "main"} className={tab === "main" ? "btn" : "btn ghost"} onClick={() => setTab("main")}>{T(lang, "Question papers", "வினாத்தாள்கள்")} ({all.length - hiCount})</button>
        <button type="button" role="tab" aria-selected={tab === "hi"} className={tab === "hi" ? "btn" : "btn ghost"} onClick={() => setTab("hi")}>{T(lang, "Hindi question papers", "இந்தி வினாத்தாள்கள்")} ({hiCount})</button>
      </div>}
      {s.get("papers.list.showFilters") !== false && <div className="papers-filters">
        <select aria-label="Board" value={f.board} onChange={set("board")}><option value="">{T(lang, "All boards", "எல்லா வாரியங்கள்")}</option>{Object.entries(BOARD_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select aria-label="Class" value={f.cls} onChange={set("cls")}><option value="">{T(lang, "All classes", "எல்லா வகுப்புகள்")}</option>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => <option key={n} value={n}>{T(lang, "Class", "வகுப்பு")} {n}</option>)}</select>
        <select aria-label="Subject" value={f.subject} onChange={set("subject")}><option value="">{T(lang, "All subjects", "எல்லா பாடங்கள்")}</option>{subjects.map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Kind" value={f.kind} onChange={set("kind")}><option value="">{T(lang, "All kinds", "எல்லா வகை")}</option>{Object.entries(KIND_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input type="search" aria-label="Search" placeholder={T(lang, "Search title or chapter", "தேடுக")} value={f.q} onChange={set("q")} />
      </div>}
      {rows.length === 0 ? <div className="notice"><p>{all.length === 0 ? T(lang, "No papers yet. They appear here after the collector job runs.", "இன்னும் வினாத்தாள்கள் இல்லை.") : T(lang, "No papers match these filters.", "பொருந்தும் வினாத்தாள் இல்லை.")}</p></div> : (
        <ul className="papers-list">
          {shown.map((p) => (
            <li key={p.id}><Link href={`/papers/${p.id}`} className="papers-card">
              <b>{p.title}</b>
              <span>{BOARD_NAME[p.board]} · {T(lang, "Class", "வகுப்பு")} {p.cls} · {p.subject}{p.year ? ` · ${p.year}` : ""}</span>
              <span>{KIND_NAME[p.kind]} · {p.questions} {T(lang, "questions", "கேள்விகள்")}{p.mcq ? ` (${p.mcq} ${T(lang, "multiple choice", "பல தேர்வு")})` : ""}{p.maxMarks ? ` · ${p.maxMarks} ${T(lang, "marks", "மதிப்பெண்")}` : ""}</span>
              {s.get("papers.list.showSource") !== false && <small>{T(lang, "Source", "மூலம்")}: {p.source.site}</small>}
              {s.get("papers.list.showLastScore") !== false && hist[p.id] && <strong className="papers-last">{T(lang, "Last score", "கடைசி மதிப்பெண்")}: {hist[p.id]!.total} / {hist[p.id]!.of}</strong>}
            </Link></li>
          ))}
        </ul>
      )}
      {rows.length > per && <p className="papers-pager"><button className="btn ghost sm" disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button> {page + 1} / {Math.ceil(rows.length / per)} <button className="btn ghost sm" disabled={(page + 1) * per >= rows.length} onClick={() => setPage(page + 1)}>›</button></p>}
    </main>
  );
}

const blank = (id: string): PaperAttempt => ({ paperId: id, answers: {}, notes: {}, given: {} });

/** /papers/:id: answer, submit, then review (auto-marked choices, model answers, reviewer marks for written answers). */
export function PaperPage({ params }: { params: { id: string } }) {
  const s = useSettings(); const { lang } = s;
  const on = s.get("feature.papers") === true;
  const { st, retry } = useFetch<Paper>(`/api/v1/papers/${encodeURIComponent(params.id)}`);
  const sk = `papers.attempt.${params.id}`;
  const [a, setA] = useState<PaperAttempt>(() => store.getJson<PaperAttempt>(sk) ?? blank(params.id));
  useEffect(() => { setA(store.getJson<PaperAttempt>(sk) ?? blank(params.id)); }, [sk, params.id]);
  const save = useCallback((n: PaperAttempt) => { setA(n); store.setJson(sk, n); }, [sk]);
  if (!on) return <NotFound />;
  if (st.status === "loading") return <Loading />;
  if (st.status === "error") return <NotFound />;
  const p = st.data;
  const done = !!a.submittedAt;
  const reviewOn = s.get("papers.review.enabled") !== false;
  const reviewerOn = s.get("papers.reviewer.enabled") !== false;
  const modelOn = s.get("papers.showModelAnswers") !== false;
  const sc = scorePaper(p, a, { negative: Number(s.get("papers.marking.negative") ?? 0) });
  const passPct = Number(s.get("papers.marking.passPercent") ?? 40);
  const showMarks = s.get("papers.taking.showMarksPerQuestion") !== false;
  const showNotes = s.get("papers.taking.showNotes") !== false;
  const started = (x: PaperAttempt): PaperAttempt => (x.startedAt ? x : { ...x, startedAt: new Date().toISOString() });
  const setAns = (k: string, v: string) => save(started({ ...a, answers: { ...a.answers, [k]: v } }));
  const setNote = (k: string, v: string) => save({ ...a, notes: { ...a.notes, [k]: v } });
  const submit = () => {
    if (s.get("papers.taking.confirmSubmit") !== false && sc.unanswered > 0 && !window.confirm(T(lang, `${sc.unanswered} questions are not answered. Submit anyway?`, `${sc.unanswered} கேள்விகளுக்குப் பதில் இல்லை. சமர்ப்பிக்கவா?`))) return;
    const n = { ...a, submittedAt: new Date().toISOString() }; save(n);
    const t = scorePaper(p, n, { negative: Number(s.get("papers.marking.negative") ?? 0) }); store.setJson(HISTORY, { ...(store.getJson<Hist>(HISTORY) ?? {}), [p.id]: { total: t.total, of: t.of, at: n.submittedAt } });
  };
  const setGivenAndHist = (k: string, v: number) => {
    const n = { ...a, given: { ...a.given, [k]: v } }; save(n);
    const t = scorePaper(p, n, { negative: Number(s.get("papers.marking.negative") ?? 0) }); store.setJson(HISTORY, { ...(store.getJson<Hist>(HISTORY) ?? {}), [p.id]: { total: t.total, of: t.of, at: n.submittedAt ?? new Date().toISOString() } });
  };
  const minutes = a.startedAt && a.submittedAt ? Math.max(1, Math.round((Date.parse(a.submittedAt) - Date.parse(a.startedAt)) / 60000)) : null;
  const byChapter = done && s.get("papers.marking.showChapterBreakdown") !== false ? scoreByChapter(p, a) : [];
  const again = () => { store.set(sk, ""); setA(blank(params.id)); window.scrollTo?.(0, 0); };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ paper: p.id, title: p.title, score: sc, attempt: a }, null, 1)], { type: "application/json" });
    const el = document.createElement("a"); el.href = URL.createObjectURL(blob); el.download = `${p.id}-attempt.json`; el.click(); URL.revokeObjectURL(el.href);
  };
  return (
    <main className="papers paper">
      <p><Link href="/papers">‹ {T(lang, "All papers", "எல்லா வினாத்தாள்கள்")}</Link></p>
      <h1>{p.title}</h1>
      <p className="muted">{BOARD_NAME[p.board]} · {T(lang, "Class", "வகுப்பு")} {p.cls} · {p.subject}{p.year ? ` · ${p.year}` : ""}{p.maxMarks ? ` · ${p.maxMarks} ${T(lang, "marks", "மதிப்பெண்")}` : ""}{p.minutes ? ` · ${p.minutes} min` : ""}</p>
      <p className="papers-source">{T(lang, "Source", "மூலம்")}: <a href={p.source.url} target="_blank" rel="noopener noreferrer">{p.source.site}</a>{p.source.license ? ` — ${p.source.license}` : ""}</p>
      {done && reviewOn && (
        <section className="papers-score" aria-live="polite">
          <h2>{T(lang, "Your marks", "உங்கள் மதிப்பெண்")}: {sc.total} / {sc.of}</h2>
          {sc.of > 0 && <p><b>{sc.total / sc.of * 100 >= passPct ? T(lang, "Well done!", "நன்று!") : T(lang, "Keep practising, you will get there.", "தொடர்ந்து பயிற்சி செய்யுங்கள்.")}</b> {Math.round((sc.total / sc.of) * 100)}%</p>}
          <p>{sc.autoOf > 0 && <>{T(lang, "Multiple choice (marked automatically)", "பல தேர்வு (தானாகத் திருத்தம்)")}: {sc.auto} / {sc.autoOf}. </>}{sc.reviewerOf > 0 && <>{T(lang, "Written answers (marked by a parent or teacher)", "எழுத்து விடைகள் (பெற்றோர்/ஆசிரியர் திருத்தம்)")}: {sc.reviewer} / {sc.reviewerOf}. </>}{sc.unanswered > 0 && <>{sc.unanswered} {T(lang, "not answered", "பதிலில்லை")}.</>}</p>
          {minutes !== null && <p className="muted">{T(lang, "Time taken", "எடுத்த நேரம்")}: {minutes} {T(lang, "min", "நிமி")}</p>}
          {byChapter.length > 1 && (
            <div className="papers-chapters">
              <h3>{T(lang, "How you did by chapter", "அத்தியாயம் வாரியாக உங்கள் நிலை")}</h3>
              <ul>{byChapter.map((c) => <li key={c.chapter}><span>{c.chapter}</span><span className="papers-bar" role="img" aria-label={`${c.got} of ${c.of}`}><i style={{ width: `${Math.round((c.got / c.of) * 100)}%` }} /></span><b>{c.got}/{c.of}</b></li>)}</ul>
              <p className="muted">{T(lang, "Start your revision with the chapters at the top.", "மேலே உள்ள அத்தியாயங்களிலிருந்து திருப்புதலைத் தொடங்குங்கள்.")}</p>
            </div>
          )}
          {sc.wrong.length > 0 && s.get("papers.marking.showWrongLinks") !== false && <p>{T(lang, "To check again", "மீண்டும் பார்க்க")}: {sc.wrong.map((k) => <a key={k} className="chip" href={`#q-${k}`}>{T(lang, "Q", "கே")} {(() => { const [x, y] = k.split(".").map(Number); return p.sections[x!]!.questions[y!]!.n; })()}</a>)}</p>}
          <p className="papers-actions">
            {s.get("papers.taking.allowDownload") !== false && <button className="btn ghost sm" onClick={exportJson}>{T(lang, "Download result", "முடிவைப் பதிவிறக்கு")}</button>}
            {s.get("papers.taking.allowPrint") !== false && <button className="btn ghost sm" onClick={() => window.print()}>{T(lang, "Print", "அச்சிடு")}</button>}
            {s.get("papers.taking.allowRetry") !== false && <button className="btn ghost sm" onClick={again}>{T(lang, "Try again", "மீண்டும் முயல்")}</button>}
          </p>
        </section>
      )}
      {p.sections.map((sec, si) => (
        <section key={si} className="papers-section">
          <h2>{sec.title}</h2>
          {sec.instructions && <p className="muted">{sec.instructions}</p>}
          <ol className="papers-qs" start={1}>
            {sec.questions.map((q, qi) => {
              const k = qKey(si, qi); const ans = a.answers[k] ?? ""; const choice = q.type === "mcq" || q.type === "tf";
              const correct = choice && q.answer ? ans.toUpperCase() === q.answer.toUpperCase() : null;
              const letter = (i: number) => String.fromCharCode(65 + i);
              const opts = q.type === "tf" && !q.options ? ["True", "False"] : q.options ?? [];
              return (
                <li key={k} id={`q-${k}`} className={`papers-q${done && correct === true ? " right" : ""}${done && correct === false ? " wrong" : ""}`} value={Number(q.n) || undefined}>
                  <p className="papers-qtext"><span className="papers-qn">{q.n}.</span> {q.text}{q.marks && showMarks ? <small className="papers-marks"> [{q.marks}]</small> : null}</p>
                  {choice && opts.length > 0 ? (
                    <div role="radiogroup" aria-label={`Question ${q.n}`} className="papers-opts">
                      {opts.map((o, i) => (
                        <label key={i} className={`papers-opt${done && q.answer?.toUpperCase() === letter(i) ? " is-key" : ""}${done && ans === letter(i) && correct === false ? " is-bad" : ""}`}>
                          <input type="radio" name={k} disabled={done} checked={ans === letter(i)} onChange={() => setAns(k, letter(i))} /> <b>{letter(i)}.</b> {o}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea aria-label={`Answer to question ${q.n}`} className="papers-box" rows={q.type === "long" ? 6 : q.type === "fill" ? 1 : 3} disabled={done} value={ans} placeholder={T(lang, "Write your answer here", "இங்கே பதில் எழுதுங்கள்")} onChange={(e) => setAns(k, e.target.value)} />
                  )}
                  {!done && showNotes && <input className="papers-note" aria-label={`Notes for question ${q.n}`} value={a.notes[k] ?? ""} placeholder={T(lang, "Your notes (optional)", "குறிப்பு (விரும்பினால்)")} onChange={(e) => setNote(k, e.target.value)} />}
                  {done && reviewOn && (
                    <div className="papers-review">
                      {choice && q.answer && <p>{correct ? "✔" : "✘"} {T(lang, "Your answer", "உங்கள் பதில்")}: <b>{ans || "—"}</b> · {T(lang, "Correct answer", "சரியான விடை")}: <b>{q.answer}</b></p>}
                      {a.notes[k] && <p>{T(lang, "Your notes", "உங்கள் குறிப்பு")}: {a.notes[k]}</p>}
                      {modelOn && q.model && <p className="papers-model"><b>{T(lang, "Marking scheme answer", "மதிப்பீட்டு விடை")}:</b> {q.model}</p>}
                      {!choice && reviewerOn && (
                        <div className="papers-mark" role="group" aria-label={`Marks for question ${q.n}`}>
                          <span>{T(lang, "Marks (you or a parent/teacher)", "மதிப்பெண் (நீங்கள் அல்லது பெற்றோர்/ஆசிரியர்)")}:</span>
                          <button type="button" className="chip" onClick={() => setGivenAndHist(k, 0)}>{T(lang, "None", "இல்லை")}</button>
                          <button type="button" className="chip" onClick={() => setGivenAndHist(k, (q.marks ?? 1) / 2)}>{T(lang, "Half", "பாதி")}</button>
                          <button type="button" className="chip" onClick={() => setGivenAndHist(k, q.marks ?? 1)}>{T(lang, "Full", "முழுமை")}</button>
                          <input type="number" aria-label={`Marks given for question ${q.n}`} min={0} max={q.marks ?? 1} step={0.5} value={a.given[k] ?? 0} onChange={(e) => setGivenAndHist(k, Math.min(q.marks ?? 1, Math.max(0, Number(e.target.value) || 0)))} /> / {q.marks ?? 1}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      {!done && <p><button className="btn" onClick={submit}>{T(lang, "Submit and check", "சமர்ப்பித்துச் சரிபார்")}</button></p>}
    </main>
  );
}
