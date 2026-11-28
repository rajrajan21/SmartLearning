import { useEffect, useRef } from "react";
import type { LabId } from "./virtualLabData";

type Props = { kind: LabId; preview?: boolean; paused?: boolean; ac?: boolean; primary?: number; secondary?: number; volts?: number; input?: number; color?: string; tilt?: number };
const W = 640, H = 390;

export function LabScene({ kind, preview = false, paused = false, ac = true, primary = 4, secondary = 6, volts = 15, input = 10, color = "#55d6cf", tilt = 0 }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const phase = useRef(0);
  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let before = 0;
    const draw = (now: number) => {
      if (before && !paused && !preview && !mq?.matches) phase.current += Math.min(35, now - before) / 1000;
      before = now;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b1d2b"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#183447"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 24) line(ctx, x, 0, x, H);
      for (let y = 0; y < H; y += 24) line(ctx, 0, y, W, y);
      if (kind === "transformer") drawTransformer(ctx, { ac, primary, secondary, volts, input }, phase.current);
      else drawIndicator(ctx, color, tilt, phase.current);
      if (!preview && !paused && !mq?.matches) frame = requestAnimationFrame(draw);
    };
    const restart = () => { cancelAnimationFrame(frame); before = 0; draw(0); };
    restart();
    mq?.addEventListener("change", restart);
    return () => { cancelAnimationFrame(frame); mq?.removeEventListener("change", restart); };
  }, [kind, preview, paused, ac, primary, secondary, volts, input, color, tilt]);
  return <canvas ref={canvas} width={W} height={H} className="vl-canvas" aria-hidden="true" />;
}
function line(c: CanvasRenderingContext2D, x: number, y: number, endX: number, endY: number) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(endX, endY); c.stroke();
}
function tag(c: CanvasRenderingContext2D, value: string, x: number, y: number, color = "#d2e9f1") {
  c.fillStyle = color; c.font = "600 17px system-ui"; c.textAlign = "center"; c.fillText(value, x, y);
}
function drawTransformer(c: CanvasRenderingContext2D, p: { ac: boolean; primary: number; secondary: number; volts: number; input: number }, t: number) {
  const flux = Math.sin(t * 4);
  c.lineWidth = 18; c.strokeStyle = "#677d8e"; c.strokeRect(205, 77, 230, 187);
  c.lineWidth = 2; c.strokeStyle = "#afc6d5"; c.strokeRect(197, 69, 246, 203);
  c.strokeStyle = p.ac ? "rgba(75,218,255," + (0.35 + Math.abs(flux) * 0.58) + ")" : "#49657c";
  c.lineWidth = 3; c.setLineDash([11, 10]); c.lineDashOffset = p.ac ? -flux * 20 : 0;
  c.strokeRect(221, 91, 198, 160); c.setLineDash([]);
  for (const side of [{ x: 205, n: p.primary, side: -1, name: "Primary" }, { x: 435, n: p.secondary, side: 1, name: "Secondary" }]) {
    const outer = side.x + side.side * 105;
    c.lineWidth = 5; c.strokeStyle = "#b36c43";
    c.beginPath(); c.moveTo(side.x, 116); c.lineTo(outer, 116); c.lineTo(outer, 218); c.lineTo(side.x, 218); c.stroke();
    for (let i = 0; i < side.n; i++) {
      c.strokeStyle = i % 2 ? "#f68a4a" : "#ffd19b";
      c.lineWidth = 4; c.beginPath(); c.ellipse(side.x, 116 + (i + 0.5) * 102 / side.n, 26, 6, -0.18, 0, Math.PI * 2); c.stroke();
    }
    const moving = p.ac || side.side < 0;
    if (moving) {
      c.fillStyle = "#83f0ed"; c.shadowColor = "#38d9ff"; c.shadowBlur = 12;
      for (let n = 0; n < 4; n++) {
        const offset = p.ac ? (flux + 1) * 16 : (t * 22) % 26;
        c.beginPath(); c.arc(outer, 120 + (n * 24 + offset) % 92, 3, 0, Math.PI * 2); c.fill();
      }
      c.shadowBlur = 0;
    }
    tag(c, side.name + " Â· " + side.n + " turns", side.x, 48);
  }
  tag(c, p.ac ? "Changing magnetic field" : "Steady field after switching", 320, 176, "#86e6ed");
  for (const meter of [{ x: 54, label: "Input", v: p.input, color: "#ffbe86" }, { x: 350, label: "Output", v: p.volts, color: "#73e6e2" }]) {
    c.strokeStyle = "#436175"; c.lineWidth = 1; line(c, meter.x, 340, meter.x + 235, 340);
    c.strokeStyle = meter.color; c.lineWidth = 2.5; c.beginPath();
    const scale = Math.max(20, p.input, p.volts);
    for (let i = 0; i <= 235; i++) {
      const y = 340 - (p.ac ? Math.sin(i / 22 - t * 4) : 1) * (meter.v / scale) * 28;
      if (i === 0) c.moveTo(meter.x, y); else c.lineTo(meter.x + i, y);
    }
    c.stroke(); tag(c, meter.label, meter.x + 118, 311, meter.color);
  }
}
function drawIndicator(c: CanvasRenderingContext2D, color: string, tilt: number, t: number) {
  c.save(); c.translate(320, 188); c.rotate(tilt);
  c.beginPath(); c.moveTo(-100, -128); c.lineTo(-81, 125); c.quadraticCurveTo(0, 145, 81, 125); c.lineTo(100, -128);
  c.save(); c.clip();
  const dy = -8 + Math.sin(t * 2) * 6;
  c.fillStyle = color; c.globalAlpha = 0.72;
  c.beginPath(); c.moveTo(-110, dy); c.quadraticCurveTo(0, dy - tilt * 160, 110, dy + 7); c.lineTo(110, 151); c.lineTo(-110, 151); c.closePath(); c.fill();
  c.globalAlpha = 0.65; c.fillStyle = "#fff";
  for (let i = 0; i < 35; i++) {
    const x = (i * 37) % 155 - 77 + Math.sin(i + t) * 6;
    const y = 126 - ((i * 27 + t * (8 + i % 3)) % 125);
    c.beginPath(); c.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2); c.fill();
  }
  c.restore();
  c.beginPath(); c.moveTo(-100, -128); c.lineTo(-81, 125); c.quadraticCurveTo(0, 145, 81, 125); c.lineTo(100, -128);
  c.strokeStyle = "#a8dfed"; c.lineWidth = 4; c.stroke();
  c.fillStyle = "#588695"; c.globalAlpha = 0.35; c.fillRect(-72, -97, 8, 206); c.globalAlpha = 1;
  c.strokeStyle = "#bad7e5"; c.lineWidth = 2;
  for (let i = 0; i < 5; i++) line(c, 54, -65 + i * 34, 73, -65 + i * 34);
  c.beginPath(); c.ellipse(0, -128, 100, 12, 0, 0, Math.PI * 2); c.stroke();
  c.restore();
  const colors = ["#ff776b", "#ffb646", "#e4d55a", "#56d8a9", "#50bde1", "#a69aff", "#d287e9"];
  colors.forEach((v, i) => { c.fillStyle = v; c.fillRect(96 + 64 * i, 350, 64, 10); });
  tag(c, "ACIDIC", 152, 379); tag(c, "NEUTRAL", 320, 379); tag(c, "BASIC", 486, 379);
}
