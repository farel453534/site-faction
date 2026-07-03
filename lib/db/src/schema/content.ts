import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

// Overlay tables for editable site content. Rows only exist for items an admin has
// edited; everything else falls back to the static seed in @workspace/content.

export const contentGroupsTable = pgTable("content_groups", {
  groupSlug: text("group_slug").primaryKey(),
  title: text("title").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contentPagesTable = pgTable(
  "content_pages",
  {
    groupSlug: text("group_slug").notNull(),
    pageSlug: text("page_slug").notNull(),
    title: text("title").notNull(),
    markdown: text("markdown").notNull(),
    updatedBy: text("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.groupSlug, t.pageSlug] })],
);

export const contentHomeCardsTable = pgTable("content_home_cards", {
  cardKey: text("card_key").primaryKey(),
  title: text("title").notNull(),
  keywords: text("keywords").notNull(),
  markdown: text("markdown").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contentSettingsTable = pgTable("content_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ContentGroupRow = typeof contentGroupsTable.$inferSelect;
export type ContentPageRow = typeof contentPagesTable.$inferSelect;
export type ContentHomeCardRow = typeof contentHomeCardsTable.$inferSelect;
export type ContentSettingRow = typeof contentSettingsTable.$inferSelect;
