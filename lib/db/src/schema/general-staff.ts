import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const generalStaffTable = pgTable("general_staff", {
  discordId: text("discord_id").primaryKey(),
  label: text("label"),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertGeneralStaffSchema = createInsertSchema(generalStaffTable).omit({
  createdAt: true,
});
export type InsertGeneralStaff = z.infer<typeof insertGeneralStaffSchema>;
export type GeneralStaff = typeof generalStaffTable.$inferSelect;
