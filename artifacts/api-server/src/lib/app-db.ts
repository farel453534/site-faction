import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

let db: NodePgDatabase<typeof schema> | null = null;
let attempted = false;

// Lazy, tolerant app-DB client. Returns null when DATABASE_URL is not set so
// the service still boots (e.g. on a Railway deploy before a Postgres is added).
export function getAppDb(): NodePgDatabase<typeof schema> | null {
  if (attempted) return db;
  attempted = true;
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) return null;
  const pool = new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
  });
  db = drizzle(pool, { schema });

  // Non-blocking inline migrations — add columns that may be missing on older
  // deployments. Errors are logged but never crash the server.
  pool.query(
    `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS decision TEXT`,
  ).catch((err: unknown) => {
    console.error("[app-db] inline migration failed:", err);
  });

  return db;
}

export function isAppDbConfigured(): boolean {
  return !!process.env["DATABASE_URL"];
}
