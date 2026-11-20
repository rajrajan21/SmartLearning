import { useEffect, useState } from "react";
import { Link } from "wouter";
import { PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { dueIds, readAllRevision } from "../lib/revision";
import { shuffled } from "../lib/practice";
import { QuestionCard } from "../components/QuestionCard";
import { ErrorBox, Loading, NotFound } from "../components/bits";
import { Groups } from "../components/TryIt";

export function RevisePage() {
  const s = useSettings();
  const { lang } = s;
  const on = s.get("feature.mastery") === true && s.get("mastery.revision.enabled") === true;
  const limit = s.get<number>("mastery.revision.dailyLimit");
  const [qs, setQs] = useState<PublicQuestion[] | null | "error">(null);
  const [i, setI] = useState(0), [right, setRight] = useState(0);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!on) return;
    const ids = dueIds(readAllRevision(), limit); // fixed for this session, so answering does not reshuffle the list
    if (ids.length === 0) { setQs([]); return; }
    let alive = true;
    setQs(null); setI(0); setRight(0);
    fetch("/api/v1/practice/by-ids", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids }) })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { if (alive) setQs(shuffled(PublicQuestion.array().parse(d.questions))); })
      .catch(() => { if (alive) setQs("error"); });
    return () => { alive = false; };
  }, [on, limit, tries]);

  if (!on) return <NotFound />;
  if (qs === null) return <Loading />;
  if (qs === "error") return <ErrorBox onRetry={() => setTries((n) => n + 1)} />;
  if (qs.length === 0) return <div className="paper"><h1>{ui("reviseToday", lang)}</h1>{s.get("mistakes.enabled") === true && s.get("mistakes.homeLink.show") === true && <p><Link href="/mistakes">{ui("mistakesOpen", lang)}</Link></p>}<p className="soon-note">{ui("reviseNone", lang)}</p><p><Link className="btn" href="/progress">{ui("myProgress", lang)}</Link></p></div>;
  if (i >= qs.length) {
    return (
      <div className="paper roundend" aria-live="polite">
        <h1>{ui("reviseDone", lang)}</h1>
        <p className="lead">{ui("reviseResult", lang)} {right} {ui("outOf", lang)} {qs.length}</p>
        <p className="small">{ui("reviseHelp", lang)}</p>
        <div className="actions"><Link className="btn" href="/">{ui("home", lang)}</Link><Link className="btn ghost" href="/progress">{ui("myProgress", lang)}</Link></div>
      </div>
    );
  }
  return (
    <div className="paper">
      <h1>{ui("reviseToday", lang)}</h1>
      {s.get("mistakes.enabled") === true && s.get("mistakes.homeLink.show") === true && <p><Link href="/mistakes">{ui("mistakesOpen", lang)}</Link></p>}
      <p className="small step-count">{ui("questionOf", lang)} {i + 1} {ui("ofWord", lang)} {qs.length}</p>
      <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={qs.length} aria-valuenow={i}><span style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      {s.get("explore.tryIt.show") === true && i === 0 && <details className="small explorer"><summary>{ui("explorerTitle", lang)}</summary><Groups /></details>}
      <QuestionCard key={qs[i]!.id} q={qs[i]!} nextLabel={i === qs.length - 1 ? ui("seeResults", lang) : undefined} onDone={(r) => { if (r.correct) setRight((n) => n + 1); setI((n) => n + 1); }} />
    </div>
  );
}
