import { createHash } from "node:crypto";
import { desc, eq, inArray } from "drizzle-orm";
import { SETTINGS, SETTINGS_BY_KEY, parseSetting, publicSettings, resolveSettings, type SettingValue } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";

export interface SettingsService {
  all(): Promise<Record<string, SettingValue>>;
  overrides(): Promise<string[]>;
  getPublic(): Promise<{ values: Record<string, SettingValue>; version: string }>;
  update(changes: Record<string, unknown>, actor: string, action?: string): Promise<Record<string, SettingValue>>;
  reset(keys: string[], actor: string): Promise<Record<string, SettingValue>>;
  exportAll(): Promise<{ exportedAt: string; values: Record<string, SettingValue> }>;
  audit(limit: number): Promise<{ key: string; action: string; oldValue: unknown; newValue: unknown; changedBy: string; changedAt: string }[]>;
}

export class SettingsError extends Error {}

export function createSettingsService(db: Db): SettingsService {
  let cache: { stored: Record<string, unknown>; resolved: Record<string, SettingValue> } | null = null;
  const load = async () => {
    if (cache) return cache;
    const rows = await db.select().from(s.settings);
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    cache = { stored, resolved: resolveSettings(stored) };
    return cache;
  };
  const validateAll = (changes: Record<string, unknown>) => {
    const clean: Record<string, SettingValue> = {};
    const errors: string[] = [];
    for (const [k, v] of Object.entries(changes)) {
      try { clean[k] = parseSetting(k, v); } catch (e) { errors.push((e as Error).message); }
    }
    if (errors.length) throw new SettingsError(errors.join("; "));
    return clean;
  };

  return {
    async all() { return (await load()).resolved; },
    async overrides() { return Object.keys((await load()).stored); },
    async getPublic() {
      const values = publicSettings((await load()).resolved);
      const version = createHash("sha1").update(JSON.stringify(values)).digest("hex").slice(0, 12);
      return { values, version };
    },
    async update(changes, actor, action = "update") {
      const clean = validateAll(changes); // all or nothing
      const { resolved } = await load();
      await db.transaction(async (tx) => {
        for (const [key, value] of Object.entries(clean)) {
          if (JSON.stringify(resolved[key]) === JSON.stringify(value)) continue; // unchanged
          await tx.insert(s.settings).values({ key, value, updatedBy: actor })
            .onConflictDoUpdate({ target: s.settings.key, set: { value, updatedAt: new Date(), updatedBy: actor } });
          await tx.insert(s.settingsAudit).values({ key, action, oldValue: resolved[key] ?? null, newValue: value, changedBy: actor });
        }
      });
      cache = null;
      return (await load()).resolved;
    },
    async reset(keys, actor) {
      const unknown = keys.filter((k) => !SETTINGS_BY_KEY.has(k));
      if (unknown.length) throw new SettingsError(`Unknown setting: ${unknown[0]}`);
      const { resolved, stored } = await load();
      const toReset = keys.filter((k) => k in stored);
      if (toReset.length) {
        await db.transaction(async (tx) => {
          await tx.delete(s.settings).where(inArray(s.settings.key, toReset));
          for (const key of toReset) await tx.insert(s.settingsAudit).values({ key, action: "reset", oldValue: resolved[key] ?? null, newValue: SETTINGS_BY_KEY.get(key)!.default, changedBy: actor });
        });
      }
      cache = null;
      return (await load()).resolved;
    },
    async exportAll() {
      const { resolved, stored } = await load();
      return { exportedAt: new Date().toISOString(), values: Object.fromEntries(Object.keys(stored).filter((k) => SETTINGS_BY_KEY.has(k)).map((k) => [k, resolved[k]!])) };
    },
    async audit(limit) {
      const rows = await db.select().from(s.settingsAudit).orderBy(desc(s.settingsAudit.changedAt)).limit(Math.min(limit, 200));
      return rows.map((r) => ({ key: r.key, action: r.action, oldValue: r.oldValue, newValue: r.newValue, changedBy: r.changedBy, changedAt: r.changedAt.toISOString() }));
    },
  };
}

export { SETTINGS };
