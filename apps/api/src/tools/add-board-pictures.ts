// Adds relevant pictures (emoji) to hand-made classroom boards, only into empty space and only when the teacher names the thing.
// People and story characters are never added (the shared builder shows those only briefly, hand boards simply skip them).
// Usage: npx tsx src/tools/add-board-pictures.ts [file-fragment ...]   (default: every class 3 and class 6 maths board)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { picturesFor, SHAPES } from "@studysmart/shared";
import { classroomDir } from "../server-paths.js";

const PEOPLE = new Set(["cube", "cuboid", "cylinder", "cone", "sphere", "pyramid", "plate", "bag", "dice", "clock", "boy", "girl", "child", "children", "kid", "man", "woman", "mother", "mom", "father", "dad", "baby", "grandmother", "grandfather", "teacher", "friend", "king", "queen"]);
type Box = [number, number, number, number];
const box = (o: any): Box | null => {
  switch (o.kind) {
    case "rect": return [o.x, o.y, o.x + o.w, o.y + o.h];
    case "circle": case "sector": return [o.cx - o.r, o.cy - o.r, o.cx + o.r, o.cy + o.r];
    case "clock": return [o.cx - o.r, o.cy - o.r, o.cx + o.r, o.cy + o.r];
    case "line": case "arrow": return [Math.min(o.x1, o.x2), Math.min(o.y1, o.y2), Math.max(o.x1, o.x2), Math.max(o.y1, o.y2)];
    case "poly": { const xs = o.points.map((p: number[]) => p[0]), ys = o.points.map((p: number[]) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
    case "text": { const s = o.size ?? 28, w = o.text.length * s * 0.6, h = s * 1.2; const x0 = o.anchor === "middle" ? o.x - w / 2 : o.anchor === "end" ? o.x - w : o.x; return [x0, o.y - s, x0 + w, o.y - s + h]; }
    case "solid": return [o.x - o.size / 2, o.y - o.size / 2, o.x + o.size / 2, o.y + o.size / 2];
    default: return null; // path/flow: cannot measure, so this board is skipped
  }
};
const hit = (a: Box, b: Box, m = 10) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;

const frags = process.argv.slice(2);
const files = readdirSync(classroomDir).filter((f) => f.endsWith(".json") && (frags.length ? frags.some((x) => f.includes(x)) : /^cbse-(3|6)-maths-/.test(f)));
for (const f of files) {
  const p = join(classroomDir, f); const d = JSON.parse(readFileSync(p, "utf8"));
  if (d.objects.some((o: any) => o.id.startsWith("pic"))) { console.log("skip (already has pictures):", f); continue; }
  const boxes: Box[] = []; let unknown = false;
  for (const o of d.objects) { const b = box(o); if (b) boxes.push(b); else unknown = true; }
  if (unknown) { console.log("skip (has freehand paths):", f); continue; }
  const S = 64, shown = new Set<string>(); let added = 0;
  const free = (): Box | null => {
    for (const x of [820, 20, 740, 100, 660, 180, 580]) for (let y = 20; y <= 420; y += 40) { const c: Box = [x, y, x + S, y + S]; if (!boxes.some((b) => hit(c, b))) return c; }
    return null;
  };
  for (const s of d.steps) {
    const narr: string = s.narration.en;
    const pic = picturesFor(narr, 3).find((q) => !SHAPES.has(q.word) && !PEOPLE.has(q.word) && !shown.has(q.word) && q.at && narr.toLowerCase().includes(q.at.toLowerCase()));
    if (!pic) continue;
    const c = free(); if (!c) continue;
    const id = `pic${added + 1}`; boxes.push(c); shown.add(pic.word); added++;
    d.objects.push({ kind: "text", id, x: c[0] + S / 2, y: c[1] + S * 0.8, text: pic.emoji, size: 56, anchor: "middle" });
    s.actions.push({ do: "write", target: id, on: pic.at, ms: 350 });
  }
  if (added) writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(`${f}: ${added} picture(s)`);
}
