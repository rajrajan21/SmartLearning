import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Router } from "express";
import type { SettingValue } from "@studysmart/shared";
import { requireAdmin } from "../settings/admin-auth.js";
import type { SettingsService } from "../settings/service.js";
import { audioDir, classroomDir, gkDir, lessonsDir, questionsDir } from "../../server-paths.js";
import { collectJobs } from "./build.js";
import { audioKey, LANGS, Manifest, speechText, VoiceMap } from "./manifest.js";

export type CoverageKind = "lesson" | "question" | "classroom" | "gk" | "phrases";
export interface CoverageRow {
  kind: CoverageKind; item: string; board: string; cls: number | null; subject: string;
  total: number; /** clips with audio, one number per voice in `voices` (same order) */ have: number[];
  status: "complete" | "partial" | "none"; missing: string[];
}
export interface Coverage {
  generatedAt: string; voices: string[]; voiceLabels: Record<string, string>; checkedFiles: boolean;
  manifestClips: number; manifestMissingFiles: number; skippedNoVoice: string[];
  rows: CoverageRow[];
}

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const csv = (v: SettingValue | undefined) => String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
const names = (dir: string) => (existsSync(dir) ? new Set(readdirSync(dir).filter((x) => x.endsWith(".json"))) : new Set<string>());

/** Works out, for every lesson / question file / classroom lesson / GK lesson, which sentences have a recording for each voice. */
export function computeCoverage(opts: { voices?: string[]; checkFiles: boolean }): Coverage {
  const voiceMap = VoiceMap.parse(readJson(join(audioDir, "voices.json")));
  const manifestPath = join(audioDir, "manifest.json"), filesDir = join(audioDir, "files");
  const manifest = existsSync(manifestPath) ? Manifest.parse(readJson(manifestPath)) : { version: 1 as const, entries: {} };
  const chosen = (opts.voices?.length ? opts.voices : Object.keys(voiceMap)).filter((v) => voiceMap[v]);
  const lessonFiles = names(lessonsDir), questionFiles = names(questionsDir);
  const fileOk = new Map<string, boolean>();
  const has = (key: string) => {
    const e = manifest.entries[key]; if (!e) return false;
    if (!opts.checkFiles) return true;
    let ok = fileOk.get(e.file); if (ok === undefined) { ok = existsSync(join(filesDir, e.file)); fileOk.set(e.file, ok); }
    return ok;
  };
  const jobs = collectJobs({ lessonsDir, questionsDir, classroomDir, gkDir, audioDir }, LANGS);
  const rows = new Map<string, CoverageRow & { _seen: Set<string> }>();
  const skipped = new Set<string>();
  for (const j of jobs) {
    const first = j.where.split(" ")[0]!;
    let kind: CoverageKind, item: string;
    if (first.startsWith("classroom-")) { kind = "classroom"; item = first; }
    else if (first === "gk") { kind = "gk"; item = `gk ${j.where.split(" ")[1]}`; }
    else if (first === "phrases") { kind = "phrases"; item = `phrases ${j.where.split(" ")[1]}`; }
    else if (lessonFiles.has(first)) { kind = "lesson"; item = first; }
    else if (questionFiles.has(first)) { kind = "question"; item = first; }
    else { kind = "lesson"; item = first; }
    const id = `${kind}|${item}`;
    let row = rows.get(id);
    if (!row) {
      const clean = item.replace(/^auto-/, "");
      const m = /^(cbse|tnm|tnmatric|tnstate|ncert)-(\d{1,2})-([a-z]+)/.exec(clean), m2 = /^classroom-(\d{1,2})-([a-z]+)/.exec(item);
      const cls = m2 ? Number(m2[1]) : m ? Number(m[2]) : null, subject = m2 ? m2[2]! : m ? m[3]! : "";
      row = { kind, item, board: m?.[1] === "tnm" ? "TNMATRIC" : m?.[1]?.toUpperCase() ?? (kind === "classroom" ? "CBSE" : ""), cls, subject, total: 0, have: chosen.map(() => 0), status: "none", missing: [], _seen: new Set(), };
      rows.set(id, row);
    }
    const voiceList = j.teacher === "malar" ? chosen : [j.teacher];
    const text = speechText(j.text, j.lang);
    // one "clip" = one sentence in one language; it counts as done for a voice when that voice's recording exists
    const clipId = `${j.lang}|${j.where}`;
    if (row._seen.has(clipId)) continue; row._seen.add(clipId); row.total++;
    let anyMissing = false;
    chosen.forEach((v, i) => {
      const t = voiceList.includes(v) ? v : null;
      if (!t) { row!.have[i]!++; return; } // this clip is not meant for this voice (another teacher's line)
      const cfg = voiceMap[t]?.[j.lang];
      if (!cfg) { skipped.add(`${t} (${j.lang})`); anyMissing = true; return; }
      if (has(audioKey({ lang: j.lang, voice: cfg.voice, speed: cfg.speed, text }))) row!.have[i]!++; else anyMissing = true;
    });
    if (anyMissing && row.missing.length < 3) row.missing.push(`${j.lang}: ${j.text.slice(0, 90)}`);
  }
  const out: CoverageRow[] = [...rows.values()].map(({ _seen: _s, ...r }) => {
    const best = Math.max(...r.have, 0), worst = Math.min(...r.have, r.total);
    return { ...r, status: r.total > 0 && worst >= r.total ? "complete" : best > 0 ? "partial" : "none" };
  }).sort((a, b) => a.kind.localeCompare(b.kind) || (a.cls ?? 99) - (b.cls ?? 99) || a.item.localeCompare(b.item));
  return {
    generatedAt: new Date().toISOString(), voices: chosen, voiceLabels: Object.fromEntries(chosen.map((v) => [v, voiceMap[v]?.label ?? v])), checkedFiles: opts.checkFiles,
    manifestClips: Object.keys(manifest.entries).length, manifestMissingFiles: [...fileOk.values()].filter((x) => !x).length, skippedNoVoice: [...skipped], rows: out,
  };
}

/** Admin > Audio coverage: which lessons have recorded teacher audio and which do not. */
export function adminAudioCoverageRoutes(settings: SettingsService, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  let cache: { at: number; sig: string; data: Coverage } | null = null;
  r.get("/", async (req, res, next) => {
    try {
      const v = await settings.all();
      const voices = csv(v["audio.coverage.voices"]), checkFiles = v["audio.coverage.checkFiles"] !== false, ttl = Number(v["audio.coverage.cacheSeconds"] ?? 60) * 1000;
      const sig = `${voices.join(",")}|${checkFiles}`;
      if (!cache || req.query.refresh === "1" || cache.sig !== sig || Date.now() - cache.at > ttl) cache = { at: Date.now(), sig, data: computeCoverage({ voices, checkFiles }) };
      res.set("Cache-Control", "no-store").json(cache.data);
    } catch (e) { next(e); }
  });
  return r;
}
