import { useRef, type ReactElement } from "react";
import { BOARD_H, BOARD_W, clockAngles, type BoardObject, type ObjState } from "@studysmart/shared";
import { project, shadeHex, type SolidShape } from "../lib/solid3d";

export type BoardStyle = "chalk" | "white";
const PALETTE: Record<BoardStyle, Record<string, string>> = {
  chalk: { ink: "#F4F1E4", accent: "#FFD166", warm: "#FF8A65", good: "#7BE0AD", soft: "#9DB7A8", water: "#6EC6FF", earth: "#C98F5B", sun: "#FFE066", bg: "#1F4D3A", frame: "#8B5E3C" },
  white: { ink: "#16253F", accent: "#1F4FD1", warm: "#D9531E", good: "#17785A", soft: "#8497B3", water: "#1E88E5", earth: "#8D5A2B", sun: "#E0A800", bg: "#FFFFFF", frame: "#B8C6DC" },
};
export const boardBg = (s: BoardStyle) => PALETTE[s].bg;
const col = (s: BoardStyle, c: string | undefined, fallback = "ink") => (c && c.startsWith("#") ? c : PALETTE[s][c ?? fallback] ?? PALETTE[s][fallback]!);
const hexOf = (s: BoardStyle, c: string | undefined) => { const v = col(s, c, "accent"); return /^#[0-9a-fA-F]{6}$/.test(v) ? v : "#1F4FD1"; };
const FACE_HUES = ["#FFD166", "#7BE0AD", "#6EC6FF", "#FF8A65", "#C9A7FF", "#FF9FD0", "#B8E986", "#FFB74D"];

const pt = (cx: number, cy: number, r: number, deg: number) => { const a = (deg * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const; };
function sectorPath(cx: number, cy: number, r: number, from: number, to: number) {
  let sweep = to - from; if (sweep <= 0) sweep += 360;
  if (sweep >= 359.9) return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  const [x1, y1] = pt(cx, cy, r, from), [x2, y2] = pt(cx, cy, r, from + sweep);
  return `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

interface Props {
  objects: BoardObject[]; scene: Record<string, ObjState>; style: BoardStyle; show3d: boolean;
  /** seconds, drives the slow turning of solids */
  clock: number; yaw: number; onYaw?: (d: number) => void; label: string;
}

export function ClassBoard({ objects, scene, style, show3d, clock, yaw, onYaw, label }: Props) {
  const drag = useRef<number | null>(null);
  const C = (c?: string, f = "ink") => col(style, c, f);
  return (
    <svg className={`class-board ${style}`} viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} role="img" aria-label={label}
      onPointerDown={(e) => { if (!show3d || !onYaw) return; drag.current = e.clientX; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); }}
      onPointerMove={(e) => { if (drag.current === null || !onYaw) return; onYaw((e.clientX - drag.current) * 0.6); drag.current = e.clientX; }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <rect width={BOARD_W} height={BOARD_H} fill={PALETTE[style].bg} />
      {objects.map((o) => {
        const st = scene[o.id];
        if (!st || st.vis <= 0.001) return null;
        const pulse = st.pulse, pc = st.pulseColor ? C(st.pulseColor) : C("accent");
        const stroke = pulse > 0 && !st.pulsePart ? pc : C("stroke" in o ? o.stroke : undefined);
        const sw = ("width" in o && o.width ? o.width : 4) * (1 + pulse * 0.9);
        const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - st.draw } as const;
        const baseFill = "fill" in o && o.fill ? C(o.fill) : null;
        const fillCol = st.fill ? C(st.fill) : baseFill;
        const fillOp = st.fill ? st.fillA : baseFill ? st.draw : 0;
        const common = { fill: fillCol ?? "none", fillOpacity: fillCol ? fillOp * 0.85 : 0, stroke, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
        let body: ReactElement | null = null;
        switch (o.kind) {
          case "circle": body = <circle cx={o.cx} cy={o.cy} r={o.r} {...common} {...dash} />; break;
          case "rect": body = <rect x={o.x} y={o.y} width={o.w} height={o.h} rx={o.rx ?? 0} {...common} {...dash} />; break;
          case "poly": body = <polygon points={o.points.map((p) => p.join(",")).join(" ")} {...common} {...dash} />; break;
          case "path": body = <path d={o.d} {...common} {...dash} />; break;
          case "sector": body = <path d={sectorPath(o.cx, o.cy, o.r, o.from, o.to)} {...common} {...dash} />; break;
          case "line": body = <line x1={o.x1} y1={o.y1} x2={o.x1 + (o.x2 - o.x1) * st.draw} y2={o.y1 + (o.y2 - o.y1) * st.draw} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />; break;
          case "arrow": {
            const x2 = o.x1 + (o.x2 - o.x1) * st.draw, y2 = o.y1 + (o.y2 - o.y1) * st.draw, a = Math.atan2(o.y2 - o.y1, o.x2 - o.x1), h = 16 + sw;
            body = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><line x1={o.x1} y1={o.y1} x2={x2} y2={y2} />
              <polygon points={`${x2},${y2} ${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} ${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}`} fill={stroke} opacity={st.draw > 0.9 ? 1 : 0} /></g>);
            break;
          }
          case "text": {
            const glyphs = Array.from(o.text); const n = Math.ceil(st.chars * glyphs.length);
            if (n <= 0) return null;
            body = <text x={o.x} y={o.y} fontSize={(o.size ?? 34) * (1 + pulse * 0.18)} textAnchor={o.anchor ?? "middle"} fill={pulse > 0 ? pc : C(o.color)} fontFamily="'Mukta Malar', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui, sans-serif" fontWeight={700}>{glyphs.slice(0, n).join("")}</text>;
            break;
          }
          case "clock": {
            const { minute, hour } = clockAngles(st.tot), r = o.r;
            const hp = st.pulsePart === "hour" ? pc : C("accent"), mp = st.pulsePart === "minute" ? pc : C("warm");
            const hand = (deg: number, len: number, w: number, c: string, grow: boolean) => { const [x, y] = pt(o.cx, o.cy, len, deg); return <line x1={o.cx} y1={o.cy} x2={x} y2={y} stroke={c} strokeWidth={grow ? w * (1 + pulse * 0.9) : w} strokeLinecap="round" />; };
            body = (
              <g>
                <circle cx={o.cx} cy={o.cy} r={r} fill={style === "chalk" ? "#245C46" : "#FFF8E1"} stroke={C("ink")} strokeWidth={sw} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - st.draw} />
                {st.draw > 0.95 && Array.from({ length: 12 }, (_, i) => { const [x, y] = pt(o.cx, o.cy, r * 0.8, (i + 1) * 30), [a, b] = pt(o.cx, o.cy, r * 0.93, (i + 1) * 30); return <g key={i}><line x1={a} y1={b} x2={pt(o.cx, o.cy, r * 0.99, (i + 1) * 30)[0]} y2={pt(o.cx, o.cy, r * 0.99, (i + 1) * 30)[1]} stroke={C("ink")} strokeWidth={3} /><text x={x} y={y + r * 0.075} fontSize={r * 0.21} textAnchor="middle" fill={C("ink")} fontWeight={700} fontFamily="'Mukta Malar', system-ui, sans-serif">{i + 1}</text></g>; })}
                {st.draw > 0.95 && <>{hand(hour, r * 0.5, 9, hp, st.pulsePart === "hour")}{hand(minute, r * 0.76, 5, mp, st.pulsePart === "minute")}<circle cx={o.cx} cy={o.cy} r={7} fill={C("ink")} /></>}
              </g>
            );
            break;
          }
          case "solid": {
            const hex = hexOf(style, o.color), spinning = show3d && st.spin !== 0;
            const ang = show3d ? 28 + yaw + (spinning ? clock * st.spin : 0) : 24, pitch = show3d ? 22 : 12;
            const scene3 = project(o.shape as SolidShape, o.x, o.y, o.size, ang, pitch);
            const polyhedron = o.shape === "cube" || o.shape === "cuboid" || o.shape === "pyramid";
            const marks = st.mark;
            body = (
              <g strokeLinejoin="round">
                {scene3.faces.map((f, i) => {
                  const base = marks === "faces" && polyhedron ? FACE_HUES[f.index % FACE_HUES.length]! : hex;
                  return <g key={i}><polygon points={f.points} fill={shadeHex(base, f.shade)} stroke={f.kind === "curved" ? shadeHex(base, f.shade) : shadeHex(hex, 0.45)} strokeWidth={f.kind === "curved" ? 1 : 2} />
                    {marks === "faces" && polyhedron && <text x={f.cx} y={f.cy + 8} fontSize={22} textAnchor="middle" fill="#16253F" fontWeight={800} fontFamily="'Mukta Malar', system-ui, sans-serif">{f.index + 1}</text>}</g>;
                })}
                {marks === "edges" && scene3.edges.map((e, i) => <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={C("accent")} strokeWidth={5} strokeLinecap="round" opacity={e.depth >= -0.15 ? 1 : 0.35} />)}
                {marks === "corners" && scene3.corners.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={7 + pulse * 4} fill={C("warm")} stroke={C("ink")} strokeWidth={2} />)}
              </g>
            );
            break;
          }
        }
        return <g key={o.id} opacity={Math.min(1, st.vis)}>{body}</g>;
      })}
    </svg>
  );
}
