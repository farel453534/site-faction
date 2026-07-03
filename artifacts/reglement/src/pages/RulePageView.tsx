import { useState } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { findPage } from "@workspace/content";
import { Prose } from "@/components/Prose";
import { ContentEditor, EditButton } from "@/components/ContentEditor";
import { useContent } from "@/lib/use-content";
import { useAuth } from "@/lib/use-auth";
import NotFound from "@/pages/not-found";

export default function RulePageView() {
  const [, params] = useRoute("/:group/:page");
  const { data: content } = useContent();
  const { isAdmin } = useAuth();
  const [editPage, setEditPage] = useState(false);
  const [editGroup, setEditGroup] = useState(false);

  const result =
    params && content
      ? findPage(content.groups, params.group, params.page)
      : null;

  if (!result) return <NotFound />;

  const { group, page } = result;

  return (
    <article className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <header className="mb-8">
        <div className="flex items-center gap-1.5 mb-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{group.title}</span>
          </Link>
          {isAdmin && (
            <EditButton
              label="Modifier le nom de la catégorie"
              onClick={() => setEditGroup(true)}
            />
          )}
        </div>
        <div className="flex items-start gap-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {page.title}
          </h1>
          {isAdmin && (
            <EditButton
              label="Modifier la page"
              onClick={() => setEditPage(true)}
              className="mt-2"
            />
          )}
        </div>
      </header>

      <Prose markdown={page.markdown} />

      {isAdmin && (
        <>
          <ContentEditor
            open={editPage}
            onOpenChange={setEditPage}
            target={{
              kind: "page",
              group: group.slug,
              page: page.slug,
              title: page.title,
              markdown: page.markdown,
            }}
          />
          <ContentEditor
            open={editGroup}
            onOpenChange={setEditGroup}
            target={{ kind: "group", group: group.slug, title: group.title }}
          />
        </>
      )}
    </article>
  );
}
