import { useEffect, useRef, useState } from "react";
import { useSettings } from "../lib/settings";
import { useAccount } from "../lib/account";
import { st } from "../lib/signin-text";

const unset = (v: unknown) => { const t = String(v ?? "").trim(); return !t || t === "not set" ? "" : t; };
const loadScript = (src: string, id: string) => new Promise<void>((ok, bad) => {
  if (document.getElementById(id)) return ok();
  const el = document.createElement("script"); el.id = id; el.src = src; el.async = true; el.onload = () => ok(); el.onerror = () => bad(new Error("blocked"));
  document.head.appendChild(el);
});
type W = typeof window & { google?: any; FB?: any };

/** Google and Facebook buttons. Shown only when the admin has switched the method on and added its key. */
export function SocialButtons({ onError }: { onError: (m: string) => void }) {
  const s = useSettings(); const acct = useAccount();
  const gid = s.get("accounts.method.google") === true ? unset(s.get("accounts.google.clientId")) : "";
  const fid = s.get("accounts.method.facebook") === true ? unset(s.get("accounts.facebook.appId")) : "";
  const gBox = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!gid) return; let alive = true;
    loadScript("https://accounts.google.com/gsi/client", "gsi").then(() => {
      const g = (window as W).google; if (!alive || !g || !gBox.current) return;
      g.accounts.id.initialize({ client_id: gid, callback: async (r: { credential: string }) => { const x = await acct.social("google", r.credential); if (!x.ok) onError(x.message); } });
      g.accounts.id.renderButton(gBox.current, { theme: "outline", size: "large", text: "continue_with", shape: "pill", width: 280 });
    }).catch(() => onError("Google could not load. Check your connection or any blocker."));
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gid]);
  const facebook = async () => {
    setBusy(true);
    try {
      await loadScript("https://connect.facebook.net/en_US/sdk.js", "fbsdk");
      const FB = (window as W).FB; FB.init({ appId: fid, version: "v19.0", cookie: false, xfbml: false });
      FB.login(async (resp: { authResponse?: { accessToken: string } }) => { if (resp.authResponse) { const x = await acct.social("facebook", resp.authResponse.accessToken); if (!x.ok) onError(x.message); } setBusy(false); }, { scope: "email" });
    } catch { onError("Facebook could not load. Check your connection or any blocker."); setBusy(false); }
  };
  if (!gid && !fid) return null;
  return (
    <div className="social">
      <p className="or"><span>{st("or", s.lang)}</span></p>
      {gid && <div ref={gBox} className="social-g" aria-label={st("google", s.lang)} />}
      {fid && <button type="button" className="btn social-fb" disabled={busy} onClick={() => void facebook()}><b aria-hidden="true">f</b> {st("facebook", s.lang)}</button>}
    </div>
  );
}
