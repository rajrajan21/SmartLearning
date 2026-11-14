import type { PanelId, SettingDef, SettingValue, ThemePreset } from "@studysmart/shared";

export type Values = Record<string, SettingValue>;
export interface AdminData { panels: { id: PanelId; label: string; help: string }[]; definitions: SettingDef[]; presets: ThemePreset[]; values: Values; overridden: string[] }
export interface AuditEntry { id?: number; key: string; oldValue: unknown; newValue: unknown; action: string; actor: string; createdAt: string }

export class AdminError extends Error { constructor(message: string, readonly status: number) { super(message); } }

const KEY = "ss_admin_key";
export const adminKey = {
  get: () => { try { return sessionStorage.getItem(KEY) ?? ""; } catch { return ""; } },
  set: (k: string) => { try { sessionStorage.setItem(KEY, k); } catch { /* ignore */ } },
  clear: () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } },
};

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/v1/admin${path}`, {
    method,
    headers: { "x-admin-key": adminKey.get(), ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AdminError((data as { error?: { message?: string } }).error?.message ?? `Request failed (${res.status})`, res.status);
  return data as T;
}
export const admin = {
  session: () => call<{ ok: true }>("GET", "/session"),
  load: () => call<AdminData>("GET", "/settings"),
  save: (changes: Values) => call<{ values: Values; overridden: string[] }>("PUT", "/settings", { changes }),
  reset: (keys: string[]) => call<{ values: Values; overridden: string[] }>("POST", "/settings/reset", { keys }),
  exportAll: () => call<{ exportedAt: string; values: Values }>("GET", "/settings/export"),
  importAll: (values: Values) => call<{ values: Values; overridden: string[] }>("POST", "/settings/import", { values }),
  audit: () => call<{ entries: AuditEntry[] }>("GET", "/settings/audit?limit=50"),
};
