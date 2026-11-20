import { Router, type Request, type Response } from "express";
import type { LibraryStore } from "./store.js";
import { PAGE_FILE, touchUsed, type LibraryPages } from "./pages.js";

const notFound = (res: Response) => void res.status(404).json({ error: { code: "not_found", message: "Book not found" } });

/**
 * E-Library: the list (age and language filters are done in the browser), the PDF (served in pieces so the reader
 * can open any page quickly) and the cover picture. The invite-code door in app.ts sits in front like every /api route.
 */
export function libraryRoutes(store: LibraryStore, enabled: () => Promise<boolean>, pages?: LibraryPages, settings?: () => Promise<Record<string, unknown>>): Router {
  const r = Router();
  r.use(async (_req, res, next) => { try { if (!(await enabled())) return notFound(res); next(); } catch (e) { next(e); } });
  r.get("/", (_req, res) => void res.set("Cache-Control", "no-cache").json(store.list()));

  r.get("/:id/file", (req: Request, res: Response) => {
    const id = String(req.params.id);
    const p = store.filePath(id);
    if (!p) return notFound(res);
    const kind = req.query.download === "1" ? "attachment" : "inline";
    res.sendFile(p, {
      acceptRanges: true, // pdf.js asks for just the pages it needs
      dotfiles: "deny",
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${kind}; filename="${id.replace(/[^A-Za-z0-9._-]/g, "_")}.pdf"`,
        "Cache-Control": "public, max-age=604800, immutable", // a stored book never changes (a new version gets a new id)
        "X-Content-Type-Options": "nosniff",
      },
    }, (err) => {
      if (!err || res.headersSent) return;
      if ((err as { status?: number }).status === 416) return void res.status(416).json({ error: { code: "range", message: "Range not satisfiable" } });
      notFound(res);
    });
  });

  // Book Reader support: are ready-made page pictures there? (asking also starts drawing them, once, in the background)
  r.get("/:id/info", async (req: Request, res: Response, next) => {
    try {
      const id = String(req.params.id);
      if (!store.filePath(id)) return notFound(res);
      const v = (await settings?.()) ?? {};
      const reader = v["library.pages.enabled"] !== false && !!pages;
      const body: Record<string, unknown> = { reader, fallbackPdf: v["library.pages.fallbackPdf"] !== false, state: "off", fast: null };
      if (reader && pages) {
        let state = pages.state(id);
        if (state === "none") state = await pages.ensure(id, "open");
        const i = pages.info(id);
        body.state = i ? "ready" : state;
        if (i) { touchUsed(pages.dir(id)); body.fast = { pages: i.pages, ratio: i.ratio, base: `/api/v1/library/${encodeURIComponent(id)}/pages/` }; }
      }
      res.set("Cache-Control", "no-store").json(body);
    } catch (e) { next(e); }
  });
  r.get("/:id/pages/:file", (req: Request, res: Response) => {
    const id = String(req.params.id), file = String(req.params.file);
    if (!pages || !PAGE_FILE.test(file) || !store.filePath(id) || !pages.info(id)) return notFound(res);
    res.sendFile(`${pages.dir(id)}/${file}`, { dotfiles: "deny", headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" } }, (err) => { if (err && !res.headersSent) notFound(res); });
  });
  r.get("/:id/cover", (req: Request, res: Response) => {
    const p = store.coverPath(String(req.params.id));
    if (!p) return notFound(res);
    res.sendFile(p, { dotfiles: "deny", headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=604800, immutable", "X-Content-Type-Options": "nosniff" } }, (err) => { if (err && !res.headersSent) notFound(res); });
  });
  return r;
}
