import { Link } from "wouter";
import { useSettings } from "../../lib/settings";
import { ui } from "../../lib/i18n";
import { booksOfClass, shelfHref, useBooks } from "../../lib/reader/books";

/** True when this class has at least one downloaded textbook and the feature is on. */
export function useHasTextbooks(level: number): { show: boolean; count: number } {
  const s = useSettings();
  const on = s.get("feature.textbooks") === true;
  const { books } = useBooks(on);
  const count = on ? booksOfClass(books, level).length : 0;
  return { show: count > 0, count };
}

/**
 * The last entry on a class page, after the subjects: "Textbooks / See the textbook".
 * Renders nothing when the feature is off or no book of this class has been downloaded.
 */
export function TextbookEntry({ level, as = "li" }: { level: number; as?: "li" | "div" }) {
  const s = useSettings();
  const { show, count } = useHasTextbooks(level);
  if (!show) return null;
  const As = as;
  return (
    <As className="textbook-entry">
      <Link className="notebook textbook-tile" href={shelfHref(level)} data-testid="textbook-entry">
        <span className="nb-icon" aria-hidden="true">📚</span>
        <span className="nb-title">{ui("textbooks", s.lang)}</span>
        <span className="nb-meta">{ui("seeTextbook", s.lang)} · {count}</span>
      </Link>
    </As>
  );
}
