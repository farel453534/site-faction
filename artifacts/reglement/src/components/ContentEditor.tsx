import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Prose } from "@/components/Prose";
import { useContentMutation } from "@/lib/use-content";

export type EditorTarget =
  | { kind: "home-meta"; title: string }
  | {
      kind: "home-card";
      key: string;
      title: string;
      keywords: string;
      markdown: string;
    }
  | { kind: "page"; group: string; page: string; title: string; markdown: string }
  | { kind: "group"; group: string; title: string };

function pathFor(t: EditorTarget): string {
  switch (t.kind) {
    case "home-meta":
      return "home/meta";
    case "home-card":
      return `home/card/${encodeURIComponent(t.key)}`;
    case "page":
      return `page/${encodeURIComponent(t.group)}/${encodeURIComponent(t.page)}`;
    case "group":
      return `group/${encodeURIComponent(t.group)}`;
  }
}

function headingFor(t: EditorTarget): string {
  switch (t.kind) {
    case "home-meta":
      return "Modifier le titre de l'accueil";
    case "home-card":
      return "Modifier la carte";
    case "page":
      return "Modifier la page";
    case "group":
      return "Modifier la catégorie";
  }
}

const hasKeywords = (t: EditorTarget): t is Extract<EditorTarget, { kind: "home-card" }> =>
  t.kind === "home-card";
const hasMarkdown = (
  t: EditorTarget,
): t is Extract<EditorTarget, { kind: "home-card" | "page" }> =>
  t.kind === "home-card" || t.kind === "page";

export function ContentEditor({
  target,
  open,
  onOpenChange,
}: {
  target: EditorTarget;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { toast } = useToast();
  const mutation = useContentMutation();

  const [title, setTitle] = useState(target.title);
  const [keywords, setKeywords] = useState(
    hasKeywords(target) ? target.keywords : "",
  );
  const [markdown, setMarkdown] = useState(
    hasMarkdown(target) ? target.markdown : "",
  );
  const [confirmReset, setConfirmReset] = useState(false);

  // Re-seed the form whenever the modal is (re)opened for a target.
  useEffect(() => {
    if (open) {
      setTitle(target.title);
      setKeywords(hasKeywords(target) ? target.keywords : "");
      setMarkdown(hasMarkdown(target) ? target.markdown : "");
      setConfirmReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const path = pathFor(target);

  const save = () => {
    const body: Record<string, string> = { title: title.trim() };
    if (hasKeywords(target)) body["keywords"] = keywords.trim();
    if (hasMarkdown(target)) body["markdown"] = markdown;
    mutation.mutate(
      { method: "PUT", path, body },
      {
        onSuccess: () => {
          toast({ title: "Modifications enregistrées" });
          onOpenChange(false);
        },
        onError: (err) =>
          toast({
            title: "Échec de l'enregistrement",
            description: err instanceof Error ? err.message : undefined,
            variant: "destructive",
          }),
      },
    );
  };

  const reset = () => {
    mutation.mutate(
      { method: "DELETE", path },
      {
        onSuccess: () => {
          toast({ title: "Contenu réinitialisé" });
          onOpenChange(false);
        },
        onError: (err) =>
          toast({
            title: "Échec de la réinitialisation",
            description: err instanceof Error ? err.message : undefined,
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">{headingFor(target)}</DialogTitle>
          <DialogDescription>
            Les modifications sont visibles immédiatement par tous les visiteurs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ce-title">Titre</Label>
            <Input
              id="ce-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {hasKeywords(target) && (
            <div className="space-y-1.5">
              <Label htmlFor="ce-keywords">Mots-clés de recherche</Label>
              <Input
                id="ce-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="mots séparés par des espaces"
              />
            </div>
          )}

          {hasMarkdown(target) && (
            <div className="space-y-1.5">
              <Label htmlFor="ce-md">Contenu (Markdown)</Label>
              <Textarea
                id="ce-md"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-[220px] font-mono text-sm"
              />
              <div className="pt-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Aperçu
                </p>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <Prose markdown={markdown} />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Revenir au texte d'origine ?
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={reset}
                disabled={mutation.isPending}
              >
                Confirmer
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmReset(false)}
              >
                Non
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmReset(true)}
              disabled={mutation.isPending}
            >
              Réinitialiser
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={mutation.isPending || !title.trim()}
            >
              Enregistrer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Small pencil trigger shown only to admins next to editable content.
export function EditButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ${className ?? ""}`}
    >
      <Pencil className="w-3.5 h-3.5" />
    </button>
  );
}
