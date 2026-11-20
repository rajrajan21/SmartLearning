import { inflateSync } from "node:zlib";

/**
 * Structure scan of an uploaded PDF. The file is only ever read as bytes here, never opened by anything that could run it.
 * Looks for the parts of a PDF that can run code, launch programs, hide files or crush a server, including names
 * disguised with #xx escapes and objects packed inside compressed object streams.
 */
export interface PdfScan {
  ok: boolean;
  /** hard problems: the book must be rejected */
  blockers: { code: string; message: string }[];
  /** softer observations */
  notes: { code: string; message: string }[];
  names: Record<string, number>;
  encrypted: boolean;
  bytes: number;
  streamsInflated: number;
}
export interface ScanLimits { maxInflateTotal: number; maxInflateOne: number; maxMs: number }
export const DEFAULT_LIMITS: ScanLimits = { maxInflateTotal: 400 * 1024 * 1024, maxInflateOne: 64 * 1024 * 1024, maxMs: 12000 };

/** Names whose presence means the PDF can act on its own (or hides a payload). */
const DANGEROUS: Record<string, string> = {
  JavaScript: "contains JavaScript", JS: "contains JavaScript", Launch: "can launch a program", EmbeddedFile: "has a hidden attached file", EmbeddedFiles: "has hidden attached files",
  FileAttachment: "has an attached file", RichMedia: "has embedded media or Flash", XFA: "is a dynamic XFA form", SubmitForm: "can send form data somewhere", ImportData: "can import data",
  GoToE: "opens an embedded file", GoToR: "opens another file", Movie: "has an embedded movie", Sound: "has an embedded sound", Rendition: "has an embedded rendition", "3D": "has embedded 3D", U3D: "has embedded 3D",
};
const decodeName = (n: string) => n.replace(/#([0-9A-Fa-f]{2})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));

function collectNames(text: string, into: Record<string, number>) {
  for (const m of text.matchAll(/\/((?:[A-Za-z0-9_.+-]|#[0-9A-Fa-f]{2})+)/g)) {
    const n = decodeName(m[1]!);
    if (n.length > 40) continue;
    into[n] = (into[n] ?? 0) + 1;
  }
}

export function scanPdf(buf: Buffer, limits: ScanLimits = DEFAULT_LIMITS): PdfScan {
  const out: PdfScan = { ok: true, blockers: [], notes: [], names: {}, encrypted: false, bytes: buf.length, streamsInflated: 0 };
  const block = (code: string, message: string) => { if (!out.blockers.some((b) => b.code === code)) out.blockers.push({ code, message }); };
  const note = (code: string, message: string) => { if (!out.notes.some((b) => b.code === code)) out.notes.push({ code, message }); };
  const started = Date.now();

  if (buf.length < 100 || buf.subarray(0, 1024).indexOf("%PDF-") === -1) { block("not_pdf", "is not a PDF file"); out.ok = false; return out; }
  const head = buf.subarray(0, 1024).toString("latin1");
  if (!/%PDF-[12]\.\d/.test(head)) note("version", "has an unusual PDF version line");
  const tail = buf.subarray(Math.max(0, buf.length - 4096)).toString("latin1");
  if (!/%%EOF/.test(tail) || !/startxref/.test(buf.subarray(Math.max(0, buf.length - 8192)).toString("latin1"))) block("malformed", "looks cut off or damaged (no proper end of file)");

  const raw = buf.toString("latin1");
  collectNames(raw, out.names);

  // object streams (and any other Flate streams that are small enough) can hide objects from a plain search
  let total = 0, pos = 0, count = 0;
  while ((pos = raw.indexOf("stream", pos)) !== -1) {
    const afterKeyword = raw.slice(pos + 6, pos + 8);
    const start = pos + 6 + (afterKeyword.startsWith("\r\n") ? 2 : afterKeyword[0] === "\n" || afterKeyword[0] === "\r" ? 1 : 0);
    if (raw.slice(pos - 3, pos) === "end") { pos += 6; continue; } // "endstream"
    const dictStart = raw.lastIndexOf("obj", pos);
    const dict = dictStart >= 0 ? raw.slice(dictStart, pos) : "";
    const end = raw.indexOf("endstream", start);
    pos = end === -1 ? pos + 6 : end + 9;
    if (end === -1 || !/FlateDecode|\/Fl\b/.test(dict)) continue;
    const isObjStm = /\/ObjStm/.test(dict);
    const compressed = end - start;
    if (!isObjStm && compressed > 3 * 1024 * 1024) continue; // big picture streams: not an object container
    if (Date.now() - started > limits.maxMs) { note("scan_time", "was only partly scanned (time limit)"); break; }
    try {
      const data = inflateSync(buf.subarray(start, end), { maxOutputLength: limits.maxInflateOne, finishFlush: 2 /* Z_SYNC_FLUSH: tolerate a cut tail */ });
      total += data.length; count++;
      if (total > limits.maxInflateTotal) { block("bomb", "expands to an unreasonable size when opened (compression bomb)"); break; }
      if (compressed > 200 && data.length / compressed > 2000 && data.length > 16 * 1024 * 1024) { block("bomb", "contains a stream that expands thousands of times (compression bomb)"); break; }
      if (isObjStm || (data.length < 2 * 1024 * 1024 && /^[\x09\x0a\x0d\x20-\x7e]*$/.test(data.subarray(0, 200).toString("latin1")))) collectNames(data.toString("latin1"), out.names);
    } catch (e) {
      if ((e as { code?: string }).code === "ERR_BUFFER_TOO_LARGE") { block("bomb", "contains a stream that expands beyond the safe limit (compression bomb)"); break; }
      if (isObjStm) note("objstm", "has a damaged object stream");
    }
    if (++count > 200000) break;
  }
  out.streamsInflated = count;

  for (const [name, why] of Object.entries(DANGEROUS)) if (out.names[name]) block(`has_${name.toLowerCase()}`, why);
  if (out.names.Encrypt) { out.encrypted = true; block("encrypted", "is password-protected or encrypted"); }
  if (out.names.OpenAction) {
    if (/\/OpenAction\s*<</.test(raw)) block("openaction", "runs an action as soon as it is opened");
    else note("openaction", "has a go-to-page start setting (harmless)");
  }
  if (out.names.AA && /\/AA\s*(?:<<|\d+\s+\d+\s+R)/.test(raw)) block("additional_actions", "has automatic page or document actions");
  if (out.names.URI) note("links", "has web links (kept; opened only when a reader clicks)");
  if (out.names.AcroForm) note("form", "has form fields");
  out.ok = out.blockers.length === 0;
  return out;
}

/** Friendly, specific wording for the contributor. */
export const friendlyBlocker = (b: { code: string; message: string }) => `This PDF ${b.message}. For everyone's safety we cannot accept PDFs like this. Please save a clean copy (print to PDF) and try again.`;
