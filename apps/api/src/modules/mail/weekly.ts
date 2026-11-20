import type { SmtpConfig, Mail } from "./smtp.js";

export interface WeekChild { nickname: string; lang: "en" | "ta"; answered: number; correct: number; days: number }

/** Plain-text weekly note for one parent. Pure, so it is easy to test. */
export function weeklyBody(children: WeekChild[], siteName: string, lang: "en" | "ta"): { subject: string; text: string } {
  const ta = lang === "ta";
  const lines = children.map((c) => {
    if (c.answered === 0) return ta ? `${c.nickname}: இந்த வாரம் பயிற்சி இல்லை. சிறிய தொடக்கம் போதும்!` : `${c.nickname}: no practice this week. A small start is enough!`;
    const pct = Math.round((c.correct / c.answered) * 100);
    return ta
      ? `${c.nickname}: ${c.days} நாள் படித்தார்; ${c.answered} கேள்விகளில் ${c.correct} சரி (${pct}%).`
      : `${c.nickname}: studied on ${c.days} day${c.days === 1 ? "" : "s"}; ${c.correct} of ${c.answered} questions right (${pct}%).`;
  });
  const head = ta ? "இந்த வாரம் உங்கள் குழந்தையின் படிப்பு:" : "Your child's week of learning:";
  const foot = ta ? `${siteName} - இலவசமாக, அனைவருக்கும்.` : `${siteName} - free for every student.`;
  return { subject: ta ? `${siteName}: வார அறிக்கை` : `${siteName}: your weekly summary`, text: [head, "", ...lines, "", foot].join("\n") };
}

/** True when this hour is the chosen day and hour, and nothing was sent today yet. */
export function isDue(now: Date, day: number, hour: number, lastSent: string | null): boolean {
  if (now.getDay() !== day || now.getHours() < hour) return false;
  return lastSent !== now.toISOString().slice(0, 10);
}

export function readSmtp(all: Record<string, unknown>): SmtpConfig | null {
  const host = String(all["mail.smtp.host"] ?? "").trim(); const from = String(all["mail.smtp.from"] ?? "").trim();
  if (!host || host === "not set" || !from || from === "not set") return null;
  const user = String(all["mail.smtp.user"] ?? "").trim();
  return { host, port: Number(all["mail.smtp.port"]) || 465, user: user === "not set" ? "" : user, pass: String(all["mail.smtp.pass"] ?? "").replace(/^not set$/, ""), from, secure: all["mail.smtp.secure"] === "starttls" ? "starttls" : "ssl" };
}
export type { Mail };
