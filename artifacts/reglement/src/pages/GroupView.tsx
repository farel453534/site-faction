import { useState } from "react";
import { useRoute, Link } from "wouter";
import { BookOpen, ArrowLeft, ChevronRight } from "lucide-react";
import { useContent } from "@/lib/use-content";
import { useAuth } from "@/lib/use-auth";
import { ContentEditor, EditButton } from "@/components/ContentEditor";
import type { EditorTarget } from "@/components/ContentEditor";
import NotFound from "@/pages/not-found";

export default function GroupView() {
  const [, params] = useRoute("/:group");
  const { data: content } = useContent();
  const { isAdmin } = useAuth();
  const [editTarget, setEditTarget] = useState<EditorTarget | null>(null);

  const group = params && content
    ? content.groups.find((g) => g.slug === params.group) ?? null
    : null;

  if (content && !group) return <NotFound />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <Link
        href="/"
        className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Accueil</span>
      </Link>

      {!group ? (
        <div className="space-y-3">
          <div className="h-10 w-64 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2 mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {group.title}
            </h1>
            {isAdmin && (
              <EditButton
                label="Modifier le nom du groupe"
                onClick={() =>
                  setEditTarget({ kind: "group", group: group.slug, title: group.title })
                }
                className="mt-2"
              />
            )}
          </div>

          <ul className="space-y-2">
            {group.pages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/${group.slug}/${page.slug}`}
                  className="flex items-center gap-3.5 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-5 py-4 hover:bg-white/[0.06] hover:border-primary/30 transition-colors group"
                >
                  <BookOpen className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-serif text-[1.05rem] font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
                    {page.title}
                  </span>
                  {isAdmin && (
                    <EditButton
                      label="Modifier la page"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditTarget({
                          kind: "page",
                          group: group.slug,
                          page: page.slug,
                          title: page.title,
                        });
                      }}
                    />
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {editTarget && (
        <ContentEditor
          target={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
