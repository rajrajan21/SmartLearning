import { cpSync, createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, normalize, sep } from "node:path";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * The textbook reader draws PDFs with pdf.js. Besides its code (bundled by Vite as usual) pdf.js needs a few data
 * files at run time: character maps, the standard fonts, colour profiles and the image decoders. They are copied
 * from the installed pdfjs-dist package into /assets/pdfjs/<version>/ so everything is served by this site
 * (no CDN, no outside requests), and the versioned folder can be cached for ever.
 */
function pdfjsAssets(): Plugin {
  const pkgDir = dirname(createRequire(import.meta.url).resolve("pdfjs-dist/package.json"));
  const version = (JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")) as { version: string }).version;
  const folders = ["cmaps", "standard_fonts", "wasm", "iccs"];
  const prefix = `/assets/pdfjs/${version}/`;
  let outDir = "dist";
  return {
    name: "pdfjs-assets",
    configResolved(c) { outDir = join(c.root, c.build.outDir); },
    configureServer(server) { // dev: serve the same files straight from the package
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0]!;
        if (!url.startsWith(prefix)) return next();
        const rel = normalize(decodeURIComponent(url.slice(prefix.length)));
        const file = join(pkgDir, rel);
        if (rel.startsWith("..") || !folders.includes(rel.split(sep)[0]!) || !existsSync(file) || !statSync(file).isFile()) { res.statusCode = 404; return void res.end(); }
        if (file.endsWith(".wasm")) res.setHeader("Content-Type", "application/wasm");
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      if (!existsSync(outDir)) return; // not a build (tests)
      for (const f of folders) if (existsSync(join(pkgDir, f))) cpSync(join(pkgDir, f), join(outDir, "assets", "pdfjs", version, f), { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), pdfjsAssets()],
  server: { proxy: { "/api": "http://localhost:3000", "/health": "http://localhost:3000" } },
  test: { environment: "jsdom", setupFiles: ["./src/test-setup.ts"] },
});
