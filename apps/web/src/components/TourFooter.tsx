import { Link, useRoute } from "wouter";
import { useSettings } from "../lib/settings";
import { TourPlayer } from "./TourPlayer";

/** The homepage tour block. Its visibility and style are configurable in Admin. */
export function TourFooter() {
  const s = useSettings();
  const [onHomePage] = useRoute("/");
  if (!onHomePage || s.get("tour.enabled") !== true || s.get("tour.footer.show") !== true) return null;
  const heading = s.text("tour.intro.heading").trim(), btn = s.text("tour.button.label").trim();
  const intro = s.text("tour.intro.text").trim();
  const pageOn = s.get("tour.page.enabled") === true;
  const asLink = s.get<string>("tour.footer.style") === "link";
  if (asLink && !pageOn) return null;
  return (
    <section className="tour-footer noprint" aria-label={heading || "How it works"} data-testid="tour-footer">
      <div className="tour-footer-copy">
        {heading && <h2>{heading}</h2>}
        {intro && <p>{intro}</p>}
        {pageOn && (btn || asLink) && <Link className="btn ghost" href="/tour">{btn || heading || "How it works"} <span aria-hidden="true">→</span></Link>}
      </div>
      {!asLink && <div className="tour-footer-screen"><TourPlayer compact /></div>}
    </section>
  );
}
