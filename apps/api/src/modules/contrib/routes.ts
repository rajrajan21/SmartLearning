import express, { Router, type NextFunction, type Request, type Response } from "express";
import { requireAdmin } from "../settings/admin-auth.js";
import { BOARDS, CANNED_REASONS, ContribError, LANGS, LICENCES, type ContribService } from "./service.js";
import { checkUrl, FetchError, parseDomains } from "./ssrf.js";
import { extractPdfDetails, fetchDetails } from "./pagefetch.js";
import { newId, type ContribStore, type Submission } from "./store.js";

export interface ContribRouteDeps {
  svc: ContribService;
  store: ContribStore;
  session: (req: Request) => Promise<{ userId: string; child?: boolean } | null>;
}
const err = (res: Response, status: number, code: string, message: string) => void res.status(status).json({ error: { code, message } });
const fail = (res: Response, e: unknown, next: NextFunction) => {
  if (e instanceof ContribError) return err(res, e.status, e.code, e.message);
  if (e instanceof FetchError) return err(res, 400, e.code, e.message);
  next(e);
};
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n) : "");

/** What a contributor may see of their own submission: status, reasons and the check names, never internals. */
export function publicSubmission(s: Submission) {
  return {
    id: s.id, status: s.status, createdAt: s.createdAt, updatedAt: s.updatedAt, title: s.meta.title, author: s.meta.author, licence: s.meta.licence, source: s.source,
    bookId: s.bookId, reasons: s.reasons, history: s.history.slice(-8),
    checks: (s.report?.checks ?? []).filter((c) => c.status !== "skip").map((c) => ({ id: c.id, label: c.label, status: c.status, detail: c.detail })),
    score: s.report?.score ?? null,
  };
}

/** A tiny per-address limiter for the contribute pages (the global limiter in app.ts is still in front). */
function limiter(perMinute: () => Promise<number>) {
  const hits = new Map<string, { n: number; t: number }>();
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const max = await perMinute(), now = Date.now(), k = req.ip ?? "x";
      const h = hits.get(k);
      if (!h || now - h.t > 60_000) hits.set(k, { n: 1, t: now });
      else if (++h.n > max) return err(res, 429, "slow_down", "Too many requests. Please wait a minute and try again.");
      if (hits.size > 5000) for (const [kk, v] of hits) if (now - v.t > 60_000) hits.delete(kk);
      next();
    } catch (e) { next(e); }
  };
}

/** Public routes, mounted in front of the E-Library routes at /api/v1/library. */
export function contribPublicRoutes(d: ContribRouteDeps): Router {
  const r = Router();
  const { svc, store } = d;
  r.use(async (req, res, next) => {
    try { const v = await svc.settings(); if (v["feature.library"] !== true) return next("router"); next(); } catch (e) { next(e); }
  });
  const slow = limiter(async () => Number((await svc.settings())["contrib.requestsPerMinute"] ?? 30));
  const on = async (res: Response, key?: string) => { const v = await svc.settings(); if (v["contrib.enabled"] !== true || (key && v[key] !== true)) { err(res, 404, "off", "This feature is switched off."); return null; } return v; };
  const who = async (req: Request) => { const s = await d.session(req); return s && !s.child ? s : null; };

  r.get("/contribute/config", slow, async (req, res, next) => {
    try {
      const v = await svc.settings();
      if (v["contrib.enabled"] !== true) return void res.json({ enabled: false });
      const s = await who(req), child = !!(await d.session(req))?.child;
      const allowed = String(v["contrib.licences.allowed"] ?? "").split(",").map((x) => x.trim()).filter((x) => LICENCES[x]);
      const ukey = s ? `u:${s.userId}` : `i:${svc.hashIp(req.ip ?? "")}`;
      res.set("Cache-Control", "no-store").json({
        enabled: true, signedIn: !!s, child, canContribute: !!s || v["contrib.guests.allowed"] === true, guestsAllowed: v["contrib.guests.allowed"] === true,
        anonymousAllowed: v["contrib.anonymous.allowed"] !== false, linkEnabled: v["contrib.link.enabled"] === true, requireProof: v["contrib.requireProof"] !== false,
        maxMB: v["contrib.maxMB"], maxPages: v["contrib.maxPages"], minPages: v["contrib.minPages"],
        remainingToday: Math.max(0, Number(v["contrib.perUserPerDay"] ?? 3) - store.count(ukey)),
        licences: allowed.map((id) => ({ id, name: LICENCES[id]!.name, url: LICENCES[id]!.url, needsProof: id !== "own" })),
        boards: BOARDS, languages: LANGS, challenge: v["contrib.challenge.enabled"] === false ? null : svc.challenge(), honeypot: v["contrib.honeypot.enabled"] !== false,
        httpsOnly: v["contrib.link.httpsOnly"] !== false, fetchEnabled: v["contrib.fetch.enabled"] !== false,
      });
    } catch (e) { next(e); }
  });

  // "Fetch details": read the page a contributor pasted and suggest the form fields (nothing is saved or submitted)
  const fetchSlow = limiter(async () => Number((await svc.settings())["contrib.fetch.perMinute"] ?? 6));
  r.post("/contribute/fetch-details", fetchSlow, express.json({ limit: "4kb" }), async (req, res, next) => {
    try {
      const v = await on(res, "contrib.fetch.enabled"); if (!v) return;
      const s = await who(req);
      if (!s && v["contrib.guests.allowed"] !== true) return err(res, 401, "signin", "Please sign in to fetch details.");
      const allowed = String(v["contrib.licences.allowed"] ?? "").split(",").map((x) => x.trim()).filter((x) => LICENCES[x]);
      const d = await fetchDetails(clip((req.body as { url?: unknown } | undefined)?.url, 600), {
        rules: { httpsOnly: v["contrib.link.httpsOnly"] !== false, allowDomains: parseDomains(String(v["contrib.link.allowDomains"] ?? "")), denyDomains: parseDomains(String(v["contrib.link.denyDomains"] ?? "")) },
        maxBytes: Number(v["contrib.fetch.maxKB"] ?? 800) * 1024, maxPdfBytes: Math.min(20, Number(v["contrib.link.maxMB"] ?? 60)) * 1048576, timeoutMs: Number(v["contrib.fetch.timeoutSec"] ?? 10) * 1000, maxRedirects: Number(v["contrib.link.maxRedirects"] ?? 3),
        respectRobots: v["contrib.link.respectRobots"] !== false, languages: LANGS.filter((l) => l !== "other"), licences: allowed, coverUrl: v["contrib.fetch.cover"] !== false,
      });
      res.set("Cache-Control", "no-store").json(d);
    } catch (e) { fail(res, e, next); }
  });

  r.post("/contribute/fetch-pdf-details", fetchSlow, async (req, res, next) => {
    try {
      const v = await on(res, "contrib.fetch.enabled"); if (!v) return;
      if (!await who(req)) return err(res, 401, "signin", "Please sign in to fetch PDF details.");
      const limit = Math.min(20, Number(v["contrib.maxMB"] ?? 60)) * 1048576;
      express.raw({ type: "application/pdf", limit })(req, res, async (e?: unknown) => {
        if (e) return err(res, (e as { status?: number }).status === 413 ? 413 : 400, "bad_upload", "The PDF could not be read for details. You can enter them by hand.");
        if (!Buffer.isBuffer(req.body)) return err(res, 415, "not_pdf", "Please choose a PDF file.");
        try {
          const fileName = decodeURIComponent(req.header("x-pdf-name") ?? "").slice(0, 150);
          const licences = String(v["contrib.licences.allowed"] ?? "").split(",").map((x) => x.trim()).filter((x) => LICENCES[x]);
          const details = await extractPdfDetails(req.body, fileName, { languages: LANGS, licences });
          res.set("Cache-Control", "no-store").json(details);
        } catch (error) { fail(res, error, next); }
      });
    } catch (e) { fail(res, e, next); }
  });

  // PDF upload: the raw bytes are the body, the details travel in one header (base64url JSON). The size limit is read from settings per request.
  r.post("/contribute/upload", slow, async (req, res, next) => {
    try {
      const v = await on(res); if (!v) return;
      const max = Number(v["contrib.maxMB"] ?? 60) * 1048576;
      const declared = Number(req.header("content-length") ?? 0);
      if (declared > max + 65536) return err(res, 413, "too_big", `That file is larger than ${Math.round(max / 1048576)} MB.`);
      express.raw({ type: () => true, limit: max + 65536 })(req, res, async (e?: unknown) => {
        if (e) return err(res, (e as { status?: number }).status === 413 ? 413 : 400, "bad_upload", (e as { status?: number }).status === 413 ? `That file is larger than ${Math.round(max / 1048576)} MB.` : "The upload could not be read.");
        try {
          let meta: Record<string, unknown> = {};
          try { meta = JSON.parse(Buffer.from(String(req.header("x-contrib-meta") ?? ""), "base64url").toString("utf8")) as Record<string, unknown>; } catch { return err(res, 400, "bad_meta", "The form details could not be read."); }
          const s = await who(req);
          const sub = await svc.submit({ userId: s?.userId ?? "guest", ip: req.ip ?? "", source: "upload", buffer: Buffer.isBuffer(req.body) ? req.body : undefined, fileName: clip(meta.fileName, 120), meta, honeypot: clip(meta.website, 50), token: clip(meta.token, 120), answer: clip(meta.answer, 10), displayName: clip(meta.displayName, 40), consent: meta.consent === true });
          res.status(202).json({ id: sub.id, status: sub.status });
        } catch (er) { if (er instanceof ContribError && er.code === "honeypot") return void res.status(202).json({ id: "s-000000000000", status: "received" }); fail(res, er, next); }
      });
    } catch (e) { fail(res, e, next); }
  });

  r.post("/contribute/link", slow, express.json({ limit: "24kb" }), async (req, res, next) => {
    try {
      const v = await on(res); if (!v) return;
      const b = (req.body ?? {}) as Record<string, unknown>;
      const s = await who(req);
      const sub = await svc.submit({ userId: s?.userId ?? "guest", ip: req.ip ?? "", source: "link", link: clip(b.link, 600), meta: b, honeypot: clip(b.website, 50), token: clip(b.token, 120), answer: clip(b.answer, 10), displayName: clip(b.displayName, 40), consent: b.consent === true });
      res.status(202).json({ id: sub.id, status: sub.status });
    } catch (e) { if (e instanceof ContribError && e.code === "honeypot") return void res.status(202).json({ id: "s-000000000000", status: "received" }); fail(res, e, next); }
  });

  // contributor area
  r.get("/contribute/mine", slow, async (req, res, next) => {
    try { const s = await who(req); if (!s) return err(res, 401, "signin", "Please sign in to see your contributions."); res.set("Cache-Control", "no-store").json({ submissions: svc.mine(s.userId).map(publicSubmission), notices: svc.notices(s.userId) }); } catch (e) { next(e); }
  });
  r.post("/contribute/:id/withdraw", slow, async (req, res, next) => {
    try { const s = await who(req); if (!s) return err(res, 401, "signin", "Please sign in."); res.json(publicSubmission(svc.withdraw(s.userId, String(req.params.id)))); } catch (e) { fail(res, e, next); }
  });
  r.post("/contribute/notices/read", slow, express.json({ limit: "2kb" }), async (req, res, next) => {
    try { const s = await who(req); if (!s) return err(res, 401, "signin", "Please sign in."); svc.markRead(s.userId, typeof req.body?.id === "string" ? req.body.id : undefined); res.json({ ok: true }); } catch (e) { next(e); }
  });

  // reader helpers
  r.get("/search", slow, async (req, res, next) => {
    try { const v = await on(res, "contrib.publish.crossLibrarySearch"); if (!v) return; res.set("Cache-Control", "no-cache").json({ hits: svc.search(clip(req.query.q, 80)) }); } catch (e) { next(e); }
  });
  r.get("/contributor/:handle", slow, async (req, res, next) => {
    try { const v = await on(res, "contrib.publish.profiles"); if (!v) return; const p = svc.profile(String(req.params.handle)); if (!p) return err(res, 404, "not_found", "Nothing to show here."); res.json(p); } catch (e) { next(e); }
  });
  r.get("/:id/text", slow, async (req, res, next) => {
    try {
      const v = await on(res, "contrib.reader.searchInBook"); if (!v) return;
      const t = svc.textOf(String(req.params.id));
      if (!t) return err(res, 404, "not_found", "No text for this book.");
      res.set("Cache-Control", "public, max-age=3600").json({ pages: t.pages, outline: v["contrib.reader.contents"] === false ? [] : t.outline });
    } catch (e) { next(e); }
  });
  const bookOk = (id: string) => /^c-[a-f0-9]{12}$/.test(id) && store.db.books.some((b) => b.id === id);
  r.post("/:id/problem", slow, express.json({ limit: "6kb" }), async (req, res, next) => {
    try {
      const v = await on(res, "contrib.reader.reportButton"); if (!v) return;
      const id = String(req.params.id);
      if (!bookOk(id)) return err(res, 404, "not_found", "Book not found");
      const message = clip(req.body?.message, 600);
      if (message.length < 5) return err(res, 400, "message", "Please tell us briefly what is wrong.");
      const ipHash = svc.hashIp(req.ip ?? "");
      if (store.count(`p:${ipHash}`) >= 10) return err(res, 429, "limit", "Thank you, we already have your reports for today.");
      store.bump(`p:${ipHash}`);
      store.db.problems.push({ id: newId("p-"), bookId: id, at: new Date().toISOString(), kind: ["wrong_content", "personal", "copyright", "unsafe", "broken", "other"].includes(String(req.body?.kind)) ? String(req.body.kind) : "other", message, status: "open", ipHash });
      store.stat("problems"); store.save();
      res.status(201).json({ ok: true });
    } catch (e) { next(e); }
  });
  r.post("/:id/takedown", slow, express.json({ limit: "8kb" }), async (req, res, next) => {
    try {
      const v = await on(res, "contrib.takedown.enabled"); if (!v) return;
      const id = String(req.params.id);
      if (!bookOk(id)) return err(res, 404, "not_found", "Book not found");
      const b = req.body ?? {};
      const name = clip(b.name, 80), email = clip(b.email, 120), message = clip(b.message, 1500);
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 20) return err(res, 400, "details", "Please give your name, a working email and at least a sentence explaining your rights.");
      const ipHash = svc.hashIp(req.ip ?? "");
      if (store.count(`t:${ipHash}`) >= 5) return err(res, 429, "limit", "Thank you, we already have your requests for today.");
      store.bump(`t:${ipHash}`);
      store.db.takedowns.push({ id: newId("t-"), bookId: id, at: new Date().toISOString(), name, email, relationship: clip(b.relationship, 80), message, status: "open", decidedAt: "", ipHash });
      if (v["contrib.takedown.hideAtOnce"] !== false) svc.setHidden(id, true, "takedown", "hidden until decided");
      store.stat("takedowns"); store.audit("public", "takedown_requested", id); store.save();
      res.status(201).json({ ok: true, hidden: v["contrib.takedown.hideAtOnce"] !== false });
    } catch (e) { next(e); }
  });
  return r;
}

const csv = (rows: (string | number)[][]) => rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`).join(",")).join("\r\n");

/** Admin routes: /api/v1/admin/contrib */
export function contribAdminRoutes(d: ContribRouteDeps, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  const { svc, store } = d;
  r.use(requireAdmin(adminKey, adminUserId));
  r.use(express.json({ limit: "400kb" }));
  const row = (s: Submission) => ({ id: s.id, status: s.status, createdAt: s.createdAt, updatedAt: s.updatedAt, title: s.meta.title, author: s.meta.author, board: s.meta.board, classLevel: s.meta.classLevel, subject: s.meta.subject, language: s.meta.language, licence: s.meta.licence, source: s.source, bytes: s.bytes, score: s.report?.score ?? null, outcome: s.report?.outcome ?? null, fails: s.report?.checks.filter((c) => c.status === "fail").length ?? 0, warns: s.report?.checks.filter((c) => c.status === "warn").length ?? 0, displayName: s.displayName, bookId: s.bookId, fileKept: s.fileKept });

  r.get("/overview", (_req, res) => res.json({ stats: svc.stats(), cannedReasons: CANNED_REASONS, paths: { data: store.dirs.root } }));
  r.get("/submissions", (req, res) => {
    const st = clip(req.query.status, 20), q = clip(req.query.q, 80).toLowerCase();
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50)), offset = Math.max(0, Number(req.query.offset) || 0);
    const all = store.db.submissions.filter((s) => (!st || st === "all" || s.status === st) && (!q || `${s.meta.title} ${s.meta.author} ${s.displayName} ${s.id}`.toLowerCase().includes(q))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ total: all.length, items: all.slice(offset, offset + limit).map(row) });
  });
  r.get("/submissions/:id", (req, res) => {
    const s = store.find(String(req.params.id));
    if (!s) return err(res, 404, "not_found", "Not found");
    const { ipHash: _ip, userId: _u, ...rest } = s;
    res.json({ ...rest, contributorHandle: svc.handleOf(s.userId), userKnown: s.userId !== "guest" });
  });
  r.get("/submissions/:id/preview", (req, res) => {
    const p = svc.previewOf(String(req.params.id), Number(req.query.page) || 1);
    if (!p) return err(res, 404, "gone", "The stored text is no longer available (the file was deleted).");
    res.json(p);
  });
  r.get("/submissions/:id/file", (req, res) => {
    const s = store.find(String(req.params.id));
    const buf = s && ["in_review", "changes_requested"].includes(s.status) ? store.readQuarantine(s.id) : null;
    if (!buf) return err(res, 404, "gone", "The file is not stored.");
    store.audit("admin", "viewed_file", s!.id); store.save();
    res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${s!.id}.pdf"`, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store", "Content-Security-Policy": "sandbox" }).send(buf);
  });
  r.post("/submissions/:id/decision", async (req, res, next) => {
    try {
      const a = String(req.body?.action);
      if (!["approve", "reject", "changes"].includes(a)) return err(res, 400, "action", "Unknown action");
      const s = await svc.decide(String(req.params.id), a as "approve", { by: "admin", reason: clip(req.body?.reason, 400), canned: clip(req.body?.canned, 20) });
      res.json(row(s));
    } catch (e) { fail(res, e, next); }
  });
  r.post("/submissions/bulk", async (req, res, next) => {
    try {
      const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids.filter((x: unknown) => typeof x === "string").slice(0, 100) : [];
      const a = String(req.body?.action);
      if (!["approve", "reject", "changes"].includes(a)) return err(res, 400, "action", "Unknown action");
      const results: { id: string; ok: boolean; message?: string }[] = [];
      for (const id of ids) { try { await svc.decide(id, a as "approve", { by: "admin", reason: clip(req.body?.reason, 400), canned: clip(req.body?.canned, 20) }); results.push({ id, ok: true }); } catch (e) { results.push({ id, ok: false, message: (e as Error).message }); } }
      res.json({ results });
    } catch (e) { next(e); }
  });
  r.put("/submissions/:id/note", (req, res) => { const s = store.find(String(req.params.id)); if (!s) return err(res, 404, "not_found", "Not found"); s.adminNote = clip(req.body?.note, 1000); store.save(); res.json({ ok: true }); });

  r.get("/terms", (_req, res) => res.json(store.terms()));
  r.put("/terms", (req, res) => { const t = store.saveTerms(req.body); store.audit("admin", "edited_term_lists", "terms"); store.save(); res.json(t); });

  r.get("/blocked", (_req, res) => res.json({ items: store.db.blocked }));
  r.post("/blocked", (req, res) => {
    const s = store.find(clip(req.body?.submissionId, 20));
    const kind = req.body?.kind === "ip" ? "ip" : "user";
    if (!s) return err(res, 404, "not_found", "Choose a submission to block its contributor.");
    const key = kind === "ip" ? s.ipHash : s.userId;
    if (kind === "user" && s.userId === "guest") return err(res, 400, "guest", "That submission was sent by a guest. Block the internet address instead.");
    if (!store.isBlocked(kind, key)) store.db.blocked.push({ key, kind, at: new Date().toISOString(), note: clip(req.body?.note, 200) });
    store.audit("admin", "blocked_contributor", s.id, kind); store.save();
    res.json({ items: store.db.blocked });
  });
  r.delete("/blocked/:kind/:key", (req, res) => { store.db.blocked = store.db.blocked.filter((b) => !(b.kind === req.params.kind && b.key === req.params.key)); store.audit("admin", "unblocked", String(req.params.kind)); store.save(); res.json({ items: store.db.blocked }); });

  r.get("/takedowns", (_req, res) => res.json({ items: [...store.db.takedowns].reverse() }));
  r.post("/takedowns/:id", (req, res) => {
    const t = store.db.takedowns.find((x) => x.id === req.params.id);
    if (!t) return err(res, 404, "not_found", "Not found");
    const dec = req.body?.decision === "upheld" ? "upheld" : "dismissed";
    t.status = dec; t.decidedAt = new Date().toISOString();
    if (dec === "upheld") svc.removeBook(t.bookId, "admin") || svc.setHidden(t.bookId, true, "admin", "takedown upheld");
    else svc.setHidden(t.bookId, false, "admin", "takedown dismissed");
    store.audit("admin", `takedown_${dec}`, t.bookId); store.save();
    res.json(t);
  });
  r.get("/problems", (_req, res) => res.json({ items: [...store.db.problems].reverse() }));
  r.post("/problems/:id/done", (req, res) => { const p = store.db.problems.find((x) => x.id === req.params.id); if (!p) return err(res, 404, "not_found", "Not found"); p.status = "done"; store.save(); res.json(p); });

  r.get("/books", (_req, res) => res.json({ items: store.db.books.map((b) => ({ id: b.id, title: b.title, hidden: b.hidden === true, addedAt: b.addedAt, by: (b.contributed as { by?: string } | undefined)?.by ?? "", licence: (b.licence as { code?: string } | undefined)?.code ?? "" })) }));
  r.post("/books/:id/:op", (req, res) => {
    const id = String(req.params.id), op = String(req.params.op);
    const ok = op === "hide" ? svc.setHidden(id, true, "admin") : op === "show" ? svc.setHidden(id, false, "admin") : op === "remove" ? svc.removeBook(id, "admin") : false;
    if (!ok) return err(res, 404, "not_found", "Not found");
    res.json({ ok: true });
  });
  r.get("/audit", (req, res) => res.json({ items: [...store.db.audit].reverse().slice(0, Math.min(1000, Number(req.query.limit) || 200)) }));
  r.get("/export", (req, res) => {
    if (req.query.format === "csv") {
      res.set({ "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="contributions.csv"' });
      return void res.send(csv([["id", "created", "status", "title", "author", "board", "class", "subject", "language", "licence", "source", "score", "fails", "warns", "bookId"], ...store.db.submissions.map((s) => { const x = row(s); return [x.id, x.createdAt, x.status, x.title, x.author, x.board, x.classLevel, x.subject, x.language, x.licence, x.source, x.score ?? "", x.fails, x.warns, x.bookId]; })]));
    }
    res.set("Content-Disposition", 'attachment; filename="contributions.json"').json({ exportedAt: new Date().toISOString(), submissions: store.db.submissions.map(row), takedowns: store.db.takedowns, problems: store.db.problems, audit: store.db.audit });
  });
  r.post("/sweep", async (_req, res, next) => { try { res.json(await svc.sweep()); } catch (e) { next(e); } });
  r.post("/check-link", async (req, res, next) => {
    try {
      const v = await svc.settings();
      try { const u = checkUrl(String(req.body?.url ?? ""), { httpsOnly: v["contrib.link.httpsOnly"] !== false, allowDomains: parseDomains(String(v["contrib.link.allowDomains"] ?? "")), denyDomains: parseDomains(String(v["contrib.link.denyDomains"] ?? "")) }); res.json({ allowed: true, host: u.hostname }); } catch (e) { res.json({ allowed: false, reason: (e as Error).message }); }
    } catch (e) { next(e); }
  });
  return r;
}
