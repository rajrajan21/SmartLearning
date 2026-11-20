import { useEffect, useState } from "react";
import { adminKey, adminUser } from "./api";

interface Status {
  classroom: { lessons: number; builtAt: string | null; lastBuildMs: number; fromDiskCache: boolean; incremental: boolean } | null;
  startup: { savedAt: string; curriculumFiles: number; lessonFiles: number; questionFiles: number; skippedTotal: number; skipped: { file: string; why: string }[] } | null;
  nodeMemoryMb: number; uptimeSeconds: number;
}

async function call(method: string, path = ""): Promise<Status> {
  const res = await fetch(`/api/v1/admin/perf${path}`, { method, headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()) } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as Status;
}

/** Admin > Site and performance: what the speed-ups are doing, with buttons to rebuild them. The switches are the "Speed" settings above. */
export function PerfAdmin() {
  const [s, setS] = useState<Status | null>(null), [err, setErr] = useState(""), [busy, setBusy] = useState("");
  const run = (m: string, p = "") => { setBusy(p || "load"); setErr(""); void call(m, p).then(setS).catch((e: Error) => setErr(e.message)).finally(() => setBusy("")); };
  useEffect(() => { run("GET"); }, []);
  if (!s) return <p className="small">{err || "Loading speed status ..."}</p>;
  const c = s.classroom, st = s.startup;
  return (
    <div className="admin-perf">
      <h3>Speed status</h3>
      <table className="table"><tbody>
        <tr><th scope="row">Server running for</th><td>{Math.round(s.uptimeSeconds / 60)} min, using {s.nodeMemoryMb} MB</td></tr>
        <tr><th scope="row">Start-up loading</th><td>{st ? `Last saved ${new Date(st.savedAt).toLocaleString()}: ${st.curriculumFiles} curriculum, ${st.lessonFiles} lesson and ${st.questionFiles} question files are marked as loaded; only new or changed files are loaded at the next start.` : "No marks yet (the next start loads everything once)."}</td></tr>
        {st && st.skippedTotal > 0 && <tr><th scope="row">Waiting for their chapter</th><td>{st.skippedTotal} files are skipped until their topic exists in the curriculum (retried at every start): {st.skipped.slice(0, 5).map((x) => x.file).join(", ")}{st.skippedTotal > 5 ? " ..." : ""}</td></tr>}
        <tr><th scope="row">Classroom boards</th><td>{c ? `${c.lessons} classroom pages ready${c.builtAt ? ` (built ${new Date(c.builtAt).toLocaleTimeString()} in ${(c.lastBuildMs / 1000).toFixed(1)} s${c.fromDiskCache ? ", from the saved copy" : ""}${c.incremental ? ", only changed files are rebuilt" : ""})` : ""}.` : "Not built yet."}</td></tr>
      </tbody></table>
      <p>
        <button className="btn" disabled={!!busy} onClick={() => run("POST", "/rebuild-classroom")}>Rebuild classroom boards now</button>{" "}
        <button className="btn" disabled={!!busy} onClick={() => run("POST", "/clear-curriculum-cache")}>Clear the curriculum cache</button>{" "}
        <button className="btn" disabled={!!busy} onClick={() => { if (window.confirm("Load every lesson and question again at the next start? (takes a few minutes once)")) run("POST", "/reload-all-next-start"); }}>Reload everything at next start</button>
      </p>
      {err && <p role="alert" className="small">{err}</p>}
    </div>
  );
}
