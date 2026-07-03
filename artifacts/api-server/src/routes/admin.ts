import { Router, type IRouter } from "express";
import { requireAdmin } from "../lib/admin";
import { getLeaderboard, getPlayerStats } from "../lib/game-db";

const router: IRouter = Router();

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
  const userId = typeof req.query["userId"] === "string" ? req.query["userId"] : "";
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

export default router;
