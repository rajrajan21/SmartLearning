import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { AVATARS, type PublicProfile } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { useAccount, type ChildInput, type Result } from "../lib/account";
import { ui } from "../lib/i18n";
import { NotFound } from "../components/bits";
import { MeSettings } from "../components/MeSettings";
import { useApp } from "../lib/useApp";
import { st } from "../lib/signin-text";
import { SocialButtons } from "../components/SocialButtons";

export const AVATAR_EMOJI: Record<string, string> = { owl: "🦉", fox: "🦊", panda: "🐼", lion: "🦁", rabbit: "🐰", turtle: "🐢", parrot: "🦜", elephant: "🐘" };


function ExtraClasses({ classes, main, more, setMore, max, lang }: { classes: number[]; main: number; more: number[]; setMore: (v: number[]) => void; max: number; lang: "en" | "ta" }) {
  if (max < 2 || classes.length < 2) return null;
  return (
    <fieldset className="chips-pick"><legend>{st("moreClasses", lang)}</legend>
      {classes.filter((c) => c !== main).map((c) => {
        const on = more.includes(c);
        return <label key={c} className={on ? "pick on" : "pick"}><input type="checkbox" checked={on} disabled={!on && more.length + 1 >= max} onChange={() => setMore(on ? more.filter((x) => x !== c) : [...more, c])} /> {ui("classWord", lang)} {c}</label>;
      })}
    </fieldset>
  );
}
function ChildSecrets({ pin, setPin, sq, setSq, sa, setSa, lang, s, hasPin }: { pin: string; setPin: (v: string) => void; sq: string; setSq: (v: string) => void; sa: string; setSa: (v: string) => void; lang: "en" | "ta"; s: ReturnType<typeof useSettings>; hasPin?: boolean }) {
  if (s.get("accounts.child.login") !== true) return null;
  const pinOn = s.get("accounts.child.pin") === true, secOn = s.get("accounts.child.secret") === true;
  return (
    <fieldset className="chips-pick"><legend>{st("signInSetup", lang)}</legend>
      {pinOn && <><label htmlFor="c-pin">{hasPin ? st("newPin", lang) : st("setPin", lang)}</label><input id="c-pin" inputMode="numeric" autoComplete="off" pattern="\d{6}" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" /></>}
      {secOn && <><label htmlFor="c-sq">{st("secretQ", lang)}</label><input id="c-sq" maxLength={100} value={sq} onChange={(e) => setSq(e.target.value)} /><label htmlFor="c-sa">{st("secretA", lang)}</label><input id="c-sa" maxLength={60} autoComplete="off" value={sa} onChange={(e) => setSa(e.target.value)} /></>}
    </fieldset>
  );
}


/** Default board for a new child: the first board the admin has enabled (CBSE stays the fallback, so old settings behave the same). */
function defaultBoard(s: { get: (k: string) => unknown }): string {
  if (s.get("accounts.child.board.cbse") !== false) return "CBSE";
  if (s.get("accounts.child.board.tnstate") === true) return "TNSTATE";
  if (s.get("accounts.child.board.tnmatric") === true) return "TNMATRIC";
  return "CBSE";
}

/** Board choice, shown only when the admin lets parents choose (and lists at least two boards). */
function BoardPick({ value, onChange }: { value: string; onChange: (b: string) => void }) {
  const s = useSettings();
  if (s.get("accounts.child.chooseBoard") !== true) return null;
  const all: [string, string, boolean][] = [["CBSE", "CBSE", s.get("accounts.child.board.cbse") !== false], ["TNSTATE", "Tamil Nadu State Board", s.get("accounts.child.board.tnstate") === true], ["TNMATRIC", "Tamil Nadu Matriculation", s.get("accounts.child.board.tnmatric") === true]];
  const on = all.filter((b) => b[2]);
  if (on.length < 2) return null;
  return <label className="field">Board<select id="child-board" value={value} onChange={(e) => onChange(e.target.value)}>{on.map((b) => <option key={b[0]} value={b[0]}>{b[1]}</option>)}</select></label>;
}
function ChildForm({ initial, onSave, onCancel }: { initial?: PublicProfile; onSave: (c: ChildInput) => Promise<Result>; onCancel?: () => void }) {
  const s = useSettings();
  const { lang } = s;
  const classes = s.get<number[]>("catalog.openClasses");
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [classLevel, setClassLevel] = useState(initial?.classLevel ?? classes[0] ?? 3);
  const [avatar, setAvatar] = useState(initial?.avatar ?? "owl");
  const [board, setBoard] = useState(initial?.boardCode ?? defaultBoard(s));
  const [more, setMore] = useState<number[]>((initial?.classes ?? []).filter((c) => c !== initial?.classLevel));
  const [pin, setPin] = useState(""), [sq, setSq] = useState(initial?.secretQuestion ?? ""), [sa, setSa] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const maxCl = s.get<number>("accounts.maxClassesPerChild");
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await onSave({ nickname: nickname.trim(), classLevel, extraClasses: more.filter((c) => c !== classLevel), boardCode: board, avatar, language: lang, ...(pin ? { pin } : {}), ...(sq.trim() && sa.trim() ? { secretQuestion: sq.trim(), secretAnswer: sa.trim() } : {}) });
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
      <BoardPick value={board} onChange={setBoard} />
      <ExtraClasses classes={classes} main={classLevel} more={more} setMore={setMore} max={maxCl} lang={lang} />
      <ChildSecrets pin={pin} setPin={setPin} sq={sq} setSq={setSq} sa={sa} setSa={setSa} lang={lang} s={s} hasPin={initial?.hasPin} />
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
  const signupOpen = s.get("accounts.signup") === true && s.get("accounts.method.email") === true;
  const emailOn = s.get("accounts.method.email") === true;
  const childOn = s.get("accounts.child.login") === true;
  const classes = s.get<number[]>("catalog.openClasses");
  const [who, setWho] = useState<"parent" | "child">("parent");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [agree, setAgree] = useState(false);
  const [father, setFather] = useState(""), [mother, setMother] = useState("");
  const [board, setBoard] = useState(defaultBoard(s)), [nick, setNick] = useState(""), [cls, setCls] = useState(classes[0] ?? 3), [avatar, setAvatar] = useState("owl");
  const [more, setMore] = useState<number[]>([]), [pin, setPin] = useState(""), [sq, setSq] = useState(""), [sa, setSa] = useState("");
  const [cName, setCName] = useState(""), [cPin, setCPin] = useState(""), [cAns, setCAns] = useState(""), [how, setHow] = useState<"pin" | "secret">("pin"), [question, setQuestion] = useState<string | null>(null);
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const min = s.get<number>("accounts.passwordMinLength");
  const pinOn = s.get("accounts.child.pin") === true, secOn = s.get("accounts.child.secret") === true;
  const howNow = how === "pin" && !pinOn ? "secret" : how === "secret" && !secOn ? "pin" : how;
  const show = (r: { ok: boolean; message?: string }) => { if (!r.ok) setErr(r.message === "offline" ? ui("offlineNeeded", lang) : r.message ?? ""); };
  const go = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    if (who === "child") show(await acct.childLogin(email, cName.trim(), howNow === "pin" ? { pin: cPin } : { answer: cAns }));
    else if (mode === "in") show(await acct.login(email, password));
    else show(await acct.register(email, password, { nickname: nick.trim(), classLevel: cls, extraClasses: more, boardCode: board, avatar, language: lang, ...(pin ? { pin } : {}), ...(sq.trim() && sa.trim() ? { secretQuestion: sq.trim(), secretAnswer: sa.trim() } : {}) }, s.get("accounts.parentEmails") === true ? { fatherEmail: father.trim(), motherEmail: mother.trim() } : undefined));
    setBusy(false);
  };
  const lookup = async () => { if (howNow === "secret" && email && cName.trim()) setQuestion(await acct.childQuestion(email, cName.trim())); };
  const title = who === "child" ? st("studentIn", lang) : mode === "in" ? ui("signIn", lang) : ui("createAccount", lang);
  return (
    <div className="paper acct signin-card">
      <div className="signin-head"><span className="shield" aria-hidden="true">🛡️</span><h1>{title}</h1></div>
      {s.get("accounts.whyNote") === true && <p className="why-note">{st("why", lang)}</p>}
      <ul className="trust" aria-label="Trust"><li>✓ {st("trust1", lang)}</li><li>✓ {st("trust2", lang)}</li><li>✓ {st("trust3", lang)}</li></ul>
      <p className="small">{ui("guestNote", lang)}</p>
      {childOn && <div className="who" role="tablist"><button type="button" role="tab" aria-selected={who === "parent"} className={who === "parent" ? "tab on" : "tab"} onClick={() => { setWho("parent"); setErr(""); }}>👪 {st("iAmParent", lang)}</button><button type="button" role="tab" aria-selected={who === "child"} className={who === "child" ? "tab on" : "tab"} onClick={() => { setWho("child"); setErr(""); }}>🎒 {st("iAmStudent", lang)}</button></div>}
      {who === "parent" && (
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "in"} className={mode === "in" ? "tab on" : "tab"} onClick={() => setMode("in")}>{ui("signIn", lang)}</button>
          {signupOpen && <button type="button" role="tab" aria-selected={mode === "up"} className={mode === "up" ? "tab on" : "tab"} onClick={() => setMode("up")}>{ui("createAccount", lang)}</button>}
        </div>
      )}
      {who === "parent" && !signupOpen && s.get("accounts.signup") !== true && <p className="small">{ui("signupClosed", lang)}</p>}
      {who === "child" && <p className="small">{st("studentHelp", lang)}</p>}
      {(who === "child" || emailOn) && (
        <form className="acct-form" onSubmit={(e) => void go(e)}>
          <label htmlFor="em">{who === "child" ? st("parentEmail", lang) : ui("email", lang)}</label>
          <input id="em" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {who === "child" ? (
            <>
              <label htmlFor="cn">{st("myName", lang)}</label>
              <input id="cn" required maxLength={20} value={cName} onChange={(e) => setCName(e.target.value)} onBlur={() => void lookup()} />
              {pinOn && secOn && <div className="tabs" role="tablist"><button type="button" role="tab" aria-selected={howNow === "pin"} className={howNow === "pin" ? "tab on" : "tab"} onClick={() => setHow("pin")}>{st("usePin", lang)}</button><button type="button" role="tab" aria-selected={howNow === "secret"} className={howNow === "secret" ? "tab on" : "tab"} onClick={() => { setHow("secret"); void lookup(); }}>{st("useSecret", lang)}</button></div>}
              {howNow === "pin" ? (<><label htmlFor="cp">{st("pin", lang)}</label><input id="cp" type="password" inputMode="numeric" autoComplete="off" required pattern="\d{6}" maxLength={6} value={cPin} onChange={(e) => setCPin(e.target.value.replace(/\D/g, ""))} /></>)
                : (<><label htmlFor="ca">{question ?? st("answer", lang)}</label><input id="ca" type="password" autoComplete="off" required value={cAns} onChange={(e) => setCAns(e.target.value)} /></>)}
            </>
          ) : (
            <>
              <label htmlFor="pw">{ui("password", lang)}</label>
              <input id="pw" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} required minLength={mode === "up" ? min : undefined} value={password} onChange={(e) => setPassword(e.target.value)} />
              {mode === "up" && (
                <>
                  <p className="small">{ui("passwordHint", lang).replace("{n}", String(min))}</p>
                  {s.get("accounts.parentEmails") === true && (<>
                    <label htmlFor="fa">{st("father", lang)}</label><input id="fa" type="email" value={father} onChange={(e) => setFather(e.target.value)} />
                    <label htmlFor="mo">{st("mother", lang)}</label><input id="mo" type="email" value={mother} onChange={(e) => setMother(e.target.value)} />
                    <p className="small">{st("reportsNote", lang)}</p></>)}
                  <label htmlFor="nk">{ui("childName", lang)}</label>
                  <input id="nk" required maxLength={20} value={nick} onChange={(e) => setNick(e.target.value)} />
                  <p className="small">{ui("childNameHint", lang)}</p>
                  <label htmlFor="cl">{ui("childClass", lang)}</label>
                  <select id="cl" value={cls} onChange={(e) => setCls(Number(e.target.value))}>{classes.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                  <BoardPick value={board} onChange={setBoard} />
                  <ExtraClasses classes={classes} main={cls} more={more} setMore={setMore} max={s.get<number>("accounts.maxClassesPerChild")} lang={lang} />
                  <ChildSecrets pin={pin} setPin={setPin} sq={sq} setSq={setSq} sa={sa} setSa={setSa} lang={lang} s={s} />
                  <fieldset className="avatars"><legend>{ui("pickAvatar", lang)}</legend>
                    {AVATARS.map((a) => <label key={a} className={avatar === a ? "av on" : "av"}><input type="radio" name="av" value={a} checked={avatar === a} onChange={() => setAvatar(a)} /><span aria-hidden="true">{AVATAR_EMOJI[a]}</span><span className="sr">{a}</span></label>)}
                  </fieldset>
                  <label className="agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> <span>{s.text("accounts.consentText")}</span></label>
                </>
              )}
            </>
          )}
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn" disabled={busy || (who === "parent" && mode === "up" && (!agree || !nick.trim()))}>{who === "child" ? st("studentIn", lang) : mode === "in" ? ui("signIn", lang) : ui("createAccount", lang)}</button>
        </form>
      )}
      {who === "parent" && <SocialButtons onError={setErr} />}
      {(who === "parent" && !emailOn) && err && <p className="err" role="alert">{err}</p>}
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
  const [fa, setFa] = useState(me.user.fatherEmail ?? ""), [mo, setMo] = useState(me.user.motherEmail ?? ""), [cmsg, setCmsg] = useState("");
  const note = acct.sync === "saved" ? "syncSaved" : acct.sync === "syncing" ? "syncSyncing" : acct.sync === "offline" ? "syncOffline" : null;
  if (me.childMode) {
    const kid = me.profiles[0];
    return (
      <div className="paper acct signin-card"><div className="signin-head"><span className="shield" aria-hidden="true">{AVATAR_EMOJI[kid?.avatar ?? "owl"] ?? "🙂"}</span><h1>{st("hiChild", lang)} {kid?.nickname}!</h1></div>
        <div className="actions"><Link className="btn" href="/">{st("childHome", lang)}</Link><button type="button" className="btn ghost" onClick={() => void acct.logout()}>{ui("signOut", lang)}</button></div></div>
    );
  }
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
                <div className="kid-info"><b>{p.nickname}</b><span className="small">{ui("classWord", lang)} {p.classes.length > 1 ? p.classes.join(", ") : p.classLevel}{p.hasPin ? ` · ${st("hasPin", lang)}` : ""}{p.id === me.activeProfileId ? ` · ${ui("learningNow", lang)}` : ""}</span></div>
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
      {s.get("accounts.parentEmails") === true && (
        <form className="acct-form contacts" onSubmit={async (e) => { e.preventDefault(); const r = await acct.setContacts({ fatherEmail: fa.trim(), motherEmail: mo.trim() }); setCmsg(r.ok ? "✓" : r.message); }}>
          <h2>{st("contacts", lang)}</h2>
          <label htmlFor="ct-f">{st("father", lang)}</label><input id="ct-f" type="email" value={fa} onChange={(e) => setFa(e.target.value)} />
          <label htmlFor="ct-m">{st("mother", lang)}</label><input id="ct-m" type="email" value={mo} onChange={(e) => setMo(e.target.value)} />
          <p className="small">{st("reportsNote", lang)}</p>
          <button className="btn ghost sm">{st("saveContacts", lang)}</button>{cmsg && <span role="status"> {cmsg}</span>}
        </form>
      )}
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
          {me.user.provider !== "email" && <p className="small">{st("deleteWord", lang)}</p>}
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
  const { app } = useApp();
  const me = <div className="paper me-page"><h1>{ui("appMe", s.lang)}</h1><MeSettings /></div>;
  if (s.get("feature.accounts") !== true) return app ? me : <NotFound />;
  if (acct.me === undefined) return <div className="paper" aria-busy="true"><p>{ui("loading", s.lang)}…</p></div>;
  return <>{me}{acct.me ? <SignedIn /> : <SignedOut />}</>;
}
