import { useCallback, useEffect, useState } from "react";
import { adminKey, adminUser } from "./api";

interface FileRow { slot: string; name: string; bytes: number; at: string }
const hdr = () => ({ "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()) });
const SLOTS: { slot: string; label: string; accept: string; help: string }[] = [
  { slot: "video-en", label: "English video (MP4)", accept: "video/mp4", help: "H.264 / AAC, 720p, up to 60 MB." },
  { slot: "video-ta", label: "Tamil video (MP4)", accept: "video/mp4", help: "Same format. Pick \"uploaded\" in the Which video fields above to use it." },
  { slot: "poster-en", label: "English cover picture (JPG)", accept: "image/jpeg", help: "Shown before the video plays. Up to 2 MB." },
  { slot: "poster-ta", label: "Tamil cover picture (JPG)", accept: "image/jpeg", help: "" },
  { slot: "vtt-en", label: "English captions (.vtt)", accept: ".vtt,text/vtt", help: "Optional. Lets the Captions button work on an uploaded video." },
  { slot: "vtt-ta", label: "Tamil captions (.vtt)", accept: ".vtt,text/vtt", help: "" },
];

/** Replace or upload the tour videos, covers and captions. The other options are the settings fields above. */
export function TourAdmin() {
  const [files, setFiles] = useState<FileRow[] | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const load = useCallback(() => { fetch("/api/v1/admin/tour", { headers: hdr() }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Request failed (${r.status})`)))).then((d: { files: FileRow[] }) => { setFiles(d.files); setErr(""); }, (e: Error) => setErr(e.message)); }, []);
  useEffect(load, [load]);
  const send = async (slot: string, f: File) => {
    setBusy(slot); setMsg(""); setErr("");
    try {
      const r = await fetch(`/api/v1/admin/tour/${slot}`, { method: "PUT", headers: { ...hdr(), "content-type": f.type || "application/octet-stream" }, body: f });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((d as { error?: { message?: string } }).error?.message ?? `Upload failed (${r.status})`);
      setMsg("Uploaded. Now choose \"uploaded\" in the Which video fields above and raise the version number so everyone gets the new one."); load();
    } catch (e) { setErr((e as Error).message); } finally { setBusy(""); }
  };
  const del = async (slot: string) => { await fetch(`/api/v1/admin/tour/${slot}`, { method: "DELETE", headers: hdr() }); setMsg("Removed. The built-in video plays instead."); load(); };
  return (
    <section className="group tour-admin" data-testid="tour-admin">
      <h3>Replace or upload videos</h3>
      <p className="small">The site ships with a built-in English video (with a voice) and a Tamil video (Tamil captions and music). Upload your own to replace either, with its cover picture and captions. Removing an upload brings the built-in one back.</p>
      {err && <p className="error" role="alert">{err}</p>}
      {msg && <p role="status">{msg}</p>}
      <div className="tour-files">
        {SLOTS.map((x) => {
          const row = files?.find((f) => f.slot === x.slot);
          return (
            <div key={x.slot} className="tour-file">
              <b>{x.label}</b>
              <p className="small">{row ? `Uploaded ${row.at.slice(0, 10)}, ${(row.bytes / 1048576).toFixed(1)} MB` : "Nothing uploaded"}{x.help ? ` · ${x.help}` : ""}</p>
              <input type="file" accept={x.accept} disabled={busy === x.slot} aria-label={x.label} onChange={(e) => { const f = e.target.files?.[0]; if (f) void send(x.slot, f); e.target.value = ""; }} />
              {row && <button type="button" className="btn small" onClick={() => void del(x.slot)}>Remove</button>}
            </div>
          );
        })}
      </div>
      <h3>Rebuild the built-in video</h3>
      <p className="small">On the owner PC, double-click <b>Build-Tour-Video.bat</b> in the main folder. It records fresh screens from the site, renders the video, and writes a log to <b>tools\tour\build-report.txt</b>. Then publish as usual. Wording and chapters come from <b>tools/tour/script.json</b>.</p>
    </section>
  );
}
