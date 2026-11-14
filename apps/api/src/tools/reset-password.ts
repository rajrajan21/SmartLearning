// Usage on the server: pnpm --filter @studysmart/api account:reset-password -- parent@example.com
// For when a parent forgets their password and no e-mail service is set up (free). Prints a temporary password
// once, signs the parent out everywhere, and the parent changes nothing else. Share it only with the verified parent.
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "../modules/accounts/crypto.js";
import * as s from "../db/schema.js";

const email = process.argv.slice(2).find((a) => a.includes("@"))?.trim().toLowerCase();
if (!email) { console.error("Usage: account:reset-password -- parent@example.com"); process.exit(2); }
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is required (source /etc/studysmart.env first)."); process.exit(2); }
const { drizzle } = await import("drizzle-orm/node-postgres");
const { default: pg } = await import("pg");
const pool = new pg.Pool({ connectionString: url, max: 1 });
const db = drizzle(pool, { schema: s });
const [u] = await db.select().from(s.users).where(eq(s.users.email, email));
if (!u) { console.error(`No account with the e-mail ${email}.`); await pool.end(); process.exit(1); }
const temp = randomBytes(9).toString("base64url");
await db.update(s.users).set({ passwordHash: hashPassword(temp) }).where(eq(s.users.id, u.id));
await db.delete(s.sessions).where(eq(s.sessions.userId, u.id));
console.log(`Temporary password for ${email}: ${temp}\nThe parent is now signed out everywhere. Ask them to sign in and keep this password safe.`);
await pool.end();
