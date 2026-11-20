import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Router } from "express";
import { and, eq, gt, inArray } from "drizzle-orm";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";
import { requireAdmin } from "../settings/admin-auth.js";
import type { SettingsService } from "../settings/service.js";
import { sendMail } from "./smtp.js";
import { isDue, readSmtp, weeklyBody, type WeekChild } from "./weekly.js";

export interface MailService {
  sendTest(to: string): Promise<void>;
  /** Sends this week's note to every parent now (admin button). */
  runNow(): Promise<{ sent: number; failed: number; skipped: string | null }>;
  /** Called every hour; sends when the chosen day and hour arrive. */
  tick(now?: Date): Promise<void>;
  status(): { lastSent: string | null; lastResult: string | null };
}

export function createMailService(db: Db, settings: SettingsService, stateFile: string | null): MailService {
  let state: { lastSent: string | null; lastResult: string | null } = { lastSent: null, lastResult: null };
  if (stateFile && existsSync(stateFile)) { try { state = { ...state, ...JSON.parse(readFileSync(stateFile, "utf8")) }; } catch { /* start fresh */ } }
  const save = () => { if (!stateFile) return; try { mkdirSync(dirname(stateFile), { recursive: true }); writeFileSync(stateFile, JSON.stringify(state)); } catch { /* ignore */ } };

  async function run(): Promise<{ sent: number; failed: number; skipped: string | null }> {
    const all = await settings.all();
    const cfg = readSmtp(all);
    if (!cfg) return { sent: 0, failed: 0, skipped: "Mail keys are not entered yet." };
    const since = new Date(Date.now() - 7 * 86400000);
    const links = await db.select().from(s.guardianships);
    const parentIds = [...new Set(links.map((l) => l.parentId))];
    if (parentIds.length === 0) return { sent: 0, failed: 0, skipped: "No parents yet." };
    const parents = await db.select().from(s.users).where(inArray(s.users.id, parentIds));
    const kidIds = [...new Set(links.map((l) => l.studentId))];
    const kids = await db.select().from(s.studentProfiles).where(inArray(s.studentProfiles.id, kidIds));
    const attempts = await db.select().from(s.questionAttempts).where(and(inArray(s.questionAttempts.studentId, kidIds), gt(s.questionAttempts.createdAt, since)));
    const siteName = String(all["site.name"] ?? "SharpStudy");
    const maxPer = Number(all["mail.weekly.maxPerRun"]) || 200;
    let sent = 0, failed = 0;
    for (const p of parents.slice(0, maxPer)) {
      if (!p.email || p.email.endsWith("@local") || !p.email.includes("@")) continue;
      const mine = links.filter((l) => l.parentId === p.id).map((l) => kids.find((k) => k.id === l.studentId)).filter((k): k is NonNullable<typeof k> => !!k);
      if (mine.length === 0) continue;
      const rows: WeekChild[] = mine.map((k) => {
        const a = attempts.filter((x) => x.studentId === k.id);
        return { nickname: k.nickname, lang: k.language === "ta" ? "ta" : "en", answered: a.length, correct: a.filter((x) => x.correct).length, days: new Set(a.map((x) => x.createdAt.toISOString().slice(0, 10))).size };
      });
      const lang = mine[0]!.language === "ta" ? "ta" : "en";
      const body = weeklyBody(rows, siteName, lang);
      try { await sendMail(cfg, { to: p.email, ...body }); sent++; } catch { failed++; }
    }
    return { sent, failed, skipped: null };
  }

  return {
    async sendTest(to) {
      const cfg = readSmtp(await settings.all());
      if (!cfg) throw new Error("Enter the mail server and the From address first, then save.");
      await sendMail(cfg, { to, subject: "SharpStudy test e-mail", text: "This is a test. Your mail settings work." });
    },
    runNow: async () => { const r = await run(); state = { lastSent: new Date().toISOString().slice(0, 10), lastResult: r.skipped ?? `${r.sent} sent, ${r.failed} failed` }; save(); return r; },
    async tick(now = new Date()) {
      const all = await settings.all();
      if (all["mail.weekly.enabled"] !== true) return;
      if (!isDue(now, Number(all["mail.weekly.day"]), Number(all["mail.weekly.hour"]), state.lastSent)) return;
      const r = await run();
      state = { lastSent: now.toISOString().slice(0, 10), lastResult: r.skipped ?? `${r.sent} sent, ${r.failed} failed` };
      save();
    },
    status: () => state,
  };
}

export function adminMailRoutes(svc: MailService, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  r.get("/", (_q, res) => res.json(svc.status()));
  r.post("/test", async (req, res) => {
    const to = String((req.body as { to?: string } | undefined)?.to ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) { res.status(400).json({ error: { code: "bad_request", message: "Enter a valid e-mail address." } }); return; }
    try { await svc.sendTest(to); res.json({ ok: true }); } catch (e) { res.status(400).json({ error: { code: "mail_failed", message: (e as Error).message.slice(0, 200) } }); }
  });
  r.post("/run", async (_q, res) => { res.json(await svc.runNow()); });
  return r;
}
