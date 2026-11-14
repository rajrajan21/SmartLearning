import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schemaNs from "./schema.js";

/** Any Drizzle Postgres database (node-postgres in production, PGlite in tests). */
export type Db = PgDatabase<PgQueryResultHKT, typeof schemaNs>;
