import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const jobUnit = /^(sharpstudy|studysmart)-[a-z0-9][a-z0-9-]{0,85}\.(service|timer)$/;
const patterns = ["sharpstudy-*.service", "sharpstudy-*.timer", "studysmart-*.service", "studysmart-*.timer"];
const fields = [
  "Id", "ActiveState", "SubState", "Result", "StatusText", "ExecMainPID", "ExecMainStartTimestamp", "ExecMainExitTimestamp",
  "NextElapseUSecRealtime", "Triggers",
];
export type OracleJobStatus = "running" | "waiting" | "starting" | "scheduled" | "complete" | "failed" | "idle";
export interface OracleJobEntry {
  id: string;
  status: OracleJobStatus;
  phase: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  elapsedSeconds: number | null;
  nextRunAt: string | null;
}

const WAITING_STATUS_RE = /\b(wait|waiting|lock|locked|paused|queued|idle)\b/i;
const WORKER_PROCS = new Set(["node", "python", "python3", "tsx", "ffmpeg", "edge-tts"]);
const WAIT_PROCS = new Set(["flock", "sleep"]);

function timestamp(value?: string) {
  const date = Date.parse(value ?? "");
  return Number.isFinite(date) ? new Date(date).toISOString() : null;
}

function sections(output: string) {
  return output.trim().split(/\r?\n\r?\n/).map((block) => Object.fromEntries(block.split(/\r?\n/).flatMap((line) => {
    const i = line.indexOf("=");
    return i > 0 ? [[line.slice(0, i), line.slice(i + 1)]] : [];
  })));
}

/** Pure classifier so waiting-on-lock vs active recording phases can be unit-tested on any OS. */
export function classifyOracleJob(
  u: Record<string, string | undefined>,
  nextRunAt: string | null,
  checkedAt: string,
  childComms: string[] = [],
): OracleJobEntry | null {
  const id = u.Id;
  if (!id?.endsWith(".service") || !jobUnit.test(id)) return null;
  const startedAt = timestamp(u.ExecMainStartTimestamp);
  const finishedAt = timestamp(u.ExecMainExitTimestamp);
  let status: OracleJobStatus = nextRunAt ? "scheduled" : "idle";
  let phase: string | null = null;
  if (u.ActiveState === "failed") status = "failed";
  else if (u.ActiveState === "activating") status = u.SubState === "start" && startedAt && !finishedAt ? "running" : "starting";
  else if (u.ActiveState === "active" && u.SubState !== "exited") status = "running";
  else if (!nextRunAt && startedAt && finishedAt && u.Result === "success") status = "complete";

  if (status === "running") {
    const statusText = (u.StatusText ?? "").trim();
    const hasWorker = childComms.some((c) => WORKER_PROCS.has(c));
    const hasWaiter = childComms.some((c) => WAIT_PROCS.has(c));
    if (WAITING_STATUS_RE.test(statusText)) {
      status = "waiting";
      phase = /lock/i.test(statusText) ? "Waiting on shared audio lock" : "Waiting";
    } else if (!hasWorker && hasWaiter) {
      status = "waiting";
      phase = childComms.includes("flock") ? "Waiting on shared audio lock" : "Paused between batches";
    } else if (hasWorker && /audio|kani|quiet-voices/i.test(id)) {
      phase = "Recording audio";
    }
  }

  const end = status === "running" || status === "waiting" ? checkedAt : finishedAt;
  const elapsedSeconds = startedAt && end ? Math.max(0, Math.floor((Date.parse(end) - Date.parse(startedAt)) / 1000)) : null;
  return { id, status, phase, startedAt, finishedAt, elapsedSeconds, nextRunAt };
}

/** Read only unit metadata. Logs, command lines and service environments never enter the admin response. */
export async function readOracleJobs() {
  if (process.platform !== "linux") return null;
  const run = (args: string[]) => exec("systemctl", args, {
    env: { ...process.env, LC_ALL: "C", TZ: "UTC", SYSTEMD_COLORS: "0" },
    timeout: 2500, maxBuffer: 256 * 1024,
  }).then((result) => result.stdout);
  const readChildComms = async (pidRaw?: string): Promise<string[]> => {
    const pid = Number(pidRaw ?? 0);
    if (!Number.isInteger(pid) || pid <= 1) return [];
    try {
      const out = await exec("ps", ["-o", "comm=", "--ppid", String(pid)], { timeout: 1000, maxBuffer: 64 * 1024 }).then((r) => r.stdout);
      return out.split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    } catch {
      return [];
    }
  };
  try {
    const list = await run(["list-units", "--all", "--plain", "--no-pager", "--no-legend", ...patterns]);
    const names = [...new Set(list.split(/\r?\n/).map((line) => line.trim().split(/\s+/, 1)[0] ?? "").filter((name) => jobUnit.test(name)))];
    const units = names.length ? sections(await run(["show", "--no-pager", "--property=" + fields.join(","), ...names])) : [];
    const checkedAt = new Date().toISOString();
    const nextRuns = new Map<string, string>();
    for (const u of units) {
      if (!u.Id?.endsWith(".timer") || u.ActiveState !== "active") continue;
      const next = timestamp(u.NextElapseUSecRealtime);
      if (!next) continue;
      const targets = u.Triggers?.split(/\s+/).filter((id) => jobUnit.test(id) && id.endsWith(".service")) ?? [];
      for (const target of targets.length ? targets : [u.Id.replace(/\.timer$/, ".service")]) {
        const previous = nextRuns.get(target);
        if (!previous || next < previous) nextRuns.set(target, next);
      }
    }
    const jobs: OracleJobEntry[] = [];
    for (const u of units) {
      const id = u.Id;
      if (!id?.endsWith(".service") || !jobUnit.test(id)) continue;
      const nextRunAt = nextRuns.get(id) ?? null;
      nextRuns.delete(id);
      const active = u.ActiveState === "active" && u.SubState !== "exited";
      const comms = active ? await readChildComms(u.ExecMainPID) : [];
      const entry = classifyOracleJob(u, nextRunAt, checkedAt, comms);
      if (entry) jobs.push(entry);
    }
    for (const [id, nextRunAt] of nextRuns) {
      jobs.push({ id, status: "scheduled", phase: null, startedAt: null, finishedAt: null, elapsedSeconds: null, nextRunAt });
    }
    const order: OracleJobStatus[] = ["running", "waiting", "starting", "failed", "scheduled", "complete", "idle"];
    jobs.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || a.id.localeCompare(b.id));
    return { checkedAt, jobs };
  } catch {
    return null;
  }
}
