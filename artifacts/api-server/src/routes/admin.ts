import { Router, type IRouter } from "express";
import {
  requireAdmin,
  isEnvAdmin,
  getEnvAdminIds,
  listDbAdmins,
  addAdmin,
  removeAdmin,
} from "../lib/admin";
import { isAppDbConfigured } from "../lib/app-db";
import { getLeaderboard, getPlayerStats } from "../lib/game-db";
import { listPanelUsers } from "../lib/user-profiles";
import type { AuthedRequest } from "../lib/session";

const router: IRouter = Router();

const ID_RE = /^\d{15,25}$/;

/**
 * GET /api/admin/panel-users
 * Liste tous les comptes Discord ayant déjà connecté leur compte sur le panel.
 * Réservé aux admins (responsable inclus).
 */
router.get("/admin/panel-users", requireAdmin, async (req, res) => {
  if (!isAppDbConfigured()) {
    return res.json({ users: [], dbConfigured: false });
  }
  const requestingUser = (req as AuthedRequest).user!;
  const canSeeIp = requestingUser.isResponsable;
  try {
    const users = await listPanelUsers();
    return res.json({
      dbConfigured: true,
      users: users.map((u) => ({
        discordId:   u.discordId,
        username:    u.username,
        globalName:  u.globalName,
        faction:     u.faction,
        steamId:     u.steamId,
        // IP visible uniquement pour le responsable
        lastIp:      canSeeIp ? (u.lastIp ?? null) : undefined,
        firstSeenAt: u.firstSeenAt.toISOString(),
        lastSeenAt:  u.lastSeenAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list panel users");
    return res.status(500).json({ error: "internal_error" });
  }
});

router.get("/admin/players", requireAdmin, async (req, res) => {
  try {
    const players = await getLeaderboard();
    res.json({ players });
  } catch (err) {
    req.log.error({ err }, "Failed to load leaderboard");
    res.status(500).json({ error: "internal_error" });
  }
});

router.get("/admin/player", requireAdmin, async (req, res) => {
  const userId =
    typeof req.query["userId"] === "string" ? req.query["userId"] : "";
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }
  try {
    const stats = await getPlayerStats(userId);
    res.json({ userId, stats });
  } catch (err) {
    req.log.error({ err }, "Failed to load player stats");
    res.status(500).json({ error: "internal_error" });
  }
});

router.get("/admin/admins", requireAdmin, async (req, res) => {
  try {
    const envIds = getEnvAdminIds();
    const dbAdmins = await listDbAdmins();
    const admins = [
      ...[...envIds].map((id) => ({
        discordId: id,
        label: null as string | null,
        source: "env" as const,
        removable: false,
        createdAt: null as string | null,
      })),
      ...dbAdmins
        .filter((a) => !envIds.has(a.discordId))
        .map((a) => ({
          discordId: a.discordId,
          label: a.label,
          source: "db" as const,
          removable: true,
          createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
        })),
    ];
    res.json({
      admins,
      dbConfigured: isAppDbConfigured(),
      currentUserId: (req as AuthedRequest).user?.id ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list admins");
    res.status(500).json({ error: "internal_error" });
  }
});

router.post("/admin/admins", requireAdmin, async (req, res) => {
  if (!isAppDbConfigured()) {
    res.status(503).json({ error: "db_unavailable" });
    return;
  }
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
  if (isEnvAdmin(discordId)) {
    res.status(409).json({ error: "already_env_admin" });
    return;
  }
  try {
    await addAdmin(discordId, label, (req as AuthedRequest).user?.id ?? "unknown");
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "DB_UNAVAILABLE") {
      res.status(503).json({ error: "db_unavailable" });
      return;
    }
    req.log.error({ err }, "Failed to add admin");
    res.status(500).json({ error: "internal_error" });
  }
});

router.delete("/admin/admins/:discordId", requireAdmin, async (req, res) => {
  if (!isAppDbConfigured()) {
    res.status(503).json({ error: "db_unavailable" });
    return;
  }
  const discordId = String(req.params["discordId"] ?? "");
  if (!ID_RE.test(discordId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  if (isEnvAdmin(discordId)) {
    res.status(400).json({ error: "env_admin_protected" });
    return;
  }
  try {
    await removeAdmin(discordId);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "DB_UNAVAILABLE") {
      res.status(503).json({ error: "db_unavailable" });
      return;
    }
    req.log.error({ err }, "Failed to remove admin");
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
