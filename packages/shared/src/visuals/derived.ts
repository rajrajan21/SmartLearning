import { AR, C, clip, draw, L, lines, PA, pulse, R, show, spread, step, T, wrap, write, type Frag, type O } from "./kit.js";

/**
 * Boards built from the lesson's OWN text (its key terms, narration sentences, summary points and dates), never from invented facts.
 * Used when no hand-made topic animation fits. Each one is a "picture of the lesson": a concept map, vocabulary cards, a story arc,
 * a timeline, a sequence or a two-column comparison. Where the lesson does not give enough to fill one honestly, nothing is made.
 */
export interface LessonCtx {
  board: string; classLevel: number; subject: string; chapter: string; topic: string; title: string;
  terms: string[]; sentences: string[]; summary: string[];
}
export interface Derived { id: string; frag: Frag }

const lc = (s: string) => s.toLowerCase();
const has = (s: string, t: string) => lc(s).includes(lc(t));
const nodeW = (t: string) => Math.max(110, Math.min(280, t.length * 13 + 30));
const own = (c: LessonCtx) => lc(`${/^full chapter/.test(c.topic.replace(/-/g, " ")) ? c.chapter : c.topic} ${c.title}`).replace(/[-_]+/g, " ");
const say = (s: string, n = 230) => (s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "").replace(/[,;:]$/, "") + ".");
/** the narration that goes with a step: the lesson's summary points, else its sentences */
const points = (c: LessonCtx, n = 4) => (c.summary.length >= 2 ? c.summary : c.sentences).slice(0, n).map((s) => say(s));

/** a map of the lesson's main terms around its title */
export function conceptWeb(c: LessonCtx): Frag | null {
  const terms = c.terms.filter((t) => t.length <= 22).slice(0, 6), n = terms.length;
  if (n < 3) return null;
  const objs: O[] = [T("ttl", 450, 44, "The big ideas", 34, "accent")];
  const pos = terms.map((t, i): [number, number] => { const a = ((-90 + (360 * i) / n) * Math.PI) / 180, w = nodeW(t); return [Math.max(w / 2 + 12, Math.min(888 - w / 2, 450 + 300 * Math.cos(a))), 275 + 150 * Math.sin(a)]; });
  pos.forEach(([x, y], i) => objs.push(L(`k${i}`, 450, 275, x, y, "soft", 3)));
  objs.push(R("cn", 310, 228, 280, 94, "#E3F2FD", "accent", 4, 18), ...lines("cl", 450, 266, clip(c.title, 38), 23, 22, "ink", "middle", 2, 1.25));
  terms.forEach((t, i) => { const [x, y] = pos[i]!, w = nodeW(t); objs.push(R(`n${i}`, x - w / 2, y - 27, w, 54, "#FFF3D6", "warm", 3, 14), T(`t${i}`, x, y + 9, t, 24, "ink")); });
  const list = terms.length > 1 ? `${terms.slice(0, -1).join(", ")} and ${terms[n - 1]}` : terms[0]!;
  const steps = [step(`Here is a picture of the big ideas in this lesson: ${list}.`, [show("ttl", 0.05), draw("cn", 0.1), write("cl0", 0.15), ...(objs.some((o) => o.id === "cl1") ? [write("cl1", 0.17)] : []), ...terms.flatMap((t, i) => [draw(`k${i}`, spread(n, i, 0.2, 0.9)), draw(`n${i}`, spread(n, i, 0.22, 0.92)), write(`t${i}`, spread(n, i, 0.25, 0.95))])])];
  for (const p of points(c)) {
    const hit = terms.map((t, i) => (has(p, t) ? i : -1)).filter((i) => i >= 0);
    steps.push(step(p, hit.length ? hit.map((i, k) => pulse(`n${i}`, 0.15 + k * 0.2, undefined, "accent")) : [pulse("cn", 0.2, undefined, "accent")]));
  }
  return { title: clip(c.title, 40), objects: objs, steps };
}

/** the short meaning a sentence gives for a term, only when it is short enough to show whole */
function meaningOf(sentence: string, term: string): string | null {
  const i = lc(sentence).indexOf(lc(term)); if (i < 0) return null;
  const rest = sentence.slice(i + term.length);
  const m = rest.match(/^\s*(?:here\s+|in the poem\s+)?(?:means|mean|is|are|refers to|describes)\s+(.+?)(?:[.;]|$)/i);
  if (!m) return null;
  const t = m[1]!.replace(/,\s.*$/, "").trim();
  return t.length >= 4 && t.length <= 56 ? t : null;
}

/** new words as cards: the word, and its meaning when the lesson states one briefly */
export function vocabCards(c: LessonCtx): Frag | null {
  const terms = c.terms.slice(0, 6).filter((t) => t.length <= 22), items = terms.map((t) => { const s = c.sentences.find((x) => has(x, t)); return s ? { t, s, m: meaningOf(s, t) } : null; }).filter(Boolean) as { t: string; s: string; m: string | null }[];
  if (items.length < 3) return null;
  const n = items.length, per = n <= 3 ? n : 3, objs: O[] = [T("ttl", 450, 44, "New words", 34, "accent")];
  items.forEach((it, i) => {
    const row = Math.floor(i / per), col = i % per, inRow = Math.min(per, n - row * per), gap = 840 / inRow, cx = 30 + gap / 2 + col * gap, cw = Math.min(260, gap - 24), y = n <= 3 ? 150 : 90 + row * 190;
    objs.push(R(`c${i}`, cx - cw / 2, y, cw, 160, "#FFF3D6", "warm", 4, 16), T(`w${i}`, cx, y + 58, it.t, it.t.length > 12 ? 26 : 32, "ink"));
    if (it.m) objs.push(...lines(`m${i}x`, cx, y + 100, it.m, 19, Math.floor(cw / 10.5), "warm", "middle", 2));
  });
  const steps = [step("Let us look at the new words, one by one.", [show("ttl", 0.1)])];
  items.forEach((it, i) => steps.push(step(say(it.s), [draw(`c${i}`, 0.1), write(`w${i}`, 0.2), ...objs.filter((o) => o.id.startsWith(`m${i}x`)).map((o) => write(o.id, 0.45))])));
  return { title: "New words", objects: objs, steps };
}

/** a story told on an arc: beginning, middle, end, with the lesson's own sentences and key words */
export function storyArc(c: LessonCtx, poem: boolean, story = true): Frag | null {
  const s = c.sentences; if (s.length < 3) return null;
  const b1 = Math.round(s.length / 3), b2 = Math.round((2 * s.length) / 3), g = [s.slice(0, b1), s.slice(b1, b2), s.slice(b2)];
  const names = poem ? ["First part", "Middle", "Last part"] : ["Beginning", "Middle", "End"], px = [90, 450, 810], py = [385, 130, 385];
  const objs: O[] = [T("ttl", 450, 44, poem ? "The poem, part by part" : story ? "The story arc" : "The text, part by part", 34, "accent"), PA("arc", "M 90 385 C 230 380 320 135 450 130 S 670 380 810 385", "warm", 6)];
  g.forEach((grp, i) => {
    const kw = c.terms.filter((t) => grp.some((x) => has(x, t))).slice(0, 2).join(", ");
    objs.push(C(`p${i}`, px[i]!, py[i]!, 15, "#FF8A65", "warm", 4), T(`n${i}`, px[i]!, i === 1 ? 95 : 440, names[i]!, 28, "accent"));
    if (kw) objs.push(T(`k${i}`, px[i]!, i === 1 ? 190 : 478, clip(kw, 30), 20, "ink"));
  });
  const steps = [step(poem ? "A poem can be read part by part, from the first lines to the last. Let us place this poem on a line." : story ? "Most stories have a beginning, a middle and an end. Let us place this story on an arc." : "A text can be followed from its beginning, through the middle, to its end. Let us place this lesson on a line.", [show("ttl", 0.05), draw("arc", 0.2, undefined, 1800)])];
  g.forEach((grp, i) => { const t = say(grp.slice(0, 2).join(" "), 250); steps.push(step(t, [draw(`p${i}`, 0.1), write(`n${i}`, 0.2), ...(objs.some((o) => o.id === `k${i}`) ? [write(`k${i}`, 0.5)] : [])])); });
  return { title: poem ? "The poem, part by part" : story ? "The story arc" : "The text, part by part", objects: objs, steps };
}

const ERA = /\b(\d{1,4})\s?(BCE|CE|BC|AD)\b/g;
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
type Ev = { y: number; label: string; s: string; who: string };
const SKIP = /^(The|In|It|This|These|They|His|Her|He|She|Its|After|By|When|During|Around|About|At|From|Many|One|Some|Then|There|Their|We|Our|As|With|For|Later|Early)$/;
/** dated events found in the lesson's own sentences */
function datedEvents(c: LessonCtx): Ev[] {
  const ev: Ev[] = [], seen = new Set<string>();
  for (const s of c.sentences) {
    const plain = s.replace(/\(additional[^)]*\)\s*/i, "");
    const found: { y: number; label: string }[] = [];
    for (const m of plain.matchAll(ERA)) { const n = Number(m[1]), bc = /^B/i.test(m[2]!); if (n >= 1) found.push({ y: bc ? -n : n, label: `${n} ${bc ? "BCE" : "CE"}` }); }
    for (const m of plain.matchAll(/\b(1[0-9]{3}|20[0-2][0-9])\b(?!\s?(?:km|kg|cm|m|%|rupees|people|years))/g)) found.push({ y: Number(m[1]), label: m[1]! });
    for (const m of plain.matchAll(/\b(\d{1,2})(?:st|nd|rd|th) century(?:\s?(BCE|CE))?/gi)) { const n = Number(m[1]), bc = !!m[2] && /^B/i.test(m[2]); found.push({ y: (bc ? -1 : 1) * (n * 100 - 50), label: `${ord(n)} century${m[2] ? ` ${m[2].toUpperCase()}` : ""}` }); }
    const f = found[0]; if (!f || seen.has(f.label)) continue;
    const inSentence = c.terms.find((t) => has(plain, t) && t.length <= 24 && !/^\d/.test(t));
    const phrase = (plain.match(/\b[A-Z][a-z]+(?:\s(?:of|the|and|[A-Z][a-z]+)){0,3}\b/g) ?? []).map((w) => w.split(/\s+/)).map((w) => { while (w.length && (SKIP.test(w[0]!) || /^(of|the|and)$/.test(w[0]!))) w.shift(); while (w.length && /^(of|the|and)$/.test(w[w.length - 1]!)) w.pop(); return w.join(" "); }).filter((w) => w.length >= 4).sort((x, y) => y.length - x.length)[0];
    const who = (inSentence && /^[A-Z]/.test(inSentence) ? inSentence : phrase) ?? inSentence;
    if (!who) continue;
    seen.add(f.label); ev.push({ y: f.y, label: f.label, s: plain, who });
  }
  return ev.sort((a, b) => a.y - b.y);
}
export function timelineBoard(c: LessonCtx): Frag | null {
  const ev = datedEvents(c).slice(0, 7), n = ev.length; if (n < 3) return null;
  const gap = 680 / (n - 1), objs: O[] = [T("ttl", 450, 44, "Timeline", 34, "accent"), L("ax", 60, 260, 840, 260, "ink", 6)];
  ev.forEach((e, i) => { const x = 110 + i * gap, up = i % 2 === 0; objs.push(C(`d${i}`, x, 260, 13, "#FF8A65", "warm", 3), L(`s${i}`, x, 260, x, up ? 215 : 305, "soft", 3), T(`w${i}`, x, up ? 195 : 335, e.label, 26, "warm"), ...lines(`t${i}x`, x, up ? 150 : 372, clip(e.who, 28), 21, 16, "ink", "middle", 2)); });
  const steps = [step("A timeline puts events in order, from the oldest on the left to the newest on the right.", [show("ttl", 0.05), draw("ax", 0.3)])];
  ev.forEach((e, i) => steps.push(step(say(e.s), [draw(`d${i}`, 0.1), draw(`s${i}`, 0.15), write(`w${i}`, 0.25), ...objs.filter((o) => o.id.startsWith(`t${i}x`)).map((o) => write(o.id, 0.4))])));
  return { title: "Timeline", objects: objs, steps };
}

/** a short chain of the lesson's terms in the order the lesson reaches them */
export function flowBoard(c: LessonCtx): Frag | null {
  const first = c.terms.filter((t) => t.length <= 20).map((t) => ({ t, at: c.sentences.findIndex((s) => has(s, t)) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at).slice(0, 6);
  if (first.length < 3) return null;
  const n = first.length, per = n <= 3 ? n : Math.ceil(n / 2), objs: O[] = [T("ttl", 450, 44, "Step by step", 34, "accent")];
  const pos = (i: number): [number, number] => { const row = Math.floor(i / per), col = i % per, gap = 840 / per; return [30 + gap / 2 + col * gap, n <= 3 ? 250 : 170 + row * 190]; };
  first.forEach((f, i) => { const [x, y] = pos(i), w = Math.min(240, 840 / per - 50); objs.push(R(`b${i}`, x - w / 2, y - 40, w, 80, "#FFF3D6", "warm", 4, 14), T(`t${i}`, x, y + 9, f.t, f.t.length > 12 ? 22 : 26, "ink"), T(`q${i}`, x - w / 2 + 16, y - 46, String(i + 1), 26, "accent", "middle")); });
  for (let i = 0; i < n - 1; i++) { const [x1, y1] = pos(i), [x2, y2] = pos(i + 1); if (Math.floor(i / per) !== Math.floor((i + 1) / per)) continue; const w = Math.min(240, 840 / per - 50); objs.push(AR(`a${i}`, x1 + w / 2 + 4, y1, x2 - w / 2 - 4, y2, "accent", 5)); }
  const used = new Set<number>(), steps = [step("Let us put the main ideas in order, one after another.", [show("ttl", 0.1)])];
  first.forEach((f, i) => { const sIdx = f.at, txt = !used.has(sIdx) ? say(c.sentences[sIdx]!) : `Next comes ${f.t}.`; used.add(sIdx); steps.push(step(txt, [...(i > 0 && objs.some((o) => o.id === `a${i - 1}`) ? [draw(`a${i - 1}`, 0.1)] : []), draw(`b${i}`, 0.2), write(`t${i}`, 0.3), write(`q${i}`, 0.35)])); });
  return { title: "Step by step", objects: objs, steps };
}

/** two columns, when the lesson compares two named things */
export function compareBoard(c: LessonCtx): Frag | null {
  const m = own(c).replace(/\b(compared|compare|comparison|versus|vs|difference between|differences between)\b/g, "").split(/\band\b|\bvs\b/).map((x) => x.trim()).filter(Boolean);
  const heads = c.terms.filter((t) => m.some((x) => has(x, t) || has(t, x.split(" ").pop() ?? "§"))).slice(0, 2);
  if (heads.length < 2) return null;
  const [a, b] = heads as [string, string], rest = c.terms.filter((t) => t !== a && t !== b).slice(0, 8);
  const side = (t: string) => { const s = c.sentences.filter((x) => has(x, t)); const ha = s.some((x) => has(x, a)), hb = s.some((x) => has(x, b)); return ha && !hb ? 0 : hb && !ha ? 1 : 2; };
  const cols: string[][] = [[], [], []]; rest.forEach((t) => cols[side(t)]!.push(t));
  if (cols[0]!.length + cols[1]!.length < 2) return null;
  const objs: O[] = [T("ttl", 450, 44, "Compare", 34, "accent"), R("ha", 60, 90, 340, 60, "#E3F2FD", "accent", 4, 14), T("hat", 230, 130, clip(a, 22), 28, "accent"), R("hb", 500, 90, 340, 60, "#FFF3D6", "warm", 4, 14), T("hbt", 670, 130, clip(b, 22), 28, "warm"), L("mid", 450, 90, 450, 470, "soft", 3)];
  [0, 1].forEach((k) => cols[k]!.slice(0, 5).forEach((t, i) => objs.push(R(`r${k}${i}`, k ? 520 : 80, 175 + i * 58, 300, 46, "#FFFFFF", k ? "warm" : "accent", 3, 10), T(`rt${k}${i}`, k ? 670 : 230, 207 + i * 58, clip(t, 24), 22, "ink"))));
  if (cols[2]!.length) objs.push(T("bt", 450, 470, `Both: ${clip(cols[2]!.slice(0, 3).join(", "), 60)}`, 20, "good"));
  const steps = [step(`This lesson compares ${a} and ${b}.`, [show("ttl", 0.05), draw("ha", 0.2), write("hat", 0.3), draw("hb", 0.5), write("hbt", 0.6)])];
  [0, 1].forEach((k) => { const items = cols[k]!.slice(0, 5); if (items.length) steps.push(step(`For ${k ? b : a}, the lesson names ${items.length > 1 ? items.slice(0, -1).join(", ") + " and " + items[items.length - 1] : items[0]}.`, items.flatMap((_, i) => [draw(`r${k}${i}`, spread(items.length, i, 0.3, 0.9)), write(`rt${k}${i}`, spread(items.length, i, 0.32, 0.92))]))); });
  const shared = points(c, 2); if (shared[0]) steps.push(step(shared[0], [draw("mid", 0.2), ...(cols[2]!.length ? [write("bt", 0.5)] : [])]));
  return { title: `${clip(a, 14)} and ${clip(b, 14)}`, objects: objs, steps };
}

/** choose the best board the lesson's own text allows */
export function derive(c: LessonCtx): Derived | null {
  const o = own(c), narrative = c.subject === "english" || c.subject === "tamil", lit = c.subject === "english" && c.classLevel >= 8 && !/\b(grammar|tenses|voice|clauses|letter|paragraph|conjunction|vocabulary)\b/.test(o);
  const brief = /\bin brief\b/.test(o) && c.subject === "english", poem = /\b(poem|stanza|poet|verse)\b/.test(lc(`${o} ${c.sentences.slice(0, 2).join(" ")} ${c.terms.join(" ")}`));
  const tries: [string, () => Frag | null, boolean][] = [
    ["d-vocab", () => vocabCards(c), /words and meanings|vocabulary|new words/.test(o)],
    ["d-arc", () => storyArc(c, poem && !/\bstory\b/.test(o), brief || /\bstory\b/.test(o)), brief || lit],
    ["d-compare", () => compareBoard(c), /\b(compared|compare|versus|difference)\b/.test(o)],
    ["d-timeline", () => timelineBoard(c), !narrative],
    ["d-flow", () => flowBoard(c), /\b(process|steps|stages|cycle|method)\b/.test(o) && !narrative],
    ["d-vocab", () => vocabCards(c), narrative && /vocabulary|meanings/.test(o)],
    ["d-web", () => conceptWeb(c), true],
  ];
  for (const [id, make, when] of tries) { if (!when) continue; const f = make(); if (f) return { id, frag: f }; }
  return null;
}
void C;
