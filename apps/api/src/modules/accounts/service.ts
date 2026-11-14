import { and, eq, gt, inArray, lt } from "drizzle-orm";
import { emptySync, mergeSync, SyncData, type Me, type PublicProfile } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";
import { hashPassword, hashToken, newToken, verifyPassword } from "./crypto.js";

export class AccountError extends Error { constructor(message: string, readonly status: 400 | 401 | 403 | 404 | 409 = 400) { super(message); } }
export interface Limits { minPassword: number; maxChildren: number; sessionDays: number; signup: boolean }
export interface ChildData { nickname: string; classLevel: number; avatar: string; language: string }
export const CONSENT_VERSION = "2026-11";

export interface Session { userId: string; studentId: string | null }
export interface AccountService {
  register(a: { email: string; password: string; child: ChildData }, l: Limits): Promise<{ token: string; me: Me }>;
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
}

export function createAccountService(db: Db): AccountService {
  const profilesOf = async (userId: string): Promise<PublicProfile[]> => {
    const rows = await db.select({ p: s.studentProfiles }).from(s.guardianships).innerJoin(s.studentProfiles, eq(s.guardianships.studentId, s.studentProfiles.id)).where(eq(s.guardianships.parentId, userId));
    return rows.map(({ p }) => ({ id: p.id, nickname: p.nickname, classLevel: p.classLevel, avatar: p.avatar, language: p.language })).sort((a, b) => a.nickname.localeCompare(b.nickname));
  };
  const build = async (userId: string, studentId: string | null): Promise<Me> => {
    const [u] = await db.select().from(s.users).where(eq(s.users.id, userId));
    if (!u) throw new AccountError("Not signed in", 401);
    const profiles = await profilesOf(userId);
    return { user: { id: u.id, email: u.email }, profiles, activeProfileId: studentId && profiles.some((p) => p.id === studentId) ? studentId : null };
  };
  const startSession = async (userId: string, studentId: string | null, days: number) => {
    const token = newToken();
    await db.insert(s.sessions).values({ tokenHash: hashToken(token), userId, studentId, expiresAt: new Date(Date.now() + days * 86_400_000) });
    return token;
  };
  const owns = async (userId: string, studentId: string) => {
    const [g] = await db.select().from(s.guardianships).where(and(eq(s.guardianships.parentId, userId), eq(s.guardianships.studentId, studentId)));
    return !!g;
  };
  const checkPassword = (pw: string, l: Limits) => { if (pw.length < l.minPassword) throw new AccountError(`Use at least ${l.minPassword} characters for the password.`); };

  return {
    async register({ email, password, child }, l) {
      if (!l.signup) throw new AccountError("New sign-ups are closed right now.", 403);
      checkPassword(password, l);
      const [taken] = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.email, email));
      if (taken) throw new AccountError("That email already has an account. Try signing in.", 409);
      const out = await db.transaction(async (tx) => {
        const [u] = await tx.insert(s.users).values({ email, role: "parent", passwordHash: hashPassword(password) }).returning();
        const [p] = await tx.insert(s.studentProfiles).values({ nickname: child.nickname, classLevel: child.classLevel, boardCode: "CBSE", language: child.language, avatar: child.avatar }).returning();
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
      return r ? { userId: r.userId, studentId: r.studentId } : null;
    },

    me: (sess) => build(sess.userId, sess.studentId),

    async addChild(sess, c, l) {
      if ((await profilesOf(sess.userId)).length >= l.maxChildren) throw new AccountError(`You can add up to ${l.maxChildren} children.`, 409);
      await db.transaction(async (tx) => {
        const [p] = await tx.insert(s.studentProfiles).values({ nickname: c.nickname, classLevel: c.classLevel, boardCode: "CBSE", language: c.language, avatar: c.avatar }).returning();
        await tx.insert(s.guardianships).values({ parentId: sess.userId, studentId: p!.id });
        await tx.insert(s.consents).values({ parentId: sess.userId, studentId: p!.id, purpose: "learning_progress", textVersion: CONSENT_VERSION });
      });
      return build(sess.userId, sess.studentId);
    },

    async updateChild(sess, id, c) {
      if (!(await owns(sess.userId, id))) throw new AccountError("Child not found", 404);
      await db.update(s.studentProfiles).set({ nickname: c.nickname, classLevel: c.classLevel, avatar: c.avatar, language: c.language, updatedAt: new Date() }).where(eq(s.studentProfiles.id, id));
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
      if (!u || !verifyPassword(password, u.passwordHash)) throw new AccountError("Password is not right.", 401);
      const kids = (await profilesOf(u.id)).map((p) => p.id);
      await db.transaction(async (tx) => {
        if (kids.length) await tx.delete(s.studentProfiles).where(inArray(s.studentProfiles.id, kids));
        await tx.delete(s.users).where(eq(s.users.id, u.id)); // sessions and consents cascade
      });
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
        for (const r of rows) { try { if (r.kind === "lesson") have.lesson[r.topicId] = JSON.parse(r.dataJson); else if (r.kind === "practice") have.practice[r.topicId] = JSON.parse(r.dataJson); else if (r.kind === "revision") have.revision[r.topicId] = JSON.parse(r.dataJson); } catch { /* ignore */ } }
        const merged = mergeSync(have, incoming);
        const write = async (kind: string, topicId: string, data: unknown) => {
          const json = JSON.stringify(data);
          await tx.insert(s.studentProgress).values({ studentId, kind, topicId, dataJson: json }).onConflictDoUpdate({ target: [s.studentProgress.studentId, s.studentProgress.kind, s.studentProgress.topicId], set: { dataJson: json, updatedAt: new Date() } });
        };
        for (const [id, v] of Object.entries(merged.lesson)) if (JSON.stringify(have.lesson[id]) !== JSON.stringify(v)) await write("lesson", id, v);
        for (const [id, v] of Object.entries(merged.practice)) if (JSON.stringify(have.practice[id]) !== JSON.stringify(v)) await write("practice", id, v);
        for (const [id, v] of Object.entries(merged.revision)) if (JSON.stringify(have.revision[id]) !== JSON.stringify(v)) await write("revision", id, v);
        return merged;
      });
    },
  };
}
