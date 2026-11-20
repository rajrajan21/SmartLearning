// Wikimedia Commons: every file there is free-licensed by policy; the licence is read from each file's own page data.
// Official MediaWiki API, no key. A real contact in the User-Agent is Wikimedia's rule (see lib.mjs UA).
import { classifyLicence, fetchJson, langCode, stripHtml } from "../lib.mjs";

const TERMS = ["children's book", "picture book", "storybook for children", "fairy tales children", "kids story", "illustrated children's story", "children's reader", "nursery rhymes book"];
const PAGE = 40;

export function candidateFromPage(p) {
  const ii = p?.imageinfo?.[0];
  if (!ii || ii.mime !== "application/pdf" || !ii.url) return { skip: "not-pdf" };
  const x = ii.extmetadata ?? {};
  const licence = classifyLicence(x.LicenseUrl?.value) ?? classifyLicence(x.LicenseShortName?.value) ?? classifyLicence(x.UsageTerms?.value);
  if (!licence) return { skip: "no-clear-licence" };
  const title = stripHtml(x.ObjectName?.value) || String(p.title ?? "").replace(/^File:/, "").replace(/\.pdf$/i, "").replace(/_/g, " ");
  const author = stripHtml(x.Artist?.value);
  return {
    sourceId: String(p.pageid ?? p.title),
    title,
    authors: author ? [author.slice(0, 120)] : [],
    licence,
    language: langCode(x.Language?.value) || "",
    subjects: stripHtml(x.Categories?.value).split("|").filter(Boolean).slice(0, 10),
    description: stripHtml(x.ImageDescription?.value).slice(0, 600),
    pdfUrl: ii.url,
    sourceUrl: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
    bytes: Number(ii.size) || 0,
  };
}

export default {
  id: "wikimedia-commons",
  name: "Wikimedia Commons (free-licensed PDF children's books)",
  async *candidates({ cursor, fetchImpl = fetch, pause }) {
    cursor.term = cursor.term || 0;
    cursor.offset = cursor.offset || 0;
    while (cursor.term < TERMS.length) {
      const u = new URL("https://commons.wikimedia.org/w/api.php");
      const q = { action: "query", generator: "search", gsrsearch: `${TERMS[cursor.term]} filetype:pdf`, gsrnamespace: "6", gsrlimit: String(PAGE), gsroffset: String(cursor.offset), prop: "imageinfo", iiprop: "url|size|mime|extmetadata", format: "json", formatversion: "2" };
      for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
      const j = await fetchJson(u.href, { fetchImpl });
      const pages = j?.query?.pages ?? [];
      for (const p of pages) { const c = candidateFromPage(p); yield c.skip ? { sourceId: String(p.pageid), ...c } : c; }
      const next = j?.continue?.gsroffset;
      if (next === undefined) { cursor.term += 1; cursor.offset = 0; } else cursor.offset = next;
      await pause();
    }
  },
};
