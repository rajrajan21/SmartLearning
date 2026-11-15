import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaults, publicSettings, type SettingValue } from "@studysmart/shared";
import { store } from "./storage";
import { applyTheme } from "./theme";
import { useThemePref } from "./appview";
import type { Lang, Named } from "./i18n";
import { pickName } from "./i18n";

type Values = Record<string, SettingValue>;
interface Ctx {
  values: Values;
  get<T extends SettingValue = boolean>(key: string): T;
  lang: Lang;
  setLang(l: Lang): void;
  /** localized text setting in the current language */
  text(key: string): string;
  name(n: Named): string;
  online: boolean;
}
const SettingsContext = createContext<Ctx | null>(null);
export const useSettings = () => { const c = useContext(SettingsContext); if (!c) throw new Error("SettingsProvider missing"); return c; };

const CACHE_KEY = "ss_settings_v1";

export function SettingsProvider({ children, override }: { children: ReactNode; override?: Values }) {
  const [fetched, setFetched] = useState<Values>(() => ({ ...publicSettings(defaults()), ...(store.getJson<Values>(CACHE_KEY) ?? {}) }));
  const [lang, setLangState] = useState<Lang | null>(() => { const l = store.get("ss_lang"); return l === "ta" || l === "en" ? l : null; });
  const [prefersDark, setPrefersDark] = useState(() => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine !== false);

  useEffect(() => {
    let alive = true;
    fetch("/api/v1/settings/public")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { values: Values }) => { if (alive) { setFetched((cur) => ({ ...cur, ...d.values })); store.setJson(CACHE_KEY, d.values); } })
      .catch(() => { /* keep cached or default settings */ });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => setPrefersDark(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  useEffect(() => {
    const up = () => setOnline(true), down = () => setOnline(false);
    addEventListener("online", up); addEventListener("offline", down);
    return () => { removeEventListener("online", up); removeEventListener("offline", down); };
  }, []);

  const values = useMemo(() => ({ ...fetched, ...(override ?? {}) }), [fetched, override]);
  const themePref = useThemePref();
  useEffect(() => { applyTheme(themePref && values["app.theme.control"] !== false ? { ...values, "theme.mode": themePref } : values, prefersDark); }, [values, prefersDark, themePref]);

  const tamilOn = values["lang.tamil.enabled"] !== false;
  const effectiveLang: Lang = !tamilOn ? "en" : (lang ?? (values["lang.default"] === "ta" ? "ta" : "en"));
  useEffect(() => { document.documentElement.lang = effectiveLang; }, [effectiveLang]);

  const setLang = useCallback((l: Lang) => { setLangState(l); store.set("ss_lang", l); }, []);
  const get = useCallback(<T extends SettingValue = boolean>(key: string) => values[key] as T, [values]);
  const text = useCallback((key: string) => {
    const v = values[key] as { en: string; ta?: string } | undefined;
    return v ? pickName(v, effectiveLang, values["lang.fallbackToEnglish"] !== false) : "";
  }, [values, effectiveLang]);
  const name = useCallback((n: Named) => pickName(n, effectiveLang, values["lang.fallbackToEnglish"] !== false), [effectiveLang, values]);

  const ctx = useMemo<Ctx>(() => ({ values, get, lang: effectiveLang, setLang, text, name, online }), [values, get, effectiveLang, setLang, text, name, online]);
  return <SettingsContext.Provider value={ctx}>{children}</SettingsContext.Provider>;
}
