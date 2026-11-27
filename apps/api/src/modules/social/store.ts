import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { LedgerEntry, RunRecord, SocialSecrets, SocialState } from "./types.js";

const emptyState = (): SocialState => ({ bucketUsed: {}, counter: 0, recent: [], slotsDone: [], consecutiveFailures: 0 });
const SECRET_FIELDS = ["fbPageId", "fbPageToken", "igUserId", "igToken", "appId", "appSecret"] as const;
export type SecretField = (typeof SECRET_FIELDS)[number];
export const isSecretField = (k: string): k is SecretField => (SECRET_FIELDS as readonly string[]).includes(k);

/** All Social files live in one folder outside git (data/social): ledger, rotation memory, run log, secrets and the built media. */
export interface SocialStore {
  dir: string; mediaDir: string;
  ledger(): LedgerEntry[]; saveLedger(l: LedgerEntry[]): void;
  state(): SocialState; saveState(s: SocialState): void;
  runs(): RunRecord[]; addRun(r: RunRecord): void;
  secrets(): SocialSecrets; saveSecrets(p: Partial<Record<SecretField, string>>): void; clearSecrets(): void;
  secretsStatus(): Record<SecretField, boolean>;
  killFile(): boolean;
  mediaPath(name: string): string; removeMedia(name: string | undefined): void; mediaFiles(): { name: string; mtimeMs: number }[];
}

function readJson<T>(p: string, d: T): T { try { return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : d; } catch { return d; } }
function writeJson(p: string, v: unknown, mode?: number) { const t = p + ".tmp"; writeFileSync(t, JSON.stringify(v, null, 1), mode ? { mode } : undefined); renameSync(t, p); if (mode) { try { chmodSync(p, mode); } catch { /* not supported on this system */ } } }

export function createSocialStore(dir: string): SocialStore {
  const mediaDir = join(dir, "media"); mkdirSync(mediaDir, { recursive: true });
  const f = (n: string) => join(dir, n);
  return {
    dir, mediaDir,
    ledger() {
      const path = f("ledger.json");
      if (!existsSync(path)) return [];
      const entries: unknown = JSON.parse(readFileSync(path, "utf8"));
      if (!Array.isArray(entries)) throw new Error("Social posting history could not be read.");
      return entries as LedgerEntry[];
    },
    saveLedger: (l) => writeJson(f("ledger.json"), l),
    state: () => ({ ...emptyState(), ...readJson<Partial<SocialState>>(f("state.json"), {}) }),
    saveState: (s) => writeJson(f("state.json"), s),
    runs: () => readJson<RunRecord[]>(f("runs.json"), []),
    addRun: (r) => writeJson(f("runs.json"), [...readJson<RunRecord[]>(f("runs.json"), []), r].slice(-300)),
    secrets: () => readJson<SocialSecrets>(f("secrets.json"), {}),
    saveSecrets(p) {
      const cur = readJson<Record<string, string>>(f("secrets.json"), {});
      for (const k of SECRET_FIELDS) { if (p[k] === undefined) continue; const v = String(p[k]).trim(); if (v) cur[k] = v; else delete cur[k]; }
      writeJson(f("secrets.json"), cur, 0o600);
    },
    clearSecrets() { try { unlinkSync(f("secrets.json")); } catch { /* none */ } },
    secretsStatus() { const s = readJson<Record<string, string>>(f("secrets.json"), {}); return Object.fromEntries(SECRET_FIELDS.map((k) => [k, !!s[k]])) as Record<SecretField, boolean>; },
    killFile: () => existsSync(f("KILL")),
    mediaPath: (name) => join(mediaDir, name.replace(/[^\w.-]/g, "")),
    removeMedia(name) { if (name) try { unlinkSync(join(mediaDir, name.replace(/[^\w.-]/g, ""))); } catch { /* already gone */ } },
    mediaFiles: () => readdirSync(mediaDir).map((name) => ({ name, mtimeMs: statSync(join(mediaDir, name)).mtimeMs })),
  };
}
