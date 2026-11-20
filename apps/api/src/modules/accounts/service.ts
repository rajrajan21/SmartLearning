import { and, desc, eq, gt, inArray, lt } from "drizzle-orm";
import { emptySync, mergeSync, SyncData, type ChildReport, type Me, type PublicProfile } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";
import { hashPassword, hashToken, newToken, verifyPassword } from "./crypto.js";

export class AccountError extends Error { constructor(message: string, readonly status: 400 | 401 | 403 | 404 | 409 | 429 = 400) { super(message); } }
export interface Limits { minPassword: number; maxChildren: number; sessionDays: number; signup: boolean }
export interface ChildData { nickname: string; classLevel: number; extraClasses?: number[]; avatar: string; language: string; boardCode?: string; pin?: string; secretQuestion?: string; secretAnswer?: string }
export const CONSENT_VERSION = "2026-11";

export interface Session { userId: string; studentId: string | null; child?: boolean }
const norm = (a: string) => a.trim().toLowerCase().replace(/\s+/g, " ");
const secrets = (c: ChildData) => ({ ...(c.pin ? { pinHash: hashPassword(c.pin) } : {}), ...(c.secretQuestion && c.secretAnswer ? { secretQuestion: c.secretQuestion.trim(), secretAnswerHash: hashPassword(norm(c.secretAnswer)) } : {}) });
const classesOf = (c: ChildData) => JSON.stringify([...new Set((c.extraClasses ?? []).filter((n) => n !== c.classLevel))].sort((a, b) => a - b));
export interface AccountService {
  register(a: { email: string; password: string; child: ChildData; fatherEmail?: string; motherEmail?: string }, l: Limits): Promise<{ token: string; me: Me }>;
  /** Google or Facebook sign-in: finds or creates the parent (no children yet) */
  social(provider: "google" | "facebook", providerId: string, email: string, l: Limits): Promise<{ token: string; me: Me; created: boolean }>;
  /** a child signs in with the parent's e-mail, their own name and a PIN or secret answer */
  childLogin(a: { email: string; nickname: string; pin?: string; answer?: string }, l: Limits): Promise<{ token: string; me: Me }>;
  childQuestion(email: string, nickname: string): Promise<string | null>;
  setContacts(sess: Session, c: { fatherEmail?: string; motherEmail?: string }): Promise<Me>;
  login(email: string, password: string, l: Limits): Promise<{ token: string; me: Me }>;
  logout(token: string): Promise<void>;
  session(token: string | undefined): Promise<Session | null>;
  me(sess: Session): Promise<Me>;
  addChild(sess: Session, c: ChildData, l: Limits): Promise<Me>;
  updateChild(sess: Session, id: string, c: ChildData): Promise<Me>;
  removeChild(sess: Session, id: string, token: string): Promise<Me>;
  select(sess: Session, token: string, id: string): Promise<Me>;
  deleteAccount(sess: Session, password: string): Promise<void>;
  getSync(sess: Session): Promise<SyncData>;
  putSync(sess: Session, d: SyncData): Promise<SyncData>;
  /** progress and activity for every child of this parent; tz = minutes behind UTC like Date.getTimezoneOffset() */
  dashboard(sess: Session, tzMinutes: number): Promise<{ children: ChildReport[] }>;
  /** everything stored about this parent and their children, to download */
  exportData(sess: Session): Promise<unknown>;
}

export function createAccountService(db: Db): AccountService {
  const lockouts = new Map<string, { n: number; until: number }>();
  const profilesOf = async (userId: string): Promise<PublicProfile[]> => {
    const rows = await db.select({ p: s.studentProfiles }).from(s.guardianships).innerJoin(s.studentProfiles, eq(s.guardianships.studentId, s.studentProfiles.id)).where(eq(s.guardianships.parentId, userId));
    return rows.map(({ p }) => ({ id: p.id, nickname: p.nickname, classLevel: p.classLevel, boardCode: p.boardCode, classes: [p.classLevel, ...(JSON.parse(p.extraClasses) as number[])], avatar: p.avatar, language: p.language, hasPin: !!p.pinHash, secretQuestion: p.secretQuestion ?? null })).sort((a, b) => a.nickname.localeCompare(b.nickname));
  };
  const build = async (userId: string, studentId: string | null, child = false): Promise<Me> => {
    const [u] = await db.select().from(s.users).where(eq(s.users.id, userId));
    if (!u) throw new AccountError("Not signed in", 401);
    const profiles = await profilesOf(userId);
    const shown = child ? profiles.filter((p) => p.id === studentId) : profiles; // a child never sees the siblings
    return { user: { id: u.id, email: child ? "" : u.email, fatherEmail: child ? null : u.fatherEmail, motherEmail: child ? null : u.motherEmail, provider: u.provider }, profiles: shown, activeProfileId: studentId && shown.some((p) => p.id === studentId) ? studentId : null, childMode: child };
  };
  const startSession = async (userId: string, studentId: string | null, days: number, child = false) => {
    const token = newToken();
    await db.insert(s.sessions).values({ tokenHash: hashToken(token), userId, studentId, child, expiresAt: new Date(Date.now() + days * 86_400_000) });
    return token;
  };
  const owns = async (userId: string, studentId: string) => {
    const [g] = await db.select().from(s.guardianships).where(and(eq(s.guardianships.parentId, userId), eq(s.guardianships.studentId, studentId)));
    return !!g;
  };
  const readProgress = async (studentId: string): Promise<SyncData> => {
    const rows = await db.select().from(s.studentProgress).where(eq(s.studentProgress.studentId, studentId));
    const out = emptySync();
    for (const r of rows) {
      try {
        if (r.kind === "lesson") out.lesson[r.topicId] = JSON.parse(r.dataJson);
        else if (r.kind === "practice") out.practice[r.topicId] = JSON.parse(r.dataJson);
        else if (r.kind === "revision") out.revision[r.topicId] = JSON.parse(r.dataJson);
        else if (r.kind === "note") out.notes[r.topicId] = JSON.parse(r.dataJson);
        else if (r.kind === "mistake") out.mistakes[r.topicId] = JSON.parse(r.dataJson);
      } catch { /* skip an unreadable row */ }
    }
    return SyncData.parse(out);
  };
  const checkPassword = (pw: string, l: Limits) => { if (pw.length < l.minPassword) throw new AccountError(`Use at least ${l.minPassword} characters for the password.`); };

  return {
    async register({ email, password, child, fatherEmail, motherEmail }, l) {
      if (!l.signup) throw new AccountError("New sign-ups are closed right now.", 403);
      checkPassword(password, l);
      const [taken] = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.email, email));
      if (taken) throw new AccountError("That email already has an account. Try signing in.", 409);
      const out = await db.transaction(async (tx) => {
        const [u] = await tx.insert(s.users).values({ email, role: "parent", passwordHash: hashPassword(password), fatherEmail: fatherEmail ?? null, motherEmail: motherEmail ?? null }).returning();
        const [p] = await tx.insert(s.studentProfiles).values({ nickname: child.nickname, classLevel: child.classLevel, boardCode: child.boardCode ?? "CBSE", language: child.language, avatar: child.avatar, extraClasses: classesOf(child), ...secrets(child) }).returning();
        await tx.insert(s.guardianships).values({ parentId: u!.id, studentId: p!.id });
        await tx.insert(s.consents).values({ parentId: u!.id, studentId: p!.id, purpose: "learning_progress", textVersion: CONSENT_VERSION });
        return { userId: u!.id, studentId: p!.id };
      });
      const token = await startSession(out.userId, out.studentId, l.sessionDays);
      return { token, me: await build(out.userId, out.studentId) };
    },

    async login(email, password, l) {
      const [u] = await db.select().from(s.users).where(eq(s.users.email, email));
      const ok = verifyPassword(password, u?.passwordHash ?? null);
      if (!u || !ok) throw new AccountError("Email or password is not right.", 401);
      const profiles = await profilesOf(u.id);
      const studentId = profiles.length === 1 ? profiles[0]!.id : null; // one child: start straight away; several: ask who is learning
      const token = await startSession(u.id, studentId, l.sessionDays);
      await db.delete(s.sessions).where(and(eq(s.sessions.userId, u.id), lt(s.sessions.expiresAt, new Date()))); // tidy expired ones
      return { token, me: await build(u.id, studentId) };
    },

    async logout(token) { await db.delete(s.sessions).where(eq(s.sessions.tokenHash, hashToken(token))); },

    async session(token) {
      if (!token) return null;
      const [r] = await db.select().from(s.sessions).where(and(eq(s.sessions.tokenHash, hashToken(token)), gt(s.sessions.expiresAt, new Date())));
      return r ? { userId: r.userId, studentId: r.studentId, child: r.child } : null;
    },

    me: (sess) => build(sess.userId, sess.studentId, sess.child),

    async social(provider, providerId, email, l) {
      let [u] = await db.select().from(s.users).where(eq(s.users.email, email));
      let created = false;
      if (u && u.provider !== provider && u.passwordHash) { /* same e-mail, verified by the provider: link it */ }
      if (!u) {
        if (!l.signup) throw new AccountError("New sign-ups are closed right now.", 403);
        [u] = await db.insert(s.users).values({ email, role: "parent", passwordHash: null, provider, providerId }).returning(); created = true;
      }
      const profiles = await profilesOf(u!.id);
      const token = await startSession(u!.id, profiles.length === 1 ? profiles[0]!.id : null, l.sessionDays);
      return { token, me: await build(u!.id, profiles.length === 1 ? profiles[0]!.id : null), created };
    },

    async childLogin({ email, nickname, pin, answer }, l) {
      const fail = () => new AccountError("That did not match. Check the parent's e-mail, your name and your PIN or answer.", 401);
      const [u] = await db.select().from(s.users).where(eq(s.users.email, email));
      const kids = u ? await db.select({ p: s.studentProfiles }).from(s.guardianships).innerJoin(s.studentProfiles, eq(s.guardianships.studentId, s.studentProfiles.id)).where(eq(s.guardianships.parentId, u.id)) : [];
      const kid = kids.map((k) => k.p).find((p) => norm(p.nickname) === norm(nickname));
      const key = `${email}|${norm(nickname)}`, rec = lockouts.get(key);
      if (rec && rec.until > Date.now() && rec.n >= 5) throw new AccountError("Too many wrong tries. Please wait 15 minutes, or ask your parent.", 429);
      // always do the same hashing work whether or not the child exists
      const okPin = pin ? verifyPassword(pin, kid?.pinHash ?? null) : false;
      const okAns = answer ? verifyPassword(norm(answer), kid?.secretAnswerHash ?? null) : false;
      if (!u || !kid || !(okPin || okAns)) { lockouts.set(key, { n: rec && rec.until > Date.now() ? rec.n + 1 : 1, until: Date.now() + 15 * 60_000 }); throw fail(); }
      lockouts.delete(key);
      const token = await startSession(u.id, kid.id, l.sessionDays, true);
      return { token, me: await build(u.id, kid.id, true) };
    },

    async childQuestion(email, nickname) {
      const [u] = await db.select().from(s.users).where(eq(s.users.email, email));
      if (!u) return null;
      const kids = await db.select({ p: s.studentProfiles }).from(s.guardianships).innerJoin(s.studentProfiles, eq(s.guardianships.studentId, s.studentProfiles.id)).where(eq(s.guardianships.parentId, u.id));
      return kids.map((k) => k.p).find((p) => norm(p.nickname) === norm(nickname))?.secretQuestion ?? null;
    },

    async setContacts(sess, c) {
      await db.update(s.users).set({ fatherEmail: c.fatherEmail ?? null, motherEmail: c.motherEmail ?? null, updatedAt: new Date() }).where(eq(s.users.id, sess.userId));
      return build(sess.userId, sess.studentId);
    },

    async addChild(sess, c, l) {
      if ((await profilesOf(sess.userId)).length >= l.maxChildren) throw new AccountError(`You can add up to ${l.maxChildren} children.`, 409);
      await db.transaction(async (tx) => {
        const [p] = await tx.insert(s.studentProfiles).values({ nickname: c.nickname, classLevel: c.classLevel, boardCode: c.boardCode ?? "CBSE", language: c.language, avatar: c.avatar, extraClasses: classesOf(c), ...secrets(c) }).returning();
        await tx.insert(s.guardianships).values({ parentId: sess.userId, studentId: p!.id });
        await tx.insert(s.consents).values({ parentId: sess.userId, studentId: p!.id, purpose: "learning_progress", textVersion: CONSENT_VERSION });
      });
      return build(sess.userId, sess.studentId);
    },

    async updateChild(sess, id, c) {
      if (!(await owns(sess.userId, id))) throw new AccountError("Child not found", 404);
      await db.update(s.studentProfiles).set({ nickname: c.nickname, classLevel: c.classLevel, ...(c.boardCode ? { boardCode: c.boardCode } : {}), extraClasses: classesOf(c), avatar: c.avatar, language: c.language, ...secrets(c), updatedAt: new Date() }).where(eq(s.studentProfiles.id, id));
      return build(sess.userId, sess.studentId);
    },

    async removeChild(sess, id, token) {
      if (!(await owns(sess.userId, id))) throw new AccountError("Child not found", 404);
      await db.delete(s.studentProfiles).where(eq(s.studentProfiles.id, id)); // progress, consent and guardianship go with it
      const left = await profilesOf(sess.userId);
      const next = sess.studentId === id ? null : sess.studentId;
      await db.update(s.sessions).set({ studentId: next }).where(eq(s.sessions.tokenHash, hashToken(token)));
      return build(sess.userId, next);
    },

    async select(sess, token, id) {
      if (!(await owns(sess.userId, id))) throw new AccountError("Child not found", 404);
      await db.update(s.sessions).set({ studentId: id }).where(eq(s.sessions.tokenHash, hashToken(token)));
      return build(sess.userId, id);
    },

    async deleteAccount(sess, password) {
      const [u] = await db.select().from(s.users).where(eq(s.users.id, sess.userId));
      const ok = u && (u.passwordHash ? verifyPassword(password, u.passwordHash) : password.trim() === "DELETE");
      if (!u || !ok) throw new AccountError(u && !u.passwordHash ? "Type DELETE to confirm." : "Password is not right.", 401);
      const kids = (await profilesOf(u.id)).map((p) => p.id);
      await db.transaction(async (tx) => {
        if (kids.length) await tx.delete(s.studentProfiles).where(inArray(s.studentProfiles.id, kids));
        await tx.delete(s.users).where(eq(s.users.id, u.id)); // sessions and consents cascade
      });
    },


    async dashboard(sess, tz) {
      const profiles = await profilesOf(sess.userId);
      const day = (ms: number) => Math.floor((ms - tz * 60_000) / 86_400_000);
      const today = day(Date.now()), from = today - 59;
      const children: ChildReport[] = [];
      for (const p of profiles) {
        const progress = await readProgress(p.id);
        const rows = await db.select({ q: s.questionAttempts.questionId, ok: s.questionAttempts.correct, at: s.questionAttempts.createdAt }).from(s.questionAttempts).where(eq(s.questionAttempts.studentId, p.id)).orderBy(desc(s.questionAttempts.createdAt)).limit(5000);
        const daily: Record<string, { n: number; right: number }> = {};
        const perQ = new Map<string, { wrong: number; total: number }>();
        const active = new Set<number>();
        let attempts = 0, correct = 0;
        for (const r of rows) {
          const d = day(r.at.getTime());
          if (d < from) continue;
          const slot = (daily[d] ??= { n: 0, right: 0 }); slot.n++; if (r.ok) slot.right++;
          attempts++; if (r.ok) correct++; active.add(d);
          const q = perQ.get(r.q) ?? { wrong: 0, total: 0 }; q.total++; if (!r.ok) q.wrong++; perQ.set(r.q, q);
        }
        for (const l of Object.values(progress.lesson)) { const d = day(l.updatedAt); if (d >= from && d <= today) active.add(d); }
        const weak = [...perQ.entries()].filter(([, v]) => v.total >= 2 && v.wrong / v.total > 0.4).sort((a, b) => b[1].wrong - a[1].wrong || b[1].total - a[1].total).slice(0, 10).map(([questionId, v]) => ({ questionId, ...v }));
        children.push({ profile: p, progress, activeDays: [...active].sort((a, b) => a - b), daily, attempts, correct, weak });
      }
      return { children };
    },

    async exportData(sess) {
      const [u] = await db.select().from(s.users).where(eq(s.users.id, sess.userId));
      if (!u) throw new AccountError("Not signed in", 401);
      const profiles = await profilesOf(u.id);
      const kids = [];
      for (const p of profiles) {
        const attempts = await db.select({ questionId: s.questionAttempts.questionId, correct: s.questionAttempts.correct, hintsUsed: s.questionAttempts.hintsUsed, at: s.questionAttempts.createdAt }).from(s.questionAttempts).where(eq(s.questionAttempts.studentId, p.id));
        const consents = await db.select({ purpose: s.consents.purpose, textVersion: s.consents.textVersion, grantedAt: s.consents.grantedAt, revokedAt: s.consents.revokedAt }).from(s.consents).where(eq(s.consents.studentId, p.id));
        kids.push({ profile: p, progress: await readProgress(p.id), attempts, consents });
      }
      return { exportedAt: new Date().toISOString(), parent: { email: u.email, createdAt: u.createdAt }, children: kids };
    },

    async getSync(sess) {
      if (!sess.studentId) throw new AccountError("Choose who is learning first.", 400);
      const rows = await db.select().from(s.studentProgress).where(eq(s.studentProgress.studentId, sess.studentId));
      const out = emptySync();
      for (const r of rows) {
        try {
          if (r.kind === "lesson") out.lesson[r.topicId] = JSON.parse(r.dataJson);
          else if (r.kind === "practice") out.practice[r.topicId] = JSON.parse(r.dataJson);
          else if (r.kind === "revision") out.revision[r.topicId] = JSON.parse(r.dataJson);
        else if (r.kind === "note") out.notes[r.topicId] = JSON.parse(r.dataJson);
        else if (r.kind === "mistake") out.mistakes[r.topicId] = JSON.parse(r.dataJson);
        } catch { /* skip an unreadable row */ }
      }
      return SyncData.parse(out);
    },

    async putSync(sess, incoming) {
      if (!sess.studentId) throw new AccountError("Choose who is learning first.", 400);
      const studentId = sess.studentId;
      return db.transaction(async (tx) => {
        const rows = await tx.select().from(s.studentProgress).where(eq(s.studentProgress.studentId, studentId));
        const have = emptySync();
        for (const r of rows) { try { if (r.kind === "lesson") have.lesson[r.topicId] = JSON.parse(r.dataJson); else if (r.kind === "practice") have.practice[r.topicId] = JSON.parse(r.dataJson); else if (r.kind === "revision") have.revision[r.topicId] = JSON.parse(r.dataJson); else if (r.kind === "mistake") have.mistakes[r.topicId] = JSON.parse(r.dataJson); else if (r.kind === "note") have.notes[r.topicId] = JSON.parse(r.dataJson); } catch { /* ignore */ } }
        const merged = mergeSync(have, incoming);
        const write = async (kind: string, topicId: string, data: unknown) => {
          const json = JSON.stringify(data);
          await tx.insert(s.studentProgress).values({ studentId, kind, topicId, dataJson: json }).onConflictDoUpdate({ target: [s.studentProgress.studentId, s.studentProgress.kind, s.studentProgress.topicId], set: { dataJson: json, updatedAt: new Date() } });
        };
        for (const [id, v] of Object.entries(merged.lesson)) if (JSON.stringify(have.lesson[id]) !== JSON.stringify(v)) await write("lesson", id, v);
        for (const [id, v] of Object.entries(merged.practice)) if (JSON.stringify(have.practice[id]) !== JSON.stringify(v)) await write("practice", id, v);
        for (const [id, v] of Object.entries(merged.revision)) if (JSON.stringify(have.revision[id]) !== JSON.stringify(v)) await write("revision", id, v);
        for (const [id, v] of Object.entries(merged.notes)) if (JSON.stringify(have.notes[id]) !== JSON.stringify(v)) await write("note", id, v);
        for (const [id, v] of Object.entries(merged.mistakes)) if (JSON.stringify(have.mistakes[id]) !== JSON.stringify(v)) await write("mistake", id, v);
        return merged;
      });
    },
  };
}
