export interface MapPoint { x: number; y: number }
/** Places n branches evenly around a centre, starting at the top and going clockwise. */
export function branchPoints(n: number, w: number, h: number, margin = 70): MapPoint[] {
  const cx = w / 2, cy = h / 2, rx = cx - margin, ry = cy - margin / 2;
  return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n); return { x: Math.round(cx + rx * Math.cos(a)), y: Math.round(cy + ry * Math.sin(a)) }; });
}
/** Cuts a long name into at most two short lines for a node label. */
export function wrapLabel(s: string, max = 16): string[] {
  const words = s.trim().split(/\s+/); const lines: string[] = []; let cur = "";
  for (const w of words) { if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; }
  if (cur) lines.push(cur);
  if (lines.length > 2) { const keep = lines.slice(0, 2); keep[1] = keep[1]!.slice(0, Math.max(1, max - 1)) + "…"; return keep; }
  return lines;
}
