import { useState } from "react";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useSearch } from "@/lib/search-context";
import { useContent } from "@/lib/use-content";
import { useAuth } from "@/lib/use-auth";
import { Prose } from "@/components/Prose";
import {
  ContentEditor,
  EditButton,
  type EditorTarget,
} from "@/components/ContentEditor";

export default function Reglement() {
  const { query } = useSearch();
  const { data: content } = useContent();
  const { isAdmin } = useAuth();
  const [editTarget, setEditTarget] = useState<EditorTarget | null>(null);

  const q = query.trim().toLowerCase();
  const meta = content?.home.meta ?? { title: "" };
  const cards = content?.home.cards ?? [];
  const shown = cards.filter(
    (c) =>
      q === "" ||
      c.keywords.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q),
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Breadcrumb + title */}
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-3 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Accueil</span>
        </Link>
        <div className="flex items-start gap-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {meta.title}
          </h1>
          {isAdmin && (
            <EditButton
              label="Modifier le titre"
              onClick={() =>
                setEditTarget({ kind: "home-meta", title: meta.title })
              }
              className="mt-2"
            />
          )}
        </div>
      </div>

      {/* Accordion cards */}
      <Accordion type="single" collapsible className="w-full space-y-2.5">
        {shown.map((card) => (
          <AccordionItem
            key={card.key}
            value={card.key}
            className="border border-white/[0.07] bg-white/[0.03] rounded-xl overflow-hidden transition-colors hover:bg-white/[0.05] data-[state=open]:border-primary/30 data-[state=open]:bg-white/[0.04]"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline group [&>svg]:text-muted-foreground">
              <div className="flex items-center gap-3.5 text-left flex-1">
                <BookOpen className="w-5 h-5 text-primary shrink-0" />
                <span className="font-serif text-[1.05rem] font-semibold text-foreground group-data-[state=open]:text-primary transition-colors">
                  {card.title}
                </span>
                {isAdmin && (
                  <EditButton
                    label="Modifier la carte"
                    onClick={() =>
                      setEditTarget({
                        kind: "home-card",
                        key: card.key,
                        title: card.title,
                        keywords: card.keywords,
                        markdown: card.markdown,
                      })
                    }
                    className="ml-auto mr-1"
                  />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-6 pt-0">
              <div className="ml-[2.15rem] border-l border-white/10 pl-5">
                <Prose markdown={card.markdown} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {shown.length === 0 && (
        <div className="text-center text-muted-foreground py-16">
          Aucune règle ne correspond à votre recherche.
        </div>
      )}

      {isAdmin && editTarget && (
        <ContentEditor
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
          target={editTarget}
        />
      )}
    </div>
  );
}
