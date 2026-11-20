// Internet Archive: children's books that the UPLOADER marked with a Creative Commons licence (licenseurl in the item's metadata).
// Official JSON APIs: advancedsearch.php (list) and /metadata/<id> (files + licence). No key, no login.
import { asArray, classifyLicence, fetchJson, langCode, stripHtml } from "../lib.mjs";

const QUERY = 'mediatype:texts AND licenseurl:*creativecommons* AND (subject:children OR subject:juvenile OR subject:"picture book" OR subject:storybook OR subject:"story book" OR subject:"fairy tales" OR subject:kids) AND NOT collection:(inlibrary OR printdisabled)';
const PAGE = 50;

/** Pick the PDF to keep: the uploaded original if it is a PDF, else the site-made text PDF. Never a "_text.pdf" side file. */
export function pickPdf(files) {
  const pdfs = asArray(files).filter((f) => f && /\.pdf$/i.test(f.name ?? "") && f.private !== "true" && !/_(text|bw)\.pdf$/i.test(f.name) && Number(f.size) > 0);
  const original = pdfs.find((f) => f.source === "original");
  return original ?? pdfs.find((f) => /pdf/i.test(f.format ?? "")) ?? pdfs[0] ?? null;
}

export function candidateFromMetadata(id, meta) {
  const m = meta?.metadata ?? {};
  if (!m || String(m["access-restricted-item"]).toLowerCase() === "true") return { skip: "restricted" };
  const licence = classifyLicence(asArray(m.licenseurl)[0]);
  if (!licence) return { skip: "no-clear-licence" };
  const file = pickPdf(meta.files);
  if (!file) return { skip: "no-pdf" };
  const collections = asArray(m.collection).map(String);
  if (collections.some((c) => /^(inlibrary|printdisabled|lendinglibrary)$/.test(c))) return { skip: "lending-library" };
  return {
    sourceId: id,
    title: stripHtml(asArray(m.title)[0]),
    authors: asArray(m.creator).map((c) => stripHtml(c)).filter(Boolean),
    licence,
    language: langCode(asArray(m.language)[0]),
    subjects: asArray(m.subject).map(String),
    description: stripHtml(asArray(m.description).join(" ")).slice(0, 600),
    pdfUrl: `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(file.name)}`,
    sourceUrl: `https://archive.org/details/${encodeURIComponent(id)}`,
    bytes: Number(file.size),
  };
}

export default {
  id: "internet-archive",
  name: "Internet Archive (Creative Commons children's books)",
  async *candidates({ cursor, fetchImpl = fetch, pause }) {
    cursor.page = cursor.page || 1;
    for (;;) {
      const u = new URL("https://archive.org/advancedsearch.php");
      u.searchParams.set("q", QUERY);
      for (const f of ["identifier"]) u.searchParams.append("fl[]", f);
      u.searchParams.append("sort[]", "identifier asc");
      u.searchParams.set("rows", String(PAGE)); u.searchParams.set("page", String(cursor.page)); u.searchParams.set("output", "json");
      const j = await fetchJson(u.href, { fetchImpl });
      const docs = j?.response?.docs ?? [];
      if (!docs.length) return; // the whole list has been read: this site is finished
      for (const d of docs) {
        const id = d.identifier;
        if (!id) continue;
        yield { sourceId: id, lazy: async () => { await pause(); return candidateFromMetadata(id, await fetchJson(`https://archive.org/metadata/${encodeURIComponent(id)}`, { fetchImpl })); } };
      }
      cursor.page += 1;
      await pause();
    }
  },
};
