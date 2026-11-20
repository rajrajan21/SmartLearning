import { Link, useLocation } from "wouter";
import type { Progress } from "../lib/progress";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

interface Topic { id: string; slug: string; name: { en: string; ta?: string } }
interface Chapter { id: string; slug: string; position: number; name: { en: string; ta?: string }; topics: Topic[] }
export type JourneyState = "done" | "doing" | "todo" | "soon";

/** Where a chapter stands: finished, started, ready to start, or not published yet. */
export function journeyState(c: Chapter, progress: Record<string, Progress>, lessonIds: Set<string>): JourneyState {
  const ts = c.topics;
  if (ts.length > 0 && ts.every((t) => progress[t.id]?.done)) return "done";
  if (ts.some((t) => progress[t.id]?.done || (progress[t.id]?.step ?? 0) > 0)) return "doing";
  return ts.some((t) => lessonIds.has(t.id)) ? "todo" : "soon";
}
function wrap(t: string, max = 15): string[] {
  const out: string[] = []; let cur = "";
  for (const w of t.split(/\s+/)) { if (cur && (cur + " " + w).length > max) { out.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; }
  if (cur) out.push(cur);
  if (out.length > 2) { out.length = 2; out[1] = out[1]!.slice(0, max - 1) + "…"; }
  return out;
}
const COL: Record<JourneyState, { fill: string; ring: string; ink: string }> = {
  done: { fill: "#2E9E5B", ring: "#BFEBD0", ink: "#fff" },
  doing: { fill: "#F59E0B", ring: "#FDE7B0", ink: "#fff" },
  todo: { fill: "#4F46E5", ring: "#D9D6FB", ink: "#fff" },
  soon: { fill: "#CBD0DC", ring: "#EEF0F5", ink: "#5B6275" },
};
const ICON: Record<JourneyState, string> = { done: "✓", doing: "●", todo: "▶", soon: "🔒" };

export interface RoadStop { id: string; href: string; name: { en: string; ta?: string }; state: JourneyState; num: number; here?: boolean }

/** One road through a subject or a learning path: every stop coloured by how far the child has got. */
export function JourneyMap({ chapters, base, progress, lessonIds }: { chapters: Chapter[]; base: string; progress: Record<string, Progress>; lessonIds: Set<string> }) {
  const stops: RoadStop[] = chapters.map((c) => ({ id: c.id, href: `${base}/${c.slug}`, name: c.name, state: journeyState(c, progress, lessonIds), num: c.position }));
  return <JourneyRoad stops={stops} title="jnTitle" />;
}

export function JourneyRoad({ stops, title, streak = 0 }: { stops: RoadStop[]; title: Parameters<typeof ui>[0]; streak?: number }) {
  const s = useSettings();
  const [, go] = useLocation();
  const L = (k: Parameters<typeof ui>[0]) => ui(k, s.lang);
  const chapters = stops;
  const states = stops.map((x) => x.state);
  const cols = 4, W = 880, rowH = 190, pad = 110, step = (W - pad * 2) / (cols - 1);
  const pos = chapters.map((_, i) => { const r = Math.floor(i / cols), c0 = i % cols, c = r % 2 === 0 ? c0 : cols - 1 - c0; return { x: pad + c * step, y: 80 + r * rowH }; });
  const H = 80 + (Math.ceil(chapters.length / cols) - 1) * rowH + 130;
  const hereIdx = stops.findIndex((x) => x.here); const now = hereIdx >= 0 ? hereIdx : states.findIndex((x) => x === "doing" || x === "todo");
  const count = (k: JourneyState) => states.filter((x) => x === k).length;
  const seg = (i: number) => {
    const a = pos[i]!, b = pos[i + 1]!;
    if (a.y === b.y) return `M${a.x},${a.y} L${b.x},${b.y}`;
    const out = a.x > W / 2 ? a.x + 90 : a.x - 90;
    return `M${a.x},${a.y} C${out},${a.y} ${out},${b.y} ${b.x},${b.y}`;
  };
  return (
    <section className="journey" aria-label={L(title)}>
      <h2 className="cm-h">{L(title)}{streak > 0 && <span className="flame" aria-label={`${streak} ${L("streakDays")}`}> <span aria-hidden="true">🔥</span> {streak}</span>}</h2>
      <p className="jn-sum"><b>{count("done")}</b> / {chapters.length} {L("jnDoneOf")}{count("doing") > 0 && <> · <b>{count("doing")}</b> {L("jnInProgress")}</>}</p>
      <ul className="jn-legend" aria-hidden="true">
        {(["done", "doing", "todo", "soon"] as JourneyState[]).map((k) => <li key={k}><span className="jn-chip" style={{ background: COL[k].fill }}>{ICON[k]}</span> {L(k === "done" ? "jnLegDone" : k === "doing" ? "jnLegDoing" : k === "todo" ? "jnLegTodo" : "jnLegSoon")}</li>)}
      </ul>
      <svg viewBox={`0 0 ${W} ${H}`} className="jn-svg" role="group" aria-label={L(title)}>
        <defs>
          <linearGradient id="jnRoad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2E9E5B" /><stop offset="1" stopColor="#22C55E" /></linearGradient>
          <filter id="jnGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        {chapters.slice(0, -1).map((c, i) => <path key={"r" + c.id} d={seg(i)} className="jn-road" />)}
        {chapters.slice(0, -1).map((c, i) => states[i] === "done" ? <path key={"g" + c.id} d={seg(i)} className="jn-road-done" /> : null)}
        {chapters.map((c, i) => {
          const p = pos[i]!, st = states[i]!, k = COL[st], name = s.name(c.name), lines = wrap(name), isNow = i === now;
          const href = c.href;
          return (
            <a key={c.id} href={href} className={`jn-stop jn-${st}${isNow ? " jn-now" : ""}`} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); go(href); }} aria-label={`${L("cmChapter")} ${c.num}: ${name}. ${L(st === "done" ? "jnLegDone" : st === "doing" ? "jnLegDoing" : st === "todo" ? "jnLegTodo" : "jnLegSoon")}`}>
              {isNow && <circle cx={p.x} cy={p.y} r={50} fill={k.fill} opacity=".35" filter="url(#jnGlow)" className="jn-pulse" />}
              <circle cx={p.x} cy={p.y} r={44} fill={k.ring} />
              <circle cx={p.x} cy={p.y} r={34} fill={k.fill} stroke="#fff" strokeWidth={4} />
              <text x={p.x} y={p.y + 9} textAnchor="middle" fontSize={26} fontWeight={800} fill={k.ink}>{st === "done" || st === "soon" ? ICON[st] : c.num}</text>
              <circle cx={p.x + 30} cy={p.y - 30} r={13} fill="#fff" stroke={k.fill} strokeWidth={3} /><text x={p.x + 30} y={p.y - 25} textAnchor="middle" fontSize={14} fontWeight={800} fill={k.fill}>{st === "done" ? "✓" : st === "doing" ? "…" : st === "todo" ? "▶" : "·"}</text>
              {lines.map((t, j) => <text key={j} x={p.x} y={p.y + 68 + j * 19} textAnchor="middle" fontSize={16} fontWeight={700} className="jn-name">{t}</text>)}
              {isNow && <text x={p.x} y={p.y - 56} textAnchor="middle" fontSize={15} fontWeight={800} fill={k.fill}>{L("jnYouAreHere")}</text>}
            </a>
          );
        })}
        <text x={pos[chapters.length - 1]!.x} y={pos[chapters.length - 1]!.y + 120} textAnchor="middle" fontSize={20} aria-hidden="true">🏁</text>
      </svg>
    </section>
  );
}

/** The simple version for the home page: one row of stops joined by a line, wrapping on small screens. */
export function SimplePath({ stops, title, streak = 0 }: { stops: RoadStop[]; title: Parameters<typeof ui>[0]; streak?: number }) {
  const s = useSettings();
  const L = (k: Parameters<typeof ui>[0]) => ui(k, s.lang);
  const hereIdx = stops.findIndex((x) => x.here);
  const now = hereIdx >= 0 ? hereIdx : stops.findIndex((x) => x.state !== "done" && x.state !== "soon");
  const lab = (k: JourneyState) => L(k === "done" ? "jnLegDone" : k === "doing" ? "jnLegDoing" : k === "todo" ? "jnLegTodo" : "jnLegSoon");
  return (
    <section className="spath" aria-label={L(title)}>
      <h2>{L(title)}{streak > 0 && <span className="flame" aria-label={`${streak} ${L("streakDays")}`}> <span aria-hidden="true">🔥</span> {streak}</span>}</h2>
      <ol>
        {stops.map((x, i) => (
          <li key={x.id} className={`sp-${x.state}${i === now ? " sp-now" : ""}`}>
            <Link href={x.href} aria-current={i === now ? "step" : undefined} aria-label={`${x.num}: ${s.name(x.name)}. ${lab(x.state)}`}>
              <span className="sp-dot" aria-hidden="true">{x.state === "done" ? "✓" : i === now ? "▶" : x.num}</span>
              <span className="sp-name">{s.name(x.name)}</span>
              <span className="sp-state">{i === now ? L("jnYouAreHere") : lab(x.state)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
