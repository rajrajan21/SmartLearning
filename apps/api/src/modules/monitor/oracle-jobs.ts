import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const jobUnit = /^(sharpstudy|studysmart)-[a-z0-9][a-z0-9-]{0,85}\.(service|timer)$/;
const patterns = ["sharpstudy-*.service", "sharpstudy-*.timer", "studysmart-*.service", "studysmart-*.timer"];
const fields = [
  "Id", "ActiveState", "SubState", "Result", "ExecMainStartTimestamp", "ExecMainExitTimestamp",
  "NextElapseUSecRealtime", "Triggers",
];
type Status = "running" | "starting" | "scheduled" | "complete" | "failed" | "idle";

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

/** Read only unit metadata. Logs, command lines and service environments never enter the admin response. */
export async function readOracleJobs() {
  if (process.platform !== "linux") return null;
  const run = (args: string[]) => exec("systemctl", args, {
    env: { ...process.env, LC_ALL: "C", TZ: "UTC", SYSTEMD_COLORS: "0" },
    timeout: 2500, maxBuffer: 256 * 1024,
  }).then((result) => result.stdout);
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
    const jobs = units.flatMap((u) => {
      const id = u.Id;
      if (!id?.endsWith(".service") || !jobUnit.test(id)) return [];
      const startedAt = timestamp(u.ExecMainStartTimestamp);
      const finishedAt = timestamp(u.ExecMainExitTimestamp);
      const nextRunAt = nextRuns.get(id) ?? null;
      nextRuns.delete(id);
      let status: Status = nextRunAt ? "scheduled" : "idle";
      if (u.ActiveState === "failed") status = "failed";
      else if (u.ActiveState === "activating") status = u.SubState === "start" && startedAt && !finishedAt ? "running" : "starting";
      else if (u.ActiveState === "active" && u.SubState !== "exited") status = "running";
      else if (!nextRunAt && startedAt && finishedAt && u.Result === "success") status = "complete";
      const end = status === "running" ? checkedAt : finishedAt;
      const elapsedSeconds = startedAt && end ? Math.max(0, Math.floor((Date.parse(end) - Date.parse(startedAt)) / 1000)) : null;
      return [{ id, status, startedAt, finishedAt, elapsedSeconds, nextRunAt }];
    });
    for (const [id, nextRunAt] of nextRuns) {
      jobs.push({ id, status: "scheduled", startedAt: null, finishedAt: null, elapsedSeconds: null, nextRunAt });
    }
    const order: Status[] = ["running", "starting", "failed", "scheduled", "complete", "idle"];
    jobs.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || a.id.localeCompare(b.id));
    return { checkedAt, jobs };
  } catch {
    return null;
  }
}
