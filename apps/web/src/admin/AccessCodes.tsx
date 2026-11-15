import { useCallback, useEffect, useState } from "react";
import { admin, AdminError, type InviteCode } from "./api";

const STATUS: Record<InviteCode["status"], string> = { active: "Working", revoked: "Cancelled", expired: "Expired", used_up: "All uses taken" };

/** Make, share and cancel invite codes. The mode switch itself is the "Who can open the site" setting above (saved with the Save bar). */
export function AccessCodes({ defaultMaxUses, defaultExpiryDays, mode }: { defaultMaxUses: number; defaultExpiryDays: number; mode: string }) {
  const [codes, setCodes] = useState<InviteCode[] | null>(null);
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState(String(defaultMaxUses));
  const [days, setDays] = useState(String(defaultExpiryDays));
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setCodes((await admin.codes()).codes); } catch (e) { setCodes([]); setMsg({ kind: "err", text: e instanceof AdminError ? e.message : "Could not load the codes." }); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const r = await admin.createCode({ label: label.trim() || undefined, maxUses: Math.max(0, Math.floor(Number(maxUses) || 0)), expiresInDays: Math.max(0, Math.floor(Number(days) || 0)) });
      setMsg({ kind: "ok", text: `New code: ${r.code.code}` }); setLabel(""); await load();
    } catch (x) { setMsg({ kind: "err", text: x instanceof Error ? x.message : "Could not make the code." }); } finally { setBusy(false); }
  };
  const revoke = async (c: InviteCode) => {
    if (!confirm(`Cancel code ${c.code}? Everyone who got in with it will be asked for a new code.`)) return;
    try { await admin.revokeCode(c.id); setMsg({ kind: "ok", text: `Cancelled ${c.code}.` }); await load(); } catch (x) { setMsg({ kind: "err", text: x instanceof Error ? x.message : "Could not cancel." }); }
  };
  const copy = (c: InviteCode) => { void navigator.clipboard?.writeText(c.code).then(() => setMsg({ kind: "ok", text: `Copied ${c.code}` })).catch(() => undefined); };

  return (
    <fieldset className="group" aria-label="Invite codes">
      <legend>Invite codes</legend>
      <p>{mode === "invite" ? "The site is closed: visitors need one of the working codes below." : "The site is open to everyone right now. Codes only matter when you choose \"Invitation only\" above and save."}</p>
      <form onSubmit={create} className="codeform">
        <label>Note to yourself (optional)<input value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Class 3 parents" /></label>
        <label>How many people can use it (0 = no limit)<input type="number" min={0} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} /></label>
        <label>Stops working after this many days (0 = never)<input type="number" min={0} value={days} onChange={(e) => setDays(e.target.value)} /></label>
        <button className="btn" disabled={busy}>{busy ? "Making…" : "Make a new code"}</button>
      </form>
      {msg && <p role="status" className={msg.kind === "err" ? "err" : "ok"}><b>{msg.text}</b></p>}
      {codes === null ? <p className="loading">Loading…</p> : codes.length === 0 ? <p>No codes yet.</p> : (
        <table className="log">
          <thead><tr><th>Code</th><th>Note</th><th>Used</th><th>Ends</th><th>State</th><th></th></tr></thead>
          <tbody>{codes.map((c) => (
            <tr key={c.id}>
              <td><code>{c.code}</code></td><td>{c.label ?? ""}</td>
              <td>{c.uses}{c.maxUses === null ? "" : ` of ${c.maxUses}`}</td>
              <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
              <td>{STATUS[c.status]}</td>
              <td>
                <button type="button" className="btn ghost sm" onClick={() => copy(c)}>Copy</button>{" "}
                {c.status !== "revoked" && <button type="button" className="btn ghost sm" onClick={() => revoke(c)}>Cancel code</button>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </fieldset>
  );
}
