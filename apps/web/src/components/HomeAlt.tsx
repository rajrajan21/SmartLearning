import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { Title } from "./bits";
import { Rich } from "./Rich";
import type { Progress } from "../lib/progress";

type Name = { en: string; ta?: string };
interface Tree { classes: { classLevel: number; subjects: { slug: string; name: Name; chapters: { slug: string; name: Name; topics: { id: string; slug: string; name: Name }[] }[] }[] }[] }
export interface HomeAltProps {
  kind: "classroom" | "path";
  tree: unknown;
  board: string;
  progress: Record<string, Progress>;
  openClasses: number[];
  heroTitle: string;
  tryHref: string | null;
  cont: { href: string; topic: Name; subject: Name; step: number; total: number } | null;
  goal: { on: boolean; goal: number; done: number };
  rewards: { streak: number; stars: number; show: boolean; streakOn: boolean };
  quick: { href: string; icon: string; label: string }[];
  today: ReactNode;
  below: ReactNode;
}

const ICONS: [RegExp, string][] = [[/math/i, "➗"], [/sci/i, "🔬"], [/eng/i, "🔤"], [/social|history|geo|civic/i, "🌍"], [/tamil/i, "📜"], [/hindi/i, "🗣"], [/evs|environ/i, "🌱"], [/comput|it\b/i, "💻"], [/gk|general/i, "💡"], [/art|craft/i, "🎨"], [/music/i, "🎵"], [/sanskrit/i, "🕉"]];
const TINTS = ["#E8590C", "#2563EB", "#0F766E", "#7C3AED", "#BE185D", "#B45309", "#15803D", "#4338CA"];
const iconFor = (slug: string, en: string) => ICONS.find(([r]) => r.test(slug) || r.test(en))?.[1] ?? "📘";

export function HomeAlt(p: HomeAltProps) {
  const s = useSettings();
  const tree = p.tree as Tree | null;
  const classes = useMemo(() => (tree?.classes ?? []).filter((c) => p.openClasses.includes(c.classLevel) && c.subjects.length > 0).sort((a, b) => a.classLevel - b.classLevel), [tree, p.openClasses]);
  const [cls, setCls] = useState<number | null>(null);
  const cur = classes.find((c) => c.classLevel === cls) ?? classes[0];
  const [subj, setSubj] = useState("");
  const curSubj = cur?.subjects.find((x) => x.slug === subj) ?? cur?.subjects[0];
  const bl = p.board.toLowerCase();
  const done = (id: string) => p.progress[id]?.done === true;

  const classBar = classes.length > 1 && (
    <ul className="alt-classes" aria-label={ui("classWord", s.lang)}>
      {classes.map((c) => <li key={c.classLevel}><button type="button" className={`chip${c.classLevel === cur?.classLevel ? " on" : ""}`} aria-pressed={c.classLevel === cur?.classLevel} onClick={() => { setCls(c.classLevel); setSubj(""); }}>{ui("classWord", s.lang)} {c.classLevel}</button></li>)}
    </ul>
  );

  const header = (
    <header className="alt-head">
      <h1 data-size={String(s.get("home.hero.size") ?? "m")}><Rich text={p.heroTitle} /></h1>
      <div className="alt-chips">
        {p.goal.on && <span className={p.goal.done >= p.goal.goal ? "goal-chip met" : "goal-chip"} role="status"><span aria-hidden="true">{p.goal.done >= p.goal.goal ? "✔" : "🎯"}</span> {Math.min(p.goal.done, p.goal.goal)}/{p.goal.goal} {ui("goalLessons", s.lang)}</span>}
        {p.rewards.show && p.rewards.streakOn && <span className="goal-chip">🔥 {p.rewards.streak}</span>}
        {p.rewards.show && <span className="goal-chip">⭐ {p.rewards.stars}</span>}
      </div>
      {p.cont ? (
        <section className="continue-card" aria-label={ui("continueTitle", s.lang)}>
          <div><h2>{ui("continueTitle", s.lang)}</h2><p><b><Title name={p.cont.topic} /></b> · <Title name={p.cont.subject} /> · {ui("continueStep", s.lang)} {p.cont.step}/{p.cont.total}</p></div>
          <Link className="btn" href={p.cont.href}>{ui("continueGo", s.lang)}</Link>
        </section>
      ) : p.tryHref ? <p className="actions"><Link className="btn big try-btn" href={p.tryHref}>▶ {s.text("home.cta.label") || ui("tryLesson", s.lang)}</Link></p> : null}
    </header>
  );

  const quick = p.quick.length > 1 && (
    <nav className="alt-quick" aria-label={ui("quickLinks", s.lang)}>
      {p.quick.slice(1).map((q) => <Link key={q.href} href={q.href} className="alt-quick-item"><span aria-hidden="true">{q.icon}</span><b>{q.label}</b></Link>)}
    </nav>
  );

  if (p.kind === "classroom") {
    return (
      <div className="paper home home-alt home-classroom" data-today={String(s.get("layout.today") ?? "inline")}>
        {header}
        {classBar}
        {cur && (
          <ul className="cr-tiles">
            {cur.subjects.map((sub, i) => {
              const ids = sub.chapters.flatMap((ch) => ch.topics.map((t) => t.id));
              const d = ids.filter(done).length, pct = ids.length ? Math.round((d / ids.length) * 100) : 0;
              return (
                <li key={sub.slug}>
                  <Link className="cr-tile" href={`/${bl}/${cur.classLevel}/${sub.slug}`} style={{ ["--tile" as never]: TINTS[i % TINTS.length] }}>
                    <span className="cr-ico" aria-hidden="true">{iconFor(sub.slug, sub.name.en)}</span>
                    <b><Title name={sub.name} /></b>
                    <span className="meter" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
                    <span className="small">{d}/{ids.length}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {quick}
        {p.today}
        {p.below}
      </div>
    );
  }

  const chapters = curSubj?.chapters.filter((ch) => ch.topics.length > 0) ?? [];
  const flat = chapters.flatMap((ch) => ch.topics);
  const nowId = flat.find((t) => !done(t.id))?.id;
  return (
    <div className="paper home home-alt home-roadmap" data-today={String(s.get("layout.today") ?? "inline")}>
      {header}
      {classBar}
      {cur && (
        <ul className="alt-classes rm-subjects" aria-label={ui("navSubjects", s.lang)}>
          {cur.subjects.map((sub) => <li key={sub.slug}><button type="button" className={`chip${sub.slug === curSubj?.slug ? " on" : ""}`} aria-pressed={sub.slug === curSubj?.slug} onClick={() => setSubj(sub.slug)}>{iconFor(sub.slug, sub.name.en)} <Title name={sub.name} /></button></li>)}
        </ul>
      )}
      {cur && curSubj && (
        <ol className="rm">
          {chapters.map((ch, ci) => {
            const d = ch.topics.filter((t) => done(t.id)).length;
            return (
              <li key={ch.slug} className={`rm-chapter${d === ch.topics.length ? " all" : ""}`}>
                <div className="rm-ch-head"><span className="rm-num" aria-hidden="true">{d === ch.topics.length ? "★" : ci + 1}</span><h2><Title name={ch.name} /></h2><span className="small">{d}/{ch.topics.length}</span></div>
                <ul className="rm-steps">
                  {ch.topics.map((t, ti) => {
                    const st = done(t.id) ? "done" : t.id === nowId ? "now" : "todo";
                    return (
                      <li key={t.id} className={`rm-step ${st}`} style={{ ["--off" as never]: `${[0, 1.6, 2.4, 1.6, 0, -1.6, -2.4, -1.6][ti % 8]}rem` }}>
                        <Link href={`/${bl}/${cur.classLevel}/${curSubj.slug}/${ch.slug}/${t.slug}/learn`} aria-label={s.name(t.name)}>
                          <span className="rm-dot" aria-hidden="true">{st === "done" ? "✔" : st === "now" ? "▶" : ti + 1}</span>
                          <span className="rm-name"><Title name={t.name} /></span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
      {quick}
      {p.today}
      {p.below}
    </div>
  );
}
