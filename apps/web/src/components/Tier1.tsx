import { SimplePath, type RoadStop } from "./JourneyMap";
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
  if (nodes.length === 0) return null;
  const stops: RoadStop[] = nodes.map((n, i) => ({ id: n.id, href: n.href, name: n.name, state: n.state === "done" ? "done" : "todo", num: i + 1, here: n.state === "now" }));
  return <SimplePath stops={stops} title={title ?? "pathTitle"} streak={streak} />;
}
