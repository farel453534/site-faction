import { eq, and } from "drizzle-orm";
import {
  contentGroupsTable,
  contentPagesTable,
  contentHomeCardsTable,
  contentSettingsTable,
} from "@workspace/db/schema";
import { defaultContent, type SiteContent } from "@workspace/content";
import { getAppDb } from "./app-db";

const HOME_TITLE_KEY = "home.title";

// Returns the full site content: the static seed from @workspace/content with any
// admin edits stored in the DB overlaid on top (per item). Falls back to the pure
// static content when there is no DB or a read fails, so the site never goes blank.
export async function getContent(): Promise<SiteContent> {
  const content = defaultContent();
  const db = getAppDb();
  if (!db) return content;

  try {
    const [groups, pages, cards, settings] = await Promise.all([
      db.select().from(contentGroupsTable),
      db.select().from(contentPagesTable),
      db.select().from(contentHomeCardsTable),
      db.select().from(contentSettingsTable),
    ]);

    const groupTitle = new Map(groups.map((g) => [g.groupSlug, g.title]));
    const pageMap = new Map(
      pages.map((p) => [`${p.groupSlug}/${p.pageSlug}`, p]),
    );
    const cardMap = new Map(cards.map((c) => [c.cardKey, c]));

    for (const group of content.groups) {
      const gt = groupTitle.get(group.slug);
      if (gt !== undefined) group.title = gt;
      for (const page of group.pages) {
        const row = pageMap.get(`${group.slug}/${page.slug}`);
        if (row) {
          page.title = row.title;
          page.markdown = row.markdown;
        }
      }
    }

    for (const card of content.home.cards) {
      const row = cardMap.get(card.key);
      if (row) {
        card.title = row.title;
        card.keywords = row.keywords;
        card.markdown = row.markdown;
      }
    }

    const homeTitle = settings.find((s) => s.key === HOME_TITLE_KEY);
    if (homeTitle) content.home.meta.title = homeTitle.value;

    return content;
  } catch {
    return content;
  }
}

export async function updateGroup(
  groupSlug: string,
  title: string,
  updatedBy: string,
): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .insert(contentGroupsTable)
    .values({ groupSlug, title, updatedBy })
    .onConflictDoUpdate({
      target: contentGroupsTable.groupSlug,
      set: { title, updatedBy, updatedAt: new Date() },
    });
}

export async function updatePage(
  groupSlug: string,
  pageSlug: string,
  title: string,
  markdown: string,
  updatedBy: string,
): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .insert(contentPagesTable)
    .values({ groupSlug, pageSlug, title, markdown, updatedBy })
    .onConflictDoUpdate({
      target: [contentPagesTable.groupSlug, contentPagesTable.pageSlug],
      set: { title, markdown, updatedBy, updatedAt: new Date() },
    });
}

export async function updateHomeCard(
  cardKey: string,
  title: string,
  keywords: string,
  markdown: string,
  updatedBy: string,
): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .insert(contentHomeCardsTable)
    .values({ cardKey, title, keywords, markdown, updatedBy })
    .onConflictDoUpdate({
      target: contentHomeCardsTable.cardKey,
      set: { title, keywords, markdown, updatedBy, updatedAt: new Date() },
    });
}

export async function updateHomeTitle(
  title: string,
  updatedBy: string,
): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .insert(contentSettingsTable)
    .values({ key: HOME_TITLE_KEY, value: title, updatedBy })
    .onConflictDoUpdate({
      target: contentSettingsTable.key,
      set: { value: title, updatedBy, updatedAt: new Date() },
    });
}

// Reset removes the overlay row(s) so the item reverts to the static seed.
export async function resetGroup(groupSlug: string): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .delete(contentGroupsTable)
    .where(eq(contentGroupsTable.groupSlug, groupSlug));
}

export async function resetPage(
  groupSlug: string,
  pageSlug: string,
): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .delete(contentPagesTable)
    .where(
      and(
        eq(contentPagesTable.groupSlug, groupSlug),
        eq(contentPagesTable.pageSlug, pageSlug),
      ),
    );
}

export async function resetHomeCard(cardKey: string): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .delete(contentHomeCardsTable)
    .where(eq(contentHomeCardsTable.cardKey, cardKey));
}

export async function resetHomeTitle(): Promise<void> {
  const db = getAppDb();
  if (!db) throw new Error("DB_UNAVAILABLE");
  await db
    .delete(contentSettingsTable)
    .where(eq(contentSettingsTable.key, HOME_TITLE_KEY));
}
