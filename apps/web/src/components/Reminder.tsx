import { useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { store } from "../lib/storage";

/** Is `hour` inside quiet hours? Works when the quiet time crosses midnight (21 to 7). */
export const inQuiet = (hour: number, start: number, end: number): boolean => (start === end ? false : start < end ? hour >= start && hour < end : hour >= start || hour < end);
export const shouldRemind = (hour: number, at: number, qs: number, qe: number, goalMet: boolean, dismissed: boolean): boolean => !goalMet && !dismissed && hour >= at && !inQuiet(hour, qs, qe);

export function Reminder({ goalMet, now = new Date() }: { goalMet: boolean; now?: Date }) {
  const s = useSettings();
  const day = now.toISOString().slice(0, 10);
  const [gone, setGone] = useState(store.get("ss_reminder_off") === day);
  if (s.get("reminder.enabled") !== true) return null;
  if (!shouldRemind(now.getHours(), s.get<number>("reminder.hour"), s.get<number>("reminder.quietStart"), s.get<number>("reminder.quietEnd"), goalMet, gone)) return null;
  return (
    <aside className="reminder" role="status">
      <span>⏰ {ui("reminderText", s.lang)}</span>
      <button type="button" className="link" onClick={() => { store.set("ss_reminder_off", day); setGone(true); }}>{ui("reminderLater", s.lang)}</button>
    </aside>
  );
}
