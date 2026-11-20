import { useEffect, useRef, useState, type ReactNode } from "react";
import { gt } from "../../lib/gk";
import type { Lang } from "../../lib/i18n";

/**
 * GK pictures and animations, drawn in the browser (no video files). Every picture is a pure function of time `t` (seconds),
 * so the same code gives the still picture (t fixed) and the animation (t running).
 */
const W = 320, H = 200;
const PI = Math.PI;
const rad = (d: number) => (d * PI) / 180;
const tri = (x: number) => { const m = ((x % 2) + 2) % 2; return m < 1 ? m : 2 - m; }; // triangle wave 0..1..0
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const frac = (x: number) => x - Math.floor(x);
const T = (p: { x: number; y: number; s: string; size?: number; anchor?: "start" | "middle" | "end"; fill?: string; bold?: boolean }) => (
  <text x={p.x} y={p.y} fontSize={p.size ?? 10} textAnchor={p.anchor ?? "middle"} fill={p.fill ?? "currentColor"} fontWeight={p.bold ? 700 : 400}>{p.s}</text>
);
const Arrow = ({ x1, y1, x2, y2, c = "currentColor", w = 2 }: { x1: number; y1: number; x2: number; y2: number; c?: string; w?: number }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 6;
  return <g stroke={c} strokeWidth={w} fill={c}><line x1={x1} y1={y1} x2={x2 - Math.cos(a) * 3} y2={y2 - Math.sin(a) * 3} /><path d={`M${x2},${y2} L${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}Z`} stroke="none" /></g>;
};
/** dots travelling along a line */
const Flow = ({ x1, y1, x2, y2, t, n = 4, c = "#fff", r = 2.4, speed = 0.4 }: { x1: number; y1: number; x2: number; y2: number; t: number; n?: number; c?: string; r?: number; speed?: number }) => (
  <g fill={c}>{Array.from({ length: n }, (_, i) => { const k = frac(t * speed + i / n); return <circle key={i} cx={lerp(x1, x2, k)} cy={lerp(y1, y2, k)} r={r} />; })}</g>
);

type Draw = (t: number) => ReactNode;
interface Def { draw: Draw; still: number; en: string; alt: string }

/* ---------- Space ---------- */
const PLAN = [
  { r: 20, d: 3, c: "#b0a69a", s: 2 }, { r: 29, d: 5, c: "#e8c48a", s: 3 }, { r: 39, d: 7, c: "#3b82f6", s: 3.2 }, { r: 49, d: 10, c: "#d9663d", s: 2.6 },
  { r: 62, d: 16, c: "#d8b27a", s: 6.5 }, { r: 74, d: 22, c: "#e6d29a", s: 5.5 }, { r: 85, d: 30, c: "#8fd3e0", s: 4 }, { r: 95, d: 38, c: "#4a68d8", s: 4 },
];
const solar: Draw = (t) => (
  <g>
    <rect width={W} height={H} fill="#0b1230" />
    {PLAN.map((p, i) => <ellipse key={i} cx={160} cy={100} rx={p.r * 1.55} ry={p.r} fill="none" stroke="#fff" strokeOpacity={0.18} />)}
    <circle cx={160} cy={100} r={11} fill="#ffc83d" />
    {PLAN.map((p, i) => { const a = (t / p.d) * 2 * PI + i * 1.3; return <circle key={i} cx={160 + p.r * 1.55 * Math.cos(a)} cy={100 + p.r * Math.sin(a)} r={p.s} fill={p.c} />; })}
    {T({ x: 160, y: 196, s: "Mercury · Venus · Earth · Mars · Jupiter · Saturn · Uranus · Neptune", size: 7.5, fill: "#cfd8ff" })}
  </g>
);
function moonFace(cx: number, cy: number, r: number, p: number): ReactNode {
  const k = Math.cos(2 * PI * p);
  const rx = Math.abs(k) * r;
  const lit = `M${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r} A${rx},${r} 0 0 ${k > 0 ? 0 : 1} ${cx},${cy - r}Z`;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#2a3150" />
      <path d={lit} fill="#f4efd8" transform={p >= 0.5 ? `translate(${2 * cx},0) scale(-1,1)` : undefined} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#9aa4c8" strokeWidth={0.8} />
    </g>
  );
}
const PHASES = ["New Moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full Moon", "Waning gibbous", "Last quarter", "Waning crescent"];
const moonPhases: Draw = (t) => {
  const p = frac(t / 14);
  const ang = 2 * PI * p;
  const mx = 100 - 52 * Math.cos(ang), my = 100 - 29 * Math.sin(ang);
  const name = PHASES[Math.round(p * 8) % 8]!;
  return (
    <g>
      <rect width={W} height={H} fill="#0b1230" />
      {[0, 1, 2, 3, 4].map((i) => <Arrow key={i} x1={6} y1={50 + i * 25} x2={34} y2={50 + i * 25} c="#ffc83d" w={1.6} />)}
      {T({ x: 22, y: 38, s: "Sunlight", size: 8, fill: "#ffc83d" })}
      <ellipse cx={100} cy={100} rx={52} ry={29} fill="none" stroke="#fff" strokeOpacity={0.25} strokeDasharray="3 3" />
      <circle cx={100} cy={100} r={14} fill="#3b82f6" />
      <circle cx={mx} cy={my} r={6} fill="#f4efd8" />
      {T({ x: 100, y: 104, s: "Earth", size: 6.5, fill: "#fff" })}
      {moonFace(240, 90, 34, p)}
      {T({ x: 240, y: 142, s: name, size: 11, fill: "#f4efd8", bold: true })}
      {T({ x: 240, y: 156, s: "as seen from Earth", size: 8, fill: "#cfd8ff" })}
      {T({ x: 160, y: 192, s: "Half the Moon is always lit. We see more or less of the lit half.", size: 8, fill: "#cfd8ff" })}
    </g>
  );
};
const dayNight: Draw = (t) => {
  const th = (t * 0.6) % (2 * PI);
  const px = 190 + 52 * Math.cos(th), py = 100 + 52 * Math.sin(th);
  const day = Math.cos(th) < 0;
  return (
    <g>
      <rect width={W} height={H} fill="#0b1230" />
      <circle cx={20} cy={100} r={26} fill="#ffc83d" />
      {[60, 85, 100, 115, 140].map((y) => <Arrow key={y} x1={50} y1={y} x2={118} y2={y} c="#ffc83d" w={1.4} />)}
      <circle cx={190} cy={100} r={56} fill="#3b82f6" />
      <path d="M190,44 A56,56 0 0 1 190,156Z" fill="#0b1230" opacity={0.65} />
      <circle cx={px} cy={py} r={5} fill={day ? "#fff" : "#ffd966"} stroke="#16253f" />
      {T({ x: 190, y: 28, s: "Earth, seen from above the North Pole", size: 8, fill: "#cfd8ff" })}
      {T({ x: 160, y: 104, s: "DAY", size: 11, fill: "#fff", bold: true })}
      {T({ x: 222, y: 104, s: "NIGHT", size: 11, fill: "#cfd8ff", bold: true })}
      {T({ x: 274, y: 76, s: "Earth spins", size: 8, fill: "#cfd8ff", anchor: "start" })}
      {T({ x: 274, y: 88, s: "once in 24 hours", size: 8, fill: "#cfd8ff", anchor: "start" })}
      {T({ x: 274, y: 112, s: day ? "The spot is in sunlight" : "The spot is in shadow", size: 8, fill: day ? "#fff" : "#ffd966", anchor: "start" })}
    </g>
  );
};
const SEASONS = ["Winter", "Spring", "Summer", "Autumn"];
const seasons: Draw = (t) => {
  const a = (t * 0.45) % (2 * PI);
  const R = 105, ry = 50, cx = 160, cy = 100;
  const ex = cx + R * Math.cos(a), ey = cy - ry * Math.sin(a);
  const q = Math.round(((a / (2 * PI)) * 4)) % 4;
  const tilt = rad(23.5);
  return (
    <g>
      <rect width={W} height={H} fill="#0b1230" />
      <ellipse cx={cx} cy={cy} rx={R} ry={ry} fill="none" stroke="#fff" strokeOpacity={0.25} />
      <circle cx={cx} cy={cy} r={16} fill="#ffc83d" />
      {[["Dec", cx + R + 6, cy + 3, "start"], ["Mar", cx, cy - ry - 6, "middle"], ["Jun", cx - R - 6, cy + 3, "end"], ["Sep", cx, cy + ry + 14, "middle"]].map(([s, x, y, an]) => <g key={String(s)}>{T({ x: Number(x), y: Number(y), s: String(s), size: 8, fill: "#9aa4c8", anchor: an as "start" })}</g>)}
      <g transform={`translate(${ex},${ey})`}>
        <line x1={-16 * Math.sin(tilt)} y1={16 * Math.cos(tilt)} x2={16 * Math.sin(tilt)} y2={-16 * Math.cos(tilt)} stroke="#fff" strokeWidth={1.4} />
        <circle r={10} fill="#3b82f6" />
      </g>
      {T({ x: 160, y: 20, s: `Northern hemisphere: ${SEASONS[q]}`, size: 11, fill: "#fff", bold: true })}
      {T({ x: 160, y: 190, s: "The tilt of Earth's axis, not distance from the Sun, makes the seasons.", size: 8, fill: "#cfd8ff" })}
    </g>
  );
};
const eclipses: Draw = (t) => {
  const o = Math.sin(t * 0.9) * 8;
  return (
    <g>
      <rect width={W} height={H} fill="#0b1230" />
      {T({ x: 160, y: 14, s: "Solar eclipse: the Moon is between the Sun and Earth", size: 8.5, fill: "#fff" })}
      <circle cx={30} cy={50} r={20} fill="#ffc83d" />
      <polygon points={`${150 + o},47 ${270},38 ${270},62 ${150 + o},53`} fill="#000" opacity={0.35} />
      <circle cx={150 + o} cy={50} r={6} fill="#aab" />
      <circle cx={275} cy={50} r={12} fill="#3b82f6" />
      {T({ x: 160, y: 108, s: "Lunar eclipse: Earth is between the Sun and the Moon", size: 8.5, fill: "#fff" })}
      <circle cx={30} cy={146} r={20} fill="#ffc83d" />
      <circle cx={150} cy={146} r={12} fill="#3b82f6" />
      <polygon points={`150,134 285,134 285,158 150,158`} fill="#000" opacity={0.35} />
      <circle cx={240 + o} cy={146} r={6} fill={Math.abs(o) < 4 ? "#8a3b2a" : "#aab"} />
      {T({ x: 160, y: 192, s: "Not drawn to scale. Eclipses only happen when all three line up exactly.", size: 8, fill: "#cfd8ff" })}
    </g>
  );
};
const tides: Draw = (t) => {
  const phi = t * 0.35;
  const mx = 160 + 100 * Math.cos(phi), my = 100 - 74 * Math.sin(phi);
  const spin = t * 1.2;
  return (
    <g>
      <rect width={W} height={H} fill="#0b1230" />
      <g transform={`rotate(${(-phi * 180) / PI} 160 100)`}>
        <ellipse cx={160} cy={100} rx={62} ry={50} fill="#2f6fd6" opacity={0.75} />
      </g>
      <circle cx={160} cy={100} r={42} fill="#3a9a5b" />
      <g transform={`rotate(${(spin * 180) / PI} 160 100)`}><circle cx={160 + 32} cy={100} r={4} fill="#fff" /></g>
      <circle cx={mx} cy={my} r={10} fill="#f4efd8" />
      {T({ x: 160, y: 18, s: "The Moon's pull lifts the sea on the near side and the far side", size: 8.5, fill: "#fff" })}
      {T({ x: 160, y: 188, s: "Two high tides and two low tides each day as Earth spins. Not to scale.", size: 8, fill: "#cfd8ff" })}
    </g>
  );
};

/* ---------- Earth, weather, nature ---------- */
const waterCycle: Draw = (t) => (
  <g>
    <rect width={W} height={H} fill="#cfe8ff" />
    <circle cx={34} cy={30} r={16} fill="#ffc83d" />
    <polygon points="170,150 225,60 280,150" fill="#8a7f72" /><polygon points="214,72 225,60 236,72 230,80 220,78" fill="#fff" />
    <rect x={0} y={150} width={W} height={50} fill="#3b82f6" /><rect x={150} y={150} width={170} height={8} fill="#6ea85a" />
    <ellipse cx={95} cy={52} rx={34} ry={14} fill="#fff" /><ellipse cx={116} cy={44} rx={22} ry={12} fill="#fff" /><ellipse cx={75} cy={48} rx={20} ry={10} fill="#fff" />
    {[0, 1, 2, 3, 4, 5].map((i) => { const k = frac(t * 0.25 + i / 6); return <circle key={`e${i}`} cx={40 + i * 9 + Math.sin(t + i) * 2} cy={lerp(148, 70, k)} r={2.4} fill="#8fb8ee" opacity={Math.sin(PI * k)} />; })}
    {[0, 1, 2, 3, 4].map((i) => { const k = frac(t * 0.5 + i / 5); return <line key={`r${i}`} x1={78 + i * 9} y1={lerp(66, 146, k)} x2={78 + i * 9 - 1.5} y2={lerp(66, 146, k) + 6} stroke="#2563c9" strokeWidth={1.8} opacity={k > 0.02 ? 1 : 0} />; })}
    {Array.from({ length: 5 }, (_, i) => { const k = frac(t * 0.2 + i / 5); return <circle key={`s${i}`} cx={lerp(228, 170, k) - Math.abs(Math.sin(k * 6)) * 0} cy={lerp(100, 150, k)} r={2.2} fill="#2563c9" />; })}
    {T({ x: 36, y: 118, s: "1 Evaporation", size: 8, anchor: "start", bold: true })}
    {T({ x: 70, y: 22, s: "2 Condensation", size: 8, anchor: "start", bold: true })}
    {T({ x: 62, y: 96, s: "3 Rain / snow", size: 8, anchor: "start", bold: true })}
    {T({ x: 200, y: 176, s: "4 Collection: rivers carry water back", size: 8, fill: "#fff", bold: true })}
  </g>
);
const planeLift: Draw = (t) => {
  const wing = "M60,110 C85,88 150,86 235,106 C170,114 100,118 60,110Z";
  const dash = -t * 60;
  return (
    <g>
      <rect width={W} height={H} fill="#e6f1ff" />
      <path d="M20,68 C90,58 160,52 300,70" fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="10 8" strokeDashoffset={dash * 1.4} />
      <path d="M20,150 C100,146 170,148 300,140" fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 10" strokeDashoffset={dash} />
      <path d={wing} fill="#8794ac" stroke="#16253f" strokeWidth={1.5} transform="rotate(-6 150 105)" />
      <Arrow x1={150} y1={86} x2={150} y2={30} c="#17785a" w={3} />{T({ x: 168, y: 36, s: "Lift", size: 11, fill: "#17785a", bold: true })}
      <Arrow x1={150} y1={118} x2={150} y2={176} c="#d9444f" w={3} />{T({ x: 178, y: 176, s: "Weight", size: 11, fill: "#d9444f", bold: true })}
      <Arrow x1={20} y1={104} x2={58} y2={104} c="#9a5b00" w={3} />{T({ x: 38, y: 96, s: "Thrust", size: 9, fill: "#9a5b00", bold: true })}
      <Arrow x1={300} y1={104} x2={262} y2={104} c="#475569" w={3} />{T({ x: 285, y: 96, s: "Drag", size: 9, fill: "#475569", bold: true })}
      {T({ x: 160, y: 14, s: "Air moves faster over the curved top: lower pressure above, higher below", size: 8.5 })}
    </g>
  );
};

/* ---------- Body ---------- */
const HEART = "M0,12 C-30,-12 -16,-30 0,-14 C16,-30 30,-12 0,12Z";
const heartbeat: Draw = (t) => {
  const beat = frac(t / 1.1);
  const s = 1 + 0.12 * Math.exp(-Math.pow((beat - 0.12) / 0.07, 2)) + 0.06 * Math.exp(-Math.pow((beat - 0.38) / 0.09, 2));
  const ecg = (x: number) => { const u = frac((x + t * 60) / 100); const g = (c: number, w: number, h: number) => h * Math.exp(-Math.pow((u - c) / w, 2)); return 168 - g(0.2, 0.012, 10) + g(0.28, 0.01, 6) - g(0.31, 0.012, 40) + g(0.34, 0.012, 14) - g(0.55, 0.04, 12); };
  return (
    <g>
      <rect width={W} height={H} fill="#fff4f4" />
      <g transform={`translate(160,64) scale(${2 * s})`}><path d={HEART} fill="#d9444f" /></g>
      <Flow x1={120} y1={30} x2={60} y2={30} t={t} c="#3b82f6" n={4} />
      <Flow x1={60} y1={30} x2={60} y2={80} t={t} c="#3b82f6" n={3} />
      {T({ x: 50, y: 98, s: "to the lungs: picks up oxygen", size: 7.5, anchor: "start", fill: "#2563c9" })}
      <Flow x1={200} y1={30} x2={262} y2={30} t={t} c="#d9444f" n={4} />
      <Flow x1={262} y1={30} x2={262} y2={80} t={t} c="#d9444f" n={3} />
      {T({ x: 270, y: 98, s: "to the body", size: 7.5, anchor: "end", fill: "#b3232f" })}
      <polyline points={Array.from({ length: 160 }, (_, i) => `${i * 2},${ecg(i * 2)}`).join(" ")} fill="none" stroke="#d9444f" strokeWidth={1.6} />
      {T({ x: 160, y: 192, s: "The heart is a muscle pump. Each beat pushes blood round your body.", size: 8 })}
    </g>
  );
};
const photosynthesis: Draw = (t) => (
  <g>
    <rect width={W} height={H} fill="#e8f6ff" />
    <circle cx={40} cy={34} r={18} fill="#ffc83d" />{[0, 1, 2].map((i) => <Flow key={i} x1={58 + i * 4} y1={44 + i * 12} x2={118} y2={78 + i * 6} t={t + i} c="#ffc83d" n={3} />)}
    <rect x={0} y={150} width={W} height={50} fill="#8a6a45" />
    <path d="M180,150 L180,95" stroke="#4a8a3a" strokeWidth={5} />
    <path d="M180,110 C130,70 120,110 178,114Z" fill="#4fa83d" /><path d="M180,100 C230,60 245,100 182,106Z" fill="#4fa83d" />
    <path d="M178,150 q-24,18 -44,10 M182,150 q24,18 46,12 M180,150 q0,22 0,30" fill="none" stroke="#6b4a2a" strokeWidth={2.4} />
    <Flow x1={130} y1={176} x2={178} y2={140} t={t} c="#3b82f6" n={4} />{T({ x: 40, y: 182, s: "Water from soil", size: 8, anchor: "start", fill: "#fff" })}
    <Flow x1={285} y1={60} x2={215} y2={92} t={t} c="#555" n={4} />{T({ x: 292, y: 52, s: "Carbon dioxide in", size: 8, anchor: "end" })}
    <Flow x1={225} y1={80} x2={290} y2={118} t={t + 0.5} c="#17b0d8" n={4} />{T({ x: 292, y: 134, s: "Oxygen out", size: 8, anchor: "end", fill: "#0e7490" })}
    {T({ x: 160, y: 14, s: "Light + water + carbon dioxide → sugar (food) + oxygen", size: 9, bold: true })}
  </g>
);
const foodChain: Draw = (t) => {
  const items = ["☀️", "🌱", "🦗", "🐸", "🐍", "🦅"], xs = [30, 85, 140, 195, 250, 300];
  const k = (t * 0.6) % 5;
  return (
    <g>
      <rect width={W} height={H} fill="#f1f9ee" />
      {items.map((e, i) => <text key={i} x={xs[i]} y={96} fontSize={i === 0 ? 24 : 26} textAnchor="middle">{e}</text>)}
      {xs.slice(0, 5).map((x, i) => <Arrow key={i} x1={x + 16} y1={88} x2={xs[i + 1]! - 16} y2={88} c={Math.floor(k) === i ? "#d9444f" : "#475569"} w={Math.floor(k) === i ? 3 : 1.6} />)}
      {T({ x: 85, y: 124, s: "producer", size: 8 })}{T({ x: 140, y: 124, s: "eats plants", size: 8 })}{T({ x: 195, y: 124, s: "eats insects", size: 8 })}{T({ x: 250, y: 124, s: "eats frogs", size: 8 })}{T({ x: 300, y: 124, s: "top", size: 8 })}
      {T({ x: 160, y: 22, s: "Arrows show energy moving from one living thing to the next", size: 9, bold: true })}
      {T({ x: 160, y: 168, s: "Plants make food from sunlight; animals get energy by eating.", size: 8.5 })}
    </g>
  );
};
const volcano: Draw = (t) => (
  <g>
    <rect width={W} height={H} fill="#cfe8ff" />
    <rect x={0} y={150} width={W} height={50} fill="#6b4a2a" />
    <polygon points="70,150 140,60 180,60 250,150" fill="#7a6a5a" />
    <polygon points="140,60 160,70 180,60" fill="#d9531e" />
    <ellipse cx={160} cy={178} rx={44} ry={16} fill="#d9531e" /><rect x={152} y={72} width={16} height={92} fill="#e0642e" />
    {T({ x: 160, y: 182, s: "Magma chamber", size: 8, fill: "#fff" })}
    {Array.from({ length: 12 }, (_, i) => { const k = frac(t * 0.55 + i / 12); const vx = (i % 2 ? 1 : -1) * (14 + (i % 5) * 9); return <circle key={i} cx={160 + vx * k} cy={60 - 70 * k + 80 * k * k} r={2.6} fill={i % 3 ? "#ff7a2e" : "#ffd24d"} opacity={1 - k * 0.3} />; })}
    {[0, 1, 2, 3].map((i) => { const k = frac(t * 0.15 + i / 4); return <circle key={i} cx={160 + k * 40 + i * 6} cy={50 - k * 38} r={8 + k * 14} fill="#6b7280" opacity={0.5 * (1 - k)} />; })}
    {T({ x: 160, y: 14, s: "Hot melted rock rises through a vent and erupts", size: 9, bold: true })}
    {T({ x: 262, y: 136, s: "Lava", size: 8, anchor: "start" })}{T({ x: 62, y: 144, s: "Vent", size: 8, anchor: "end", fill: "#fff" })}
  </g>
);
const plateTectonics: Draw = (t) => {
  const m = Math.sin(t * 0.8) * 4;
  return (
    <g>
      <rect width={W} height={H} fill="#cfe8ff" />
      <rect x={0} y={96} width={W} height={104} fill="#e0702f" />
      <path d={`M0,92 L${150 + m},92 L${210 + m},150 L${200 + m},158 L${142 + m},104 L0,104Z`} fill="#3a6fb0" />
      <path d={`M${320},80 L${176 - m},80 L${176 - m},96 L${320},96Z`} fill="#8a7f72" /><rect x={176 - m} y={96} width={144} height={14} fill="#8a7f72" />
      <polygon points={`${236 - m},80 ${256 - m},46 ${276 - m},80`} fill="#7a6a5a" />
      <Arrow x1={30} y1={80} x2={80} y2={80} c="#16253f" /><Arrow x1={300} y1={70} x2={250} y2={70} c="#16253f" />
      {T({ x: 70, y: 78, s: "Ocean plate", size: 8, anchor: "end" })}{T({ x: 150, y: 76, s: "sinks under", size: 8 })}
      {T({ x: 270, y: 36, s: "Mountains", size: 8 })}{T({ x: 160, y: 188, s: "Hot, slowly flowing mantle", size: 9, fill: "#fff", bold: true })}
      {T({ x: 160, y: 14, s: "Plates move a few centimetres a year (shown far faster)", size: 9, bold: true })}
    </g>
  );
};

/* ---------- Physics, chemistry ---------- */
const statesOfMatter: Draw = (t) => {
  const box = (x0: number, kind: 0 | 1 | 2) => {
    const pts: ReactNode[] = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const k = i * 4 + j; const bx = x0 + 14 + i * 20, by = 56 + j * 20;
      let x = bx, y = by;
      if (kind === 0) { x += Math.sin(t * 9 + k) * 1.2; y += Math.cos(t * 8 + k * 2) * 1.2; }
      else if (kind === 1) { x += Math.sin(t * 2.2 + k * 1.7) * 6; y = 70 + j * 18 + Math.cos(t * 2 + k) * 5; x = x0 + 14 + (i * 20) + Math.sin(t * 2 + k) * 6; }
      else { x = x0 + 8 + tri(t * (0.35 + (k % 5) * 0.09) + k * 0.31) * 84; y = 46 + tri(t * (0.3 + (k % 7) * 0.07) + k * 0.17) * 96; }
      pts.push(<circle key={k} cx={x} cy={y} r={5} fill={["#3b82f6", "#17b0d8", "#9ad0ff"][kind]} />);
    }
    return <g>{pts}</g>;
  };
  return (
    <g>
      <rect width={W} height={H} fill="#f4f8fc" />
      {[0, 1, 2].map((i) => <rect key={i} x={6 + i * 106} y={40} width={102} height={112} fill="none" stroke="#475569" strokeWidth={1.5} rx={4} />)}
      {box(6, 0)}{box(112, 1)}{box(218, 2)}
      {T({ x: 57, y: 168, s: "Solid", size: 11, bold: true })}{T({ x: 163, y: 168, s: "Liquid", size: 11, bold: true })}{T({ x: 269, y: 168, s: "Gas", size: 11, bold: true })}
      {T({ x: 57, y: 180, s: "stays in place, wiggles", size: 7.5 })}{T({ x: 163, y: 180, s: "slides past each other", size: 7.5 })}{T({ x: 269, y: 180, s: "flies about freely", size: 7.5 })}
      {T({ x: 160, y: 20, s: "Heat gives particles energy: solid → liquid → gas", size: 9.5, bold: true })}
    </g>
  );
};
const pendulum: Draw = (t) => {
  const th = rad(35) * Math.cos((2 * PI * t) / 2);
  const L = 120, px = 160, py = 24;
  const bx = px + L * Math.sin(th), by = py + L * Math.cos(th);
  return (
    <g>
      <rect width={W} height={H} fill="#f4f8fc" />
      <path d={`M${px + L * Math.sin(rad(-35))},${py + L * Math.cos(rad(-35))} A${L},${L} 0 0 0 ${px + L * Math.sin(rad(35))},${py + L * Math.cos(rad(35))}`} fill="none" stroke="#9aa4c8" strokeDasharray="3 4" />
      <line x1={px} y1={py} x2={bx} y2={by} stroke="#16253f" strokeWidth={1.5} /><rect x={px - 30} y={py - 8} width={60} height={8} fill="#475569" />
      <circle cx={bx} cy={by} r={12} fill="#d9444f" />
      {T({ x: 160, y: 186, s: "One swing takes the same time whether the bob is heavy or light", size: 8.5 })}
      {T({ x: 40, y: 180, s: "Longer string = slower swing", size: 8, anchor: "start" })}
    </g>
  );
};
const soundWaves: Draw = (t) => (
  <g>
    <rect width={W} height={H} fill="#f4f8fc" />
    <rect x={14} y={70} width={14} height={36} fill="#475569" /><polygon points="28,70 52,50 52,126 28,106" fill="#94a3b8" />
    {Array.from({ length: 46 }, (_, i) => { const x = 66 + i * 5.2; const d = 5 * Math.sin(i * 0.5 - t * 6); return <line key={i} x1={x + d} y1={80} x2={x + d} y2={96} stroke="#2563c9" strokeWidth={2} />; })}
    <path d={`M66,${150} ${Array.from({ length: 80 }, (_, i) => `L${66 + i * 3.2},${150 - 14 * Math.sin(i * 0.28 - t * 6)}`).join(" ")}`} fill="none" stroke="#d9444f" strokeWidth={1.6} />
    {T({ x: 160, y: 24, s: "Sound is a vibration that squeezes and stretches the air", size: 9, bold: true })}
    {T({ x: 160, y: 64, s: "crowded = squeezed", size: 7.5, fill: "#2563c9" })}{T({ x: 160, y: 178, s: "The wave travels; the air itself only wiggles to and fro", size: 8 })}
  </g>
);
const rainbowPrism: Draw = (t) => {
  const cols = ["#ff3b30", "#ff9500", "#ffe14d", "#34c759", "#3b82f6", "#5856d6", "#a259ff"], nm = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
  return (
    <g>
      <rect width={W} height={H} fill="#10152b" />
      <line x1={10} y1={96} x2={132} y2={100} stroke="#fff" strokeWidth={4} strokeDasharray="14 8" strokeDashoffset={-t * 50} />
      <polygon points="130,40 130,160 215,160" fill="#cfe8ff" fillOpacity={0.35} stroke="#cfe8ff" strokeWidth={1.5} />
      {cols.map((c, i) => <g key={c}><line x1={176} y1={108} x2={310} y2={62 + i * 14} stroke={c} strokeWidth={3} strokeDasharray="12 6" strokeDashoffset={-t * 40} opacity={0.95} />{T({ x: 312, y: 66 + i * 14, s: nm[i]!, size: 7.5, fill: c, anchor: "end" })}</g>)}
      {T({ x: 160, y: 16, s: "White light is a mix of colours. The prism bends each colour differently.", size: 8.5, fill: "#fff" })}
      {T({ x: 160, y: 190, s: "Rainbows form when raindrops split sunlight the same way.", size: 8.5, fill: "#cfd8ff" })}
    </g>
  );
};

/* ---------- Maths and computing ---------- */
const FIB: [number, number, number][] = [[0, 0, 1], [1, 0, 1], [0, -2, 2], [-3, -2, 3], [-3, 1, 5], [2, -2, 8]];
const ARCS: [number, number, number, number, number, number, number][] = [ // sx,sy,ex,ey,r,cx,cy
  [0, 0, 1, 1, 1, 1, 0], [1, 1, 2, 0, 1, 1, 0], [2, 0, 0, -2, 2, 0, 0], [0, -2, -3, 1, 3, 0, 1], [-3, 1, 2, 6, 5, 2, 1], [2, 6, 10, -2, 8, 2, -2],
];
const fibonacci: Draw = (t) => {
  const u = 22;
  const X = (x: number) => 36 + (x + 3) * u * 1.0, Y = (y: number) => 26 + (y + 2) * u;
  const n = Math.min(6, Math.floor((t % 9) / 1.3) + 1);
  const arcs = ARCS.slice(0, n).map(([sx, sy, ex, ey, r, cx, cy]) => {
    const cross = (sx - cx) * (ey - cy) - (sy - cy) * (ex - cx);
    return `M${X(sx)},${Y(sy)} A${r * u},${r * u} 0 0 ${cross > 0 ? 1 : 0} ${X(ex)},${Y(ey)}`;
  });
  const cols = ["#ffe14d", "#ffd0a6", "#bfe5b0", "#b8d4ff", "#f3bdd9", "#d8c9ff"];
  return (
    <g>
      <rect width={W} height={H} fill="#fffdf4" />
      {FIB.slice(0, n).map(([x, y, s], i) => <g key={i}><rect x={X(x)} y={Y(y)} width={s * u} height={s * u} fill={cols[i]} stroke="#16253f" strokeWidth={1} />{T({ x: X(x) + (s * u) / 2, y: Y(y) + (s * u) / 2 + 4, s: String(s), size: Math.min(16, 6 + s * 2), bold: true })}</g>)}
      <path d={arcs.join(" ")} fill="none" stroke="#d9444f" strokeWidth={2.2} />
      {T({ x: 160, y: 14, s: "1, 1, 2, 3, 5, 8, 13 ...  each number = the two before it added", size: 9, bold: true })}
      {T({ x: 160, y: 196, s: "Squares of these sizes fit together; a curve through them makes a spiral.", size: 8 })}
    </g>
  );
};
const PR = [2, 3, 5, 7];
const numberSieve: Draw = (t) => {
  const stage = Math.floor(t / 2.2) % 6; // 0: nothing, 1..4 primes, 5 result
  const done = PR.slice(0, Math.min(stage, 4));
  return (
    <g>
      <rect width={W} height={H} fill="#f6f9ff" />
      {Array.from({ length: 50 }, (_, i) => {
        const n = i + 1, c = i % 10, r = Math.floor(i / 10), x = 20 + c * 28, y = 34 + r * 26;
        const out = n === 1 || done.some((p) => n > p && n % p === 0);
        const cur = stage >= 1 && stage <= 4 && n === PR[stage - 1];
        const prime = stage === 5 && n > 1 && !PR.some((p) => n > p && n % p === 0);
        return <g key={n}><rect x={x} y={y} width={26} height={22} rx={4} fill={cur ? "#ffd24d" : prime ? "#bfe5b0" : out ? "#e6e9f0" : "#fff"} stroke="#94a3b8" />{T({ x: x + 13, y: y + 15, s: String(n), size: 10, fill: out ? "#a0a8b8" : "#16253f", bold: cur || prime })}</g>;
      })}
      {T({ x: 160, y: 16, s: stage === 0 ? "Start: cross out 1 (it is not prime)" : stage <= 4 ? `Keep ${PR[stage - 1]}, cross out its multiples` : "What is left are the primes", size: 10, bold: true })}
      {T({ x: 160, y: 190, s: "Primes: numbers with exactly two factors, 1 and themselves", size: 8.5 })}
    </g>
  );
};
const binaryCounter: Draw = (t) => {
  const v = Math.floor(t / 1.2) % 16;
  return (
    <g>
      <rect width={W} height={H} fill="#10152b" />
      {[8, 4, 2, 1].map((w, i) => { const on = (v & w) !== 0; return <g key={w}><circle cx={64 + i * 64} cy={80} r={24} fill={on ? "#ffd24d" : "#2a3150"} stroke="#9aa4c8" />{T({ x: 64 + i * 64, y: 85, s: on ? "1" : "0", size: 16, fill: on ? "#10152b" : "#9aa4c8", bold: true })}{T({ x: 64 + i * 64, y: 124, s: `${w}`, size: 11, fill: "#cfd8ff" })}</g>; })}
      {T({ x: 160, y: 24, s: "Computers count with two digits, 0 and 1 (on and off)", size: 9, fill: "#fff", bold: true })}
      {T({ x: 160, y: 158, s: `Lights on: ${[8, 4, 2, 1].filter((w) => (v & w) !== 0).join(" + ") || "none"}  =  ${v}`, size: 13, fill: "#ffd24d", bold: true })}
    </g>
  );
};
const piUnroll: Draw = (t) => {
  const r = 20, d = 40, total = PI * d, k = Math.min(1, frac(t / 8) * 1.25), dist = k * total;
  const cx = 40 + dist, cy = 90;
  const ang = (dist / r) * (180 / PI);
  return (
    <g>
      <rect width={W} height={H} fill="#f6f9ff" />
      <line x1={40} y1={110} x2={40 + total + 10} y2={110} stroke="#16253f" strokeWidth={2} />
      {[0, 1, 2, 3].map((i) => <g key={i}><line x1={40 + i * d} y1={106} x2={40 + i * d} y2={116} stroke="#16253f" />{T({ x: 40 + i * d, y: 128, s: `${i}d`, size: 8 })}</g>)}
      <line x1={40} y1={110} x2={40 + dist} y2={110} stroke="#d9444f" strokeWidth={4} />
      <g transform={`translate(${cx} ${cy}) rotate(${ang})`}><circle r={r} fill="#e8f1ff" stroke="#1f4fd1" strokeWidth={2} /><line x1={0} y1={0} x2={0} y2={r} stroke="#d9444f" strokeWidth={2} /><circle cy={r} r={2.5} fill="#d9444f" /></g>
      {T({ x: 160, y: 20, s: "Roll a circle one full turn: the line it covers is its circumference", size: 9, bold: true })}
      {T({ x: 160, y: 152, s: `Length = ${(dist / d).toFixed(2)} × diameter`, size: 12, fill: "#d9444f", bold: true })}
      {T({ x: 160, y: 176, s: "After a full turn it is always about 3.14 diameters. That number is π (pi).", size: 8.5 })}
    </g>
  );
};
const circuit: Draw = (t) => {
  const closed = frac(t / 8) < 0.7;
  const loop = (k: number): [number, number] => { const P = 2 * (200 + 100); const d = k * P; if (d < 200) return [60 + d, 150]; if (d < 300) return [260, 150 - (d - 200)]; if (d < 500) return [260 - (d - 300), 50]; return [60, 50 + (d - 500)]; };
  return (
    <g>
      <rect width={W} height={H} fill="#f6f9ff" />
      <rect x={60} y={50} width={200} height={100} fill="none" stroke="#475569" strokeWidth={3} />
      <rect x={52} y={86} width={16} height={28} fill="#f6f9ff" /><line x1={55} y1={90} x2={55} y2={110} stroke="#16253f" strokeWidth={3} /><line x1={65} y1={96} x2={65} y2={104} stroke="#16253f" strokeWidth={5} />{T({ x: 40, y: 102, s: "Cell", size: 8, anchor: "end" })}
      <circle cx={260} cy={100} r={16} fill={closed ? "#ffe14d" : "#e6e9f0"} stroke="#16253f" strokeWidth={2} />{closed && [0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={260 + 20 * Math.cos(i * 1.047)} y1={100 + 20 * Math.sin(i * 1.047)} x2={260 + 28 * Math.cos(i * 1.047)} y2={100 + 28 * Math.sin(i * 1.047)} stroke="#ffb400" strokeWidth={2} />)}
      {T({ x: 288, y: 104, s: "Bulb", size: 8, anchor: "start" })}
      <line x1={140} y1={50} x2={170} y2={closed ? 50 : 32} stroke="#16253f" strokeWidth={4} /><circle cx={140} cy={50} r={3} fill="#16253f" /><circle cx={180} cy={50} r={3} fill="#16253f" />{T({ x: 160, y: 24, s: closed ? "Switch closed: a complete loop" : "Switch open: the loop is broken", size: 9, bold: true })}
      {closed && Array.from({ length: 14 }, (_, i) => { const [x, y] = loop(frac(t * 0.18 + i / 14)); return <circle key={i} cx={x} cy={y} r={3} fill="#2563c9" />; })}
      {T({ x: 160, y: 180, s: "A bulb lights only when electric charge can flow all the way round.", size: 8.5 })}
    </g>
  );
};
const atom: Draw = (t) => (
  <g>
    <rect width={W} height={H} fill="#10152b" />
    {[34, 64].map((r) => <circle key={r} cx={160} cy={100} r={r} fill="none" stroke="#9aa4c8" strokeOpacity={0.5} />)}
    {[[-5, -3], [4, -5], [-2, 5], [6, 3], [-7, 4], [1, -1]].map(([x, y], i) => <circle key={i} cx={160 + x!} cy={100 + y!} r={5.5} fill={i % 2 ? "#d9444f" : "#9aa4c8"} />)}
    {[0, 1].map((i) => { const a = t * 2.4 + i * PI; return <circle key={i} cx={160 + 34 * Math.cos(a)} cy={100 + 34 * Math.sin(a)} r={4} fill="#4fc3ff" />; })}
    {[0, 1, 2, 3].map((i) => { const a = -t * 1.5 + (i * PI) / 2; return <circle key={i} cx={160 + 64 * Math.cos(a)} cy={100 + 64 * Math.sin(a)} r={4} fill="#4fc3ff" />; })}
    {T({ x: 160, y: 18, s: "A carbon atom (simple model): 6 protons, 6 neutrons, 6 electrons", size: 8.5, fill: "#fff", bold: true })}
    {T({ x: 258, y: 40, s: "● electron (moves)", size: 8, fill: "#4fc3ff", anchor: "start" })}{T({ x: 258, y: 52, s: "● proton", size: 8, fill: "#d9444f", anchor: "start" })}{T({ x: 258, y: 64, s: "● neutron", size: 8, fill: "#9aa4c8", anchor: "start" })}
    {T({ x: 160, y: 192, s: "Real atoms are mostly empty space. Not drawn to scale.", size: 8, fill: "#cfd8ff" })}
  </g>
);
const clockTime: Draw = (t) => {
  const min = (t * 30) % 360, hr = ((t * 30) / 12) % 360;
  const hand = (a: number, l: number, w: number, c: string) => <line x1={0} y1={0} x2={l * Math.sin(rad(a))} y2={-l * Math.cos(rad(a))} stroke={c} strokeWidth={w} strokeLinecap="round" />;
  return (
    <g>
      <rect width={W} height={H} fill="#f6f9ff" />
      <g transform="translate(110,100)">
        <circle r={72} fill="#fff" stroke="#16253f" strokeWidth={3} />
        {Array.from({ length: 12 }, (_, i) => <g key={i}><line x1={60 * Math.sin(rad(i * 30))} y1={-60 * Math.cos(rad(i * 30))} x2={68 * Math.sin(rad(i * 30))} y2={-68 * Math.cos(rad(i * 30))} stroke="#16253f" strokeWidth={2} />{T({ x: 50 * Math.sin(rad(i * 30)), y: -50 * Math.cos(rad(i * 30)) + 4, s: String(i === 0 ? 12 : i), size: 10, bold: true })}</g>)}
        {hand(hr, 38, 5, "#16253f")}{hand(min, 56, 3, "#d9444f")}<circle r={4} fill="#16253f" />
      </g>
      {T({ x: 200, y: 70, s: "Long hand: minutes", size: 9, anchor: "start", fill: "#b3232f", bold: true })}{T({ x: 200, y: 84, s: "one lap = 60 minutes", size: 8, anchor: "start" })}
      {T({ x: 200, y: 110, s: "Short hand: hours", size: 9, anchor: "start", bold: true })}{T({ x: 200, y: 124, s: "one lap = 12 hours", size: 8, anchor: "start" })}
      {T({ x: 160, y: 190, s: "Shown fast. When the long hand laps once, the short hand moves one number.", size: 8 })}
    </g>
  );
};

const DEFS: Record<string, Def> = {
  "solar-system": { draw: solar, still: 3, en: "The planets travel around the Sun in their own orbits. Sizes and distances are not to scale.", alt: "The Sun with the eight planets orbiting it" },
  "moon-phases": { draw: moonPhases, still: 7, en: "The Moon goes round Earth once in about a month, and we see different amounts of its sunlit half.", alt: "The Moon orbiting Earth and the phase we see" },
  "day-night": { draw: dayNight, still: 2, en: "Earth spins, so each place turns into the sunlight and then away from it.", alt: "Earth with a spot moving from day side to night side" },
  seasons: { draw: seasons, still: 2, en: "Earth's tilted axis points the same way all year, so each half gets more direct sunlight at different times.", alt: "Earth at four places on its orbit around the Sun" },
  "water-cycle": { draw: waterCycle, still: 2, en: "Water rises as vapour, forms clouds, falls as rain or snow, and flows back to the sea.", alt: "The water cycle with evaporation, clouds, rain and rivers" },
  "plane-lift": { draw: planeLift, still: 1, en: "Four forces act on a plane. Lift must beat weight to climb.", alt: "A wing with airflow and the four forces" },
  heartbeat: { draw: heartbeat, still: 1, en: "The heart pumps blood to the lungs for oxygen and then round the body.", alt: "A beating heart with blood flowing" },
  photosynthesis: { draw: photosynthesis, still: 1, en: "A leaf uses light, water and carbon dioxide to make food and releases oxygen.", alt: "A plant making food from sunlight" },
  eclipses: { draw: eclipses, still: 0.5, en: "In a solar eclipse the Moon covers the Sun; in a lunar eclipse Earth's shadow falls on the Moon.", alt: "Solar and lunar eclipse alignments" },
  tides: { draw: tides, still: 2, en: "The Moon's gravity pulls on the ocean, making bulges that give high tides.", alt: "Earth with tidal bulges and the Moon" },
  "states-of-matter": { draw: statesOfMatter, still: 1, en: "Particles in solids, liquids and gases move in different ways.", alt: "Particles in a solid, a liquid and a gas" },
  pendulum: { draw: pendulum, still: 0.4, en: "A pendulum swings back and forth at a steady beat.", alt: "A swinging pendulum" },
  "sound-waves": { draw: soundWaves, still: 1, en: "A sound wave is air being squeezed and stretched in a pattern that travels outwards.", alt: "A sound wave moving through air" },
  "rainbow-prism": { draw: rainbowPrism, still: 1, en: "A prism splits white light into the colours of the rainbow.", alt: "White light splitting into seven colours" },
  "plate-tectonics": { draw: plateTectonics, still: 1, en: "Earth's crust is broken into plates that slowly move. Where they meet, mountains and volcanoes can form.", alt: "Two tectonic plates meeting" },
  fibonacci: { draw: fibonacci, still: 8.5, en: "Squares of 1, 1, 2, 3, 5 and 8 fit together and a curve through them makes a spiral.", alt: "Fibonacci squares with a spiral" },
  "number-sieve": { draw: numberSieve, still: 12, en: "Cross out the multiples of 2, 3, 5 and 7 and the primes are left.", alt: "A number grid showing the sieve for primes" },
  "binary-counter": { draw: binaryCounter, still: 7, en: "Four lights count from 0 to 15 using only on and off.", alt: "Four binary lights counting" },
  circuit: { draw: circuit, still: 2, en: "Charge flows round a complete loop and lights the bulb.", alt: "A simple circuit with a cell, switch and bulb" },
  "food-chain": { draw: foodChain, still: 0.5, en: "Energy passes from the Sun to plants and then along the animals that eat.", alt: "A food chain from plant to eagle" },
  volcano: { draw: volcano, still: 1.5, en: "Magma rises through a vent and erupts as lava, ash and gas.", alt: "A volcano erupting" },
  atom: { draw: atom, still: 1, en: "An atom has a tiny nucleus with electrons around it.", alt: "An atom with a nucleus and electrons" },
  "pi-unroll": { draw: piUnroll, still: 8, en: "Unroll a circle and its edge is a little over three diameters long.", alt: "A circle rolling along a line" },
  "clock-time": { draw: clockTime, still: 8, en: "The minute hand makes a lap while the hour hand moves one number.", alt: "An analogue clock with moving hands" },
};
export const GK_VISUAL_IDS = Object.keys(DEFS);
export const hasVisual = (id: string): boolean => id in DEFS;

const reducedMotion = (): boolean => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function GkVisual({ id, animate = true, speed = 1, controls = true, caption = true, lang = "en" }: { id: string; animate?: boolean; speed?: number; controls?: boolean; caption?: boolean; lang?: Lang }) {
  const def = DEFS[id];
  const canMove = animate && !reducedMotion();
  const [playing, setPlaying] = useState(canMove);
  const [rate, setRate] = useState(speed);
  const [t, setT] = useState(def?.still ?? 0);
  const last = useRef(0);
  useEffect(() => setRate(speed), [speed]);
  useEffect(() => {
    if (!playing || !canMove || typeof requestAnimationFrame !== "function") return;
    let raf = 0; let prev = 0;
    const tick = (now: number) => {
      if (prev && now - last.current >= 33) { setT((x) => x + ((now - prev) / 1000) * rate); last.current = now; }
      if (!prev) last.current = now;
      prev = now; raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, canMove, rate]);
  if (!def) return null;
  return (
    <figure className="gk-visual" data-testid={`gk-visual-${id}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={def.alt} style={{ color: "#16253f" }}>{def.draw(t)}</svg>
      {(caption || (controls && canMove)) && (
        <figcaption>
          {controls && canMove && (
            <span className="gk-vctl noprint">
              <button type="button" className="btn ghost sm" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>{playing ? `⏸ ${gt("stop", lang)}` : `▶ ${gt("play", lang)}`}</button>
              <button type="button" className="btn ghost sm" onClick={() => setRate((r) => (r >= 1.5 ? 0.5 : r + 0.5))} aria-label={gt("speed", lang)}>{rate}×</button>
            </span>
          )}
          {caption && <span>{def.en}</span>}
        </figcaption>
      )}
    </figure>
  );
}
