import { eq } from "drizzle-orm";
import { generalStaffTable, type GeneralStaff } from "@workspace/db/schema";
import { getAppDb } from "./app-db";

export async function isGeneralStaff(discordId: string): Promise<boolean> {
  const db = getAppDb();
  if (!db) return false;
  try {
    const rows = await db
      .select({ id: generalStaffTable.discordId })
      .from(generalStaffTable)
      .where(eq(generalStaffTable.discordId, discordId))
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function listGeneralStaff(): Promise<GeneralStaff[]> {
  const db = getAppDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(generalStaffTable)
      .orderBy(generalStaffTable.createdAt);
  } catch {
    return [];
  }
}

export async function addGeneralStaff(
  discordId: string,
  label: string | null,
  addedBy: string,
): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .insert(generalStaffTable)
    .values({ discordId, label, addedBy })
    .onConflictDoUpdate({
      target: generalStaffTable.discordId,
      set: { label },
    });
}

export async function removeGeneralStaff(discordId: string): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .delete(generalStaffTable)
    .where(eq(generalStaffTable.discordId, discordId));
}
