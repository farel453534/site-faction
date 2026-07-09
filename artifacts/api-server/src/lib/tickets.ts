import { eq, and, or, desc, sql } from "drizzle-orm";
import {
  ticketsTable,
  ticketMessagesTable,
  ticketParticipantsTable,
  type Ticket,
  type TicketMessage,
  type TicketParticipant,
} from "@workspace/db/schema";
import { getAppDb } from "./app-db";
import type { SessionUser } from "./session";

function pgErrorCode(err: unknown): string | undefined {
  const cause = ((err as Record<string, unknown>)["cause"] ?? {}) as Record<string, unknown>;
  return cause["code"] as string | undefined;
}
/** 42P01 — table does not exist. */
function isMissingTableError(err: unknown): boolean {
  return pgErrorCode(err) === "42P01";
}
/** 42703 — column does not exist (pending migration). */
function isMissingColumnError(err: unknown): boolean {
  return pgErrorCode(err) === "42703";
}

function db() {
  const d = getAppDb();
  if (!d) throw new Error("DB_UNAVAILABLE");
  return d;
}

/** Whether the user can see a given ticket (author, participant, claimer, gérant of its faction, or general staff for Général tickets). */
export async function canAccessTicket(
  user: SessionUser,
  ticket: Ticket,
): Promise<boolean> {
  if (user.isResponsable) return true;
  if (ticket.authorId === user.id) return true;
  if (ticket.claimedBy === user.id) return true;
  if (user.gerantFactions.includes(ticket.faction)) return true;
  if (user.isGeneralStaff && ticket.faction === "Général") return true;
  const participants = await db()
    .select({ id: ticketParticipantsTable.id })
    .from(ticketParticipantsTable)
    .where(
      and(
        eq(ticketParticipantsTable.ticketId, ticket.id),
        eq(ticketParticipantsTable.discordId, user.id),
      ),
    )
    .limit(1);
  return participants.length > 0;
}

export function isStaffFor(user: SessionUser, ticket: Ticket): boolean {
  if (user.isResponsable) return true;
  if (user.gerantFactions.includes(ticket.faction)) return true;
  if (user.isGeneralStaff && ticket.faction === "Général") return true;
  return false;
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  const rows = await db()
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createTicket(input: {
  faction: string;
  category: string;
  subject: string;
  authorId: string;
  authorUsername: string;
  body: string;
}): Promise<Ticket> {
  const rows = await db()
    .insert(ticketsTable)
    .values({
      faction: input.faction,
      category: input.category,
      subject: input.subject,
      authorId: input.authorId,
      authorUsername: input.authorUsername,
    })
    .returning();
  const ticket = rows[0]!;
  await db().insert(ticketMessagesTable).values({
    ticketId: ticket.id,
    authorId: input.authorId,
    authorUsername: input.authorUsername,
    isStaff: false,
    body: input.body,
  });
  return ticket;
}

/** Tickets visible to the user because they authored, are participant of, or claimed them. */
export async function listMyTickets(userId: string): Promise<Ticket[]> {
  try {
    const owned = await db()
      .select()
      .from(ticketsTable)
      .where(
        or(
          eq(ticketsTable.authorId, userId),
          eq(ticketsTable.claimedBy, userId),
        ),
      )
      .orderBy(desc(ticketsTable.updatedAt));

    const participantRows = await db()
      .select({ ticketId: ticketParticipantsTable.ticketId })
      .from(ticketParticipantsTable)
      .where(eq(ticketParticipantsTable.discordId, userId));

    const ownedIds = new Set(owned.map((t) => t.id));
    const extraIds = participantRows
      .map((r) => r.ticketId)
      .filter((id) => !ownedIds.has(id));

    if (extraIds.length === 0) return owned;

    const extras: Ticket[] = [];
    for (const id of extraIds) {
      const t = await getTicketById(id);
      if (t) extras.push(t);
    }
    return [...owned, ...extras].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  } catch {
    return [];
  }
}

/** All tickets belonging to a faction (gérant management view). */
export async function listFactionTickets(faction: string): Promise<Ticket[]> {
  try {
    return await db()
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.faction, faction))
      .orderBy(desc(ticketsTable.updatedAt));
  } catch {
    return [];
  }
}

/** All closed tickets across every faction (Responsable-only archive view). */
export async function listArchivedTickets(): Promise<Ticket[]> {
  try {
    return await db()
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.status, "closed"))
      .orderBy(desc(ticketsTable.updatedAt));
  } catch {
    return [];
  }
}

export async function listMessages(ticketId: number): Promise<TicketMessage[]> {
  try {
    return await db()
      .select()
      .from(ticketMessagesTable)
      .where(eq(ticketMessagesTable.ticketId, ticketId))
      .orderBy(ticketMessagesTable.createdAt);
  } catch (err) {
    // Table missing → empty list
    if (isMissingTableError(err)) return [];
    // attachments column missing (migration pending) → retry without it
    if (!isMissingColumnError(err)) throw err;
    return db()
      .select({
        id:             ticketMessagesTable.id,
        ticketId:       ticketMessagesTable.ticketId,
        authorId:       ticketMessagesTable.authorId,
        authorUsername: ticketMessagesTable.authorUsername,
        isStaff:        ticketMessagesTable.isStaff,
        body:           ticketMessagesTable.body,
        attachments:    sql<string | null>`NULL`,
        createdAt:      ticketMessagesTable.createdAt,
      })
      .from(ticketMessagesTable)
      .where(eq(ticketMessagesTable.ticketId, ticketId))
      .orderBy(ticketMessagesTable.createdAt);
  }
}

export async function listParticipants(
  ticketId: number,
): Promise<TicketParticipant[]> {
  return db()
    .select()
    .from(ticketParticipantsTable)
    .where(eq(ticketParticipantsTable.ticketId, ticketId))
    .orderBy(ticketParticipantsTable.createdAt);
}

export async function addMessage(input: {
  ticketId: number;
  authorId: string;
  authorUsername: string;
  isStaff: boolean;
  body: string;
  attachments?: Array<{ url: string; name: string; type: string; size: number }> | null;
}): Promise<TicketMessage> {
  const { attachments, ...rest } = input;
  const serialized = attachments && attachments.length > 0
    ? JSON.stringify(attachments)
    : null;

  let rows: TicketMessage[];
  try {
    rows = await db()
      .insert(ticketMessagesTable)
      .values({ ...rest, attachments: serialized })
      .returning();
  } catch (err) {
    // If attachments column doesn't exist yet (migration pending), retry without it
    if (!isMissingColumnError(err)) throw err;
    rows = await db()
      .insert(ticketMessagesTable)
      .values(rest)
      .returning();
    // Patch the returned row so callers always see the field
    rows = rows.map((r) => ({ ...r, attachments: null }));
  }

  await db()
    .update(ticketsTable)
    .set({ updatedAt: new Date() })
    .where(eq(ticketsTable.id, input.ticketId));
  return rows[0]!;
}

export async function claimTicket(
  ticketId: number,
  user: SessionUser,
): Promise<void> {
  await db()
    .update(ticketsTable)
    .set({
      status: "claimed",
      claimedBy: user.id,
      claimedByUsername: user.global_name || user.username,
      updatedAt: new Date(),
    })
    .where(eq(ticketsTable.id, ticketId));
}

export async function unclaimTicket(ticketId: number): Promise<void> {
  await db()
    .update(ticketsTable)
    .set({
      status: "open",
      claimedBy: null,
      claimedByUsername: null,
      updatedAt: new Date(),
    })
    .where(eq(ticketsTable.id, ticketId));
}

export async function closeTicket(ticketId: number): Promise<void> {
  await db()
    .update(ticketsTable)
    .set({ status: "closed", closedAt: new Date(), updatedAt: new Date() })
    .where(eq(ticketsTable.id, ticketId));
}

export async function acceptTicket(ticketId: number): Promise<void> {
  await db()
    .update(ticketsTable)
    .set({ status: "closed", decision: "accepted", closedAt: new Date(), updatedAt: new Date() })
    .where(eq(ticketsTable.id, ticketId));
}

export async function refuseTicket(ticketId: number): Promise<void> {
  await db()
    .update(ticketsTable)
    .set({ status: "closed", decision: "refused", closedAt: new Date(), updatedAt: new Date() })
    .where(eq(ticketsTable.id, ticketId));
}

export async function reopenTicket(ticketId: number, claimedBy: string | null): Promise<void> {
  await db()
    .update(ticketsTable)
    .set({
      status: claimedBy ? "claimed" : "open",
      decision: null, // clear any previous accept/refuse decision
      closedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(ticketsTable.id, ticketId));
}

export async function addParticipant(input: {
  ticketId: number;
  discordId: string;
  label: string | null;
  addedBy: string;
}): Promise<void> {
  await db()
    .insert(ticketParticipantsTable)
    .values(input)
    .onConflictDoUpdate({
      target: [
        ticketParticipantsTable.ticketId,
        ticketParticipantsTable.discordId,
      ],
      set: { label: input.label },
    });
}

export async function removeParticipant(
  ticketId: number,
  discordId: string,
): Promise<void> {
  await db()
    .delete(ticketParticipantsTable)
    .where(
      and(
        eq(ticketParticipantsTable.ticketId, ticketId),
        eq(ticketParticipantsTable.discordId, discordId),
      ),
    );
}
