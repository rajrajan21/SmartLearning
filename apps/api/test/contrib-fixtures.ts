import { PDFDocument, StandardFonts } from "pdf-lib";

export async function cleanPdf(pages: string[] = ["Hello world. A story for children."]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const t of pages) { const p = doc.addPage([400, 500]); (t.match(/.{1,44}(\s|$)/g) ?? [t]).forEach((line, i) => p.drawText(line.trim(), { x: 20, y: 450 - i * 16, size: 11, font })); }
  return Buffer.from(await doc.save({ useObjectStreams: false }));
}
/** A hand-written PDF whose catalog carries the given extra text (an action, a name...). */
export function rawPdf(extraCatalog: string, extraObjects = ""): Buffer {
  const body = `%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R ${extraCatalog} >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>\nendobj\n${extraObjects}`;
  return Buffer.from(`${body}xref\n0 1\n0000000000 65535 f \ntrailer\n<< /Root 1 0 R /Size 4 >>\nstartxref\n${body.length}\n%%EOF\n`, "latin1");
}
