import { Router, type IRouter, type Request } from "express";
import { randomBytes } from "node:crypto";
import {
  buildAuthorizeUrl,
  buildAvatarUrl,
  exchangeCode,
  refreshDiscordToken,
  fetchDiscordUser,
  fetchDiscordGuildMember,
  detectFaction,
  detectGrade,
  detectGerantFactions,
  RESPONSABLE_ID,
  FACTION_ROLES,
  type DiscordUser,
} from "../lib/discord";
import { SESSION_COOKIE, readSession, type SessionUser } from "../lib/session";
import { isAdmin } from "../lib/admin";
import { isGeneralStaff } from "../lib/general-staff";
import { getBaseUrl } from "../lib/request-url";
import { upsertUserProfile, touchLastSeen } from "../lib/user-profiles";

const router: IRouter = Router();

const STATE_COOKIE = "mss_oauth_state";
const sameSite =
  (process.env["COOKIE_SAMESITE"] as "lax" | "none" | "strict" | undefined) ??
  "lax";

function getRedirectUri(req: Request): string {
  return (
    process.env["DISCORD_REDIRECT_URI"] ??
    `${getBaseUrl(req)}/api/auth/discord/callback`
  );
}

function getFrontendUrl(req: Request): string {
  return process.env["FRONTEND_URL"] ?? `${getBaseUrl(req)}/`;
}

router.get("/auth/discord/login", (req, res) => {
  const state = randomBytes(16).toString("hex");
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite,
    signed: true,
    maxAge: 10 * 60 * 1000,
    path: "/",
  });
  res.redirect(buildAuthorizeUrl({ redirectUri: getRedirectUri(req), state }));
});

router.get("/auth/discord/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const frontend = getFrontendUrl(req);

  if (error) {
    return res.redirect(`${frontend}?login=cancelled`);
  }

  const savedState = req.signedCookies?.[STATE_COOKIE] as string | undefined;
  res.clearCookie(STATE_COOKIE, { path: "/" });

  if (
    !code ||
    typeof code !== "string" ||
    !state ||
    typeof state !== "string" ||
    state !== savedState
  ) {
    req.log.warn("Discord OAuth callback: invalid state or code");
    return res.redirect(`${frontend}?login=error`);
  }

  try {
    const { accessToken, refreshToken } = await exchangeCode({
      code,
      redirectUri: getRedirectUri(req),
    });
    // fetchDiscordGuildMember returns null for 404/403 (not in guild)
    // and throws for real Discord API failures (which bubble to the outer catch → ?login=error).
    const [user, guildMember] = await Promise.all([
      fetchDiscordUser(accessToken),
      fetchDiscordGuildMember(
        accessToken,
        process.env["DISCORD_GUILD_ID"] ?? "1062740125475426404",
      ),
    ]);
    const roles = guildMember?.roles ?? [];
    const faction = detectFaction(roles);
    const userId = (user as DiscordUser).id;
    const isResponsable = userId === RESPONSABLE_ID;
    // The Responsable manages every faction, regardless of which gérant roles
    // they personally hold on Discord — full oversight of all tickets/members.
    const gerantFactions = isResponsable
      ? FACTION_ROLES.map((f) => f.name)
      : detectGerantFactions(roles);
    const generalStaff = isResponsable ? false : await isGeneralStaff(userId);
    const session: SessionUser = {
      id: userId,
      username: (user as DiscordUser).username,
      global_name: (user as DiscordUser).global_name ?? null,
      avatar: (user as DiscordUser).avatar ?? null,
      faction,
      grade: detectGrade(faction, roles),
      isResponsable,
      isGeneralStaff: generalStaff,
      gerantFactions,
      isGuildMember: !!guildMember,
      discordRefreshToken: refreshToken,
    };
    res.cookie(SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      secure: true,
      sameSite,
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    // Fire-and-forget: record this user in the panel registry (IP included)
    const clientIp =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
      req.socket?.remoteAddress ??
      null;
    void upsertUserProfile(session, clientIp);
    return res.redirect(frontend);
  } catch (err) {
    req.log.error({ err }, "Discord OAuth callback failed");
    return res.redirect(`${frontend}?login=error`);
  }
});

router.get("/auth/me", async (req, res) => {
  const user = readSession(req);
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }
  void touchLastSeen(user.id);
  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.global_name || user.username,
      avatarUrl: buildAvatarUrl(user),
      faction: user.faction ?? null,
      grade: user.grade ?? null,
      isResponsable: user.isResponsable ?? false,
      isGeneralStaff: user.isGeneralStaff ?? false,
      gerantFactions: user.gerantFactions ?? [],
      isGuildMember: user.isGuildMember ?? false,
    },
    isAdmin: await isAdmin(user.id),
  });
});

/**
 * POST /api/auth/refresh
 * Re-fetches the user's Discord guild roles using the stored refresh token
 * and rewrites the session cookie with up-to-date data — no re-login needed.
 */
router.post("/auth/refresh", async (req, res) => {
  const current = readSession(req);
  if (!current) {
    return res.status(401).json({ ok: false, error: "not_authenticated" });
  }
  if (!current.discordRefreshToken) {
    // Old session (pre-refresh-token) — tell the client to do a full re-login
    return res.status(200).json({ ok: false, error: "no_refresh_token" });
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } = await refreshDiscordToken(
      current.discordRefreshToken,
    );

    const [user, guildMember] = await Promise.all([
      fetchDiscordUser(accessToken),
      fetchDiscordGuildMember(
        accessToken,
        process.env["DISCORD_GUILD_ID"] ?? "1062740125475426404",
      ),
    ]);

    const roles = guildMember?.roles ?? [];
    const faction = detectFaction(roles);
    const userId = (user as DiscordUser).id;
    const isResponsable = userId === RESPONSABLE_ID;
    const gerantFactions = isResponsable
      ? FACTION_ROLES.map((f) => f.name)
      : detectGerantFactions(roles);
    const generalStaff = isResponsable ? false : await isGeneralStaff(userId);

    const updated: SessionUser = {
      id: userId,
      username: (user as DiscordUser).username,
      global_name: (user as DiscordUser).global_name ?? null,
      avatar: (user as DiscordUser).avatar ?? null,
      faction,
      grade: detectGrade(faction, roles),
      isResponsable,
      isGeneralStaff: generalStaff,
      gerantFactions,
      isGuildMember: !!guildMember,
      discordRefreshToken: newRefreshToken,
    };

    res.cookie(SESSION_COOKIE, JSON.stringify(updated), {
      httpOnly: true,
      secure: true,
      sameSite,
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ ok: true });
  } catch (err) {
    req.log.warn({ err }, "Session refresh failed");
    return res.status(200).json({ ok: false, error: "refresh_failed" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

export default router;
