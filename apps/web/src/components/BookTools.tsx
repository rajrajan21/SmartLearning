import { VoiceSearchInput } from "./VoiceSearchInput";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../lib/settings";
import { contribApi, ct } from "../lib/contrib";

const store = (k: string, d: unknown) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const keep = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };
const goTo = (n: number) => document.querySelector(`.lib-scroll [data-n="${n}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });

/** Extra reading tools for books people contributed: search, contents, bookmarks, notes, themes, zoom, read-aloud, report. Everything personal stays on this device. */
export function BookTools({ id, pages, canTakedown }: { id: string; pages: number; canTakedown: boolean }) {
  const s = useSettings();
  const lang = s.lang;
  const on = (k: string) => s.get(k) !== false;
  const [text, setText] = useState<{ pages: string[]; outline: { title: string; page: number }[] } | null>(null);
  const [q, setQ] = useState("");
  const [cur, setCur] = useState(1);
  const [theme, setTheme] = useState<string>(() => store("ss_lib_theme", "day"));
  const [zoom, setZoom] = useState<number>(() => store(`ss_lib_zoom_${id}`, 100));
  const [marks, setMarks] = useState<number[]>(() => store(`ss_lib_marks_${id}`, []));
  const [note, setNote] = useState<string>(() => store(`ss_lib_note_${id}`, ""));
  const [speaking, setSpeaking] = useState(false);
  const [dlg, setDlg] = useState<"" | "problem" | "takedown">("");
  const [msg, setMsg] = useState("");
  const form = useRef({ kind: "other", message: "", name: "", email: "", relationship: "owner" });

  useEffect(() => { if (on("contrib.reader.searchInBook")) contribApi.text(id).then(setText, () => setText(null)); }, [id]);
  useEffect(() => { const h = (e: Event) => setCur((e as CustomEvent<number>).detail); window.addEventListener("lib-page", h); return () => window.removeEventListener("lib-page", h); }, []);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".lib-scroll"); if (!el) return;
    el.dataset.theme = theme; el.style.fontSize = ""; el.style.width = `${zoom}%`; el.style.marginInline = "auto";
    keep("ss_lib_theme", theme); keep(`ss_lib_zoom_${id}`, zoom);
  }, [theme, zoom, id]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (/input|textarea|select/i.test((e.target as HTMLElement).tagName)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") goTo(Math.min(pages, cur + 1));
      else if (e.key === "ArrowLeft" || e.key === "PageUp") goTo(Math.max(1, cur - 1));
      else if (e.key === "+" ) setZoom((z) => Math.min(200, z + 10));
      else if (e.key === "-") setZoom((z) => Math.max(50, z - 10));
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [cur, pages]);
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* none */ } }, []);

  const hits = useMemo(() => {
    const n = q.trim().toLowerCase(); if (!text || n.length < 2) return [];
    const out: { page: number; snip: string }[] = [];
    text.pages.forEach((p, i) => { const at = p.toLowerCase().indexOf(n); if (at >= 0 && out.length < 40) out.push({ page: i + 1, snip: p.slice(Math.max(0, at - 30), at + 70).replace(/\s+/g, " ") }); });
    return out;
  }, [q, text]);

  const toggleMark = () => { const m = marks.includes(cur) ? marks.filter((x) => x !== cur) : [...marks, cur].sort((a, b) => a - b); setMarks(m); keep(`ss_lib_marks_${id}`, m); };
  const speak = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const t = text?.pages[cur - 1]; if (!t) return;
    const u = new SpeechSynthesisUtterance(t.slice(0, 4000)); u.lang = lang === "ta" ? "ta-IN" : "en-IN"; u.onend = () => setSpeaking(false);
    synth.speak(u); setSpeaking(true);
  };
  const send = async () => {
    const f = form.current;
    try { if (dlg === "problem") await contribApi.problem(id, f.kind, f.message); else await contribApi.takedown(id, f); setMsg("Thank you. We will look at it."); setDlg(""); } catch (e) { setMsg((e as Error).message); }
  };

  return (
    <section className="book-tools group" data-testid="book-tools" aria-label="Reading tools">
      <div className="lib-row">
        {on("contrib.reader.themes") && <label>🌓 <select value={theme} onChange={(e) => setTheme(e.target.value)}><option value="day">{ct("day", lang)}</option><option value="night">{ct("night", lang)}</option><option value="sepia">{ct("sepia", lang)}</option></select></label>}
        <button type="button" className="btn" onClick={() => setZoom((z) => Math.max(50, z - 10))} aria-label={ct("zoomOut", lang)}>A−</button>
        <button type="button" className="btn" onClick={() => setZoom((z) => Math.min(200, z + 10))} aria-label={ct("zoomIn", lang)}>A+</button>
        {on("contrib.reader.notes") && <button type="button" className="btn" aria-pressed={marks.includes(cur)} onClick={toggleMark}>🔖 {ct("bookmark", lang)}</button>}
        {on("contrib.reader.readAloud") && typeof window !== "undefined" && "speechSynthesis" in window && text && <button type="button" className="btn" onClick={speak}>{speaking ? ct("stop", lang) : `🔊 ${ct("read", lang)}`}</button>}
        {on("contrib.reader.reportButton") && <button type="button" className="btn" onClick={() => setDlg("problem")}>⚑ {ct("report", lang)}</button>}
        {canTakedown && <button type="button" className="btn" onClick={() => setDlg("takedown")}>{ct("takedown", lang)}</button>}
      </div>
      {text && <VoiceSearchInput onVoice={setQ} value={q} onChange={(e) => setQ(e.target.value)} placeholder={ct("searchIn", lang)} aria-label={ct("searchIn", lang)} />}
      {hits.length > 0 && <ul className="small">{hits.map((h) => <li key={h.page}><button type="button" className="linklike" onClick={() => goTo(h.page)}>p.{h.page}</button> …{h.snip}…</li>)}</ul>}
      {text && text.outline.length > 0 && <details><summary>{ct("contents", lang)}</summary><ul>{text.outline.map((o, i) => <li key={i}><button type="button" className="linklike" onClick={() => goTo(o.page)}>{o.title}</button> <span className="small">p.{o.page}</span></li>)}</ul></details>}
      {marks.length > 0 && <p className="small">{ct("bookmarks", lang)}: {marks.map((m) => <button key={m} type="button" className="chip" onClick={() => goTo(m)}>{m}</button>)}</p>}
      {on("contrib.reader.notes") && <details><summary>{ct("notes", lang)}</summary><textarea value={note} rows={4} maxLength={4000} onChange={(e) => { setNote(e.target.value); keep(`ss_lib_note_${id}`, e.target.value); }} /></details>}
      {dlg && (
        <div role="dialog" aria-label={dlg === "problem" ? ct("report", lang) : ct("takedown", lang)} className="group">
          {dlg === "problem" ? <select onChange={(e) => { form.current.kind = e.target.value; }}><option value="other">Other</option><option value="copyright">Copyright</option><option value="personal">Personal data</option><option value="unsafe">Unsafe content</option><option value="broken">Does not open / unreadable</option></select>
            : <><input placeholder="Name" onChange={(e) => { form.current.name = e.target.value; }} /><input type="email" placeholder="Email" onChange={(e) => { form.current.email = e.target.value; }} /><input placeholder="Your relationship to the work" onChange={(e) => { form.current.relationship = e.target.value; }} /></>}
          <textarea rows={3} maxLength={1000} placeholder="Tell us what is wrong" onChange={(e) => { form.current.message = e.target.value; }} />
          <button type="button" className="btn" onClick={() => void send()}>OK</button> <button type="button" className="btn" onClick={() => setDlg("")}>×</button>
        </div>
      )}
      {msg && <p role="status" className="small">{msg}</p>}
    </section>
  );
}
