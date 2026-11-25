import type { BoardObject, ClassAction } from "./classroom.js";

/**
 * Turns plain explanation/summary sentences into animated vector teaching diagrams
 * (percentage bars, layered stacks, cause->effect flows, A-vs-B comparisons, and
 * key-concept cards) so students never stare at a blank board or a lone unrelated icon.
 */

const short = (t: string, n: number) => (t.length <= n ? t : t.slice(0, n - 1).trimEnd() + "…");
const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

export interface SmartVisualResult {
  objects: BoardObject[];
  actions: ClassAction[];
  kind: "percent-bars" | "layers" | "compare" | "flow" | "concept-card";
}

const FILLS = ["#DDEBFF", "#E2F7E9", "#FFF3D6", "#F3E8FF", "#FFE4E6"];
const STROKES = ["accent", "good", "warm", "ink", "accent"] as const;

/** 1. Percentage / composition bar chart (e.g. "nitrogen, about 78 percent, and oxygen, about 21 percent") */
function tryPercentBars(text: string, id: (p: string) => string): SmartVisualResult | null {
  const items: { label: string; pct: number }[] = [];
  // Match patterns like "nitrogen, about 78 percent", "78% nitrogen", "oxygen (21%)"
  const re1 = /\b([A-Za-z][A-Za-z ]{1,22}?)(?:,?\s+(?:is|are|makes up|about|around|nearly|roughly)?\s+|\s*\()(\d{1,3}(?:\.\d+)?)\s*(?:%|percent|per cent)\b/gi;
  for (const m of text.matchAll(re1)) {
    const pct = Number(m[2]);
    if (pct <= 0 || pct > 100) continue;
    const rawLabel = m[1]!.replace(/^(?:and|of|with|the|a|an|mainly of|made of|contains?|has|have|about)\s+/i, "").trim();
    const label = rawLabel.split(/\s+/).slice(-2).join(" ");
    if (label.length >= 2 && !items.some((x) => x.label.toLowerCase() === label.toLowerCase())) {
      items.push({ label: cap(label), pct });
    }
  }
  const re2 = /\b(\d{1,3}(?:\.\d+)?)\s*(?:%|percent|per cent)\s+(?:of\s+)?([A-Za-z][A-Za-z-]{2,20})\b/gi;
  for (const m of text.matchAll(re2)) {
    const pct = Number(m[1]);
    if (pct <= 0 || pct > 100) continue;
    const label = cap(m[2]!.trim());
    if (!items.some((x) => x.label.toLowerCase() === label.toLowerCase())) {
      items.push({ label, pct });
    }
  }
  if (items.length < 2) return null;

  const shown = items.slice(0, 4);
  const sum = shown.reduce((s, x) => s + x.pct, 0);
  if (sum < 99.5 && sum >= 50 && shown.length < 4) {
    shown.push({ label: "Other", pct: Math.max(1, Math.round((100 - sum) * 10) / 10) });
  }

  const objects: BoardObject[] = [];
  const actions: ClassAction[] = [];
  const titleId = id("sv");
  objects.push({ kind: "text", id: titleId, x: 450, y: 78, text: "Composition (%)", size: 34, color: "accent", anchor: "middle" } as BoardObject);
  actions.push({ do: "write", target: titleId, at: 0.05, ms: 400 });

  const startY = 135;
  const rowH = Math.min(82, Math.floor(310 / shown.length));
  const barX = 270;
  const maxBarW = 500;

  shown.forEach((it, i) => {
    const y = startY + i * rowH;
    const bgId = id("sv");
    const barId = id("sv");
    const lblId = id("sv");
    const pctId = id("sv");
    const w = Math.max(24, Math.round((it.pct / 100) * maxBarW));
    const at = Math.min(0.8, 0.14 + i * 0.2);

    objects.push(
      { kind: "text", id: lblId, x: 250, y: y + 29, text: short(it.label, 16), size: 24, color: "ink", anchor: "end" } as BoardObject,
      { kind: "rect", id: bgId, x: barX, y, w: maxBarW, h: 42, fill: "#F1F5F9", stroke: "soft", width: 2, rx: 10 } as BoardObject,
      { kind: "rect", id: barId, x: barX, y, w, h: 42, fill: FILLS[i % FILLS.length], stroke: STROKES[i % STROKES.length], width: 3, rx: 10 } as BoardObject,
      { kind: "text", id: pctId, x: barX + w + 14, y: y + 29, text: `${it.pct}%`, size: 24, color: STROKES[i % STROKES.length], anchor: "start" } as BoardObject,
    );
    actions.push(
      { do: "write", target: lblId, at, ms: 300 },
      { do: "show", target: bgId, at },
      { do: "draw", target: barId, at: at + 0.04, ms: 650 },
      { do: "write", target: pctId, at: at + 0.1, ms: 300 },
    );
  });

  return { objects, actions, kind: "percent-bars" };
}

/** 2. Layered stack diagram (e.g. "layers: troposphere, stratosphere, mesosphere, thermosphere and exosphere" or "crust, mantle, core") */
function tryLayers(text: string, id: (p: string) => string): SmartVisualResult | null {
  const m = text.match(/\b(?:layers?|zones?|levels?|horizons?|tiers?)\s*(?::|are|include|such as)\s*([^.!?]+)/i);
  let names: string[] = [];
  let title = "Layers";
  if (m) {
    names = m[1]!
      .split(/\s*(?:,| and )\s*/i)
      .map((s) => s.replace(/^(?:the|a|an)\s+/i, "").trim())
      .filter((s) => s.length >= 2 && s.length <= 28 && !/\b(?:which|that|where|called)\b/i.test(s));
    if (/atmosphere/i.test(text)) title = "Layers of the Atmosphere";
    else if (/earth|crust|mantle|core/i.test(text)) title = "Layers of the Earth";
    else if (/soil/i.test(text)) title = "Layers of Soil";
  } else if (/\bcrust\b.*\bmantle\b.*\bcore\b/i.test(text)) {
    title = "Layers of the Earth";
    names = ["Crust", "Mantle", "Core"];
  } else if (/\btroposphere\b.*\bstratosphere\b/i.test(text)) {
    title = "Layers of the Atmosphere";
    names = ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere", "Exosphere"].filter((l) => new RegExp(l, "i").test(text));
  }
  if (names.length < 3 || names.length > 6) return null;

  const objects: BoardObject[] = [];
  const actions: ClassAction[] = [];
  const titleId = id("sv");
  objects.push({ kind: "text", id: titleId, x: 450, y: 66, text: title, size: 32, color: "accent", anchor: "middle" } as BoardObject);
  actions.push({ do: "write", target: titleId, at: 0.05, ms: 400 });

  // Draw bottom-to-top for atmosphere so troposphere is at the bottom!
  const bottomUp = /atmosphere|troposphere/i.test(text);
  const count = names.length;
  const bandH = Math.min(64, Math.floor(350 / count) - 8);
  const gap = 8;
  const totalH = count * (bandH + gap) - gap;
  const topY = 95 + Math.floor((360 - totalH) / 2);

  names.forEach((raw, i) => {
    const slot = bottomUp ? count - 1 - i : i;
    const y = topY + slot * (bandH + gap);
    const boxId = id("sv");
    const txtId = id("sv");
    const at = Math.min(0.82, 0.12 + (i * 0.65) / count);
    objects.push(
      { kind: "rect", id: boxId, x: 150, y, w: 600, h: bandH, fill: FILLS[i % FILLS.length], stroke: STROKES[i % STROKES.length], width: 3, rx: 12 } as BoardObject,
      { kind: "text", id: txtId, x: 450, y: y + Math.round(bandH * 0.63), text: `${i + 1}. ${cap(short(raw, 28))}`, size: 24, color: "ink", anchor: "middle" } as BoardObject,
    );
    actions.push(
      { do: "draw", target: boxId, at, ms: 500 },
      { do: "write", target: txtId, at: at + 0.06, ms: 300 },
    );
  });

  return { objects, actions, kind: "layers" };
}

/** 3. Side-by-side comparison cards (e.g. "called endogenic, and ... called exogenic", "X whereas Y", "X while Y") */
function tryCompare(text: string, id: (p: string) => string): SmartVisualResult | null {
  let left = "", right = "";
  const mCalled = text.match(/\bcalled\s+([A-Za-z][A-Za-z -]{2,22})[,;.]?\s+and\b.*?\bcalled\s+([A-Za-z][A-Za-z -]{2,22})/i);
  if (mCalled) {
    left = mCalled[1]!.trim();
    right = mCalled[2]!.trim();
  } else {
    const mVs = text.match(/^([^.!?]{8,55}?)\s+(?:whereas|while|unlike)\s+([^.!?]{8,55})[.!?]?$/i);
    if (mVs) {
      left = mVs[1]!.trim();
      right = mVs[2]!.trim();
    }
  }
  if (!left || !right) return null;

  const objects: BoardObject[] = [];
  const actions: ClassAction[] = [];
  const b1 = id("sv"), t1 = id("sv"), b2 = id("sv"), t2 = id("sv"), vs = id("sv");
  objects.push(
    { kind: "rect", id: b1, x: 65, y: 150, w: 345, h: 200, fill: "#DDEBFF", stroke: "accent", width: 4, rx: 16 } as BoardObject,
    { kind: "text", id: t1, x: 237, y: 260, text: cap(short(left, 24)), size: 28, color: "ink", anchor: "middle" } as BoardObject,
    { kind: "text", id: vs, x: 450, y: 260, text: "vs", size: 28, color: "warm", anchor: "middle" } as BoardObject,
    { kind: "rect", id: b2, x: 490, y: 150, w: 345, h: 200, fill: "#E2F7E9", stroke: "good", width: 4, rx: 16 } as BoardObject,
    { kind: "text", id: t2, x: 662, y: 260, text: cap(short(right, 24)), size: 28, color: "ink", anchor: "middle" } as BoardObject,
  );
  actions.push(
    { do: "draw", target: b1, at: 0.1, ms: 550 },
    { do: "write", target: t1, at: 0.2, ms: 350 },
    { do: "show", target: vs, at: 0.45 },
    { do: "draw", target: b2, at: 0.5, ms: 550 },
    { do: "write", target: t2, at: 0.6, ms: 350 },
  );
  return { objects, actions, kind: "compare" };
}

/** 4. Process / cause-effect flow (e.g. "A causes B", "A leads to B", "A turns into B") */
function tryFlow(text: string, id: (p: string) => string): SmartVisualResult | null {
  const m = text.match(/([^.!?;:]{4,42}?)\s+\b(causes?|leads? to|turns? into|produces?|forms?|creates?|results? in)\b\s+([^.!?;:]{4,42})/i);
  if (!m) return null;
  const from = m[1]!.replace(/^(?:this|these|it|they|which|that|so|and|then)\s+/i, "").trim();
  const verb = m[2]!.trim().toLowerCase();
  const to = m[3]!.trim();
  if (from.length < 4 || to.length < 4) return null;

  const objects: BoardObject[] = [];
  const actions: ClassAction[] = [];
  const b1 = id("sv"), t1 = id("sv"), ar = id("sv"), vl = id("sv"), b2 = id("sv"), t2 = id("sv");
  objects.push(
    { kind: "rect", id: b1, x: 55, y: 185, w: 310, h: 135, fill: "#DDEBFF", stroke: "accent", width: 4, rx: 16 } as BoardObject,
    { kind: "text", id: t1, x: 210, y: 262, text: cap(short(from, 24)), size: 24, color: "ink", anchor: "middle" } as BoardObject,
    { kind: "arrow", id: ar, x1: 378, y1: 252, x2: 522, y2: 252, stroke: "warm", width: 5 } as BoardObject,
    { kind: "text", id: vl, x: 450, y: 232, text: verb, size: 20, color: "warm", anchor: "middle" } as BoardObject,
    { kind: "rect", id: b2, x: 535, y: 185, w: 310, h: 135, fill: "#E2F7E9", stroke: "good", width: 4, rx: 16 } as BoardObject,
    { kind: "text", id: t2, x: 690, y: 262, text: cap(short(to, 24)), size: 24, color: "ink", anchor: "middle" } as BoardObject,
  );
  actions.push(
    { do: "draw", target: b1, at: 0.1, ms: 500 },
    { do: "write", target: t1, at: 0.2, ms: 350 },
    { do: "draw", target: ar, at: 0.4, ms: 450 },
    { do: "write", target: vl, at: 0.45, ms: 250 },
    { do: "draw", target: b2, at: 0.55, ms: 500 },
    { do: "write", target: t2, at: 0.65, ms: 350 },
  );
  return { objects, actions, kind: "flow" };
}

/** 5. Clean animated Concept Spotlight fallback so explanation steps are never a blank white board */
function conceptCard(text: string, section: string, id: (p: string) => string): SmartVisualResult {
  const clean = text.replace(/\s+/g, " ").trim();
  const clauses = clean
    .split(/(?<=[.!?])\s+|;\s+/)
    .map((s) => s.replace(/[.!?]+$/, "").trim())
    .filter((s) => s.length >= 6)
    .slice(0, 2);

  const heading = section === "Remember" ? "Key Takeaway" : section === "Think" ? "Think About It" : "Key Idea";
  const objects: BoardObject[] = [];
  const actions: ClassAction[] = [];

  const card = id("sv"), badge = id("sv"), rule = id("sv");
  objects.push(
    { kind: "rect", id: card, x: 95, y: 120, w: 710, h: 265, fill: "#F8FAFC", stroke: "accent", width: 4, rx: 20 } as BoardObject,
    { kind: "text", id: badge, x: 450, y: 168, text: heading, size: 24, color: "accent", anchor: "middle" } as BoardObject,
    { kind: "line", id: rule, x1: 280, y1: 186, x2: 620, y2: 186, stroke: "accent", width: 3 } as BoardObject,
  );
  actions.push(
    { do: "draw", target: card, at: 0.05, ms: 500 },
    { do: "write", target: badge, at: 0.12, ms: 300 },
    { do: "draw", target: rule, at: 0.18, ms: 300 },
  );

  // Wrap up to 3 crisp lines inside the concept card
  const body = clauses[0] ?? clean;
  const words = body.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && cur.length + w.length + 1 > 38) {
      lines.push(cur);
      cur = w;
      if (lines.length === 2) break;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  if (cur && lines.length < 3) lines.push(short(cur, 38));

  const startY = lines.length === 1 ? 285 : lines.length === 2 ? 258 : 236;
  lines.forEach((line, i) => {
    const lid = id("sv");
    objects.push({ kind: "text", id: lid, x: 450, y: startY + i * 44, text: line, size: 28, color: "ink", anchor: "middle" } as BoardObject);
    actions.push({ do: "write", target: lid, at: 0.25 + i * 0.18, ms: 400 });
  });

  return { objects, actions, kind: "concept-card" };
}

/**
 * Generates an animated diagram for a spoken sentence when:
 *  - a rich structured visual applies (percentage chart, layers, comparison, cause-effect), OR
 *  - no concrete emoji/math expression was found (concept-card fallback, eliminating blank boards).
 */
export function smartVisualFor(
  text: string,
  section: string,
  hasSimplePic: boolean,
  id: (p: string) => string,
): SmartVisualResult | null {
  // Rich structured diagrams always beat a lone generic emoji (e.g. 78% N / 21% O beats a single water drop!)
  const rich = tryPercentBars(text, id) ?? tryLayers(text, id) ?? tryCompare(text, id);
  if (rich) return rich;
  if (hasSimplePic) return null;
  return tryFlow(text, id) ?? (section === "Learn" || section === "Remember" || section === "Think" ? conceptCard(text, section, id) : null);
}
