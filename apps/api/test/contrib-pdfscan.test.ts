import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { cleanPdf, rawPdf } from "./contrib-fixtures.js";
import { scanPdf } from "../src/modules/contrib/pdfscan.js";

const codes = (b: Buffer) => scanPdf(b).blockers.map((x) => x.code);

describe("PDF structure scan", () => {
  it("passes an ordinary PDF", async () => {
    const s = scanPdf(await cleanPdf());
    expect(s.ok).toBe(true);
    expect(s.blockers).toEqual([]);
  });
  it("rejects JavaScript, including a name hidden with #xx escapes", () => {
    expect(codes(rawPdf("/OpenAction << /S /JavaScript /JS (app.alert(1)) >>"))).toContain("has_javascript");
    expect(codes(rawPdf("/AA << /O << /S /J#61vaScr#69pt /JS (x) >> >>"))).toContain("has_javascript");
  });
  it("rejects Launch actions, embedded files, rich media, XFA and form submission", () => {
    expect(codes(rawPdf("/OpenAction << /S /Launch /F (cmd.exe) >>"))).toContain("has_launch");
    expect(codes(rawPdf("/Names << /EmbeddedFiles << /Names [] >> >>"))).toContain("has_embeddedfiles");
    expect(codes(rawPdf("/AcroForm << /XFA [] >>"))).toContain("has_xfa");
    expect(codes(rawPdf("", "4 0 obj\n<< /Subtype /RichMedia >>\nendobj\n"))).toContain("has_richmedia");
    expect(codes(rawPdf("", "4 0 obj\n<< /S /SubmitForm /F (http://x) >>\nendobj\n"))).toContain("has_submitform");
  });
  it("rejects an encrypted PDF", () => { expect(codes(rawPdf("/Encrypt 9 0 R"))).toContain("encrypted"); });
  it("allows a harmless go-to-page start setting but blocks an inline start action", () => {
    expect(scanPdf(rawPdf("/OpenAction [3 0 R /Fit]")).ok).toBe(true);
    expect(codes(rawPdf("/OpenAction << /S /GoTo /D [3 0 R /Fit] >>"))).toContain("openaction");
  });
  it("finds JavaScript packed inside a compressed object stream", () => {
    const inner = "9 0 << /S /JavaScript /JS (app.launchURL(1)) >>";
    const z = deflateSync(Buffer.from(inner));
    const obj = Buffer.concat([Buffer.from(`4 0 obj\n<< /Type /ObjStm /N 1 /First 4 /Filter /FlateDecode /Length ${z.length} >>\nstream\n`), z, Buffer.from("\nendstream\nendobj\n")]);
    const b = rawPdf("", obj.toString("latin1"));
    expect(codes(b)).toContain("has_javascript");
  });
  it("detects a decompression bomb without expanding it", () => {
    const z = deflateSync(Buffer.alloc(80 * 1024 * 1024)); // 80 MB of zeros, a few KB packed
    const obj = Buffer.concat([Buffer.from(`4 0 obj\n<< /Type /ObjStm /Filter /FlateDecode /Length ${z.length} >>\nstream\n`), z, Buffer.from("\nendstream\nendobj\n")]);
    expect(codes(rawPdf("", obj.toString("latin1")))).toContain("bomb");
  });
  it("rejects a file that is not a PDF or is cut off", () => {
    expect(codes(Buffer.from("MZ" + "x".repeat(500)))).toContain("not_pdf");
    expect(codes(Buffer.from("%PDF-1.4\n" + "x".repeat(500)))).toContain("malformed");
  });
});
