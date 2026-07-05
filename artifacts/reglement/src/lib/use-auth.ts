import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = (import.meta.env["VITE_API_URL"] ?? "").replace(/\/$/, "");

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  faction: string | null;
  isResponsable: boolean;
  /** Faction this user manages as gérant, or null if not a gérant. */
  gerantFaction: string | null;
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
  points: number;
  rank: number | null;
  captures: number;
}

interface GerantMembersResponse {
  faction: string;
  members: GerantMember[];
}

export function useGerantMembers(enabled: boolean) {
  return useQuery<GerantMembersResponse>({
    queryKey: ["gerant", "members"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/gerant/members`, {
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
