import { matches as matchSearch } from "../components/SearchBox";
import { VoiceSearchInput } from "../components/VoiceSearchInput";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { useSettings } from "../lib/settings";
import { Crumbs, Loading, NotFound } from "../components/bits";
import { bandLabel, coverUrl, fileUrl, lt, mb, useLibrary, type LibBook } from "../lib/library";
import type { PdfBook } from "../lib/reader/pdf";
import { BookTools } from "../components/BookTools";
import { contribApi, ct } from "../lib/contrib";

const csv = (v: unknown) => String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);

function Cover({ book, show }: { book: LibBook; show: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!show || !el || typeof IntersectionObserver !== "function") return;
    let alive = true;
    const io = new IntersectionObserver((e) => {
      if (!e.some((x) => x.isIntersecting)) return;
      io.disconnect();
      if (book.hasCover) { setSrc(coverUrl(book.id)); return; }
      void import("../lib/reader/pdf").then((m) => m.coverOf(fileUrl(book.id))).then((u) => { if (alive) setSrc(u); }, () => { /* plain cover */ });
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => { alive = false; io.disconnect(); };
  }, [book.id, book.hasCover, show]);
  return <span className="bk-cover lib-cover" ref={ref}>{src ? <img src={src} alt="" loading="lazy" /> : <span className="bk-plain" aria-hidden="true"><b>{book.title}</b></span>}</span>;
}

function ContinueShelf({ books, lang }: { books: LibBook[]; lang: "en" | "ta" }) {
  const s = useSettings();
  if (s.get("contrib.reader.continueReading") === false) return null;
  const seen = books.map((b) => { let p = 0; try { p = Number(localStorage.getItem(`ss_lib_page_${b.id}`) ?? 0); } catch { /* none */ } return { b, p }; }).filter((x) => x.p > 1).slice(0, 4);
  if (!seen.length) return null;
  return <div className="group" data-testid="continue-reading"><b>{ct("continue", lang)}</b><ul>{seen.map(({ b, p }) => <li key={b.id}><Link href={`/library/${encodeURIComponent(b.id)}`}>{b.title}</Link> <span className="small">p.{p}</span></li>)}</ul></div>;
}

function InBookSearch({ q, on, lang }: { q: string; on: boolean; lang: "en" | "ta" }) {
  const [hits, setHits] = useState<{ id: string; title: string; page: number; snippet: string }[]>([]);
  useEffect(() => {
    if (!on || q.trim().length < 3) { setHits([]); return; }
    const t = setTimeout(() => { void contribApi.search(q.trim()).then((r) => setHits(r.hits), () => setHits([])); }, 350);
    return () => clearTimeout(t);
  }, [q, on]);
  if (!hits.length) return null;
  return <div className="group" data-testid="library-text-hits"><b>{ct("found", lang)}</b><ul className="small">{hits.map((h, i) => <li key={i}><Link href={`/library/${h.id}`}>{h.title}</Link> p.{h.page} — {h.snippet}</li>)}</ul></div>;
}

export function LibraryPage() {
  const s = useSettings();
  const on = s.get("feature.library") === true;
  const { state, data } = useLibrary(on);
  const bandsOn = csv(s.get("library.ageBands"));
  const langsOn = csv(s.get("library.languagesShown"));
  const [age, setAge] = useState<string>(String(s.get("library.defaultAge") ?? "all"));
  const [lang, setLang] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<string>(String(s.get("library.sortDefault") ?? "new"));
  const [shown, setShown] = useState(Number(s.get("library.perPage") ?? 24));
  const per = Number(s.get("library.perPage") ?? 24);
  useEffect(() => setShown(per), [age, lang, q, sort, per]);

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    let r = data.books.filter((b) => (age === "all" || b.ageBand === age) && (!lang || b.language === lang) && (!langsOn.length || langsOn.includes(b.language)) && matchSearch(needle, b.title, b.authors.join(" "), b.tags.join(" ")));
    r = [...r].sort(sort === "title" ? (a, b) => a.title.localeCompare(b.title) : sort === "short" ? (a, b) => (a.pages ?? 9999) - (b.pages ?? 9999) : (a, b) => b.addedAt.localeCompare(a.addedAt));
    return r;
  }, [data, age, lang, q, sort, langsOn.join()]);

  if (!on || state === "off") return <NotFound />;
  if (state === "loading") return <Loading />;
  const bands = bandsOn.filter((b) => data?.bands.some((x) => x.band === b));
  const langs = (data?.languages ?? []).filter((l) => !langsOn.length || langsOn.includes(l.code));
  const intro = s.text("library.intro") || lt("intro", s.lang);
  const newDays = Number(s.get("library.newBadgeDays") ?? 14);
  const isNew = (b: LibBook) => newDays > 0 && Date.now() - Date.parse(b.addedAt) < newDays * 864e5;
  return (
    <main className="books library" data-testid="library">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: lt("title", s.lang) }]} />
      <h1>📖 {lt("title", s.lang)}</h1>
      <p className="lead">{intro}</p>
      {s.get("contrib.enabled") === true && <p className="actions"><Link className="btn" href="/library/contribute">＋ {ct("title", s.lang)}</Link> <Link href="/library/my-contributions">{ct("mine", s.lang)}</Link></p>}
      <ContinueShelf books={data?.books ?? []} lang={s.lang} />
      {state === "error" || !data || data.books.length === 0 ? <p className="empty">{lt("none", s.lang)}</p> : (
        <>
          <div className="lib-filters">
            <div className="lib-ages" role="group" aria-label={lt("age", s.lang)}>
              {["all", ...bands].map((b) => <button key={b} type="button" className={`chip${age === b ? " on" : ""}`} aria-pressed={age === b} onClick={() => setAge(b)}>{bandLabel(b, s.lang)}</button>)}
            </div>
            <div className="lib-row">
              {langs.length > 1 && <label>{lt("lang", s.lang)} <select value={lang} onChange={(e) => setLang(e.target.value)}><option value="">{lt("anyLang", s.lang)}</option>{langs.map((l) => <option key={l.code} value={l.code}>{l.code} ({l.count})</option>)}</select></label>}
              <label>{lt("sort", s.lang)} <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="new">{lt("sNew", s.lang)}</option><option value="title">{lt("sTitle", s.lang)}</option><option value="short">{lt("sShort", s.lang)}</option></select></label>
              {s.get("library.search.enabled") === true && <VoiceSearchInput onVoice={setQ} value={q} onChange={(e) => setQ(e.target.value)} placeholder={lt("search", s.lang)} aria-label={lt("search", s.lang)} />}
            </div>
          </div>
          <InBookSearch q={q} on={s.get("contrib.publish.crossLibrarySearch") !== false && s.get("contrib.enabled") === true} lang={s.lang} />
          {rows.length === 0 ? <p className="empty">{lt("noMatch", s.lang)}</p> : (
            <ul className="bk-list lib-list">
              {rows.slice(0, shown).map((b) => (
                <li key={b.id}><Link className="bk-link" href={`/library/${encodeURIComponent(b.id)}`}>
                  <Cover book={b} show={s.get("library.showCovers") === true} />
                  <span className="bk-title">{b.contributed ? "🤝 " : ""}{b.title}{isNew(b) && <em className="lib-new">{lt("newBadge", s.lang)}</em>}</span>
                  <span className="bk-meta small">{[b.ageBand, b.language, s.get("library.showPages") === true && b.pages ? `${b.pages} ${lt("pages", s.lang)}` : ""].filter(Boolean).join(" · ")}</span>
                  {s.get("library.showLicence") === true && <span className="small lib-lic">{b.licence.name}</span>}
                </Link></li>
              ))}
            </ul>
          )}
          {rows.length > shown && <p className="actions"><button type="button" className="btn" onClick={() => setShown((n) => n + per)}>+ {rows.length - shown}</button></p>}
        </>
      )}
    </main>
  );
}

/** Pages drawn only near the screen, a small preview first, far pages released: smooth on a low-end phone. */
function PdfScroller({ book, id, name }: { book: PdfBook; id: string; name: string }) {
  const s = useSettings();
  const quality = String(s.get("library.reader.quality") ?? "balanced");
  const ahead = Math.max(0, Math.min(8, Number(s.get("library.reader.prefetchPages") ?? 2)));
  const quick = s.get("library.reader.quickPreview") !== false;
  const remember = s.get("library.reader.rememberPage") !== false;
  const showNum = s.get("library.reader.showPageNumber") !== false;
  const maxW = Math.max(320, Number(s.get("library.reader.maxWidth") ?? 900));
  const key = `ss_lib_page_${id}`;
  const [cur, setCur] = useState(1);
  const [imgs, setImgs] = useState<Record<number, string>>({});
  const near = useRef(new Set<number>());
  const wrap = useRef<HTMLDivElement>(null);
  const width = Math.round(Math.min(maxW, typeof window === "undefined" ? maxW : window.innerWidth) * (quality === "sharp" ? 2 : quality === "light" ? 0.8 : 1.3));
  const pages = Array.from({ length: book.numPages }, (_, i) => i + 1);

  const load = (n: number, prio: number) => {
    if (n < 1 || n > book.numPages) return;
    const have = book.ready(n, width);
    if (have) setImgs((m) => (m[n] === have ? m : { ...m, [n]: have }));
    if (quick) void book.thumb(n).then((u) => setImgs((m) => (m[n] ? m : { ...m, [n]: u }))).catch(() => { /* next */ });
    void book.image(n, width, prio).then((u) => setImgs((m) => ({ ...m, [n]: u }))).catch(() => { /* retried on scroll */ });
  };
  useEffect(() => {
    const root = wrap.current;
    if (!root || typeof IntersectionObserver !== "function") { for (let n = 1; n <= Math.min(3, book.numPages); n++) load(n, 1); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const n = Number((e.target as HTMLElement).dataset.n);
        if (e.isIntersecting) {
          near.current.add(n);
          load(n, 1);
          for (let k = 1; k <= ahead; k++) load(n + k, 3);
        } else {
          near.current.delete(n);
          // far pages give their picture back so memory stays small
          setImgs((m) => { if (!(n in m) || Math.abs(n - cur) < 8) return m; const c = { ...m }; delete c[n]; return c; });
        }
      }
      const vis = [...near.current].sort((a, b) => a - b)[0];
      if (vis) { setCur(vis); window.dispatchEvent(new CustomEvent("lib-page", { detail: vis })); if (remember) { try { localStorage.setItem(key, String(vis)); } catch { /* ignore */ } } }
    }, { rootMargin: "600px 0px" });
    root.querySelectorAll("[data-n]").forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, width, ahead]);
  useEffect(() => {
    if (!remember) return;
    let p = 0; try { p = Number(localStorage.getItem(key) ?? 0); } catch { /* ignore */ }
    if (p > 1 && p <= book.numPages) requestAnimationFrame(() => wrap.current?.querySelector(`[data-n="${p}"]`)?.scrollIntoView());
  }, [book, key, remember]);

  return (
    <div className="lib-scroll" ref={wrap} data-testid="lib-scroll" style={{ maxWidth: maxW }}>
      {showNum && <div className="lib-pageno" aria-live="polite">{lt("page", s.lang)} {cur} / {book.numPages}</div>}
      {pages.map((n) => (
        <div key={n} className="lib-page" data-n={n} style={{ aspectRatio: String(book.ratio) }}>
          {imgs[n] ? <img src={imgs[n]} alt={`${name} ${lt("page", s.lang)} ${n}`} decoding="async" /> : <span className="lib-wait" aria-hidden="true">{n}</span>}
        </div>
      ))}
    </div>
  );
}

interface BookInfo { reader: boolean; fallbackPdf: boolean; state: string; fast: { pages: number; ratio: number; base: string } | null }
const Reader = lazy(() => import("../components/reader/Reader").then((m) => ({ default: m.Reader })));

export function LibraryBookPage() {
  const { id = "" } = useParams<{ id: string }>();
  const s = useSettings();
  const on = s.get("feature.library") === true;
  const { state, data } = useLibrary(on);
  const book = data?.books.find((b) => b.id === id);
  // how to show the book: the site's Book Reader (ready-made page pictures when they exist) or, as a fallback, the plain PDF scroller
  const [info, setInfo] = useState<BookInfo | null>(null);
  const [forcePdf, setForcePdf] = useState(false);
  const [pdf, setPdf] = useState<PdfBook | null>(null);
  const [fail, setFail] = useState(false);
  useEffect(() => {
    if (!book) return;
    let alive = true;
    setInfo(null); setForcePdf(false);
    fetch(`/api/v1/library/${encodeURIComponent(book.id)}/info`).then((r) => (r.ok ? (r.json() as Promise<BookInfo>) : Promise.reject(new Error(String(r.status)))))
      .then((x) => alive && setInfo(x), () => alive && setInfo({ reader: true, fallbackPdf: true, state: "unknown", fast: null }));
    return () => { alive = false; };
  }, [book?.id]);
  const useReader = !!info && info.reader && !forcePdf;
  useEffect(() => {
    if (!book || !info || useReader) return;
    let alive = true, opened: PdfBook | null = null;
    setPdf(null); setFail(false);
    void import("../lib/reader/pdf").then((m) => m.openBook(fileUrl(book.id))).then((b) => { opened = b; if (alive) setPdf(b); else b.destroy(); }, () => alive && setFail(true));
    return () => { alive = false; opened?.destroy(); };
  }, [book?.id, info, useReader]);
  if (!on || state === "off") return <NotFound />;
  if (state === "loading") return <Loading />;
  if (!book) return <NotFound />;
  const canDownload = book.contributed ? book.contributed.download : s.get("library.reader.showDownload") === true;
  const pages = book.pages || info?.fast?.pages || pdf?.numPages || 0;
  const details = (
    <section className="books library lib-book" aria-label={book.title} data-testid="library-book">
      {!useReader && <Crumbs items={[{ href: "/", label: "Home" }, { href: "/library", label: lt("title", s.lang) }, { label: book.title }]} />}
      {!useReader && <h1>{book.title}</h1>}
      <p className="small lib-credit">
        {book.authors.length > 0 && <>{lt("by", s.lang)} {book.authors.join(", ")} · </>}
        {book.ageBand}{book.ageSource === "guess" ? ` (${lt("ageGuess", s.lang)})` : ""} · {book.language}{book.pages ? ` · ${book.pages} ${lt("pages", s.lang)}` : ""} · {mb(book.bytes)}
        <br />{lt("licence", s.lang)}: {book.licence.url ? <a href={book.licence.url} rel="noopener noreferrer" target="_blank">{book.licence.name}</a> : book.licence.name} · {lt("source", s.lang)}: <a href={book.source.url} rel="noopener noreferrer" target="_blank">{book.source.siteName}</a>
      </p>
      {book.contributed && <p className="small contrib-badge" data-testid="contrib-badge">🤝 {ct("badge", s.lang)}{s.get("contrib.publish.showContributor") !== false && <> · {ct("by", s.lang)} {s.get("contrib.publish.profiles") !== false && book.contributed.handle ? <Link href={`/library/by/${book.contributed.handle}`}>{book.contributed.by}</Link> : book.contributed.by}</>}{book.contributed.licenceNote && <> · {book.contributed.licenceNote}</>}</p>}
      {!useReader && canDownload && <p className="actions"><a className="btn" href={fileUrl(book.id)} download>{lt("download", s.lang)}</a></p>}
      {book.contributed && pages > 0 && <BookTools id={book.id} pages={pages} canTakedown={s.get("contrib.takedown.enabled") !== false} />}
      {!useReader && (fail ? <p className="empty">{lt("loadFail", s.lang)}</p> : !pdf ? <Loading /> : <PdfScroller book={pdf} id={book.id} name={book.title} />)}
      <p className="small">{lt("credit", s.lang)}</p>
    </section>
  );
  if (!info) return <Loading />;
  if (!useReader) return details;
  const prefetch = Number(s.get("library.reader.prefetchPages") ?? 3);
  return (
    <>
      <Suspense fallback={<div className="paper"><Loading /></div>}>
        <Reader key={book.id} onFail={info.fallbackPdf ? () => setForcePdf(true) : undefined} book={{
          id: `lib-${book.id}`, title: book.title, subtitle: [book.authors.join(", "), book.licence.name].filter(Boolean).join(" · "), url: fileUrl(book.id), fileName: `${book.id}.pdf`,
          language: book.language, subject: book.ageBand, readAloudInitiallyOpen: false, backHref: "/library", fast: info.fast, download: canDownload, prefetch: Number.isFinite(prefetch) ? prefetch : 3,
        }} />
      </Suspense>
      {details}
    </>
  );
}
