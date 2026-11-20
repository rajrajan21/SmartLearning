import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
let pdftotext = null;
function hasPdftotext() {
  if (pdftotext !== null) return pdftotext;
  try { execFileSync("pdftotext", ["-v"], { stdio: "ignore" }); pdftotext = true; } catch (e) { pdftotext = e?.code !== "ENOENT" && e?.status !== undefined; }
  return pdftotext;
}
/** text of a PDF with page breaks as form feeds. Uses pdftotext when installed, otherwise pdf.js from the web app's node_modules. */
export async function pdfToText(buf) {
  const dir = mkdtempSync(join(tmpdir(), "papers-"));
  const f = join(dir, "in.pdf");
  try {
    writeFileSync(f, buf);
    if (hasPdftotext()) return execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", f, "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const cands = [join(here, "../../../apps/web/node_modules/pdfjs-dist/legacy/build/pdf.mjs"), join(here, "../../../node_modules/pdfjs-dist/legacy/build/pdf.mjs")];
    const p = cands.find(existsSync);
    if (!p) throw new Error("No PDF reader found: install poppler (pdftotext) or run pnpm install.");
    const pdfjs = await import("file://" + p.replace(/\\/g, "/"));
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true, verbosity: 0 }).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const items = (await (await doc.getPage(i)).getTextContent()).items.filter((x) => x.str !== undefined);
      const rows = new Map();
      for (const it of items) { const y = Math.round(it.transform[5] / 3) * 3; (rows.get(y) ?? rows.set(y, []).get(y)).push(it); }
      pages.push([...rows.entries()].sort((a, b) => b[0] - a[0]).map(([, r]) => r.sort((a, b) => a.transform[4] - b.transform[4]).map((x) => x.str).join(" ").replace(/\s+/g, " ").trim()).join("\n"));
    }
    return pages.join("\f");
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
