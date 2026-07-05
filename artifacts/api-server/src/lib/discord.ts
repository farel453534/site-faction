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
  { id: "1062740125475426411", name: "Mage-Indépendant" },
  { id: "1062740125475426409", name: "Professeur" },
];

// Gérant roles: each gérant manages a specific faction
export const GERANT_FACTION_ROLES: Array<{ id: string; faction: string }> = [
  { id: "1399144149579731164", faction: "Mangemort" },
  { id: "1399144243381010442", faction: "Auror" },
  { id: "1399144244169543791", faction: "Ministère" },
  { id: "1399144394694852670", faction: "Mage-Indépendant" },
  // TODO: remplace "PROFESSEUR_GERANT_ROLE_ID" par l'ID du rôle Discord Gérant Professeur
  { id: "PROFESSEUR_GERANT_ROLE_ID", faction: "Professeur" },
];

export function detectFaction(roles: string[]): string | null {
  for (const { id, name } of FACTION_ROLES) {
    if (roles.includes(id)) return name;
  }
  return null;
}

// Grade role IDs per faction, ordered from highest to lowest rank
// (order matters: first match wins, so the highest grade held is returned).
export const GRADE_ROLES: Array<{
  id: string;
  name: string;
  faction: string;
}> = [
  // Mangemort
  { id: "1062740125605449872", name: "Maître Mangemort", faction: "Mangemort" },
  { id: "1062740125605449871", name: "Membre du Conseil", faction: "Mangemort" },
  { id: "1062740125605449870", name: "Mangemort Expérimenté", faction: "Mangemort" },
  { id: "1062740125605449869", name: "Mangemort", faction: "Mangemort" },
  { id: "1062740125605449868", name: "Recrue Mangemort", faction: "Mangemort" },
  // Auror
  { id: "1062740125517348874", name: "Chef Auror", faction: "Auror" },
  { id: "1062740125496385546", name: "Commandant Auror", faction: "Auror" },
  { id: "1062740125496385545", name: "Auror Expérimenté", faction: "Auror" },
  { id: "1062740125496385544", name: "Auror", faction: "Auror" },
  { id: "1062740125496385543", name: "Recrue Auror", faction: "Auror" },
  // Ministère
  { id: "1062740125559300161", name: "Ministre de la Magie", faction: "Ministère" },
  { id: "1074935011716903005", name: "Ministre Adjoint", faction: "Ministère" },
  { id: "1062740125559300160", name: "Secrétaire d'état", faction: "Ministère" },
  { id: "1062740125559300159", name: "Sous-Secrétaire d'état", faction: "Ministère" },
  { id: "1062740125559300157", name: "Directeur de Département", faction: "Ministère" },
  { id: "1062740125559300156", name: "Sous-Directeur de Département", faction: "Ministère" },
  { id: "1062740125534146690", name: "Membre Expérimenté du Ministère", faction: "Ministère" },
  { id: "1062740125534146689", name: "Membre du Ministère", faction: "Ministère" },
  { id: "1062740125534146688", name: "Nouveau Membre du Ministère", faction: "Ministère" },
];

/** Returns the highest grade role held within a given faction, or null. */
export function detectGrade(faction: string | null, roles: string[]): string | null {
  if (!faction) return null;
  for (const { id, name, faction: gradeFaction } of GRADE_ROLES) {
    if (gradeFaction === faction && roles.includes(id)) return name;
  }
  return null;
}

/** Returns ALL factions the user is gérant of (a user can hold several gérant roles). */
export function detectGerantFactions(roles: string[]): string[] {
  const factions = new Set<string>();
  for (const { id, faction } of GERANT_FACTION_ROLES) {
    if (roles.includes(id)) factions.add(faction);
  }
  return [...factions];
}

export interface GuildMemberSummary {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  roles: string[];
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
      roles: m.roles,
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

// Channel where every plainte/demande is logged, visible to the Responsable/admins.
export const TICKETS_LOG_CHANNEL_ID = "1520876965953929326";

function getBotToken(): string {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) throw new Error("DISCORD_BOT_TOKEN not configured");
  return token;
}

/** Sends a message to a channel using the bot token. */
export async function sendChannelMessage(
  channelId: string,
  content: string,
): Promise<void> {
  const botToken = getBotToken();
  const resp = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Discord channel message failed: ${resp.status} ${text}`);
  }
}

/** Sends a direct message to a user using the bot token (opens a DM channel first). */
export async function sendDirectMessage(
  userId: string,
  content: string,
): Promise<void> {
  const botToken = getBotToken();
  const dmResp = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: userId }),
  });
  if (!dmResp.ok) {
    const text = await dmResp.text();
    throw new Error(`Discord DM channel creation failed: ${dmResp.status} ${text}`);
  }
  const dmChannel = (await dmResp.json()) as { id: string };

  const msgResp = await fetch(
    `${DISCORD_API}/channels/${dmChannel.id}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    },
  );
  if (!msgResp.ok) {
    const text = await msgResp.text();
    throw new Error(`Discord DM send failed: ${msgResp.status} ${text}`);
  }
}

/**
 * Notifies everyone who should know about a new ticket:
 * - DMs every gérant of the ticket's faction (their gérant role, not other factions').
 * - Posts a summary in the shared tickets log channel (visible to Responsable/admins).
 * DM failures for individual gérants are swallowed (e.g. DMs closed) so one failure
 * doesn't block the others or the channel log.
 */
export async function notifyNewTicket(ticket: {
  id: number;
  faction: string;
  category: string;
  subject: string;
  authorUsername: string;
  url?: string;
}): Promise<void> {
  const guildId = process.env["DISCORD_GUILD_ID"] ?? "1062740125475426404";
  const label = ticket.category === "plainte" ? "Plainte" : "Demande";
  const summary =
    `📩 Nouvelle **${label}** — Faction **${ticket.faction}**\n` +
    `Auteur : ${ticket.authorUsername}\n` +
    `Sujet : ${ticket.subject}\n` +
    `Ticket #${ticket.id}` +
    (ticket.url ? `\n🔗 ${ticket.url}` : "");

  const gerantRole = GERANT_FACTION_ROLES.find(
    (g) => g.faction === ticket.faction,
  );
  if (gerantRole) {
    try {
      const gerants = await fetchFactionMembers(guildId, gerantRole.id);
      await Promise.all(
        gerants.map((g) =>
          sendDirectMessage(g.id, summary).catch((err) => {
            console.error(`Failed to DM gérant ${g.id}:`, err);
          }),
        ),
      );
    } catch (err) {
      console.error("Failed to fetch/notify gérants for new ticket:", err);
    }
  }

  try {
    await sendChannelMessage(TICKETS_LOG_CHANNEL_ID, summary);
  } catch (err) {
    console.error("Failed to post ticket to log channel:", err);
  }
}
