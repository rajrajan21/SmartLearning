import type { PanelId, SettingDef, SettingValue, ThemePreset } from "@studysmart/shared";

export type Values = Record<string, SettingValue>;
export interface AdminData { panels: { id: PanelId; label: string; help: string }[]; definitions: SettingDef[]; presets: ThemePreset[]; values: Values; overridden: string[] }
export interface AuditEntry { id?: number; key: string; oldValue: unknown; newValue: unknown; action: string; actor: string; createdAt: string }

export interface InviteCode { id: string; code: string; label: string | null; maxUses: number | null; uses: number; expiresAt: string | null; revokedAt: string | null; createdAt: string; status: "active" | "revoked" | "expired" | "used_up" }
export interface NewInviteCode { label?: string; maxUses?: number | null; expiresInDays?: number | null }

export class AdminError extends Error { constructor(message: string, readonly status: number) { super(message); } }

const KEY = "ss_admin_key";
const USER = "ss_admin_user";
/** The signed-in admin user id (kept in this tab only, like the key). */
export const adminUser = {
  get: () => { try { return sessionStorage.getItem(USER) ?? ""; } catch { return ""; } },
  set: (u: string) => { try { sessionStorage.setItem(USER, u); } catch { /* ignore */ } },
  clear: () => { try { sessionStorage.removeItem(USER); } catch { /* ignore */ } },
};
export const adminKey = {
  get: () => { try { return sessionStorage.getItem(KEY) ?? ""; } catch { return ""; } },
  set: (k: string) => { try { sessionStorage.setItem(KEY, k); } catch { /* ignore */ } },
  clear: () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } },
};

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/v1/admin${path}`, {
    method,
    headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()), ...(body ? { "content-type": "application/json" } : {}) },
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
  codes: () => call<{ codes: InviteCode[] }>("GET", "/access/codes"),
  createCode: (b: NewInviteCode) => call<{ code: InviteCode }>("POST", "/access/codes", b),
  revokeCode: (id: string) => call<{ ok: true }>("POST", `/access/codes/${id}/revoke`, {}),
  stats: (days: number) => call<StatsReport>("GET", `/stats?days=${days}`),
  upload: async (kind: "logo" | "banner", file: File) => {
    const res = await fetch(`/api/v1/admin/upload/${kind}`, { method: "PUT", headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()), "content-type": file.type }, body: file });
    if (!res.ok) { let m = "Could not upload the picture."; try { m = (await res.json()).error?.message ?? m; } catch { /* keep */ } throw new AdminError(m, res.status); }
    return (await res.json()) as { version: number };
  },
  removeUpload: async (kind: "logo" | "banner") => { await fetch(`/api/v1/admin/upload/${kind}`, { method: "DELETE", headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()) } }); },
  audit: () => call<{ entries: AuditEntry[] }>("GET", "/settings/audit?limit=50"),
};

export interface StatsReport { generatedAt: string; days: { date: string; views: number; visitors: number; signups: number; logins: number; questions: number }[]; totals: { views: number; visitors: number; signups: number; logins: number; questions: number }; topPages: { path: string; views: number }[]; server: { startedAt: string; uptimeSeconds: number; memoryMb: number; node: string; requests: number; errors: number; platform: string } }
