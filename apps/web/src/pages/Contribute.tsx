import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "wouter";
import { useSettings } from "../lib/settings";
import { Crumbs, Loading, NotFound } from "../components/bits";
import { ApiErr, contribApi, ct, STATUS_TEXT, type ContribConfig, type FetchedDetails, type MySub, type Notice } from "../lib/contrib";
import { lt } from "../lib/library";

const empty = { title: "", author: "", board: "General reading", classLevel: "", subject: "", language: "en", licence: "", sourceUrl: "", licenceProof: "", attribution: "name", displayName: "", link: "" };

export function ContributePage() {
  const s = useSettings();
  const lang = s.lang;
  const [cfg, setCfg] = useState<ContribConfig | null>(null);
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [f, setF] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [consent, setConsent] = useState(false);
  const [answer, setAnswer] = useState("");
  const [site, setSite] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [fetched, setFetched] = useState<FetchedDetails | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const [auto, setAuto] = useState<string[]>([]); // fields filled by Fetch details (a refetch may replace them; fields the person typed are kept)
  const load = () => { contribApi.config().then(setCfg, () => setCfg((previous) => previous ?? { enabled: false })); };
  useEffect(load, []);
  if (!cfg) return <Loading />;
  if (s.get("feature.library") !== true) return <NotFound />;
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setF((x) => ({ ...x, [k]: value }));
    setAuto((fields) => fields.filter((key) => key !== k));
  };
  const lic = cfg.licences?.find((l) => l.id === f.licence);
  const rules = String(s.get("contrib.rulesText") ?? "");

  const fetchDetails = async () => {
    if (fetching || (mode === "upload" ? !file : !f.link.trim())) return;
    setFetching(true); setFetchErr(""); setFetched(null);
    try {
      const d = mode === "upload" && file ? await contribApi.fetchPdfDetails(file) : await contribApi.fetchDetails(f.link.trim());
      const v = d.fields, mine = new Set(auto), filled: string[] = [];
      const lic = cfg.licences?.some((l) => l.id === v.licence) ? v.licence : undefined;
      const lang = cfg.languages?.includes(v.language ?? "") ? v.language : undefined;
      const pdf = d.kind === "page" ? d.pdfLinks[0]?.url : undefined; // a page address was pasted: the PDF on it becomes the link and the page becomes the source
      setF((x) => {
        const next = { ...x };
        const put = (k: keyof typeof empty, val: string | undefined) => { if (val && (!x[k] || mine.has(k) || (k === "licence" && x.licence === "own") || (k === "language" && x.language === "en"))) { next[k] = val; filled.push(k); } };
        put("title", v.title); put("author", v.author); put("language", lang); put("licence", lic); put("classLevel", v.classLevel); put("subject", v.subject);
        put("sourceUrl", v.sourceUrl ?? (d.kind === "page" ? d.finalUrl : undefined)); put("licenceProof", v.licenceProof);
        if (pdf) next.link = pdf;
        return next;
      });
      setAuto(filled); setFetched(d);
    } catch (x) { setFetchErr(x instanceof ApiErr ? x.message : ct("fetchedNone", lang)); } finally { setFetching(false); }
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErr(""); setDone("");
    const missing = !consent ? "consentRequired" : cfg.challenge && !answer.trim() ? "challengeRequired" : !lic ? "chooseLicence" : undefined;
    if (missing) { setErr(ct(missing, lang)); return; }
    setBusy(true);
    const meta = { ...f, consent, token: cfg.challenge?.token, answer, website: site };
    try {
      if (mode === "upload") { if (!file) { setErr(ct("fieldRequired", lang)); return; } await contribApi.upload(file, meta); }
      else await contribApi.link(meta);
      setDone(ct("thanks", lang)); setF(empty); setFile(null); setConsent(false); setAnswer(""); setFetched(null); setAuto([]);
      if (fileInput.current) fileInput.current.value = "";
      load();
    } catch (x) { setErr(x instanceof ApiErr ? x.message : ct("sendUnknown", lang)); setAnswer(""); load(); } finally { setBusy(false); }
  };

  return (
    <main className="books library contribute" data-testid="contribute-page">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/library", label: lt("title", lang) }, { label: ct("title", lang) }]} />
      <h1>{ct("title", lang)}</h1>
      <p>{ct("intro", lang)}</p>
      {!cfg.enabled ? <p className="empty">{ct("off", lang)}</p>
        : cfg.child ? <p className="empty">{ct("child", lang)}</p>
        : !cfg.canContribute ? <p className="empty">{ct("signin", lang)} <Link href="/account">Account</Link></p> : (
          <>
            {rules && <details open><summary>{ct("rules", lang)}</summary><div className="small" style={{ whiteSpace: "pre-line" }}>{rules}</div></details>}
            <p className="small">{cfg.remainingToday} {ct("left", lang)} · max {cfg.maxMB} MB · {cfg.minPages}–{cfg.maxPages} pages {cfg.signedIn && <>· <Link href="/library/my-contributions">{ct("mine", lang)}</Link></>}</p>
            <form onSubmit={(e) => void submit(e)} className="contrib-form" onChange={() => { if (err) setErr(""); }}
              onInvalid={(e) => {
                if (e.currentTarget.querySelector(":invalid") !== e.target) return;
                const field = e.target as HTMLInputElement;
                setErr(field.type === "checkbox" ? ct("consentRequired", lang) : field.name === "answer" ? ct("challengeRequired", lang) : ct("fieldRequired", lang));
              }}>
              <fieldset><legend className="sr-only">Source</legend>
                <label><input type="radio" name="mode" checked={mode === "upload"} onChange={() => setMode("upload")} /> {ct("pdf", lang)}</label>{" "}
                {cfg.linkEnabled && <label><input type="radio" name="mode" checked={mode === "link"} onChange={() => setMode("link")} /> {ct("link", lang)}</label>}
              </fieldset>
              {mode === "upload"
                ? <label>{ct("pdf", lang)} <input ref={fileInput} type="file" accept="application/pdf,.pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFetched(null); }} required /></label>
                :
                  <label>{ct("link", lang)} <input type="url" value={f.link} onChange={(e) => { set("link")(e); setFetched(null); }} placeholder={cfg.httpsOnly ? "https://" : "http(s)://"} required /></label>}
              {cfg.fetchEnabled !== false && <>
                {" "}<button type="button" className="btn" data-testid="fetch-details" disabled={fetching || busy || (mode === "upload" ? !file : !f.link.trim())} onClick={() => void fetchDetails()}>{fetching ? ct("fetching", lang) : ct("fetch", lang)}</button>
                {mode === "link" && <p className="small">{ct("fetchHelp", lang)}</p>}
                {fetchErr && <p className="error" role="alert">{fetchErr}</p>}
                {fetched && (
                  <div className="group fetch-found" role="status" data-testid="fetch-result">
                    <h3>{ct("foundTitle", lang)}</h3>
                    {Object.keys(fetched.fields).some((k) => k !== "sourceUrl") ? <p className="small">{ct("fetched", lang)}</p> : <p className="small">{ct("fetchedNone", lang)}</p>}
                    <ul className="small">
                      {(["title", "author", "language", "licence", "classLevel", "subject", "year", "publisher"] as const).filter((k) => fetched.fields[k]).map((k) => (
                        <li key={k}>{{ title: ct("bTitle", lang), author: ct("bAuthor", lang), language: ct("lang", lang), licence: ct("licence", lang), classLevel: ct("cls", lang), subject: ct("subject", lang), year: "Year", publisher: "Publisher" }[k]}: <strong>{fetched.fields[k]}</strong>{" "}
                          <em>({ct(fetched.confidence[k] === "high" ? "confHigh" : fetched.confidence[k] === "medium" ? "confMedium" : "confLow", lang)})</em></li>
                      ))}
                      {fetched.fields.coverUrl && <li>{ct("cover", lang)}: <a href={fetched.fields.coverUrl} target="_blank" rel="noopener noreferrer nofollow">{new URL(fetched.fields.coverUrl).hostname}</a></li>}
                    </ul>
                    {fetched.fields.description && <details><summary>{ct("about", lang)}</summary><p className="small">{fetched.fields.description}</p></details>}
                    {fetched.pdfLinks.length > 1 && <><p className="small">{ct("pdfFound", lang)}</p><ul className="small">{fetched.pdfLinks.map((l) => <li key={l.url}>{l.label} <button type="button" className="btn" disabled={l.url === f.link} onClick={() => setF((x) => ({ ...x, link: l.url }))}>{ct("usePdf", lang)}</button></li>)}</ul></>}
                    {fetched.notes.map((n, i) => <p key={i} className="small">{n}</p>)}
                  </div>
                )}
              </>}
              <label>{ct("bTitle", lang)} <input value={f.title} onChange={set("title")} maxLength={150} required /></label>
              <label>{ct("bAuthor", lang)} <input value={f.author} onChange={set("author")} maxLength={100} required /></label>
              <label>{ct("board", lang)} <select value={f.board} onChange={set("board")}>{cfg.boards?.map((b) => <option key={b}>{b}</option>)}</select></label>
              <label>{ct("cls", lang)} <input value={f.classLevel} onChange={set("classLevel")} maxLength={30} /></label>
              <label>{ct("subject", lang)} <input value={f.subject} onChange={set("subject")} maxLength={60} /></label>
              <label>{ct("lang", lang)} <select value={f.language} onChange={set("language")}>{cfg.languages?.map((l) => <option key={l}>{l}</option>)}</select></label>
              <label>{ct("licence", lang)} <select value={f.licence} onChange={set("licence")} required><option value="" disabled>{ct("chooseLicence", lang)}</option>{cfg.licences?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
              {lic?.url && <p className="small"><a href={lic.url} target="_blank" rel="noopener noreferrer">{lic.name}</a></p>}
              {(lic && (lic.needsProof || f.licence !== "own")) && <>
                <label>{ct("srcUrl", lang)} <input type="url" value={f.sourceUrl} onChange={set("sourceUrl")} required={!!cfg.requireProof} /></label>
                <label>{ct("proof", lang)} <input value={f.licenceProof} onChange={set("licenceProof")} maxLength={300} required={!!cfg.requireProof} /></label></>}
              <label>{ct("attr", lang)} <select value={f.attribution} onChange={set("attribution")}><option value="name">{ct("byName", lang)}</option>{cfg.anonymousAllowed && <option value="anonymous">{ct("anon", lang)}</option>}</select></label>
              {f.attribution === "name" && <label>{ct("nick", lang)} <input value={f.displayName} onChange={set("displayName")} maxLength={40} /></label>}
              {cfg.honeypot && <div aria-hidden="true" style={{ position: "absolute", left: -9999 }}><label>Website <input tabIndex={-1} autoComplete="off" value={site} onChange={(e) => setSite(e.target.value)} /></label></div>}
              {cfg.challenge && <label>{cfg.challenge.question} <input name="answer" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value)} required /></label>}
              <label className="consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /> {ct("consent", lang)}</label>
              {err && <p className="error" role="alert">{err} {cfg.signedIn && <Link href="/library/my-contributions">{ct("mine", lang)}</Link>}</p>}
              {done && <p className="ok" role="status">{done} {cfg.signedIn && <Link href="/library/my-contributions">{ct("mine", lang)}</Link>}</p>}
              {busy && <p role="status">{ct("sending", lang)}</p>}
              <button className="btn" type="submit" disabled={busy || fetching}>{busy ? ct("sending", lang) : ct("send", lang)}</button>
            </form>
          </>
        )}
    </main>
  );
}

export function MyContributionsPage() {
  const s = useSettings();
  const lang = s.lang;
  const [d, setD] = useState<{ submissions: MySub[]; notices: Notice[] } | null>(null);
  const [err, setErr] = useState("");
  const load = () => { contribApi.mine().then((x) => { setD(x); setErr(""); }, (e: ApiErr) => setErr(e.message)); };
  useEffect(load, []);
  useEffect(() => { if (d?.notices.some((n) => !n.read)) void contribApi.readNotices().catch(() => undefined); }, [d]);
  if (s.get("feature.library") !== true) return <NotFound />;
  return (
    <main className="books library contribute" data-testid="my-contributions">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/library", label: lt("title", lang) }, { label: ct("mine", lang) }]} />
      <h1>{ct("mine", lang)}</h1>
      <p><Link className="btn" href="/library/contribute">{ct("title", lang)}</Link></p>
      {err && <p className="error" role="alert">{err}</p>}
      {!d && !err && <Loading />}
      {d?.notices.slice(-5).reverse().map((n) => <p key={n.id} className={n.read ? "small" : "small notice"} role="status">{n.text}</p>)}
      {d && d.submissions.length === 0 && <p className="empty">{ct("none", lang)}</p>}
      {d?.submissions.map((x) => (
        <article key={x.id} className="group contrib-sub" data-testid="my-sub">
          <h3>{x.title} <small>— {STATUS_TEXT[x.status] ?? x.status}</small></h3>
          {x.reasons.length > 0 && <ul>{x.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>}
          {x.checks.length > 0 && <details><summary>Checks{x.score != null ? ` (${x.score}/100)` : ""}</summary><ul>{x.checks.map((c) => <li key={c.id}>{c.label}: {c.status}{c.detail ? ` — ${c.detail}` : ""}</li>)}</ul></details>}
          <p className="actions">
            {x.status === "published" && x.bookId && <Link className="btn" href={`/library/${x.bookId}`}>{ct("open", lang)}</Link>}{" "}
            {["received", "checking", "in_review", "changes_requested"].includes(x.status) && <button type="button" className="btn" onClick={() => void contribApi.withdraw(x.id).then(load, (e: Error) => setErr(e.message))}>{ct("withdraw", lang)}</button>}
          </p>
        </article>
      ))}
    </main>
  );
}

export function ContributorPage() {
  const { handle = "" } = useParams<{ handle: string }>();
  const s = useSettings();
  const [p, setP] = useState<{ name: string; handle: string; books: { id: string; title: string }[] } | null | "none">(null);
  useEffect(() => { contribApi.profile(handle).then(setP, () => setP("none")); }, [handle]);
  if (p === null) return <Loading />;
  if (p === "none") return <NotFound />;
  return (
    <main className="books library contribute" data-testid="contributor-page">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/library", label: lt("title", s.lang) }, { label: p.name }]} />
      <h1>{p.name}</h1>
      <h2>{ct("contributor", s.lang)}</h2>
      <ul>{p.books.map((b) => <li key={b.id}><Link href={`/library/${b.id}`}>{b.title}</Link></li>)}</ul>
    </main>
  );
}
