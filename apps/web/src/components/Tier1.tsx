import { Link } from "wouter";
import type { Mastery } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui, type UiKey } from "../lib/i18n";
import { BAR_LABEL, BAR_LEVELS, levelCounts, type PathNode } from "../lib/round2";
import { Title } from "./bits";

/** Five-step segmented bar. Reads as words and as a bar, never colour alone. */
export function MasteryBar({ list, label }: { list: Mastery[]; label: string }) {
  const s = useSettings();
  const c = levelCounts(list), total = list.length;
  if (total === 0) return null;
  const text = BAR_LEVELS.filter((l) => c[l] > 0).map((l) => `${c[l]} ${ui(BAR_LABEL[l], s.lang)}`).join(", ");
  return (
    <div className="mbar" role="img" aria-label={`${label}: ${text}`}>
      <div className="mbar-segs" aria-hidden="true">
        {BAR_LEVELS.map((l) => c[l] > 0 && <span key={l} className={`seg m-${l}`} style={{ flexGrow: c[l] }} />)}
      </div>
      <span className="small" aria-hidden="true">{BAR_LEVELS.filter((l) => c[l] > 0).map((l) => `${ui(BAR_LABEL[l], s.lang)} ${c[l]}`).join(" · ")}</span>
    </div>
  );
}

/** Game-board path: nodes in order, zig-zag, coloured by progress. Every node is a real link. */
export function BoardPath({ nodes, streak, title }: { nodes: PathNode[]; streak: number; title?: UiKey }) {
  const s = useSettings();
  if (nodes.length === 0) return null;
  return (
    <section className="boardpath" aria-label={ui(title ?? "pathTitle", s.lang)}>
      <h2>{ui(title ?? "pathTitle", s.lang)} {streak > 0 && <span className="flame" aria-label={`${streak} ${ui("streakDays", s.lang)}`}><span aria-hidden="true">🔥</span> {streak}</span>}</h2>
      <ol>
        {nodes.map((n, i) => (
          <li key={n.id} className={`pnode ${n.state} x${i % 4}`}>
            <Link href={n.href} aria-current={n.state === "now" ? "step" : undefined}>
              <span className="pdot" aria-hidden="true">{n.state === "done" ? "✔" : n.state === "now" ? "★" : i + 1}</span>
              <span className="plabel"><b><Title name={n.name} /></b><span className="small">{n.state === "done" ? ui("pathDone", s.lang) : n.state === "now" ? ui("pathNow", s.lang) : ui("pathLater", s.lang)}</span></span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
