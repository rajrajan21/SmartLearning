import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const job = fileURLToPath(new URL("../../../../../tools/library/reviewed.mjs", import.meta.url));
type Settings = Record<string, unknown>;

export function librarySlot(now: number, count: number, begin: number, finish: number): string | null {
  const ist = new Date(now + 330 * 60_000);
  const minute = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const from = begin * 60;
  const until = finish * 60;
  if (from >= until || minute < from || minute >= until) return null;
  const width = (until - from) / Math.max(1, count);
  const slot = Math.floor((minute - from) / width);
  return `${ist.toISOString().slice(0, 10)}:${Math.floor(from + slot * width)}`;
}

/** Runs on the app server. A persisted slot claim prevents a service restart from duplicating that batch. */
export function startLibraryCollector(dir: string, settings: () => Promise<Settings>) {
  const path = join(dir, "collector", "schedule.json");
  let busy = false;
  async function tick() {
    if (busy) return;
    busy = true;
    try {
      const values = await settings();
      if (values["feature.library"] !== true || values["library.job.enabled"] !== true) return;
      const count = Math.max(1, Math.min(12, Number(values["library.job.runsPerDay"] ?? 3)));
      const slot = librarySlot(Date.now(), count, Number(values["library.job.startHour"] ?? 0), Number(values["library.job.endHour"] ?? 24));
      if (!slot) return;
      const done: string[] = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : [];
      if (done.includes(slot)) return;
      mkdirSync(dirname(path), { recursive: true });
      const temp = `${path}.tmp`;
      writeFileSync(temp, JSON.stringify([...done, slot].slice(-40)));
      renameSync(temp, path);
      await new Promise<void>((resolve, reject) => {
        const p = spawn(process.execPath, [job], {
          env: { PATH: process.env.PATH, LIBRARY_DIR: dir, LIBRARY_JOB_SETTINGS: JSON.stringify(values) },
          stdio: ["ignore", "inherit", "inherit"], windowsHide: true,
        });
        p.once("error", reject);
        p.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Collector exited ${code}`)));
      });
    } catch (err) {
      console.error("library_collector_failed", err instanceof Error ? err.message : "error");
    } finally { busy = false; }
  }
  setInterval(() => void tick(), 5 * 60_000).unref();
}
