import { useSettings } from "../lib/settings";
import { TourPlayer } from "../components/TourPlayer";

/** /tour: the full "How it works" page. */
export function TourPage() {
  const s = useSettings();
  if (s.get("tour.enabled") !== true || s.get("tour.page.enabled") !== true) return <div className="paper"><p>{s.lang === "ta" ? "இந்தப் பக்கம் இப்போது இல்லை." : "This page is not available right now."}</p></div>;
  const heading = s.text("tour.intro.heading").trim(), text = s.text("tour.intro.text").trim();
  return (
    <div className="paper tour-page" data-testid="tour-page">
      <h1>{heading}</h1>
      {text && <p className="lead">{text}</p>}
      <TourPlayer />
    </div>
  );
}
