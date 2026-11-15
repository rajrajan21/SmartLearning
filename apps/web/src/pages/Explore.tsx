import { useState } from "react";
import { BottomSheet } from "../components/BottomSheet";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard, useRetry } from "../lib/curriculum";
import { useAllProgress } from "../lib/progress";
import { exploreItems, THEMES, THEME_MORE } from "../lib/tier2";
import { ErrorBox, Loading, NotFound, Title } from "../components/bits";
import { TextbookEntry } from "../components/reader/TextbookEntry";

/** Browse by colour and theme, with predictable filters (class, subject, theme). */
export function ExplorePage() {
  const s = useSettings();
  const board = s.get<string>("catalog.defaultBoard");
  const [attempt, retry] = useRetry();
  const state = useBoard(board, attempt);
  const progress = useAllProgress();
  const open = s.get<number[]>("catalog.openClasses");
  const [cls, setCls] = useState(0);
  const [subject, setSubject] = useState("");
  const [lang, setLang] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [theme, setTheme] = useState(() => (typeof location === "undefined" ? "" : new URLSearchParams(location.search).get("theme") ?? ""));
  if (s.get("browse.explore.enabled") !== true) return <NotFound />;
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  const tree = state.data as never;
  const subjects = [...new Map(state.data.classes.filter((c) => open.includes(c.classLevel)).flatMap((c) => c.subjects).map((x) => [x.slug, x.name])).entries()];
  const all = exploreItems(tree, board, open);
  const items = exploreItems(tree, board, open, { cls: cls || undefined, subject: subject || undefined, theme: theme || undefined, tamil: lang || undefined });
  const presentThemes = [...THEMES, THEME_MORE].filter((t) => all.some((i) => i.theme.id === t.id));
  const grouped = presentThemes.map((t) => ({ t, list: items.filter((i) => i.theme.id === t.id) })).filter((g) => g.list.length > 0);
  const sheetOn = s.get("browse.explore.sheet") === true;
  const langOn = s.get("browse.explore.langChip") === true;
  const activeN = (cls ? 1 : 0) + (subject ? 1 : 0);
  const reset = () => { setCls(0); setSubject(""); setTheme(""); setLang(false); };
  const classSel = (
    <label>{ui("filterClass", s.lang)}
      <select value={cls} onChange={(e) => setCls(Number(e.target.value))}>
        <option value={0}>{ui("filterAll", s.lang)}</option>
        {[...open].sort((a, b) => a - b).map((c) => <option key={c} value={c}>{ui("classWord", s.lang)} {c}</option>)}
      </select>
    </label>
  );
  const subjectSel = (
    <label>{ui("filterSubject", s.lang)}
      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
        <option value="">{ui("filterAll", s.lang)}</option>
        {subjects.map(([slug, name]) => <option key={slug} value={slug}>{s.name(name)}</option>)}
      </select>
    </label>
  );
  return (
    <div className={`paper explore${sheetOn ? " with-sheet" : ""}`}>
      <h1>{ui("exploreTitle", s.lang)}</h1>
      <p className="lead">{ui("exploreIntro", s.lang)}</p>
      <div className="filters" role="group" aria-label={ui("exploreTitle", s.lang)}>
        {classSel}{subjectSel}
      </div>
      {sheetOn && (
        <div className="explore-bar" role="group" aria-label={ui("filtersBtn", s.lang)}>
          <button type="button" className={activeN > 0 ? "chip on" : "chip"} aria-haspopup="dialog" onClick={() => setSheet(true)}>⚙ {ui("filtersBtn", s.lang)}{activeN > 0 ? ` (${activeN})` : ""}</button>
          {langOn && <button type="button" className={lang ? "chip on" : "chip"} aria-pressed={lang} onClick={() => setLang(!lang)}>🔤 {ui("filterLangTa", s.lang)}</button>}
        </div>
      )}
      {!sheetOn && langOn && (
        <div className="theme-chips"><button type="button" className={lang ? "chip on" : "chip"} aria-pressed={lang} onClick={() => setLang(!lang)}>🔤 {ui("filterLangTa", s.lang)}</button></div>
      )}
      <div className="theme-chips" role="group" aria-label={ui("filterTheme", s.lang)}>
        <button type="button" className={theme === "" ? "chip on" : "chip"} aria-pressed={theme === ""} onClick={() => setTheme("")}>{ui("filterAll", s.lang)}</button>
        {presentThemes.map((t) => (
          <button key={t.id} type="button" className={theme === t.id ? "chip on" : "chip"} aria-pressed={theme === t.id} style={{ ["--tc" as string]: t.colour }} onClick={() => setTheme(theme === t.id ? "" : t.id)}>
            <span aria-hidden="true">{t.icon}</span> {ui(t.label, s.lang)}
          </button>
        ))}
      </div>
      {grouped.length === 0 && <p className="soon-note">{ui("exploreNone", s.lang)}</p>}
      {grouped.map(({ t, list }) => (
        <section key={t.id} className="theme-gallery" style={{ ["--tc" as string]: t.colour }} aria-label={ui(t.label, s.lang)}>
          <h2><span aria-hidden="true">{t.icon}</span> {ui(t.label, s.lang)} <span className="small">{list.length} {ui("exploreCount", s.lang)}</span></h2>
          <ul>
            {list.map((i) => (
              <li key={i.id}>
                <Link href={i.href} className="tcard">
                  <b><Title name={i.topic} /></b>
                  <span className="small"><Title name={i.subject} /> · {ui("classWord", s.lang)} {i.classLevel}</span>
                  {progress[i.id]?.done && <span className="tick" aria-label={ui("lessonTick", s.lang)}>✓</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {cls > 0 && <div className="explore-books notebooks"><TextbookEntry level={cls} as="div" /></div>}
      {sheetOn && (
        <BottomSheet open={sheet} onClose={() => setSheet(false)} title={ui("filtersBtn", s.lang)}>
          <div className="filter-sheet">
            {classSel}{subjectSel}
            {langOn && <button type="button" className={lang ? "chip on" : "chip"} aria-pressed={lang} onClick={() => setLang(!lang)}>🔤 {ui("filterLangTa", s.lang)}</button>}
            <div className="actions"><button type="button" className="btn ghost" onClick={reset}>{ui("filterReset", s.lang)}</button><button type="button" className="btn" onClick={() => setSheet(false)}>{ui("filterApply", s.lang)} ({items.length})</button></div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
