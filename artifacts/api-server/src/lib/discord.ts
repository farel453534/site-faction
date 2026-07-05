const DISCORD_API = "https://discord.com/api";

export function getClientId(): string {
  return process.env["DISCORD_CLIENT_ID"] ?? "1499583925687812137";
}

function getClientSecret(): string {
  const secret = process.env["DISCORD_CLIENT_SECRET"];
  if (!secret) {
    throw new Error("DISCORD_CLIENT_SECRET environment variable is required.");
  }
  return secret;
}

export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

// The one Responsable (owner/super-admin) — identified by Discord user ID
export const RESPONSABLE_ID = "1521612399445147829";

// Faction role IDs → faction name (order matters: first match wins)
export const FACTION_ROLES: Array<{ id: string; name: string }> = [
  { id: "1062740125605449874", name: "Mangemort" },
  { id: "1062740125517348875", name: "Auror" },
  { id: "1062740125559300163", name: "Ministère" },
  { id: "1399123619145187328", name: "Mage-Indépendant" },
  { id: "1062740125475426409", name: "Professeur" },
];

// Gérant roles: each gérant manages a specific faction
export const GERANT_FACTION_ROLES: Array<{ id: string; faction: string }> = [
  { id: "1399144149579731164", faction: "Mangemort" },
  { id: "1399144243381010442", faction: "Auror" },
  { id: "1399144244169543791", faction: "Ministère" },
  { id: "1399144394694852670", faction: "Mage-Indépendant" },
];

export function detectFaction(roles: string[]): string | null {
  for (const { id, name } of FACTION_ROLES) {
    if (roles.includes(id)) return name;
  }
  return null;
}

/** Returns the faction name the user is gérant of, or null. */
export function detectGerantFaction(roles: string[]): string | null {
  for (const { id, faction } of GERANT_FACTION_ROLES) {
    if (roles.includes(id)) return faction;
  }
  return null;
}

export interface GuildMemberSummary {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
}

type RawMember = {
  roles: string[];
  user: {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  };
};

/**
 * Fetches ALL guild members with a specific role using the bot token.
 * Paginates through the full member list (1000 per page) to cover large guilds.
 * Requires DISCORD_BOT_TOKEN env var.
 */
export async function fetchFactionMembers(
  guildId: string,
  roleId: string,
): Promise<GuildMemberSummary[]> {
  const botToken = process.env["DISCORD_BOT_TOKEN"];
  if (!botToken) throw new Error("DISCORD_BOT_TOKEN not configured");

  const all: RawMember[] = [];
  let after: string | null = null;

  // Paginate until Discord returns fewer than 1000 (last page)
  while (true) {
    const url = new URL(`${DISCORD_API}/guilds/${guildId}/members`);
    url.searchParams.set("limit", "1000");
    if (after) url.searchParams.set("after", after);

    const resp = await fetch(url.toString(), {
      headers: { Authorization: `Bot ${botToken}` },
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(
        `Discord guild members fetch failed: ${resp.status} ${text}`,
      );
    }

    const page = (await resp.json()) as RawMember[];
    all.push(...page);

    if (page.length < 1000) break; // last page
    after = page[page.length - 1]!.user.id;
  }

  return all
    .filter((m) => m.user && m.roles.includes(roleId))
    .map((m) => ({
      id: m.user.id,
      username: m.user.username,
      globalName: m.user.global_name,
      avatar: m.user.avatar,
    }));
}

export interface DiscordGuildMember {
  roles: string[];
}

export async function fetchDiscordGuildMember(
  accessToken: string,
  guildId: string,
): Promise<DiscordGuildMember | null> {
  const resp = await fetch(
    `${DISCORD_API}/users/@me/guilds/${guildId}/member`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  // 404 = user not in the guild
  if (resp.status === 404 || resp.status === 403) return null;
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Discord guild member fetch failed: ${resp.status} ${text}`);
  }
  return (await resp.json()) as DiscordGuildMember;
}

export function buildAuthorizeUrl(params: {
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(`${DISCORD_API}/oauth2/authorize`);
  url.searchParams.set("client_id", getClientId());
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify guilds.members.read");
  url.searchParams.set("state", params.state);
  return url.toString();
}

export async function exchangeCode(params: {
  code: string;
  redirectUri: string;
}): Promise<string> {
  const body = new URLSearchParams({
    client_id: getClientId(),
    client_secret: getClientSecret(),
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
  });

  const resp = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Discord token exchange failed: ${resp.status} ${text}`);
  }

  const json = (await resp.json()) as { access_token: string };
  return json.access_token;
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const resp = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Discord user fetch failed: ${resp.status} ${text}`);
  }

  return (await resp.json()) as DiscordUser;
}

export function buildAvatarUrl(user: {
  id: string;
  avatar: string | null;
}): string | null {
  if (!user.avatar) return null;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}
