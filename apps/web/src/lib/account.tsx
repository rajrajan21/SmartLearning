import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { emptySync, Me, mergeSync, SyncData, type PublicProfile } from "@studysmart/shared";
import { useSettings } from "./settings";
import { store } from "./storage";
import { onProgressChange, readAllProgress, replaceAllProgress } from "./progress";
import { onRevisionChange, readAllRevision, replaceAllRevision } from "./revision";
import { onResultsChange, readAllResults, replaceAllResults } from "./practice";
import { onMistakesChange, readAllMistakes, replaceAllMistakes } from "./mistakes";
import { onNotesChange, readAllNotes, replaceAllNotes } from "./tier2";

export type Result = { ok: true } | { ok: false; message: string };
export interface ChildInput { boardCode?: string; nickname: string; classLevel: number; extraClasses?: number[]; avatar: string; language: "en" | "ta"; pin?: string; secretQuestion?: string; secretAnswer?: string }
export interface Contacts { fatherEmail?: string; motherEmail?: string }
export type SyncState = "idle" | "syncing" | "saved" | "offline";
interface Ctx {
  /** undefined while loading, null when signed out */
  me: Me | null | undefined;
  active: PublicProfile | null;
  sync: SyncState;
  register(email: string, password: string, child: ChildInput, contacts?: Contacts): Promise<Result>;
  social(provider: "google" | "facebook", token: string): Promise<Result>;
  childLogin(email: string, nickname: string, secret: { pin?: string; answer?: string }): Promise<Result>;
  childQuestion(email: string, nickname: string): Promise<string | null>;
  setContacts(c: Contacts): Promise<Result>;
  login(email: string, password: string): Promise<Result>;
  logout(): Promise<void>;
  addChild(c: ChildInput): Promise<Result>;
  updateChild(id: string, c: ChildInput): Promise<Result>;
  removeChild(id: string): Promise<Result>;
  select(id: string): Promise<Result>;
  deleteAccount(password: string): Promise<Result>;
}
const AccountContext = createContext<Ctx | null>(null);
/** For screens that work with or without the account provider (tests, accounts switched off). */
export const useAccountOptional = () => useContext(AccountContext);
export const useAccount = () => { const c = useContext(AccountContext); if (!c) throw new Error("AccountProvider missing"); return c; };

const OWNER = "ss_sync_owner";
const API = "/api/v1/account";
async function call(method: string, path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: unknown }> {
  try {
    const r = await fetch(`${API}${path}`, { method, headers: body === undefined ? undefined : { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = r.status === 204 ? "" : await r.text();
    return { ok: r.ok, status: r.status, data: text ? JSON.parse(text) : null };
  } catch { return { ok: false, status: 0, data: null }; }
}
const messageOf = (r: { status: number; data: unknown }): string => (r.status === 0 ? "offline" : (r.data as { error?: { message?: string } } | null)?.error?.message ?? "Something went wrong. Please try again.");

const local = (): SyncData => SyncData.parse({ lesson: readAllProgress(), practice: readAllResults(), revision: readAllRevision(), notes: readAllNotes(), mistakes: readAllMistakes() });
const writeLocal = (d: SyncData) => { replaceAllProgress(d.lesson); replaceAllResults(d.practice as never); replaceAllRevision(d.revision); replaceAllNotes(d.notes as never); replaceAllMistakes(d.mistakes as never); };

export function AccountProvider({ children }: { children: ReactNode }) {
  const s = useSettings();
  const on = s.get("feature.accounts") === true;
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [sync, setSync] = useState<SyncState>("idle");
  const adopting = useRef(false);
  const activeId = me?.activeProfileId ?? null;

  useEffect(() => {
    if (!on) { setMe(null); return; }
    let alive = true;
    call("GET", "/me").then((r) => { if (alive) setMe(r.ok && r.data ? Me.parse(r.data) : null); });
    return () => { alive = false; };
  }, [on]);

  const push = useCallback(async (): Promise<boolean> => {
    setSync("syncing");
    const r = await call("PUT", "/sync", local());
    setSync(r.ok ? "saved" : "offline");
    return r.ok;
  }, []);

  // When a child becomes the active learner: bring their saved progress here (merging this device's own only if it is not another child's).
  useEffect(() => {
    if (!on || !activeId) return;
    let alive = true;
    (async () => {
      setSync("syncing");
      const r = await call("GET", "/sync");
      if (!alive) return;
      if (!r.ok) { setSync("offline"); return; }
      const server = SyncData.parse(r.data);
      const owner = store.get(OWNER);
      const merged = owner && owner !== activeId ? server : mergeSync(local(), server); // never leak one child's progress into another's
      adopting.current = true; writeLocal(merged); adopting.current = false;
      store.set(OWNER, activeId);
      await push();
    })();
    return () => { alive = false; };
  }, [on, activeId, push]);

  // Save changes to the account a moment after the child stops clicking.
  useEffect(() => {
    if (!on || !activeId) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const changed = () => { if (adopting.current) return; clearTimeout(t); t = setTimeout(() => void push(), 1500); };
    const a = onProgressChange(changed), b = onResultsChange(changed), c = onRevisionChange(changed), d = onNotesChange(changed), e = onMistakesChange(changed);
    return () => { clearTimeout(t); a(); b(); c(); d(); e(); };
  }, [on, activeId, push]);

  const accept = (r: { ok: boolean; status: number; data: unknown }): Result => {
    if (!r.ok) return { ok: false, message: messageOf(r) };
    const parsed = Me.safeParse(r.data);
    if (!parsed.success) return { ok: false, message: "Something went wrong. Please try again." };
    setMe(parsed.data); return { ok: true };
  };
  const clearDevice = () => { replaceAllProgress({}); replaceAllResults({}); replaceAllRevision({}); replaceAllNotes({}); replaceAllMistakes({}); store.set(OWNER, ""); setSync("idle"); };

  const ctx = useMemo<Ctx>(() => ({
    me,
    active: me?.profiles.find((p) => p.id === activeId) ?? null,
    sync,
    register: async (email, password, child, contacts) => accept(await call("POST", "/register", { email, password, consent: true, child, ...contacts })),
    social: async (provider, token) => accept(await call("POST", "/social", { provider, token })),
    childLogin: async (email, nickname, secret) => accept(await call("POST", "/child-login", { email, nickname, ...secret })),
    childQuestion: async (email, nickname) => { const r = await call("POST", "/child-question", { email, nickname }); return r.ok ? ((r.data as { question: string | null }).question ?? null) : null; },
    setContacts: async (c) => accept(await call("PUT", "/contacts", { fatherEmail: c.fatherEmail ?? "", motherEmail: c.motherEmail ?? "" })),
    login: async (email, password) => accept(await call("POST", "/login", { email, password })),
    logout: async () => { await call("POST", "/logout", {}); clearDevice(); setMe(null); }, // progress stays safe in the account; the shared device starts clean
    addChild: async (c) => accept(await call("POST", "/children", c)),
    updateChild: async (id, c) => accept(await call("PUT", `/children/${id}`, c)),
    removeChild: async (id) => accept(await call("DELETE", `/children/${id}`)),
    select: async (id) => accept(await call("POST", `/children/${id}/select`, {})),
    deleteAccount: async (password) => { const r = await call("POST", "/delete", { password }); if (r.ok) { clearDevice(); setMe(null); return { ok: true }; } return { ok: false, message: messageOf(r) }; },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [me, activeId, sync]);
  void emptySync;
  return <AccountContext.Provider value={ctx}>{children}</AccountContext.Provider>;
}
