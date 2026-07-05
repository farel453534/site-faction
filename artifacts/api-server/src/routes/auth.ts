import { Router, type IRouter, type Request } from "express";
import { randomBytes } from "node:crypto";
import {
  buildAuthorizeUrl,
  buildAvatarUrl,
  exchangeCode,
  fetchDiscordUser,
  fetchDiscordGuildMember,
  detectFaction,
  detectGrade,
  detectGerantFactions,
  RESPONSABLE_ID,
  type DiscordUser,
} from "../lib/discord";
import { SESSION_COOKIE, readSession, type SessionUser } from "../lib/session";
import { isAdmin } from "../lib/admin";
import { getBaseUrl } from "../lib/request-url";

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
    const accessToken = await exchangeCode({
      code,
      redirectUri: getRedirectUri(req),
    });
    const [user, guildMember] = await Promise.all([
      fetchDiscordUser(accessToken),
      fetchDiscordGuildMember(
        accessToken,
        process.env["DISCORD_GUILD_ID"] ?? "1062740125475426404",
      ).catch(() => null),
    ]);
    const roles = guildMember?.roles ?? [];
    const faction = detectFaction(roles);
    const session: SessionUser = {
      id: (user as DiscordUser).id,
      username: (user as DiscordUser).username,
      global_name: (user as DiscordUser).global_name ?? null,
      avatar: (user as DiscordUser).avatar ?? null,
      faction,
      grade: detectGrade(faction, roles),
      isResponsable: (user as DiscordUser).id === RESPONSABLE_ID,
      gerantFactions: detectGerantFactions(roles),
    };
    res.cookie(SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      secure: true,
      sameSite,
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
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
      gerantFactions: user.gerantFactions ?? [],
    },
    isAdmin: await isAdmin(user.id),
  });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

export default router;
