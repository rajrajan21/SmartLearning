import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const LIBRARY_MAX_BYTES = 10_000_000_000;

export function libraryCap(values: Record<string, unknown>): number {
  const requested = Number(values[values["library.storage.useServerCap"] === true ? "library.storage.serverMaxGB" : "library.storage.maxGB"]);
  return Number.isFinite(requested) && requested > 0 ? Math.min(LIBRARY_MAX_BYTES, requested * 1_000_000_000) : LIBRARY_MAX_BYTES;
}

export function libraryBytes(dir: string): number {
  let total = 0;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) total += libraryBytes(path);
      else if (entry.isFile()) {
        try { total += statSync(path).size; } catch { /* removed during accounting */ }
      }
    }
  } catch { /* no files yet */ }
  return total;
}
