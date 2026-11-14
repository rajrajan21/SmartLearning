import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { SearchBox } from "../components/SearchBox";
import { useBoard, useRetry } from "../lib/curriculum";
import { useDueCount } from "../lib/revision";
import { Loading, ErrorBox } from "../components/bits";

const COMING_BOARDS = [
  { code: "TNSB", en: "Tamil Nadu State Board", ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம்" },
  { code: "TNMB", en: "Tamil Nadu Matriculation", ta: "தமிழ்நாடு மெட்ரிகுலேஷன்" },
];

export function Home() {
  const s = useSettings();
  const board = s.get<string>("catalog.defaultBoard");
  const [attempt, retry] = useRetry();
  const state = useBoard(board, attempt);
  const open = new Set(s.get<number[]>("catalog.openClasses"));
  const due = useDueCount();
  const mastery = s.get("feature.mastery") === true;
  return (
    <div className="paper">
      {s.get("home.hero.show") && (
        <section className="hero">
          <h1>{s.text("home.hero.title")}</h1>
          <p className="lead">{s.text("home.hero.subtitle")}</p>
        </section>
      )}
      {mastery && s.get("mastery.homeCard") === true && s.get("mastery.revision.enabled") === true && due > 0 && (
        <section className="revise-card" aria-label={ui("reviseToday", s.lang)}>
          <div><h2>{ui("reviseToday", s.lang)}</h2><p>{due} {ui("reviseCount", s.lang)}</p></div>
          <Link className="btn" href="/revise">{ui("reviseStart", s.lang)}</Link>
        </section>
      )}
      {s.get("home.search.show") && s.get("feature.search") && <SearchBox board={board} />}
      {s.get("home.boardPicker.show") && (
        <section aria-labelledby="boards-h">
          <h2 id="boards-h">{ui("board", s.lang)}</h2>
          <ul className="chips">
            <li><span className="chip on" aria-current="true">CBSE</span></li>
            {s.get("catalog.showComingSoon") && COMING_BOARDS.map((b) => (
              <li key={b.code}><span className="chip off" aria-disabled="true">{s.lang === "ta" ? b.ta : b.en} · {ui("soon", s.lang)}</span></li>
            ))}
          </ul>
        </section>
      )}
      {s.get("home.classPicker.show") && (
        <section aria-labelledby="classes-h">
          <h2 id="classes-h">{ui("classWord", s.lang)}</h2>
          {state.status === "loading" && <Loading />}
          {state.status === "error" && <ErrorBox onRetry={retry} />}
          {state.status === "ready" && (
            <ul className="classes">
              {Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => n <= 7 || open.has(n)).map((n) => {
                const has = state.data.classes.some((c) => c.classLevel === n && c.subjects.length > 0);
                const ok = open.has(n) && has;
                return (
                  <li key={n}>
                    {ok ? <Link className="class-tab on" href={`/${board.toLowerCase()}/${n}`}><b>{n}</b><span>{ui("classWord", s.lang)}</span></Link>
                      : <span className="class-tab off" aria-disabled="true"><b>{n}</b><span>{ui("soon", s.lang)}</span></span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
