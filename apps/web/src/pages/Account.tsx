import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { AVATARS, type PublicProfile } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { useAccount, type ChildInput, type Result } from "../lib/account";
import { ui } from "../lib/i18n";
import { NotFound } from "../components/bits";

export const AVATAR_EMOJI: Record<string, string> = { owl: "🦉", fox: "🦊", panda: "🐼", lion: "🦁", rabbit: "🐰", turtle: "🐢", parrot: "🦜", elephant: "🐘" };

function ChildForm({ initial, onSave, onCancel }: { initial?: PublicProfile; onSave: (c: ChildInput) => Promise<Result>; onCancel?: () => void }) {
  const s = useSettings();
  const { lang } = s;
  const classes = s.get<number[]>("catalog.openClasses");
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [classLevel, setClassLevel] = useState(initial?.classLevel ?? classes[0] ?? 3);
  const [avatar, setAvatar] = useState(initial?.avatar ?? "owl");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await onSave({ nickname: nickname.trim(), classLevel, avatar, language: lang });
    setBusy(false);
    if (!r.ok) setErr(r.message === "offline" ? ui("offlineNeeded", lang) : r.message);
  };
  return (
    <form className="acct-form" onSubmit={(e) => void submit(e)}>
      <label htmlFor="child-name">{ui("childName", lang)}</label>
      <input id="child-name" value={nickname} maxLength={20} required onChange={(e) => setNickname(e.target.value)} />
      <p className="small">{ui("childNameHint", lang)}</p>
      <label htmlFor="child-class">{ui("childClass", lang)}</label>
      <select id="child-class" value={classLevel} onChange={(e) => setClassLevel(Number(e.target.value))}>{classes.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      <fieldset className="avatars"><legend>{ui("pickAvatar", lang)}</legend>
        {AVATARS.map((a) => (
          <label key={a} className={avatar === a ? "av on" : "av"}><input type="radio" name="avatar" value={a} checked={avatar === a} onChange={() => setAvatar(a)} /><span aria-hidden="true">{AVATAR_EMOJI[a]}</span><span className="sr">{a}</span></label>
        ))}
      </fieldset>
      {err && <p className="err" role="alert">{err}</p>}
      <div className="actions"><button className="btn" disabled={busy || !nickname.trim()}>{ui("saveChild", lang)}</button>{onCancel && <button type="button" className="btn ghost" onClick={onCancel}>{ui("cancel", lang)}</button>}</div>
    </form>
  );
}

function SignedOut() {
  const s = useSettings();
  const { lang } = s;
  const acct = useAccount();
  const signupOpen = s.get("accounts.signup") === true;
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [agree, setAgree] = useState(false);
  const [nick, setNick] = useState(""), [cls, setCls] = useState(s.get<number[]>("catalog.openClasses")[0] ?? 3), [avatar, setAvatar] = useState("owl");
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const min = s.get<number>("accounts.passwordMinLength");
  const go = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = mode === "in" ? await acct.login(email, password) : await acct.register(email, password, { nickname: nick.trim(), classLevel: cls, avatar, language: lang });
    setBusy(false);
    if (!r.ok) setErr(r.message === "offline" ? ui("offlineNeeded", lang) : r.message);
  };
  return (
    <div className="paper acct">
      <h1>{mode === "in" ? ui("signIn", lang) : ui("createAccount", lang)}</h1>
      <p className="small">{ui("guestNote", lang)}</p>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "in"} className={mode === "in" ? "tab on" : "tab"} onClick={() => setMode("in")}>{ui("signIn", lang)}</button>
        {signupOpen && <button type="button" role="tab" aria-selected={mode === "up"} className={mode === "up" ? "tab on" : "tab"} onClick={() => setMode("up")}>{ui("createAccount", lang)}</button>}
      </div>
      {!signupOpen && <p className="small">{ui("signupClosed", lang)}</p>}
      <form className="acct-form" onSubmit={(e) => void go(e)}>
        <label htmlFor="em">{ui("email", lang)}</label>
        <input id="em" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="pw">{ui("password", lang)}</label>
        <input id="pw" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} required minLength={mode === "up" ? min : undefined} value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === "up" && (
          <>
            <p className="small">{ui("passwordHint", lang).replace("{n}", String(min))}</p>
            <label htmlFor="nk">{ui("childName", lang)}</label>
            <input id="nk" required maxLength={20} value={nick} onChange={(e) => setNick(e.target.value)} />
            <p className="small">{ui("childNameHint", lang)}</p>
            <label htmlFor="cl">{ui("childClass", lang)}</label>
            <select id="cl" value={cls} onChange={(e) => setCls(Number(e.target.value))}>{s.get<number[]>("catalog.openClasses").map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <fieldset className="avatars"><legend>{ui("pickAvatar", lang)}</legend>
              {AVATARS.map((a) => <label key={a} className={avatar === a ? "av on" : "av"}><input type="radio" name="av" value={a} checked={avatar === a} onChange={() => setAvatar(a)} /><span aria-hidden="true">{AVATAR_EMOJI[a]}</span><span className="sr">{a}</span></label>)}
            </fieldset>
            <label className="agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> <span>{s.text("accounts.consentText")}</span></label>
          </>
        )}
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy || (mode === "up" && (!agree || !nick.trim()))}>{mode === "in" ? ui("signIn", lang) : ui("createAccount", lang)}</button>
      </form>
    </div>
  );
}

function SignedIn() {
  const s = useSettings();
  const { lang } = s;
  const acct = useAccount();
  const me = acct.me!;
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [delOpen, setDelOpen] = useState(false), [pw, setPw] = useState(""), [delErr, setDelErr] = useState("");
  const max = s.get<number>("accounts.maxChildren");
  const note = acct.sync === "saved" ? "syncSaved" : acct.sync === "syncing" ? "syncSyncing" : acct.sync === "offline" ? "syncOffline" : null;
  return (
    <div className="paper acct">
      <h1>{ui("whoLearning", lang)}</h1>
      <p className="small">{me.user.email}</p>
      <ul className="kids">
        {me.profiles.map((p) => (
          <li key={p.id} className={p.id === me.activeProfileId ? "kid on" : "kid"}>
            {editing === p.id ? <ChildForm initial={p} onCancel={() => setEditing(null)} onSave={async (c) => { const r = await acct.updateChild(p.id, c); if (r.ok) setEditing(null); return r; }} /> : (
              <>
                <span className="kid-av" aria-hidden="true">{AVATAR_EMOJI[p.avatar] ?? "🙂"}</span>
                <div className="kid-info"><b>{p.nickname}</b><span className="small">{ui("classWord", lang)} {p.classLevel}{p.id === me.activeProfileId ? ` · ${ui("learningNow", lang)}` : ""}</span></div>
                <div className="kid-actions">
                  {p.id !== me.activeProfileId && <button type="button" className="btn sm" onClick={() => void acct.select(p.id)}>{ui("chooseThis", lang)}</button>}
                  <button type="button" className="btn ghost sm" onClick={() => setEditing(p.id)}>{ui("edit", lang)}</button>
                  {confirmRemove === p.id ? (
                    <span role="alert" className="confirm"><span className="small">{ui("removeChildAsk", lang)}</span> <button type="button" className="btn sm danger" onClick={() => { setConfirmRemove(null); void acct.removeChild(p.id); }}>{ui("remove", lang)}</button> <button type="button" className="btn ghost sm" onClick={() => setConfirmRemove(null)}>{ui("cancel", lang)}</button></span>
                  ) : <button type="button" className="btn ghost sm" onClick={() => setConfirmRemove(p.id)}>{ui("remove", lang)}</button>}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {editing === "new" ? <ChildForm onCancel={() => setEditing(null)} onSave={async (c) => { const r = await acct.addChild(c); if (r.ok) setEditing(null); return r; }} />
        : me.profiles.length < max && <button type="button" className="btn ghost" onClick={() => setEditing("new")}>+ {ui("addChild", lang)}</button>}
      {note && <p className="small" role="status">{ui(note, lang)}</p>}
      <div className="actions">
        {me.activeProfileId && <Link className="btn" href="/">{ui("home", lang)}</Link>}
        {s.get("feature.parentDashboard") === true && <Link className="btn ghost" href="/parent">{ui("parentArea", lang)}</Link>}
        <button type="button" className="btn ghost" onClick={() => void acct.logout()}>{ui("signOut", lang)}</button>
      </div>
      <p className="small">{ui("signOutNote", lang)}</p>
      <details className="danger-zone" open={delOpen} onToggle={(e) => setDelOpen((e.target as HTMLDetailsElement).open)}>
        <summary>{ui("deleteAccountTitle", lang)}</summary>
        <p className="small">{ui("deleteAccountHelp", lang)}</p>
        <form className="acct-form" onSubmit={async (e) => { e.preventDefault(); const r = await acct.deleteAccount(pw); if (!r.ok) setDelErr(r.message === "offline" ? ui("offlineNeeded", lang) : r.message); }}>
          <label htmlFor="del-pw">{ui("password", lang)}</label>
          <input id="del-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
          {delErr && <p className="err" role="alert">{delErr}</p>}
          <button className="btn danger" disabled={!pw}>{ui("deleteAccountTitle", lang)}</button>
        </form>
      </details>
    </div>
  );
}

export function AccountPage() {
  const s = useSettings();
  const acct = useAccount();
  if (s.get("feature.accounts") !== true) return <NotFound />;
  if (acct.me === undefined) return <div className="paper" aria-busy="true"><p>{ui("loading", s.lang)}…</p></div>;
  return acct.me ? <SignedIn /> : <SignedOut />;
}
