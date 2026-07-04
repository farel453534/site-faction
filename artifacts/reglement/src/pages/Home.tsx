import { Link } from "wouter";
import {
  BookOpen,
  User,
  ShieldHalf,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Swords,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useContent } from "@/lib/use-content";
import { useAuth } from "@/lib/use-auth";

const DISCORD_INVITE = "https://discord.gg/TaqPhgNeM4";

const groupIcons: Record<string, typeof BookOpen> = {
  "notions-de-bases": BookOpen,
  "notions-rpg": Sparkles,
  "notions-pvppve": Swords,
  factions: ShieldHalf,
};

export default function Home() {
  const { data: content } = useContent();
  const { user, isAdmin } = useAuth();

  const groups = content?.groups ?? [];

  const actions: {
    key: string;
    title: string;
    description: string;
    href: string;
    external?: boolean;
    icon: typeof BookOpen | IconType;
    featured?: boolean;
  }[] = [
    {
      key: "reglement",
      title: "Consulter le règlement",
      description: "Toutes les règles RP de la faction, réunies au même endroit.",
      href: "/reglement",
      icon: BookOpen,
      featured: true,
    },
    {
      key: "profil",
      title: "Gérer mon profil",
      description: "Ta réputation, tes captures et tes informations Discord.",
      href: "/profil",
      icon: User,
    },
    {
      key: "discord",
      title: "Rejoindre le Discord",
      description: "Rejoins la communauté et reste informé des annonces.",
      href: DISCORD_INVITE,
      external: true,
      icon: FaDiscord,
    },
  ];

  if (isAdmin) {
    actions.push({
      key: "admin",
      title: "Administration",
      description: "Gérer les administrateurs, le contenu et les statistiques.",
      href: "/admin",
      icon: ShieldHalf,
    });
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Hero */}
      <div className="mb-10">
        <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          Panel Faction
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {user ? `Bienvenue, ${user.displayName}` : "Bienvenue"}
        </h1>
        <p className="text-foreground/60 mt-3 max-w-2xl leading-relaxed">
          Ton espace pour la faction : consulte le règlement, gère ton profil
          et accède à tout ce dont tu as besoin.
        </p>
      </div>

      {/* Action cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {actions.map((a) => {
          const Icon = a.icon;
          const cardClass = a.featured
            ? "sm:col-span-2 group flex items-center gap-5 rounded-2xl border border-primary/30 bg-primary/[0.06] p-6 transition-colors hover:bg-primary/[0.1] hover:border-primary/50"
            : "group flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.05] hover:border-primary/30";
          const inner = (
            <>
              <span className="w-12 h-12 shrink-0 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Icon className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {a.title}
                </h2>
                <p className="text-foreground/55 text-sm mt-1 leading-snug">
                  {a.description}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </>
          );
          return a.external ? (
            <a
              key={a.key}
              href={a.href}
              target="_blank"
              rel="noreferrer"
              className={cardClass}
            >
              {inner}
            </a>
          ) : (
            <Link key={a.key} href={a.href} className={cardClass}>
              {inner}
            </Link>
          );
        })}
      </div>

      {/* Rule categories */}
      {groups.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-semibold text-primary mb-4">
            Catégories du règlement
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((group) => {
              const Icon = groupIcons[group.slug] ?? BookOpen;
              const first = group.pages[0];
              const href = first
                ? `/${group.slug}/${first.slug}`
                : "/reglement";
              return (
                <Link
                  key={group.slug}
                  href={href}
                  className="group flex items-center gap-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-colors hover:bg-white/[0.05] hover:border-primary/25"
                >
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="flex-1 font-medium text-foreground group-hover:text-primary transition-colors">
                    {group.title}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
