import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { projectFor } from "../lib/projects";

/** A hands-on challenge for the week, using only things at home. Admin: on/off and whether to show the share question. */
export function ProjectOfWeek({ now = new Date() }: { now?: Date }) {
  const s = useSettings();
  if (s.get("project.show") !== true) return null;
  const p = projectFor(now);
  return (
    <section className="paper-block project" aria-label={ui("projectTitle", s.lang)}>
      <h2>🛠 {ui("projectTitle", s.lang)}: {p.title[s.lang]}</h2>
      <p>{p.steps[s.lang]}</p>
      {s.get("project.showShare") === true && <p className="small"><b>{ui("projectShare", s.lang)}</b> {p.share[s.lang]}</p>}
    </section>
  );
}
