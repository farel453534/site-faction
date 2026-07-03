import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env["GAME_DATABASE_URL"];
    if (!connectionString) {
      throw new Error("GAME_DATABASE_URL environment variable is required.");
    }
    pool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
    });
  }
  return pool;
}

function getGuildId(): string {
  return process.env["DISCORD_GUILD_ID"] ?? "1062740125475426404";
}

export interface CaptureEntry {
  captureNumero: string | null;
  dateEvent: string | null;
  lieu: string | null;
  victime: string | null;
  agresseur: string | null;
  submittedAt: string | null;
}

export interface PlayerStats {
  reputation: { points: number; rank: number | null; totalPlayers: number };
  captures: { count: number; recent: CaptureEntry[] };
}

export async function getPlayerStats(discordId: string): Promise<PlayerStats> {
  const db = getPool();
  const guildId = getGuildId();

  const repRes = await db.query<{ points: number }>(
    `SELECT points FROM reputation WHERE guild_id = $1 AND user_id = $2 LIMIT 1`,
    [guildId, discordId],
  );
  const points = repRes.rows[0]?.points ?? 0;

  const totalRes = await db.query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM reputation WHERE guild_id = $1`,
    [guildId],
  );
  const totalPlayers = totalRes.rows[0]?.n ?? 0;

  let rank: number | null = null;
  if (repRes.rows[0]) {
    const rankRes = await db.query<{ rank: number }>(
      `SELECT COUNT(*)::int + 1 AS rank FROM reputation WHERE guild_id = $1 AND points > $2`,
      [guildId, points],
    );
    rank = rankRes.rows[0]?.rank ?? null;
  }

  const capCountRes = await db.query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM recensement
     WHERE guild_id = $1 AND (victime = '<@' || $2 || '>' OR victime = '<@!' || $2 || '>')`,
    [guildId, discordId],
  );
  const captureCount = capCountRes.rows[0]?.n ?? 0;

  const recentRes = await db.query<{
    capture_numero: string | null;
    date_event: string | null;
    lieu: string | null;
    victime: string | null;
    agresseur: string | null;
    submitted_at: Date | null;
  }>(
    `SELECT capture_numero, date_event, lieu, victime, agresseur, submitted_at
     FROM recensement
     WHERE guild_id = $1 AND (victime = '<@' || $2 || '>' OR victime = '<@!' || $2 || '>')
     ORDER BY submitted_at DESC
     LIMIT 10`,
    [guildId, discordId],
  );

  const recent: CaptureEntry[] = recentRes.rows.map((r) => ({
    captureNumero: r.capture_numero ?? null,
    dateEvent: r.date_event ?? null,
    lieu: r.lieu ?? null,
    victime: r.victime ?? null,
    agresseur: r.agresseur ?? null,
    submittedAt: r.submitted_at ? new Date(r.submitted_at).toISOString() : null,
  }));

  return {
    reputation: { points, rank, totalPlayers },
    captures: { count: captureCount, recent },
  };
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string | null;
  points: number;
  rank: number;
  captures: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const db = getPool();
  const guildId = getGuildId();

  const res = await db.query<{
    user_id: string;
    display_name: string | null;
    points: number;
    rank: number;
    captures: number;
  }>(
    `SELECT r.user_id, r.display_name, r.points,
            (RANK() OVER (ORDER BY r.points DESC))::int AS rank,
            COALESCE(c.n, 0)::int AS captures
     FROM reputation r
     LEFT JOIN (
       SELECT substring(victime from '[0-9]+') AS uid, COUNT(*)::int AS n
       FROM recensement
       WHERE guild_id = $1 AND victime ~ '^<@!?[0-9]+>$'
       GROUP BY 1
     ) c ON c.uid = r.user_id
     WHERE r.guild_id = $1
     ORDER BY r.points DESC, r.user_id ASC`,
    [guildId],
  );

  return res.rows.map((r) => ({
    userId: r.user_id,
    displayName: r.display_name,
    points: r.points,
    rank: r.rank,
    captures: r.captures,
  }));
}
