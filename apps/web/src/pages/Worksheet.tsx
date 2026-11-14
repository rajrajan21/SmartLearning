import { useEffect, useState } from "react";
import { Link } from "wouter";
import type { PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { useAccount } from "../lib/account";
import { ui } from "../lib/i18n";
import { shuffled } from "../lib/practice";
import { useChapterPool } from "../lib/chapterTools";
import { ErrorBox, Loading, NotFound } from "../components/bits";
import { useChapterScope } from "./Exam";

export function WorksheetPage() {
  const s = useSettings();
  const { lang } = s;
  const acct = useAccount();
  const sc = useChapterScope();
  const on = s.get("feature.worksheets") === true && s.get("feature.practice") === true;
  const pool = useChapterPool(sc.board, sc.cls, sc.subject, sc.chapter, sc.topics, on && sc.tree.status === "ready");
  const [paper, setPaper] = useState<PublicQuestion[]>([]);
  const [key, setKey] = useState<Record<string, { en: string; ta?: string }> | null>(null);
  const [keyErr, setKeyErr] = useState(false);
  const all = pool.status === "ready" ? pool.data : [];
  const n = s.get<number>("worksheets.questionCount");

  const make = () => { setPaper(shuffled(all).slice(0, n)); setKey(null); setKeyErr(false); };
  useEffect(() => { if (pool.status === "ready") make(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pool.status]);

  const showKey = async () => {
    setKeyErr(false);
    const r = await fetch("/api/v1/practice/answer-key", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: paper.map((q) => q.id) }) });
    if (!r.ok) { setKeyErr(true); return; }
    const d = (await r.json()) as { answers: { id: string; answer: { en: string; ta?: string } }[] };
    setKey(Object.fromEntries(d.answers.map((a) => [a.id, a.answer])));
  };

  if (!on) return <NotFound />;
  if (sc.tree.status === "loading" || pool.status === "loading") return <Loading />;
  if (sc.tree.status === "error" || pool.status === "error") return <ErrorBox onRetry={sc.retry} />;
  if (!sc.ch) return <NotFound />;
  if (all.length === 0) return <div className="paper"><h1>{ui("worksheetWord", lang)}</h1><p className="soon-note">{ui("noQuestionsYet", lang)}</p><Link className="btn" href={sc.back}>{ui("backToChapter", lang)}</Link></div>;
  const keyOn = s.get("worksheets.answerKey") === true;
  return (
    <div className="paper worksheet">
      <div className="actions noprint">
        <button type="button" className="btn" onClick={() => window.print()}>{ui("printWorksheet", lang)}</button>
        <button type="button" className="btn ghost" onClick={make}>{ui("newWorksheet", lang)}</button>
        {keyOn && acct.me && (key ? <button type="button" className="btn ghost" onClick={() => setKey(null)}>{ui("hideKey", lang)}</button> : <button type="button" className="btn ghost" onClick={() => void showKey()}>{ui("showKey", lang)}</button>)}
        <Link className="btn ghost" href={sc.back}>{ui("backToChapter", lang)}</Link>
      </div>
      {keyOn && !acct.me && <p className="small noprint">{ui("keySignIn", lang)}</p>}
      {keyErr && <p className="err noprint" role="alert">{ui("keySignIn", lang)}</p>}
      <h1>{ui("worksheetWord", lang)}: {s.name(sc.ch.name)}</h1>
      {s.get("worksheets.nameLine") === true && <p className="sheet-lines"><span>{ui("nameLine", lang)}: ____________________</span><span>{ui("dateLine", lang)}: ____________</span></p>}
      <ol className="sheet">
        {paper.map((q) => (
          <li key={q.id}>
            <p className="problem">{s.name(q.stem)}</p>
            {q.type === "mcq" && <ul className="sheet-opts">{q.options.map((o) => <li key={o.id}>◯ {s.name(o.text)}</li>)}</ul>}
            {q.type === "true_false" && <p className="sheet-opts">◯ {ui("trueWord", lang)} &nbsp;&nbsp; ◯ {ui("falseWord", lang)}</p>}
            {q.type === "order" && <ul className="sheet-opts">{q.items.map((i) => <li key={i.id}>▫ {s.name(i.text)}</li>)}</ul>}
            {(q.type === "number" || q.type === "short" || q.type === "order") && <p className="blank">{ui("answerLabel", lang)}: ______________________{q.type === "number" && q.unit ? ` ${s.name(q.unit)}` : ""}</p>}
            {key?.[q.id] && <p className="key-line"><b>{ui("rightAnswerIs", lang)}:</b> {s.name(key[q.id]!)}</p>}
          </li>
        ))}
      </ol>
      <p className="small sheet-foot">{s.name(s.get("worksheets.footer"))}</p>
    </div>
  );
}
