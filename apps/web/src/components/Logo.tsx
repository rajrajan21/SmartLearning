import { useId } from "react";
import { useSettings } from "../lib/settings";

/** SharpStudy mark: an open book with a sharpened pencil rising from it and a spark. Draws in the brand colours. */
export function Logo({ size = 40 }: { size?: number }) {
  const gradient = useId();
  const st = useSettings(); const v = Number(st.get("brand.logoVersion") ?? 0);
  if (v > 0) return <img className="logo" src={`/uploads/logo?v=${v}`} alt={st.get<string>("site.name")} height={size} style={{ height: size, width: "auto", maxWidth: size * 4, objectFit: "contain" }} />;
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="SharpStudy logo">
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--brand)" /><stop offset="1" stopColor="var(--accent)" /></linearGradient></defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={"url(#" + gradient + ")"} />
      <path d="M10 40 C20 35 27 36 32 41 C37 36 44 35 54 40 L54 49 C44 44 37 45 32 50 C27 45 20 44 10 49 Z" fill="#fff" />
      <path d="M32 41 V50" stroke={"url(#" + gradient + ")"} strokeWidth="1.6" />
      <g transform="rotate(32 32 24)"><rect x="29" y="8" width="6" height="22" rx="1.2" fill="#FFD54F" /><path d="M29 30 H35 L32 37 Z" fill="#FFE9C7" /><path d="M31 34.6 H33 L32 37 Z" fill="#37474F" /><rect x="29" y="8" width="6" height="4" rx="1.2" fill="#F48FB1" /></g>
      <path d="M50 10 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8 z" fill="#fff" />
    </svg>
  );
}
