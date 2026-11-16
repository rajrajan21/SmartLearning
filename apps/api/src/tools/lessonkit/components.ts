/**
 * The scene library: each component turns a few numbers into ready-made board objects (see packages/shared classroom.ts).
 * A recipe says  ["numberline", "nl", { from: -5, to: 5 }]  and gets axis, ticks, labels and a zero marker with ids nlAxis, nlTm3, nlN4 ...
 * Add a component here when a new kind of picture is needed; every lesson can then reuse it.
 */
export type Obj = Record<string, unknown> & { id: string; kind: string };
export type Params = Record<string, unknown>;
const num = (p: Params, k: string, d: number) => (typeof p[k] === "number" ? (p[k] as number) : d);
const str = (p: Params, k: string, d: string) => (typeof p[k] === "string" ? (p[k] as string) : d);
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const round = (n: number) => Math.round(n * 10) / 10;
export const MINUS = "−";
const val = (v: number) => (v < 0 ? `m${-v}` : `${v}`);

type Maker = (id: string, p: Params) => Obj[];
const named = (id: string, name: string) => `${id}${cap(name)}`;

const numberline: Maker = (id, p) => {
  const from = num(p, "from", -5), to = num(p, "to", 5), y = num(p, "y", 300), x1 = num(p, "x1", 60), x2 = num(p, "x2", 840);
  const stepX = (x2 - x1) / (to - from), neg = str(p, "neg", "#D9531E"), pos = str(p, "pos", "#17785A"), ink = "#16253F", size = num(p, "size", 30);
  const out: Obj[] = [{ kind: "line", id: named(id, "axis"), x1: x1 - 20, y1: y, x2: x2 + 20, y2: y, stroke: ink, width: 6 }];
  for (let v = from; v <= to; v++) {
    const x = round(x1 + (v - from) * stepX);
    out.push({ kind: "line", id: named(id, `t${val(v)}`), x1: x, y1: y - 14, x2: x, y2: y + 14, stroke: ink, width: 4 });
    out.push({ kind: "text", id: named(id, `n${val(v)}`), x, y: y + 52, text: v < 0 ? `${MINUS}${-v}` : `${v}`, size, anchor: "middle", color: v < 0 ? neg : v > 0 ? pos : ink });
  }
  if (from < 0 && to > 0) out.push({ kind: "circle", id: named(id, "zero"), cx: round(x1 + (0 - from) * stepX), cy: y, r: 15, fill: "#FFD166", stroke: "#F4A300", width: 4 });
  return out;
};

const pie: Maker = (id, p) => {
  const n = Math.max(2, Math.min(12, num(p, "n", 4))), cx = num(p, "cx", 450), cy = num(p, "cy", 270), r = num(p, "r", 170);
  const at = (deg: number, rad: number) => [round(cx + rad * Math.sin((deg * Math.PI) / 180)), round(cy - rad * Math.cos((deg * Math.PI) / 180))] as const;
  const out: Obj[] = [{ kind: "circle", id: named(id, "whole"), cx, cy, r: r + 12, fill: str(p, "wholeFill", "#FFFFFF"), stroke: str(p, "wholeStroke", "#CFD8DC"), width: 6 }];
  for (let k = 1; k <= n; k++) out.push({ kind: "sector", id: named(id, `s${k}`), cx, cy, r, from: round(((k - 1) * 360) / n), to: round((k * 360) / n), stroke: "#FFFFFF", width: 4 });
  for (let k = 1; k <= n; k++) { const [x, y] = at(((k - 1) * 360) / n, r); out.push({ kind: "line", id: named(id, `c${k}`), x1: cx, y1: cy, x2: x, y2: y, stroke: "#8D6E63", width: 4 }); }
  return out;
};

const fractionbar: Maker = (id, p) => {
  const n = Math.max(2, Math.min(12, num(p, "n", 4))), x = num(p, "x", 150), y = num(p, "y", 220), w = num(p, "w", 600), h = num(p, "h", 90);
  const out: Obj[] = [{ kind: "rect", id: named(id, "frame"), x: x - 6, y: y - 6, w: w + 12, h: h + 12, rx: 10, fill: "#FFFFFF", stroke: "#8D6E63", width: 4 }];
  for (let k = 1; k <= n; k++) out.push({ kind: "rect", id: named(id, `b${k}`), x: round(x + ((k - 1) * w) / n), y, w: round(w / n), h, stroke: "#FFFFFF", width: 4 });
  return out;
};

/** a row of counters (equal groups, sharing, counting) */
const dots: Maker = (id, p) => {
  const n = Math.max(1, Math.min(40, num(p, "n", 6))), x = num(p, "x", 200), y = num(p, "y", 250), gap = num(p, "gap", 60), r = num(p, "r", 20), color = str(p, "color", "#F4A300"), per = num(p, "perRow", n);
  const out: Obj[] = [];
  for (let k = 0; k < n; k++) out.push({ kind: "circle", id: named(id, `d${k + 1}`), cx: x + (k % per) * gap, cy: y + Math.floor(k / per) * gap, r, fill: color, stroke: "#B45309", width: 3 });
  return out;
};


/** hundreds flats, tens rods and ones beads in three labelled columns (place value) */
const placevalue: Maker = (id, p) => {
  const h = num(p, "h", 2), t = num(p, "t", 4), o = num(p, "o", 7), y = num(p, "y", 130), cx = [num(p, "cx1", 170), num(p, "cx2", 450), num(p, "cx3", 730)] as const;
  const out: Obj[] = [];
  const head = (k: "h" | "t" | "o", c: number, text: string, color: string) => {
    out.push({ kind: "text", id: named(id, `${k}Head`), x: c, y: y - 20, text, size: 32, anchor: "middle", color });
  };
  head("h", cx[0], "Hundreds", "#1E88E5"); head("t", cx[1], "Tens", "#2E7D32"); head("o", cx[2], "Ones", "#B7791F");
  for (let i = 0; i < h; i++) out.push({ kind: "rect", id: named(id, `h${i + 1}`), x: cx[0] - 101 + (i % 3) * 70, y: y + Math.floor(i / 3) * 70, w: 62, h: 62, rx: 6, fill: "#BBDEFB", stroke: "#1E88E5", width: 4 });
  for (let i = 0; i < t; i++) out.push({ kind: "rect", id: named(id, `t${i + 1}`), x: round(cx[1] - (t * 24 - 8) / 2 + i * 24), y, w: 16, h: 100, rx: 5, fill: "#C8E6C9", stroke: "#2E7D32", width: 3 });
  for (let i = 0; i < o; i++) out.push({ kind: "circle", id: named(id, `o${i + 1}`), cx: cx[2] - 60 + (i % 5) * 30, cy: y + 12 + Math.floor(i / 5) * 32, r: 12, fill: "#FFE082", stroke: "#F9A825", width: 3 });
  out.push({ kind: "text", id: named(id, "hVal"), x: cx[0], y: y + 250, text: `${h * 100}`, size: 44, anchor: "middle", color: "#1E88E5" });
  out.push({ kind: "text", id: named(id, "tVal"), x: cx[1], y: y + 250, text: `${t * 10}`, size: 44, anchor: "middle", color: "#2E7D32" });
  out.push({ kind: "text", id: named(id, "oVal"), x: cx[2], y: y + 250, text: `${o}`, size: 44, anchor: "middle", color: "#B7791F" });
  return out;
};

/** a measuring jug with litre marks; water1, water2 ... are the levels (in litres) to show one after another */
const jug: Maker = (id, p) => {
  const x = num(p, "x", 300), y = num(p, "y", 120), w = num(p, "w", 150), h = num(p, "h", 240), max = num(p, "max", 3);
  const levels = (Array.isArray(p.levels) ? p.levels : [1]) as number[];
  const out: Obj[] = [];
  levels.forEach((l, i) => out.push({ kind: "rect", id: named(id, `water${i + 1}`), x: x + 4, y: round(y + h - (l / max) * h), w: w - 8, h: round((l / max) * h) - 3, rx: 4, fill: "#4FC3F7" }));
  out.push({ kind: "rect", id: named(id, "frame"), x, y, w, h, rx: 12, stroke: "#546E7A", width: 6 });
  for (let k = 1; k <= max; k++) {
    const yy = round(y + h - (k / max) * h);
    out.push({ kind: "line", id: named(id, `tick${k}`), x1: x + w, y1: yy, x2: x + w + 22, y2: yy, stroke: "#546E7A", width: 4 });
    out.push({ kind: "text", id: named(id, `mark${k}`), x: x + w + 32, y: yy + 9, text: `${k} L`, size: 28, color: "#37474F" });
  }
  return out;
};

/** a kitchen scale with a needle pointing at `kg` */
const kgscale: Maker = (id, p) => {
  const cx = num(p, "cx", 450), cy = num(p, "cy", 270), r = num(p, "r", 110), max = num(p, "max", 5), kg = num(p, "kg", 2);
  const ang = (v: number) => -135 + (v / max) * 270, at = (v: number, rad: number) => [round(cx + rad * Math.sin((ang(v) * Math.PI) / 180)), round(cy - rad * Math.cos((ang(v) * Math.PI) / 180))] as const;
  const out: Obj[] = [
    { kind: "rect", id: named(id, "base"), x: cx - 140, y: cy + r - 20, w: 280, h: 56, rx: 16, fill: "#90A4AE", stroke: "#546E7A", width: 5 },
    { kind: "rect", id: named(id, "pan"), x: cx - 100, y: cy - r - 40, w: 200, h: 20, rx: 8, fill: "#B0BEC5", stroke: "#546E7A", width: 4 },
    { kind: "line", id: named(id, "post"), x1: cx, y1: cy - r - 20, x2: cx, y2: cy - r + 6, stroke: "#546E7A", width: 8 },
    { kind: "circle", id: named(id, "dial"), cx, cy, r, fill: "#FFFFFF", stroke: "#455A64", width: 6 },
  ];
  for (let v = 0; v <= max; v++) { const [x, y] = at(v, r - 28); out.push({ kind: "text", id: named(id, `n${v}`), x, y: y + 9, text: `${v}`, size: 26, anchor: "middle", color: "#37474F" }); }
  const [nx, ny] = at(kg, r - 40);
  out.push({ kind: "arrow", id: named(id, "needle"), x1: cx, y1: cy, x2: nx, y2: ny, stroke: "#E53935", width: 7 });
  out.push({ kind: "text", id: named(id, "unit"), x: cx, y: cy + 52, text: "kg", size: 26, anchor: "middle", color: "#455A64" });
  return out;
};

/** coins and notes in a row: items = [["coin",5],["note",10]] */
const rupees: Maker = (id, p) => {
  const items = (Array.isArray(p.items) ? p.items : [["coin", 1]]) as [string, number][];
  let x = num(p, "x", 100); const y = num(p, "y", 250), out: Obj[] = [];
  items.forEach(([kind, v], i) => {
    if (kind === "note") { out.push({ kind: "rect", id: named(id, `s${i + 1}`), x, y: y - 31, w: 130, h: 70, rx: 8, fill: "#C8E6C9", stroke: "#2E7D32", width: 4 }); out.push({ kind: "text", id: named(id, `l${i + 1}`), x: x + 65, y: y + 10, text: `₹${v}`, size: 32, anchor: "middle", color: "#1B5E20" }); x += 150; }
    else { out.push({ kind: "circle", id: named(id, `s${i + 1}`), cx: x + 32, cy: y, r: 32, fill: "#FFD54F", stroke: "#B8860B", width: 5 }); out.push({ kind: "text", id: named(id, `l${i + 1}`), x: x + 32, y: y + 9, text: `₹${v}`, size: 26, anchor: "middle", color: "#7A5A00" }); x += 82; }
  });
  return out;
};

/** a child's hand (palm and fingers); mud > 0 adds that many brown patches */
const hand: Maker = (id, p) => {
  const x = num(p, "x", 300), y = num(p, "y", 160), k = num(p, "scale", 1), mud = num(p, "mud", 0), skin = str(p, "skin", "#F2B880"), edge = "#C98B52";
  const out: Obj[] = [{ kind: "rect", id: named(id, "palm"), x, y: y + 110 * k, w: 150 * k, h: 130 * k, rx: 40 * k, fill: skin, stroke: edge, width: 4 }];
  [[8, 40], [44, 15], [80, 5], [116, 30]].forEach(([dx, dy], i) => out.push({ kind: "rect", id: named(id, `f${i + 1}`), x: x + dx! * k, y: y + dy! * k, w: 28 * k, h: 140 * k, rx: 14 * k, fill: skin, stroke: edge, width: 4 }));
  out.push({ kind: "rect", id: named(id, "thumb"), x: x - 30 * k, y: y + 140 * k, w: 70 * k, h: 28 * k, rx: 14 * k, fill: skin, stroke: edge, width: 4 });
  const spots: [number, number, number][] = [[40, 150, 16], [100, 130, 14], [70, 200, 18], [120, 210, 13], [20, 60, 10], [95, 40, 9]];
  for (let i = 0; i < Math.min(mud, spots.length); i++) { const [dx, dy, r] = spots[i]!; out.push({ kind: "circle", id: named(id, `mud${i + 1}`), cx: x + dx * k, cy: y + dy * k, r: r * k, fill: "#795548", stroke: "#4E342E", width: 2 }); }
  return out;
};

/** tiny germs (spiky green dots) scattered over an area */
const germs: Maker = (id, p) => {
  const n = Math.max(1, Math.min(12, num(p, "n", 6))), x = num(p, "x", 600), y = num(p, "y", 160), out: Obj[] = [];
  const pos: [number, number][] = [[0, 0], [70, 30], [30, 80], [100, 90], [10, 150], [80, 160], [140, 40], [150, 130], [50, 210], [120, 220], [170, 190], [180, 80]];
  for (let i = 0; i < n; i++) { const [dx, dy] = pos[i]!; out.push({ kind: "circle", id: named(id, `g${i + 1}`), cx: x + dx, cy: y + dy, r: 16, fill: "#9CCC65", stroke: "#33691E", width: 4 }); out.push({ kind: "circle", id: named(id, `e${i + 1}`), cx: x + dx - 5, cy: y + dy - 3, r: 3, fill: "#1B5E20" }); }
  return out;
};

/** soap bubbles */
const bubbles: Maker = (id, p) => {
  const n = Math.max(1, Math.min(10, num(p, "n", 6))), x = num(p, "x", 300), y = num(p, "y", 160), out: Obj[] = [];
  const pos: [number, number, number][] = [[0, 0, 26], [90, 30, 18], [40, 90, 30], [150, 100, 22], [100, 170, 16], [10, 190, 20], [180, 20, 14], [170, 180, 24], [60, 40, 12], [130, 60, 10]];
  for (let i = 0; i < n; i++) { const [dx, dy, r] = pos[i]!; out.push({ kind: "circle", id: named(id, `b${i + 1}`), cx: x + dx, cy: y + dy, r, fill: "#E1F5FE", stroke: "#4FC3F7", width: 3 }); }
  return out;
};

/** a number line from 0 to `max` with every unit cut into `d` equal parts. Pieces: axis, tick k (t0..), whole numbers w0.., fraction labels f1.., length arrows a1.. (from 0 to k/d), cut marks */
const fracline: Maker = (id, p) => {
  const x1 = num(p, "x1", 90), x2 = num(p, "x2", 810), y = num(p, "y", 300), d = Math.max(2, Math.min(12, num(p, "d", 4))), max = Math.max(1, Math.min(4, num(p, "max", 2)));
  const total = d * max, step = (x2 - x1) / total, ink = "#16253F", out: Obj[] = [{ kind: "line", id: named(id, "axis"), x1: x1 - 20, y1: y, x2: x2 + 20, y2: y, stroke: ink, width: 6 }];
  const arrowCol = str(p, "color", "#1E88E5");
  for (let k = 0; k <= total; k++) {
    const x = round(x1 + k * step), whole = k % d === 0;
    out.push({ kind: "line", id: named(id, `t${k}`), x1: x, y1: y - (whole ? 18 : 11), x2: x, y2: y + (whole ? 18 : 11), stroke: ink, width: whole ? 5 : 3 });
    if (whole) out.push({ kind: "text", id: named(id, `w${k / d}`), x, y: y + 56, text: `${k / d}`, size: 32, anchor: "middle", color: ink });
    else out.push({ kind: "text", id: named(id, `f${k}`), x, y: y + 50, text: `${k}/${d}`, size: Math.max(15, Math.min(24, Math.round(step * 0.5))), anchor: "middle", color: "#B45309" });
    if (k > 0 && k <= num(p, "arrows", total) && (!Array.isArray(p.arrowsAt) || (p.arrowsAt as number[]).includes(k))) out.push({ kind: "arrow", id: named(id, `a${k}`), x1: x1, y1: y - 46 - ((k - 1) % 2) * 0, x2: x, y2: y - 46, stroke: arrowCol, width: 8 });
  }
  return out;
};

/** a fraction wall: one bar per denominator in `rows`, each cut into equal cells. Pieces: row d label (r{d}L), cells r{d}c{k} */
const fracwall: Maker = (id, p) => {
  const rows = (Array.isArray(p.rows) ? p.rows : [1, 2, 3, 4, 6, 8, 12]) as number[], x = num(p, "x", 150), y = num(p, "y", 80), w = num(p, "w", 640), h = num(p, "h", 46), gap = num(p, "gap", 6);
  const hues = ["#FFE0B2", "#C5E1A5", "#B3E5FC", "#F8BBD0", "#D1C4E9", "#FFF59D", "#B2DFDB"], out: Obj[] = [];
  rows.forEach((d, ri) => {
    const yy = y + ri * (h + gap);
    out.push({ kind: "text", id: named(id, `r${d}L`), x: x - 18, y: yy + h * 0.68, text: d === 1 ? "1" : `1/${d}`, size: 24, anchor: "end", color: "#37474F" });
    for (let k = 1; k <= d; k++) out.push({ kind: "rect", id: named(id, `r${d}c${k}`), x: round(x + ((k - 1) * w) / d), y: yy, w: round(w / d), h, rx: 4, fill: hues[ri % hues.length], stroke: "#FFFFFF", width: 3 });
  });
  return out;
};

const norm360 = (d: number) => ((d % 360) + 360) % 360;
/** an angle at (cx,cy): two arms of length r at math angles a1 and a2 (degrees, 0 = to the right, counter-clockwise), with a coloured arc. Pieces: arm1, arm2, arc, dot, label (the measure text, if `label` given) */
const angle: Maker = (id, p) => {
  const cx = num(p, "cx", 300), cy = num(p, "cy", 330), r = num(p, "r", 220), a1 = num(p, "a1", 0), a2 = num(p, "a2", 60), ar = num(p, "arc", Math.min(70, r * 0.4));
  const at = (deg: number, rad: number) => [round(cx + rad * Math.cos((deg * Math.PI) / 180)), round(cy - rad * Math.sin((deg * Math.PI) / 180))] as const;
  const [x1, y1] = at(a1, r), [x2, y2] = at(a2, r), mid = (a1 + a2) / 2, [lx, ly] = at(mid, ar + 38);
  const col = str(p, "color", "#1E88E5"), out: Obj[] = [
    { kind: "sector", id: named(id, "arc"), cx, cy, r: ar, from: norm360(90 - a2), to: norm360(90 - a1), fill: str(p, "fill", "#BBDEFB"), stroke: col, width: 3 },
    { kind: "line", id: named(id, "arm1"), x1: cx, y1: cy, x2: x1, y2: y1, stroke: str(p, "arm1", "#16253F"), width: 7 },
    { kind: "line", id: named(id, "arm2"), x1: cx, y1: cy, x2: x2, y2: y2, stroke: str(p, "arm2", "#16253F"), width: 7 },
    { kind: "circle", id: named(id, "dot"), cx, cy, r: 9, fill: "#E53935", stroke: "#B71C1C", width: 3 },
  ];
  if (typeof p.label === "string" && p.label) out.push({ kind: "text", id: named(id, "label"), x: lx, y: ly + 10, text: p.label, size: num(p, "size", 34), anchor: "middle", color: col });
  return out;
};

/** a half-circle protractor centred at (cx,cy), radius r: outline, base line, ticks every 10 degrees and numbers. Pieces: body, base, t0..t180 (ticks), n0..n180 (numbers) */
const protractor: Maker = (id, p) => {
  const cx = num(p, "cx", 450), cy = num(p, "cy", 400), r = num(p, "r", 300);
  const at = (deg: number, rad: number) => [round(cx + rad * Math.cos((deg * Math.PI) / 180)), round(cy - rad * Math.sin((deg * Math.PI) / 180))] as const;
  const out: Obj[] = [
    { kind: "sector", id: named(id, "body"), cx, cy, r, from: 270, to: 90, fill: "#E3F2FD", stroke: "#1565C0", width: 5 },
    { kind: "line", id: named(id, "base"), x1: cx - r - 10, y1: cy, x2: cx + r + 10, y2: cy, stroke: "#1565C0", width: 5 },
  ];
  for (let d = 0; d <= 180; d += 10) {
    const [x1, y1] = at(d, r), [x2, y2] = at(d, r - (d % 30 === 0 ? 30 : 18));
    out.push({ kind: "line", id: named(id, `t${d}`), x1, y1, x2, y2, stroke: "#1565C0", width: d % 30 === 0 ? 4 : 2 });
    if (d % 20 !== 0) continue;
    const [tx, ty] = at(d, r - 52);
    out.push({ kind: "text", id: named(id, `n${d}`), x: tx, y: ty + 7, text: `${d}`, size: 19, anchor: "middle", color: "#0D47A1" });
  }
  return out;
};

export const COMPONENTS: Record<string, Maker> = { numberline, pie, fractionbar, dots, placevalue, angle, protractor, fracline, fracwall, jug, kgscale, rupees, hand, germs, bubbles };
export const COMPONENT_NAMES = Object.keys(COMPONENTS);
