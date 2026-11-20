// Job settings: the Admin > Question papers panel values (read from the live site's public settings at the start of each run),
// falling back to tools/papers/config.json when the site cannot be reached (for example before it is online).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const csv = (v) => String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
export async function loadConfig(fetchImpl = fetch) {
  const local = JSON.parse(readFileSync(join(here, "../config.json"), "utf8"));
  let from = "tools/papers/config.json";
  const cfg = { ...local };
  if (process.env.PAPERS_OFFLINE !== "1") {
    try {
      const r = await fetchImpl(`${local.siteUrl}/api/v1/settings/public`, { signal: AbortSignal.timeout(15000) });
      if (r.ok) {
        const v = (await r.json()).values ?? {};
        if ("papers.job.enabled" in v) {
          from = `${local.siteUrl} (Admin settings)`;
          cfg.enabled = v["papers.job.enabled"] === true && v["feature.papers"] !== false;
          cfg.perRun = Number(v["papers.job.perRun"] ?? cfg.perRun); cfg.runsPerDay = Number(v["papers.job.runsPerDay"] ?? cfg.runsPerDay);
          cfg.boards = csv(v["papers.job.boards"]); cfg.classes = v["papers.job.classes"] ?? cfg.classes;
          cfg.disabledSites = csv(v["papers.job.disabledSites"]); cfg.extraSites = csv(v["papers.job.extraSites"]);
          cfg.browserMode = v["papers.job.browserMode"] === true; cfg.pauseSeconds = Number(v["papers.job.pauseSeconds"] ?? cfg.pauseSeconds); cfg.maxMB = Number(v["papers.storage.maxMB"] ?? cfg.maxMB);
          cfg.perSiteMax = Number(v["papers.job.perSiteMax"] ?? 0); cfg.siteCaps = String(v["papers.job.siteCaps"] ?? ""); cfg.subjects = csv(v["papers.job.subjects"]); cfg.kinds = csv(v["papers.job.kinds"]); cfg.enabledSites = csv(v["papers.job.enabledSites"]);
          cfg.maxFileMB = Number(v["papers.job.maxFileMB"] ?? 15); cfg.recrawlHours = Number(v["papers.job.recrawlHours"] ?? 24); cfg.retryHours = Number(v["papers.job.retryHours"] ?? 6);
          cfg.minQuestions = Number(v["papers.job.minQuestions"] ?? 5); cfg.requireKey = v["papers.job.requireKey"] === true; cfg.resetCounter = Number(v["papers.job.resetCounter"] ?? 0); cfg.maxPapers = Number(v["papers.storage.maxPapers"] ?? 5000);
        }
      }
    } catch { /* site not reachable: use the local file */ }
  }
  const d = { siteCaps: "", perSiteMax: 0, subjects: [], kinds: [], enabledSites: [], maxFileMB: 15, recrawlHours: 24, retryHours: 6, minQuestions: 5, requireKey: false, resetCounter: 0, maxPapers: 5000 };
  return { ...d, ...cfg, from };
}
