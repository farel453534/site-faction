import { eq, desc, inArray, sql } from "drizzle-orm";
import { userProfilesTable, type UserProfile } from "@workspace/db/schema";
import { getAppDb } from "./app-db";
import type { SessionUser } from "./session";

function pgErrorCode(err: unknown): string | undefined {
  const anyErr = err as Record<string, unknown>;
  const cause = (anyErr["cause"] ?? {}) as Record<string, unknown>;
  return cause["code"] as string | undefined;
}

/** PostgreSQL 42P01 — relation/table does not exist. */
function isMissingTableError(err: unknown): boolean {
  return (
    pgErrorCode(err) === "42P01" ||
    String((err as Record<string, unknown>)["message"] ?? "").includes('relation "') && 
    String((err as Record<string, unknown>)["message"] ?? "").includes("does not exist")
  );
}

/** PostgreSQL 42703 — column does not exist (pending migration). */
function isMissingColumnError(err: unknown): boolean {
  return pgErrorCode(err) === "42703";
}

/**
 * Upsert a user profile row on every successful Discord login.
 * Silently swallows errors so a DB issue never breaks auth.
 * @param lastIp - IP address of the user at login time (stored for responsable visibility only).
 */
export async function upsertUserProfile(user: SessionUser, lastIp?: string | null): Promise<void> {
  const db = getAppDb();
  if (!db) return;
  try {
    await db
      .insert(userProfilesTable)
      .values({
        discordId:  user.id,
        username:   user.username,
        globalName: user.global_name ?? null,
        avatar:     user.avatar ?? null,
        faction:    user.faction ?? null,
        lastIp:     lastIp ?? null,
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfilesTable.discordId,
        set: {
          username:   user.username,
          globalName: user.global_name ?? null,
          avatar:     user.avatar ?? null,
          faction:    user.faction ?? null,
          lastIp:     lastIp ?? null,
          lastSeenAt: new Date(),
        },
      });
  } catch {
    // non-blocking — DB unavailability never breaks login
  }
}

/** Update the steamId for a user. Upserts the profile row if it doesn't exist yet. */
export async function updateSteamId(
  discordId: string,
  steamId: string | null,
  sessionUser?: { username: string; global_name: string | null; avatar: string | null; faction: string | null },
): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  // If we have session data, upsert so the row always exists.
  if (sessionUser) {
    await db
      .insert(userProfilesTable)
      .values({
        discordId,
        username:   sessionUser.username,
        globalName: sessionUser.global_name ?? null,
        avatar:     sessionUser.avatar ?? null,
        faction:    sessionUser.faction ?? null,
        steamId,
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfilesTable.discordId,
        set: { steamId, lastSeenAt: new Date() },
      });
  } else {
    // Fallback: update-only (row must already exist from login upsert).
    await db
      .update(userProfilesTable)
      .set({ steamId })
      .where(eq(userProfilesTable.discordId, discordId));
  }
}

/** Return the profile row for a single user (or null). */
export async function getUserProfile(discordId: string): Promise<UserProfile | null> {
  const db = getAppDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.discordId, discordId))
    .limit(1);
  return rows[0] ?? null;
}

/** Return all panel users, most recently seen first. */
export async function listPanelUsers(): Promise<UserProfile[]> {
  const db = getAppDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(userProfilesTable)
      .orderBy(desc(userProfilesTable.lastSeenAt));
  } catch (err) {
    // Table doesn't exist yet (DB never initialised) → return empty list
    if (isMissingTableError(err)) return [];
    // last_ip column doesn't exist yet (migration pending) → retry without it
    if (!isMissingColumnError(err)) throw err;
    return db
      .select({
        discordId:   userProfilesTable.discordId,
        username:    userProfilesTable.username,
        globalName:  userProfilesTable.globalName,
        avatar:      userProfilesTable.avatar,
        faction:     userProfilesTable.faction,
        steamId:     userProfilesTable.steamId,
        lastIp:      sql<string | null>`NULL`,
        firstSeenAt: userProfilesTable.firstSeenAt,
        lastSeenAt:  userProfilesTable.lastSeenAt,
      })
      .from(userProfilesTable)
      .orderBy(desc(userProfilesTable.lastSeenAt));
  }
}

/**
 * Given a list of Discord IDs, return a map discordId → steamId
 * (only IDs that have a non-null steamId are included).
 */
export async function getSteamIds(
  discordIds: string[],
): Promise<Map<string, string>> {
  if (discordIds.length === 0) return new Map();
  const db = getAppDb();
  if (!db) return new Map();
  try {
    const rows = await db
      .select({
        discordId: userProfilesTable.discordId,
        steamId:   userProfilesTable.steamId,
      })
      .from(userProfilesTable)
      .where(inArray(userProfilesTable.discordId, discordIds));
    const map = new Map<string, string>();
    for (const r of rows) {
      if (r.steamId) map.set(r.discordId, r.steamId);
    }
    return map;
  } catch {
    // Table or column missing (DB not yet initialised) — members load without Steam IDs
    return new Map();
  }
}
