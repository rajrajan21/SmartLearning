import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { ChildInput, ChildLogin, Login, ParentContacts, Register, SocialLogin, SyncData } from "@studysmart/shared";
import { verifySocial, type Fetcher } from "./social.js";
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

export function accountRoutes(svc: AccountService, settings: SettingsService, secureCookie: boolean, fetcher?: Fetcher): Router {
  const r = Router();
  const err = (res: Response, status: number, code: string, message: string) => void res.status(status).json({ error: { code, message } });
  const guard = (fn: (req: Request, res: Response) => Promise<unknown>) => async (req: Request, res: Response, next: NextFunction) => {
    try { await fn(req, res); } catch (e) {
      if (e instanceof AccountError) return err(res, e.status, e.status === 401 ? "unauthorized" : e.status === 409 ? "conflict" : e.status === 403 ? "forbidden" : e.status === 429 ? "too_many" : e.status === 404 ? "not_found" : "bad_request", e.message);
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
  /** parent-only pages: a child signed in with a PIN cannot reach them */
  const parentOnly = (_req: Request, res: Response, next: NextFunction) => (auth(res).session.child ? err(res, 403, "forbidden", "Ask your parent to do this.") : next());
  const bad = (res: Response, e: z.ZodError) => err(res, 400, "bad_request", e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));

  const sensitive = rateLimit({ windowMs: 15 * 60_000, max: 20, message: "Too many tries. Wait a few minutes and try again." });

  const on = async (k: string) => (await settings.all())[k] === true;
  r.post("/register", sensitive, guard(async (req, res) => {
    if (!(await on("accounts.method.email"))) return err(res, 403, "forbidden", "Signing up with e-mail is switched off.");
    const b = Register.safeParse(req.body); if (!b.success) return bad(res, b.error);
    const l = await limitsOf(settings);
    const v = await settings.all(); const max = Number(v["accounts.maxClassesPerChild"] ?? 3);
    if (1 + b.data.child.extraClasses.length > max) return err(res, 400, "bad_request", `A child can study up to ${max} classes.`);
    if (v["accounts.parentEmails"] !== true) { b.data.fatherEmail = undefined; b.data.motherEmail = undefined; }
    b.data.child.boardCode = await boardFor(b.data.child.boardCode);
    const { token, me } = await svc.register(b.data, l);
    setCookie(res, token, l.sessionDays); res.status(201).json(me);
  }));
  r.post("/login", sensitive, guard(async (req, res) => {
    if (!(await on("accounts.method.email"))) return err(res, 403, "forbidden", "Signing in with e-mail is switched off.");
    const b = Login.safeParse(req.body); if (!b.success) return bad(res, b.error);
    const l = await limitsOf(settings);
    const { token, me } = await svc.login(b.data.email, b.data.password, l);
    setCookie(res, token, l.sessionDays); res.json(me);
  }));
  r.post("/social", sensitive, guard(async (req, res) => {
    const b = SocialLogin.safeParse(req.body); if (!b.success) return bad(res, b.error);
    const v = await settings.all();
    if (v[`accounts.method.${b.data.provider}`] !== true) return err(res, 403, "forbidden", "That sign-in method is switched off.");
    const idn = await verifySocial(b.data.provider, b.data.token, { googleClientId: String(v["accounts.google.clientId"] ?? "").replace(/^not set$/, ""), facebookAppId: String(v["accounts.facebook.appId"] ?? "").replace(/^not set$/, "") }, fetcher);
    if (!idn) return err(res, 401, "unauthorized", "Could not confirm that sign-in. Please try again.");
    const l = await limitsOf(settings);
    const out = await svc.social(b.data.provider, idn.id, idn.email, l);
    setCookie(res, out.token, l.sessionDays); res.status(out.created ? 201 : 200).json(out.me);
  }));
  r.post("/child-login", sensitive, guard(async (req, res) => {
    const v = await settings.all();
    if (v["accounts.child.login"] !== true) return err(res, 403, "forbidden", "Child sign-in is switched off.");
    const b = ChildLogin.safeParse(req.body); if (!b.success) return bad(res, b.error);
    if ((b.data.pin && v["accounts.child.pin"] !== true) || (b.data.answer && v["accounts.child.secret"] !== true) || (!b.data.pin && !b.data.answer)) return err(res, 400, "bad_request", "Enter your PIN or your secret answer.");
    const l = await limitsOf(settings);
    const { token, me } = await svc.childLogin(b.data, l);
    setCookie(res, token, l.sessionDays); res.json(me);
  }));
  /** before sign-in: the child's secret question, so the form can ask it (nothing else is revealed) */
  r.post("/child-question", sensitive, guard(async (req, res) => {
    const b = ChildLogin.pick({ email: true, nickname: true }).safeParse(req.body); if (!b.success) return bad(res, b.error);
    res.json({ question: await svc.childQuestion(b.data.email, b.data.nickname) });
  }));
  r.put("/contacts", needSession, parentOnly, guard(async (req, res) => {
    const b = ParentContacts.safeParse(req.body); if (!b.success) return bad(res, b.error);
    res.json(await svc.setContacts(auth(res).session, b.data));
  }));
  r.post("/logout", guard(async (req, res) => { const t = readCookie(req); if (t) await svc.logout(t); clearCookie(res); res.status(204).end(); }));

  r.get("/me", guard(async (req, res) => {
    const token = readCookie(req), session = await svc.session(token);
    if (!token || !session) return void res.json(null); // signed out is normal, not an error
    res.json(await svc.me(session));
  }));

  // Which board a child is on: the parent's pick when the admin allows choosing (and lists that board), else the site's board (CBSE unless the admin changed it).
  type Board = "CBSE" | "TNSTATE" | "TNMATRIC";
  const boardFor = async (want?: string): Promise<Board> => {
    const v = await settings.all();
    const fallback = String(v["catalog.defaultBoard"] ?? "CBSE") as Board;
    if (v["accounts.child.chooseBoard"] !== true) return fallback;
    const on: Record<string, boolean> = { CBSE: v["accounts.child.board.cbse"] !== false, TNSTATE: v["accounts.child.board.tnstate"] === true, TNMATRIC: v["accounts.child.board.tnmatric"] === true };
    return want && on[want] ? (want as Board) : fallback;
  };
  r.post("/children", needSession, parentOnly, guard(async (req, res) => {
    const b = ChildInput.safeParse(req.body); if (!b.success) return bad(res, b.error);
    b.data.boardCode = await boardFor(b.data.boardCode);
    res.status(201).json(await svc.addChild(auth(res).session, b.data, await limitsOf(settings)));
  }));
  r.put("/children/:id", needSession, parentOnly, guard(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id), b = ChildInput.safeParse(req.body);
    if (!id.success || !b.success) return err(res, 400, "bad_request", "Invalid child");
    b.data.boardCode = b.data.boardCode ? await boardFor(b.data.boardCode) : undefined;
    res.json(await svc.updateChild(auth(res).session, id.data, b.data));
  }));
  r.delete("/children/:id", needSession, parentOnly, guard(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id); if (!id.success) return err(res, 400, "bad_request", "Invalid child");
    res.json(await svc.removeChild(auth(res).session, id.data, auth(res).token));
  }));
  r.post("/children/:id/select", needSession, parentOnly, guard(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id); if (!id.success) return err(res, 400, "bad_request", "Invalid child");
    res.json(await svc.select(auth(res).session, auth(res).token, id.data));
  }));

  r.post("/delete", sensitive, needSession, parentOnly, guard(async (req, res) => {
    const b = z.object({ password: z.string().max(200) }).safeParse(req.body); if (!b.success) return bad(res, b.error);
    await svc.deleteAccount(auth(res).session, b.data.password); clearCookie(res); res.status(204).end();
  }));

  // Parent dashboard: only the signed-in parent's own children (the service looks them up through the guardianship).
  const dashboardOn = async () => (await settings.all())["feature.parentDashboard"] === true;
  r.get("/dashboard", needSession, parentOnly, guard(async (req, res) => {
    if (!(await dashboardOn())) return err(res, 404, "not_found", "The parent dashboard is switched off");
    const tz = z.coerce.number().int().min(-840).max(840).catch(0).parse(req.query.tz);
    res.json(await svc.dashboard(auth(res).session, tz));
  }));
  r.get("/export", needSession, parentOnly, guard(async (req, res) => {
    const v = await settings.all();
    if (v["feature.parentDashboard"] !== true || v["parent.export"] !== true) return err(res, 404, "not_found", "Downloads are switched off");
    res.set("Content-Disposition", 'attachment; filename="sharpstudy-data.json"').json(await svc.exportData(auth(res).session));
  }));

  r.get("/sync", needSession, guard(async (req, res) => void res.json(await svc.getSync(auth(res).session))));
  r.put("/sync", rateLimit({ windowMs: 60_000, max: 60 }), needSession, guard(async (req, res) => {
    const b = SyncData.safeParse(req.body); if (!b.success) return bad(res, b.error);
    res.json(await svc.putSync(auth(res).session, b.data));
  }));
  return r;
}
