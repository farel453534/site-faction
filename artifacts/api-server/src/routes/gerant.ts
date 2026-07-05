import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import {
  FACTION_ROLES,
  fetchFactionMembers,
  buildAvatarUrl,
  detectGrade,
} from "../lib/discord";
import { getLeaderboard } from "../lib/game-db";
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
 * GET /gerant/members?faction=Auror
 * Returns Discord members of one of the gérant's factions + their game stats.
 * If the user manages a single faction, `faction` may be omitted.
 * Requires DISCORD_BOT_TOKEN to be set.
 */
router.get("/gerant/members", requireGerant, async (req, res) => {
  const user = (req as AuthedRequest).user!;
  const requested =
    typeof req.query["faction"] === "string" ? req.query["faction"] : null;
  const factionName = requested ?? user.gerantFactions[0]!;

  if (!user.gerantFactions.includes(factionName)) {
    res.status(403).json({ error: "not_gerant_of_faction" });
    return;
  }

  // Find the Discord role ID for this faction
  const factionRole = FACTION_ROLES.find((f) => f.name === factionName);
  if (!factionRole) {
    res.status(400).json({ error: "unknown_faction" });
    return;
  }

  const hasBotToken = !!process.env["DISCORD_BOT_TOKEN"];
  if (!hasBotToken) {
    res.status(503).json({ error: "bot_token_missing" });
    return;
  }

  try {
    const guildId = process.env["DISCORD_GUILD_ID"] ?? "1062740125475426404";

    const [members, leaderboard] = await Promise.all([
      fetchFactionMembers(guildId, factionRole.id),
      getLeaderboard(),
    ]);

    // Build a lookup map: discordId → leaderboard entry
    const statsMap = new Map(leaderboard.map((e) => [e.userId, e]));

    const result = members.map((m) => {
      const stats = statsMap.get(m.id);
      return {
        id: m.id,
        username: m.username,
        displayName: m.globalName ?? m.username,
        avatarUrl: buildAvatarUrl({ id: m.id, avatar: m.avatar }),
        grade: detectGrade(factionName, m.roles),
        points: stats?.points ?? 0,
        rank: stats?.rank ?? null,
        captures: stats?.captures ?? 0,
      };
    });

    // Sort by points desc
    result.sort((a, b) => b.points - a.points);

    res.json({ faction: factionName, members: result });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch faction members");
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
