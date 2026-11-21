import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { TourPlayer } from "./TourPlayer";

/** The "How it works" video block at the bottom of every public page. Switch it off or make it a button in Admin > How it works video. */
export function TourFooter() {
  const s = useSettings();
  if (s.get("tour.enabled") !== true || s.get("tour.footer.show") !== true) return null;
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
