import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { SettingsService } from "./service.js";
import type { LessonService } from "../lessons/service.js";

/** One-time (2026-11-18, owner request): show every board that has lessons and open every class that has lessons on any board.
 *  Runs once; afterwards the admin can narrow the classes or boards again and the choice sticks. The old single "default board" value is kept as the default board. */
export async function migrateBoards(settings: SettingsService, lessons: Pick<LessonService, "boardSummary">, markerFile: string): Promise<string[]> {
  if (existsSync(markerFile)) return [];
  try {
    const now = await settings.all();
    const summary = await lessons.boardSummary();
    const withLessons = new Set<number>();
    for (const b of summary) for (const c of b.classes) if (c.lessons > 0) withLessons.add(c.classLevel);
    if (withLessons.size === 0) return []; // lessons not loaded yet: try again next start
    const open = new Set<number>(Array.isArray(now["catalog.openClasses"]) ? (now["catalog.openClasses"] as number[]) : [3, 4, 5, 6, 7]);
    const before = open.size;
    for (const n of withLessons) open.add(n);
    const changes: Record<string, unknown> = {};
    if (open.size !== before) changes["catalog.openClasses"] = [...open].sort((a, b) => a - b);
    if (now["catalog.boards.showAll"] !== true) changes["catalog.boards.showAll"] = true;
    if (Object.keys(changes).length) await settings.update(changes, "migration:boards-v1", "migrate");
    mkdirSync(dirname(markerFile), { recursive: true });
    writeFileSync(markerFile, JSON.stringify({ done: new Date().toISOString(), changed: Object.keys(changes) }));
    return Object.keys(changes);
  } catch (e) {
    console.error("boards migration skipped:", e);
    return [];
  }
}
