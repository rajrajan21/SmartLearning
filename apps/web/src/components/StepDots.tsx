import { ui } from "../lib/i18n";
import type { Lang } from "../lib/i18n";

export const MAX_DOTS = 12;
/** One dot per step: done, current or still to come. */
export function StepDots({ total, step, lang }: { total: number; step: number; lang: Lang }) {
  if (total < 2 || total > MAX_DOTS) return null;
  return (
    <ol className="dots" aria-label={`${ui("stepDotsLabel", lang)}: ${step + 1} ${ui("ofWord", lang)} ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const state = i < step ? "done" : i === step ? "now" : "todo";
        return <li key={i} className={`dot ${state}`} aria-current={state === "now" ? "step" : undefined}><span className="sr">{i + 1}{state === "done" ? `, ${ui("stepDone", lang)}` : state === "now" ? `, ${ui("stepNow", lang)}` : ""}</span></li>;
      })}
    </ol>
  );
}
