import { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../lib/settings";
import type { Lang } from "../lib/i18n";

interface Chapter { t: number; title: string }
interface Have { video: boolean; poster: boolean; vtt: boolean }
const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const SPEEDS = [0.75, 1, 1.25, 1.5];
const W = {
  en: { play: "Play the tour video", lang: "Video language", speed: "Speed", cc: "Captions", chapters: "Chapters", fail: "The video could not be played. Please check your connection and try again.", noaudio: "This Tamil video has Tamil captions and music; a Tamil voice is coming.", en: "English", ta: "தமிழ்" },
  ta: { play: "பயண வீடியோவை இயக்கு", lang: "வீடியோ மொழி", speed: "வேகம்", cc: "வசனங்கள்", chapters: "பகுதிகள்", fail: "வீடியோவை இயக்க முடியவில்லை. இணைப்பைச் சரிபார்த்து மீண்டும் முயலுங்கள்.", noaudio: "இந்தத் தமிழ் வீடியோவில் தமிழ் வசனங்களும் இசையும் உண்டு; தமிழ்க் குரல் விரைவில்.", en: "English", ta: "தமிழ்" },
};

/** Parses "0:00=Welcome;0:20=Lessons" into chapters. */
export function parseChapters(txt: string): Chapter[] {
  return txt.split(";").map((p) => p.trim()).filter(Boolean).flatMap((p) => {
    const m = /^(\d+):(\d{1,2})\s*=\s*(.+)$/.exec(p);
    return m ? [{ t: Number(m[1]) * 60 + Number(m[2]), title: m[3]!.trim() }] : [];
  });
}

/** The "How it works" tour video with language buttons, captions, speed, chapters and a fallback. Everything is driven by the tour.* settings. */
export function TourPlayer({ compact = false }: { compact?: boolean }) {
  const s = useSettings();
  const ui: Lang = s.lang;
  const t = W[ui];
  const pref = s.get<string>("tour.language.default");
  const [lang, setLang] = useState<"en" | "ta">(pref === "en" || pref === "ta" ? pref : ui);
  const ver = Number(s.get("tour.version") ?? 1) || 1;
  const wantUp = s.get<string>(`tour.source.${lang}`) === "uploaded";
  const [have, setHave] = useState<Record<string, Have> | null>(null);
  const [failed, setFailed] = useState(false);
  const [chap, setChap] = useState<{ chapters: Chapter[]; voiced: boolean } | null>(null);
  const [speed, setSpeed] = useState(Number(s.get("tour.speed.default") ?? 1) || 1);
  const [cc, setCc] = useState(s.get("tour.captions.default") === true);
  const [cur, setCur] = useState(0);
  const [playedSource, setPlayedSource] = useState<string>();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => { if (!wantUp || have) return; fetch("/api/v1/tour/status").then((r) => (r.ok ? r.json() : null)).then((d) => setHave(d ?? {})).catch(() => setHave({})); }, [wantUp, have]);
  const up = wantUp && !failed && !!have?.[lang]?.video;
  const base = up ? "/api/v1/tour/files/custom" : "/tour-video/tour";
  const src = up ? `/api/v1/tour/files/custom-${lang}.mp4?v=${ver}` : `/tour-video/tour-${lang}.mp4?v=${ver}`;
  const poster = up && have?.[lang]?.poster ? `/api/v1/tour/files/custom-poster-${lang}.jpg?v=${ver}` : `/tour-video/poster-${lang}.jpg?v=${ver}`;
  const vtt = up ? (have?.[lang]?.vtt ? `/api/v1/tour/files/custom-${lang}.vtt?v=${ver}` : "") : `/tour-video/tour-${lang}.vtt?v=${ver}`;
  void base;
  useEffect(() => { setFailed(false); }, [lang, wantUp]);
  useEffect(() => { setChap(null); if (up) return; fetch(`/tour-video/tour-${lang}.chapters.json?v=${ver}`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setChap({ chapters: d.chapters.map((c: { t: number; title: Record<string, string> | string }) => ({ t: c.t, title: typeof c.title === "string" ? c.title : c.title[ui] ?? c.title.en })), voiced: d.voiced === true })).catch(() => undefined); }, [lang, ui, up, ver]);

  const chapters = useMemo(() => {
    if (s.get("tour.chapters.show") !== true) return [];
    if (up) return parseChapters(s.get<string>(`tour.chapters.custom.${lang}`) ?? "");
    const hide = new Set(String(s.get("tour.chapters.hidden") ?? "").split(",").map((x) => Number(x.trim())).filter(Boolean));
    return (chap?.chapters ?? []).filter((_, i) => !hide.has(i + 1));
  }, [s, up, lang, chap]);
  const burned = !up && lang === "ta" && chap?.voiced === false; // captions are part of the picture
  const showCc = s.get("tour.captions.show") === true && !!vtt && !burned;

  useEffect(() => { const v = ref.current; if (v) v.playbackRate = speed; }, [speed, src]);
  useEffect(() => { const v = ref.current; if (!v) return; for (const tr of Array.from(v.textTracks)) tr.mode = cc ? "showing" : "hidden"; });
  const autoplay = s.get("tour.autoplay") === true;
  const framed = s.get("tour.player.cover") === true;
  const showPlay = framed && !autoplay && playedSource !== src;
  const activeChapter = chapters.reduce((a, c, i) => (cur >= c.t ? i : a), -1);
  const jump = (tm: number) => { const v = ref.current; if (!v) return; v.currentTime = tm; void v.play().catch(() => undefined); };

  return (
    <div className={`tour-player${compact ? " compact" : ""}`} data-testid="tour-player">
      {s.get("tour.language.picker") === true && (
        <div className="tour-langs" role="group" aria-label={t.lang}>
          {(["en", "ta"] as const).map((l) => <button key={l} type="button" className={`tour-chip${lang === l ? " on" : ""}`} aria-pressed={lang === l} onClick={() => setLang(l)}>{t[l]}</button>)}
        </div>
      )}
      <div className={framed ? "tour-stage" : undefined}>
      <video
        key={src}
        ref={ref}
        className="tour-video"
        controls
        playsInline
        preload={s.get<string>("tour.preload")}
        poster={s.get("tour.poster.show") === true ? poster : undefined}
        autoPlay={autoplay}
        muted={autoplay || s.get("tour.muted") === true}
        loop={s.get("tour.loop") === true}
        onError={() => { if (up) setFailed(true); }}
        onLoadedMetadata={(e) => { e.currentTarget.playbackRate = speed; }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onPlay={() => setPlayedSource(src)}
        aria-label={t.play}
      >
        {showCc && <track kind="captions" src={vtt} srcLang={lang} label={t[lang]} default={cc} />}
        <p>{t.fail}</p>
      </video>
      {showPlay && (
        <button
          type="button"
          className="tour-stage-play"
          onClick={() => {
            const video = ref.current;
            if (!video) return;
            void video.play().then(() => video.focus()).catch(() => undefined);
          }}
        >
          <span aria-hidden="true" className="tour-play-glyph">▶</span>
          <span>{t.play}</span>
        </button>
      )}
      </div>
      <div className="tour-bar">
        {showCc && <button type="button" className={`tour-chip${cc ? " on" : ""}`} aria-pressed={cc} onClick={() => setCc(!cc)}>CC {t.cc}</button>}
        {s.get("tour.speed.show") === true && (
          <span className="tour-speed" role="group" aria-label={t.speed}>
            {SPEEDS.map((x) => <button key={x} type="button" className={`tour-chip${speed === x ? " on" : ""}`} aria-pressed={speed === x} onClick={() => setSpeed(x)}>{x}x</button>)}
          </span>
        )}
      </div>
      {burned && <p className="small tour-note">{t.noaudio}</p>}
      {chapters.length > 0 && !compact && (
        <ol className="tour-chapters" aria-label={t.chapters}>
          {chapters.map((c, i) => <li key={`${c.t}-${i}`}><button type="button" className={i === activeChapter ? "on" : ""} onClick={() => jump(c.t)}><span className="small">{fmt(c.t)}</span> {c.title}</button></li>)}
        </ol>
      )}
    </div>
  );
}
