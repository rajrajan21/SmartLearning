import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { PracticeSet, type PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { useAccount } from "../lib/account";
import { ui } from "../lib/i18n";
import { useBoard, useRetry, type Load } from "../lib/curriculum";
import { shuffled } from "../lib/practice";
import { chooseQuestions } from "./Exam";
import { ErrorBox, Loading, NotFound } from "../components/bits";

type Term = "quarterly" | "halfyearly" | "annual";
const TERMS: { key: Term; label: "termQuarterly" | "termHalfYearly" | "termAnnual" }[] = [{ key: "quarterly", label: "termQuarterly" }, { key: "halfyearly", label: "termHalfYearly" }, { key: "annual", label: "termAnnual" }];
const objective = (q: PublicQuestion) => q.type === "mcq" || q.type === "true_false" || q.type === "multi" || q.type === "match" || q.type === "order";

/** The chapters a term covers: the first share of the book, at least one chapter. */
export const termChapters = <T,>(chapters: T[], percent: number): T[] => chapters.slice(0, Math.max(1, Math.round((chapters.length * percent) / 100)));

/** A printable practice paper for a term, built from the questions already on the site. */
export function TermPaperPage() {
  const s = useSettings();
  const { lang } = s;
  const acct = useAccount();
  const { board = "", cls = "", subject = "" } = useParams<{ board: string; cls: string; subject: string }>();
  const [attempt, retry] = useRetry();
  const tree = useBoard(board, attempt);
  const [term, setTerm] = useState<Term>("quarterly");
  const [pool, setPool] = useState<Load<PublicQuestion[]>>({ status: "loading" });
  const [paper, setPaper] = useState<PublicQuestion[]>([]);
  const [key, setKey] = useState<Record<string, { en: string; ta?: string }> | null>(null);
  const on = s.get("terms.enabled") === true && s.get("feature.practice") === true;
  const sub = tree.status === "ready" ? tree.data.classes.find((c) => String(c.classLevel) === cls)?.subjects.find((x) => x.slug === subject) : undefined;
  const pct = s.get<number>(`terms.${term}.percent`);
  const chapters = useMemo(() => (sub ? termChapters(sub.chapters, pct) : []), [sub, pct]);
  const ids = chapters.map((c) => c.slug).join("|");

  useEffect(() => {
    if (!on || !sub) return;
    let alive = true;
    setPool({ status: "loading" });
    const jobs = chapters.flatMap((c) => c.topics.map((t) => fetch(`/api/v1/practice/boards/${board}/${cls}/${subject}/${c.slug}/${t.slug}`)
      .then((r) => (r.status === 404 ? null : r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => (raw ? PracticeSet.parse(raw).questions : []))));
    Promise.all(jobs).then((l) => { if (alive) setPool({ status: "ready", data: l.flat() }); }).catch(() => { if (alive) setPool({ status: "error" }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, sub, ids, board, cls, subject]);

  const all = pool.status === "ready" ? pool.data : [];
  const n = s.get<number>("terms.questionCount");
  const make = () => { const pick = chooseQuestions(all, n, true); setPaper([...pick.filter(objective), ...pick.filter((q) => !objective(q))]); setKey(null); };
  useEffect(() => { if (pool.status === "ready") make(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pool.status, term]);

  const showKey = async () => {
    const r = await fetch("/api/v1/practice/answer-key", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: paper.map((q) => q.id) }) });
    if (!r.ok) return;
    const d = (await r.json()) as { answers: { id: string; answer: { en: string; ta?: string } }[] };
    setKey(Object.fromEntries(d.answers.map((a) => [a.id, a.answer])));
  };

  if (!on) return <NotFound />;
  if (tree.status === "loading") return <Loading />;
  if (tree.status === "error") return <ErrorBox onRetry={retry} />;
  if (!sub) return <NotFound />;
  const mo = s.get<number>("exams.paper.marksObjective"), mw = s.get<number>("exams.paper.marksWritten");
  const total = paper.reduce((t, q) => t + (objective(q) ? mo : mw), 0);
  return (
    <div className="paper worksheet">
      <div className="actions noprint">
        {TERMS.map((t) => <button key={t.key} type="button" className={`btn ghost${term === t.key ? " on" : ""}`} aria-pressed={term === t.key} onClick={() => setTerm(t.key)}>{ui(t.label, lang)}</button>)}
      </div>
      <h1>{ui(TERMS.find((t) => t.key === term)!.label, lang)}: {s.name(sub.name)}</h1>
      <p className="small noprint">{ui("termIntro", lang)}</p>
      <p className="small">{ui("termChapters", lang)}: {chapters.map((c) => s.name(c.name)).join(", ")}</p>
      {pool.status === "loading" && <Loading />}
      {pool.status === "error" && <ErrorBox onRetry={retry} />}
      {pool.status === "ready" && paper.length < 4 && <p className="soon-note">{ui("termNoQuestions", lang)}</p>}
      {pool.status === "ready" && paper.length >= 4 && (
        <>
          <div className="actions noprint">
            <button type="button" className="btn" onClick={() => window.print()}>{ui("printWorksheet", lang)}</button>
            <button type="button" className="btn ghost" onClick={make}>{ui("termNew", lang)}</button>
            {acct.me && (key ? <button type="button" className="btn ghost" onClick={() => setKey(null)}>{ui("hideKey", lang)}</button> : <button type="button" className="btn ghost" onClick={() => void showKey()}>{ui("showKey", lang)}</button>)}
            <Link className="btn ghost" href={`/${board}/${cls}/${subject}`}>{ui("backToChapter", lang)}</Link>
          </div>
          <p className="sheet-lines"><span>{ui("paperClass", lang)} {cls}</span><span>{ui("paperMarks", lang)}: {total}</span><span>{ui("paperTime", lang)}: {s.get<number>("terms.minutes")} {ui("paperMin", lang)}</span></p>
          {s.get("worksheets.nameLine") === true && <p className="sheet-lines"><span>{ui("nameLine", lang)}: ____________________</span><span>{ui("dateLine", lang)}: ____________</span></p>}
          <p className="small">{s.get<string>("exams.paper.instructions")}</p>
          <ol className="sheet">
            {paper.map((q, qi) => (
              <li key={q.id}>
                {(qi === 0 || objective(q) !== objective(paper[qi - 1]!)) && <p className="sheet-sec"><b>{objective(q) ? ui("paperSecA", lang) : ui("paperSecB", lang)}</b></p>}
                {q.passage && <blockquote className="q-passage">{s.name(q.passage)}</blockquote>}
                <p className="problem">{s.name(q.stem)} [{objective(q) ? mo : mw}]</p>
                {(q.type === "mcq" || q.type === "multi") && <ul className="sheet-opts">{q.options.map((o) => <li key={o.id}>{q.type === "mcq" ? "◯" : "☐"} {s.name(o.text)}</li>)}</ul>}
                {q.type === "true_false" && <p className="sheet-opts">◯ {ui("trueWord", lang)} &nbsp;&nbsp; ◯ {ui("falseWord", lang)}</p>}
                {q.type === "order" && <ul className="sheet-opts">{shuffled(q.items).map((i) => <li key={i.id}>▫ {s.name(i.text)}</li>)}</ul>}
                {q.type === "match" && <div className="sheet-match"><ul>{q.lefts.map((l) => <li key={l.id}>{s.name(l.text)} → ______</li>)}</ul><ul>{q.rights.map((r, i) => <li key={r.id}>{String.fromCharCode(97 + i)}. {s.name(r.text)}</li>)}</ul></div>}
                {q.type === "long" && <p className="blank">_______________________________________________<br />_______________________________________________</p>}
                {(q.type === "number" || q.type === "short" || q.type === "order") && <p className="blank">{ui("answerLabel", lang)}: ______________________</p>}
                {key?.[q.id] && <p className="key-line"><b>{ui("rightAnswerIs", lang)}:</b> {s.name(key[q.id]!)}</p>}
              </li>
            ))}
          </ol>
          <p className="small sheet-foot">{s.name(s.get("worksheets.footer"))}</p>
        </>
      )}
    </div>
  );
}
