// Used by Start-StudySmart-Local.bat. Prints "install" / "build" only when that step is really needed, and records the result.
//   node tools/start-check.mjs install   -> exit 0 when packages are up to date (skip), 1 when `pnpm install` is needed
//   node tools/start-check.mjs build     -> exit 0 when the built website is up to date (skip), 1 when a build is needed
//   node tools/start-check.mjs mark install|build   -> remember the current state after a successful step
//   node tools/start-check.mjs wait <url> [seconds]  -> wait until the site answers (exit 0), then open nothing
// Set START_FORCE=1 to run both steps every time (the old behaviour).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const stampFile = join(root, ".data", "start-stamps.json");
const [cmd, a, b] = process.argv.slice(2);
const read = () => { try { return JSON.parse(readFileSync(stampFile, "utf8")); } catch { return {}; } };
const walk = (dir, out, skip = /^(node_modules|dist|\.turbo|\.vite)$/) => {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (skip.test(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out, skip); else { const s = statSync(p); out.push(`${p}:${s.size}:${Math.floor(s.mtimeMs)}`); }
  }
};
const hash = (lines) => createHash("sha1").update(lines.sort().join("\n")).digest("hex");
const installSig = () => {
  const l = [];
  for (const f of ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"]) { const p = join(root, f); if (existsSync(p)) { const s = statSync(p); l.push(`${f}:${s.size}:${Math.floor(s.mtimeMs)}`); } }
  for (const d of ["apps", "packages"]) for (const n of existsSync(join(root, d)) ? readdirSync(join(root, d)) : []) { const p = join(root, d, n, "package.json"); if (existsSync(p)) { const s = statSync(p); l.push(`${d}/${n}:${s.size}:${Math.floor(s.mtimeMs)}`); } }
  return hash(l) + (existsSync(join(root, "node_modules")) ? "" : "-nomodules");
};
const buildSig = () => {
  const l = [];
  walk(join(root, "apps", "web", "src"), l); walk(join(root, "apps", "web", "public"), l, /^(node_modules|dist|audio|visuals|pictures)$/);
  walk(join(root, "packages", "shared", "src"), l);
  for (const f of ["index.html", "package.json", "vite.config.ts", "tsconfig.json"]) { const p = join(root, "apps", "web", f); if (existsSync(p)) { const s = statSync(p); l.push(`${f}:${s.size}:${Math.floor(s.mtimeMs)}`); } }
  return hash(l) + (existsSync(join(root, "apps", "web", "dist", "index.html")) ? "" : "-nodist");
};
const sig = { install: installSig, build: buildSig };

if (cmd === "install" || cmd === "build") {
  const same = process.env.START_FORCE !== "1" && read()[cmd] === sig[cmd]();
  console.log(same ? `${cmd}: up to date, skipped` : `${cmd}: needed`);
  process.exit(same ? 0 : 1);
} else if (cmd === "mark" && sig[a]) {
  mkdirSync(join(root, ".data"), { recursive: true });
  writeFileSync(stampFile, JSON.stringify({ ...read(), [a]: sig[a]() }));
} else if (cmd === "wait") {
  const end = Date.now() + (Number(b) || 600) * 1000;
  for (;;) {
    try { const r = await fetch(a, { signal: AbortSignal.timeout(2000) }); if (r.ok) process.exit(0); } catch { /* not up yet */ }
    if (Date.now() > end) process.exit(1);
    await new Promise((r) => setTimeout(r, 1000));
  }
} else { console.log("usage: install | build | mark install|build | wait <url> [seconds]"); process.exit(2); }
