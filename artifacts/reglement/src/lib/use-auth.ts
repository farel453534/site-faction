import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = (import.meta.env["VITE_API_URL"] ?? "").replace(/\/$/, "");

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
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
