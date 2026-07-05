import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// A player's complaint/request ("plainte"/"demande") addressed to the gérants
// of their faction. Visible only to the author, the faction's gérants, and
// anyone explicitly added as a participant (another gérant or a player).
export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  faction: text("faction").notNull(),
  category: text("category").notNull(), // "plainte" | "demande"
  subject: text("subject").notNull(),
  authorId: text("author_id").notNull(),
  authorUsername: text("author_username").notNull(),
  status: text("status").notNull().default("open"), // open | claimed | closed
  claimedBy: text("claimed_by"),
  claimedByUsername: text("claimed_by_username"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const ticketMessagesTable = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id")
    .notNull()
    .references(() => ticketsTable.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  authorUsername: text("author_username").notNull(),
  isStaff: boolean("is_staff").notNull().default(false),
  body: text("body").notNull(),
  /** JSON array of { url, name, type, size } objects — nullable when no attachments. */
  attachments: text("attachments"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const ticketParticipantsTable = pgTable(
  "ticket_participants",
  {
    id: serial("id").primaryKey(),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => ticketsTable.id, { onDelete: "cascade" }),
    discordId: text("discord_id").notNull(),
    label: text("label"),
    addedBy: text("added_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("ticket_participant_unique").on(t.ticketId, t.discordId)],
);

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({
  id: true,
  status: true,
  claimedBy: true,
  claimedByUsername: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
});
export const insertTicketMessageSchema = createInsertSchema(
  ticketMessagesTable,
).omit({ id: true, createdAt: true });
export const insertTicketParticipantSchema = createInsertSchema(
  ticketParticipantsTable,
).omit({ id: true, createdAt: true });

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type TicketMessage = typeof ticketMessagesTable.$inferSelect;
export type InsertTicketParticipant = z.infer<
  typeof insertTicketParticipantSchema
>;
export type TicketParticipant = typeof ticketParticipantsTable.$inferSelect;
