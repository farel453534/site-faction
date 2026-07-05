import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = (import.meta.env["VITE_API_URL"] ?? "").replace(/\/$/, "");

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  faction: string | null;
  /** Highest grade role held within `faction`, or null. */
  grade: string | null;
  isResponsable: boolean;
  /** All factions this user manages as gérant (a user can hold several gérant roles). */
  gerantFactions: string[];
}

interface MeResponse {
  authenticated: boolean;
  user?: AuthUser;
  isAdmin?: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery<MeResponse>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (res.status === 401) return { authenticated: false };
      if (!res.ok) throw new Error("Impossible de charger la session");
      return (await res.json()) as MeResponse;
    },
    staleTime: 60_000,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const login = () => {
    window.location.href = `${API_BASE}/api/auth/discord/login`;
  };

  return {
    user: query.data?.authenticated ? (query.data.user ?? null) : null,
    isAdmin: query.data?.authenticated ? (query.data.isAdmin ?? false) : false,
    isLoading: query.isLoading,
    login,
    logout: () => logoutMutation.mutate(),
  };
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

export function usePlayerStats(enabled: boolean) {
  return useQuery<PlayerStats>({
    queryKey: ["me", "stats"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/me/stats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger vos statistiques");
      return (await res.json()) as PlayerStats;
    },
    staleTime: 30_000,
    retry: false,
  });
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string | null;
  points: number;
  rank: number;
  captures: number;
}

export function useAdminPlayers(enabled: boolean) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["admin", "players"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/players`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger le classement");
      const data = (await res.json()) as { players: LeaderboardEntry[] };
      return data.players;
    },
    staleTime: 30_000,
    retry: false,
  });
}

export function useAdminPlayerStats(userId: string | null) {
  return useQuery<PlayerStats>({
    queryKey: ["admin", "player", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/api/admin/player?userId=${encodeURIComponent(userId ?? "")}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Impossible de charger le joueur");
      const data = (await res.json()) as { userId: string; stats: PlayerStats };
      return data.stats;
    },
    staleTime: 30_000,
    retry: false,
  });
}

export interface AdminEntry {
  discordId: string;
  label: string | null;
  source: "env" | "db";
  removable: boolean;
  createdAt: string | null;
}

interface AdminListResponse {
  admins: AdminEntry[];
  dbConfigured: boolean;
  currentUserId: string | null;
}

export function useAdminList(enabled: boolean) {
  return useQuery<AdminListResponse>({
    queryKey: ["admin", "admins"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/admins`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger les administrateurs");
      return (await res.json()) as AdminListResponse;
    },
    staleTime: 15_000,
    retry: false,
  });
}

const ADMIN_ERRORS: Record<string, string> = {
  invalid_id: "L'identifiant Discord n'est pas valide (chiffres uniquement).",
  already_env_admin:
    "Cet utilisateur est déjà administrateur via la configuration.",
  env_admin_protected:
    "Cet administrateur est protégé et ne peut pas être retiré ici.",
  db_unavailable:
    "La base de données n'est pas configurée sur ce serveur.",
};

function adminErrorMessage(code: string | undefined): string {
  return (code && ADMIN_ERRORS[code]) || "Une erreur est survenue.";
}

export interface GerantMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  grade: string | null;
  points: number;
  rank: number | null;
  captures: number;
  steamId: string | null;
}

interface GerantMembersResponse {
  faction: string;
  members: GerantMember[];
}

export function useGerantMembers(enabled: boolean, faction: string | null) {
  return useQuery<GerantMembersResponse>({
    queryKey: ["gerant", "members", faction],
    enabled: enabled && !!faction,
    queryFn: async () => {
      const qs = faction ? `?faction=${encodeURIComponent(faction)}` : "";
      const res = await fetch(`${API_BASE}/api/gerant/members${qs}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (data.error === "bot_token_missing") {
          throw new Error("bot_token_missing");
        }
        throw new Error("Impossible de charger les membres");
      }
      return (await res.json()) as GerantMembersResponse;
    },
    staleTime: 60_000,
    retry: false,
  });
}

export interface TicketEntry {
  id: number;
  faction: string;
  category: string;
  subject: string;
  authorId: string;
  authorUsername: string;
  status: "open" | "claimed" | "closed";
  claimedBy: string | null;
  claimedByUsername: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface TicketAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface TicketMessageEntry {
  id: number;
  authorId: string;
  authorUsername: string;
  isStaff: boolean;
  body: string;
  attachments: TicketAttachment[] | null;
  createdAt: string;
}

export interface TicketParticipantEntry {
  id: number;
  discordId: string;
  label: string | null;
  addedBy: string;
  createdAt: string;
}

interface TicketDetailResponse {
  ticket: TicketEntry;
  isStaff: boolean;
  messages: TicketMessageEntry[];
  participants: TicketParticipantEntry[];
}

const TICKET_ERRORS: Record<string, string> = {
  no_faction: "Tu dois appartenir à une faction pour ouvrir un ticket.",
  invalid_category: "Catégorie invalide.",
  missing_fields: "Merci de remplir le sujet et le message.",
  db_unavailable: "La base de données n'est pas configurée sur ce serveur.",
  not_gerant_of_faction: "Tu ne gères pas cette faction.",
  forbidden: "Action non autorisée.",
  ticket_closed: "Ce ticket est fermé.",
  invalid_id: "L'identifiant Discord n'est pas valide (chiffres uniquement).",
  missing_body: "Le message ne peut pas être vide.",
};

function ticketErrorMessage(code: string | undefined): string {
  return (code && TICKET_ERRORS[code]) || "Une erreur est survenue.";
}

async function assertTicketResponseOk(
  res: Response,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> {
  if (res.ok) return;
  if (res.status === 401) {
    queryClient.setQueryData(["auth", "me"], { authenticated: false });
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    throw new Error("Ta session a expiré, reconnecte-toi puis réessaie.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  throw new Error(ticketErrorMessage(data.error));
}

export function useMyTickets(enabled: boolean) {
  return useQuery<TicketEntry[]>({
    queryKey: ["tickets", "mine"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger tes tickets");
      const data = (await res.json()) as { tickets: TicketEntry[] };
      return data.tickets;
    },
    staleTime: 15_000,
    retry: false,
  });
}

export function useFactionTickets(faction: string | null) {
  return useQuery<TicketEntry[]>({
    queryKey: ["tickets", "faction", faction],
    enabled: !!faction,
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/api/tickets?faction=${encodeURIComponent(faction ?? "")}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Impossible de charger les tickets");
      const data = (await res.json()) as { tickets: TicketEntry[] };
      return data.tickets;
    },
    staleTime: 15_000,
    retry: false,
  });
}

export function useArchivedTickets(enabled: boolean) {
  return useQuery<TicketEntry[]>({
    queryKey: ["tickets", "archives"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/tickets?archives=1`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger les archives");
      const data = (await res.json()) as { tickets: TicketEntry[] };
      return data.tickets;
    },
    staleTime: 15_000,
    retry: false,
  });
}

export function useTicketDetail(ticketId: number | null) {
  return useQuery<TicketDetailResponse>({
    queryKey: ["tickets", "detail", ticketId],
    enabled: ticketId !== null,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/tickets/${ticketId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger le ticket");
      return (await res.json()) as TicketDetailResponse;
    },
    staleTime: 5_000,
    retry: false,
  });
}

function invalidateTicket(
  queryClient: ReturnType<typeof useQueryClient>,
  ticketId: number,
) {
  queryClient.invalidateQueries({ queryKey: ["tickets"] });
  queryClient.invalidateQueries({ queryKey: ["tickets", "detail", ticketId] });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      category: string;
      subject: string;
      body: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await assertTicketResponseOk(res, queryClient);
      return (await res.json()) as { ticket: TicketEntry };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useAddTicketMessage(ticketId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { body: string; attachments?: TicketAttachment[] }) => {
      const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: input.body, attachments: input.attachments }),
      });
      await assertTicketResponseOk(res, queryClient);
    },
    onSuccess: () => invalidateTicket(queryClient, ticketId),
  });
}

export function useUploadTicketAttachment(ticketId: number) {
  return useMutation({
    mutationFn: async (file: File): Promise<TicketAttachment> => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/attachments`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (data.error === "file_type_not_allowed") throw new Error("Type de fichier non autorisé.");
        if (data.error === "no_file") throw new Error("Aucun fichier sélectionné.");
        throw new Error("Erreur lors de l'envoi du fichier.");
      }
      const json = (await res.json()) as { attachment: TicketAttachment };
      return json.attachment;
    },
  });
}

function useTicketAction(ticketId: number, action: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${API_BASE}/api/tickets/${ticketId}/${action}`,
        { method: "POST", credentials: "include" },
      );
      await assertTicketResponseOk(res, queryClient);
    },
    onSuccess: () => invalidateTicket(queryClient, ticketId),
  });
}

export function useClaimTicket(ticketId: number) {
  return useTicketAction(ticketId, "claim");
}
export function useUnclaimTicket(ticketId: number) {
  return useTicketAction(ticketId, "unclaim");
}
export function useCloseTicket(ticketId: number) {
  return useTicketAction(ticketId, "close");
}
export function useReopenTicket(ticketId: number) {
  return useTicketAction(ticketId, "reopen");
}

export function useAddTicketParticipant(ticketId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { discordId: string; label?: string }) => {
      const res = await fetch(
        `${API_BASE}/api/tickets/${ticketId}/participants`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      await assertTicketResponseOk(res, queryClient);
    },
    onSuccess: () => invalidateTicket(queryClient, ticketId),
  });
}

export function useRemoveTicketParticipant(ticketId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (discordId: string) => {
      const res = await fetch(
        `${API_BASE}/api/tickets/${ticketId}/participants/${encodeURIComponent(discordId)}`,
        { method: "DELETE", credentials: "include" },
      );
      await assertTicketResponseOk(res, queryClient);
    },
    onSuccess: () => invalidateTicket(queryClient, ticketId),
  });
}

// ─── Blacklist (gérant) ──────────────────────────────────────────────────────

export interface BlacklistEntry {
  id: number;
  faction: string;
  discordId: string;
  playerName: string;
  reason: string | null;
  addedBy: string;
  addedByUsername: string;
  createdAt: string;
}

interface BlacklistResponse {
  faction: string;
  entries: BlacklistEntry[];
  dbConfigured: boolean;
}

const BL_ERRORS: Record<string, string> = {
  invalid_discord_id: "L'identifiant Discord doit contenir 15 à 25 chiffres.",
  missing_player_name: "Le nom du joueur est requis.",
  db_unavailable: "La base de données n'est pas configurée.",
  not_gerant_of_faction: "Tu ne gères pas cette faction.",
  not_found: "Entrée introuvable.",
};
function blError(code: string | undefined) {
  return (code && BL_ERRORS[code]) ?? "Une erreur est survenue.";
}

export function useBlacklist(enabled: boolean, faction: string | null) {
  return useQuery<BlacklistResponse>({
    queryKey: ["gerant", "blacklist", faction],
    enabled: enabled && !!faction,
    queryFn: async () => {
      const qs = faction ? `?faction=${encodeURIComponent(faction)}` : "";
      const res = await fetch(`${API_BASE}/api/gerant/blacklist${qs}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(blError(data.error));
      }
      return (await res.json()) as BlacklistResponse;
    },
    staleTime: 15_000,
    retry: false,
  });
}

export function useAddBlacklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      faction: string;
      discordId: string;
      playerName: string;
      reason?: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/gerant/blacklist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(blError(data.error));
      }
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["gerant", "blacklist", vars.faction] });
    },
  });
}

export function useRemoveBlacklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, faction }: { id: number; faction: string }) => {
      const res = await fetch(
        `${API_BASE}/api/gerant/blacklist/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(blError(data.error));
      }
      return faction;
    },
    onSuccess: (faction) => {
      queryClient.invalidateQueries({ queryKey: ["gerant", "blacklist", faction] });
    },
  });
}

// ─── Panel users (admin) ──────────────────────────────────────────────────────

export interface PanelUser {
  discordId: string;
  username: string;
  globalName: string | null;
  faction: string | null;
  steamId: string | null;
  /** Visible uniquement pour le responsable (undefined pour les autres admins). */
  lastIp?: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

interface PanelUsersResponse {
  users: PanelUser[];
  dbConfigured: boolean;
}

export function usePanelUsers(enabled: boolean) {
  return useQuery<PanelUsersResponse>({
    queryKey: ["admin", "panel-users"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/panel-users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger les membres connectés");
      return (await res.json()) as PanelUsersResponse;
    },
    staleTime: 30_000,
    retry: false,
  });
}

// ─── Role members ────────────────────────────────────────────────────────────

export interface RoleMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface RoleMembersResponse {
  roleId: string;
  members: RoleMember[];
}

export function useRoleMembers(roleId: string, enabled: boolean) {
  return useQuery<RoleMembersResponse>({
    queryKey: ["admin", "role-members", roleId],
    enabled,
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/api/admin/role-members?roleId=${encodeURIComponent(roleId)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Impossible de charger les membres du rôle");
      return (await res.json()) as RoleMembersResponse;
    },
    staleTime: 60_000,
    retry: false,
  });
}

// ─── My profile (steamId) ────────────────────────────────────────────────────

interface MyProfileResponse {
  steamId: string | null;
  dbConfigured: boolean;
}

export function useMyProfile(enabled: boolean) {
  return useQuery<MyProfileResponse>({
    queryKey: ["me", "profile"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/me/profile`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger le profil");
      return (await res.json()) as MyProfileResponse;
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useUpdateSteamId() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (steamId: string | null) => {
      const res = await fetch(`${API_BASE}/api/me/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const msgs: Record<string, string> = {
          invalid_steam_id: "Steam ID invalide — entre ton ID 32-bit (ex. 123456789) ou 64-bit (17 chiffres).",
          db_unavailable: "La base de données n'est pas configurée.",
        };
        throw new Error(msgs[data.error ?? ""] ?? "Une erreur est survenue.");
      }
      return (await res.json()) as { ok: boolean; steamId: string | null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "profile"] });
    },
  });
}

export function useAddAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { discordId: string; label?: string }) => {
      const res = await fetch(`${API_BASE}/api/admin/admins`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(adminErrorMessage(data.error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    },
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (discordId: string) => {
      const res = await fetch(
        `${API_BASE}/api/admin/admins/${encodeURIComponent(discordId)}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(adminErrorMessage(data.error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    },
  });
}
