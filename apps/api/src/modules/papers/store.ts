import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { PaperSchema, type Paper, type PaperIndex } from "@studysmart/shared";

/** content/papers/index.json (small list) + content/papers/<id>.json.gz (one compressed paper each). Written by tools/papers. */
export interface PaperStore { list(): PaperIndex; get(id: string): Paper | null }
const ID = /^[a-z0-9][a-z0-9-]{3,100}$/;
const EMPTY: PaperIndex = { updated: "", papers: [] };

export function createPaperStore(dir: string): PaperStore {
  const indexPath = join(dir, "index.json");
  let cache: { mtimeMs: number; idx: PaperIndex } | null = null;
  const seen = new Map<string, { mtimeMs: number; paper: Paper }>();
  return {
    list() {
      if (!existsSync(indexPath)) return EMPTY;
      const m = statSync(indexPath).mtimeMs;
      if (cache && cache.mtimeMs === m) return cache.idx;
      let idx = EMPTY;
      try { const j = JSON.parse(readFileSync(indexPath, "utf8")) as PaperIndex; if (Array.isArray(j.papers)) idx = j; } catch { /* a half-written index is treated as empty until the next run */ }
      cache = { mtimeMs: m, idx };
      return idx;
    },
    get(id) {
      if (!ID.test(id)) return null;
      const f = join(dir, `${id}.json.gz`);
      if (!existsSync(f)) return null;
      const m = statSync(f).mtimeMs;
      const hit = seen.get(id);
      if (hit && hit.mtimeMs === m) return hit.paper;
      try {
        const parsed = PaperSchema.safeParse(JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")));
        if (!parsed.success) return null;
        if (seen.size > 60) seen.clear();
        seen.set(id, { mtimeMs: m, paper: parsed.data });
        return parsed.data;
      } catch { return null; }
    },
  };
}
