import { useCallback, useEffect, useState } from "react";
import { admin, type JobUpdate, type MonitorData, type OracleJobInventory } from "./api";

const unavailable = "Unavailable";
const number = (n: number) => n.toLocaleString();
const date = (value?: string | null) => value ? new Date(value).toLocaleString() : unavailable;
function bytes(value?: number | null) {
  if (value == null) return unavailable;
  if (value < 1024) return number(value) + " B";
  const units = ["KiB", "MiB", "GiB", "TiB"];
  const power = Math.min(units.length, Math.floor(Math.log(value) / Math.log(1024)));
  return (value / 1024 ** power).toLocaleString(undefined, { maximumFractionDigits: 1 }) + " " + units[power - 1];
}
const duration = (seconds: number) => Math.floor(seconds / 86400) + "d " + Math.floor(seconds / 3600 % 24) + "h " + Math.floor(seconds / 60 % 60) + "m";
const status = (data: JobUpdate | null) => data?.stale ? "Stale" : data ? data.status[0]!.toUpperCase() + data.status.slice(1) : "Unknown";
const errors = { speech: "Speech clips were skipped", process: "The build process reported an error", skipped: "Some requested clips are missing" };
const jobLabels: Record<string, string> = {
  "sharpstudy-papers.service": "Question-paper collection",
  "sharpstudy-quiet-voices.service": "Quiet voices (Priya & Ram)",
  "sharpstudy-db-backup.service": "Nightly database backup",
  "sharpstudy-ereader-grade7.service": "Class 7 textbook rendering",
  "sharpstudy-ereader-core.service": "Textbook rendering",
  "sharpstudy-depth-release.service": "Lesson release",
  "sharpstudy-depth-verify.service": "Lesson release verification",
};
const jobStatus = { running: "Running", waiting: "Waiting", starting: "Starting", scheduled: "Scheduled", complete: "Completed", failed: "Failed", idle: "Idle" };
const jobName = (id: string) => jobLabels[id] ?? id.replace(/^(sharpstudy|studysmart)-/, "").replace(/\.service$/, "").replaceAll("-", " ");
const jobDuration = (seconds: number) => seconds >= 3600 ? duration(seconds) : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

function useSnapshot<T,>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    const read = () => void load().then((next) => {
      if (active) { setData(next); setFailed(false); }
    }).catch(() => { if (active) setFailed(true); });
    read();
    const timer = setInterval(read, 30_000);
    return () => { active = false; clearInterval(timer); };
  }, [load, refresh]);
  return { data, failed, reload: () => setRefresh((revision) => revision + 1) };
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="admin-metric"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

function OracleJobs({ inventory, compact }: { inventory?: OracleJobInventory | null; compact?: boolean }) {
  if (!inventory) return <p>Oracle job status is unavailable.</p>;
  const { jobs, checkedAt } = inventory;
  const count = (state: OracleJobInventory["jobs"][number]["status"]) => jobs.filter(job => job.status === state).length;
  return <section aria-label="Oracle server jobs">
    <h3>Oracle server</h3>
    <div className="admin-metrics">
      <Metric label="Running" value={number(count("running"))} />
      <Metric label="Waiting" value={number(count("waiting"))} />
      <Metric label="Starting" value={number(count("starting"))} />
      <Metric label="Scheduled" value={number(count("scheduled"))} />
      <Metric label="Failed" value={number(count("failed"))} />
    </div>
    <p className="small">Last checked {date(checkedAt)}. Refreshes every 30 seconds.</p>
    {!compact && <div className="admin-metrics">
      {jobs.map((job) => <article className="admin-metric" key={job.id}>
        <h4>{jobName(job.id)}</h4>
        <span className="ops-status" data-status={job.status}>{jobStatus[job.status]}</span>
        {job.phase && <small>{job.phase}</small>}
        {job.startedAt && <small>{job.status === "running" || job.status === "waiting" ? "Started" : "Last started"} {date(job.startedAt)}</small>}
        {job.finishedAt && job.status !== "running" && job.status !== "waiting" && <small>Finished {date(job.finishedAt)}</small>}
        {job.elapsedSeconds !== null && <small>{job.status === "running" ? "Running for" : job.status === "waiting" ? "Waiting for" : "Last runtime"} {jobDuration(job.elapsedSeconds)}</small>}
        {job.nextRunAt && <small>Next run {date(job.nextRunAt)}</small>}
      </article>)}
      {!jobs.length && <p>No SharpStudy jobs currently listed by Oracle.</p>}
    </div>}
  </section>;
}

function AudioJob({ item, label }: { item: JobUpdate | null; label: string }) {
  return <article className="admin-metric">
    <h3>{label}</h3>
    {item ? <>
      <span className="ops-status" data-status={item.stale ? "unknown" : item.status}>{status(item)}</span>
      <p>{item.phase ?? "Phase unavailable"}</p>
      {item.total !== null && item.completed !== null && <>
        <progress max={item.total} value={item.completed} aria-label={label + " clip progress"} />
        <span>{number(item.completed)} / {number(item.total)} clips</span>
      </>}
      <small>Log updated {date(item.updatedAt)}</small>
      {item.error && <small>{errors[item.error]}</small>}
    </> : <p>No PC job report received.</p>}
  </article>;
}

export function Jobs({ compact, onOpen }: { compact?: boolean; onOpen?: () => void }) {
  const { data, failed, reload } = useSnapshot(admin.jobs);
  return <section className="ops-section">
    <div className="a-head"><div><h2>Background jobs</h2></div>
      {compact ? <button className="btn ghost sm" onClick={onOpen}>Open Jobs</button> : <button className="btn ghost sm" onClick={reload}>Refresh</button>}
    </div>
    {failed && <p role="alert">Could not refresh jobs. {data && "Showing the last successful reading."}</p>}
    {!data && !failed && <p role="status">Loading job updates…</p>}
    {data && <>
      <OracleJobs inventory={data.inventory} compact={compact} />
      {!compact && <div className="admin-metrics ops-job-reports">
        <AudioJob label="Windows PC audio" item={data.windows} />
        {data.oracle && <AudioJob label="Oracle audio progress" item={data.oracle} />}
      </div>}
    </>}
  </section>;
}

export function Operations({ overview, open }: { overview: boolean; open: (tab: "monitor" | "jobs" | "reports" | "audiocover" | "gallery") => void }) {
  const { data, failed, reload } = useSnapshot(admin.monitor);
  const [checking, setChecking] = useState(false);
  const [coverageError, setCoverageError] = useState(false);
  const checkCoverage = useCallback(async () => {
    setChecking(true); setCoverageError(false);
    try { await admin.audioCoverage(); reload(); } catch { setCoverageError(true); }
    finally { setChecking(false); }
  }, [reload]);
  return <>
    <div className="a-head ops-heading">
      <div><h2>{overview ? "Overview" : "Site monitor"}</h2><p>{overview ? "Service health, background jobs and quick access to site tools." : "Host measurements and the last 14 days of site activity."}</p></div>
      <button className="btn ghost sm" onClick={reload}>Refresh</button>
    </div>
    {failed && <p role="alert">Could not refresh the site monitor. {data && "Showing the last successful reading."}</p>}
    {!data && !failed && <p role="status">Reading site metrics…</p>}
    {data && <Health data={data} overview={overview} />}
    {overview ? <>
      <Jobs compact onOpen={() => open("jobs")} />
      <section className="ops-section">
        <h2>Site tools</h2>
        <div className="ops-actions">
          <button className="btn" onClick={() => open("gallery")}>Choose a layout</button>
          <button className="btn ghost" onClick={() => open("monitor")}>Site monitor</button>
          <button className="btn ghost" onClick={() => open("reports")}>Reports</button>
          <button className="btn ghost" onClick={() => open("audiocover")}>Audio coverage</button>
        </div>
      </section>
    </> : data && <>
      <section className="ops-section">
        <div className="a-head"><div><h2>Content and audio</h2><p>{data.coverage ? "Audio checked " + date(data.coverage.generatedAt) : "Audio coverage has not been sampled by this API process yet."}</p></div>
          <button className="btn ghost sm" onClick={checkCoverage} disabled={checking}>{checking ? "Checking…" : "Load coverage"}</button>
        </div>
        {coverageError && <p role="alert">Could not check audio coverage.</p>}
        <div className="admin-metrics">
          {([["Lessons", data.lessons], ["Question sets", data.questions], ["Classroom boards", data.classrooms]] as const).map(([label, value]) => <Metric key={label} label={label} value={value ? (value.complete ? "" : "≥ ") + number(value.files) : unavailable} detail="Files on disk" />)}
          <Metric label="Recordings listed" value={data.coverage ? number(data.coverage.recordings) : unavailable} />
          {data.coverage && <Metric label="Audio across content" value={number(data.coverage.complete) + " complete"} detail={number(data.coverage.partial) + " partial · " + number(data.coverage.missing) + " without coverage"} />}
        </div>
        <button className="link" onClick={() => open("audiocover")}>Open detailed audio coverage</button>
      </section>
      <section className="ops-section">
        <h2>Reports and recent API errors</h2>
        <p>{data.reports ? number(data.reports.open) + " new · " + number(data.reports.total) + " total reports" : "Reports unavailable"}</p>
        <button className="link" onClick={() => open("reports")}>Open reports</button>
        {data.recentErrors.length ? <ul>{data.recentErrors.map((error, i) => <li key={i}>{date(error.at)} · HTTP {error.status}</li>)}</ul> :
          <p className="small">No API errors observed since this process started.</p>}
      </section>
    </>}
  </>;
}

function Health({ data, overview }: { data: MonitorData; overview: boolean }) {
  return <>
    <div className="admin-metrics">
      <Metric label="API service" value={data.service} detail={"Running " + duration(data.uptime)} />
      <Metric label="CPU" value={data.cpu == null ? unavailable : data.cpu + "%"} detail={data.load ? "Load averages · " + data.load.map((n) => n.toFixed(2)).join(" / ") : "Load averages unavailable"} />
      <Metric label="Memory used" value={bytes(data.memory.total - data.memory.free)} detail={bytes(data.memory.total) + " total · " + bytes(data.memory.process) + " API"} />
      <Metric label="Disk free" value={bytes(data.disk?.free)} detail={data.disk ? bytes(data.disk.total) + " total on content volume" : undefined} />
      <Metric label="Page views · 14 days" value={data.traffic ? number(data.traffic.views) : unavailable} detail={data.traffic ? number(data.traffic.visitors) + " daily visitors combined" : undefined} />
      <Metric label="API requests · 14 days" value={data.traffic ? number(data.traffic.requests) : unavailable} detail={data.traffic ? number(data.traffic.errors) + " server errors" : undefined} />
    </div>
    {!overview && <>
      <section className="ops-section">
        <h2>Storage and backups</h2>
        <p>Measured {date(data.measuredAt)} · Host uptime {duration(data.hostUptime)}</p>
        <div className="admin-metrics">
          {([["Audio", data.audio], ["Content", data.content], ["Uploads", data.uploads], ["Backups", data.backups]] as const).map(([label, value]) => <Metric label={label} key={label} value={(value?.complete === false ? "≥ " : "") + bytes(value?.bytes)} detail={value?.complete === false ? "Partial scan" : undefined} />)}
          <Metric label="Database" value={bytes(data.database)} />
          <Metric label="Latest backup file" value={date(data.backups?.recentBackups?.[0]?.at)} />
        </div>
        {!!data.backups?.recentBackups?.length && <details>
          <summary>Recent backup files</summary>
          <ul>{data.backups.recentBackups.map((backup, i) => <li key={i}>{date(backup.at)} · {bytes(backup.bytes)}</li>)}</ul>
        </details>}
      </section>
      {data.traffic && <section className="ops-section"><h2>Daily traffic</h2>
        <div className="admin-table"><table className="log"><thead><tr><th>Date (UTC)</th><th>Views</th><th>Visitors</th><th>Sign-ups</th><th>Practice answers</th></tr></thead>
          <tbody>{data.traffic.days.slice().reverse().map((day) => <tr key={day.date}><td>{day.date}</td><td>{number(day.views)}</td><td>{number(day.visitors)}</td><td>{number(day.signups)}</td><td>{number(day.questions)}</td></tr>)}</tbody></table></div>
      </section>}
    </>}
  </>;
}
