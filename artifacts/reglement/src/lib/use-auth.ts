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
    isLoading: query.isLoading,
    login,
    logout: () => logoutMutation.mutate(),
  };
}
