import { useState } from "react";
import { admin } from "./api";

/** Upload the logo and the home banner. Pictures are kept on the server; press Save afterwards to switch them on. */
export function Branding({ values, onVersion }: { values: Record<string, unknown>; onVersion: (key: string, v: number) => void }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const one = (kind: "logo" | "banner", label: string, key: string, hint: string) => {
    const v = Number(values[key] ?? 0);
    const pick = async (f: File | undefined) => {
      if (!f) return; setBusy(true); setMsg("");
      try { const r = await admin.upload(kind, f); onVersion(key, r.version); setMsg(`${label} uploaded. Press Save to show it on the site.`); } catch (e) { setMsg(e instanceof Error ? e.message : "Upload failed."); } finally { setBusy(false); }
    };
    const clear = async () => { setBusy(true); try { await admin.removeUpload(kind); onVersion(key, 0); setMsg(`${label} removed. Press Save.`); } finally { setBusy(false); } };
    return (
      <div className="brand-row"><b>{label}</b>
        {v > 0 ? <img src={`/uploads/${kind}?v=${v}`} alt={label} /> : <span>None yet (built-in look).</span>}
        <label className="btn ghost sm">{busy ? "Working…" : "Choose picture"}<input type="file" accept="image/png,image/jpeg,image/webp" hidden disabled={busy} onChange={(e) => void pick(e.target.files?.[0])} /></label>
        {v > 0 && <button type="button" className="btn ghost sm" onClick={() => void clear()} disabled={busy}>Remove</button>}
        <small>{hint}</small>
      </div>
    );
  };
  return (
    <div className="branding">
      {one("logo", "Logo", "brand.logoVersion", "PNG, JPG or WebP, up to 2 MB. A wide picture with a clear background works best; it is shown about 42 pixels tall.")}
      {one("banner", "Home banner", "brand.bannerVersion", "PNG, JPG or WebP, up to 2 MB. About 1600 × 400 pixels works well.")}
      {msg && <p role="status">{msg}</p>}
    </div>
  );
}
