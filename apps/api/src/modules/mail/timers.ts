import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { SettingsService } from "../settings/service.js";
import type { MailService } from "./service.js";

const tool = resolve(dirname(fileURLToPath(import.meta.url)), "../../tools/backup.mjs");

/** True once a day, after the chosen hour. */
export const backupDue = (now: Date, hour: number, lastDay: string | null): boolean => now.getHours() >= hour && lastDay !== now.toISOString().slice(0, 10);

/** One check every 30 minutes: weekly e-mail, and the daily backup. Both are switched in Admin > Reports. */
export function startTimers(settings: SettingsService, mail: MailService | undefined, log: (m: string) => void = console.log): () => void {
  let lastBackup: string | null = null;
  const check = async () => {
    try {
      if (mail) await mail.tick();
      const all = await settings.all();
      const now = new Date();
      if (all["backup.enabled"] === true && backupDue(now, Number(all["backup.hour"]), lastBackup)) {
        lastBackup = now.toISOString().slice(0, 10);
        execFile(process.execPath, [tool], { env: { ...process.env, BACKUP_KEEP: String(Number(all["backup.keep"]) || 14) }, timeout: 300000 }, (e) => { if (e) log(`Backup failed: ${e.message.slice(0, 160)}`); });
      }
    } catch (e) { log(`Timer check failed: ${(e as Error).message.slice(0, 160)}`); }
  };
  const t = setInterval(() => { void check(); }, 30 * 60 * 1000);
  t.unref();
  return () => clearInterval(t);
}
