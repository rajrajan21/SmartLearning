import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { branchPoints, wrapLabel } from "../lib/mindmap";

export interface MapTopic { id: string; label: string; href: string; done: boolean }

/** A chapter as a mind map: the chapter in the middle, each topic on a branch. Topics link to their lessons. */
export function MindMap({ title, topics }: { title: string; topics: MapTopic[] }) {
  const s = useSettings();
  if (s.get("browse.mindmap.show") !== true || topics.length < 2) return null;
  const max = s.get<number>("browse.mindmap.maxTopics");
  const list = topics.slice(0, max);
  const W = 640, H = 420;
  const pts = branchPoints(list.length, W, H);
  const colour = s.get("browse.mindmap.colourDone") === true;
  return (
    <section className="paper-block mindmap" aria-label={ui("mindMapTitle", s.lang)}>
      <h2>{ui("mindMapTitle", s.lang)}</h2>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={title} className="mm-svg">
        {pts.map((p, i) => <line key={i} x1={W / 2} y1={H / 2} x2={p.x} y2={p.y} className="mm-line" />)}
        <ellipse cx={W / 2} cy={H / 2} rx={78} ry={36} className="mm-center" />
        {wrapLabel(title, 18).map((l, i, a) => <text key={i} x={W / 2} y={H / 2 + (i - (a.length - 1) / 2) * 16 + 5} textAnchor="middle" className="mm-ct">{l}</text>)}
        {list.map((t, i) => {
          const p = pts[i]!;
          const lines = wrapLabel(t.label, 16);
          return (
            <Link key={t.id} href={t.href}>
              <g className={colour && t.done ? "mm-node done" : "mm-node"} role="link" aria-label={t.label + (t.done ? ` (${ui("syllabusDone", s.lang)})` : "")}>
                <rect x={p.x - 62} y={p.y - 20} width={124} height={40} rx={14} />
                {lines.map((l, k) => <text key={k} x={p.x} y={p.y + (k - (lines.length - 1) / 2) * 14 + 4} textAnchor="middle">{l}</text>)}
              </g>
            </Link>
          );
        })}
      </svg>
    </section>
  );
}
