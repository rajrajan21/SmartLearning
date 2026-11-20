import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCanvas, Path2D, type SKRSContext2D } from "@napi-rs/canvas";
import { picturesFor } from "@studysmart/shared";
import { boardName, subjectName } from "./engine.js";
import type { Candidate, SettingsMap } from "./types.js";

/* ============================================================
 * Pictures and reels, drawn locally (no outside service):
 *  - classroom lessons: the lesson's own board (shapes, text, 3D solids) is drawn from content/classroom/<id>.json
 *  - other lessons: a clean branded lesson card (title, key points, big emoji pictures)
 * A reel is the same drawing, step by step, 9:16, joined with the lesson's voice-over by ffmpeg when the audio exists.
 * ============================================================ */

const FONT = `"Segoe UI", "Liberation Sans", Arial, "DejaVu Sans", sans-serif`;
const EMOJI = `"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
const THEMES: Record<string, { bg1: string; bg2: string; ink: string; soft: string; accent: string; chip: string; chipInk: string }> = {
  bright: { bg1: "#d7efff", bg2: "#fff3c4", ink: "#12304d", soft: "#3f5f7f", accent: "#ff8a00", chip: "#12304d", chipInk: "#ffffff" },
  paper: { bg1: "#fbf3e4", bg2: "#f4e2c3", ink: "#3b2a18", soft: "#6e5a44", accent: "#c4502b", chip: "#3b2a18", chipInk: "#fff8ea" },
  night: { bg1: "#0f1f3d", bg2: "#1d3a6b", ink: "#f4f8ff", soft: "#b9cbe8", accent: "#ffc83d", chip: "#ffc83d", chipInk: "#10213f" },
};
const PALETTE: Record<string, string> = { ink: "#1f2a37", accent: "#e8590c", warm: "#f59f00", good: "#2f9e44", soft: "#868e96", water: "#1c7ed6", earth: "#8d6e4c", sun: "#fcc419" };
const col = (c: unknown, d: string) => (typeof c === "string" ? (PALETTE[c] ?? (/^#[0-9a-f]{6}$/i.test(c) ? c : d)) : d);

export interface Size { w: number; h: number }
export const parseSize = (s: string): Size => { const [w, h] = s.split("x").map(Number); return w && h ? { w, h } : { w: 1080, h: 1350 }; };
const str = (v: unknown, d: string) => (typeof v === "string" && v ? v : d);

function gradient(ctx: SKRSContext2D, w: number, h: number, a: string, b: string) { const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function roundRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
export function wrap(ctx: SKRSContext2D, text: string, maxW: number): string[] {
  const out: string[] = []; let line = "";
  for (const word of text.split(/\s+/)) { const t = line ? line + " " + word : word; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t; }
  if (line) out.push(line); return out;
}
function fitText(ctx: SKRSContext2D, text: string, maxW: number, maxLines: number, start: number, min: number, weight = "700") {
  for (let size = start; size >= min; size -= 2) { ctx.font = `${weight} ${size}px ${FONT}`; const l = wrap(ctx, text, maxW); if (l.length <= maxLines) return { size, lines: l }; }
  ctx.font = `${weight} ${min}px ${FONT}`; const l = wrap(ctx, text, maxW); return { size: min, lines: l.slice(0, maxLines).map((x, i, a) => (i === a.length - 1 && l.length > maxLines ? x.replace(/\s*\S*$/, "") + "…" : x)) };
}
function background(ctx: SKRSContext2D, { w, h }: Size, theme: string) {
  const t = THEMES[theme] ?? THEMES.bright!;
  ctx.fillStyle = gradient(ctx, w, h, t.bg1, t.bg2); ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.18; ctx.fillStyle = t.accent; ctx.beginPath(); ctx.arc(w * 0.92, h * 0.06, w * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = t.ink; ctx.beginPath(); ctx.arc(w * 0.04, h * 0.98, w * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  return t;
}
function chip(ctx: SKRSContext2D, x: number, y: number, text: string, t: (typeof THEMES)[string], size: number) {
  ctx.font = `700 ${size}px ${FONT}`; const w = ctx.measureText(text).width + size * 1.4; const h = size * 1.9;
  ctx.fillStyle = t.chip; roundRect(ctx, x, y, w, h, h / 2); ctx.fill(); ctx.fillStyle = t.chipInk; ctx.textBaseline = "middle"; ctx.fillText(text, x + size * 0.7, y + h / 2 + 1); ctx.textBaseline = "alphabetic"; return w;
}
function brandBar(ctx: SKRSContext2D, { w, h }: Size, s: SettingsMap, t: (typeof THEMES)[string], url: string) {
  const pad = w * 0.06, bh = Math.round(h * 0.07);
  ctx.fillStyle = t.chip; roundRect(ctx, pad, h - pad - bh, w - 2 * pad, bh, bh / 2); ctx.fill();
  ctx.fillStyle = t.chipInk; ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.round(bh * 0.46)}px ${FONT}`; ctx.fillText(str(s["social.brand.name"], "SharpStudy"), pad + bh * 0.5, h - pad - bh / 2);
  ctx.font = `600 ${Math.round(bh * 0.36)}px ${FONT}`; ctx.textAlign = "right"; ctx.fillText(url.replace(/^https?:\/\//, "").replace(/\/$/, ""), w - pad - bh * 0.5, h - pad - bh / 2); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}

/* ---------- the classroom board, drawn from the lesson's board file ---------- */
export interface BoardFile { objects: any[]; steps: { id: string; narration?: { en?: string }; actions?: { do: string; target?: string }[] }[]; title?: { en?: string } }
export const loadBoard = (dir: string, id: string): BoardFile | null => { const p = join(dir, id + ".json"); try { return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as BoardFile) : null; } catch { return null; } };

/** which board objects are visible after each step (objects no action ever mentions are visible from the start) */
export function boardSnapshots(b: BoardFile): Set<string>[] {
  const targeted = new Set<string>();
  for (const st of b.steps) for (const a of st.actions ?? []) if (a.target) targeted.add(a.target);
  const vis = new Set<string>(b.objects.map((o) => o.id).filter((id) => !targeted.has(id)));
  const snaps: Set<string>[] = [];
  for (const st of b.steps) {
    for (const a of st.actions ?? []) {
      if (a.do === "clear") { for (const id of [...vis]) if (targeted.has(id)) vis.delete(id); }
      else if (a.do === "hide" && a.target) vis.delete(a.target);
      else if (a.target && ["draw", "show", "write", "fill", "mark", "pulse", "spin"].includes(a.do)) vis.add(a.target);
    }
    snaps.push(new Set(vis));
  }
  return snaps;
}

function drawObject(ctx: SKRSContext2D, o: any) {
  const stroke = col(o.stroke, "#1f2a37"), fill = o.fill ? col(o.fill, "#ffffff") : null;
  ctx.lineWidth = o.width ?? 3; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = stroke;
  const paint = (hasFill = true) => { if (fill && hasFill) { ctx.fillStyle = fill; ctx.fill(); } if (o.stroke || !fill) ctx.stroke(); };
  switch (o.kind) {
    case "circle": ctx.beginPath(); ctx.arc(o.cx, o.cy, o.r, 0, Math.PI * 2); paint(); break;
    case "rect": roundRect(ctx, o.x, o.y, o.w, o.h, o.rx ?? 0); paint(); break;
    case "line": ctx.beginPath(); ctx.moveTo(o.x1, o.y1); ctx.lineTo(o.x2, o.y2); ctx.stroke(); break;
    case "arrow": { ctx.beginPath(); ctx.moveTo(o.x1, o.y1); ctx.lineTo(o.x2, o.y2); ctx.stroke(); const a = Math.atan2(o.y2 - o.y1, o.x2 - o.x1), L = 16 + (o.width ?? 3) * 2; ctx.beginPath(); ctx.moveTo(o.x2, o.y2); ctx.lineTo(o.x2 - L * Math.cos(a - 0.45), o.y2 - L * Math.sin(a - 0.45)); ctx.moveTo(o.x2, o.y2); ctx.lineTo(o.x2 - L * Math.cos(a + 0.45), o.y2 - L * Math.sin(a + 0.45)); ctx.stroke(); break; }
    case "sector": { const a0 = ((o.from - 90) * Math.PI) / 180, a1 = ((o.to - 90) * Math.PI) / 180; ctx.beginPath(); ctx.moveTo(o.cx, o.cy); ctx.arc(o.cx, o.cy, o.r, a0, a1 > a0 ? a1 : a1 + Math.PI * 2); ctx.closePath(); paint(); break; }
    case "poly": ctx.beginPath(); o.points.forEach((p: number[], i: number) => (i ? ctx.lineTo(p[0]!, p[1]!) : ctx.moveTo(p[0]!, p[1]!))); ctx.closePath(); paint(); break;
    case "path": { const p = new Path2D(o.d); if (fill) { ctx.fillStyle = fill; ctx.fill(p); } if (o.stroke || !fill) ctx.stroke(p); break; }
    case "text": ctx.fillStyle = col(o.color, "#1f2a37"); ctx.font = `700 ${o.size ?? 28}px ${FONT}`; ctx.textAlign = (o.anchor === "middle" ? "center" : o.anchor === "end" ? "right" : "left"); ctx.fillText(String(o.text), o.x, o.y); ctx.textAlign = "left"; break;
    case "clock": { ctx.beginPath(); ctx.arc(o.cx, o.cy, o.r, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = "#1f2a37"; ctx.lineWidth = 5; ctx.stroke(); for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; ctx.beginPath(); ctx.moveTo(o.cx + Math.sin(a) * o.r * 0.84, o.cy - Math.cos(a) * o.r * 0.84); ctx.lineTo(o.cx + Math.sin(a) * o.r * 0.94, o.cy - Math.cos(a) * o.r * 0.94); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(o.cx, o.cy); ctx.lineTo(o.cx, o.cy - o.r * 0.55); ctx.moveTo(o.cx, o.cy); ctx.lineTo(o.cx + o.r * 0.4, o.cy); ctx.stroke(); break; }
    case "solid": { // a simple, clear 3D-looking solid (the site draws these itself; this is the still-picture version)
      const c = col(o.color, "#4dabf7"), s = o.size, x = o.x, y = o.y; ctx.lineWidth = 3; ctx.strokeStyle = "#1f2a37";
      const shade = (hex: string, k: number) => { const n = parseInt(hex.slice(1), 16); const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
      if (o.shape === "sphere") { const g = ctx.createRadialGradient(x - s * 0.15, y - s * 0.15, s * 0.05, x, y, s * 0.5); g.addColorStop(0, shade(c, 1.35)); g.addColorStop(1, shade(c, 0.7)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      else if (o.shape === "cylinder") { const rx = s * 0.35, ry = s * 0.12, h = s * 0.8; ctx.fillStyle = shade(c, 0.85); ctx.beginPath(); ctx.ellipse(x, y + h / 2, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - rx, y - h / 2, rx * 2, h); ctx.beginPath(); ctx.ellipse(x, y + h / 2, rx, ry, 0, 0, Math.PI); ctx.fill(); ctx.stroke(); ctx.fillStyle = shade(c, 1.2); ctx.beginPath(); ctx.ellipse(x, y - h / 2, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - rx, y - h / 2); ctx.lineTo(x - rx, y + h / 2); ctx.moveTo(x + rx, y - h / 2); ctx.lineTo(x + rx, y + h / 2); ctx.stroke(); }
      else if (o.shape === "cone" || o.shape === "pyramid") { const rx = s * 0.38, h = s * 0.85; ctx.fillStyle = shade(c, 0.9); ctx.beginPath(); ctx.moveTo(x, y - h / 2); ctx.lineTo(x + rx, y + h / 2); ctx.lineTo(x - rx, y + h / 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else { const d = s * 0.22, w = o.shape === "cuboid" ? s * 0.8 : s * 0.6, h = s * 0.6; const x0 = x - w / 2 - d / 2, y0 = y - h / 2 + d / 2; ctx.fillStyle = c; ctx.fillRect(x0, y0, w, h); ctx.strokeRect(x0, y0, w, h); ctx.fillStyle = shade(c, 1.25); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + d, y0 - d); ctx.lineTo(x0 + w + d, y0 - d); ctx.lineTo(x0 + w, y0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = shade(c, 0.75); ctx.beginPath(); ctx.moveTo(x0 + w, y0); ctx.lineTo(x0 + w + d, y0 - d); ctx.lineTo(x0 + w + d, y0 + h - d); ctx.lineTo(x0 + w, y0 + h); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      break;
    }
    case "flow": { ctx.fillStyle = "#1c7ed6"; for (let i = 0; i < (o.count ?? 6); i++) { ctx.beginPath(); ctx.arc(o.x + (o.len * (i + 0.5)) / (o.count ?? 6), o.y, 5, 0, Math.PI * 2); ctx.fill(); } break; }
  }
}
export function drawBoard(ctx: SKRSContext2D, objects: any[], visible: Set<string> | null, x: number, y: number, w: number) {
  const scale = w / 900; ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.beginPath(); ctx.rect(0, 0, 900, 500); ctx.clip(); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 900, 500);
  for (const o of objects) { if (visible && !visible.has(o.id)) continue; ctx.save(); try { drawObject(ctx, o); } catch { /* a shape that cannot be drawn is skipped */ } ctx.restore(); }
  ctx.restore();
}

/* ---------- the still picture (Facebook) ---------- */
export interface ImageOpts { cand: Candidate; board: BoardFile | null; settings: SettingsMap; siteUrl: string }
const pics = (c: Candidate) => { const txt = [c.title, ...c.points, ...c.sentences.slice(0, 3)].join(" "); const seen = new Set<string>(); return picturesFor(txt, 6).filter((p) => (seen.has(p.emoji) ? false : (seen.add(p.emoji), true))).slice(0, 4); };

export function renderImage(o: ImageOpts): Buffer {
  const s = o.settings; const size = parseSize(str(s["social.image.size"], "1080x1350")); const { w, h } = size;
  const cv = createCanvas(w, h); const ctx = cv.getContext("2d");
  const t = background(ctx, size, str(s["social.image.theme"], "bright"));
  const pad = Math.round(w * 0.06), wide = w > h;
  const style = str(s["social.image.style"], "auto");
  const useBoard = !!o.board && style !== "card";
  // top chips: board, class, subject
  let cx = pad; const cy = pad; const cs = Math.round(w * 0.028);
  cx += chip(ctx, cx, cy, boardName(o.cand.board), t, cs) + cs * 0.5;
  if (o.cand.cls > 0) cx += chip(ctx, cx, cy, `Class ${o.cand.cls}`, t, cs) + cs * 0.5;
  chip(ctx, cx, cy, subjectName(o.cand.subject), t, cs);
  ctx.fillStyle = t.ink;
  const titleTop = cy + cs * 1.9 + pad * 0.6;
  const tf = fitText(ctx, o.cand.title, w - 2 * pad, wide ? 2 : 3, Math.round(w * 0.075), Math.round(w * 0.04));
  ctx.font = `800 ${tf.size}px ${FONT}`; ctx.fillStyle = t.ink; tf.lines.forEach((l, i) => ctx.fillText(l, pad, titleTop + tf.size * (i + 1) * 1.08));
  let y = titleTop + tf.size * tf.lines.length * 1.08 + pad * 0.7;
  const footer = Math.round(h * 0.07) + pad * 1.4;
  if (useBoard) {
    const snaps = boardSnapshots(o.board!); let best = 0, bestN = -1; snaps.forEach((v, i) => { if (v.size >= bestN) { bestN = v.size; best = i; } });
    const bw = w - 2 * pad, bh = bw * (500 / 900);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.fillStyle = "#fff"; roundRect(ctx, pad, y, bw, bh, 28); ctx.fill(); ctx.restore();
    ctx.save(); roundRect(ctx, pad, y, bw, bh, 28); ctx.clip(); drawBoard(ctx, o.board!.objects, snaps[best] ?? null, pad, y, bw); ctx.restore();
    y += bh + pad * 0.6;
  } else {
    const ps = o.settings["social.image.showEmoji"] === false ? [] : pics(o.cand);
    if (ps.length) { const es = Math.round(Math.min(w * 0.17, (h - y - footer) * 0.26)); ctx.font = `${es}px ${EMOJI}`; const gap = es * 0.25; const total = ps.length * es + (ps.length - 1) * gap; let ex = (w - total) / 2; for (const p of ps) { ctx.fillText(p.emoji, ex, y + es); ex += es + gap; } y += es * 1.25 + pad * 0.3; }
  }
  // key points
  const room = h - footer - y; const pts = o.cand.points.slice(0, wide ? 2 : 3);
  const ps = Math.max(Math.round(w * 0.034), Math.min(Math.round(w * 0.045), Math.round(room / (pts.length * 2.9 || 1))));
  ctx.textBaseline = "alphabetic";
  for (const p of pts) {
    const f = fitText(ctx, p, w - 2 * pad - ps * 1.6, 3, ps, Math.round(ps * 0.75), "600");
    const blockH = f.lines.length * f.size * 1.3 + ps * 0.5; if (y + blockH > h - footer) break;
    ctx.fillStyle = t.accent; ctx.beginPath(); ctx.arc(pad + ps * 0.4, y + f.size * 0.55, ps * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = t.soft; ctx.font = `600 ${f.size}px ${FONT}`; f.lines.forEach((l, i) => ctx.fillText(l, pad + ps * 1.1, y + f.size * (i + 1) * 1.2)); y += blockH;
  }
  brandBar(ctx, size, s, t, o.siteUrl);
  return cv.toBuffer("image/jpeg", 88);
}

/* ---------- the reel (Instagram): 1080x1920 slides, joined with the voice-over ---------- */
export interface Slide { kind: "board" | "text" | "title" | "outro"; text: string; boardStep?: number; emoji?: string; words: number }
export function reelSlides(c: Candidate, board: BoardFile | null, s: SettingsMap): Slide[] {
  const out: Slide[] = [{ kind: "title", text: c.title, words: 6, emoji: pics(c)[0]?.emoji }];
  if (board) {
    const steps = board.steps; const take = Math.min(steps.length, 10); const idx = Array.from({ length: take }, (_v, i) => Math.round((i * (steps.length - 1)) / Math.max(1, take - 1)));
    for (const i of [...new Set(idx)]) { const n = steps[i]!.narration?.en ?? ""; out.push({ kind: "board", text: n, boardStep: i, words: Math.max(4, n.split(/\s+/).length) }); }
  } else {
    const sents = (c.sentences.length ? c.sentences : c.points).slice(0, 5); const ps = pics(c);
    sents.forEach((t, i) => out.push({ kind: "text", text: t, emoji: ps[(i + 1) % Math.max(1, ps.length)]?.emoji, words: Math.max(4, t.split(/\s+/).length) }));
  }
  out.push({ kind: "outro", text: "Learn the full lesson free", words: 5 });
  return out;
}

function drawSlide(ctx: SKRSContext2D, size: Size, sl: Slide, o: { cand: Candidate; board: BoardFile | null; snaps: Set<string>[]; settings: SettingsMap; siteUrl: string; captions: boolean }) {
  const { w, h } = size; const t = background(ctx, size, str(o.settings["social.image.theme"], "bright")); const pad = Math.round(w * 0.07);
  let cx = pad; const cs = Math.round(w * 0.03);
  cx += chip(ctx, cx, pad, boardName(o.cand.board), t, cs) + cs * 0.5; if (o.cand.cls > 0) cx += chip(ctx, cx, pad, `Class ${o.cand.cls}`, t, cs) + cs * 0.5; chip(ctx, cx, pad, subjectName(o.cand.subject), t, cs);
  const body = (txt: string, top: number, maxLines: number, start: number, weight = "700", color = t.ink) => { const f = fitText(ctx, txt, w - 2 * pad, maxLines, start, Math.round(start * 0.6), weight); ctx.fillStyle = color; ctx.font = `${weight} ${f.size}px ${FONT}`; f.lines.forEach((l, i) => ctx.fillText(l, pad, top + f.size * (i + 1) * 1.15)); return top + f.size * f.lines.length * 1.15; };
  if (sl.kind === "title") { if (sl.emoji) { ctx.font = `${Math.round(w * 0.3)}px ${EMOJI}`; ctx.fillText(sl.emoji, pad, h * 0.38); } body(sl.text, h * 0.45, 5, Math.round(w * 0.1), "800"); }
  else if (sl.kind === "outro") { body("Learn the full lesson free", h * 0.36, 3, Math.round(w * 0.1), "800"); body(o.cand.title, h * 0.56, 3, Math.round(w * 0.05), "600", t.soft); ctx.fillStyle = t.accent; ctx.font = `800 ${Math.round(w * 0.06)}px ${FONT}`; ctx.fillText(o.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""), pad, h * 0.72); }
  else if (sl.kind === "board" && o.board) {
    const bw = w - 2 * pad, bh = bw * (500 / 900), by = h * 0.2;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 28; ctx.shadowOffsetY = 10; ctx.fillStyle = "#fff"; roundRect(ctx, pad, by, bw, bh, 30); ctx.fill(); ctx.restore();
    ctx.save(); roundRect(ctx, pad, by, bw, bh, 30); ctx.clip(); drawBoard(ctx, o.board.objects, o.snaps[sl.boardStep ?? 0] ?? null, pad, by, bw); ctx.restore();
    if (o.captions) body(sl.text, by + bh + pad, 7, Math.round(w * 0.058), "700");
  } else { if (sl.emoji) { ctx.font = `${Math.round(w * 0.26)}px ${EMOJI}`; ctx.fillText(sl.emoji, pad, h * 0.3); } body(sl.text, h * 0.36, 9, Math.round(w * 0.066), "700"); }
  brandBar(ctx, size, o.settings, t, o.siteUrl);
}

const run = (cmd: string, args: string[], timeoutMs = 240000): Promise<{ code: number; err: string }> => new Promise((res) => {
  const p = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"], windowsHide: true }); let err = ""; const to = setTimeout(() => p.kill("SIGKILL"), timeoutMs);
  p.stderr.on("data", (d) => { err = (err + String(d)).slice(-2000); }); p.on("error", (e) => { clearTimeout(to); res({ code: 127, err: String(e.message) }); }); p.on("close", (code) => { clearTimeout(to); res({ code: code ?? 1, err }); });
});
export async function ffmpegAvailable(bin = "ffmpeg"): Promise<boolean> { return (await run(bin, ["-version"], 8000)).code === 0; }

export interface ReelOpts { cand: Candidate; board: BoardFile | null; settings: SettingsMap; siteUrl: string; out: string; audioFiles: string[]; audioMs: number; ffmpeg?: string }
export interface ReelResult { ok: boolean; seconds: number; bytes: number; hasAudio: boolean; error?: string }

/** Draws the slides and joins them (with the voice-over when there is one) into a small H.264 MP4 that Instagram accepts. */
export async function renderReel(o: ReelOpts): Promise<ReelResult> {
  const ff = o.ffmpeg ?? "ffmpeg"; const size = { w: 1080, h: 1920 }; const dir = mkdtempSync(join(tmpdir(), "ss-reel-"));
  try {
    const maxSec = Number(o.settings["social.reel.seconds"] ?? 30); const hasAudio = o.audioFiles.length > 0 && o.audioMs > 0;
    const slides = reelSlides(o.cand, o.board, o.settings);
    const total = Math.max(8, Math.min(maxSec, hasAudio ? o.audioMs / 1000 + 1 : maxSec));
    const wsum = slides.reduce((a, b) => a + b.words, 0); let durs = slides.map((sl) => Math.max(2.2, (sl.words / wsum) * total));
    const scale = total / durs.reduce((a, b) => a + b, 0); durs = durs.map((d) => d * scale);
    const snaps = o.board ? boardSnapshots(o.board) : [];
    const lines: string[] = [];
    slides.forEach((sl, i) => {
      const cv = createCanvas(size.w, size.h); drawSlide(cv.getContext("2d"), size, sl, { cand: o.cand, board: o.board, snaps, settings: o.settings, siteUrl: o.siteUrl, captions: o.settings["social.reel.captions"] !== false });
      const f = join(dir, `s${String(i).padStart(2, "0")}.png`); writeFileSync(f, cv.toBuffer("image/png")); lines.push(`file '${f.replace(/\\/g, "/")}'`, `duration ${durs[i]!.toFixed(3)}`);
    });
    lines.push(`file '${join(dir, `s${String(slides.length - 1).padStart(2, "0")}.png`).replace(/\\/g, "/")}'`);
    writeFileSync(join(dir, "slides.txt"), lines.join("\n"));
    const args = ["-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(dir, "slides.txt")];
    if (hasAudio) { const l = o.audioFiles.map((a) => `file '${a.replace(/\\/g, "/")}'`).join("\n"); writeFileSync(join(dir, "audio.txt"), l); args.push("-f", "concat", "-safe", "0", "-i", join(dir, "audio.txt")); }
    else args.push("-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono");
    const kbps = Math.max(300, Math.floor(((Number(o.settings["social.reel.maxMb"] ?? 12) * 8192) / total) * 0.75) - 96);
    args.push("-map", "0:v", "-map", "1:a", "-t", total.toFixed(2), "-vf", "fps=15,scale=1080:1920,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-maxrate", `${Math.min(kbps, 2500)}k`, "-bufsize", `${Math.min(kbps, 2500) * 2}k`, "-c:a", "aac", "-b:a", "64k", "-ar", "44100", "-ac", "1", "-movflags", "+faststart", "-shortest", o.out);
    const r = await run(ff, args);
    if (r.code !== 0 || !existsSync(o.out)) return { ok: false, seconds: total, bytes: 0, hasAudio, error: r.code === 127 ? "ffmpeg is not installed (needed for reels)" : `ffmpeg failed: ${r.err.slice(-300)}` };
    return { ok: true, seconds: total, bytes: statSync(o.out).size, hasAudio };
  } catch (e) { return { ok: false, seconds: 0, bytes: 0, hasAudio: false, error: e instanceof Error ? e.message : "could not build the reel" }; }
  finally { try { rmSync(dir, { recursive: true, force: true }); } catch { /* temp folder */ } }
}
export { mkdirSync };
