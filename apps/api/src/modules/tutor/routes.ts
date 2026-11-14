import { Router, type Request } from "express";
import { AskRequest } from "@studysmart/shared";
import { rateLimit } from "../../http/rate-limit.js";
import type { SettingsService } from "../settings/service.js";
import { TutorError, type createTutorService } from "./service.js";

export function tutorRoutes(svc: ReturnType<typeof createTutorService>, settings: SettingsService, studentOf?: (req: Request) => Promise<string | null>): Router {
  const r = Router();
  r.post("/ask", rateLimit({ windowMs: 60_000, max: 20, message: "You are asking very fast. Wait a moment." }), async (req, res) => {
    const v = await settings.all();
    if (v["feature.aiTutor"] !== true) return void res.status(404).json({ error: { code: "not_found", message: "The question helper is switched off" } });
    const body = AskRequest.safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: body.error.issues.map((i) => i.message).join("; ") } });
    const studentId = studentOf ? await studentOf(req) : null;
    if (v["tutor.requireSignIn"] === true && !studentId) return void res.status(401).json({ error: { code: "unauthorized", message: "Please sign in and choose who is learning to ask questions." } });
    try {
      const out = await svc.ask(body.data, { studentId, ip: req.ip ?? "unknown" }, { useAI: v["tutor.useAI"] === true, dailyLimit: Number(v["tutor.dailyLimit"]), maxChars: Number(v["tutor.maxQuestionChars"]) });
      res.set("Cache-Control", "no-store").json(out);
    } catch (e) {
      if (e instanceof TutorError) return void res.status(e.status).json({ error: { code: e.status === 404 ? "not_found" : "bad_request", message: e.message } });
      throw e;
    }
  });
  return r;
}
