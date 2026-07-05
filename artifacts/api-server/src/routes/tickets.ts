import { Router, type IRouter } from "express";
import { FACTION_ROLES, notifyNewTicket } from "../lib/discord";
import { buildTicketUrl } from "../lib/request-url";
import { isAppDbConfigured } from "../lib/app-db";
import { requireAuth, type AuthedRequest } from "../lib/session";
import {
  canAccessTicket,
  isStaffFor,
  getTicketById,
  createTicket,
  listMyTickets,
  listFactionTickets,
  listMessages,
  listParticipants,
  addMessage,
  claimTicket,
  unclaimTicket,
  closeTicket,
  reopenTicket,
  addParticipant,
  removeParticipant,
} from "../lib/tickets";

const router: IRouter = Router();

const ID_RE = /^\d{15,25}$/;
const CATEGORIES = new Set(["plainte", "demande"]);
const FACTION_NAMES = new Set(FACTION_ROLES.map((f) => f.name));

function dbGuard(res: import("express").Response): boolean {
  if (!isAppDbConfigured()) {
    res.status(503).json({ error: "db_unavailable" });
    return false;
  }
  return true;
}

function serializeTicket(t: Awaited<ReturnType<typeof getTicketById>>) {
  if (!t) return null;
  return {
    id: t.id,
    faction: t.faction,
    category: t.category,
    subject: t.subject,
    authorId: t.authorId,
    authorUsername: t.authorUsername,
    status: t.status,
    claimedBy: t.claimedBy,
    claimedByUsername: t.claimedByUsername,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    closedAt: t.closedAt ? t.closedAt.toISOString() : null,
  };
}

// POST /tickets — a faction player opens a new complaint/request.
router.post("/tickets", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  if (!user.faction) {
    res.status(403).json({ error: "no_faction" });
    return;
  }
  const body = req.body as {
    category?: unknown;
    subject?: unknown;
    body?: unknown;
  };
  const category = typeof body.category === "string" ? body.category : "";
  const subject =
    typeof body.subject === "string" ? body.subject.trim().slice(0, 140) : "";
  const message =
    typeof body.body === "string" ? body.body.trim().slice(0, 4000) : "";

  if (!CATEGORIES.has(category)) {
    res.status(400).json({ error: "invalid_category" });
    return;
  }
  if (!subject || !message) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  try {
    const ticket = await createTicket({
      faction: user.faction,
      category,
      subject,
      authorId: user.id,
      authorUsername: user.global_name || user.username,
      body: message,
    });
    notifyNewTicket({
      id: ticket.id,
      faction: ticket.faction,
      category: ticket.category,
      subject: ticket.subject,
      authorUsername: ticket.authorUsername,
      url: buildTicketUrl(req, ticket.id),
    }).catch((err) => {
      req.log.error({ err }, "Failed to notify Discord for new ticket");
    });
    res.status(201).json({ ticket: serializeTicket(ticket) });
  } catch (err) {
    req.log.error({ err }, "Failed to create ticket");
    res.status(500).json({ error: "internal_error" });
  }
});

// GET /tickets — list tickets. ?faction=X for the gérant management view
// (must be one of the user's managed factions); otherwise returns "my tickets".
router.get("/tickets", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const faction =
    typeof req.query["faction"] === "string" ? req.query["faction"] : null;

  try {
    if (faction) {
      if (!user.gerantFactions.includes(faction) && !user.isResponsable) {
        res.status(403).json({ error: "not_gerant_of_faction" });
        return;
      }
      if (!FACTION_NAMES.has(faction)) {
        res.status(400).json({ error: "unknown_faction" });
        return;
      }
      const tickets = await listFactionTickets(faction);
      res.json({ tickets: tickets.map(serializeTicket) });
      return;
    }
    const tickets = await listMyTickets(user.id);
    res.json({ tickets: tickets.map(serializeTicket) });
  } catch (err) {
    req.log.error({ err }, "Failed to list tickets");
    res.status(500).json({ error: "internal_error" });
  }
});

// GET /tickets/:id — ticket detail with messages + participants.
router.get("/tickets/:id", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (!(await canAccessTicket(user, ticket))) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    const [messages, participants] = await Promise.all([
      listMessages(id),
      listParticipants(id),
    ]);
    res.json({
      ticket: serializeTicket(ticket),
      isStaff: isStaffFor(user, ticket),
      messages: messages.map((m) => ({
        id: m.id,
        authorId: m.authorId,
        authorUsername: m.authorUsername,
        isStaff: m.isStaff,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
      participants: participants.map((p) => ({
        id: p.id,
        discordId: p.discordId,
        label: p.label,
        addedBy: p.addedBy,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load ticket");
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /tickets/:id/messages — reply on a ticket thread.
router.post("/tickets/:id/messages", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  const body = req.body as { body?: unknown };
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 4000) : "";
  if (!text) {
    res.status(400).json({ error: "missing_body" });
    return;
  }
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (!(await canAccessTicket(user, ticket))) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    const message = await addMessage({
      ticketId: id,
      authorId: user.id,
      authorUsername: user.global_name || user.username,
      isStaff: isStaffFor(user, ticket),
      body: text,
    });
    res.status(201).json({
      message: {
        id: message.id,
        authorId: message.authorId,
        authorUsername: message.authorUsername,
        isStaff: message.isStaff,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to post ticket message");
    res.status(500).json({ error: "internal_error" });
  }
});

function requireStaffOnTicket(
  ticket: NonNullable<Awaited<ReturnType<typeof getTicketById>>>,
  user: AuthedRequest["user"],
): boolean {
  return !!user && isStaffFor(user, ticket);
}

// POST /tickets/:id/claim
router.post("/tickets/:id/claim", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (!requireStaffOnTicket(ticket, user)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    if (ticket.status === "closed") {
      res.status(409).json({ error: "ticket_closed" });
      return;
    }
    await claimTicket(id, user);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to claim ticket");
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /tickets/:id/unclaim
router.post("/tickets/:id/unclaim", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (!requireStaffOnTicket(ticket, user)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    await unclaimTicket(id);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to unclaim ticket");
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /tickets/:id/close
router.post("/tickets/:id/close", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (!requireStaffOnTicket(ticket, user)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    await closeTicket(id);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to close ticket");
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /tickets/:id/reopen
router.post("/tickets/:id/reopen", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (!requireStaffOnTicket(ticket, user)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    await reopenTicket(id, ticket.claimedBy);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to reopen ticket");
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /tickets/:id/participants — add a gérant (from another faction) or a player by Discord ID.
router.post("/tickets/:id/participants", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  const body = req.body as { discordId?: unknown; label?: unknown };
  const discordId =
    typeof body.discordId === "string" ? body.discordId.trim() : "";
  const label =
    typeof body.label === "string" && body.label.trim()
      ? body.label.trim().slice(0, 60)
      : null;
  if (!ID_RE.test(discordId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (!requireStaffOnTicket(ticket, user)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    await addParticipant({
      ticketId: id,
      discordId,
      label,
      addedBy: user.id,
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to add ticket participant");
    res.status(500).json({ error: "internal_error" });
  }
});

// DELETE /tickets/:id/participants/:discordId
router.delete(
  "/tickets/:id/participants/:discordId",
  requireAuth,
  async (req, res) => {
    if (!dbGuard(res)) return;
    const user = (req as AuthedRequest).user!;
    const id = Number(req.params["id"]);
    const discordId = String(req.params["discordId"] ?? "");
    try {
      const ticket = await getTicketById(id);
      if (!ticket) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      if (!requireStaffOnTicket(ticket, user)) {
        res.status(403).json({ error: "forbidden" });
        return;
      }
      await removeParticipant(id, discordId);
      res.json({ ok: true });
    } catch (err) {
      req.log.error({ err }, "Failed to remove ticket participant");
      res.status(500).json({ error: "internal_error" });
    }
  },
);

export default router;
