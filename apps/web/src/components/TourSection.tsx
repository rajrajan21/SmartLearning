import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { TourPlayer } from "./TourPlayer";

/** The "How it works" block on the home page. `where` says which placement this copy is for (hero = top, section = lower down). */
export function TourSection({ where }: { where: "hero" | "section" }) {
  const s = useSettings();
  if (s.get("tour.enabled") !== true || s.get<string>("tour.home.placement") !== where) return null;
  const heading = s.text("tour.intro.heading").trim(), text = s.text("tour.intro.text").trim(), btn = s.text("tour.button.label").trim();
  return (
    <section className={`tour-section tour-${where}`} aria-label={heading || "How it works"} data-testid="tour-section">
      {heading && <h2>{heading}</h2>}
      {text && <p className="lead">{text}</p>}
      <TourPlayer compact />
      {btn && s.get("tour.page.enabled") === true && <p className="actions"><Link className="btn" href="/tour">{btn}</Link></p>}
    </section>
  );
}
