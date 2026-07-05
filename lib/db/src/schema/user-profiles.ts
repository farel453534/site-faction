import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * One row per Discord user who has ever logged in via the panel.
 * Upserted on every successful OAuth callback.
 */
export const userProfilesTable = pgTable("user_profiles", {
  discordId:   text("discord_id").primaryKey(),
  username:    text("username").notNull(),
  globalName:  text("global_name"),
  avatar:      text("avatar"),
  faction:     text("faction"),
  /** Steam ID renseigné par l'utilisateur depuis son profil. */
  steamId:     text("steam_id"),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt:  timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({
  firstSeenAt: true,
  lastSeenAt: true,
});
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfilesTable.$inferSelect;
