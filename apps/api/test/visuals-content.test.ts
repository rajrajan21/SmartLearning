import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ClassroomLesson, PICTURES } from "@studysmart/shared";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const dir = join(root, "content/classroom"), pics = join(root, "apps/web/public/pictures");
const autos = existsSync(dir) ? readdirSync(dir).filter((f) => f.startsWith("auto-") && f.endsWith(".json")) : [];
const ALLOWED = /^(public domain|pd\b|pd-|cc0|cc[ -]by([ -]sa)?[ -]\d|cc[ -]by([ -]sa)?\b)/i;

describe("visuals content", () => {
  it("every generated page is a valid classroom page and every picture it names is on the list", () => {
    expect(autos.length).toBeGreaterThan(100);
    const known = new Set(PICTURES.map((p) => p.src));
    for (const f of autos) {
      const r = ClassroomLesson.safeParse(JSON.parse(readFileSync(join(dir, f), "utf8")));
      expect(r.success, `${f}: ${r.success ? "" : r.error.issues[0]?.message}`).toBe(true);
      if (!r.success) continue;
      const ids = new Set(r.data.objects.map((o) => o.id));
      for (const s of r.data.steps) for (const a of s.actions) if (a.target) expect(ids.has(a.target), `${f}: ${a.target}`).toBe(true);
      for (const o of r.data.objects) if (o.kind === "image") { expect(known.has(o.src), `${f}: picture ${o.src} is not on the curated list`).toBe(true); expect(o.alt.length).toBeGreaterThan(5); }
    }
  });

  it("every picture file has attribution (title, author, licence, source) and an allowed licence; credits point to real files", () => {
    const credits: Record<string, { title?: string; author?: string; license?: string; source?: string; bytes?: number }> = existsSync(join(pics, "credits.json")) ? JSON.parse(readFileSync(join(pics, "credits.json"), "utf8")) : {};
    const files = existsSync(pics) ? readdirSync(pics).filter((f) => f.endsWith(".webp")) : [];
    for (const f of files) expect(credits[f.replace(/\.webp$/, "")], `${f} has no entry in credits.json`).toBeTruthy();
    for (const [src, c] of Object.entries(credits)) {
      expect(files.includes(`${src}.webp`), `credit for ${src} but no file`).toBe(true);
      expect(c.title && c.author && c.license && c.source, `${src}: incomplete credit`).toBeTruthy();
      expect(ALLOWED.test(c.license!), `${src}: licence ${c.license}`).toBe(true);
      expect(c.source).toMatch(/^https?:\/\//);
    }
    for (const f of files) expect(readFileSync(join(pics, f)).length, `${f} is too big`).toBeLessThanOrEqual(400 * 1024);
  });

  it("the coverage report and the fetch list exist", () => {
    expect(existsSync(join(root, "apps/web/public/visuals/coverage.json"))).toBe(true);
    const m = JSON.parse(readFileSync(join(root, "tools/pictures/manifest.json"), "utf8"));
    expect(m.pictures.length).toBeGreaterThan(5);
    for (const p of m.pictures) expect(p.alt && p.query && p.src).toBeTruthy();
  });
});
