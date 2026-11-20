import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { TourPlayer } from "./TourPlayer";

/** The "How it works" video block at the bottom of every public page. Switch it off or make it a button in Admin > How it works video. */
export function TourFooter() {
  const s = useSettings();
  if (s.get("tour.enabled") !== true || s.get("tour.footer.show") !== true) return null;
  const heading = s.text("tour.intro.heading").trim(), btn = s.text("tour.button.label").trim();
  const pageOn = s.get("tour.page.enabled") === true;
  const asLink = s.get<string>("tour.footer.style") === "link";
  if (asLink && !pageOn) return null;
  return (
    <section className="tour-footer noprint" aria-label={heading || "How it works"} data-testid="tour-footer">
      {heading && <h2>{heading}</h2>}
      {asLink ? <p className="actions"><Link className="btn" href="/tour">{btn || heading || "How it works"}</Link></p> : <TourPlayer compact />}
      {!asLink && btn && pageOn && <p className="actions"><Link className="btn" href="/tour">{btn}</Link></p>}
    </section>
  );
}
