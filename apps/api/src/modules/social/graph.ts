import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

/** Thin Meta Graph API client. The token goes in the Authorization header (never in a URL, never logged); errors are cleaned of any secret before they leave this file. */
export interface GraphCfg { version: string; token: string; appSecret?: string; timeoutMs: number; fetchImpl?: typeof fetch }
export class GraphError extends Error { constructor(message: string, readonly code?: number, readonly subcode?: number, readonly status?: number) { super(message); } }

type BeforePublish = (remoteId?: string) => Promise<void>;

const clean = (msg: string, cfg: GraphCfg) => { let m = msg; for (const s of [cfg.token, cfg.appSecret]) if (s) m = m.split(s).join("***"); return m.slice(0, 500); };

async function call(cfg: GraphCfg, method: "GET" | "POST", path: string, body?: URLSearchParams | FormData, query: Record<string, string> = {}): Promise<any> {
  const f = cfg.fetchImpl ?? fetch;
  const q = new URLSearchParams(query);
  if (cfg.appSecret) q.set("appsecret_proof", createHmac("sha256", cfg.appSecret).update(cfg.token).digest("hex"));
  const url = `https://graph.facebook.com/${cfg.version.replace(/[^\w.]/g, "")}/${path.replace(/^\//, "")}${q.toString() ? "?" + q.toString() : ""}`;
  let res: Response;
  try { res = await f(url, { method, headers: { Authorization: `Bearer ${cfg.token}` }, body, signal: AbortSignal.timeout(cfg.timeoutMs) }); }
  catch (e) { throw new GraphError(clean(e instanceof Error ? e.message : "network error", cfg)); }
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) { const er = data?.error ?? {}; throw new GraphError(clean(String(er.error_user_msg ?? er.message ?? `Meta answered ${res.status}`), cfg), er.code, er.error_subcode, res.status); }
  return data;
}

/** Facebook Page photo post: the file is uploaded directly (no public address needed). */
export async function postFacebookPhoto(cfg: GraphCfg, pageId: string, file: string, caption: string, alt: string, beforePublish?: BeforePublish): Promise<{ id: string; url: string }> {
  const fd = new FormData();
  fd.set("source", new Blob([readFileSync(file)], { type: "image/jpeg" }), "lesson.jpg");
  fd.set("message", caption); fd.set("published", "true"); if (alt) fd.set("alt_text_custom", alt.slice(0, 400));
  await beforePublish?.();
  const d = await call(cfg, "POST", `${pageId}/photos`, fd);
  const id = String(d.post_id ?? d.id ?? "");
  if (!id) throw new GraphError("Facebook did not return a post ID.");
  return { id, url: `https://www.facebook.com/${id}` };
}

/** A Facebook Page reel uses an authenticated binary upload, followed by a publish request. */
export async function postFacebookReel(cfg: GraphCfg, pageId: string, file: string, title: string, caption: string, beforePublish: BeforePublish) {
  const endpoint = `${pageId}/video_reels`;
  const start = await call(cfg, "POST", endpoint, new URLSearchParams({ upload_phase: "start" }));
  const id = String(start.video_id ?? "");
  if (!/^\d+$/.test(id)) throw new GraphError("Facebook did not return a video ID.");
  const upload = new URL(String(start.upload_url ?? ""), "https://rupload.facebook.com");
  if (upload.origin !== "https://rupload.facebook.com" || !upload.pathname.startsWith("/video-upload/") || upload.username || upload.password) {
    throw new GraphError("Facebook returned an unexpected reel upload address.");
  }
  const video = readFileSync(file);
  const fetcher = cfg.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetcher(upload.href, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(cfg.timeoutMs),
      headers: { Authorization: `OAuth ${cfg.token}`, "Content-Type": "application/octet-stream", offset: "0", file_size: String(video.length) },
      body: new Uint8Array(video),
    });
  } catch (err) {
    throw new GraphError(clean(err instanceof Error ? err.message : "Facebook reel upload failed.", cfg));
  }
  const uploaded = await response.json().catch(() => ({}));
  if (!response.ok || uploaded.success !== true) throw new GraphError("Facebook did not accept the video upload.", undefined, undefined, response.status);
  await beforePublish(id);
  const result = await call(cfg, "POST", endpoint, new URLSearchParams({
    upload_phase: "finish", video_state: "PUBLISHED", video_id: id, title, description: caption,
  }));
  if (result.success !== true) throw new GraphError("Facebook did not confirm that it accepted the reel.");
  return { id, url: `https://www.facebook.com/reel/${id}` };
}

/** Instagram: create a container from a public address, wait until Meta has processed it, then publish it. */
export async function postInstagram(cfg: GraphCfg, igUserId: string, o: { videoUrl?: string; imageUrl?: string; caption: string; alt?: string; pollSeconds: number; sleep?: (ms: number) => Promise<void>; beforePublish?: BeforePublish }): Promise<{ id: string; url: string }> {
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const p = new URLSearchParams({ caption: o.caption });
  if (o.videoUrl) { p.set("media_type", "REELS"); p.set("video_url", o.videoUrl); p.set("share_to_feed", "true"); }
  else if (o.imageUrl) { p.set("image_url", o.imageUrl); if (o.alt) p.set("alt_text", o.alt.slice(0, 1000)); }
  else throw new GraphError("nothing to post");
  const c = await call(cfg, "POST", `${igUserId}/media`, p);
  if (!c.id) throw new GraphError("Instagram did not return a media container ID.");
  const deadline = Date.now() + o.pollSeconds * 1000;
  for (;;) {
    const st = await call(cfg, "GET", String(c.id), undefined, { fields: "status_code,status" });
    if (st.status_code === "FINISHED") break;
    if (st.status_code === "ERROR" || st.status_code === "EXPIRED") throw new GraphError(clean(`Instagram could not process the media (${st.status ?? st.status_code})`, cfg));
    if (Date.now() > deadline) throw new GraphError("Instagram took too long to process the media");
    await sleep(5000);
  }
  await o.beforePublish?.(String(c.id));
  const pub = await call(cfg, "POST", `${igUserId}/media_publish`, new URLSearchParams({ creation_id: String(c.id) }));
  if (!pub.id) throw new GraphError("Instagram did not return a published media ID.");
  let url = "https://www.instagram.com/"; try { const m = await call(cfg, "GET", String(pub.id), undefined, { fields: "permalink" }); if (m.permalink) url = String(m.permalink); } catch { /* the post is live; the link is optional */ }
  return { id: String(pub.id), url };
}

export async function testFacebook(cfg: GraphCfg, pageId: string): Promise<{ name: string }> { const d = await call(cfg, "GET", pageId, undefined, { fields: "name" }); return { name: String(d.name ?? "") }; }
export async function testInstagram(cfg: GraphCfg, igUserId: string): Promise<{ username: string }> { const d = await call(cfg, "GET", igUserId, undefined, { fields: "username" }); return { username: String(d.username ?? "") }; }
