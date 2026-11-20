// Optional real-browser download for sites that refuse plain downloads (needs-browser). Uses the owner's installed Chrome through
// playwright-core with its own profile folder, at human speed. It never tries to pass a sign-in, CAPTCHA or challenge page: if one appears the site is skipped.
import { homedir } from "node:os";
import { join } from "node:path";
let ctx = null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function browserAvailable() { try { await import("playwright-core"); return true; } catch { return false; } }
async function context() {
  if (ctx) return ctx;
  const { chromium } = await import("playwright-core");
  const dir = join(process.env.LOCALAPPDATA ?? join(homedir(), ".local/share"), "SharpStudy", "papers-chrome-profile");
  ctx = await chromium.launchPersistentContext(dir, { channel: "chrome", headless: false, acceptDownloads: true, viewport: { width: 1280, height: 860 } });
  return ctx;
}
export async function browserGet(url, { pauseMs = 6000 } = {}) {
  try {
    const c = await context(); const page = await c.newPage();
    await sleep(pauseMs + Math.floor(Math.random() * 4000));
    try {
      const res = await page.request.get(url, { timeout: 60000 });
      const type = res.headers()["content-type"] ?? "";
      if (res.ok() && /pdf|octet/i.test(type)) return { ok: true, status: res.status(), buf: await res.body(), type };
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sleep(2500 + Math.floor(Math.random() * 2500));
      const html = await page.content();
      if (/captcha|just a moment|verify you are (a )?human/i.test(html.slice(0, 4000))) return { ok: false, status: 403, blocked: "challenge", error: "challenge page (not bypassed)" };
      return { ok: true, status: 200, buf: Buffer.from(html), type: "text/html" };
    } finally { await page.close(); }
  } catch (e) { return { ok: false, status: 0, blocked: "network", error: String(e?.message ?? e) }; }
}
export async function browserClose() { if (ctx) { await ctx.close(); ctx = null; } }
