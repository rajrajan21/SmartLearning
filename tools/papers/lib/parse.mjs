// Turns the text of a question-paper PDF (and its marking scheme) into structured questions. Pure functions, no network.
const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12 };

export function cleanText(raw) {
  const pages = raw.replace(/\r/g, "").split("\f").filter((p) => p.trim());
  // drop running headers/footers: lines repeated on most pages
  const counts = new Map();
  if (pages.length >= 2) for (const p of pages) for (const l of new Set(p.split("\n").map((x) => x.trim()).filter(Boolean))) counts.set(l, (counts.get(l) ?? 0) + 1);
  const junk = (l) => /^(page\s*\d+(\s*(of|\/)\s*\d+)?|\d+\s*\|\s*p\s*a\s*g\s*e|p\.?\s*t\.?\s*o\.?|-?\s*\d+\s*-?)$/i.test(l) || /^\[?type here\]?$/i.test(l);
  const out = [];
  for (const p of pages) for (const line of p.split("\n")) {
    const t = line.trim();
    if (!t) { out.push(""); continue; }
    if (junk(t)) continue;
    if (pages.length >= 2 && t.length < 90 && (counts.get(t) ?? 0) >= (pages.length === 2 ? 2 : Math.max(3, Math.ceil(pages.length * 0.6)))) continue;
    out.push(line.replace(/\s+$/, ""));
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

const SECTION = /^\s*(SECTION|Section|PART|Part)\s*[-–:.]?\s*([A-E]|I{1,3}|IV|V)\s*(?:[-–:.]\s*(.*))?$/;
const QSTART = /^\s*(?:Q\.?\s*)?(\d{1,3})\s*[.)]\s+(?=\S)/;
const OPTSTART = /^\s*\(?([a-dA-D])[.)]\s+(?=\S)/;

function marksOf(text) {
  const m = text.match(/[\[(]\s*(\d+(?:\.\d+)?)\s*(?:marks?|m)?\s*[\])]\s*$/i) ?? text.match(/\s{3,}(\d{1,2})\s*$/);
  return m ? Number(m[1]) : undefined;
}
function stripMarks(text) {
  return text.replace(/[\[(]\s*\d+(?:\.\d+)?\s*(?:marks?|m)?\s*[\])]\s*$/i, "").replace(/\s{3,}\d{1,2}\s*$/, "").trim();
}
/** "(a) x (b) y (c) z (d) w" on one line, or one option per line */
export function splitOptions(block) {
  const lines = block.split("\n");
  const opts = []; let stem = []; let cur = null;
  for (const l of lines) {
    const inline = [...l.matchAll(/(?:^|\s)\(([a-dA-D])\)\s+/g)];
    if (inline.length >= 2 || (inline.length === 1 && OPTSTART.test(l) && false)) {
      const idxs = inline.map((m) => ({ k: m[1].toUpperCase(), at: m.index + m[0].length, start: m.index }));
      if (!cur) stem.push(l.slice(0, idxs[0].start)); else cur.t += " " + l.slice(0, idxs[0].start).trim();
      idxs.forEach((x, i) => opts.push({ k: x.k, t: l.slice(x.at, i + 1 < idxs.length ? idxs[i + 1].start : undefined).trim() }));
      cur = opts[opts.length - 1]; continue;
    }
    const o = l.match(OPTSTART);
    if (o) { cur = { k: o[1].toUpperCase(), t: l.replace(OPTSTART, "").trim() }; opts.push(cur); continue; }
    if (cur && l.trim()) { cur.t += " " + l.trim(); continue; }
    stem.push(l);
  }
  // keep only a clean A, B, C, D... run
  const run = []; for (const o of opts) { if (o.k === String.fromCharCode(65 + run.length)) run.push(o); }
  return run.length >= 2 ? { stem: stem.join("\n"), options: run.map((o) => o.t.replace(/\s+/g, " ").slice(0, 600)) } : { stem: block, options: [] };
}

function sectionMarksHint(s) {
  const t = s.toLowerCase();
  let m = t.match(/(\d+(?:\.\d+)?)\s*(?:mark|marks)\s*each/) ?? t.match(/carr(?:y|ies)\s*(\d+(?:\.\d+)?)\s*marks?/) ?? t.match(/(\d+)\s*[x×]\s*\d+\s*=\s*\d+/);
  return m ? Number(m[1]) : undefined;
}
const guessType = (q, sectionTitle) => {
  if (q.options.length >= 2) return "mcq";
  if (/\btrue\s+or\s+false\b|\bstate\s+whether.*\b(true|false)\b/i.test(q.text)) return "tf";
  if (/_{3,}|\.{4,}|…{2,}/.test(q.text)) return "fill";
  if ((q.marks ?? 0) >= 4 || /long|essay|detail/i.test(sectionTitle)) return "long";
  return "short";
};

/** @returns {{ sections: {title:string, instructions?:string, questions:any[]}[], meta:{maxMarks?:number, minutes?:number} }} */
export function parsePaper(raw) {
  const text = cleanText(raw);
  const lines = text.split("\n");
  const meta = {};
  const mm = text.match(/maximum\s*marks\s*[:\-–]?\s*(\d{1,3})/i) ?? text.match(/max\.?\s*marks\s*[:\-–]?\s*(\d{1,3})/i) ?? text.match(/total\s*marks\s*[:\-–]?\s*(\d{1,3})/i);
  if (mm) meta.maxMarks = Number(mm[1]);
  const tm = text.match(/time\s*(?:allowed)?\s*[:\-–]?\s*(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)/i);
  if (tm) meta.minutes = /h/i.test(tm[2]) ? Math.round(Number(tm[1]) * 60) : Number(tm[1]);

  const sections = [];
  let sec = { title: "Questions", instructions: [], blocks: [], pre: true };
  let pre = []; let curQ = null; let last = 0;
  const flushQ = () => { if (curQ) { sec.blocks.push(curQ); curQ = null; } };
  const pushSec = () => { flushQ(); if (sec.blocks.length) sections.push(sec); };
  for (const line of lines) {
    const s = line.match(SECTION);
    if (s && line.trim().length < 140) {
      if (sec.pre && !sections.length) { flushQ(); for (const b of sec.blocks) pre.push(`${b.n}. ${b.lines.join(" ").trim()}`); sec.blocks = []; last = 0; }
      pushSec(); sec = { title: `${/^part/i.test(s[1]) ? "Part" : "Section"} ${s[2].toUpperCase()}${s[3] ? " – " + s[3].trim() : ""}`, instructions: [], blocks: [] }; continue; }
    const q = line.match(QSTART);
    const n = q ? Number(q[1]) : 0;
    // a new question: number follows the previous one (or restarts at 1 for a new section), and the line is not an option/sub-point
    if (q && (n === last + 1 || (n === 1 && sec.blocks.length === 0 && !curQ) || (n > last && n <= last + 3 && !OPTSTART.test(line)))) {
      flushQ(); curQ = { n: String(n), lines: [line.replace(QSTART, "")] }; last = n; continue;
    }
    if (curQ) curQ.lines.push(line); else if (line.trim()) (sections.length || sec.blocks.length ? sec.instructions : pre).push(line.trim());
  }
  pushSec();
  if (!sections.length) return { sections: [], meta };
  if (pre.length) sections[0].instructions = [...pre.slice(-12), ...sections[0].instructions];

  const out = sections.map((s) => {
    const hint = sectionMarksHint(s.instructions.join(" ") + " " + s.title);
    return {
      title: s.title.slice(0, 200),
      ...(s.instructions.length ? { instructions: s.instructions.join(" ").replace(/\s+/g, " ").slice(0, 1200) } : {}),
      questions: s.blocks.map((b) => {
        const raw = b.lines.join("\n").replace(/\n{2,}/g, "\n").trim();
        const { stem, options } = splitOptions(raw);
        const marks = marksOf(stem.trim().split("\n").pop() ?? "") ?? marksOf(stem.trim()) ?? hint;
        const textOut = stripMarks(stem.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim()).slice(0, 4000);
        const q = { n: b.n, text: textOut, ...(marks !== undefined ? { marks } : {}), options };
        const type = guessType(q, s.title);
        return { n: q.n, text: q.text || "(see paper)", ...(q.marks !== undefined ? { marks: q.marks } : {}), type, ...(options.length ? { options } : {}) };
      }).filter((q) => q.text.length > 1),
    };
  }).filter((s) => s.questions.length);
  return { sections: out, meta };
}

/** Marking scheme / answer key text -> { answers: {n: "B"}, models: {n: "text"} } (numbers as in the paper) */
export function parseKey(raw) {
  const text = cleanText(raw); const answers = {}; const models = {};
  let cur = null; let last = 0;
  const put = () => { if (cur) { const t = cur.lines.join(" ").replace(/\s+/g, " ").replace(/\s+\d{1,2}$/, "").trim(); if (t && !(cur.n in models) && t.length > 1) models[cur.n] = t.slice(0, 3000); cur = null; } };
  for (const line of text.split("\n")) {
    const q = line.match(/^\s*(?:Q\.?\s*)?(\d{1,3})\s*[.)\-:]?\s+(.*)$/);
    if (q && (Number(q[1]) === last + 1 || (Number(q[1]) > last && Number(q[1]) <= last + 3) || Number(q[1]) === 1)) {
      put(); const n = q[1]; last = Number(n);
      const rest = q[2].trim();
      const a = rest.match(/^\(?([A-Da-d])\)?(?=[\s.):,\-–]|$)/);
      if (a && !(n in answers)) { answers[n] = a[1].toUpperCase(); cur = { n, lines: [rest.replace(/^\(?[A-Da-d]\)?[\s.):,\-–]*/, "")] }; }
      else cur = { n, lines: [rest] };
      continue;
    }
    if (cur && line.trim() && !SECTION.test(line)) cur.lines.push(line.trim());
  }
  put();
  return { answers, models };
}

/** puts key answers into the parsed questions; for MCQs the letter must be one of the options */
export function applyKey(paper, key) {
  let keyed = 0;
  for (const s of paper.sections) for (const q of s.questions) {
    const a = key.answers[q.n]; const m = key.models[q.n];
    if (q.type === "tf" && !a && m) { const tf = m.match(/^(true|false|yes|no)\b/i); if (tf) { q.answer = /^(true|yes)/i.test(tf[1]) ? "A" : "B"; keyed++; } }
    if ((q.type === "mcq" || q.type === "tf") && a) {
      const max = (q.options?.length ?? (q.type === "tf" ? 2 : 4));
      if (a.charCodeAt(0) - 64 <= max) { q.answer = a; keyed++; }
    }
    if (m && q.type !== "mcq") { q.model = m; keyed++; }
    else if (m && q.type === "mcq" && m.length > 3) q.model = m;
  }
  return keyed;
}

export function inferMeta(s) {
  const t = ` ${s} `.toLowerCase().replace(/[_%.]+/g, " ");
  let cls;
  const num = t.match(/\bclass[\s-]*(\d{1,2})\b/) ?? t.match(/\b(\d{1,2})\s*(?:th|st|nd|rd)\b/) ?? t.match(/\bstd[\s.-]*(\d{1,2})\b/);
  if (num && +num[1] >= 1 && +num[1] <= 12) cls = +num[1];
  if (!cls) { const r = t.match(/\bclass[\s-]*(xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\b/) ?? t.match(/\b(xii|xi|ix|x)\b/); if (r) cls = ROMAN[r[1]]; }
  const SUBJ = [["english", "English"], ["hindi", "Hindi"], ["tamil", "Tamil"], ["sanskrit", "Sanskrit"], ["social science", "Social Science"], ["social studies", "Social Science"], ["science", "Science"], ["mathematics", "Mathematics"], ["maths", "Mathematics"], ["math", "Mathematics"], ["physics", "Physics"], ["chemistry", "Chemistry"], ["biology", "Biology"], ["history", "History"], ["geography", "Geography"], ["economics", "Economics"], ["accountancy", "Accountancy"], ["business studies", "Business Studies"], ["computer", "Computer Science"], ["informatics", "Informatics Practices"], ["evs", "Environmental Studies"], ["environmental", "Environmental Studies"], ["political science", "Political Science"], ["civics", "Civics"]];
  const subject = SUBJ.find(([k]) => t.includes(k))?.[1];
  const y = t.match(/\b(20\d\d)\s*[-–/]\s*(\d{2,4})\b/) ?? t.match(/\b(20\d\d)\b/);
  const year = y ? (y[2] ? `${y[1]}-${y[2].slice(-2)}` : y[1]) : undefined;
  let kind = "previous";
  if (/sample|\bsqp\b/.test(t)) kind = "sample"; else if (/model/.test(t)) kind = "model"; else if (/quiz|mcq|objective/.test(t)) kind = "quiz"; else if (/worksheet/.test(t)) kind = "worksheet"; else if (/unit test|periodic|quarterly|half[\s-]*yearly|annual|term|mid/.test(t)) kind = "test";
  const T = [["quarterly", /quarterly|first term|term 1\b/], ["half-yearly", /half[\s-]*yearly|second term|term 2\b|semester 1/], ["annual", /\bannual\b|third term|term 3\b|final exam/], ["mid-term", /mid[\s-]*term/], ["pre-board", /pre[\s-]*board/], ["public", /public (exam|question)|board exam/], ["revision", /revision/]].find(([, re]) => re.test(t));
  const term = T?.[0];
  return { cls, subject, year, kind, ...(term ? { term } : {}) };
}
export const isKeyName = (s) => /marking|scheme|\bms\b|solution|answer|\bkey\b|\banswers?\b|\bsol\b/i.test(s);
export const pairKey = (s) => s.toLowerCase().replace(/\.pdf$/, "").replace(/marking|scheme|solutions?|answers?|\bkeys?\b|\bms\b|\bsol\b|\bsqp\b|question[\s_-]*paper|[^a-z0-9]+/g, "");
