import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import { blacklistsTable } from "@workspace/db/schema";
import { getAppDb, isAppDbConfigured } from "../lib/app-db";
import { readSession, type AuthedRequest } from "../lib/session";

const router: IRouter = Router();

function requireGerant(req: Request, res: Response, next: NextFunction): void {
  const user = readSession(req);
  if (!user) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  if (!user.gerantFactions || user.gerantFactions.length === 0) {
    res.status(403).json({ error: "not_gerant" });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
}

/**
 * GET /api/gerant/blacklist?faction=Auror
 * Liste les entrées blacklist de la faction demandée.
 * Le gérant ne peut consulter que ses propres factions.
 */
router.get("/gerant/blacklist", requireGerant, async (req, res) => {
  if (!isAppDbConfigured()) {
    return res.json({ entries: [], dbConfigured: false });
  }
  const user = (req as AuthedRequest).user!;
  const faction =
    typeof req.query["faction"] === "string"
      ? req.query["faction"]
      : user.gerantFactions[0]!;

  if (!user.gerantFactions.includes(faction)) {
    return res.status(403).json({ error: "not_gerant_of_faction" });
  }

  const db = getAppDb()!;
  try {
    const entries = await db
      .select()
      .from(blacklistsTable)
      .where(eq(blacklistsTable.faction, faction))
      .orderBy(blacklistsTable.createdAt);
    return res.json({
      dbConfigured: true,
      faction,
      entries: entries.map((e) => ({
        id:              e.id,
        faction:         e.faction,
        discordId:       e.discordId,
        playerName:      e.playerName,
        reason:          e.reason,
        addedBy:         e.addedBy,
        addedByUsername: e.addedByUsername,
        createdAt:       e.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list blacklist");
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * POST /api/gerant/blacklist
 * Ajoute un joueur à la blacklist.
 * Body: { faction?, discordId, playerName, reason? }
 */
router.post("/gerant/blacklist", requireGerant, async (req, res) => {
  if (!isAppDbConfigured()) {
    return res.status(503).json({ error: "db_unavailable" });
  }
  const user = (req as AuthedRequest).user!;
  const body = req.body as {
    faction?: unknown;
    discordId?: unknown;
    playerName?: unknown;
    reason?: unknown;
  };

  const faction =
    typeof body.faction === "string" && body.faction.trim()
      ? body.faction.trim()
      : user.gerantFactions[0]!;
  const discordId =
    typeof body.discordId === "string" ? body.discordId.trim() : "";
  const playerName =
    typeof body.playerName === "string" ? body.playerName.trim() : "";
  const reason =
    typeof body.reason === "string" && body.reason.trim()
      ? body.reason.trim().slice(0, 300)
      : null;

  if (!user.gerantFactions.includes(faction)) {
    return res.status(403).json({ error: "not_gerant_of_faction" });
  }
  if (!/^\d{15,25}$/.test(discordId)) {
    return res.status(400).json({ error: "invalid_discord_id" });
  }
  if (!playerName) {
    return res.status(400).json({ error: "missing_player_name" });
  }

  const db = getAppDb()!;
  try {
    const [entry] = await db
      .insert(blacklistsTable)
      .values({ faction, discordId, playerName, reason, addedBy: user.id, addedByUsername: user.global_name ?? user.username })
      .returning();
    return res.status(201).json({
      ok: true,
      entry: {
        id:              entry!.id,
        faction:         entry!.faction,
        discordId:       entry!.discordId,
        playerName:      entry!.playerName,
        reason:          entry!.reason,
        addedBy:         entry!.addedBy,
        addedByUsername: entry!.addedByUsername,
        createdAt:       entry!.createdAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to add blacklist entry");
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * DELETE /api/gerant/blacklist/:id
 * Supprime une entrée. Vérifie d'abord que l'entrée appartient à une
 * faction gérée par l'utilisateur (sécurité : pas de suppression cross-faction).
 */
router.delete("/gerant/blacklist/:id", requireGerant, async (req, res) => {
  if (!isAppDbConfigured()) {
    return res.status(503).json({ error: "db_unavailable" });
  }
  const user = (req as AuthedRequest).user!;
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "invalid_id" });
  }

  const db = getAppDb()!;
  try {
    // Fetch first to verify faction ownership before deleting
    const rows = await db
      .select({ id: blacklistsTable.id, faction: blacklistsTable.faction })
      .from(blacklistsTable)
      .where(eq(blacklistsTable.id, id))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    if (!user.gerantFactions.includes(rows[0]!.faction)) {
      return res.status(403).json({ error: "not_gerant_of_faction" });
    }

    await db
      .delete(blacklistsTable)
      .where(and(eq(blacklistsTable.id, id), eq(blacklistsTable.faction, rows[0]!.faction)));

    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete blacklist entry");
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
