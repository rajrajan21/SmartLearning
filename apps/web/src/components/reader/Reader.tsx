import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { useSettings } from "../../lib/settings";
import { UI, ui, type UiKey } from "../../lib/i18n";
import { readerStore } from "../../lib/reader/books";
import type { PdfBook } from "../../lib/reader/pdf";
import type { Sentence } from "../../lib/reader/sentences";
import { clampPage, leftOf, positionOf, rightOf, stepTarget, viewIndex, visiblePages } from "../../lib/reader/spread";
import { baseLang, bookReadLang, clampRate, pickVoice, preferredLang, voiceLabel, voicesFor, type ReadLang } from "../../lib/reader/voices";
import "./reader.css";

/**
 * The textbook reader. One engine (page turning, zoom, read aloud, print) with three looks:
 * A Hardcover, B Digital, C Library. Ported from the approved prototypes (engine.js + the three templates).
 */
export type ReaderStyle = "a" | "b" | "c";
export interface ReaderBook {
  /** stable id, used for what is remembered on this device (last page, bookmark, language) */
  id: string;
  title: string;
  subtitle: string;
  /** the PDF on this server */
  url: string;
  fileName: string;
  language: string;
  subject: string;
  backHref: string;
  /** ready-made page pictures, when they were built (much faster than the PDF) */
  fast?: { pages: number; ratio: number; base: string } | null;
  /** chapters and sub-chapters with the page they start on */
  toc?: TocEntry[];
}
interface Props { book: ReaderBook; /** for tests: how a PDF is opened */ open?: (url: string) => Promise<PdfBook> }
export interface TocEntry { title: string; page: number; level: number }

const SINGLE_BELOW = 760;
const STYLE_OPTS: Record<ReaderStyle, { turnMs: number; lift: number }> = { a: { turnMs: 850, lift: 5 }, b: { turnMs: 520, lift: 0 }, c: { turnMs: 900, lift: 2 } };
const fmt = (s: string, v?: Record<string, string | number>) => (v ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? "")) : s);
const defaultOpen = (url: string) => import("../../lib/reader/pdf").then((m) => m.openBook(url));
const fastOpen = (info: NonNullable<ReaderBook["fast"]>, url: string) => import("../../lib/reader/fast").then((m) => m.openFast(info, url));
const isStyle = (v: unknown): v is ReaderStyle => v === "a" || v === "b" || v === "c";

function Ic({ id, className = "" }: { id: string; className?: string }) {
  return <svg className={`rd-ic ${className}`} aria-hidden="true" focusable="false"><use href={`#rd-i-${id}`} /></svg>;
}
/** icon set of the prototypes (icons.html) */
function Icons() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs>
      <symbol id="rd-i-prev" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></symbol>
      <symbol id="rd-i-next" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></symbol>
      <symbol id="rd-i-plus" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4M11 8v6M8 11h6" /></symbol>
      <symbol id="rd-i-minus" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4M8 11h6" /></symbol>
      <symbol id="rd-i-full" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></symbol>
      <symbol id="rd-i-down" viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></symbol>
      <symbol id="rd-i-print" viewBox="0 0 24 24"><path d="M7 9V4h10v5M7 17H4v-7h16v7h-3M7 14h10v6H7z" /></symbol>
      <symbol id="rd-i-play" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor" /></symbol>
      <symbol id="rd-i-pause" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14" strokeWidth="3.2" /></symbol>
      <symbol id="rd-i-stop" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></symbol>
      <symbol id="rd-i-mark" viewBox="0 0 24 24"><path d="M7 4h10v16l-5-4-5 4z" /></symbol>
      <symbol id="rd-i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" /></symbol>
      <symbol id="rd-i-voice" viewBox="0 0 24 24"><path d="M4 10v4h3l5 4V6l-5 4zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" /></symbol>
      <symbol id="rd-i-shelf" viewBox="0 0 24 24"><path d="M5 4v15M9 4v15M5 19h14M13 6l5 13" /></symbol>
    </defs></svg>
  );
}

/** A page picture. Shows the best picture that is ready now and swaps in the sharp one when it is drawn. */
function PageImg({ doc, n, width, alt, priority }: { doc: PdfBook; n: number; width: number; alt: string; priority: number }) {
  const key = `${n}@${width}`;
  const [loaded, setLoaded] = useState<{ key: string; url: string } | null>(null);
  useEffect(() => {
    if (!n || !(width > 0)) return;
    let alive = true;
    doc.image(n, width, priority).then((url) => { if (alive) setLoaded({ key, url }); }, () => { /* the page stays blank paper */ });
    return () => { alive = false; };
  }, [doc, n, width, key, priority]);
  if (!n) return null;
  const src = (loaded && loaded.key === key ? loaded.url : null) ?? doc.ready(n, width);
  return src ? <img src={src} alt={alt} draggable={false} /> : <span className="rd-ph" role="img" aria-label={alt} />;
}

function Thumb({ doc, n, current, label, onGo, root }: { doc: PdfBook; n: number; current: boolean; label: string; onGo: (n: number) => void; root: React.RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [src, setSrc] = useState<string | null>(() => doc.ready(n));
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function") return;
    let alive = true;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      doc.thumb(n).then((url) => { if (alive) setSrc(url); }, () => { /* stays a blank tile */ });
    }, { root: root.current, rootMargin: "0px 240px" });
    io.observe(el);
    return () => { alive = false; io.disconnect(); };
  }, [doc, n, root]);
  return (
    <button ref={ref} type="button" className="rd-thumb" data-p={n} aria-label={label} aria-current={current ? "page" : undefined} onClick={() => onGo(n)}>
      {src ? <img src={src} alt="" loading="lazy" /> : <span className="rd-thumb-ph" />}
      <span>{n}</span>
    </button>
  );
}

interface Turn { id: number; fwd: boolean; old: number; target: number; single: boolean; done?: () => void }
interface GoOpts { instant?: boolean; keepReading?: boolean; done?: () => void }
interface Spoken extends Sentence { page: number }
type TtsState = "idle" | "playing" | "paused";

export function Reader({ book, open }: Props) {
  const s = useSettings();
  const lang = s.lang;
  const t = useCallback((k: UiKey, v?: Record<string, string | number>) => fmt(ui(k, lang), v), [lang]);

  // ---------- settings ----------
  const adminStyle = isStyle(s.get<string>("reader.style")) ? (s.get<string>("reader.style") as ReaderStyle) : "c";
  const allowPicker = s.get("reader.allowStylePicker") !== false;
  const [pickedStyle, setPickedStyle] = useState<ReaderStyle | null>(() => readerStore.style());
  const style: ReaderStyle = allowPicker && pickedStyle ? pickedStyle : adminStyle;
  const aloudOn = s.get("reader.readAloud") !== false;
  const showDownload = s.get("reader.showDownload") !== false;
  const showPrint = s.get("reader.showPrint") !== false;
  const useFast = s.get("reader.fastPages") !== false;
  const showToc = s.get("reader.toc.show") !== false;
  const [tocOpen, setTocOpen] = useState(false);
  const [discOpen, setDiscOpen] = useState(true);
  const discText = s.get("reader.disclaimer.show") !== false ? s.text("reader.disclaimer.text") : "";
  const voiceSetting = s.get<string>("reader.voiceLang") || "en-IN";
  const appMotion = s.get<string>("theme.motion");
  const sopts = STYLE_OPTS[style];

  // ---------- the book ----------
  const [doc, setDoc] = useState<PdfBook | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const N = doc?.numPages ?? 0;
  const [single, setSingle] = useState(() => typeof window !== "undefined" && window.innerWidth < SINGLE_BELOW);
  const [page, setPage] = useState(1);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [zoom, setZoom] = useState(1);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [night, setNight] = useState(() => readerStore.night());
  const [mark, setMark] = useState(() => readerStore.mark(book.id));
  const [printOpen, setPrintOpen] = useState(false);
  const [printMsg, setPrintMsg] = useState<UiKey | null>(null);
  const [bookFrame, setBookFrame] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const frontShade = useRef<HTMLDivElement>(null), backShade = useRef<HTMLDivElement>(null);
  const castL = useRef<HTMLDivElement>(null), castR = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLElement>(null);
  const live = useRef({ page: 1, single, N: 0, zoom: 1, ratio: 0.75, turn: null as Turn | null, turnId: 0, lastSwipe: 0, keepScroll: null as null | { cx: number; cy: number } });
  live.current.single = single; live.current.N = N; live.current.zoom = zoom; live.current.ratio = doc?.ratio ?? 0.75;

  useEffect(() => {
    let alive = true, mine: PdfBook | null = null;
    setDoc(null); setFailed(false); setReady(false);
    (open ? open(book.url) : useFast && book.fast ? fastOpen(book.fast, book.url) : defaultOpen(book.url)).then(
      (b) => {
        if (!alive) return void b.destroy();
        mine = b;
        const start = clampPage(readerStore.page(book.id) || 1, b.numPages);
        live.current.page = start; setPage(start); setDoc(b);
      },
      () => { if (alive) setFailed(true); },
    );
    return () => { alive = false; mine?.destroy(); };
  }, [book.url, book.id, open, attempt, useFast]);

  const reduced = useCallback(() => appMotion === "reduced" || appMotion === "off" || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches), [appMotion]);

  // ---------- read aloud: state ----------
  const synth = useMemo(() => (typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function" ? window.speechSynthesis : null), []);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [readLang, setReadLang] = useState<ReadLang>(() => readerStore.lang(book.id) ?? (bookReadLang(book.language, book.subject) === "ta" || baseLang(voiceSetting) === "ta" ? "ta" : "en"));
  const [voiceNames, setVoiceNames] = useState<Record<ReadLang, string | null>>(() => ({ en: readerStore.voice("en"), ta: readerStore.voice("ta") }));
  const [rate, setRate] = useState(() => clampRate(readerStore.rate(), clampRate(s.get<number>("reader.defaultSpeed"), 0.9)));
  const [autoTurn, setAutoTurn] = useState(() => readerStore.autoTurn() ?? s.get("reader.autoTurn") !== false);
  const [aloudOpen, setAloudOpen] = useState(() => typeof window === "undefined" || window.innerWidth >= SINGLE_BELOW);
  const [ttsState, setTtsState] = useState<TtsState>("idle");
  const [ttsI, setTtsI] = useState(0);
  const [ttsMsg, setTtsMsg] = useState<UiKey | null>(null);
  const [testMsg, setTestMsg] = useState<UiKey | null>(null);
  const [list, setList] = useState<{ key: string; items: Spoken[] } | null>(null);
  const want = preferredLang(readLang, voiceSetting);
  const usable = useMemo(() => voicesFor(voices, want), [voices, want]);
  const voice = useMemo(() => pickVoice(voices, want, voiceNames[readLang]), [voices, want, voiceNames, readLang]);
  const T = useRef({ state: "idle" as TtsState, i: 0, token: 0, empties: 0, list: [] as Spoken[], listKey: "", utter: null as SpeechSynthesisUtterance | null, voice, want, rate, autoTurn });
  T.current.voice = voice; T.current.want = want; T.current.rate = rate; T.current.autoTurn = autoTurn;
  const syncTts = () => { setTtsState(T.current.state); setTtsI(T.current.i); };

  const loadVoices = useCallback(() => { try { setVoices(synth?.getVoices() ?? []); } catch { setVoices([]); } }, [synth]);
  useEffect(() => {
    if (!synth) return;
    loadVoices();
    synth.addEventListener?.("voiceschanged", loadVoices);
    return () => { synth.removeEventListener?.("voiceschanged", loadVoices); synth.cancel(); };
  }, [synth, loadVoices]);

  const listKeyOf = (p: number, sgl: boolean) => `${sgl ? "s" : "d"}${sgl ? p : Math.floor(p / 2)}`;
  const listFor = useCallback(async (p: number): Promise<Spoken[]> => {
    if (!doc) return [];
    const vis = visiblePages(p, doc.numPages, live.current.single);
    const per = await Promise.all(vis.map((n) => doc.text(n).catch(() => [] as Sentence[])));
    return per.flatMap((arr, k) => arr.map((x) => ({ ...x, page: vis[k]! })));
  }, [doc]);

  // the words of the pages on screen (for the transcript, and ready for the Read aloud button)
  useEffect(() => {
    if (!doc || !aloudOn) return;
    let alive = true;
    const key = listKeyOf(page, single);
    void listFor(page).then((items) => {
      if (!alive) return;
      if (T.current.listKey !== key || T.current.state === "idle") { T.current.list = items; T.current.listKey = key; }
      setList({ key, items });
    });
    for (const n of visiblePages(stepTarget(page, 1, doc.numPages, single), doc.numPages, single)) void doc.text(n).catch(() => []);
    return () => { alive = false; };
  }, [doc, page, single, aloudOn, listFor]);

  // ---------- turning ----------
  const finalize = useCallback(() => {
    const tn = live.current.turn;
    if (!tn) return;
    live.current.turn = null;
    setTurn(null);
    tn.done?.();
  }, []);

  const ttsStop = useCallback((msg: UiKey | null = null) => {
    const x = T.current;
    x.token++; x.state = "idle"; x.i = 0; x.empties = 0;
    try { synth?.cancel(); } catch { /* nothing to stop */ }
    setTtsMsg(msg); syncTts();
  }, [synth]);

  // these three call each other (speak -> spread done -> turn -> speak), so they live in one ref
  const flow = useRef<{ speakAt(i: number): void; startSpread(p: number, token: number, i?: number): Promise<void>; spreadDone(): void; go(target: number, o?: GoOpts): void }>(null!);
  flow.current = {
    speakAt(i) {
      const x = T.current;
      if (!synth) return;
      const token = ++x.token, sentence = x.list[i];
      if (!sentence) return flow.current.spreadDone();
      const u = new SpeechSynthesisUtterance(sentence.t);
      if (x.voice) { u.voice = x.voice; u.lang = x.voice.lang; } else u.lang = x.want;
      u.rate = x.rate;
      u.onend = () => {
        if (token !== x.token || x.state !== "playing") return;
        x.i++; x.empties = 0;
        if (x.i >= x.list.length) flow.current.spreadDone(); else flow.current.speakAt(x.i);
      };
      u.onerror = (e) => {
        if (token !== x.token) return;
        if (e.error === "interrupted" || e.error === "canceled") return;
        ttsStop("rdVoiceFail");
      };
      x.utter = u; // keep it alive until it has finished speaking
      x.state = "playing"; x.i = i; setTtsMsg(null); syncTts();
      const busy = synth.speaking || synth.pending;
      synth.cancel();
      // straight after a cancel some browsers drop the next sentence, so give them a moment
      if (busy) setTimeout(() => { if (token === x.token && x.state === "playing") synth.speak(u); }, 60);
      else synth.speak(u);
    },
    async startSpread(p, token, i = 0) {
      const x = T.current;
      const items = await listFor(p);
      if (token !== x.token || x.state !== "playing") return;
      x.list = items; x.listKey = listKeyOf(p, live.current.single);
      if (items.length > 0) return flow.current.speakAt(Math.min(i, items.length - 1));
      // nothing to read here (a picture or a scanned page)
      x.empties++;
      const last = visiblePages(p, live.current.N, live.current.single).includes(live.current.N);
      if (!x.autoTurn || last || x.empties >= 3) return ttsStop("rdNoTextLong");
      x.i = 0; syncTts();
      setTimeout(() => { if (token === x.token && x.state === "playing") flow.current.spreadDone(); }, 1400);
    },
    spreadDone() {
      const x = T.current, L = live.current;
      const last = visiblePages(L.page, L.N, L.single).includes(L.N);
      if (!x.autoTurn || last) return ttsStop();
      const token = ++x.token;
      x.i = 0;
      const next = stepTarget(L.page, 1, L.N, L.single);
      flow.current.go(next, { keepReading: true, done: () => { if (token === x.token && x.state === "playing") void flow.current.startSpread(next, token); } });
    },
    go(target, o = {}) {
      const L = live.current;
      if (!L.N) return;
      target = clampPage(target, L.N);
      finalize();
      const old = L.page, from = viewIndex(old, L.single), to = viewIndex(target, L.single);
      L.page = target; setPage(target);
      readerStore.setPage(book.id, target);
      if (from === to) return void o.done?.();
      let done = o.done;
      const x = T.current;
      if (!o.keepReading && x.state !== "idle") { // the reader turned the page by hand
        const token = ++x.token;
        try { synth?.cancel(); } catch { /* ignore */ }
        x.i = 0; x.empties = 0; syncTts();
        if (x.state === "playing") done = () => { o.done?.(); if (token === x.token && x.state === "playing") void flow.current.startSpread(target, token); };
      }
      setTtsMsg(null);
      const animate = !o.instant && !reduced() && typeof Element !== "undefined" && typeof Element.prototype.animate === "function" && box.w > 0;
      if (!animate) return void done?.();
      const tn: Turn = { id: ++L.turnId, fwd: to > from, old, target, single: L.single, done };
      L.turn = tn; setTurn(tn);
    },
  };
  const go = useCallback((target: number, o?: GoOpts) => flow.current.go(target, o), []);
  const step = useCallback((d: 1 | -1, o?: GoOpts) => { const L = live.current; if (L.N) flow.current.go(stepTarget(L.page, d, L.N, L.single), o); }, []);

  // the page-turn animation (Web Animations, as in the prototype)
  useLayoutEffect(() => {
    const flip = flipRef.current;
    if (!turn || !flip) return;
    const ms = sopts.turnMs, lift = sopts.lift, ease = "cubic-bezier(.42,.02,.28,1)";
    const anims: Animation[] = [];
    const A = (node: Element | null, frames: Keyframe[]) => { if (node) anims.push(node.animate(frames, { duration: ms, easing: ease, fill: "both" })); };
    const fwd = turn.fwd;
    if (turn.single) {
      const out: Keyframe[] = [{ transform: "rotateY(0deg)", opacity: 1 }, { transform: `rotateY(-62deg) skewY(${-lift}deg)`, opacity: 1, offset: 0.7 }, { transform: "rotateY(-88deg)", opacity: 0 }];
      A(flip, fwd ? out : out.slice().reverse().map((k, i) => (i === 1 ? { ...k, offset: 0.3 } : k)));
      A(frontShade.current, fwd ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }]);
      A(castR.current, fwd ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }]);
    } else if (fwd) {
      A(flip, [{ transform: "rotateY(0deg)" }, { transform: `rotateY(-90deg) skewY(${-lift}deg)`, offset: 0.5 }, { transform: "rotateY(-180deg)" }]);
      A(frontShade.current, [{ opacity: 0 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }]);
      A(backShade.current, [{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }]);
      A(castR.current, [{ opacity: 1 }, { opacity: 0 }]);
      A(castL.current, [{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }]);
    } else {
      A(flip, [{ transform: "rotateY(-180deg)" }, { transform: `rotateY(-90deg) skewY(${lift}deg)`, offset: 0.5 }, { transform: "rotateY(0deg)" }]);
      A(backShade.current, [{ opacity: 0 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }]);
      A(frontShade.current, [{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }]);
      A(castL.current, [{ opacity: 1 }, { opacity: 0 }]);
      A(castR.current, [{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }]);
    }
    if (anims[0]) anims[0].onfinish = () => { if (live.current.turn === turn) finalize(); };
    else finalize();
    return () => { for (const a of anims) { try { a.cancel(); } catch { /* already gone */ } } };
  }, [turn, sopts.turnMs, sopts.lift, finalize]);

  // ---------- sizing, zoom, full screen ----------
  const layout = useCallback(() => {
    const st = stageRef.current;
    if (!st) return;
    const L = live.current;
    const sgl = window.innerWidth < SINGLE_BELOW;
    if (sgl !== L.single) { finalize(); L.single = sgl; setSingle(sgl); }
    const cs = getComputedStyle(st);
    const aw = st.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const ah = st.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    const ratio = (sgl ? 1 : 2) * L.ratio;
    const w = Math.round(Math.max(120, Math.min(aw, ah * ratio)) * L.zoom);
    const h = Math.round(w / ratio);
    setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
  }, [finalize]);
  useLayoutEffect(() => { layout(); }, [layout, doc, zoom, style, fullscreen, single]);
  useEffect(() => {
    const st = stageRef.current;
    window.addEventListener("resize", layout);
    const ro = st && typeof ResizeObserver === "function" ? new ResizeObserver(() => layout()) : null;
    if (st && ro) ro.observe(st);
    return () => { window.removeEventListener("resize", layout); ro?.disconnect(); };
  }, [layout, doc]);
  useLayoutEffect(() => { // keep the same spot in the middle of the screen when the zoom changes
    const st = stageRef.current, keep = live.current.keepScroll;
    if (!st || !keep) return;
    live.current.keepScroll = null;
    st.scrollLeft = keep.cx * st.scrollWidth - st.clientWidth / 2;
    st.scrollTop = keep.cy * st.scrollHeight - st.clientHeight / 2;
  }, [box]);
  const zoomTo = useCallback((z: number) => {
    const st = stageRef.current;
    if (st && st.scrollWidth > 0 && st.scrollHeight > 0) live.current.keepScroll = { cx: (st.scrollLeft + st.clientWidth / 2) / st.scrollWidth, cy: (st.scrollTop + st.clientHeight / 2) / st.scrollHeight };
    setZoom(Math.max(1, Math.min(3, Math.round(z * 4) / 4)));
  }, []);
  useEffect(() => { if (doc && box.w > 0 && !ready) { const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true))); return () => cancelAnimationFrame(id); } }, [doc, box.w, ready]);

  const canFullscreen = typeof document !== "undefined" && !!(document.documentElement.requestFullscreen || (document.documentElement as unknown as { webkitRequestFullscreen?: unknown }).webkitRequestFullscreen);
  const toggleFullscreen = useCallback(() => {
    const d = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
    const el = wrapRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) void (d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.());
      else if (el) { const p = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.(); if (p && typeof p.catch === "function") p.catch(() => { /* not allowed here */ }); }
    } catch { /* not allowed here */ }
  }, []);
  useEffect(() => {
    const on = () => { const d = document as Document & { webkitFullscreenElement?: Element }; setFullscreen(!!(d.fullscreenElement || d.webkitFullscreenElement)); setTimeout(layout, 60); };
    document.addEventListener("fullscreenchange", on); document.addEventListener("webkitfullscreenchange", on);
    return () => { document.removeEventListener("fullscreenchange", on); document.removeEventListener("webkitfullscreenchange", on); };
  }, [layout]);

  // ---------- keyboard, swipe ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && printOpen) { setPrintOpen(false); return; }
      if (e.altKey || e.ctrlKey || e.metaKey || printOpen) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      const k = e.key, z = live.current.zoom;
      if (k === "ArrowRight" || k === "PageDown") { step(1); e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "PageUp") { step(-1); e.preventDefault(); }
      else if (k === "Home") { go(1); e.preventDefault(); }
      else if (k === "End") { go(live.current.N); e.preventDefault(); }
      else if (k === "+" || k === "=") zoomTo(z + 0.25);
      else if (k === "-") zoomTo(z - 0.25);
      else if (k === "0") zoomTo(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, go, zoomTo, printOpen]);

  const down = useRef<{ x: number; y: number; sl: number; st: number; mouse: boolean; t: number } | null>(null);
  const stageHandlers = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => { if (e.button) return; const st = e.currentTarget; down.current = { x: e.clientX, y: e.clientY, sl: st.scrollLeft, st: st.scrollTop, mouse: e.pointerType === "mouse", t: Date.now() }; },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => { const d = down.current; if (d && d.mouse && live.current.zoom > 1 && e.buttons) { e.currentTarget.scrollLeft = d.sl - (e.clientX - d.x); e.currentTarget.scrollTop = d.st - (e.clientY - d.y); } },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      const d = down.current; down.current = null;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (live.current.zoom > 1) { if (Math.abs(dx) + Math.abs(dy) > 8) live.current.lastSwipe = Date.now(); return; }
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - d.t < 900) { live.current.lastSwipe = Date.now(); step(dx < 0 ? 1 : -1); }
    },
    onPointerCancel: () => { down.current = null; },
  };
  const edge = (d: 1 | -1) => { if (Date.now() - live.current.lastSwipe > 400) step(d); };

  // ---------- derived ----------
  const vis = N ? visiblePages(page, N, single) : [];
  const first = vis[0] ?? 1;
  const atStart = first === 1, atEnd = vis[vis.length - 1] === N;
  const pos = N ? positionOf(page, N, single) : "front";
  const label = !N ? "" : !single && first === 1 ? t("rdFront", { n: N }) : !single && vis.length === 1 && first === N ? t("rdBackCover", { n: N }) : vis.length === 2 ? t("rdPagesOf", { a: vis[0]!, b: vis[1]!, n: N }) : t("rdPageOf", { a: first, n: N });
  const pageName = useCallback((n: number) => (n === 1 ? t("rdFrontShort") : n === N && N > 1 ? t("rdBackShort") : t("rdPageN", { n })), [t, N]);
  const progress = N > 1 ? (first - 1) / (N - 1) : 0;
  const markHere = mark > 0 && vis.includes(mark);

  // what each part of the book shows right now (during a turn the old and new pages are mixed, as in the prototype)
  let showL = 0, showR = 0, front = 0, back = 0;
  if (N) {
    if (!turn) { showL = single ? 0 : leftOf(page); showR = single ? page : rightOf(page, N); }
    else if (turn.single) { showR = turn.fwd ? turn.target : turn.old; front = turn.fwd ? turn.old : turn.target; }
    else if (turn.fwd) { showL = leftOf(turn.old); showR = rightOf(turn.target, N); front = rightOf(turn.old, N); back = leftOf(turn.target); }
    else { showL = leftOf(turn.target); showR = rightOf(turn.old, N); front = rightOf(turn.target, N); back = leftOf(turn.old); }
  }
  const dpr = typeof window === "undefined" ? 1 : Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const pageW = Math.round((single ? box.w : box.w / 2) * dpr);
  const isCover = (n: number) => n === 1 || n === N;

  // draw the neighbours ahead of time so a turn never shows blank paper
  useEffect(() => {
    if (!doc || !(pageW > 0)) return;
    const n = doc.numPages;
    // a quick small picture first (shows at once), then the sharp one; then several pages ahead so turning never waits
    const want = (p: number, pr: number, quick = false) => { for (const x of visiblePages(p, n, single)) { if (quick && pageW > 900) doc.image(x, 600, pr - 1).catch(() => { /* shown blank */ }); doc.image(x, pageW, pr).catch(() => { /* shown blank */ }); } };
    want(page, 0, true);
    const ahead = [1, 2, 3].map((k) => { let q = page; for (let i = 0; i < k; i++) q = stepTarget(q, 1, n, single); return q; });
    const behind = stepTarget(page, -1, n, single);
    const id = setTimeout(() => { want(ahead[0]!, 2, true); want(behind, 3, true); want(ahead[1]!, 4); want(ahead[2]!, 5); }, 120);
    return () => clearTimeout(id);
  }, [doc, page, single, pageW]);

  // film strip: keep the current page in view
  useEffect(() => {
    const th = thumbsRef.current;
    const cur = th?.querySelector<HTMLElement>("[aria-current]");
    if (th && cur && typeof th.scrollTo === "function") th.scrollTo({ left: cur.offsetLeft - th.clientWidth / 2 + cur.offsetWidth, behavior: reduced() ? "auto" : "smooth" });
  }, [page, single, style, doc, reduced]);

  useEffect(() => { // the page behind the reader takes the reader's colour (seen when a phone page bounces at the ends)
    const el = wrapRef.current;
    if (!el) return;
    const before = document.body.style.background, title = document.title;
    document.body.style.background = getComputedStyle(el).backgroundColor;
    document.body.classList.add("rd-body");
    document.title = book.title;
    return () => { document.body.style.background = before; document.body.classList.remove("rd-body"); document.title = title; };
  }, [style, night, book.title]);

  // ---------- read aloud: actions ----------
  const items = list && list.key === listKeyOf(page, single) ? list.items : null;
  const active = ttsState !== "idle" && T.current.listKey === listKeyOf(page, single) ? T.current.list[ttsI] ?? null : null;
  const ttsToggle = () => {
    const x = T.current;
    if (!synth || !doc) return;
    setTestMsg(null);
    if (x.state === "playing") { x.token++; synth.cancel(); x.state = "paused"; syncTts(); return; }
    const from = x.state === "idle" ? 0 : x.i;
    x.empties = 0; x.state = "playing";
    const key = listKeyOf(live.current.page, live.current.single);
    if (x.listKey === key && x.list.length > 0) flow.current.speakAt(Math.min(from, x.list.length - 1)); // straight from the tap: phones need that
    else { const token = ++x.token; syncTts(); void flow.current.startSpread(live.current.page, token, from); }
  };
  const speakFrom = (i: number) => { if (!synth) return; setTestMsg(null); T.current.empties = 0; flow.current.speakAt(i); };
  const chooseVoice = (name: string) => { setVoiceNames((v) => ({ ...v, [readLang]: name })); readerStore.setVoice(readLang, name); };
  useEffect(() => { if (T.current.state === "playing") flow.current.speakAt(T.current.i); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [voice?.name, readLang]);
  const chooseLang = (l: ReadLang) => { setReadLang(l); readerStore.setLang(book.id, l); setTestMsg(null); setTtsMsg(null); };
  const commitRate = () => { readerStore.setRate(rate); if (T.current.state === "playing") flow.current.speakAt(T.current.i); };
  const testVoice = () => {
    if (!synth) return;
    ttsStop();
    const u = new SpeechSynthesisUtterance(readLang === "ta" ? UI.rdTestTa.en : UI.rdTestEn.en);
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = want;
    u.rate = rate;
    const noTamil = readLang === "ta" && !voice;
    setTestMsg(noTamil ? "rdTestNoTa" : "rdTesting");
    u.onend = () => setTestMsg((m) => (m === "rdTesting" ? null : m));
    u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled") setTestMsg(noTamil ? "rdTestNoTa" : "rdVoiceFail"); };
    T.current.utter = u;
    synth.speak(u);
  };
  const recheckVoices = () => { loadVoices(); const now = (() => { try { return synth?.getVoices() ?? []; } catch { return []; } })(); setTestMsg(voicesFor(now, "ta-IN").length > 0 ? null : "rdStillNoTa"); };

  const statusText = !synth ? t("rdNoSynth")
    : ttsMsg ? t(ttsMsg)
    : ttsState === "playing" ? (active ? t("rdReading", { a: ttsI + 1, n: T.current.list.length }) : t("rdFinding"))
    : ttsState === "paused" ? t("rdPaused")
    : items === null ? t("rdFinding")
    : items.length === 0 ? t("rdNoText")
    : vis.length === 2 ? t("rdReady2") : t("rdReady1");
  const playLabel = ttsState === "playing" ? t("rdPause") : ttsState === "paused" ? t("rdResume") : t("rdAloud");

  // keep the spoken sentence in view inside the transcript
  const scriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box2 = scriptRef.current, on = box2?.querySelector<HTMLElement>(".rd-sent.rd-on");
    if (!box2 || !on) return;
    const top = on.offsetTop - box2.offsetTop;
    if (top < box2.scrollTop || top + on.offsetHeight > box2.scrollTop + box2.clientHeight) box2.scrollTop = top - 30;
  }, [ttsI, ttsState, items]);

  // ---------- bookmark, night, style, print ----------
  const toggleMark = () => { const m = markHere ? 0 : vis[vis.length - 1] ?? 0; setMark(m); readerStore.setMark(book.id, m); };
  const toggleNight = () => { setNight((v) => { readerStore.setNight(!v); return !v; }); };
  const chooseStyle = (v: string) => { if (isStyle(v)) { setPickedStyle(v); readerStore.setStyle(v); } };
  const printSpread = () => { setPrintOpen(false); setTimeout(() => window.print(), 50); };
  const printBook = () => {
    setPrintOpen(false);
    setPrintMsg("rdPrintPreparing");
    setBookFrame(null);
    setTimeout(() => setBookFrame(`${book.url}${book.url.includes("?") ? "&" : "?"}print=${Date.now()}`), 0);
  };
  const onBookFrame = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const frame = e.currentTarget;
    setTimeout(() => { // the browser's PDF viewer needs a moment after the file has loaded
      try { frame.contentWindow!.focus(); frame.contentWindow!.print(); setPrintMsg(null); }
      catch { window.open(book.url, "_blank", "noopener"); setPrintMsg("rdPrintFail"); }
    }, 700);
  };

  // ---------- shared pieces ----------
  const cls = style === "a" ? { btn: "rd-plate", primary: "rd-plate rd-go", solid: "rd-plate" } : style === "b" ? { btn: "rd-pill", primary: "rd-pill rd-solid", solid: "rd-pill rd-solid" } : { btn: "rd-btn", primary: "rd-btn rd-fill", solid: "rd-btn rd-fill" };
  const fill = (v: number) => ({ ["--fill" as string]: `${v}%` }) as CSSProperties;

  const backLink = (c: string) => <Link href={book.backHref} className={`${c} rd-sq rd-backlink`} aria-label={t("rdBack")} title={t("rdBack")}><Ic id="shelf" /></Link>;
  const stylePick = allowPicker ? (
    <label className="rd-stylepick" title={t("rdStyle")}>
      <span className="rd-vh">{t("rdStyle")}</span>
      <select value={style} onChange={(e) => chooseStyle(e.target.value)} data-r="style">
        <option value="a">{t("rdStyleA")}</option><option value="b">{t("rdStyleB")}</option><option value="c">{t("rdStyleC")}</option>
      </select>
    </label>
  ) : null;
  const download = (c: string) => showDownload ? <a className={c} data-r="download" href={`${book.url}${book.url.includes("?") ? "&" : "?"}download=1`} download={book.fileName}><Ic id="down" /><span className="rd-lbl">{t("rdDownload")}</span></a> : null;
  const printBtn = (c: string, text: string, tool = false) => showPrint ? <button className={c} type="button" data-act="print" aria-haspopup="dialog" aria-label={tool ? undefined : t("rdPrintPages")} disabled={!doc} onClick={() => setPrintOpen(true)}><Ic id="print" />{tool ? text : <span className="rd-lbl">{text}</span>}</button> : null;
  const fullBtn = (c: string) => canFullscreen ? <button className={c} type="button" data-act="fullscreen" aria-pressed={fullscreen} aria-label={fullscreen ? t("rdFullExit") : t("rdFull")} onClick={toggleFullscreen}><Ic id="full" /><span className="rd-lbl">{fullscreen ? t("rdFullExit") : t("rdFull")}</span></button> : null;
  const tocList = book.toc ?? [];
  const curChapter = [...tocList].reverse().find((e) => e.page <= Math.max(1, page));
  const tocBtn = (c: string) => showToc ? <button className={c} type="button" data-act="contents" aria-expanded={tocOpen} aria-controls="rd-toc" disabled={!doc} onClick={() => setTocOpen((o) => !o)}><span className="rd-lbl">☰ {t("rdContents")}</span></button> : null;
  const tocPanel = (
    <>
      {showToc && tocOpen && (
        <aside className="rd-toc" id="rd-toc" aria-label={t("rdContents")}>
          <div className="rd-toc-h"><b>{t("rdContents")}</b><button type="button" className="rd-toc-x" aria-label="Close" onClick={() => setTocOpen(false)}>✕</button></div>
          {tocList.length === 0 ? <p className="rd-none">{t("rdNoContents")}</p> : (
            <ol>{tocList.map((e, i) => <li key={i} className={`rd-toc-l${e.level}`}><button type="button" aria-current={curChapter === e ? "true" : undefined} onClick={() => { go(e.page); if (single) setTocOpen(false); }}><span>{e.title}</span><small>{t("rdPageNShort", { n: e.page })}</small></button></li>)}</ol>
          )}
          {discText && <p className="rd-disc-line">{discText}</p>}
        </aside>
      )}
      {discText && discOpen && <p className="rd-disc" role="note"><span>{discText}</span><button type="button" aria-label="Close" onClick={() => setDiscOpen(false)}>✕</button></p>}
    </>
  );
  const heading = <h1>{book.title} <small>{book.subtitle}</small></h1>;

  const hl = (n: number) => (
    <div className="rd-hl">
      {!turn && active && active.page === n && active.r.map((r, i) => <i key={i} style={{ left: `${r[0] * 100}%`, top: `${r[1] * 100}%`, width: `${r[2] * 100}%`, height: `${r[3] * 100}%` }} />)}
    </div>
  );
  const bookEl = (extra?: ReactNode) => (
    <div className="rd-stage" data-r="stage" ref={stageRef} {...stageHandlers}>
      <div
        className={`rd-book${single ? " rd-single" : ""}${!single && N > 0 && page < 2 ? " rd-at-front" : ""}${!single && N > 0 && Math.floor(page / 2) * 2 === N ? " rd-at-back" : ""}${turn ? ` rd-turning ${turn.fwd ? "rd-fwd" : "rd-bwd"}` : ""}`}
        data-r="book" role="group" aria-label={t("rdBook")} style={{ width: box.w || undefined, height: box.h || undefined, ["--progress" as string]: progress.toFixed(3) } as CSSProperties}
      >
        {extra}
        <div className={`rd-pg rd-l${showL ? "" : " rd-empty"}${showL && isCover(showL) ? " rd-cover" : ""}`} data-p={showL || undefined}>
          {doc && showL > 0 && <PageImg doc={doc} n={showL} width={pageW} alt={pageName(showL)} priority={0} />}
          {hl(showL)}<div className="rd-cast" ref={castL} />
        </div>
        <div className={`rd-pg rd-r${showR ? "" : " rd-empty"}${showR && isCover(showR) ? " rd-cover" : ""}`} data-p={showR || undefined}>
          {doc && showR > 0 && <PageImg doc={doc} n={showR} width={pageW} alt={pageName(showR)} priority={0} />}
          {hl(showR)}<div className="rd-cast" ref={castR} />
        </div>
        <div className={`rd-flip${turn ? " rd-on" : ""}`} ref={flipRef} aria-hidden="true">
          <div className={`rd-face rd-front${front && isCover(front) ? " rd-cover" : ""}`}>{doc && front > 0 && <PageImg doc={doc} n={front} width={pageW} alt="" priority={0} />}<div className="rd-shade" ref={frontShade} /></div>
          <div className={`rd-face rd-back${back && isCover(back) ? " rd-cover" : ""}`} style={turn?.single ? { visibility: "hidden" } : undefined}>{doc && back > 0 && <PageImg doc={doc} n={back} width={pageW} alt="" priority={0} />}<div className="rd-shade" ref={backShade} /></div>
        </div>
        <button type="button" className="rd-edge rd-prev" tabIndex={-1} aria-hidden="true" title={t("rdPrevPage")} hidden={atStart || !doc} onClick={() => edge(-1)} />
        <button type="button" className="rd-edge rd-next" tabIndex={-1} aria-hidden="true" title={t("rdNextPage")} hidden={atEnd || !doc} onClick={() => edge(1)} />
      </div>
      {!doc && (
        <div className="rd-msg" role="status">
          {failed ? <><p>{t("rdLoadFail")}</p><button type="button" className={cls.btn} onClick={() => setAttempt((a) => a + 1)}>{t("retry")}</button></> : <p>{t("rdLoading")}</p>}
        </div>
      )}
    </div>
  );
  const arrows = (c: string) => (<>
    <button className={`${c} rd-p`} type="button" data-act="prev" aria-label={t("rdPrevPage")} disabled={atStart || !doc} onClick={() => step(-1)}><Ic id="prev" /></button>
    <button className={`${c} rd-n`} type="button" data-act="next" aria-label={t("rdNextPage")} disabled={atEnd || !doc} onClick={() => step(1)}><Ic id="next" /></button>
  </>);
  const prevBtn = (c: string) => <button className={`${c} rd-bprev`} type="button" data-act="prev" disabled={atStart || !doc} onClick={() => step(-1)}><Ic id="prev" />{t("rdPrev")}</button>;
  const nextBtn = (c: string) => <button className={`${c} rd-bnext`} type="button" data-act="next" disabled={atEnd || !doc} onClick={() => step(1)}>{t("rdNext")}<Ic id="next" /></button>;
  const slider = (
    <div className="rd-scrub">
      <input type="range" data-r="slider" min={1} max={Math.max(1, N)} step={1} value={first} disabled={!doc} aria-label={t("rdSlider")} aria-valuetext={label} style={fill(progress * 100)} onChange={(e) => go(Number(e.target.value), { instant: true })} />
    </div>
  );
  const counter = <output className="rd-count" data-r="counter" aria-live="polite">{label}</output>;
  const zoomGroup = (c: string) => (
    <div className="rd-zoom" role="group" aria-label={t("rdZoom")}>
      <button className={`${c} rd-sq`} type="button" data-act="zoomout" aria-label={t("rdZoomOut")} disabled={zoom <= 1} onClick={() => zoomTo(zoom - 0.25)}><Ic id="minus" /></button>
      <output data-r="zoomOut" aria-label={t("rdZoomLevel")}>{Math.round(zoom * 100)}%</output>
      <button className={`${c} rd-sq`} type="button" data-act="zoomin" aria-label={t("rdZoomIn")} disabled={zoom >= 3} onClick={() => zoomTo(zoom + 0.25)}><Ic id="plus" /></button>
    </div>
  );
  const gotoForm = (c: string) => <GotoForm btnClass={c} first={first} max={N} label={t("rdGoto")} go={t("rdGo")} disabled={!doc} onGo={(v) => go(v)} />;

  const aloudBody = (
    <div className="rd-in">
      <div className="rd-row">
        <button className={cls.primary} type="button" data-act="play" aria-label={playLabel} disabled={!synth || !doc} onClick={ttsToggle}><Ic id="play" className="rd-ico-play" /><Ic id="pause" className="rd-ico-pause" /><span className="rd-lbl">{playLabel}</span></button>
        <button className={cls.btn} type="button" data-act="stop" disabled={!synth || ttsState === "idle"} onClick={() => ttsStop()}><Ic id="stop" /><span className="rd-lbl">{t("rdStop")}</span></button>
      </div>
      <p className="rd-status" data-r="ttsStatus" role="status">{statusText}</p>
      <div className="rd-row rd-langrow">
        <label>{t("rdLang")}
          <select data-r="readLang" value={readLang} onChange={(e) => chooseLang(e.target.value === "ta" ? "ta" : "en")}>
            <option value="en">{t("rdLangEn")}</option><option value="ta">{t("rdLangTa")}</option>
          </select>
        </label>
        <button className={`${cls.btn} rd-test`} type="button" data-act="testvoice" disabled={!synth} onClick={testVoice}><Ic id="voice" /><span className="rd-lbl">{t("rdTest")}</span></button>
      </div>
      <label>{t("rdVoice")}
        <select data-r="voice" value={voice?.name ?? ""} disabled={usable.length === 0} onChange={(e) => chooseVoice(e.target.value)}>
          {usable.length === 0 ? <option value="">{readLang === "ta" ? t("rdNoTaVoice") : t("rdDeviceVoice")}</option> : usable.map((v) => <option key={`${v.name}|${v.lang}`} value={v.name}>{voiceLabel(v)}</option>)}
        </select>
      </label>
      {synth && readLang === "ta" && usable.length === 0 && s.get("reader.tamilVoiceHelp") !== false && (
        <div className="rd-help" data-r="tamilHelp" role="note">
          <strong>{t("rdTaHelpTitle")}</strong>
          <p>{t("rdTaHelpIntro")}</p>
          <ul><li>{t("rdTaAndroid")}</li><li>{t("rdTaWindows")}</li><li>{t("rdTaIphone")}</li><li>{t("rdTaBrowsers")}</li></ul>
          <p>{t("rdTaAfter")}</p>
          <button className={cls.btn} type="button" data-act="recheck" onClick={recheckVoices}>{t("rdCheckAgain")}</button>
        </div>
      )}
      {testMsg && <p className="rd-status rd-testmsg" role="status">{t(testMsg)}</p>}
      <label>{t("rdSpeed")}
        <span className="rd-speed">
          <input type="range" data-r="rate" min={0.5} max={1.5} step={0.1} value={rate} aria-label={t("rdSpeedLabel")} style={fill(((rate - 0.5) / 1) * 100)}
            onChange={(e) => setRate(clampRate(e.target.value, rate))} onPointerUp={commitRate} onKeyUp={commitRate} onBlur={commitRate} />
          <output data-r="rateOut">{rate.toFixed(1)}×</output>
        </span>
      </label>
      <label className="rd-check"><input type="checkbox" data-r="autoturn" checked={autoTurn} onChange={(e) => { setAutoTurn(e.target.checked); readerStore.setAutoTurn(e.target.checked); }} />{t("rdAuto")}</label>
      <div className="rd-script" data-r="transcript" tabIndex={0} role="group" aria-label={t("rdScript")} ref={scriptRef}>
        {items === null ? <p className="rd-none">{doc ? t("rdFinding") : ""}</p> : items.length === 0 ? <p className="rd-none">{t("rdNoTextLong")}</p> : vis.map((n) => {
          const mine = items.map((x, i) => ({ x, i })).filter((e) => e.x.page === n);
          return mine.length === 0 ? null : (
            <div key={n}><h4>{pageName(n)}</h4><p>{mine.map(({ x, i }) => <span key={i} className={`rd-sent${active && ttsI === i ? " rd-on" : ""}`} data-i={i} onClick={() => speakFrom(i)}>{x.t} </span>)}</p></div>
          );
        })}
      </div>
    </div>
  );
  const aloud = (className: string) => aloudOn ? (
    <details className={className} data-r="ttsPanel" open={aloudOpen} onToggle={(e) => setAloudOpen(e.currentTarget.open)}>
      <summary><Ic id="voice" />{t("rdAloud")}</summary>
      {aloudBody}
    </details>
  ) : null;
  const film = (
    <nav className="rd-film" data-r="thumbs" aria-label={t("rdAllPages")} ref={thumbsRef}>
      {doc && Array.from({ length: N }, (_, i) => <Thumb key={i} doc={doc} n={i + 1} current={vis.includes(i + 1)} label={t("rdGoToN", { n: i + 1 })} onGo={(n) => go(n)} root={thumbsRef} />)}
    </nav>
  );

  const rootProps = {
    className: `rd-reader${night && style === "c" ? " rd-night" : ""}${zoom > 1 ? " rd-zoomed" : ""}${single ? " rd-is-single" : ""}${fullscreen ? " rd-is-fullscreen" : ""}${ready ? " rd-ready" : ""}${aloudOn ? "" : " rd-noaloud"}`,
    "data-r": "root", "data-pos": pos, "data-tts": ttsState, "data-mark": markHere ? "here" : mark ? "else" : "none", "data-style": style,
  };

  let chrome: ReactNode;
  if (style === "a") {
    chrome = (
      <div {...rootProps}>
        <header className="rd-top">
          {backLink("rd-plate")}
          <span className="rd-brand">{s.text("site.name") || "SharpStudy"}</span>
          {heading}
          {stylePick}
          {tocBtn("rd-plate")}
          {download("rd-plate")}
          {printBtn("rd-plate", t("rdPrint"))}
          {fullBtn("rd-plate")}
        </header>
        <main className="rd-deskwrap">
          {bookEl(<><div className="rd-board rd-l" /><div className="rd-board rd-r" /><div className="rd-stack rd-l" /><div className="rd-stack rd-r" /></>)}
          {arrows("rd-arrow")}
        </main>
        {aloud("rd-card")}
        <footer className="rd-bar">
          {prevBtn("rd-plate")}{slider}{nextBtn("rd-plate")}{counter}{gotoForm("rd-plate")}{zoomGroup("rd-plate")}
        </footer>
      </div>
    );
  } else if (style === "b") {
    chrome = (
      <div {...rootProps}>
        <header className="rd-top">
          {backLink("rd-pill rd-sky")}
          <span className="rd-logo" aria-hidden="true">{(s.text("site.name") || "S").slice(0, 1)}</span>
          {heading}
          {stylePick}
          {tocBtn("rd-pill rd-peach")}
          {download("rd-pill rd-peach")}
          {printBtn("rd-pill rd-peach", t("rdPrint"))}
          {fullBtn("rd-pill rd-peach")}
        </header>
        <main className="rd-canvas">
          {bookEl()}
          {arrows("rd-round")}
        </main>
        {aloud("rd-aloud rd-fillpanel")}
        <div className="rd-nav">
          {prevBtn("rd-pill rd-sky")}{slider}{nextBtn("rd-pill rd-sky")}{counter}{gotoForm("rd-pill rd-solid")}{zoomGroup("rd-pill rd-butter")}
        </div>
        {film}
      </div>
    );
  } else {
    chrome = (
      <div {...rootProps}>
        <header className="rd-shelf">
          {backLink("rd-btn")}
          <div className="rd-spines" aria-hidden="true">
            {[["#e2a43b", 54], ["#3f7d6a", 60], ["#c85a48", 48], ["#5a6fb0", 57], ["#d9c38a", 44], ["#7f4f7a", 59], ["#2f8f9a", 52]].map(([c, h], i) => <i key={i} className={i === 6 ? "rd-lean" : undefined} style={{ ["--c" as string]: c, ["--h" as string]: `${h}px` } as CSSProperties} />)}
          </div>
          {heading}
          {stylePick}
          {tocBtn("rd-btn")}
          <button className="rd-btn" type="button" data-act="night" aria-pressed={night} onClick={toggleNight}><Ic id="moon" /><span className="rd-lbl">{night ? t("rdDay") : t("rdNight")}</span></button>
          {download("rd-btn")}
        </header>
        <aside className="rd-rail" aria-label={t("rdTools")}>
          <button className="rd-tool" type="button" data-act="bookmark" aria-pressed={markHere} disabled={!doc} onClick={toggleMark}><Ic id="mark" /><span className="rd-lbl">{markHere ? t("rdUnmark") : t("rdBookmark")}</span></button>
          <button className="rd-tool" type="button" data-act="gomark" hidden={!mark || markHere} onClick={() => go(mark)}><Ic id="next" /><span className="rd-lbl">{t("rdGoMark", { n: mark })}</span></button>
          <hr />
          <button className="rd-tool" type="button" data-act="zoomin" disabled={zoom >= 3} onClick={() => zoomTo(zoom + 0.25)}><Ic id="plus" />{t("rdZoomIn")}</button>
          <output data-r="zoomOut" aria-label={t("rdZoomLevel")}>{Math.round(zoom * 100)}%</output>
          <button className="rd-tool" type="button" data-act="zoomout" disabled={zoom <= 1} onClick={() => zoomTo(zoom - 0.25)}><Ic id="minus" />{t("rdZoomOut")}</button>
          <hr />
          {canFullscreen && <button className="rd-tool" type="button" data-act="fullscreen" aria-pressed={fullscreen} onClick={toggleFullscreen}><Ic id="full" /><span className="rd-lbl">{fullscreen ? t("rdFullExit") : t("rdFull")}</span></button>}
          {printBtn("rd-tool", t("rdPrintPages"), true)}
        </aside>
        <main className="rd-nook">
          {bookEl(<><div className="rd-jacket rd-l" /><div className="rd-jacket rd-r" /><button className="rd-ribbon" type="button" data-act="bookmark" aria-label={markHere ? t("rdUnmark") : t("rdBookmark")} onClick={toggleMark} /></>)}
          {doc && <button className="rd-open" type="button" data-act="next" onClick={() => step(1)}>{t("rdOpen")}</button>}
        </main>
        {aloud("rd-card rd-fillpanel")}
        <footer className="rd-nav">
          {prevBtn("rd-btn")}{slider}{nextBtn("rd-btn")}{counter}{gotoForm("rd-btn rd-fill")}
        </footer>
      </div>
    );
  }

  return (
    <div className={`rd-wrap rd-${style}`} ref={wrapRef} style={{ ["--turn-ms" as string]: `${sopts.turnMs}ms` } as CSSProperties}>
      <Icons />
      {chrome}
      {tocPanel}
      {printMsg && <p className="rd-toast" role="status">{t(printMsg)} {printMsg === "rdPrintFail" && <button type="button" className={cls.btn} onClick={() => setPrintMsg(null)}>OK</button>}</p>}
      {printOpen && (
        <div className="rd-overlay" onClick={(e) => { if (e.target === e.currentTarget) setPrintOpen(false); }}>
          <div className="rd-dlg" role="dialog" aria-modal="true" aria-labelledby="rd-print-h">
            <h2 id="rd-print-h">{t("rdPrintTitle")}</h2>
            <button type="button" className={`${cls.solid} rd-choice`} data-act="print-spread" autoFocus onClick={printSpread}><Ic id="print" /><span><b>{vis.length === 2 ? t("rdPrintSpread") : t("rdPrintOne")}</b><small>{t("rdPrintSpreadHelp")} {label}</small></span></button>
            <button type="button" className={`${cls.btn} rd-choice`} data-act="print-book" onClick={printBook}><Ic id="print" /><span><b>{t("rdPrintBook")}</b><small>{t("rdPrintBookHelp", { n: N })}</small></span></button>
            <button type="button" className={`${cls.btn} rd-cancel`} data-act="print-cancel" onClick={() => setPrintOpen(false)}>{t("rdCancel")}</button>
          </div>
        </div>
      )}
      {bookFrame && <iframe className="rd-bookframe" title={t("rdPrintBook")} src={bookFrame} onLoad={onBookFrame} aria-hidden="true" tabIndex={-1} />}
      {typeof document !== "undefined" && createPortal(
        <div className="rd-print-area" aria-hidden="true">{doc && vis.map((n) => { const src = doc.ready(n, 1800) ?? doc.ready(n); return src ? <img key={n} src={src} alt={pageName(n)} /> : null; })}</div>,
        document.body,
      )}
    </div>
  );
}

function GotoForm({ btnClass, first, max, label, go, disabled, onGo }: { btnClass: string; first: number; max: number; label: string; go: string; disabled: boolean; onGo: (n: number) => void }) {
  const [val, setVal] = useState(String(first));
  const [bad, setBad] = useState(false);
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setVal(String(first)); }, [first]);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = parseInt(val, 10);
    if (!v || v < 1 || v > max) { setBad(true); setVal(String(first)); setTimeout(() => setBad(false), 1200); return; }
    onGo(v); setVal(String(v));
    (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.blur();
  };
  return (
    <form className="rd-goto" data-r="goto" onSubmit={submit}>
      <label htmlFor="rd-gp">{label}</label>
      <input id="rd-gp" type="number" inputMode="numeric" data-r="gotoInput" min={1} max={Math.max(1, max)} value={val} disabled={disabled} aria-invalid={bad || undefined}
        onChange={(e) => setVal(e.target.value)} onFocus={() => { focused.current = true; }} onBlur={() => { focused.current = false; }} />
      <button className={btnClass} type="submit" disabled={disabled}>{go}</button>
    </form>
  );
}
