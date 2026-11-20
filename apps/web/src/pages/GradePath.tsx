import { Link, useParams } from "wouter";
import { chapterPct, type Mastery } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard, useRetry } from "../lib/curriculum";
import { useMastery } from "../lib/mastery";
import { ErrorBox, Loading, NotFound } from "../components/bits";

/** One subject from the lowest to the highest open class: what came before, what comes next. */
export function GradePathPage() {
  const s = useSettings();
  const { lang } = s;
  const { board = "", subject = "" } = useParams<{ board: string; subject: string }>();
  const [attempt, retry] = useRetry();
  const state = useBoard(board, attempt);
  const of = useMastery(true);
  const open = s.get<number[]>("catalog.openClasses");
  if (s.get("browse.crossGrade.show") !== true) return <NotFound />;
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  const rows = state.data.classes.filter((c) => open.includes(c.classLevel)).sort((a, b) => a.classLevel - b.classLevel)
    .map((c) => ({ c, sub: c.subjects.find((x) => x.slug === subject) })).filter((r) => r.sub && r.sub.chapters.length > 0);
  if (rows.length === 0) return <NotFound />;
  const name = s.name(rows[0]!.sub!.name);
  return (
    <div className="paper">
      <h1>{name}: {ui("gradePathTitle", lang)}</h1>
      <p className="lead">{ui("gradePathIntro", lang)}</p>
      <ol className="gpath">
        {rows.map(({ c, sub }) => (
          <li key={c.classLevel} className="gp-class">
            <h2><Link href={`/${board.toLowerCase()}/${c.classLevel}/${subject}`}>{ui("classWord", lang)} {c.classLevel}</Link></h2>
            <ul className="p-tiles">
              {sub!.chapters.map((ch, n) => {
                const ms = ch.topics.map((t) => of(t.id)).filter((m): m is Mastery => m !== null);
                const pct = ms.length ? chapterPct(ms) : 0;
                const lv = ms.length === 0 ? "new" : ms.every((m) => m.level === "mastered") ? "mastered" : ms.every((m) => m.level === "mastered" || m.level === "strong") ? "strong" : ms.some((m) => m.level !== "new") ? "practising" : "new";
                return (
                  <li key={ch.id}>
                    <Link className={`p-tile m-${lv}`} href={`/${board.toLowerCase()}/${c.classLevel}/${subject}/${ch.slug}`} title={`${s.name(ch.name)} · ${pct}%`}>
                      <span className="p-n">{n + 1}</span><span className="p-name">{s.name(ch.name)}</span><span className="p-pct">{pct}%</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
