import { useSettings } from "./settings";
import { detectPhone, resolveApp, useViewPref } from "./appview";

/** Is the phone app view on right now? Re-checks when the student changes the choice. */
export function useApp(): { app: boolean; phone: boolean; pref: ReturnType<typeof useViewPref>[0] } {
  const s = useSettings();
  const [pref] = useViewPref();
  const phone = detectPhone();
  const enabled = s.get("app.view.enabled") === true;
  return { app: resolveApp({ enabled, auto: s.get("app.view.autoPhone") === true, pref, phone }), phone: phone && enabled, pref };
}
