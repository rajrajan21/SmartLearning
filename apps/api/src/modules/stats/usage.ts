import { Router } from "express";
import { gte, sql } from "drizzle-orm";
import { dayNumber } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";
import { requireAdmin } from "../settings/admin-auth.js";
import type { SettingsService } from "../settings/service.js";

export interface UsageDay { day: number; aiAnswers: number }
export interface UsageReport { days: UsageDay[]; totalAi: number; busiestAi: number; avgAi: number; accounts: number; children: number; answers: number; limitPerChild: number; costNote: string }

/** Fills in zero days so the list is always `days` long, oldest first. */
export function fillDays(rows: { day: number; n: number }[], today: number, days: number): UsageDay[] {
  const by = new Map(rows.map((r) => [r.day, r.n]));
  return Array.from({ length: days }, (_, i) => { const d = today - (days - 1 - i); return { day: d, aiAnswers: by.get(d) ?? 0 }; });
}

/** AI help use, accounts and answers, so you can see whether the free model quota is enough. No names, no questions. */
export function adminUsageRoutes(db: Db, settings: SettingsService, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  r.get("/", async (req, res) => {
    const n = Math.min(60, Math.max(7, Number(req.query.days) || 14));
    const today = dayNumber();
    const rows = await db.select({ day: s.tutorUsage.day, n: sql<number>`sum(${s.tutorUsage.count})::int` }).from(s.tutorUsage).where(gte(s.tutorUsage.day, today - n + 1)).groupBy(s.tutorUsage.day);
    const days = fillDays(rows, today, n);
    const total = days.reduce((a, d) => a + d.aiAnswers, 0);
    const [u] = await db.select({ n: sql<number>`count(*)::int` }).from(s.users);
    const [c] = await db.select({ n: sql<number>`count(*)::int` }).from(s.studentProfiles);
    const [a] = await db.select({ n: sql<number>`count(*)::int` }).from(s.questionAttempts);
    const all = await settings.all();
    const out: UsageReport = { days, totalAi: total, busiestAi: Math.max(0, ...days.map((d) => d.aiAnswers)), avgAi: Math.round(total / n), accounts: u?.n ?? 0, children: c?.n ?? 0, answers: a?.n ?? 0, limitPerChild: Number(all["tutor.dailyLimit"]) || 0, costNote: "The site runs on free tools, so there is no per-use bill. The AI helper's free quota is the thing to watch." };
    res.json(out);
  });
  return r;
}
