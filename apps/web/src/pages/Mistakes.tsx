import { useEffect, useState } from "react";
import { FilterBox, matches } from "../components/SearchBox";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { onMistakesChange, readMistakes, removeMistake, type Mistake } from "../lib/mistakes";
import { shuffled } from "../lib/practice";
import { NotFound } from "../components/bits";

export function MistakesPage() {
  const s = useSettings();
  const { lang } = s;
  const [list, setList] = useState<Mistake[]>(readMistakes);
  const [deck, setDeck] = useState<Mistake[] | null>(null);
  const [flip, setFlip] = useState(false);
  const [mq, setMq] = useState("");
  const [n, setN] = useState(0);
  useEffect(() => onMistakesChange(() => setList(readMistakes())), []);
  if (s.get("feature.mastery") !== true || s.get("mistakes.enabled") !== true) return <NotFound />;
  const cards = s.get("flashcards.enabled") === true;
  const answer = (knew: boolean) => {
    if (knew && s.get("mistakes.removeWhenRight") === true && deck) removeMistake(deck[n]!.id);
    setFlip(false); setN((x) => x + 1);
  };
  if (deck) {
    const c = deck[n];
    return (
      <div className="paper">
        <h1>{ui("mistakesTitle", lang)}</h1>
        {!c ? (
          <p>{ui("flashDone", lang)} <button className="btn" type="button" onClick={() => { setDeck(null); setN(0); }}>{ui("mistakesOpen", lang)}</button></p>
        ) : (
          <section className="flash" aria-live="polite">
            <p className="small">{n + 1} / {deck.length}</p>
            <div className={`flash-card${flip ? " back" : ""}`}>
              <p className="problem">{flip ? s.name(c.answer) : s.name(c.stem)}</p>
              {flip && <p>{s.name(c.why)}</p>}
            </div>
            {!flip ? <button type="button" className="btn" onClick={() => setFlip(true)}>{ui("flashFlip", lang)}</button> : (
              <div className="q-actions">
                <button type="button" className="btn" onClick={() => answer(true)}>{ui("flashKnew", lang)}</button>
                <button type="button" className="btn ghost" onClick={() => answer(false)}>{ui("flashNot", lang)}</button>
              </div>
            )}
          </section>
        )}
      </div>
    );
  }
  return (
    <div className="paper">
      <h1>{ui("mistakesTitle", lang)}</h1>
      <p>{ui("mistakesIntro", lang)}</p>
      {list.length === 0 ? <p>{ui("mistakesEmpty", lang)}</p> : (
        <>
          {cards && <button type="button" className="btn" onClick={() => { setDeck(shuffled(list)); setN(0); setFlip(false); }}>{ui("flashStart", lang)}</button>}
          {list.length > 4 && <FilterBox value={mq} onChange={setMq} />}
          <ul className="mistakes">
            {list.filter((m) => matches(mq, s.name(m.stem), s.name(m.answer))).map((m) => <li key={m.id}><b>{s.name(m.stem)}</b><br />✓ {s.name(m.answer)}<br /><span className="small">{s.name(m.why)}</span></li>)}
          </ul>
        </>
      )}
      <p><Link href="/revise">{ui("reviseToday", lang)}</Link></p>
    </div>
  );
}
