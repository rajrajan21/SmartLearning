/**
 * Pure, dependency-free detectors for the contribution review. Nothing here stores or returns a detected value:
 * results are counts, page numbers and masked samples only.
 */

// ---------- check digits ----------
const VD = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const VP = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
/** Verhoeff check (used by Aadhaar numbers). */
export function verhoeff(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let c = 0;
  const rev = digits.split("").reverse();
  for (let i = 0; i < rev.length; i++) c = VD[c]![VP[i % 8]![Number(rev[i])]!]!;
  return c === 0;
}
/** Luhn check (payment cards). */
export function luhn(digits: string): boolean {
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d; alt = !alt;
  }
  return sum % 10 === 0;
}
/** ISBN-10 / ISBN-13 check, used to tell a book number from a card number. */
export function isbnValid(raw: string): boolean {
  const s = raw.replace(/[\s-]/g, "").toUpperCase();
  if (/^\d{13}$/.test(s)) { let t = 0; for (let i = 0; i < 12; i++) t += Number(s[i]) * (i % 2 ? 3 : 1); return (10 - (t % 10)) % 10 === Number(s[12]); }
  if (/^\d{9}[\dX]$/.test(s)) { let t = 0; for (let i = 0; i < 9; i++) t += Number(s[i]) * (10 - i); t += s[9] === "X" ? 10 : Number(s[9]); return t % 11 === 0; }
  return false;
}

// ---------- personal and sensitive data ----------
export type PiiType = "aadhaar" | "pan" | "passport" | "voter" | "driving" | "phone" | "email" | "bank" | "ifsc" | "card" | "upi" | "dob" | "idcard" | "medical" | "legal" | "secret";
/** Identity and money numbers (a few of these reject a book); phone/email are counted separately. */
export const ID_TYPES: PiiType[] = ["aadhaar", "pan", "passport", "voter", "driving", "bank", "card", "upi", "secret"];
export interface PiiResult {
  counts: Partial<Record<PiiType, number>>;
  /** 1-based pages where the type was found (max 12 per type) */
  pages: Partial<Record<PiiType, number[]>>;
  /** masked examples only, for example "XXXX XXXX 4321" (max 3 per type) */
  samples: Partial<Record<PiiType, string[]>>;
  idTotal: number;
  contactTotal: number;
}
const mask = (s: string, keep = 2) => { const c = s.replace(/\s/g, ""); return c.length <= keep ? "XX" : "X".repeat(Math.min(c.length - keep, 10)) + c.slice(-keep); };

const UPI_HANDLES = "upi|ybl|ibl|axl|okaxis|oksbi|okhdfcbank|okicici|paytm|apl|sbi|hdfcbank|icici|axisbank|kotak|pnb|boi|barodampay|fbl|ptsbi|ptyes|postbank|cnrb|jupiteraxis|freecharge|airtel|waicici|gpay";
const RE = {
  aadhaar: /(?<!\d)[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}(?!\d)/g,
  pan: /\b[A-Z]{3}[ABCFGHJLPT][A-Z]\d{4}[A-Z]\b/g,
  passport: /\b[A-PR-WY][1-9]\d{6}\b/g,
  voter: /\b[A-Z]{3}\d{7}\b/g,
  driving: /\b[A-Z]{2}[ -]?\d{2}[ -]?(?:19|20)\d{2}\d{7}\b/g,
  phone: /(?<![\d.])(?:(?:\+|00)?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\d.])/g,
  email: /\b[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,120}\.[A-Z]{2,12}\b/gi,
  upi: new RegExp(`\\b[a-z0-9._-]{2,40}@(?:${UPI_HANDLES})\\b`, "gi"),
  ifsc: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
  bank: /(?:a\/c|acc(?:oun)?t)\s*(?:no\.?|number|num|#)?\s*[:\-]?\s*(\d{9,18})(?!\d)/gi,
  card: /(?<![\d-])(?:\d[ -]?){13,19}(?![\d-])/g,
  dob: /(?:d\.?\s?o\.?\s?b\.?|date\s+of\s+birth|born\s+on)\s*[:\-]?\s*\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}/gi,
  secret: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|\bsk-[A-Za-z0-9_-]{20,}\b|\bghp_[A-Za-z0-9]{30,}\b|\bxox[bp]-[A-Za-z0-9-]{20,}\b|\b(?:password|passwd|pwd|api[_ -]?key|secret[_ -]?key|access[_ -]?token)\s*[:=]\s*\S{4,}/gi,
};
const CTX = { passport: /passport/i, voter: /voter|epic\b|election\s+commission|electoral/i, driving: /driving|licen[cs]e|\bDL\b|transport/i };
const MARKS = [/roll\s*(?:no|number)/i, /regist(?:er|ration)\s*(?:no|number)/i, /marks?\s+obtained/i, /hall\s*ticket/i, /admission\s*(?:no|number)/i, /student(?:'s)?\s+name/i, /father(?:'s)?\s+name/i, /mother(?:'s)?\s+name/i, /date\s+of\s+birth/i, /candidate(?:'s)?\s+name/i, /total\s+marks/i, /grade\s+card|mark\s*sheet|marksheet|report\s+card/i, /identity\s+card|id\s+card/i];
const MEDICAL = [/patient(?:'s)?\s+name/i, /diagnosis/i, /prescription/i, /discharge\s+summary/i, /lab(?:oratory)?\s+report/i, /blood\s+(?:group|test)/i, /\bUHID\b|\bMRN\b/i, /doctor(?:'s)?\s+signature/i];
const LEGAL = [/\bFIR\s*(?:no|number)/i, /case\s*(?:no|number)/i, /petitioner/i, /\baffidavit\b/i, /court\s+order/i, /\bplaintiff\b|\bdefendant\b/i, /police\s+station/i, /sworn\s+before/i];

function add(res: PiiResult, t: PiiType, page: number, sample: string) {
  res.counts[t] = (res.counts[t] ?? 0) + 1;
  const pg = (res.pages[t] ??= []);
  if (pg.length < 12 && pg[pg.length - 1] !== page) pg.push(page);
  const sm = (res.samples[t] ??= []);
  if (sm.length < 3) sm.push(sample);
}

export interface PiiOptions { marksheets: boolean }
/** Scans page texts (index 0 = page 1). Values are never kept. */
export function scanPii(pages: string[], opts: PiiOptions = { marksheets: true }): PiiResult {
  const res: PiiResult = { counts: {}, pages: {}, samples: {}, idTotal: 0, contactTotal: 0 };
  pages.forEach((text, i) => {
    const p = i + 1;
    if (!text) return;
    const around = (idx: number, len: number) => text.slice(Math.max(0, idx - 40), idx + len + 40);
    for (const m of text.matchAll(RE.aadhaar)) { const d = m[0].replace(/\D/g, ""); if (d.length === 12 && verhoeff(d)) add(res, "aadhaar", p, mask(d, 4)); }
    for (const m of text.matchAll(RE.pan)) add(res, "pan", p, mask(m[0], 3));
    for (const m of text.matchAll(RE.passport)) if (CTX.passport.test(around(m.index!, m[0].length))) add(res, "passport", p, mask(m[0], 2));
    for (const m of text.matchAll(RE.voter)) if (CTX.voter.test(around(m.index!, m[0].length))) add(res, "voter", p, mask(m[0], 3));
    for (const m of text.matchAll(RE.driving)) if (CTX.driving.test(around(m.index!, m[0].length))) add(res, "driving", p, mask(m[0], 3));
    const upiSpans: number[] = [];
    for (const m of text.matchAll(RE.upi)) { upiSpans.push(m.index!); add(res, "upi", p, `${mask(m[0].split("@")[0]!, 1)}@${m[0].split("@")[1]}`); }
    for (const m of text.matchAll(RE.email)) { if (upiSpans.includes(m.index!)) continue; add(res, "email", p, `${mask(m[0].split("@")[0]!, 1)}@${m[0].split("@")[1]}`); }
    for (const m of text.matchAll(RE.phone)) add(res, "phone", p, mask(m[0], 3));
    for (const m of text.matchAll(RE.ifsc)) add(res, "ifsc", p, mask(m[0], 3));
    for (const m of text.matchAll(RE.bank)) add(res, "bank", p, mask(m[1]!, 3));
    for (const m of text.matchAll(RE.card)) {
      const d = m[0].replace(/\D/g, "");
      if (d.length < 13 || d.length > 19 || /^97[89]/.test(d) || /^(\d)\1+$/.test(d)) continue;
      if (!/[ -]/.test(m[0]) && !/card|visa|master|rupay|debit|credit/i.test(around(m.index!, m[0].length))) continue; // a bare long number is rarely a card
      if (luhn(d)) add(res, "card", p, mask(d, 4));
    }
    for (const m of text.matchAll(RE.dob)) add(res, "dob", p, "date of birth");
    for (const m of text.matchAll(RE.secret)) add(res, "secret", p, "secret or key");
    if (opts.marksheets) {
      if (MARKS.filter((r) => r.test(text)).length >= 3) add(res, "idcard", p, "mark sheet / ID form");
    }
    if (MEDICAL.filter((r) => r.test(text)).length >= 3) add(res, "medical", p, "medical record");
    if (LEGAL.filter((r) => r.test(text)).length >= 3) add(res, "legal", p, "legal record");
  });
  res.idTotal = ID_TYPES.reduce((s, t) => s + (res.counts[t] ?? 0), 0) + (res.counts.idcard ?? 0) + (res.counts.medical ?? 0) + (res.counts.legal ?? 0);
  res.contactTotal = (res.counts.phone ?? 0) + (res.counts.email ?? 0);
  return res;
}

// ---------- copyright ----------
export interface TermLists {
  blockedPublishers: string[];
  blockedTitles: string[];
  blockedPhrases: string[];
  adult: string[];
  hate: string[];
  violence: string[];
  spam: string[];
  /** transliterated Tamil and Hindi words */
  indic: string[];
  childSexual: string[];
  childTerms: string[];
}
export const DEFAULT_TERMS: TermLists = {
  blockedPublishers: ["oxford university press", "cambridge university press", "pearson", "mcgraw-hill", "mcgraw hill", "s. chand", "s chand", "arihant", "mtg learning", "disha publication", "goyal brothers", "ratna sagar", "rachna sagar", "macmillan", "penguin", "harpercollins", "scholastic", "wiley", "cengage", "oswaal", "evergreen publications", "target publications", "navneet", "vikas publishing", "bloomsbury", "hachette", "simon & schuster", "kips", "full marks", "new saraswati house", "frank bros", "viva education", "eduminds"],
  blockedTitles: [],
  blockedPhrases: ["no part of this publication may be reproduced", "no part of this book may be reproduced", "unauthorised distribution", "unauthorized distribution", "downloaded from", "pdfdrive", "z-library", "zlibrary", "libgen", "free ebook download", "scribd.com", "for personal use only", "not for resale", "pirated", "cracked version"],
  adult: ["porn", "pornographic", "xxx", "erotic", "nude photos", "sex video", "escort service", "hookup", "adult content", "naked", "onlyfans", "sexting"],
  hate: ["kill all", "death to", "racial slur", "subhuman", "ethnic cleansing", "white power", "genocide is good", "burn the"],
  violence: ["how to make a bomb", "bomb making", "build a weapon", "suicide method", "how to kill", "beheading video", "torture video"],
  spam: ["click here", "whatsapp us", "join telegram", "t.me/", "buy now", "earn money", "lottery winner", "limited offer", "work from home and earn", "call now", "100% free download", "subscribe my channel"],
  indic: ["chutiya", "madarchod", "bhosdi", "bhenchod", "randi", "thevidiya", "thevdiya", "pundai", "koothi", "otha", "sunni", "gaandu", "harami"],
  childSexual: ["porn", "pornographic", "erotic", "xxx", "nude photos", "sex video", "sexual abuse material", "explicit sexual"],
  childTerms: ["underage", "schoolgirl", "schoolboy", "little girl", "little boy", "minor girl", "minor boy", "preteen", "pre-teen"],
};
export function cleanTerms(raw: unknown): TermLists {
  const out: TermLists = JSON.parse(JSON.stringify(DEFAULT_TERMS));
  if (raw && typeof raw === "object") {
    for (const k of Object.keys(out) as (keyof TermLists)[]) {
      const v = (raw as Record<string, unknown>)[k];
      if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === "string").map((x) => x.trim().toLowerCase().slice(0, 120)).filter(Boolean).slice(0, 800);
    }
  }
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ");
function countTerm(hay: string, term: string): number {
  if (!term) return 0;
  let n = 0, i = 0;
  const wordy = /^[a-z0-9 ]+$/.test(term);
  while ((i = hay.indexOf(term, i)) !== -1) {
    const before = hay[i - 1], after = hay[i + term.length];
    if (!wordy || ((!before || !/[a-z0-9]/.test(before)) && (!after || !/[a-z0-9]/.test(after)))) n++;
    i += term.length;
  }
  return n;
}

export type LicenceId = "own" | "pd" | "cc0" | "by" | "by-sa" | "by-nc" | "by-nc-sa" | "gov-open";
export interface CopyrightResult {
  copyrightNotice: boolean;
  allRightsReserved: boolean;
  isbnCount: number;
  publisherHits: string[];
  titleHits: string[];
  phraseHits: string[];
  textbookMarkers: string[];
  /** open licences the text itself states (first 6 and last 6 pages are searched) */
  detectedLicences: LicenceId[];
  gutenberg: boolean;
}
const TEXTBOOK = [/\bncert\b/i, /\bscert\b/i, /samacheer\s+kalvi/i, /tamil\s*nadu\s+(?:text\s*book|textbook)/i, /state\s+council\s+of\s+educational\s+research/i, /national\s+council\s+of\s+educational\s+research/i, /not\s+to\s+be\s+republished/i, /central\s+board\s+of\s+secondary\s+education/i];
export function scanCopyright(pages: string[], title: string, terms: TermLists): CopyrightResult {
  const edge = (pages.length <= 12 ? pages : [...pages.slice(0, 6), ...pages.slice(-6)]).join("\n");
  const low = norm(edge);
  const all = norm(pages.slice(0, 40).join("\n"));
  const res: CopyrightResult = { copyrightNotice: /©|\(c\)\s*\d{4}|copyright\s*(?:©|\d{4}|by\b)/i.test(edge), allRightsReserved: /all\s+rights?\s+reserved/i.test(edge), isbnCount: 0, publisherHits: [], titleHits: [], phraseHits: [], textbookMarkers: [], detectedLicences: [], gutenberg: /project\s+gutenberg/i.test(edge) };
  for (const m of edge.matchAll(/\bISBN(?:-1[03])?\s*:?\s*([0-9][0-9\- ]{8,16}[0-9Xx])/gi)) if (isbnValid(m[1]!)) res.isbnCount++;
  for (const p of terms.blockedPublishers) if (low.includes(p)) res.publisherHits.push(p);
  const t = norm(title);
  for (const bt of terms.blockedTitles) if (bt && (t.includes(bt) || low.slice(0, 4000).includes(bt))) res.titleHits.push(bt);
  for (const ph of terms.blockedPhrases) if (all.includes(ph)) res.phraseHits.push(ph);
  for (const r of TEXTBOOK) if (r.test(edge)) res.textbookMarkers.push(r.source.replace(/\\b|\\s\+|\(\?:|\)/g, " ").trim().slice(0, 40));
  const lic = new Set<LicenceId>();
  const L = edge.split("\n").filter((line) => !/^\s*(?:image|photo|illustration)\s+(?:attribution|credit)\s*:/i.test(line)).join("\n");
  if (/creativecommons\.org\/publicdomain\/zero|\bCC0\b/i.test(L)) lic.add("cc0");
  if (/creativecommons\.org\/licenses\/by-nc-sa\/|CC[\s-]BY[\s-]NC[\s-]SA/i.test(L)) lic.add("by-nc-sa");
  else if (/creativecommons\.org\/licenses\/by-nc\/|CC[\s-]BY[\s-]NC(?![\s-]*(?:SA|ND))/i.test(L)) lic.add("by-nc");
  if (/creativecommons\.org\/licenses\/by-sa\/|CC[\s-]BY[\s-]SA/i.test(L)) lic.add("by-sa");
  if (/creativecommons\.org\/licenses\/by\/|CC[\s-]BY(?![\s-]*(?:NC|SA|ND))\b/i.test(L)) lic.add("by");
  if (/public\s+domain|expired\s+copyright/i.test(L) && !/not\s+(?:in\s+the\s+)?public\s+domain/i.test(L)) lic.add("pd");
  if (/government\s+open\s+data\s+licen[cs]e|open\s+government\s+licen[cs]e|\bNDSAP\b|data\.gov\.in/i.test(L)) lic.add("gov-open");
  if (res.gutenberg) lic.add("pd");
  res.detectedLicences = [...lic];
  return res;
}
export const OPEN_LICENCES: LicenceId[] = ["pd", "cc0", "by", "by-sa", "by-nc", "by-nc-sa", "gov-open"];

// ---------- unsafe / unsolicited content ----------
export interface ContentResult {
  score: number;
  categories: Record<"adult" | "hate" | "violence" | "spam" | "indic" | "urls", number>;
  hitPages: number[];
  /** hard child-safety rule: a sexual term and a minor term on the same page */
  childSafety: boolean;
  childSafetyPages: number[];
  urlsPerPage: number;
  words: number;
}
const WEIGHT = { adult: 12, hate: 15, violence: 18, spam: 6, indic: 8 };
export function scanContent(pages: string[], terms: TermLists, urlSpamPerPage: number): ContentResult {
  const cat = { adult: 0, hate: 0, violence: 0, spam: 0, indic: 0, urls: 0 };
  const hitPages = new Set<number>();
  const childPages: number[] = [];
  let words = 0, urls = 0;
  pages.forEach((raw, i) => {
    if (!raw) return;
    const t = norm(raw);
    words += t.split(" ").length;
    let hit = false;
    for (const k of ["adult", "hate", "violence", "spam", "indic"] as const) for (const term of terms[k]) { const c = countTerm(t, term); if (c) { cat[k] += c; hit = true; } }
    const u = (raw.match(/https?:\/\/|www\.|t\.me\//gi) ?? []).length;
    urls += u;
    if (hit) hitPages.add(i + 1);
    const sexual = terms.childSexual.some((x) => countTerm(t, x) > 0), minor = terms.childTerms.some((x) => countTerm(t, x) > 0);
    if (sexual && minor) childPages.push(i + 1);
  });
  const n = Math.max(1, pages.filter(Boolean).length);
  const per1k = (c: number) => (c / Math.max(words, 1)) * 1000;
  let score = 0;
  for (const k of ["adult", "hate", "violence", "spam", "indic"] as const) {
    if (!cat[k]) continue;
    // a handful of hits in a big book is a mention; density and weight make it a problem
    score += Math.min(60, WEIGHT[k] * Math.min(cat[k], 3) + per1k(cat[k]) * WEIGHT[k]);
  }
  const urlsPerPage = urls / n;
  cat.urls = urls;
  if (urlsPerPage >= urlSpamPerPage) score += 25;
  return { score: Math.min(100, Math.round(score)), categories: cat, hitPages: [...hitPages].slice(0, 15), childSafety: childPages.length > 0, childSafetyPages: childPages.slice(0, 10), urlsPerPage: Math.round(urlsPerPage * 10) / 10, words };
}

// ---------- language ----------
const SCRIPTS: [string, RegExp][] = [["ta", /[஀-௿]/g], ["hi", /[ऀ-ॿ]/g], ["te", /[ఀ-౿]/g], ["kn", /[ಀ-೿]/g], ["ml", /[ഀ-ൿ]/g], ["bn", /[ঀ-৿]/g], ["gu", /[઀-૿]/g], ["pa", /[਀-੿]/g], ["ar", /[؀-ۿ]/g]];
export function detectLanguage(text: string): { code: string; share: number } {
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  let best = { code: "en", share: 0 }, total = latin;
  const counts: [string, number][] = SCRIPTS.map(([c, re]) => [c, (text.match(re) ?? []).length]);
  for (const [, n] of counts) total += n;
  if (!total) return { code: "", share: 0 };
  best = { code: "en", share: latin / total };
  for (const [c, n] of counts) if (n / total > best.share) best = { code: c, share: n / total };
  return { code: best.code, share: Math.round(best.share * 100) / 100 };
}

// ---------- similarity ----------
const MASK64 = (1n << 64n) - 1n;
function fnv64(s: string): bigint { let h = 0xcbf29ce484222325n; for (let i = 0; i < s.length; i++) { h ^= BigInt(s.charCodeAt(i)); h = (h * 0x100000001b3n) & MASK64; } return h; }
/** 64-bit simhash of the words (3-word shingles). Returned as 16 hex digits; "" when there is too little text. */
export function simhash(text: string): string {
  const w = norm(text).replace(/[^\p{L}\p{N} ]/gu, " ").split(" ").filter((x) => x.length > 1);
  if (w.length < 60) return "";
  const v = new Array<number>(64).fill(0);
  const cap = Math.min(w.length - 2, 60000);
  for (let i = 0; i < cap; i++) {
    const h = fnv64(`${w[i]} ${w[i + 1]} ${w[i + 2]}`);
    for (let b = 0; b < 64; b++) v[b]! += (h >> BigInt(b)) & 1n ? 1 : -1;
  }
  let out = 0n;
  for (let b = 0; b < 64; b++) if (v[b]! > 0) out |= 1n << BigInt(b);
  return out.toString(16).padStart(16, "0");
}
export function hamming(a: string, b: string): number {
  if (a.length !== 16 || b.length !== 16) return 64;
  let x = BigInt("0x" + a) ^ BigInt("0x" + b), n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
}
const bigrams = (s: string) => { const t = norm(s).replace(/[^\p{L}\p{N}]/gu, ""); const m = new Map<string, number>(); for (let i = 0; i < t.length - 1; i++) { const g = t.slice(i, i + 2); m.set(g, (m.get(g) ?? 0) + 1); } return m; };
/** Dice similarity 0..1 on letter pairs: tolerant of small spelling and spacing changes. */
export function dice(a: string, b: string): number {
  const x = bigrams(a), y = bigrams(b);
  let inter = 0, sx = 0, sy = 0;
  for (const [, c] of x) sx += c;
  for (const [, c] of y) sy += c;
  if (!sx || !sy) return 0;
  for (const [g, c] of x) inter += Math.min(c, y.get(g) ?? 0);
  return (2 * inter) / (sx + sy);
}

/** Hides every personal value in a page text so an admin can read the page without seeing the data. */
export function maskPii(text: string): string {
  let t = text;
  t = t.replace(RE.secret, "[hidden]").replace(RE.upi, "[hidden]").replace(RE.email, "[hidden]");
  t = t.replace(RE.aadhaar, (m) => (verhoeff(m.replace(/\D/g, "")) ? "[hidden]" : m));
  if (CTX.passport.test(t)) t = t.replace(RE.passport, "[hidden]");
  if (CTX.voter.test(t)) t = t.replace(RE.voter, "[hidden]");
  if (CTX.driving.test(t)) t = t.replace(RE.driving, "[hidden]");
  t = t.replace(RE.pan, "[hidden]").replace(RE.phone, "[hidden]").replace(RE.ifsc, "[hidden]").replace(RE.dob, "date of birth: [hidden]");
  t = t.replace(RE.bank, (m, d: string) => m.replace(d, "[hidden]"));
  t = t.replace(RE.card, (m) => { const d = m.replace(/\D/g, ""); return d.length >= 13 && !/^97[89]/.test(d) && luhn(d) ? "[hidden]" : m; });
  return t;
}
