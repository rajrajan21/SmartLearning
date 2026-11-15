import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import { SITE } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";

export const ACCESS_COOKIE = "ss_access";
// no 0/O/1/I/L so a code read out loud or from a screenshot is not mistyped
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Upper case, no spaces or dashes: "sharp-7k3m 9qpd" and "SHARP7K3M9QPD" are the same code. */
export const normalizeCode = (raw: string): string => raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
/** SHARP7K3M9QPD -> SHARP-7K3M-9QPD */
export const formatCode = (key: string): string => {
  const p = SITE.inviteCodePrefix;
  return key.startsWith(p) && key.length > p.length + 4 ? `${p}-${key.slice(p.length, p.length + 4)}-${key.slice(p.length + 4)}` : key;
};

export function generateCode(): string {
  const pick = (n: number) => Array.from(randomBytes(n), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${SITE.inviteCodePrefix}${pick(4)}${pick(4)}`;
}

export interface InviteCodeView {
  id: string; code: string; label: string | null; maxUses: number | null; uses: number;
  expiresAt: string | null; revokedAt: string | null; createdAt: string;
  status: "active" | "revoked" | "expired" | "used_up";
}
export interface CreateCodeInput { label?: string | null; maxUses?: number | null; expiresAt?: Date | null }
export type RedeemResult = { ok: true; codeId: string } | { ok: false };

export interface AccessService {
  create(input: CreateCodeInput): Promise<InviteCodeView>;
  list(): Promise<InviteCodeView[]>;
  revoke(id: string): Promise<boolean>;
  /** checks the code and, if good, counts one use (atomically, so a "1 use" code cannot be used twice at once) */
  redeem(rawCode: string): Promise<RedeemResult>;
  /** true while the code behind a cookie still exists and is not cancelled */
  isCodeLive(codeId: string): Promise<boolean>;
  signCookie(codeId: string, maxAgeSeconds: number): string;
  /** returns the code id when the cookie is genuine, not expired and its code is not cancelled */
  verifyCookie(value: string | undefined): Promise<string | null>;
}

export function createAccessService(db: Db, secret: string, now: () => number = Date.now): AccessService {
  const view = (r: typeof s.inviteCodes.$inferSelect): InviteCodeView => {
    const t = now();
    const status = r.revokedAt ? "revoked" : r.expiresAt && r.expiresAt.getTime() <= t ? "expired" : r.maxUses !== null && r.uses >= r.maxUses ? "used_up" : "active";
    return { id: r.id, code: formatCode(r.code), label: r.label, maxUses: r.maxUses, uses: r.uses, expiresAt: r.expiresAt?.toISOString() ?? null, revokedAt: r.revokedAt?.toISOString() ?? null, createdAt: r.createdAt.toISOString(), status };
  };
  const mac = (body: string) => createHmac("sha256", secret).update(body).digest("base64url");
  // A cancelled code must lock people out quickly, but we do not want a database read on every page: remember answers for 10 seconds.
  const live = new Map<string, { ok: boolean; until: number }>();
  const forget = () => live.clear();

  const svc: AccessService = {
    async create(input) {
      for (let i = 0; i < 5; i++) {
        try {
          const [row] = await db.insert(s.inviteCodes).values({ code: generateCode(), label: input.label?.trim() || null, maxUses: input.maxUses ?? null, expiresAt: input.expiresAt ?? null }).returning();
          return view(row!);
        } catch (e) { if (i === 4) throw e; } // the (very unlikely) duplicate code: try another
      }
      throw new Error("unreachable");
    },
    async list() { return (await db.select().from(s.inviteCodes).orderBy(desc(s.inviteCodes.createdAt))).map(view); },
    async revoke(id) {
      const rows = await db.update(s.inviteCodes).set({ revokedAt: new Date(now()) }).where(and(eq(s.inviteCodes.id, id), isNull(s.inviteCodes.revokedAt))).returning({ id: s.inviteCodes.id });
      forget();
      return rows.length > 0;
    },
    async redeem(raw) {
      const key = normalizeCode(String(raw ?? "")).slice(0, 40);
      if (key.length < 6) return { ok: false };
      const at = new Date(now());
      const rows = await db.update(s.inviteCodes).set({ uses: sql`${s.inviteCodes.uses} + 1` })
        .where(and(eq(s.inviteCodes.code, key), isNull(s.inviteCodes.revokedAt), or(isNull(s.inviteCodes.expiresAt), gt(s.inviteCodes.expiresAt, at)), or(isNull(s.inviteCodes.maxUses), lt(s.inviteCodes.uses, s.inviteCodes.maxUses))))
        .returning({ id: s.inviteCodes.id });
      return rows[0] ? { ok: true, codeId: rows[0].id } : { ok: false };
    },
    async isCodeLive(codeId) {
      const c = live.get(codeId);
      if (c && c.until > now()) return c.ok;
      const [row] = await db.select({ revokedAt: s.inviteCodes.revokedAt }).from(s.inviteCodes).where(eq(s.inviteCodes.id, codeId)).limit(1);
      const ok = !!row && !row.revokedAt;
      live.set(codeId, { ok, until: now() + 10_000 });
      return ok;
    },
    signCookie(codeId, maxAgeSeconds) {
      const body = Buffer.from(JSON.stringify({ c: codeId, e: Math.floor(now() / 1000) + maxAgeSeconds })).toString("base64url");
      return `${body}.${mac(body)}`;
    },
    async verifyCookie(value) {
      if (!value) return null;
      const [body, sig] = value.split(".");
      if (!body || !sig) return null;
      const want = Buffer.from(mac(body)), got = Buffer.from(sig);
      if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
      try {
        const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { c?: unknown; e?: unknown };
        if (typeof p.c !== "string" || typeof p.e !== "number" || p.e * 1000 < now()) return null;
        return (await svc.isCodeLive(p.c)) ? p.c : null;
      } catch { return null; }
    },
  };
  return svc;
}

/** The secret that signs access cookies: ACCESS_COOKIE_SECRET if set, else derived from ADMIN_KEY, else random (cookies then reset on every restart). */
export function resolveAccessSecret(env: NodeJS.ProcessEnv, adminKey: string | null): string {
  const explicit = env.ACCESS_COOKIE_SECRET?.trim();
  if (explicit && explicit.length >= 16) return explicit;
  if (adminKey) return createHmac("sha256", adminKey).update("access-cookie-v1").digest("hex");
  return randomBytes(32).toString("hex");
}
