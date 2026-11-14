import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** scrypt (built into Node, free): s1$salt$hash. Slow on purpose so stolen hashes are hard to crack. */
export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  return `s1$${salt.toString("base64")}$${scryptSync(pw, salt, 32, { N: 16384 }).toString("base64")}`;
}
export function verifyPassword(pw: string, stored: string | null): boolean {
  const [v, salt, hash] = (stored ?? "").split("$");
  // Always do the work, so "no such account" and "wrong password" take the same time.
  const want = Buffer.from(hash ?? "", "base64");
  const got = scryptSync(pw, Buffer.from(salt ?? "", "base64"), 32, { N: 16384 });
  return v === "s1" && want.length === got.length && timingSafeEqual(want, got);
}
export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
