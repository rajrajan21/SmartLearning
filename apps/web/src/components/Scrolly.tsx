import { useEffect, useRef, useState } from "react";
import { ui } from "../lib/i18n";
import { useSettings } from "../lib/settings";
import { canObserve, pictureFor, splitSections, useReducedMotion } from "../lib/scrolly";

export interface ScrollyPic { src: string; alt: string }
const ART = ["🌱", "💧", "☀️", "🔎", "⭐", "🧩", "📘", "🎯"];

/**
 * A long explanation as step sections. The picture beside (or above, on phones) follows the section
 * that is in the middle of the screen. No IntersectionObserver = plain paragraphs. Reduced motion = no fades.
 */
export function ScrollySections({ paras, pictures, min }: { paras: string[]; pictures: ScrollyPic[]; min: number }) {
  const s = useSettings();
  const sections = splitSections(paras, min);
  const [active, setActive] = useState(0);
  const [live] = useState(canObserve);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const reduce = useReducedMotion();
  const n = sections?.length ?? 0;
  useEffect(() => {
    if (!live || n === 0) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { const i = Number((e.target as HTMLElement).dataset.i); if (!Number.isNaN(i)) setActive(i); }
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [live, n]);
  if (!sections) return <>{paras.map((p, i) => <p key={i}>{p}</p>)}</>;
  const pic = pictureFor(active, n, pictures.length);
  const cls = `scrolly${live ? " live" : ""}${reduce ? " calm" : ""}`;
  return (
    <div className={cls} data-active={active}>
      {live && (
        <div className="scrolly-pic" role="img" aria-label={pic >= 0 ? pictures[pic]!.alt : `${ui("scrollyStep", s.lang)} ${active + 1}`}>
          {pictures.map((p, i) => <img key={p.src} src={p.src} alt="" loading="lazy" className={i === pic ? "on" : ""} />)}
          {pictures.length === 0 && ART.slice(0, Math.min(n, ART.length)).map((a, i) => <span key={i} className={`art${i === active ? " on" : ""}`} aria-hidden="true">{a}</span>)}
          <span className="scrolly-count" aria-hidden="true">{active + 1} / {n}</span>
        </div>
      )}
      <div className="scrolly-text">
        {sections.map((sec, i) => (
          <section key={i} data-i={i} ref={(el) => { refs.current[i] = el; }} className={`scrolly-step${i === active ? " on" : ""}`} aria-label={`${ui("scrollyStep", s.lang)} ${i + 1}`}>
            {live && <span className="scrolly-n" aria-hidden="true">{i + 1}</span>}
            {sec.map((p, k) => <p key={k}>{p}</p>)}
          </section>
        ))}
      </div>
    </div>
  );
}
