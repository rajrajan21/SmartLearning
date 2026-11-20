import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { SettingsService } from "./service.js";

/** Keys switched ON once (2026-11-17, owner request): E-Library, Question papers, GK and the tour video in the footer. After this runs the admin can switch any of them off again and the choice sticks. */
const KEYS = ["feature.library", "feature.papers", "feature.gk", "gk.nav.show", "gk.home.show", "library.nav.show", "papers.nav.show", "papers.home.show", "tour.enabled", "tour.footer.show", "tour.page.enabled"];

export async function migrateEnableSections(settings: SettingsService, markerFile: string): Promise<string[]> {
  if (existsSync(markerFile)) return [];
  try {
    const now = await settings.all();
    const changes: Record<string, unknown> = {};
    for (const k of KEYS) if (k in now && now[k] !== true) changes[k] = true;
    if (Object.keys(changes).length) await settings.update(changes, "migration:enable-sections-v1", "migrate");
    mkdirSync(dirname(markerFile), { recursive: true });
    writeFileSync(markerFile, JSON.stringify({ done: new Date().toISOString(), switchedOn: Object.keys(changes) }));
    return Object.keys(changes);
  } catch (e) {
    console.error("enable-sections migration skipped:", e);
    return [];
  }
}

/** Papers collector job switched ON once (2026-11-17, owner approved harvesting every listed website). The collector still runs only when the owner starts the bats on the PC. */
export async function migrateEnablePapersJob(settings: SettingsService, markerFile: string): Promise<string[]> {
  if (existsSync(markerFile)) return [];
  try {
    const now = await settings.all();
    const changes: Record<string, unknown> = {};
    if ("papers.job.enabled" in now && now["papers.job.enabled"] !== true) changes["papers.job.enabled"] = true;
    if (Object.keys(changes).length) await settings.update(changes, "migration:enable-papers-job-v1", "migrate");
    mkdirSync(dirname(markerFile), { recursive: true });
    writeFileSync(markerFile, JSON.stringify({ done: new Date().toISOString(), switchedOn: Object.keys(changes) }));
    return Object.keys(changes);
  } catch (e) {
    console.error("enable-papers-job migration skipped:", e);
    return [];
  }
}
