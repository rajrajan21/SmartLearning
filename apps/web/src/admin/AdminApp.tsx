import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_ADMIN_USER_ID, THEME_PRESETS, SETTINGS, type PanelId, type SettingDef, type SettingValue } from "@studysmart/shared";
import { admin, adminKey, adminUser, AdminError, type AdminData, type AuditEntry, type Values } from "./api";
import { Field } from "./Field";
import { Preview } from "./Preview";
import { LookPicker } from "./LookPicker";
import { AccessCodes } from "./AccessCodes";
import { Reports } from "./Reports";
import { SocialAdmin } from "./SocialAdmin";
import { AudioAdmin } from "./AudioAdmin";
import { PapersAdmin } from "./PapersAdmin";
import { Branding } from "./Branding";
import { LibraryAdmin } from "./LibraryAdmin";
import { ContribAdmin } from "./ContribAdmin";
import { VisualsAdmin } from "./VisualsAdmin";
import { PerfAdmin } from "./PerfAdmin";
import { TourAdmin } from "./TourAdmin";
import { Jobs, Operations } from "./Operations";
import { LayoutGallery } from "./LayoutGallery";
import { presetKey, presets, type Preset } from "../lib/sitePresets";
import "./dashboard.css";

type Tab = PanelId | "log" | "backup" | "overview" | "monitor" | "jobs" | "gallery";
const tools = [
  { id: "overview", name: "Overview", icon: "◫", terms: "dashboard home" },
  { id: "monitor", name: "Site monitor", icon: "◉", terms: "health uptime CPU memory load disk storage errors backups visitor traffic statistics" },
  { id: "jobs", name: "Jobs", icon: "↻", terms: "Oracle Windows PC Kani audio generation background progress" },
  { id: "gallery", name: "Layout gallery", icon: "▥", terms: "preset preview design active default Appearance" },
  { id: "log", name: "Change log", icon: "≡", terms: "audit history" },
  { id: "backup", name: "Backup", icon: "↓", terms: "settings export import restore" },
] as const;
const siteGroup: PanelId[] = ["site", "access", "features", "languages", "pages", "theme", "home", "layout", "app", "catalog"];
const operationGroup: PanelId[] = ["reports", "audiocover", "visualcover"];

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function AdminApp() {
  const [authed, setAuthed] = useState<"checking" | "yes" | "no">(adminKey.get() ? "checking" : "no");
  useEffect(() => {
    if (!adminKey.get()) return;
    admin.session().then(() => setAuthed("yes")).catch(() => { adminKey.clear(); adminUser.clear(); setAuthed("no"); });
  }, []);
  if (authed === "checking") return <div className="admin"><p className="loading" role="status">Checking…</p></div>;
  if (authed === "no") return <Gate onOk={() => setAuthed("yes")} />;
  return <Console onSignOut={() => { adminKey.clear(); adminUser.clear(); setAuthed("no"); }} />;
}

function Gate({ onOk }: { onOk: () => void }) {
  const [user, setUser] = useState(() => adminUser.get() || DEFAULT_ADMIN_USER_ID);
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(""); adminKey.set(key.trim()); adminUser.set(user.trim());
    try { await admin.session(); onOk(); } catch (x) {
      adminKey.clear();
      setErr(x instanceof AdminError && x.status === 429 ? "Too many wrong tries. Wait ten minutes and try again." : x instanceof AdminError && x.status === 401 ? "That user id or key is not correct." : "Could not reach the server.");
    } finally { setBusy(false); }
  };
  return (
    <div className="admin gate">
      <form onSubmit={submit} className="gate-card">
        <h1>Site settings</h1>
        <p>Sign in with your user id and the admin key.</p>
        <label htmlFor="au">User id</label>
        <input id="au" type="text" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={user} onChange={(e) => setUser(e.target.value)} />
        <label htmlFor="ak">Admin key</label>
        <input id="ak" type="password" autoComplete="current-password" value={key} onChange={(e) => setKey(e.target.value)} />
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy || key.trim().length === 0 || user.trim().length === 0}>{busy ? "Checking…" : "Sign in"}</button>
      </form>
    </div>
  );
}

function Console({ onSignOut }: { onSignOut: () => void }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [saved, setSaved] = useState<Values>({});
  const [draft, setDraft] = useState<Values>({});
  const [overridden, setOverridden] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<Tab>("overview");
  const [selection, setSelection] = useState<Preset>("classic");
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try { const d = await admin.load(); setData(d); setSaved(d.values); setDraft(d.values); setOverridden(new Set(d.overridden));
      setSelection(presets.find(({ id }) => id === d.values[presetKey])?.id ?? "classic"); }
    catch (e) { if (e instanceof AdminError && e.status === 401) onSignOut(); else setMsg({ kind: "err", text: "Could not load settings." }); }
  }, [onSignOut]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (tab === "log") admin.audit().then((r) => setAudit(r.entries)).catch(() => setAudit([])); }, [tab]);
  useEffect(() => {
    const dirty = Object.keys(draft).some((k) => !same(draft[k], saved[k]));
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [draft, saved]);

  const defs = data?.definitions ?? SETTINGS;
  const byKey = useMemo(() => new Map(defs.map((d) => [d.key, d])), [defs]);
  const changedKeys = useMemo(() => Object.keys(draft).filter((k) => !same(draft[k], saved[k])), [draft, saved]);
  const set = (k: string, v: SettingValue) => { setMsg(null); setDraft((d) => ({ ...d, [k]: v })); };

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await admin.save(Object.fromEntries(changedKeys.map((k) => [k, draft[k]!])));
      setSaved(r.values); setDraft(r.values); setOverridden(new Set(r.overridden));
      setMsg({ kind: "ok", text: `Saved ${changedKeys.length} change${changedKeys.length === 1 ? "" : "s"}. Visitors see them within a minute.` });
    } catch (e) { setMsg({ kind: "err", text: e instanceof Error ? e.message : "Could not save." }); } finally { setBusy(false); }
  };
  const saveLayout = async (layout: Preset) => {
    setBusy(true); setMsg(null);
    try {
      const result = await admin.save({ [presetKey]: layout });
      setSaved(result.values); setOverridden(new Set(result.overridden));
      setDraft((current) => ({ ...result.values, ...Object.fromEntries(
        Object.entries(current).filter(([key, value]) => key !== presetKey && !same(value, saved[key])),
      ) }));
      setMsg({ kind: "ok", text: "Site layout saved." });
    } catch { setMsg({ kind: "err", text: "Could not save the site layout." }); }
    finally { setBusy(false); }
  };
  const resetKeys = async (keys: string[], what: string) => {
    if (!confirm(`Reset ${what} to the original values? This is saved immediately.`)) return;
    setBusy(true); setMsg(null);
    try { const r = await admin.reset(keys); setSaved(r.values); setDraft(r.values); setOverridden(new Set(r.overridden)); setMsg({ kind: "ok", text: `Reset ${what}.` }); }
    catch (e) { setMsg({ kind: "err", text: e instanceof Error ? e.message : "Could not reset." }); } finally { setBusy(false); }
  };
  const applyPreset = (id: string) => {
    const p = THEME_PRESETS.find((x) => x.id === id); if (!p) return;
    const base: Values = {};
    for (const d of defs) if (d.panel === "theme") base[d.key] = d.default;
    // quick styles set individual colours, so they use the Custom palette on the Notebook theme
    setMsg(null); setDraft((d) => ({ ...d, ...base, "theme.preset": "notebook", "theme.palette": "custom", ...p.values }));
  };
  const doExport = async () => {
    try {
      const out = await admin.exportAll();
      const url = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }));
      const a = document.createElement("a"); a.href = url; a.download = "sharpstudy-settings.json"; a.click(); URL.revokeObjectURL(url);
    } catch { setMsg({ kind: "err", text: "Could not export." }); }
  };
  const doImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as { values?: Values };
      if (!parsed.values || typeof parsed.values !== "object") throw new Error("This file does not look like a settings export.");
      const r = await admin.importAll(parsed.values);
      setSaved(r.values); setDraft(r.values); setOverridden(new Set(r.overridden)); setMsg({ kind: "ok", text: "Settings imported and saved." });
    } catch (e) { setMsg({ kind: "err", text: e instanceof Error ? e.message : "Could not import." }); }
  };

  if (!data) return <div className="admin"><p className="loading" role="status">{msg?.text ?? "Loading settings…"}</p></div>;

  const panel = data.panels.find((p) => p.id === tab);
  const panelDefs = panel ? defs.filter((d) => d.panel === panel.id && d.key !== presetKey) : [];
  const sections = [...new Set(panelDefs.map((d) => d.section))];
  const isOff = (d: SettingDef) => !!d.dependsOn && draft[d.dependsOn] !== true;
  const panelChanged = (id: PanelId) => defs.filter((d) => d.panel === id && !same(draft[d.key], saved[d.key])).length;

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const panelLabel = (id: string) => data.panels.find((p) => p.id === id)?.label ?? id;
  const matchesQuery = (value: string) => terms.every((term) => value.toLowerCase().includes(term));
  const links: { id: Tab; name: string; type: string; preset?: Preset }[] = terms.length ? [
    ...tools.filter((item) => matchesQuery(item.name + " " + item.terms)).map((item) => ({ id: item.id as Tab, name: item.name, type: "Tool" })),
    ...data.panels.filter((item) => matchesQuery(item.label + " " + item.help)).map((item) => ({ id: item.id as Tab, name: item.label, type: "Section" })),
    ...presets.filter((item) => matchesQuery(item.name + " " + item.description + " layout preset")).map((item) => ({ id: "gallery" as Tab, name: item.name, type: "Layout", preset: item.id })),
  ] : [];
  const go = (next: Tab, preset?: Preset) => {
    if (preset) setSelection(preset);
    else if (next === "gallery") setSelection(presets.find(({ id }) => id === saved[presetKey])?.id ?? "classic");
    setQ(""); setTab(next);
    window.scrollTo({ top: 0, behavior: "auto" });
    mainRef.current?.focus({ preventScroll: true });
  };
  const nav = (id: Tab, label: string, icon?: string, count = 0) => (
    <button key={id} type="button" className={`a-tab ${tab === id ? "on" : ""}`} aria-current={tab === id ? "page" : undefined} onClick={() => go(id)}>
      <span>{icon && <span className="admin-nav-icon" aria-hidden="true">{icon}</span>}{label}</span>
      {count > 0 && <span className="badge">{count}</span>}
    </button>
  );
  const panelNav = (ids: PanelId[]) => data.panels.filter((item) => ids.includes(item.id)).map((item) => nav(item.id, item.label, undefined, panelChanged(item.id)));
  const hits = terms.length === 0 ? [] : defs.filter((d) => { const hay = `${d.label} ${d.section} ${d.key} ${(d as { help?: string }).help ?? ""} ${panelLabel(d.panel)}`.toLowerCase(); return terms.every((t) => hay.includes(t)); });
  const searching = terms.length > 0;
  const openSetting = (key: string) => {
    const hit = document.getElementById("admin-setting-" + key);
    hit?.scrollIntoView?.({ block: "center" });
    (hit?.querySelector<HTMLElement>("input:enabled,select:enabled,textarea:enabled,[role=switch]:enabled") ?? hit)?.focus();
  };

  return (
    <div className="admin admin-console">
      <header className="a-top">
        <h1><span className="admin-mark" aria-hidden="true">S</span> SharpStudy Admin</h1>
        <div className="a-search" role="search">
          <label htmlFor="a-q" className="sr-only">Search settings</label>
          <input id="a-q" ref={searchRef} type="search" placeholder="Search settings, tools and layouts" value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQ("");
              if ((e.key === "ArrowDown" || e.key === "Enter") && resultsRef.current) {
                const first = resultsRef.current.querySelector<HTMLButtonElement>("button");
                if (first) { e.preventDefault(); if (e.key === "Enter") first.click(); else first.focus(); }
              }
            }} autoComplete="off" />
          {q && <button type="button" className="btn ghost sm" onClick={() => setQ("")} aria-label="Clear search">Clear</button>}
        </div>
        <div className="a-links"><a href="/" target="_blank" rel="noreferrer">View site</a><button type="button" className="link" onClick={onSignOut}>Sign out</button></div>
      </header>
      <div className="a-body">
        <nav className="a-tabs" aria-label="Admin sections">
          {tools.slice(0, 4).map((item) => nav(item.id, item.name, item.icon))}
          <details open={siteGroup.includes(tab as PanelId)} className="admin-nav-group"><summary><span aria-hidden="true">⚙</span> Site settings</summary>{panelNav(siteGroup)}</details>
          <details className="admin-nav-group"><summary><span aria-hidden="true">▤</span> Reports and coverage</summary>{panelNav(operationGroup)}</details>
          <details className="admin-nav-group"><summary><span aria-hidden="true">◈</span> Learning and content</summary>
            {panelNav(data.panels.map((item) => item.id).filter((id) => !siteGroup.includes(id) && !operationGroup.includes(id)))}
          </details>
          {tools.slice(4).map((item) => nav(item.id, item.name, item.icon))}
        </nav>
        <section className="a-main" ref={mainRef} tabIndex={-1}>
          {!searching && (tab === "overview" || tab === "monitor") && <Operations overview={tab === "overview"} open={go} />}
          {!searching && tab === "jobs" && <Jobs />}
          {!searching && tab === "gallery" && <LayoutGallery active={saved[presetKey] ?? "classic"} selection={selection} setSelection={setSelection} save={saveLayout} busy={busy} />}

          {searching && (
            <>
              <div className="a-head"><div><h2>Search results</h2><p role="status">{links.length + hits.length} results</p></div></div>
              <div className="admin-results" ref={resultsRef} onKeyDown={(event) => {
                if (event.key === "Escape") { setQ(""); searchRef.current?.focus(); return; }
                if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
                const buttons = [...event.currentTarget.querySelectorAll("button")];
                const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
                if (index < 0 || !buttons.length) return;
                event.preventDefault();
                const next = index + (event.key === "ArrowDown" ? 1 : -1);
                if (next < 0) searchRef.current?.focus();
                else buttons[next]?.focus();
              }}>
                {links.map((item) => <button className="admin-result" key={item.type + item.name} onClick={() => go(item.id, item.preset)}><b>{item.name}</b><small>{item.type}</small></button>)}
                {hits.map((item) => <button className="admin-result" key={item.key}
                  onClick={() => item.key === presetKey ? go("gallery") : openSetting(item.key)}><b>{item.label}</b><small>{panelLabel(item.panel)} · {item.section}</small></button>)}
              </div>
              {[...new Set(hits.filter((d) => d.key !== presetKey).map((d) => d.panel))].map((pid) => (
                <fieldset key={pid} className="group"><legend>{panelLabel(pid)}</legend>
                  {hits.filter((d) => d.panel === pid && d.key !== presetKey).map((d) => (
                    <div key={d.key} className="a-hit" id={"admin-setting-" + d.key} tabIndex={-1}><p className="a-where">{d.section}</p>
                      <Field def={d} value={draft[d.key]!} values={draft} changed={!same(draft[d.key], saved[d.key])} disabled={isOff(d)} onChange={(v) => set(d.key, v)} onReset={() => set(d.key, saved[d.key]!)} />
                      <button type="button" className="link" onClick={() => { setQ(""); setTab(pid as Tab); }}>Open the {panelLabel(pid)} section</button>
                    </div>
                  ))}
                </fieldset>
              ))}
            </>
          )}
          {!searching && panel && (
            <>
              <div className="a-head"><div><h2>{panel.label}</h2><p>{panel.help}</p></div>
                <button type="button" className="btn ghost sm" disabled={busy || !panelDefs.some((d) => overridden.has(d.key))} onClick={() => resetKeys(panelDefs.filter((d) => overridden.has(d.key)).map((d) => d.key), `all ${panel.label.toLowerCase()} settings`)}>Reset this section</button>
              </div>
              {panel.id === "layout" && <button className="btn ghost" onClick={() => go("gallery")}>Open layout gallery</button>}
              {panel.id === "theme" && <LookPicker values={draft} onChange={(c) => { setMsg(null); setDraft((d) => ({ ...d, ...c })); }} />}
              {panel.id === "theme" && (
                <>
                  <h3 className="look-h">Quick styles <span>(old one-click styles: they use your own custom colours)</span></h3>
                  <div className="presets" role="group" aria-label="Style presets">
                    {data.presets.map((p) => <button key={p.id} type="button" className="preset" onClick={() => applyPreset(p.id)}><b>{p.label}</b><span>{p.description}</span></button>)}
                  </div>
                </>
              )}
              {sections.filter((sec) => !(panel.id === "theme" && sec.startsWith("Custom colours") && draft["theme.palette"] !== "custom")).map((sec) => (
                <fieldset key={sec} className="group"><legend>{sec}</legend>
                  {panelDefs.filter((d) => d.section === sec).map((d) => (
                    <Field key={d.key} def={d} value={draft[d.key]!} values={draft} changed={!same(draft[d.key], saved[d.key])} disabled={isOff(d)} onChange={(v) => set(d.key, v)} onReset={() => set(d.key, saved[d.key]!)} />
                  ))}
                </fieldset>
              ))}
              {panel.id === "site" && <Branding values={draft} onVersion={(k, v) => set(k, v)} />}
              {panel.id === "site" && <PerfAdmin />}
              {panel.id === "reports" && <Reports />}
              {panel.id === "library" && <LibraryAdmin />}
              {panel.id === "contrib" && <ContribAdmin />}
              {panel.id === "visualcover" && <VisualsAdmin />}
              {panel.id === "tour" && <TourAdmin />}
              {panel.id === "papers" && <PapersAdmin />}
              {panel.id === "audiocover" && <AudioAdmin perPage={Number(saved["audio.coverage.perPage"] ?? 50)} defaultFilter={String(saved["audio.coverage.defaultFilter"] ?? "all")} />}
              {panel.id === "social" && <SocialAdmin mode="gates" />}
              {panel.id === "socialaccounts" && <SocialAdmin mode="accounts" />}
              {panel.id === "socialqueue" && <SocialAdmin mode="queue" />}
              {panel.id === "access" && <AccessCodes defaultMaxUses={Number(saved["access.newCode.maxUses"] ?? 10)} defaultExpiryDays={Number(saved["access.newCode.expiryDays"] ?? 0)} mode={String(saved["access.mode"])} />}
            </>
          )}
          {!searching && tab === "log" && (
            <>
              <div className="a-head"><div><h2>Change log</h2><p>The last 50 changes, newest first.</p></div></div>
              {audit === null ? <p className="loading">Loading…</p> : audit.length === 0 ? <p>No changes yet.</p> : (
                <table className="log"><thead><tr><th>When</th><th>Setting</th><th>Before</th><th>After</th><th>By</th></tr></thead>
                  <tbody>{audit.map((e, i) => (
                    <tr key={i}><td>{new Date(e.createdAt).toLocaleString()}</td><td>{byKey.get(e.key)?.label ?? e.key}</td><td><code>{JSON.stringify(e.oldValue)}</code></td><td><code>{JSON.stringify(e.newValue)}</code></td><td>{e.actor}{e.action !== "update" ? ` (${e.action})` : ""}</td></tr>
                  ))}</tbody></table>
              )}
            </>
          )}
          {!searching && tab === "backup" && (
            <>
              <div className="a-head"><div><h2>Backup</h2><p>Save your settings to a file, or load them back. Importing replaces matching settings and is saved immediately.</p></div></div>
              <div className="backup">
                <button type="button" className="btn" onClick={doExport}>Download settings file</button>
                <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>Load settings file</button>
                <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ""; }} />
                <button type="button" className="btn ghost" disabled={busy || overridden.size === 0} onClick={() => resetKeys([...overridden], "everything")}>Reset everything</button>
              </div>
            </>
          )}
        </section>
        {panel?.id !== undefined && ["theme", "home", "catalog"].includes(panel.id) && <Preview values={draft} />}
      </div>
      <div className={`savebar ${changedKeys.length || msg ? "show" : ""}`} role="region" aria-label="Save changes">
        <span role="status">{msg ? <b className={msg.kind}>{msg.text} <button type="button" className="link" onClick={() => setMsg(null)}>Dismiss</button></b> : changedKeys.length ? `${changedKeys.length} unsaved change${changedKeys.length === 1 ? "" : "s"}` : "All changes saved"}</span>
        <span className="sb-actions" hidden={!changedKeys.length}>
          <button type="button" className="btn ghost" disabled={busy || !changedKeys.length} onClick={() => { setDraft(saved); setMsg(null); }}>Discard</button>
          <button type="button" className="btn" disabled={busy || !changedKeys.length} onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
        </span>
      </div>
    </div>
  );
}
