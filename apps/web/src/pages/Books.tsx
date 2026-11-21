import { useActiveBoard } from "../lib/activeBoard";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearch } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { booksOfClass, prettySize, readerHref, shelfHref, useBooks, type Book, type BookChapter } from "../lib/reader/books";
import { subjectVar } from "../lib/theme";
import { Crumbs, Loading, NotFound } from "../components/bits";

const Reader = lazy(() => import("../components/reader/Reader").then((m) => ({ default: m.Reader })));
const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The first page of the book as its cover; drawn only when the tile scrolls into view. A coloured cover with the title until then. */
function BookCover({ book }: { book: Book }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const url = book.url ?? book.chapters?.[0]?.url ?? null;
  useEffect(() => {
    const el = ref.current;
    if (!el || !url || typeof IntersectionObserver !== "function") return;
    let alive = true;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      if (book.fast) { setSrc(`${book.fast.base}1-s.webp`); return; }
      void import("../lib/reader/pdf").then((m) => m.coverOf(url)).then((u) => { if (alive) setSrc(u); }, () => { /* keep the plain cover */ });
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => { alive = false; io.disconnect(); };
  }, [url, book.fast]);
  return (
    <span className="bk-cover" ref={ref} style={{ ["--cover" as string]: subjectVar(slugOf(book.subject)) }}>
      {src ? <img src={src} alt="" /> : <span className="bk-plain" aria-hidden="true"><b>{book.title}</b><i>{book.subject}</i></span>}
    </span>
  );
}

function BookTile({ book }: { book: Book }) {
  const s = useSettings();
  const meta = [book.language, book.pages ? `${book.pages} ${ui("booksPages", s.lang)}` : book.chapters ? `${book.chapters.length} ${ui("booksParts", s.lang)}` : "", prettySize(book.bytes)].filter(Boolean).join(" · ");
  return (
    <li className="bk">
      <Link href={readerHref(book)} className="bk-link" aria-label={`${ui("booksOpen", s.lang)}: ${book.title}`}>
        <BookCover book={book} />
        <span className="bk-subject">{book.subject}</span>
        <span className="bk-title">{book.title}</span>
        <span className="bk-meta">{meta}</span>
      </Link>
      {book.chapters && book.chapters.length > 1 && (
        <ol className="bk-parts" aria-label={`${book.title}: ${ui("booksParts", s.lang)}`}>
          {book.chapters.map((c, i) => <li key={c.file}><Link href={readerHref(book, c)}>{ui("booksPart", s.lang)} {i + 1}</Link></li>)}
        </ol>
      )}
    </li>
  );
}

/** /books and /books?class=N : the shelf. One row of covers per subject. */
export function BooksPage() {
  const s = useSettings();
  const activeBoard = useActiveBoard();
  const on = s.get("feature.textbooks") === true;
  const { status, books } = useBooks(on);
  const search = useSearch();
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const wanted = Number(new URLSearchParams(search).get("class")) || 0;
  if (!on) return <NotFound />;
  if (status === "loading") return <Loading />;
  const open = s.get<number[]>("catalog.openClasses");
  const available = books.filter((b) => open.includes(b.classLevel));
  const classes = [...new Set(available.map((b) => b.classLevel))].sort((a, b) => a - b);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const selected = wanted || Number(classFilter);
  const shown = available.filter((b) => (!selected || b.classLevel === selected) &&
    words.every((word) => [b.title, b.subject, b.language].join(" ").toLowerCase().includes(word)));
  const levels = [...new Set(shown.map((b) => b.classLevel))].sort((a, b) => a - b);
  const board = activeBoard.toLowerCase();
  return (
    <div className="paper books">
      <Crumbs items={[{ href: "/", label: ui("home", s.lang) }, ...(wanted ? [{ href: `/${board}/${wanted}`, label: `${ui("classWord", s.lang)} ${wanted}` }] : []), { label: ui("textbooks", s.lang) }]} />
      <h1>{ui("textbooks", s.lang)}{wanted ? ` · ${ui("classWord", s.lang)} ${wanted}` : ""}</h1>
      <p className="lead">{ui("booksIntro", s.lang)}</p>
      {!wanted && <div className="book-catalog-filters">
        <label>{s.lang === "ta" ? "பாடப்புத்தகங்களைத் தேடுங்கள்" : "Search textbooks"}<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <label>{ui("classWord", s.lang)}<select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">{s.lang === "ta" ? "அனைத்து வகுப்புகள்" : "All classes"}</option>
          {classes.map((n) => <option value={n} key={n}>{ui("classWord", s.lang)} {n}</option>)}
        </select></label>
      </div>}
      {levels.length === 0 && <p className="soon-note">{ui("booksNone", s.lang)}</p>}
      {levels.map((level) => {
        const mine = booksOfClass(shown, level);
        return (
          <section key={level} aria-label={`${ui("classWord", s.lang)} ${level}`}>
            {!wanted && <h2><Link href={shelfHref(level)}>{ui("classWord", s.lang)} {level}</Link></h2>}
            <ul className="bk-list">{mine.map((b) => <BookTile key={b.id} book={b} />)}</ul>
          </section>
        );
      })}
    </div>
  );
}

/** /books/:cls/:file and /books/:cls/:file/:chapter : the reader, on its own full page. */
export function BookReaderPage() {
  const s = useSettings();
  const on = s.get("feature.textbooks") === true;
  const { cls = "", file = "", chapter } = useParams<{ cls: string; file: string; chapter?: string }>();
  const { status, books } = useBooks(on);
  if (!on) return <div className="paper"><NotFound /></div>;
  if (status === "loading") return <div className="paper"><Loading /></div>;
  const name = decodeURIComponent(file), part = chapter ? decodeURIComponent(chapter) : undefined;
  const book = books.find((b) => String(b.classLevel) === cls && b.file === name && s.get<number[]>("catalog.openClasses").includes(b.classLevel));
  let ch: BookChapter | undefined, at = -1;
  if (book?.chapters) { at = part ? book.chapters.findIndex((c) => c.file === part) : 0; ch = book.chapters[at]; }
  const url = book ? (book.chapters ? ch?.url : book.url) : null;
  if (!book || !url || (part !== undefined && !book.chapters)) return <div className="paper"><NotFound /></div>;
  const sub = [book.subject, `${ui("classWord", s.lang)} ${book.classLevel}`, ch && book.chapters ? `${ui("booksPart", s.lang)} ${at + 1} / ${book.chapters.length}` : ""].filter(Boolean).join(", ");
  return (
    <Suspense fallback={<div className="paper"><Loading /></div>}>
      <Reader key={url} book={{ id: ch ? `${book.id}${ch.file}` : book.id, title: book.title, subtitle: sub, url, fileName: ch ? `${book.file}-${ch.file}` : book.file, language: book.language, subject: book.subject, backHref: shelfHref(book.classLevel), fast: ch ? null : book.fast ?? null, toc: ch ? undefined : book.toc }} />
    </Suspense>
  );
}
