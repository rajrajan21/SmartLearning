import { dice, detectLanguage, hamming, OPEN_LICENCES, scanContent, scanCopyright, scanPii, simhash, type LicenceId, type PiiResult, type TermLists } from "./detectors.js";
import { friendlyBlocker, type PdfScan } from "./pdfscan.js";
import { publisherBook } from "./publisher-evidence.js";
import type { Extracted } from "./textextract.js";

export type Status = "pass" | "warn" | "fail" | "skip";
export interface Check { id: string; label: string; status: Status; detail: string; items?: string[] }
export type Outcome = "reject" | "review" | "approve";
export interface Declared { title: string; author: string; board: string; classLevel: string; subject: string; language: string; licence: string; sourceUrl: string; licenceProof: string; attribution: "name" | "anonymous" }
export interface ExistingBook { id: string; title: string; authors: string[]; sha256?: string; simhash?: string }
export interface Report {
  checks: Check[];
  /** 0-100, transparent: 100 minus 40 per failed and 12 per warned check */
  score: number;
  outcome: Outcome;
  /** plain sentences for the contributor and the admin */
  reasons: string[];
  detectedLicences: string[];
  language: string;
  simhash: string;
  stats: { pages: number; pagesRead: number; avgChars: number; blankPages: number; words: number; bytes: number; textLayer: boolean };
  /** counts, pages and masked examples only; never the detected values */
  pii: { counts: PiiResult["counts"]; pages: PiiResult["pages"]; samples: PiiResult["samples"] } | null;
  createdAt: string;
}
type Vals = Record<string, unknown>;
const num = (v: Vals, k: string, d: number) => (typeof v[k] === "number" ? (v[k] as number) : d);
const on = (v: Vals, k: string) => v[k] !== false;

const PII_LABEL: Record<string, string> = { aadhaar: "Aadhaar-style numbers", pan: "PAN card numbers", passport: "passport numbers", voter: "voter ID numbers", driving: "driving licence numbers", phone: "phone numbers", email: "email addresses", bank: "bank account numbers", ifsc: "bank IFSC codes", card: "payment card numbers", upi: "UPI payment IDs", dob: "dates of birth next to labels", idcard: "mark sheets or ID forms with names", medical: "medical records", legal: "legal case records", secret: "passwords or private keys" };
const piiItems = (p: PiiResult) => Object.keys(p.counts).filter((k) => k !== "ifsc" || p.counts.ifsc).map((k) => `${p.counts[k as keyof PiiResult["counts"]]} ${PII_LABEL[k] ?? k} (page${(p.pages[k as keyof PiiResult["pages"]] ?? []).length > 1 ? "s" : ""} ${(p.pages[k as keyof PiiResult["pages"]] ?? []).slice(0, 6).join(", ")})${p.samples[k as keyof PiiResult["samples"]]?.[0] ? ` e.g. ${p.samples[k as keyof PiiResult["samples"]]![0]}` : ""}`);

export interface ReviewInput { source?: "upload" | "link"; meta: Declared; scan: PdfScan; ex: Extracted; sha256: string; bytes: number; values: Vals; terms: TermLists; existing: ExistingBook[] }

export function reviewSubmission(inp: ReviewInput): Report {
  const { meta, scan, ex, values: v, terms } = inp;
  const checks: Check[] = [];
  const add = (id: string, label: string, status: Status, detail: string, items?: string[]) => checks.push({ id, label, status, detail, ...(items?.length ? { items } : {}) });
  const reasons: string[] = [];

  // ---- 1. safe file
  if (scan.blockers.length) { add("structure", "Safe PDF structure", "fail", "The file contains parts that are not allowed.", scan.blockers.map((b) => b.message)); for (const b of scan.blockers) reasons.push(friendlyBlocker(b)); }
  else add("structure", "Safe PDF structure", "pass", "No scripts, launch actions, attached files, encryption or damage found.", scan.notes.map((n) => n.message));

  // ---- readable
  const pages = ex.pages;
  const withText = pages.filter((p) => p.trim().length > 0);
  const totalChars = pages.reduce((s, p) => s + p.trim().length, 0);
  const avgChars = pages.length ? Math.round(totalChars / pages.length) : 0;
  const blank = pages.filter((p) => p.trim().length < 5).length;
  const briefText = totalChars >= 100 && pages.length > 0 && (pages.length - blank) / pages.length >= 0.8;
  const textLayer = ex.engine && (avgChars >= num(v, "contrib.quality.minCharsPerPage", 40) || (on(v, "contrib.autoApprove.shortBooks") && briefText));
  const allText = pages.join("\n");
  const lang = detectLanguage(allText.slice(0, 200000));

  // ---- 2. quality
  if (on(v, "contrib.check.quality")) {
    const minP = num(v, "contrib.minPages", 2), maxP = num(v, "contrib.maxPages", 600);
    const notes: string[] = [];
    let st: Status = "pass";
    const bump = (s: Status, msg: string) => { notes.push(msg); if (s === "fail" || (s === "warn" && st === "pass")) st = s; };
    if (!ex.engine) bump("warn", "The server could not read inside the PDF, so a person must look at it.");
    else if (ex.pageCount === 0 && scan.ok) { bump("fail", "The PDF could not be opened or has no pages."); reasons.push("We could not open this PDF. Please re-save it and try again."); }
    else {
      if (ex.pageCount < minP) { bump("fail", `Only ${ex.pageCount} page(s); at least ${minP} are needed.`); reasons.push(`This PDF has only ${ex.pageCount} page(s). We need at least ${minP}.`); }
      if (ex.pageCount > maxP) { bump("fail", `${ex.pageCount} pages; at most ${maxP} are accepted.`); reasons.push(`This PDF has ${ex.pageCount} pages. The most we accept is ${maxP}. Please split it into parts.`); }
      if (!textLayer && ex.pageCount > 0) {
        const action = String(v["contrib.quality.scannedAction"] ?? "review");
        if (action === "reject") { bump("fail", "No readable text (pages are pictures)."); reasons.push("This PDF is made of scanned pictures with no readable text. Please upload a text-based PDF."); }
        else if (action === "review") bump("warn", "No readable text (scanned pictures). The text checks could not look inside, so a person will.");
        else notes.push("Scanned pictures with no readable text (allowed by the admin).");
      }
      const blankPct = pages.length ? (blank / pages.length) * 100 : 0;
      if (textLayer && blankPct > num(v, "contrib.quality.maxBlankPercent", 40)) notes.push(`${Math.round(blankPct)}% of pages have little or no extractable text.`);
      if (ex.error) bump("warn", ex.error);
      else if (pages.length !== ex.pageCount) bump("warn", "Only part of the PDF was checked.");
    }
    add("quality", "Quality and suitability", st, notes[0] ?? `${ex.pageCount} pages, readable text found.`, notes);
  } else add("quality", "Quality and suitability", "skip", "Switched off by the admin.");

  // ---- 3. duplicates
  const sim = inp.ex.engine ? simhash(allText) : "";
  if (on(v, "contrib.check.duplicates")) {
    const dist = num(v, "contrib.dup.distance", 6);
    const hash = inp.existing.find((e) => e.sha256 && e.sha256 === inp.sha256);
    const text = sim ? inp.existing.find((e) => e.simhash && hamming(e.simhash, sim) <= dist) : undefined;
    const fuzzy = inp.existing.find((e) => dice(e.title, meta.title) >= 0.92 && (meta.author ? e.authors.some((a) => dice(a, meta.author) >= 0.8) || e.authors.length === 0 : true));
    if (hash) { add("duplicates", "Duplicate check", "fail", "This exact file is already in the library or has already been sent.", [`same file as ${hash.id}`]); reasons.push("This exact book is already in the E-Library (or already sent for review). Thank you, but we do not need it twice."); }
    else if (text) { add("duplicates", "Duplicate check", "fail", "Its text is almost identical to a book we already have.", [`near copy of ${text.id}`]); reasons.push("A book with almost exactly this text is already in the E-Library."); }
    else if (fuzzy) add("duplicates", "Duplicate check", "warn", "A book with a very similar title and author exists; a person will compare them.", [`similar to ${fuzzy.id}`]);
    else add("duplicates", "Duplicate check", "pass", "Not in the library yet.");
  } else add("duplicates", "Duplicate check", "skip", "Switched off by the admin.");

  // ---- 4. copyright
  const cr = scanCopyright(pages, meta.title, terms);
  const publisher = publisherBook(inp.sha256);
  const detected = [...new Set([...cr.detectedLicences, ...(publisher ? [publisher.licence] : [])])];
  if (on(v, "contrib.check.copyright")) {
    const items: string[] = [];
    let st: Status = "pass";
    const bump = (s: Status, msg: string) => { items.push(msg); if (s === "fail" || (s === "warn" && st === "pass")) st = s; };
    const declared = meta.licence as LicenceId | "permission" | "own";
    const blocked = [...cr.publisherHits.map((x) => `publisher: ${x}`), ...cr.titleHits.map((x) => `title: ${x}`), ...cr.phraseHits.map((x) => `phrase: ${x}`)];
    if (blocked.length) {
      if (v["contrib.copyright.blockedIsReject"] !== false) { bump("fail", `Matches your blocked list (${blocked.slice(0, 3).join("; ")}).`); reasons.push("This book looks like a commercial or pirated publication (it matches our protected-publisher list), so we cannot add it. If you own the rights, please contact us."); }
      else bump("warn", `Matches your blocked list (${blocked.slice(0, 3).join("; ")}).`);
    }
    if (OPEN_LICENCES.includes(declared as LicenceId)) {
      if (publisher?.licence === declared) items.push(`Publisher licence confirmed for this exact PDF: ${declared}.`);
      else if (detected.length === 1 && detected.includes(declared as LicenceId) && !cr.allRightsReserved) items.push(`Licence statement found in the book: ${declared}.`);
      else if (cr.allRightsReserved && !detected.length && v["contrib.copyright.rejectAllRights"] !== false) { bump("fail", "The book says 'All rights reserved' but you declared an open licence."); reasons.push("The book itself says 'All rights reserved', which does not match the open licence you chose. Only books that are free to share can be added."); }
      else if (detected.length) bump("warn", `The book’s licence notices need clarification. You declared ${declared}; detected notices: ${detected.join(", ")}.`);
      else bump("warn", "The open licence you declared is not stated inside the book; a person will check your proof.");
    } else if (declared === "own") {
      if (cr.publisherHits.length || (cr.isbnCount > 0 && cr.copyrightNotice)) bump("warn", "You said it is your own work but it carries a publisher or ISBN notice.");
      else if (cr.allRightsReserved && cr.copyrightNotice) items.push("Carries a copyright line (normal for your own work).");
    } else if (declared === "permission") bump("warn", "Permission-based submissions always need a person to read your proof.");
    else bump("warn", "No recognised licence was declared.");
    if (cr.textbookMarkers.length) bump("warn", "Looks like a school textbook (government or board textbooks are not automatically free to republish).");
    if (cr.isbnCount && declared !== "own" && !detected.length) bump("warn", `Has ${cr.isbnCount} ISBN number(s), which usually means a published book.`);
    add("copyright", "Copyright check", st, items[0] ?? "No sign of copyright problems.", items);
  } else add("copyright", "Copyright check", "skip", "Switched off by the admin.");

  // ---- 5. personal data
  let pii: PiiResult | null = null;
  if (on(v, "contrib.check.pii")) {
    if (!withText.length) add("pii", "Personal and sensitive data", "warn", "There is no text to scan (scanned pictures). A person will look at the pages.");
    else {
      pii = scanPii(pages, { marksheets: on(v, "contrib.pii.detectMarksheets") });
      const rej = num(v, "contrib.pii.rejectIds", 3), revC = num(v, "contrib.pii.reviewContacts", 12), rejC = num(v, "contrib.pii.rejectContacts", 60);
      const items = piiItems(pii);
      if (pii.idTotal >= rej) { add("pii", "Personal and sensitive data", "fail", `${pii.idTotal} identity, money or private-record items found.`, items); reasons.push("This PDF seems to contain personal or sensitive information (such as ID numbers, bank details or private records). We cannot publish it. Please remove those pages and send it again. We did not keep or read out any of the values."); }
      else if (pii.contactTotal >= rejC) { add("pii", "Personal and sensitive data", "fail", `${pii.contactTotal} phone numbers and emails found.`, items); reasons.push("This PDF contains a large number of phone numbers or email addresses (like a contact list). We cannot publish it."); }
      else if (pii.idTotal > 0 || pii.contactTotal >= revC) add("pii", "Personal and sensitive data", "warn", "Some personal details were found; a person will look at those pages.", items);
      else add("pii", "Personal and sensitive data", "pass", pii.contactTotal ? `${pii.contactTotal} contact detail(s), within the normal range.` : "No personal data found.", items);
    }
  } else add("pii", "Personal and sensitive data", "skip", "Switched off by the admin.");

  // ---- 6. unsafe content
  if (on(v, "contrib.check.content")) {
    if (!withText.length) add("content", "Unsafe, adult or spam content", "warn", "No text to scan; a person will look at the pages.");
    else {
      const c = scanContent(pages, terms, num(v, "contrib.content.urlSpamPerPage", 6));
      const items = Object.entries(c.categories).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k === "urls" ? "web addresses" : k + " term(s)"}`);
      if (c.hitPages.length) items.push(`pages ${c.hitPages.slice(0, 8).join(", ")}`);
      if (c.childSafety) { add("content", "Unsafe, adult or spam content", "fail", "Content that is not safe for children was found (child-safety rule).", [`page${c.childSafetyPages.length > 1 ? "s" : ""} ${c.childSafetyPages.join(", ")}`]); reasons.push("This PDF contains content that is not safe for a children's library, so it was rejected."); }
      else if (c.score >= num(v, "contrib.content.rejectScore", 55)) { add("content", "Unsafe, adult or spam content", "fail", `Unsafe-content score ${c.score}/100.`, items); reasons.push("This PDF contains adult, hateful, violent or spam content that does not belong in a children's library."); }
      else if (c.score >= num(v, "contrib.content.reviewScore", 25)) add("content", "Unsafe, adult or spam content", "warn", `Unsafe-content score ${c.score}/100; a person will look.`, items);
      else add("content", "Unsafe, adult or spam content", "pass", `Score ${c.score}/100.`, items);
    }
  } else add("content", "Unsafe, adult or spam content", "skip", "Switched off by the admin.");

  // ---- language note (never fails)
  if (lang.code && meta.language && lang.code !== meta.language && lang.share > 0.7) add("language", "Language", "warn", `You chose ${meta.language} but the text looks like ${lang.code}.`);
  else add("language", "Language", "pass", lang.code ? `Detected ${lang.code}.` : "Language could not be detected.");

  const fails = checks.filter((c) => c.status === "fail").length, warns = checks.filter((c) => c.status === "warn").length;
  const score = Math.max(0, 100 - fails * 40 - warns * 12);
  let outcome: Outcome = fails ? "reject" : "review";
  const allowSource = on(v, inp.source === "link" ? "contrib.autoApprove.links" : "contrib.autoApprove.uploads");
  if (!fails && allowSource && v["contrib.autoApprove.enabled"] === true) {
    const allowed = String(v["contrib.autoApprove.licences"] ?? "").split(",").map((s) => s.trim());
    const verified = detected.includes(meta.licence as LicenceId) && allowed.includes(meta.licence);
    const evaluated = checks.filter((c) => ["copyright", "pii", "content", "duplicates", "quality", "structure"].includes(c.id));
    if (verified && (v["contrib.autoApprove.publisherOnly"] !== true || publisher?.licence === meta.licence) && textLayer && !ex.error && ex.pages.length === ex.pageCount && evaluated.every((c) => c.status === "pass")) outcome = "approve";
  }
  if (!fails && outcome === "review") {
    for (const c of checks) if (c.status === "warn" && c.id !== "language") reasons.push(c.detail);
    if (!reasons.length) reasons.push("A person at SharpStudy will read your submission and publish it if everything is fine.");
  }
  return {
    checks, score, outcome, reasons: [...new Set(reasons)].slice(0, 8), detectedLicences: detected, language: lang.code, simhash: sim,
    stats: { pages: ex.pageCount, pagesRead: pages.length, avgChars, blankPages: blank, words: allText.split(/\s+/).filter(Boolean).length, bytes: inp.bytes, textLayer },
    pii: pii ? { counts: pii.counts, pages: pii.pages, samples: pii.samples } : null,
    createdAt: new Date().toISOString(),
  };
}
