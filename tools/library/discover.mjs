// Sub-job 1: DISCOVERY. Checks every site on the list (tools/library/sites.json plus the extra addresses from Admin):
// reachable? what does robots.txt say? is a licence stated? are there PDF links? Writes state/sites-report.json.
// Also asks Internet Archive for more children's-book collections worth adding. Nothing is downloaded from a site here.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { HERE, ROOT, UA, classifyLicence, fetchJson, fetchRetry, loadConfig, parseList, parseRobots, readJson, robotsAllows, writeJsonAtomic } from "./lib.mjs";

export async function probeSite(home, { fetchImpl = fetch } = {}) {
  const out = { home, reachable: false, robotsAllowsUs: null, licenceHints: [], pdfLinks: 0, notes: [] };
  let origin;
  try { origin = new URL(home).origin; } catch { out.notes.push("not a web address"); return out; }
  try {
    const rr = await fetchRetry(`${origin}/robots.txt`, { fetchImpl, tries: 1, timeoutMs: 15000 });
    if (rr.ok) { const g = parseRobots(await rr.text()); out.robotsAllowsUs = robotsAllows(g, new URL(home).pathname || "/"); if (!out.robotsAllowsUs) out.notes.push("robots.txt asks bots to stay out of this page"); } else out.notes.push(`no robots.txt (HTTP ${rr.status})`);
  } catch (e) { if (e.name === "Blocked") out.blocked = true; out.notes.push(`robots.txt: ${String(e.message ?? e).slice(0, 60)}`); }
  if (out.robotsAllowsUs === false || out.blocked) return out;
  try {
    const res = await fetchRetry(home, { fetchImpl, tries: 2, timeoutMs: 20000 });
    out.reachable = res.ok; out.status = res.status;
    if (res.ok) {
      const html = (await res.text()).slice(0, 600000);
      const hints = new Set();
      for (const m of html.matchAll(/creativecommons\.org\/(?:licenses|publicdomain)\/[a-z-]+\/[0-9.]+/gi)) { const l = classifyLicence(`https://${m[0]}`); if (l) hints.add(l.code); }
      out.licenceHints = [...hints];
      out.pdfLinks = (html.match(/href="[^"]+\.pdf(?:\?[^"]*)?"/gi) ?? []).length;
      if (!hints.size) out.notes.push("no Creative Commons wording found on the home page: read the site's terms before building a reader");
    }
  } catch (e) { out.notes.push(`home page: ${e.name === "Blocked" ? `blocked (${e.status})` : String(e.message ?? e).slice(0, 60)}`); if (e.name === "Blocked") out.blocked = true; }
  return out;
}

export async function iaCollections({ fetchImpl = fetch, rows = 30 } = {}) {
  const u = new URL("https://archive.org/advancedsearch.php");
  u.searchParams.set("q", 'mediatype:collection AND (subject:children OR title:children OR title:"picture books" OR title:storybook)');
  for (const f of ["identifier", "title", "description"]) u.searchParams.append("fl[]", f);
  u.searchParams.set("rows", String(rows)); u.searchParams.set("output", "json");
  const j = await fetchJson(u.href, { fetchImpl });
  return (j?.response?.docs ?? []).map((d) => ({ id: d.identifier, title: String(d.title ?? ""), url: `https://archive.org/details/${d.identifier}` }));
}

async function main() {
  const cfg = await loadConfig();
  const sites = readJson(join(HERE, "sites.json"), { sites: [] }).sites;
  const extra = parseList(cfg.extraSites).map((x) => x).filter(Boolean);
  const report = { at: new Date().toISOString(), userAgent: UA, sites: [], pictureBookShortlist: [], extra: [], iaCollections: [] };
  const lines = [`E-Library site discovery ${report.at}`];
  const orderedSites = [...sites].sort((a, b) => (a.pictureBooks?.priority ?? Infinity) - (b.pictureBooks?.priority ?? Infinity));
  for (const s of orderedSites) {
    if (!s.home || s.status === "not-allowed") { report.sites.push({ id: s.id, status: s.status, skipped: "not-allowed or no address" }); lines.push(`${s.id}: ${s.status} (not checked)`); continue; }
    const p = await probeSite(s.home);
    report.sites.push({ id: s.id, status: s.status, ...p });
    if (s.pictureBooks) {
      const review = p.reachable && !p.blocked && p.robotsAllowsUs !== false ? "edition review" : "source unavailable";
      report.pictureBookShortlist.push({ id: s.id, catalogue: s.home, review, ...s.pictureBooks });
      lines.push(`Picture-book source: ${s.name} (${review}). ${s.pictureBooks.reason}`);
    }
    lines.push(`${s.id} [${s.status}] ${p.reachable ? "reachable" : "NOT reachable"}; licence on page: ${p.licenceHints.join(",") || "none"}; pdf links: ${p.pdfLinks}; ${p.notes.join("; ")}`);
    await new Promise((r) => setTimeout(r, 2500));
  }
  for (const raw of (cfg.extraSites || "").split(",").map((x) => x.trim()).filter(Boolean)) {
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const p = await probeSite(url);
    report.extra.push(p);
    lines.push(`extra ${url}: ${p.reachable ? "reachable" : "NOT reachable"}; licence: ${p.licenceHints.join(",") || "none"}; ${p.notes.join("; ")} -> listed only; a developer must add a reader before anything is downloaded`);
    await new Promise((r) => setTimeout(r, 2500));
  }
  void extra;
  try { report.iaCollections = await iaCollections(); lines.push(`Internet Archive children's collections found: ${report.iaCollections.length} (see sites-report.json)`); } catch (e) { lines.push(`Internet Archive collections: ${String(e.message ?? e).slice(0, 80)}`); }
  lines.push("For each PDF, review all pages for coherent illustrations, readable text, an appropriate reading age and clean layout. Verify the publisher, redistribution licence, credits, and the exact PDF before approving.");
  writeJsonAtomic(join(HERE, "state", "sites-report.json"), report);
  writeFileSync(join(ROOT, "library-discover-report.txt"), lines.join("\n") + "\n");
  console.log(lines.join("\n"));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error(e); process.exit(1); });
