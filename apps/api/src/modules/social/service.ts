import { randomBytes, createHash } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { bucketKey, buildAlt, buildCaption, captionProblem, dueSlot, istParts, loadCandidates, pickLessons, postedIds, runTimes, type Dirs } from "./engine.js";
import { GraphError, postFacebookPhoto, postFacebookReel, postInstagram, testFacebook, testInstagram, type GraphCfg } from "./graph.js";
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
  renderVideo?: typeof renderReel;
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
  build(opts: { count?: number; live: boolean; auto?: boolean; runId?: string; lessonId?: string }): Promise<{ entries: LedgerEntry[]; note: string }>;
  run(opts: { auto?: boolean; live?: boolean; lessonId?: string }): Promise<RunRecord>;
  tick(): Promise<RunRecord | null>;
  retry(rid: string): Promise<LedgerEntry | null>;
  testConnection(): Promise<{ facebook: string; instagram: string }>;
  resetLedger(scope: "previews" | "failed"): number;
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
  const cfgOf = (s: SettingsMap, token: string, appSecret?: string): GraphCfg => ({ version: str(s["social.graph.version"], "v27.0"), token, appSecret, timeoutMs: num(s["social.request.timeoutSeconds"], 60) * 1000, fetchImpl: d.fetchImpl });
  const todayPosted = (ledger: LedgerEntry[]) => {
    const today = istParts(now()).date;
    return ledger.filter((e) => {
      const stamp = e.postedAt ?? (e.deliveryPending ? (e.deliveryStartedAt ?? e.createdAt) : undefined);
      return stamp && istParts(Date.parse(stamp)).date === today;
    }).length;
  };
  const usesReel = (p: Platform, s: SettingsMap) => p === "instagram" || str(s["social.fb.format"], "reel") !== "photo";
  const isReady = (gs: Gate[], p: Platform) => gs.some((g) => g.id === (p === "facebook" ? "fb" : "ig") && g.open);
  const readyPlatforms = (gs: Gate[]) => (["facebook", "instagram"] as const).filter((p) => isReady(gs, p));

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
      g("ig", "Instagram: switched on, keys saved, site public", on(s["social.ig.enabled"]) && sec.igUserId && (sec.igToken || sec.fbPageToken) && isPublicHttps(siteBase(s)), "Switch Instagram on, save the Instagram id and token, and set a public https address of the site."),
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
    const board = c.boardFile ? loadBoard(d.dirs.classroomDir, c.boardFile) : null;
    try {
      if (!usesReel(platform, s)) {
        const name = mediaName(".jpg"); writeFileSync(d.store.mediaPath(name), renderImage({ cand: c, board, settings: s, siteUrl: base })); e.image = name;
      } else {
        if (!ff) { e.status = "held"; e.hold = "ffmpeg is not installed on this computer, so reels cannot be built"; return e; }
        const name = mediaName(".mp4");
        const r = await (d.renderVideo ?? renderReel)({
          cand: c, board, settings: s, siteUrl: base, out: d.store.mediaPath(name), ffmpeg: d.ffmpeg,
          audio: (text, teacher) => {
            for (const voice of new Set([teacher, "malar", "kani", "priya2", "ravi2"])) {
              const ref = d.audio?.ref(voice, "en", text);
              const key = ref?.url.split("/").pop();
              const file = key && d.audio?.filePath(key);
              if (ref && file && existsSync(file)) return { file, ms: ref.durationMs };
            }
            return undefined;
          },
        });
        if (!r.ok) { d.store.removeMedia(name); e.status = "held"; e.hold = r.error ?? "Could not build the reel"; return e; }
        e.video = name; e.needsAudio = !r.hasAudio;
        if (e.needsAudio && on(s["social.reel.requireAudio"])) { e.status = "held"; e.hold = "Needs audio: one or more recordings are missing or the narration exceeds the reel duration. A captioned preview is available."; }
      }
    } catch (err) { e.status = "held"; e.hold = `Could not build the media: ${err instanceof Error ? err.message : "unknown error"}`; }
    return e;
  }

  async function publish(e: LedgerEntry, s: SettingsMap, save: () => void): Promise<boolean> {
    const sec = d.store.secrets();
    const token = e.platform === "instagram" ? sec.igToken ?? sec.fbPageToken : sec.fbPageToken;
    if (!token) throw new Error("The platform token is missing.");
    const cfg = cfgOf(s, token, sec.appSecret);
    const beforePublish = async (remoteId?: string) => {
      const current = gates(await d.settings());
      if (!liveAllowed(current) || !isReady(current, e.platform)) throw new Error("Live posting was switched off during this run.");
      e.deliveryPending = true;
      e.deliveryStartedAt = new Date(now()).toISOString();
      e.remoteId = remoteId;
      e.status = "held";
      e.hold = "Meta delivery is unconfirmed. Check the platform account before taking any action.";
      save();
    };
    e.attempts++;
    try {
      if (e.platform === "facebook" && sec.fbPageId) {
        const result = e.video
          ? await postFacebookReel(cfg, sec.fbPageId, d.store.mediaPath(e.video), e.title, e.caption, beforePublish)
          : await postFacebookPhoto(cfg, sec.fbPageId, d.store.mediaPath(e.image!), e.caption, e.alt, beforePublish);
        e.remoteId = result.id;
        e.remoteUrl = result.url;
      } else if (e.platform === "instagram" && sec.igUserId && e.video) {
        const base = siteBase(s);
        if (!isPublicHttps(base)) throw new Error("Instagram needs a public HTTPS media address.");
        const result = await postInstagram(cfg, sec.igUserId, { videoUrl: `${base}/social-media/${e.video}`, caption: e.caption, pollSeconds: num(s["social.ig.pollSeconds"], 180), sleep, beforePublish });
        e.remoteId = result.id;
        e.remoteUrl = result.url;
      } else throw new Error("The platform account or media is missing.");
      e.status = "posted";
      e.postedAt = new Date(now()).toISOString();
      e.deliveryPending = undefined;
      e.hold = undefined;
      e.error = undefined;
    } catch (err) {
      // A Graph rejection is definite. Timeouts, outages and process restarts cannot prove nothing was published.
      if (err instanceof GraphError && err.code && err.status && err.status >= 400 && err.status < 500) {
        e.deliveryPending = undefined;
      }
      if (!e.deliveryPending) {
        e.status = "failed";
        e.hold = undefined;
      }
      e.error = (err instanceof Error ? err.message : "Publishing failed.").slice(0, 400);
    }
    save();
    return e.status === "posted";
  }

  function recordRotation(st: ReturnType<SocialStore["state"]>, e: LedgerEntry) {
    st.counter++;
    st.bucketUsed[bucketKey(e)] = st.counter;
    st.recent = [...st.recent, { cls: e.cls, subject: e.subject, board: e.board }].slice(-80);
  }

  const svc: SocialService = {
    async status() {
      const s = await d.settings(); const gs = gates(s); const ledger = d.store.ledger(); const st = d.store.state();
      const cands = loadCandidates(d.dirs, s); const done = postedIds(ledger);
      const eligibleLeft = pickLessons({ candidates: cands, ledger, state: st, settings: s, count: 100000, platforms: [] }).picks.length;
      const times = runTimes(s); const { date } = istParts(now());
      return {
        gates: gs, liveReady: liveAllowed(gs) && readyPlatforms(gs).length > 0, times, today: { date, posted: todayPosted(ledger), slotsDone: st.slotsDone.filter((x) => x.startsWith(date)) }, paused: st.pausedReason ?? null,
        lessons: { total: cands.length, withBoard: cands.filter((c) => c.hasBoard).length, posted: done.size, left: eligibleLeft },
        secrets: d.store.secretsStatus(), ffmpeg: await ffmpegAvailable(d.ffmpeg), runs: d.store.runs().slice(-8).reverse(), counts: { preview: ledger.filter((e) => e.status === "preview").length, posted: ledger.filter((e) => e.status === "posted").length, failed: ledger.filter((e) => e.status === "failed").length, held: ledger.filter((e) => e.status === "held").length },
      };
    },

    async build({ count, live, runId: givenRun, lessonId }) {
      const s = await d.settings();
      const ledger = d.store.ledger();
      const st = d.store.state();
      const gs = gates(s);
      const ready = readyPlatforms(gs);
      const plats: readonly Platform[] = live ? ready : (["facebook", "instagram"] as const).filter((p) => on(s[p === "facebook" ? "social.fb.enabled" : "social.ig.enabled"]));
      const channels: readonly Platform[] = plats.length || live ? plats : ["facebook", "instagram"];
      if (!channels.length) return { entries: [], note: "Connect and enable at least one platform to post." };
      const failures = new Map<string, number>();
      for (const e of ledger) if (e.status === "failed") failures.set(e.lessonId, (failures.get(e.lessonId) ?? 0) + e.attempts);
      const avoid = new Set([...failures].filter(([, n]) => n >= 3).map(([id]) => id));
      const candidates = loadCandidates(d.dirs, s).filter((c) => !lessonId || c.id === lessonId);
      const want = lessonId ? 1 : count ?? num(s["social.postsPerRun"], 5);
      const { picks, exhausted } = pickLessons({ candidates, ledger, state: st, settings: s, count: want, platforms: [...channels], avoid });
      if (!picks.length) return { entries: [], note: "No eligible unposted lesson matches the selection." };
      const runId = givenRun ?? "r" + rid();
      const ff = channels.some((p) => usesReel(p, s)) && (!!d.renderVideo || await ffmpegAvailable(d.ffmpeg));
      const latest = [...ledger].reverse().find((entry) => entry.status === "posted" || entry.deliveryPending);
      const offset = latest?.platform === channels[0] && channels.length > 1 ? 1 : 0;
      const entries: LedgerEntry[] = [];
      for (const [i, c] of picks.entries()) entries.push(await buildOne(c, channels[(offset + i) % channels.length]!, s, runId, ff));
      return { entries, note: exhausted ? `Only ${picks.length} eligible unposted lessons matched the selection.` : "" };
    },

    async run({ auto, live, lessonId }) {
      if (busy) throw new Error("A run is already in progress.");
      busy = true;
      const t0 = now();
      try {
        const s = await d.settings();
        const gs = gates(s);
        const enabled = on(s["social.enabled"]);
        const go = !!live && liveAllowed(gs) && readyPlatforms(gs).length > 0;
        const rec: RunRecord = { id: "r" + rid(), at: new Date(t0).toISOString(), mode: go ? "live" : "preview", planned: 0, posted: 0, failed: 0, held: 0 };
        if ((auto || live) && !enabled) { rec.note = "Social posting is switched off."; return rec; }
        if (live && !go && (auto || liveAllowed(gs))) { rec.note = "Live posting is not ready."; return rec; }
        const st = d.store.state();
        if (auto) {
          const slot = dueSlot(t0, s, st.slotsDone, (x) => {
            const jitter = num(s["social.jitterMinutes"], 10);
            return jitter ? (parseInt(createHash("sha1").update(x).digest("hex").slice(0, 4), 16) % (jitter * 2 + 1)) - jitter : 0;
          });
          if (!slot) { rec.note = "No run is due now."; return rec; }
          rec.slot = slot;
          st.slotsDone = [...st.slotsDone, slot].slice(-60);
          d.store.saveState(st);
        }
        const prior = d.store.ledger();
        const ledger = prior.filter((e) => e.status !== "preview" || e.deliveryPending);
        const cap = Math.max(0, num(s["social.maxPostsPerDay"], 20) - todayPosted(ledger));
        if (go && !cap) { rec.note = "Daily post limit reached."; d.store.addRun(rec); return rec; }
        const { entries, note } = await svc.build({
          runId: rec.id, live: go, lessonId: go ? undefined : lessonId,
          count: go ? Math.min(num(s["social.postsPerRun"], 5), cap) : num(s["social.queue.previewCount"], 5),
        });
        const save = () => d.store.saveLedger([...ledger, ...entries]);
        save();
        for (const e of prior.filter((e) => e.status === "preview" && !e.deliveryPending)) {
          d.store.removeMedia(e.image);
          d.store.removeMedia(e.video);
        }
        rec.planned = entries.length;
        if (note) rec.note = note;
        if (go) {
          let attempted = false;
          for (const e of entries) {
            if (e.status !== "preview") continue;
            if (attempted) await sleep(num(s["social.minSecondsBetweenPosts"], 90) * 1000);
            const current = gates(await d.settings());
            if (!liveAllowed(current) || !isReady(current, e.platform)) {
              e.status = "held";
              e.hold = "Live posting or this platform was switched off.";
              continue;
            }
            attempted = true;
            if (await publish(e, s, save)) {
              st.consecutiveFailures = 0;
              recordRotation(st, e);
            } else {
              st.consecutiveFailures++;
              if (st.consecutiveFailures >= num(s["social.stopAfterFailures"], 3)) st.pausedReason = `Paused after ${st.consecutiveFailures} failures in a row. Last error: ${e.error ?? e.hold}`;
            }
            d.store.saveState(st);
            if (st.pausedReason) break;
          }
          for (const e of entries) if (e.status === "preview") {
            e.status = "held";
            e.hold = "Run paused before this post was sent.";
          }
          save();
        }
        rec.posted = entries.filter((e) => e.status === "posted").length;
        rec.failed = entries.filter((e) => e.status === "failed").length;
        rec.held = entries.filter((e) => e.status === "held").length;
        d.store.addRun(rec);
        await svc.cleanup();
        return rec;
      } finally { busy = false; }
    },

    async tick() {
      const s = await d.settings();
      if (busy || !on(s["social.enabled"]) || !on(s["social.schedule.inServer"])) return null;
      const rec = await svc.run({ auto: true, live: true });
      return rec.slot ? rec : null;
    },

    async retry(id) {
      if (busy) throw new Error("A run is already in progress.");
      busy = true;
      try {
        const s = await d.settings();
        const gs = gates(s);
        const ledger = d.store.ledger();
        const e = ledger.find((x) => x.rid === id);
        if (!e || e.status === "posted") return null;
        if (ledger.some((x) => x.lessonId === e.lessonId && (x.status === "posted" || x.deliveryPending))) {
          throw new Error("This lesson already posted or has an unconfirmed delivery. Check it in the platform account.");
        }
        if (!liveAllowed(gs) || !isReady(gs, e.platform)) throw new Error("Live posting is not ready for this platform.");
        if (todayPosted(ledger) >= num(s["social.maxPostsPerDay"], 20)) throw new Error("Daily post limit reached.");
        const c = loadCandidates(d.dirs, s).find((x) => x.id === e.lessonId);
        if (!c) throw new Error("The lesson no longer exists or is unpublished.");
        const file = usesReel(e.platform, s) ? e.video : e.image;
        if (e.status === "held" || !file || !existsSync(d.store.mediaPath(file))) {
          const fresh = await buildOne(c, e.platform, s, e.run ?? "retry", !!d.renderVideo || await ffmpegAvailable(d.ffmpeg));
          d.store.removeMedia(e.image);
          d.store.removeMedia(e.video);
          Object.assign(e, fresh, { rid: e.rid, attempts: e.attempts, video: fresh.video, image: fresh.image });
        }
        const save = () => d.store.saveLedger(ledger);
        const prob = captionProblem(e.caption, s, siteBase(s));
        if (prob) throw new Error(`Caption ${prob}`);
        if (e.status === "held") { save(); throw new Error(e.hold ?? "This post is held back."); }
        if (await publish(e, s, save)) {
          const st = d.store.state();
          recordRotation(st, e);
          d.store.saveState(st);
        }
        return e;
      } finally { busy = false; }
    },

    async testConnection() {
      const s = await d.settings(); const sec = d.store.secrets(); const out = { facebook: "not set up", instagram: "not set up" };
      if (sec.fbPageId && sec.fbPageToken) { try { out.facebook = `OK: Page "${(await testFacebook(cfgOf(s, sec.fbPageToken, sec.appSecret), sec.fbPageId)).name}"`; } catch (e) { out.facebook = `Failed: ${e instanceof Error ? e.message : "error"}`; } }
      const igToken = sec.igToken ?? sec.fbPageToken;
      if (sec.igUserId && igToken) { try { out.instagram = `OK: @${(await testInstagram(cfgOf(s, igToken, sec.appSecret), sec.igUserId)).username}`; } catch (e) { out.instagram = `Failed: ${e instanceof Error ? e.message : "error"}`; } }
      return out;
    },

    resetLedger(scope) {
      if (busy) throw new Error("A run is already in progress.");
      const ledger = d.store.ledger();
      const keep = (e: LedgerEntry) => e.deliveryPending || e.status === "posted" ||
        (scope === "previews" ? e.status !== "preview" : e.status !== "failed" && e.status !== "held");
      const kept = ledger.filter(keep);
      d.store.saveLedger(kept);
      for (const e of ledger.filter((e) => !keep(e))) { d.store.removeMedia(e.image); d.store.removeMedia(e.video); }
      return ledger.length - kept.length;
    },
    resume() { const st = d.store.state(); delete st.pausedReason; st.consecutiveFailures = 0; d.store.saveState(st); },
    byRun: (id) => d.store.ledger().filter((e) => e.run === id),
    history(limit, status) { return d.store.ledger().filter((e) => !status || e.status === status).slice(-limit).reverse(); },
    async cleanup() {
      const s = await d.settings(); const keep = num(s["social.media.keepDays"], 14) * 86400000; const l = d.store.ledger(); const used = new Set<string>(); let removed = 0;
      for (const e of l) { if (now() - Date.parse(e.postedAt ?? e.createdAt) < keep) { if (e.image) used.add(e.image); if (e.video) used.add(e.video); } }
      for (const f of d.store.mediaFiles()) if (!used.has(f.name) && now() - f.mtimeMs > 3600000) { d.store.removeMedia(f.name); removed++; }
      const histKeep = num(s["social.history.keepDays"], 365) * 86400000; const trimmed = l.filter((e) => e.status === "posted" || e.deliveryPending || now() - Date.parse(e.postedAt ?? e.createdAt) < histKeep); // posted lessons are always remembered, so a lesson is never posted twice
      if (trimmed.length !== l.length) d.store.saveLedger(trimmed);
      return removed;
    },
  };
  return svc;
}
