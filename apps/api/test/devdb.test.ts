import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createPgliteDb } from "../src/db/dev.js";

describe("embedded dev database", () => {
  it("creates missing parent folders for its data directory (first run on a fresh checkout)", async () => {
    const dir = join(mkdtempSync(join(tmpdir(), "pg-")), "not", "yet", "there");
    await createPgliteDb(dir);
    expect(existsSync(dir)).toBe(true);
  });
});
