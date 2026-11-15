/**
 * Turns the loose pieces of text that pdf.js finds on a page into sentences, each with the boxes it covers on
 * the page, so read aloud can highlight exactly what is being spoken. Pure functions: no pdf.js, no DOM.
 */

/** one piece of text as pdf.js reports it (getTextContent().items) */
export interface PdfTextItem { str: string; transform: number[]; width: number; height: number; hasEOL?: boolean }
/** a piece of text placed on the page in page fractions (0..1, top-left origin) */
export interface Run { str: string; x: number; y: number; w: number; h: number; eol?: boolean }
/** [left, top, width, height] in page fractions */
export type Box = [number, number, number, number];
export interface Sentence { t: string; r: Box[] }

const mul = (a: number[], b: number[]) => [
  a[0]! * b[0]! + a[2]! * b[1]!, a[1]! * b[0]! + a[3]! * b[1]!,
  a[0]! * b[2]! + a[2]! * b[3]!, a[1]! * b[2]! + a[3]! * b[3]!,
  a[0]! * b[4]! + a[2]! * b[5]! + a[4]!, a[1]! * b[4]! + a[3]! * b[5]! + a[5]!,
];

/**
 * Place pdf.js text items on the page. `viewportTransform` is page.getViewport({ scale: 1 }).transform
 * (it flips the y axis and applies page rotation); width/height are that viewport's size.
 */
export function itemsToRuns(items: PdfTextItem[], viewportTransform: number[], width: number, height: number): Run[] {
  const out: Run[] = [];
  if (!(width > 0) || !(height > 0)) return out;
  for (const it of items) {
    if (!it || typeof it.str !== "string" || !Array.isArray(it.transform) || it.transform.length < 6) continue;
    const m = mul(viewportTransform, it.transform);
    const fh = Math.hypot(m[2]!, m[3]!) || it.height || 0; // font height on the page
    if (!(fh > 0)) { if (it.hasEOL && out.length) out[out.length - 1]!.eol = true; continue; }
    const upright = Math.abs(m[1]!) < Math.abs(m[0]!) * 0.2; // sideways text is spoken but never highlighted
    const w = Math.abs(it.width) * (Math.hypot(viewportTransform[0]!, viewportTransform[1]!) || 1);
    out.push({
      str: it.str,
      x: m[4]! / width,
      y: (m[5]! - fh * 0.82) / height,
      w: upright ? w / width : 0,
      h: (fh * 1.08) / height,
      eol: it.hasEOL === true,
    });
  }
  return out;
}

/** words that end with a full stop without ending the sentence */
const ABBREV = new Set(["mr", "mrs", "ms", "dr", "st", "sr", "jr", "prof", "no", "nos", "rs", "vs", "fig", "eg", "ie", "etc", "smt", "shri", "sri", "thiru", "tmt", "approx", "dept", "govt", "vol", "pp", "ch", "ex", "viz"]);
const END = /[.!?।॥]/;
const CLOSERS = /["'”’)\]»]/;
const hasWord = (s: string) => /[\p{L}\p{N}]/u.test(s);

interface Piece { text: string; run: number; from: number; to: number } // a slice of one run that belongs to the sentence

/** Is the full stop at `i` in `text` really the end of a sentence? */
function endsSentence(text: string, i: number): boolean {
  const ch = text[i]!;
  let j = i + 1;
  while (j < text.length && (END.test(text[j]!) || CLOSERS.test(text[j]!))) j++; // "?!", ..." and closing quotes stay with the sentence
  if (j < text.length && !/\s/.test(text[j]!)) return false; // 3.5, www.site.in, a.m.
  if (ch !== ".") return true;
  let k = i;
  while (k > 0 && text[k - 1] === ".") k--; // "..." counts as one stop
  const before = /([\p{L}\p{N}]+)$/u.exec(text.slice(0, k))?.[1] ?? "";
  if (before === "" && k === i) return true;
  if (k === i && ABBREV.has(before.toLowerCase())) return false;
  if (k === i && /^\p{Lu}$/u.test(before)) return false; // an initial: A. P. J. Abdul Kalam
  const rest = text.slice(j).trimStart();
  if (rest === "") return true;
  if (/^\p{Ll}/u.test(rest)) return false; // "approx. five" : next word starts small, so the sentence goes on
  return true;
}

/** Long sentences are cut at a comma so one spoken piece never runs too long for the device voice. */
function softBreaks(text: string, max: number): number[] {
  const cuts: number[] = [];
  let start = 0;
  while (text.length - start > max) {
    const windowEnd = start + max;
    let cut = -1;
    for (let k = windowEnd; k > start + max * 0.4; k--) if (/[,;:]/.test(text[k - 1]!) && /\s/.test(text[k] ?? "")) { cut = k; break; }
    if (cut < 0) for (let k = windowEnd; k > start + max * 0.4; k--) if (/\s/.test(text[k]!)) { cut = k; break; }
    if (cut < 0) break;
    cuts.push(cut);
    start = cut;
  }
  return cuts;
}

export interface GroupOptions { /** longest spoken piece, in characters (default 240) */ maxChars?: number }

/** Group placed runs (in reading order) into sentences with highlight boxes. */
export function groupSentences(runs: Run[], opts: GroupOptions = {}): Sentence[] {
  const maxChars = opts.maxChars ?? 240;
  // 1. one long string for the page, remembering which run every character came from; "\n" marks a hard break
  let text = "";
  const owner: number[] = []; // run index per character, -1 for glue (spaces and breaks we added)
  const offset: number[] = []; // character position inside its run
  const add = (s: string, run: number) => { for (let k = 0; k < s.length; k++) { owner.push(run); offset.push(k); } text += s; };
  let prev: Run | null = null;
  runs.forEach((r, idx) => {
    const str = r.str.replace(/\s+/g, " ");
    if (prev) {
      const sameLine = Math.abs(r.y - prev.y) < Math.max(prev.h, r.h) * 0.6 && !prev.eol;
      if (sameLine) {
        const gap = r.x - (prev.x + prev.w);
        if (gap > Math.max(prev.h, r.h) * 2.5) add("\n", -1); // a wide jump on the same line: another column or table cell
        else if ((gap > prev.h * 0.12 || prev.w === 0) && !/\s$/.test(text) && !/^\s/.test(str)) add(" ", -1);
      } else {
        const lineGap = r.y - (prev.y + prev.h);
        const sizeJump = r.h > 0 && prev.h > 0 && (r.h / prev.h > 1.25 || prev.h / r.h > 1.25);
        const newBlock = lineGap > Math.max(prev.h, r.h) * 1.3 || lineGap < -Math.max(prev.h, r.h) * 2.2 || sizeJump;
        if (newBlock) add("\n", -1); // heading, new paragraph, new column: never glue across it
        else if (/[\p{L}]-$/u.test(text) && /^\p{Ll}/u.test(str)) { text = text.slice(0, -1); owner.pop(); offset.pop(); } // "num-" + "ber" at a line end
        else if (!/\s$/.test(text)) add(" ", -1);
      }
    }
    if (str.trim() !== "" || str === " ") add(str, idx);
    if (str.trim() !== "") prev = r;
    else if (prev && r.eol) prev = { ...prev, eol: true };
  });

  // 2. cut into sentences
  const spans: [number, number][] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch === "\n") { spans.push([start, i]); start = i + 1; continue; }
    if (END.test(ch) && endsSentence(text, i)) {
      let j = i + 1;
      while (j < text.length && (END.test(text[j]!) || CLOSERS.test(text[j]!))) j++;
      spans.push([start, j]); start = j; i = j - 1;
    }
  }
  spans.push([start, text.length]);

  // 3. text + boxes for each sentence
  const out: Sentence[] = [];
  const emit = (a: number, b: number) => {
    while (a < b && /\s/.test(text[a]!)) a++;
    while (b > a && /\s/.test(text[b - 1]!)) b--;
    const t = text.slice(a, b).replace(/\s+/g, " ");
    if (!hasWord(t)) return;
    if (/^\d{1,4}$/.test(t)) return; // a lone page number
    const pieces: Piece[] = [];
    for (let k = a; k < b; k++) {
      const run = owner[k]!;
      if (run < 0) continue;
      const last = pieces[pieces.length - 1];
      if (last && last.run === run && last.to === offset[k]!) last.to = offset[k]! + 1;
      else pieces.push({ text: "", run, from: offset[k]!, to: offset[k]! + 1 });
    }
    const boxes: Box[] = [];
    for (const p of pieces) {
      const r = runs[p.run]!;
      const len = r.str.replace(/\s+/g, " ").length || 1;
      if (!(r.w > 0) || !(r.h > 0)) continue;
      const x = r.x + (r.w * p.from) / len, w = (r.w * (p.to - p.from)) / len;
      const lastBox = boxes[boxes.length - 1];
      // pieces on the same line join into one box
      if (lastBox && Math.abs(lastBox[1] - r.y) < r.h * 0.5 && x - (lastBox[0] + lastBox[2]) < r.h * 1.5 && x >= lastBox[0] - r.h * 0.5) {
        const right = Math.max(lastBox[0] + lastBox[2], x + w), top = Math.min(lastBox[1], r.y), bottom = Math.max(lastBox[1] + lastBox[3], r.y + r.h);
        lastBox[2] = right - lastBox[0]; lastBox[1] = top; lastBox[3] = bottom - top;
      } else boxes.push([x, r.y, w, r.h]);
    }
    const clean = boxes
      .map(([x, y, w, h]): Box => { const pad = h * 0.18; const x0 = Math.max(0, x - pad), y0 = Math.max(0, y); return [x0, y0, Math.min(1 - x0, w + pad * 2), Math.min(1 - y0, h)]; })
      .filter((bx) => bx[2] > 0.002 && bx[3] > 0.002 && bx[0] < 1 && bx[1] < 1);
    out.push({ t, r: clean.map((bx) => bx.map((v) => Math.round(v * 10000) / 10000) as Box) });
  };
  for (const [a0, b0] of spans) {
    let a = a0;
    const body = text.slice(a0, b0);
    if (body.length > maxChars) for (const c of softBreaks(body, maxChars)) { emit(a, a0 + c); a = a0 + c; }
    emit(a, b0);
  }
  return out;
}

/** pdf.js items straight to sentences */
export function pageSentences(items: PdfTextItem[], viewportTransform: number[], width: number, height: number, opts?: GroupOptions): Sentence[] {
  return groupSentences(itemsToRuns(items, viewportTransform, width, height), opts);
}
