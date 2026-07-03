import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultContent, type SiteContent } from "@workspace/content";

const API_BASE = (import.meta.env["VITE_API_URL"] ?? "").replace(/\/$/, "");

// Full site content. Starts from the bundled static seed (placeholderData) so the
// site renders instantly and still works if the API is unreachable, then swaps to
// the server response (static seed + admin overlay from the DB).
export function useContent() {
  return useQuery<SiteContent>({
    queryKey: ["content"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/content`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger le contenu");
      return (await res.json()) as SiteContent;
    },
    placeholderData: defaultContent(),
    staleTime: 60_000,
    retry: false,
  });
}

const CONTENT_ERRORS: Record<string, string> = {
  db_unavailable:
    "L'édition n'est pas disponible : la base de données n'est pas configurée sur ce serveur.",
  invalid_title: "Le titre est vide ou trop long.",
  invalid_markdown: "Le contenu est trop long.",
  invalid_slug: "Élément introuvable.",
  invalid_key: "Élément introuvable.",
  forbidden: "Vous n'avez pas les droits nécessaires.",
};

function contentErrorMessage(code: string | undefined): string {
  return (code && CONTENT_ERRORS[code]) || "Une erreur est survenue.";
}

export interface ContentWrite {
  method: "PUT" | "DELETE";
  path: string;
  body?: unknown;
}

export function useContentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ method, path, body }: ContentWrite) => {
      const res = await fetch(`${API_BASE}/api/admin/content/${path}`, {
        method,
        credentials: "include",
        ...(body !== undefined
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          : {}),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(contentErrorMessage(data.error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}
