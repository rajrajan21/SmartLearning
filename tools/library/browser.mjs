// Real-Chrome mode, used only when a site refuses plain downloads (HTTP 403) and the owner switched it on in Admin.
// Needs once:  npm install playwright-core   (in this folder or the project) and Google Chrome installed. Never touches sign-ins or CAPTCHAs.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { HERE, TooBig, jitter, sleep } from "./lib.mjs";

export async function openBrowser(log = console.log) {
  let pw;
  try { pw = await import("playwright-core"); } catch { throw new Error("playwright-core is not installed (run Install-Library-Browser-Mode.bat once)"); }
  const ctx = await pw.chromium.launchPersistentContext(join(HERE, "state", "chrome-profile"), { channel: "chrome", headless: false, viewport: { width: 1100, height: 800 } });
  log("Real browser opened (normal Chrome window, human pace).");
  return {
    async downloadFile(url, dest, { maxBytes } = {}) {
      await sleep(jitter(4000)); // a person does not click instantly
      const res = await ctx.request.get(url, { timeout: 120000 });
      if (!res.ok()) throw new Error(`browser HTTP ${res.status()}`);
      const body = await res.body();
      if (maxBytes && body.length > maxBytes) throw new TooBig(body.length);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, body);
    },
    async close() { await ctx.close(); },
  };
}
