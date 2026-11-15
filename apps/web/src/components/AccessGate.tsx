import { useEffect, useState, type ReactNode } from "react";
import { SITE } from "@studysmart/shared";

interface Status { mode: "public" | "invite"; granted: boolean; message?: { en: string; ta?: string } }

/**
 * Invitation-only sites: the server shows its own invite page to new visitors. This is the safety net inside the app
 * (for a copy of the app kept offline, or an invite that was switched on or cancelled while the page was open).
 * It renders the app straight away and only swaps in the gate if the server says the visitor is not let in.
 * Any odd answer (offline, older server) means "open": the server's own door is what really protects the site.
 */
export function AccessGuard({ children }: { children: ReactNode }) {
  const [gate, setGate] = useState<Status | null>(null);
  useEffect(() => {
    let live = true;
    void fetch("/api/access/status", { credentials: "same-origin" })
      .then((r) => (r.ok ? (r.json() as Promise<Status>) : null))
      .then((s) => { if (live && s && s.mode === "invite" && s.granted === false) setGate(s); })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);
  if (gate) return <AccessGate message={gate.message} onDone={() => setGate(null)} />;
  return <>{children}</>;
}

export function AccessGate({ message, onDone }: { message?: { en: string; ta?: string }; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const msg = message ?? { en: "This site is open by invitation only. Please enter your invite code.", ta: "இந்தத் தளம் அழைப்பின் மூலம் மட்டுமே திறந்திருக்கிறது. உங்கள் அழைப்புக் குறியீட்டை உள்ளிடுங்கள்." };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/access/redeem", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      if (r.ok) { onDone(); return; }
      setErr(r.status === 429 ? "Too many tries. Please wait a few minutes. · சிறிது நேரம் காத்திருங்கள்." : "That code did not work. Please check it. · குறியீடு சரியில்லை.");
    } catch { setErr("No connection. · இணைப்பு இல்லை."); } finally { setBusy(false); }
  };
  return (
    <main className="paper" style={{ maxWidth: "28rem", margin: "10vh auto", padding: "1.5rem" }} aria-labelledby="gate-h">
      <h1 id="gate-h">{SITE.name}</h1>
      <p>{msg.en}</p>
      <p lang="ta">{msg.ta ?? msg.en}</p>
      <form onSubmit={submit} autoComplete="off">
        <label htmlFor="invite-code"><b>Enter your invite code</b> · <span lang="ta">உங்கள் அழைப்புக் குறியீட்டை உள்ளிடுங்கள்</span></label>
        <input id="invite-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder={`${SITE.inviteCodePrefix}-XXXX-XXXX`} maxLength={40} autoCapitalize="characters" spellCheck={false} style={{ width: "100%", boxSizing: "border-box", font: "inherit", fontSize: "1.2rem", textTransform: "uppercase", padding: ".7rem", marginTop: ".6rem" }} />
        <button type="submit" className="btn" disabled={busy || code.trim().length < 6} style={{ marginTop: ".7rem", width: "100%" }}>{busy ? "…" : "Continue · தொடரவும்"}</button>
        {err && <p role="alert" style={{ color: "#b00020" }}>{err}</p>}
      </form>
    </main>
  );
}
