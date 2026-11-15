/** A tiny 3D engine for the classroom board: solids built by the site itself, drawn as flat-shaded SVG polygons. No libraries. */
export type V3 = [number, number, number];
export interface Face { pts: V3[]; n: V3; kind?: "flat" | "curved" }
export interface Mesh { faces: Face[]; edges: [V3, V3][]; corners: V3[] }
export type SolidShape = "cube" | "cuboid" | "cylinder" | "cone" | "sphere" | "pyramid";

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v: V3): V3 => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
/** a face whose outward normal is worked out from the winding order (counter-clockwise seen from outside) */
const face = (pts: V3[], kind: Face["kind"] = "flat"): Face => ({ pts, n: norm(cross(sub(pts[1]!, pts[0]!), sub(pts[2]!, pts[0]!))), kind });

function box(w: number, h: number, d: number): Mesh {
  const x = w / 2, y = h / 2, z = d / 2;
  const v: V3[] = [[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z], [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]];
  const q = (a: number, b: number, c: number, e: number) => face([v[a]!, v[b]!, v[c]!, v[e]!]);
  return {
    faces: [q(4, 5, 6, 7), q(1, 0, 3, 2), q(5, 1, 2, 6), q(0, 4, 7, 3), q(7, 6, 2, 3), q(0, 1, 5, 4)],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].map(([a, b]) => [v[a!]!, v[b!]!] as [V3, V3]),
    corners: v,
  };
}
const ring = (r: number, y: number, n: number): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, y, Math.sin(a) * r] as V3; });

function cylinder(): Mesh {
  const n = 28, top = ring(0.4, 0.5, n), bot = ring(0.4, -0.5, n), faces: Face[] = [];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push(face([bot[i]!, bot[j]!, top[j]!, top[i]!], "curved")); }
  faces.push(face([...top].reverse(), "flat"), face([...bot], "flat"));
  return { faces, edges: [], corners: [] };
}
function cone(): Mesh {
  const n = 28, base = ring(0.4, -0.5, n), apex: V3 = [0, 0.5, 0], faces: Face[] = [];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push(face([base[j]!, base[i]!, apex], "curved")); }
  faces.push(face([...base], "flat"));
  return { faces, edges: [], corners: [apex] };
}
function pyramid(): Mesh {
  const b: V3[] = [[-0.4, -0.4, -0.4], [0.4, -0.4, -0.4], [0.4, -0.4, 0.4], [-0.4, -0.4, 0.4]], a: V3 = [0, 0.5, 0];
  return {
    faces: [face([b[3]!, b[2]!, a]), face([b[2]!, b[1]!, a]), face([b[1]!, b[0]!, a]), face([b[0]!, b[3]!, a]), face([b[0]!, b[1]!, b[2]!, b[3]!])],
    edges: [[b[0]!, b[1]!], [b[1]!, b[2]!], [b[2]!, b[3]!], [b[3]!, b[0]!], [b[0]!, a], [b[1]!, a], [b[2]!, a], [b[3]!, a]],
    corners: [...b, a],
  };
}
function sphere(): Mesh {
  const lat = 10, lon = 18, r = 0.5, p = (i: number, j: number): V3 => { const t = (i / lat) * Math.PI, a = (j / lon) * Math.PI * 2; return [r * Math.sin(t) * Math.cos(a), r * Math.cos(t), r * Math.sin(t) * Math.sin(a)]; };
  const faces: Face[] = [];
  for (let i = 0; i < lat; i++) for (let j = 0; j < lon; j++) {
    const pts = i === 0 ? [p(0, j), p(1, j + 1), p(1, j)] : i === lat - 1 ? [p(i, j), p(i, j + 1), p(lat, j)] : [p(i, j), p(i, j + 1), p(i + 1, j + 1), p(i + 1, j)];
    faces.push(face(pts, "curved"));
  }
  return { faces, edges: [], corners: [] };
}

const cache = new Map<SolidShape, Mesh>();
export function meshOf(shape: SolidShape): Mesh {
  let m = cache.get(shape);
  if (!m) { m = shape === "cube" ? box(0.8, 0.8, 0.8) : shape === "cuboid" ? box(1, 0.55, 0.7) : shape === "cylinder" ? cylinder() : shape === "cone" ? cone() : shape === "pyramid" ? pyramid() : sphere(); cache.set(shape, m); }
  return m;
}

const rot = (p: V3, yaw: number, pitch: number): V3 => {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
  return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
};
const LIGHT = norm([-0.45, 0.75, 0.55]);

export interface Projected { points: string; shade: number; depth: number; index: number; cx: number; cy: number; kind: Face["kind"] }
export interface Scene3D { faces: Projected[]; edges: { x1: number; y1: number; x2: number; y2: number; depth: number }[]; corners: { x: number; y: number }[] }

/** Turns a solid into 2D shapes for the current angle: hidden faces dropped, the rest sorted far to near and shaded. */
export function project(shape: SolidShape, cx: number, cy: number, size: number, yawDeg: number, pitchDeg: number): Scene3D {
  const m = meshOf(shape), yaw = (yawDeg * Math.PI) / 180, pitch = (pitchDeg * Math.PI) / 180;
  const to = (p: V3) => { const r = rot(p, yaw, pitch); return { x: cx + r[0] * size, y: cy - r[1] * size, z: r[2] }; };
  const faces: Projected[] = [];
  m.faces.forEach((f, index) => {
    const n = rot(f.n, yaw, pitch);
    if (n[2] <= 0.0001) return; // facing away from us
    const pr = f.pts.map(to);
    const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    faces.push({ points: pr.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" "), shade: 0.58 + 0.42 * lit, depth: pr.reduce((s, q) => s + q.z, 0) / pr.length, index, cx: pr.reduce((s, q) => s + q.x, 0) / pr.length, cy: pr.reduce((s, q) => s + q.y, 0) / pr.length, kind: f.kind });
  });
  faces.sort((a, b) => a.depth - b.depth);
  const edges = m.edges.map(([a, b]) => { const p = to(a), q = to(b); return { x1: p.x, y1: p.y, x2: q.x, y2: q.y, depth: (p.z + q.z) / 2 }; });
  return { faces, edges, corners: m.corners.map((c) => { const p = to(c); return { x: p.x, y: p.y }; }) };
}

export function shadeHex(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16), c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}
export const faceCount = (shape: SolidShape) => meshOf(shape).faces.length;
