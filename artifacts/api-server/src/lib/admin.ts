import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { adminsTable, type Admin } from "@workspace/db/schema";
import { readSession, type AuthedRequest } from "./session";
import { getAppDb } from "./app-db";

// Bootstrap super-admins from env (comma/space separated Discord IDs). These are
// always admins and cannot be removed from the site — they prevent lockout and
// work even before the app DB is provisioned.
export function getEnvAdminIds(): Set<string> {
  const raw = process.env["ADMIN_DISCORD_IDS"] ?? "";
  return new Set(
    raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );
}

export function isEnvAdmin(discordId: string): boolean {
  return getEnvAdminIds().has(discordId);
}

export async function isAdmin(discordId: string): Promise<boolean> {
  if (isEnvAdmin(discordId)) return true;
  const db = getAppDb();
  if (!db) return false;
  try {
    const rows = await db
      .select({ id: adminsTable.discordId })
      .from(adminsTable)
      .where(eq(adminsTable.discordId, discordId))
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const user = readSession(req);
  if (!user) {
    res.status(401).json({ authenticated: false });
    return;
  }
  if (!(await isAdmin(user.id))) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
}

export async function listDbAdmins(): Promise<Admin[]> {
  const db = getAppDb();
  if (!db) return [];
  try {
    return await db.select().from(adminsTable).orderBy(adminsTable.createdAt);
  } catch {
    // Table not yet created (DB not initialised) — return empty list
    return [];
  }
}

export async function addAdmin(
  discordId: string,
  label: string | null,
  addedBy: string,
): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .insert(adminsTable)
    .values({ discordId, label, addedBy })
    .onConflictDoUpdate({
      target: adminsTable.discordId,
      set: { label },
    });
}

export async function removeAdmin(discordId: string): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db.delete(adminsTable).where(eq(adminsTable.discordId, discordId));
}
