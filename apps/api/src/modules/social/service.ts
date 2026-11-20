import { randomBytes, createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { buildAlt, buildCaption, captionProblem, dueSlot, istParts, loadCandidates, pickLessons, postedIds, runTimes, type Dirs } from "./engine.js";
import { postFacebookPhoto, postInstagram, testFacebook, testInstagram, type GraphCfg } from "./graph.js";
import { ffmpegAvailable, loadBoard, renderImage, renderReel } from "./render.js";
import type { SocialStore } from "./store.js";
import type { Candidate, LedgerEntry, Platform, RunRecord, SettingsMap } from "./types.js";

export interface AudioLookup { ref(teacher: string, lang: "en" | "ta", text: string | undefined): { url: string; durationMs: number } | undefined; filePath(file: string): string | null }
export interface SocialDeps {
  store: SocialStore; dirs: Dirs;
  settings: () => Promise<SettingsMap>;
  audio?: AudioLookup;
  fetchImpl?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  ffmpeg?: string;
}
export interface Gate { id: string; label: string; open: boolean; why: string }
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const on = (v: unknown, d = false) => (typeof v === "boolean" ? v : d);
const rid = () => randomBytes(6).toString("hex");
const mediaName = (ext: string) => randomBytes(12).toString("hex") + ext; // 24 hex chars: not guessable, served at /social-media/<name>
const isPublicHttps = (u: string) => { try { const x = new URL(u); return x.protocol === "https:" && !/^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0)/.test(x.hostname) && x.hostname.includes("."); } catch { return false; } };

export interface SocialService {
  status(): Promise<Record<string, unknown>>;
  build(opts: { count?: number; live: boolean; auto?: boolean; runId?: string }): Promise<{ entries: LedgerEntry[]; note: string }>;
  run(opts: { auto?: boolean; live?: boolean }): Promise<RunRecord>;
  tick(): Promise<RunRecord | null>;
  retry(rid: string): Promise<LedgerEntry | null>;
  testConnection(): Promise<{ facebook: string; instagram: string }>;
  resetLedger(scope: "previews" | "failed" | "all"): number;
  resume(): void;
  history(limit: number, status?: string): LedgerEntry[];
  byRun(id: string): LedgerEntry[];
  cleanup(): Promise<number>;
}

export function createSocialService(d: SocialDeps): SocialService {
  const now = d.now ?? (() => Date.now());
  const sleep = d.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let busy = false;
  const siteBase = (s: SettingsMap) => str(s["social.media.publicBase"], "https://sharpstudy.in").replace(/\/$/, "");
  const cfgOf = (s: SettingsMap, token: string, appSecret?: string): GraphCfg => ({ version: str(s["social.graph.version"], "v21.0"), token, appSecret, timeoutMs: num(s["social.request.timeoutSeconds"], 60) * 1000, fetchImpl: d.fetchImpl });
  const todayPosted = (ledger: LedgerEntry[]) => { const day = istParts(now()).date; return ledger.filter((e) => e.status === "posted" && e.postedAt && istParts(Date.parse(e.postedAt)).date === day).length; };

  function gates(s: SettingsMap): Gate[] {
    const sec = d.store.secretsStatus(); const st = d.store.state();
    const g = (id: string, label: string, open: boolean, why: string): Gate => ({ id, label, open, why });
    return [
      g("enabled", "Social posting is switched on", on(s["social.enabled"]), "Switch it on at Social: switches and safety."),
      g("preview", "Preview only is unticked", !on(s["social.dryRunOnly"], true), "Untick 'Preview only' when you are happy with the previews."),
      g("approved", "Live posting is approved", on(s["social.approved"]), "Tick 'Approve live posting'."),
      g("kill", "Kill switch is off", !on(s["social.killswitch"]) && !d.store.killFile(), "The kill switch (or the KILL file) is on."),
      g("paused", "Not paused by repeated failures", !st.pausedReason, st.pausedReason ?? "Press Resume after fixing the problem."),
      g("fb", "Facebook: switched on, keys saved", on(s["social.fb.enabled"]) && sec.fbPageId && sec.fbPageToken, "Switch Facebook on and save the Page id and Page access token."),
      g("ig", "Instagram: switched on, keys saved, site public", on(s["social.ig.enabled"]) && sec.igUserId && sec.fbPageToken && isPublicHttps(siteBase(s)), "Switch Instagram on, save the Instagram id and token, and set a public https address of the site."),
    ].map((x) => ({ ...x, open: !!x.open }));
  }
  const liveAllowed = (gs: Gate[]) => ["enabled", "preview", "approved", "kill", "paused"].every((id) => gs.find((x) => x.id === id)!.open);

  /** Builds the picture / reel and caption for one lesson on one platform. Returns a ledger entry (status preview or held). */
  async function buildOne(c: Candidate, platform: Platform, s: SettingsMap, runId: string, ff: boolean): Promise<LedgerEntry> {
    const base = siteBase(s);
    const e: LedgerEntry = { rid: rid(), lessonId: c.id, platform, status: "preview", board: c.board, cls: c.cls, subject: c.subject, title: c.title, createdAt: new Date(now()).toISOString(), caption: "", alt: "", attempts: 0, run: runId };
    e.caption = buildCaption(c, s, platform, base); e.alt = buildAlt(c, s);
    const prob = captionProblem(e.caption, s, base); if (prob) { e.status = "held"; e.hold = `Caption ${prob}`; return e; }
    if (on(s["social.requireAlt"], true) && !e.alt.trim()) { e.status = "held"; e.hold = "No alt text (set the alt text template)"; return e; }
    const board = loadBoard(d.dirs.classroomDir, c.id);
    try {
      if (platform === "facebook") {
        const name = mediaName(".jpg"); writeFileSync(d.store.mediaPath(name), renderImage({ cand: c, board, settings: s, siteUrl: base })); e.image = name;
      } else {
        if (!ff) { e.status = "held"; e.hold = "ffmpeg is not installed on this computer, so reels cannot be built"; return e; }
        // the lesson's voice-over: every narration line must have a recording, otherwise the reel is silent and flagged 'needs audio'
        const lines = board ? board.steps.map((st) => ({ teacher: "malar", text: st.narration?.en ?? "" })).filter((x) => x.text) : c.narration;
        const files: string[] = []; let ms = 0;
        if (d.audio && lines.length) for (const l of lines) { const r = d.audio.ref(l.teacher, "en", l.text); const fn = r?.url.split("/").pop(); const p = fn ? d.audio.filePath(fn) : null; if (!r || !p) { files.length = 0; ms = 0; break; } files.push(p); ms += r.durationMs; }
        const name = mediaName(".mp4");
        const r = await renderReel({ cand: c, board, settings: s, siteUrl: base, out: d.store.mediaPath(name), audioFiles: files, audioMs: ms, ffmpeg: d.ffmpeg });
        if (!r.ok) { e.status = "held"; e.hold = r.error ?? "could not build the reel"; return e; }
        e.video = name; e.needsAudio = !r.hasAudio;
        if (e.needsAudio && on(s["social.reel.requireAudio"], true)) { e.status = "held"; e.hold = "Needs audio: this lesson's voice-over has not been generated yet (run Generate-Lesson-Audio.bat). The silent reel is built and waiting."; }
      }
    } catch (err) { e.status = "held"; e.hold = `Could not build the media: ${err instanceof Error ? err.message : "unknown error"}`; }
    return e;
  }

  async function publish(e: LedgerEntry, s: SettingsMap): Promise<void> {
    const sec = d.store.secrets(); const cfg = cfgOf(s, sec.fbPageToken ?? "", sec.appSecret);
    e.attempts += 1;
    if (e.platform === "facebook") {
      if (!sec.fbPageId || !sec.fbPageToken || !e.image) throw new Error("Facebook keys or picture missing");
      const r = await postFacebookPhoto(cfg, sec.fbPageId, d.store.mediaPath(e.image), e.caption, e.alt); e.remoteId = r.id; e.remoteUrl = r.url;
    } else {
      if (!sec.igUserId || !sec.fbPageToken) throw new Error("Instagram keys missing");
      const base = siteBase(s); if (!isPublicHttps(base)) throw new Error("Instagram needs a public https address of the site (Social: accounts and set-up)");
      const file = e.video ?? (on(s["social.ig.imageIfNoVideo"]) ? e.image : undefined); if (!file) throw new Error("no reel to post");
      const url = `${base}/social-media/${file}`;
      const r = await postInstagram(cfg, sec.igUserId, { videoUrl: e.video ? url : undefined, imageUrl: !e.video ? url : undefined, caption: e.caption, alt: e.alt, pollSeconds: num(s["social.ig.pollSeconds"], 180), sleep });
      e.remoteId = r.id; e.remoteUrl = r.url;
    }
    e.status = "posted"; e.postedAt = new Date(now()).toISOString(); e.error = undefined; e.hold = undefined;
  }

  const platformsFor = (s: SettingsMap, gs: Gate[], live: boolean): Platform[] => {
    const wantFb = on(s["social.fb.enabled"]) || !live, wantIg = on(s["social.ig.enabled"]) || !live;
    const out: Platform[] = []; if (wantFb) out.push("facebook"); if (wantIg) out.push("instagram");
    return out;
  };

  const svc: SocialService = {
    async status() {
      const s = await d.settings(); const gs = gates(s); const ledger = d.store.ledger(); const st = d.store.state();
      const cands = loadCandidates(d.dirs, s); const done = postedIds(ledger);
      const eligibleLeft = pickLessons({ candidates: cands, ledger, state: st, settings: s, count: 100000, platforms: [] }).picks.length;
      const times = runTimes(s); const { date } = istParts(now());
      return {
        gates: gs, liveReady: liveAllowed(gs), times, today: { date, posted: todayPosted(ledger), slotsDone: st.slotsDone.filter((x) => x.startsWith(date)) }, paused: st.pausedReason ?? null,
        lessons: { total: cands.length, withBoard: cands.filter((c) => c.hasBoard).length, posted: done.size, left: eligibleLeft },
        secrets: d.store.secretsStatus(), ffmpeg: await ffmpegAvailable(d.ffmpeg), runs: d.store.runs().slice(-8).reverse(), counts: { preview: ledger.filter((e) => e.status === "preview").length, posted: ledger.filter((e) => e.status === "posted").length, failed: ledger.filter((e) => e.status === "failed").length, held: ledger.filter((e) => e.status === "held").length },
      };
    },

    async build({ count, live, runId: givenRun }) {
      const s = await d.settings(); const ledger = d.store.ledger(); const st = d.store.state(); const gs = gates(s);
      const want = count ?? num(s["social.postsPerRun"], 5);
      const failedOften = new Set(ledger.filter((e) => e.status === "failed" && e.attempts >= 3).map((e) => e.lessonId));
      const plats = platformsFor(s, gs, live);
      const cands = loadCandidates(d.dirs, s);
      const { picks, exhausted } = pickLessons({ candidates: cands, ledger, state: st, settings: s, count: want, platforms: plats, avoid: failedOften, now: now() });
      const runId = givenRun ?? "r" + rid(); const ff = await ffmpegAvailable(d.ffmpeg); const entries: LedgerEntry[] = [];
      const alt = str(s["social.platformsPerLesson"], "all") === "alternate";
      let n = 0;
      for (const c of picks) {
        const ps = alt && plats.length > 1 ? [plats[(st.counter + n) % plats.length]!] : plats; n++;
        for (const p of ps) entries.push(await buildOne(c, p, s, runId, ff));
      }
      return { entries, note: picks.length === 0 ? "No unposted lesson is left that matches the filters." : exhausted ? `Only ${picks.length} unposted lesson(s) were left that match the filters.` : "" };
    },

    async run({ auto, live }) {
      if (busy) throw new Error("A run is already in progress.");
      busy = true; const t0 = now();
      try {
        const s = await d.settings(); const gs = gates(s);
        const go = !!live && liveAllowed(gs);
        const rec: RunRecord = { id: "r" + rid(), at: new Date(t0).toISOString(), mode: go ? "live" : "preview", planned: 0, posted: 0, failed: 0, held: 0 };
        if (!on(s["social.enabled"])) { rec.note = "Social posting is switched off."; d.store.addRun(rec); return rec; }
        let slot: string | null = null; const stt = d.store.state();
        if (auto) { slot = dueSlot(t0, s, stt.slotsDone, (x) => { const j = num(s["social.jitterMinutes"], 10); return j ? (parseInt(createHash("sha1").update(x).digest("hex").slice(0, 4), 16) % (j * 2 + 1)) - j : 0; }); if (!slot) { rec.note = "No run is due now."; return rec; } rec.slot = slot; }
        // previews replace older previews (and their media) so they never pile up
        let ledger = d.store.ledger();
        for (const e of ledger.filter((x) => x.status === "preview")) { d.store.removeMedia(e.image); d.store.removeMedia(e.video); }
        ledger = ledger.filter((x) => x.status !== "preview");
        const cap = Math.max(0, num(s["social.maxPostsPerDay"], 40) - todayPosted(ledger));
        const { entries, note } = await svc.build({ runId: rec.id, live: go, count: go ? Math.min(num(s["social.postsPerRun"], 5), Math.max(1, Math.ceil(cap / Math.max(1, platformsFor(s, gs, true).length)))) : num(s["social.queue.previewCount"], 5) });
        rec.planned = entries.length; if (note) rec.note = note;
        if (!go) { d.store.saveLedger([...ledger, ...entries]); rec.held = entries.filter((e) => e.status === "held").length; d.store.addRun(rec); if (slot) { stt.slotsDone = [...stt.slotsDone, slot].slice(-60); d.store.saveState(stt); } return rec; }
        // LIVE: publish each ready entry, one by one, with a pause between posts
        let st = d.store.state(); let posted = 0; const lessonDone = new Set<string>();
        const readyGate = (p: Platform) => gs.find((x) => x.id === (p === "facebook" ? "fb" : "ig"))!.open;
        for (const e of entries) {
          if (posted >= cap) { e.status = "held"; e.hold = "Daily post limit reached"; continue; }
          if (e.status !== "preview") continue;
          if (!readyGate(e.platform)) { e.status = "held"; e.hold = e.platform === "facebook" ? "Facebook is not switched on or its keys are missing" : "Instagram is not switched on, its keys are missing or the site address is not public https"; continue; }
          if (d.store.killFile() || (await d.settings())["social.killswitch"] === true) { e.status = "held"; e.hold = "Kill switch is on"; continue; }
          if (posted > 0) await sleep(num(s["social.minSecondsBetweenPosts"], 90) * 1000);
          try { await publish(e, s); posted++; st.consecutiveFailures = 0; lessonDone.add(e.lessonId); }
          catch (err) {
            e.status = "failed"; e.error = (err instanceof Error ? err.message : "failed").slice(0, 400); st.consecutiveFailures += 1;
            if (st.consecutiveFailures >= num(s["social.stopAfterFailures"], 3)) { st.pausedReason = `Paused after ${st.consecutiveFailures} failures in a row. Last error: ${e.error}`; }
          }
          if (st.pausedReason) break;
        }
        for (const e of entries) if (e.status === "preview") { e.status = "held"; e.hold = st.pausedReason ? "Run paused after failures" : e.hold ?? "Not posted"; }
        // rotation memory advances only for lessons that were actually posted
        const cands = loadCandidates(d.dirs, s); const byId = new Map(cands.map((c) => [c.id, c]));
        const donePicks = [...lessonDone].map((id) => byId.get(id)).filter((c): c is Candidate => !!c);
        if (donePicks.length) { const adv = pickLessons({ candidates: donePicks, ledger: [], state: st, settings: { ...s, "social.rotate.minGapPosts": 0, "social.include.boards": "all", "social.include.classes": "all", "social.include.subjects": "all", "social.exclude.subjects": "none", "social.exclude.lessons": "none", "social.image.style": "auto" }, count: donePicks.length, platforms: [] }); st = { ...adv.state, consecutiveFailures: st.consecutiveFailures, pausedReason: st.pausedReason, slotsDone: st.slotsDone }; }
        if (slot) st.slotsDone = [...st.slotsDone, slot].slice(-60);
        d.store.saveState(st); d.store.saveLedger([...ledger, ...entries]);
        rec.posted = entries.filter((e) => e.status === "posted").length; rec.failed = entries.filter((e) => e.status === "failed").length; rec.held = entries.filter((e) => e.status === "held").length;
        d.store.addRun(rec); await svc.cleanup();
        return rec;
      } finally { busy = false; }
    },

    async tick() {
      const s = await d.settings();
      if (!on(s["social.enabled"]) || !on(s["social.schedule.inServer"])) return null;
      const rec = await svc.run({ auto: true, live: true });
      return rec.note === "No run is due now." ? null : rec;
    },

    async retry(id) {
      const s = await d.settings(); const gs = gates(s); const ledger = d.store.ledger(); const e = ledger.find((x) => x.rid === id);
      if (!e || e.status === "posted") return null;
      if (!liveAllowed(gs)) throw new Error("Live posting is not allowed right now (see the gates on Social: switches and safety).");
      if (!gs.find((x) => x.id === (e.platform === "facebook" ? "fb" : "ig"))!.open) throw new Error(`${e.platform} is not ready (switch, keys or public address).`);
      const prob = captionProblem(e.caption, s, siteBase(s)); if (prob) throw new Error(`Caption ${prob}`);
      if ((e.platform === "facebook" && !e.image) || (e.platform === "instagram" && !e.video && !e.image)) { const c = loadCandidates(d.dirs, s).find((x) => x.id === e.lessonId); if (!c) throw new Error("The lesson no longer exists."); const fresh = await buildOne(c, e.platform, s, e.run ?? "retry", await ffmpegAvailable(d.ffmpeg)); Object.assign(e, { ...fresh, rid: e.rid, attempts: e.attempts }); }
      if (e.status === "held" && e.hold?.startsWith("Needs audio") ) { const c = loadCandidates(d.dirs, s).find((x) => x.id === e.lessonId); if (c) { d.store.removeMedia(e.video); const fresh = await buildOne(c, e.platform, s, e.run ?? "retry", await ffmpegAvailable(d.ffmpeg)); Object.assign(e, { ...fresh, rid: e.rid, attempts: e.attempts }); } }
      if (e.status === "held") throw new Error(e.hold ?? "This post is held back.");
      try { await publish(e, s); } catch (err) { e.status = "failed"; e.error = (err instanceof Error ? err.message : "failed").slice(0, 400); }
      d.store.saveLedger(ledger); return e;
    },

    async testConnection() {
      const s = await d.settings(); const sec = d.store.secrets(); const out = { facebook: "not set up", instagram: "not set up" };
      if (sec.fbPageId && sec.fbPageToken) { try { out.facebook = `OK: Page "${(await testFacebook(cfgOf(s, sec.fbPageToken, sec.appSecret), sec.fbPageId)).name}"`; } catch (e) { out.facebook = `Failed: ${e instanceof Error ? e.message : "error"}`; } }
      if (sec.igUserId && sec.fbPageToken) { try { out.instagram = `OK: @${(await testInstagram(cfgOf(s, sec.fbPageToken, sec.appSecret), sec.igUserId)).username}`; } catch (e) { out.instagram = `Failed: ${e instanceof Error ? e.message : "error"}`; } }
      return out;
    },

    resetLedger(scope) {
      const l = d.store.ledger(); const keep = (e: LedgerEntry) => (scope === "all" ? false : scope === "failed" ? !(e.status === "failed" || e.status === "held") : e.status !== "preview");
      for (const e of l.filter((x) => !keep(x))) { d.store.removeMedia(e.image); d.store.removeMedia(e.video); }
      d.store.saveLedger(l.filter(keep)); if (scope === "all") { const st = d.store.state(); d.store.saveState({ ...st, bucketUsed: {}, counter: 0, recent: [] }); }
      return l.length - l.filter(keep).length;
    },
    resume() { const st = d.store.state(); delete st.pausedReason; st.consecutiveFailures = 0; d.store.saveState(st); },
    byRun: (id) => d.store.ledger().filter((e) => e.run === id),
    history(limit, status) { return d.store.ledger().filter((e) => !status || e.status === status).slice(-limit).reverse(); },
    async cleanup() {
      const s = await d.settings(); const keep = num(s["social.media.keepDays"], 14) * 86400000; const l = d.store.ledger(); const used = new Set<string>(); let removed = 0;
      for (const e of l) { if (e.status === "preview" || e.status === "held" || e.status === "failed") { if (e.image) used.add(e.image); if (e.video) used.add(e.video); } else if (e.status === "posted" && e.postedAt && now() - Date.parse(e.postedAt) < keep) { if (e.image) used.add(e.image); if (e.video) used.add(e.video); } }
      for (const f of d.store.mediaFiles()) if (!used.has(f.name) && now() - f.mtimeMs > 3600000) { d.store.removeMedia(f.name); removed++; }
      const histKeep = num(s["social.history.keepDays"], 365) * 86400000; const trimmed = l.filter((e) => e.status === "posted" || now() - Date.parse(e.postedAt ?? e.createdAt) < histKeep); // posted lessons are always remembered, so a lesson is never posted twice
      if (trimmed.length !== l.length) d.store.saveLedger(trimmed);
      return removed;
    },
  };
  return svc;
}
