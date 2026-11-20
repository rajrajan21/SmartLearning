#!/usr/bin/env node
// Sub-job 1: checks every website on the list (and the extra sites from Admin) and records what it found in sites-status.json:
// robots rules, reachability, PDFs found, and other sites it links to that offer papers (suggestions for the owner to review).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./lib/config.mjs";
import { get } from "./lib/http.mjs";
import { crawlSite } from "./lib/core.mjs";
import { loadState, saveState, sha } from "./lib/store.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const cfg = await loadConfig();
const sites = JSON.parse(readFileSync(join(here, "sites.json"), "utf8")).sites;
for (const u of cfg.extraSites ?? []) { try { sites.push({ id: "extra-" + sha(u).slice(0, 6), name: new URL(u).host, board: "stateboard", tier: "extra", enabled: true, entries: [u], follow: "question|paper|sample|model|worksheet|quiz", depth: 1 }); } catch { /* bad address */ } }
const state = loadState(); state.sites ??= {};
const out = { checkedAt: new Date().toISOString(), sites: [], suggestions: [] };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
for (const site of sites) {
  log(`checking ${site.id} ...`);
  const c = await crawlSite(site, { fetcher: (u, o) => get(u, { pauseMs: Math.max(cfg.pauseSeconds, site.pauseSeconds ?? 0) * 1000, ...o }), maxPages: 12 });
  const status = c.pages ? (c.candidates.length ? "ok" : "no-pdfs") : c.blocked === "robots" ? "blocked-robots" : c.blocked === "challenge" ? "needs-browser" : "unreachable";
  const sample = c.candidates.slice(0, 3).map((x) => x.url);
  out.sites.push({ id: site.id, name: site.name, board: site.board, tier: site.tier, enabled: site.enabled, status, pages: c.pages, pdfs: c.candidates.length, sample, note: c.errors[0] ?? "" });
  (state.sites[site.id] ??= {}).status = status; state.sites[site.id].checkedAt = out.checkedAt;
  for (const o of c.outbound) if (!out.suggestions.some((s) => s.host === o.host) && !sites.some((x) => x.entries.some((e) => e.includes(o.host)))) out.suggestions.push({ ...o, foundOn: site.id });
  log(`  ${status}: ${c.pages} pages, ${c.candidates.length} PDFs${c.errors[0] ? " (" + c.errors[0] + ")" : ""}`);
}
writeFileSync(join(here, "sites-status.json"), JSON.stringify(out, null, 1)); saveState(state);
log(`Wrote tools/papers/sites-status.json. ${out.sites.filter((s) => s.status === "ok").length} of ${out.sites.length} sites usable; ${out.suggestions.length} new sites suggested for you to review.`);
