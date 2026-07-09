import { Router, type IRouter } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { FACTION_ROLES, notifyNewTicket } from "../lib/discord";
import { buildTicketUrl } from "../lib/request-url";
import { isAppDbConfigured } from "../lib/app-db";
import { requireAuth, type AuthedRequest } from "../lib/session";

// ─── File upload configuration ────────────────────────────────────────────────

export const UPLOADS_DIR =
  process.env["UPLOADS_DIR"] ?? path.join(process.cwd(), "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|pdf|txt|mp4|mov|zip|rar|7z|docx?|xlsx?)$/i;

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_EXTENSIONS.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("file_type_not_allowed"));
    }
  },
});
import {
  canAccessTicket,
  isStaffFor,
  getTicketById,
  createTicket,
  listMyTickets,
  listFactionTickets,
  listArchivedTickets,
  listMessages,
  listParticipants,
  addMessage,
  claimTicket,
  unclaimTicket,
  closeTicket,
  reopenTicket,
  acceptTicket,
  refuseTicket,
  addParticipant,
  removeParticipant,
} from "../lib/tickets";
import { notifyTicketReply } from "../lib/discord";

const router: IRouter = Router();

const ID_RE = /^\d{15,25}$/;
const WL_CATEGORIES = new Set(["plainte", "demande", "question"]);
const GENERAL_CATEGORIES = new Set([
  "ck", "don", "classe",
  "naissance-rp", "traitrise",
]);
const ALL_CATEGORIES = new Set([...WL_CATEGORIES, ...GENERAL_CATEGORIES]);
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
    decision: (t as Record<string, unknown>)["decision"] as string | null ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    closedAt: t.closedAt ? t.closedAt.toISOString() : null,
  };
}

// POST /tickets — open a new ticket.
// WL categories (plainte/demande) require faction membership.
// General categories (ck/don/classe) are open to any logged-in user.
router.post("/tickets", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
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

  if (!ALL_CATEGORIES.has(category)) {
    res.status(400).json({ error: "invalid_category" });
    return;
  }
  if (!subject || !message) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const isGeneral = GENERAL_CATEGORIES.has(category);
  if (!isGeneral && !user.faction) {
    res.status(403).json({ error: "no_faction" });
    return;
  }

  const faction = isGeneral ? "Général" : user.faction!;

  try {
    const ticket = await createTicket({
      faction,
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
// (must be one of the user's managed factions); ?archives=1 for the
// Responsable-only view of all closed tickets; otherwise returns "my tickets".
// Closed tickets are hidden from the regular "mine"/faction views — only the
// Responsable's archives view surfaces them.
router.get("/tickets", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const faction =
    typeof req.query["faction"] === "string" ? req.query["faction"] : null;
  const archives = req.query["archives"] === "1";

  try {
    if (archives) {
      if (!user.isResponsable) {
        res.status(403).json({ error: "forbidden" });
        return;
      }
      const tickets = await listArchivedTickets();
      res.json({ tickets: tickets.map(serializeTicket) });
      return;
    }
    if (faction) {
      if (faction === "Général") {
        if (!user.isResponsable && !user.isGeneralStaff) {
          res.status(403).json({ error: "forbidden" });
          return;
        }
      } else {
        if (!user.gerantFactions.includes(faction) && !user.isResponsable) {
          res.status(403).json({ error: "not_gerant_of_faction" });
          return;
        }
        if (!FACTION_NAMES.has(faction)) {
          res.status(400).json({ error: "unknown_faction" });
          return;
        }
      }
      const tickets = await listFactionTickets(faction);
      res.json({
        tickets: tickets.filter((t) => t.status !== "closed").map(serializeTicket),
      });
      return;
    }
    const tickets = await listMyTickets(user.id);
    // Authors always see all their tickets (including closed) so they can
    // read the staff response after a ticket is closed/accepted/refused.
    res.json({
      tickets: tickets.map(serializeTicket),
    });
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
        attachments: m.attachments ? JSON.parse(m.attachments) : null,
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
// Body: { body: string, attachments?: Array<{url,name,type,size}> }
router.post("/tickets/:id/messages", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  const body = req.body as { body?: unknown; attachments?: unknown };
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 4000) : "";
  // Validate and sanitise attachment objects from client — never trust raw input
  const rawAttachments = Array.isArray(body.attachments) ? body.attachments : null;
  const attachments: Array<{ url: string; name: string; type: string; size: number }> | null =
    rawAttachments
      ? rawAttachments
          .slice(0, 10)
          .filter(
            (a): a is { url: string; name: string; type: string; size: number } =>
              typeof a === "object" &&
              a !== null &&
              typeof (a as Record<string, unknown>).url === "string" &&
              typeof (a as Record<string, unknown>).name === "string" &&
              typeof (a as Record<string, unknown>).type === "string" &&
              typeof (a as Record<string, unknown>).size === "number" &&
              // Only allow URLs from our own upload path
              /^\/api\/uploads\/[\w\-]+\.\w{1,10}$/.test(
                (a as Record<string, unknown>).url as string,
              ),
          )
      : null;

  if (!text && (!attachments || attachments.length === 0)) {
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
    const staffReply = isStaffFor(user, ticket);
    const message = await addMessage({
      ticketId: id,
      authorId: user.id,
      authorUsername: user.global_name || user.username,
      isStaff: staffReply,
      body: text || "📎",
      attachments,
    });

    // Notify via Discord DM — fire-and-forget, never blocks the response.
    notifyTicketReply({
      ticketId: id,
      ticketSubject: ticket.subject,
      senderUsername: user.global_name || user.username,
      isStaff: staffReply,
      authorId: ticket.authorId,
      claimedBy: ticket.claimedBy,
      currentUserId: user.id,
      url: buildTicketUrl(req, id),
    }).catch((err) => {
      req.log.error({ err }, "Failed to notify Discord for ticket reply");
    });

    res.status(201).json({
      message: {
        id: message.id,
        authorId: message.authorId,
        authorUsername: message.authorUsername,
        isStaff: message.isStaff,
        body: message.body,
        attachments: message.attachments ? JSON.parse(message.attachments) : null,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to post ticket message");
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /tickets/:id/attachments — upload a file (max 10MB), returns its URL.
// Auth is checked before multer; on rejection the file is cleaned up from disk.
router.post(
  "/tickets/:id/attachments",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    if (!dbGuard(res)) return;
    const user = (req as AuthedRequest).user!;
    const id = Number(req.params["id"]);
    if (!Number.isInteger(id)) {
      // Remove uploaded file from disk before returning error
      if (req.file) { try { (await import("node:fs/promises")).unlink(req.file.path).catch(() => {}); } catch {} }
      res.status(400).json({ error: "invalid_id" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "no_file" });
      return;
    }
    const cleanup = () => {
      import("node:fs/promises").then((fs) => fs.unlink(req.file!.path).catch(() => {}));
    };
    try {
      const ticket = await getTicketById(id);
      if (!ticket) {
        cleanup();
        res.status(404).json({ error: "not_found" });
        return;
      }
      if (!(await canAccessTicket(user, ticket))) {
        cleanup();
        res.status(403).json({ error: "forbidden" });
        return;
      }
      // URL goes through the authenticated /api/uploads/:filename route
      res.status(201).json({
        attachment: {
          url: `/api/uploads/${req.file.filename}`,
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (err) {
      cleanup();
      req.log.error({ err }, "Failed to upload ticket attachment");
      res.status(500).json({ error: "internal_error" });
    }
  },
);

// GET /uploads/:filename — authenticated file download (no public static serving).
// Only logged-in users can access uploaded attachments.
router.get("/uploads/:filename", requireAuth, (req, res) => {
  const raw = String(req.params["filename"] ?? "");
  // Prevent path traversal
  const safe = path.basename(raw);
  if (!safe || safe !== raw || !safe.match(/^[\w\-]+\.\w{1,10}$/)) {
    res.status(400).json({ error: "invalid_filename" });
    return;
  }
  res.sendFile(path.join(UPLOADS_DIR, safe), (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "not_found" });
    }
  });
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

// POST /tickets/:id/accept — staff accepts and closes the ticket.
router.post("/tickets/:id/accept", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  try {
    const ticket = await getTicketById(id);
    if (!ticket) { res.status(404).json({ error: "not_found" }); return; }
    if (!requireStaffOnTicket(ticket, user)) { res.status(403).json({ error: "forbidden" }); return; }
    if (ticket.status === "closed") { res.status(409).json({ error: "ticket_closed" }); return; }
    await acceptTicket(id);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to accept ticket");
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /tickets/:id/refuse — staff refuses and closes the ticket.
router.post("/tickets/:id/refuse", requireAuth, async (req, res) => {
  if (!dbGuard(res)) return;
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  try {
    const ticket = await getTicketById(id);
    if (!ticket) { res.status(404).json({ error: "not_found" }); return; }
    if (!requireStaffOnTicket(ticket, user)) { res.status(403).json({ error: "forbidden" }); return; }
    if (ticket.status === "closed") { res.status(409).json({ error: "ticket_closed" }); return; }
    await refuseTicket(id);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to refuse ticket");
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
