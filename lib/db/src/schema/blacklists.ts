import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Blacklist par faction. Un gérant ne peut gérer que les entrées
 * correspondant aux factions qu'il supervise.
 */
export const blacklistsTable = pgTable("blacklists", {
  id:               serial("id").primaryKey(),
  faction:          text("faction").notNull(),
  discordId:        text("discord_id").notNull(),
  playerName:       text("player_name").notNull(),
  reason:           text("reason"),
  addedBy:          text("added_by").notNull(),
  addedByUsername:  text("added_by_username").notNull(),
  createdAt:        timestamp("created_at", { withTimezone: true })
                      .notNull()
                      .defaultNow(),
});

export const insertBlacklistSchema = createInsertSchema(blacklistsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBlacklist = z.infer<typeof insertBlacklistSchema>;
export type Blacklist = typeof blacklistsTable.$inferSelect;
