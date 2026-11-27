import { useId, useState } from "react";
import type { GkLesson } from "@studysmart/shared";
import "./gk-video.css";

export function GkVideo({ video, lang, onOpen }: {
  video: NonNullable<GkLesson["video"]>;
  lang: string;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const heading = useId();
  const tamil = lang === "ta";
  return (
    <section className="gk-video noprint" aria-labelledby={heading}>
      <h2 id={heading}>{tamil ? "வீடியோ மூலம் கற்றுக்கொள்" : "Watch and learn"}</h2>
      <p className="gk-video-credit"><strong>{video.title}</strong> · {video.publisher}</p>
      <p>{video.prompt}</p>
      <button
        type="button"
        className={open ? "btn ghost sm" : "btn sm"}
        aria-expanded={open}
        onClick={() => {
          if (!open) onOpen();
          setOpen(!open);
        }}
      >
        {open ? (tamil ? "வீடியோவை மூடு" : "Close video") : (tamil ? "வீடியோவைப் பார்" : "Watch video")}
      </button>
      {open && (
        <iframe
          className="gk-video-player"
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&playsinline=1&rel=0`}
          title={video.title}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </section>
  );
}
