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
  monitor: () => call<MonitorData>("GET", "/monitor"),
  jobs: () => call<Record<"oracle" | "windows", JobUpdate | null>>("GET", "/monitor/jobs"),
  session: () => call<{ ok: true }>("GET", "/session"),
  load: () => call<AdminData>("GET", "/settings"),
  save: (changes: Values) => call<{ values: Values; overridden: string[] }>("PUT", "/settings", { changes }),
  reset: (keys: string[]) => call<{ values: Values; overridden: string[] }>("POST", "/settings/reset", { keys }),
  exportAll: () => call<{ exportedAt: string; values: Values }>("GET", "/settings/export"),
  importAll: (values: Values) => call<{ values: Values; overridden: string[] }>("POST", "/settings/import", { values }),
  codes: () => call<{ codes: InviteCode[] }>("GET", "/access/codes"),
  createCode: (b: NewInviteCode) => call<{ code: InviteCode }>("POST", "/access/codes", b),
  revokeCode: (id: string) => call<{ ok: true }>("POST", `/access/codes/${id}/revoke`, {}),
  problemReports: () => call<{ reports: { id: string; kind: string; about: string; text: string; at: string; status: "new" | "seen" | "fixed" }[] }>("GET", "/reports"),
  setReportStatus: (id: string, status: "new" | "seen" | "fixed") => call<{ ok: true }>("PATCH", `/reports/${id}`, { status }),
  mailStatus: () => call<{ lastSent: string | null; lastResult: string | null }>("GET", "/mail"),
  mailTest: (to: string) => call<{ ok: true }>("POST", "/mail/test", { to }),
  mailRun: () => call<{ sent: number; failed: number; skipped: string | null }>("POST", "/mail/run", {}),
  usage: (days: number) => call<{ days: { day: number; aiAnswers: number }[]; totalAi: number; busiestAi: number; avgAi: number; accounts: number; children: number; answers: number; limitPerChild: number; costNote: string }>("GET", `/usage?days=${days}`),
  stats: (days: number) => call<StatsReport>("GET", `/stats?days=${days}`),
  upload: async (kind: "logo" | "banner", file: File) => {
    const res = await fetch(`/api/v1/admin/upload/${kind}`, { method: "PUT", headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()), "content-type": file.type }, body: file });
    if (!res.ok) { let m = "Could not upload the picture."; try { m = (await res.json()).error?.message ?? m; } catch { /* keep */ } throw new AdminError(m, res.status); }
    return (await res.json()) as { version: number };
  },
  removeUpload: async (kind: "logo" | "banner") => { await fetch(`/api/v1/admin/upload/${kind}`, { method: "DELETE", headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()) } }); },
  audioCoverage: (refresh = false) => call<AudioCoverage>("GET", `/audio-coverage${refresh ? "?refresh=1" : ""}`),
  papersStatus: () => call<PapersStatus>("GET", "/papers/status"),
  papersHide: (ids: string[]) => call<{ hidden: number }>("POST", "/papers/hide", { ids }),
  papersShow: (ids: string[]) => call<{ hidden: number }>("POST", "/papers/show", { ids }),
  papersResetCollector: () => call<{ resetCounter: number }>("POST", "/papers/reset-collector", {}),
  audit: () => call<{ entries: AuditEntry[] }>("GET", "/settings/audit?limit=50"),
};

export interface StatsReport { generatedAt: string; days: { date: string; views: number; visitors: number; signups: number; logins: number; questions: number }[]; totals: { views: number; visitors: number; signups: number; logins: number; questions: number }; topPages: { path: string; views: number }[]; server: { startedAt: string; uptimeSeconds: number; memoryMb: number; node: string; requests: number; errors: number; platform: string } }

export interface PapersSiteRow { id: string; name: string; board: string; tier: string; defaultOn: boolean; hideKey: string; dailyCap: number; pauseSeconds: number; license: string; status: string }
export interface PapersJobSite { id?: string; name?: string; status?: string; added?: number; note?: string }
export interface PapersJob { startedAt?: string; finishedAt?: string; added?: number; skipped?: number; failed?: number; configSource?: string; storageMB?: number; sites?: PapersJobSite[]; log?: string[] }
export interface AudioCoverageRow { kind: string; item: string; board: string; cls: number | null; subject: string; total: number; have: number[]; status: "complete" | "partial" | "none"; missing: string[] }
export interface AudioCoverage { generatedAt: string; voices: string[]; voiceLabels: Record<string, string>; checkedFiles: boolean; manifestClips: number; manifestMissingFiles: number; skippedNoVoice: string[]; rows: AudioCoverageRow[] }
export interface PapersStatus { total: number; visible: number; updated: string; byBoard: [string, number][]; byClass: [string, number][]; bySubject: [string, number][]; byKind: [string, number][]; bySite: [string, number][]; questions: number; withAnswers: number; hiddenIds: string[]; job: PapersJob | null; sites: PapersSiteRow[]; config: { disabledSites: string; enabledSites: string; hiddenSites: string; siteCaps: string }; papers: { id: string; title: string; board: string; cls: number; subject: string; kind: string; questions: number; keyed: number; site: string; added: string; hidden: boolean }[] }

type MeasuredSize = { bytes: number; files: number; complete: boolean; recentBackups: { at: string; bytes: number }[] };
export interface JobUpdate {
  phase: string | null; status: "running" | "complete" | "partial" | "failed" | "unknown";
  completed: number | null; total: number | null; updatedAt: string; stale: boolean;
  error: "speech" | "process" | "skipped" | null;
}
export interface MonitorData {
  service: string; uptime: number; hostUptime: number; cpu: number | null; load: number[] | null;
  memory: { free: number; total: number; process: number };
  disk: { free: number; total: number } | null;
  content: MeasuredSize | null; audio: MeasuredSize | null; uploads: MeasuredSize | null; backups: MeasuredSize | null;
  lessons: MeasuredSize | null; questions: MeasuredSize | null; classrooms: MeasuredSize | null;
  database: number | null; measuredAt: string;
  traffic: (StatsReport["totals"] & { requests: number; errors: number; days: StatsReport["days"] }) | null;
  reports: { total: number; open: number } | null;
  recentErrors: { at: string; status: number }[];
  coverage: { recordings: number; complete: number; partial: number; missing: number; generatedAt: string } | null;
}
