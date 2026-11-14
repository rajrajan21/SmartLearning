import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { ChildInput, Login, Register, SyncData } from "@studysmart/shared";
import { rateLimit } from "../../http/rate-limit.js";
import type { SettingsService } from "../settings/service.js";
import { AccountError, type AccountService, type Limits, type Session } from "./service.js";

const COOKIE = "ss_session";
export const readCookie = (req: Request): string | undefined => {
  for (const part of (req.headers.cookie ?? "").split(";")) { const i = part.indexOf("="); if (part.slice(0, i).trim() === COOKIE) return decodeURIComponent(part.slice(i + 1).trim()); }
  return undefined;
};
const auth = (res: Response) => res.locals.ss as { token: string; session: Session };

export async function limitsOf(settings: SettingsService): Promise<Limits> {
  const v = await settings.all();
  return { minPassword: Number(v["accounts.passwordMinLength"]), maxChildren: Number(v["accounts.maxChildren"]), sessionDays: Number(v["accounts.sessionDays"]), signup: v["accounts.signup"] === true };
}

export function accountRoutes(svc: AccountService, settings: SettingsService, secureCookie: boolean): Router {
  const r = Router();
  const err = (res: Response, status: number, code: string, message: string) => void res.status(status).json({ error: { code, message } });
  const guard = (fn: (req: Request, res: Response) => Promise<unknown>) => async (req: Request, res: Response, next: NextFunction) => {
    try { await fn(req, res); } catch (e) {
      if (e instanceof AccountError) return err(res, e.status, e.status === 401 ? "unauthorized" : e.status === 409 ? "conflict" : e.status === 403 ? "forbidden" : e.status === 404 ? "not_found" : "bad_request", e.message);
      next(e);
    }
  };
  const setCookie = (res: Response, token: string, days: number) =>
    res.append("Set-Cookie", `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${days * 86400}${secureCookie ? "; Secure" : ""}`);
  const clearCookie = (res: Response) => res.append("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookie ? "; Secure" : ""}`);

  // Every account route: switched off with feature.accounts, never cached, JSON only (blocks cross-site form posts).
  r.use(async (req, res, next) => {
    if ((await settings.all())["feature.accounts"] !== true) return err(res, 404, "not_found", "Accounts are switched off");
    res.set("Cache-Control", "no-store");
    if (["POST", "PUT", "PATCH"].includes(req.method) && !req.is("application/json")) return err(res, 415, "bad_request", "JSON only");
    next();
  });
  const needSession = async (req: Request, res: Response, next: NextFunction) => {
    const token = readCookie(req);
    const session = await svc.session(token);
    if (!token || !session) return err(res, 401, "unauthorized", "Please sign in.");
    res.locals.ss = { token, session };
    next();
  };
  const bad = (res: Response, e: z.ZodError) => err(res, 400, "bad_request", e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));

  const sensitive = rateLimit({ windowMs: 15 * 60_000, max: 20, message: "Too many tries. Wait a few minutes and try again." });

  r.post("/register", sensitive, guard(async (req, res) => {
    const b = Register.safeParse(req.body); if (!b.success) return bad(res, b.error);
    const l = await limitsOf(settings);
    const { token, me } = await svc.register(b.data, l);
    setCookie(res, token, l.sessionDays); res.status(201).json(me);
  }));
  r.post("/login", sensitive, guard(async (req, res) => {
    const b = Login.safeParse(req.body); if (!b.success) return bad(res, b.error);
    const l = await limitsOf(settings);
    const { token, me } = await svc.login(b.data.email, b.data.password, l);
    setCookie(res, token, l.sessionDays); res.json(me);
  }));
  r.post("/logout", guard(async (req, res) => { const t = readCookie(req); if (t) await svc.logout(t); clearCookie(res); res.status(204).end(); }));

  r.get("/me", guard(async (req, res) => {
    const token = readCookie(req), session = await svc.session(token);
    if (!token || !session) return void res.json(null); // signed out is normal, not an error
    res.json(await svc.me(session));
  }));

  r.post("/children", needSession, guard(async (req, res) => {
    const b = ChildInput.safeParse(req.body); if (!b.success) return bad(res, b.error);
    res.status(201).json(await svc.addChild(auth(res).session, b.data, await limitsOf(settings)));
  }));
  r.put("/children/:id", needSession, guard(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id), b = ChildInput.safeParse(req.body);
    if (!id.success || !b.success) return err(res, 400, "bad_request", "Invalid child");
    res.json(await svc.updateChild(auth(res).session, id.data, b.data));
  }));
  r.delete("/children/:id", needSession, guard(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id); if (!id.success) return err(res, 400, "bad_request", "Invalid child");
    res.json(await svc.removeChild(auth(res).session, id.data, auth(res).token));
  }));
  r.post("/children/:id/select", needSession, guard(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id); if (!id.success) return err(res, 400, "bad_request", "Invalid child");
    res.json(await svc.select(auth(res).session, auth(res).token, id.data));
  }));

  r.post("/delete", sensitive, needSession, guard(async (req, res) => {
    const b = z.object({ password: z.string().max(200) }).safeParse(req.body); if (!b.success) return bad(res, b.error);
    await svc.deleteAccount(auth(res).session, b.data.password); clearCookie(res); res.status(204).end();
  }));

  // Parent dashboard: only the signed-in parent's own children (the service looks them up through the guardianship).
  const dashboardOn = async () => (await settings.all())["feature.parentDashboard"] === true;
  r.get("/dashboard", needSession, guard(async (req, res) => {
    if (!(await dashboardOn())) return err(res, 404, "not_found", "The parent dashboard is switched off");
    const tz = z.coerce.number().int().min(-840).max(840).catch(0).parse(req.query.tz);
    res.json(await svc.dashboard(auth(res).session, tz));
  }));
  r.get("/export", needSession, guard(async (req, res) => {
    const v = await settings.all();
    if (v["feature.parentDashboard"] !== true || v["parent.export"] !== true) return err(res, 404, "not_found", "Downloads are switched off");
    res.set("Content-Disposition", 'attachment; filename="studysmart-data.json"').json(await svc.exportData(auth(res).session));
  }));

  r.get("/sync", needSession, guard(async (req, res) => void res.json(await svc.getSync(auth(res).session))));
  r.put("/sync", rateLimit({ windowMs: 60_000, max: 60 }), needSession, guard(async (req, res) => {
    const b = SyncData.safeParse(req.body); if (!b.success) return bad(res, b.error);
    res.json(await svc.putSync(auth(res).session, b.data));
  }));
  return r;
}
