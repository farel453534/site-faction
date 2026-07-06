import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Shield,
  Skull,
  UserX,
  Swords,
  Users,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ShieldHalf,
} from "lucide-react";
import { useContent } from "@/lib/use-content";
import { useAuth } from "@/lib/use-auth";

const SERVER_IP = "51.91.215.65:27015";

const groupIcons: Record<string, typeof BookOpen> = {
  "notions-de-bases": BookOpen,
  "notions-rpg": Sparkles,
  "notions-pvppve": Swords,
  factions: ShieldHalf,
};

function useServerPlayerCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      try {
        const res = await fetch(`http://${SERVER_IP}/players.json`, {
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        if (!cancelled) setCount(Array.isArray(data) ? data.length : null);
      } catch {
        if (!cancelled) setCount(null);
      }
    }
    fetch_();
    const id = setInterval(fetch_, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return count;
}

const TICKET_CARDS = [
  {
    key: "naissance-rp",
    icon: Skull,
    title: "Naissance RP",
    desc: "Demander une naissance RP pour un personnage",
  },
  {
    key: "desertion",
    icon: UserX,
    title: "Désertion",
    desc: "Demander une désertion de faction pour votre personnage",
  },
  {
    key: "mort-rp",
    icon: Swords,
    title: "Mort RP",
    desc: "Demander une mort RP pour un personnage ciblé",
  },
];

export default function Home() {
  const { data: content } = useContent();
  const { user } = useAuth();
  const playerCount = useServerPlayerCount();

  const groups = content?.groups ?? [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-8">
      {/* ── Top row: Hero + Stat ── */}
      <div className="flex gap-5 items-stretch">
        {/* Hero banner */}
        <div className="flex-1 min-w-0 rounded-2xl border border-primary/20 bg-gradient-to-br from-[#1a1209] via-[#13100b] to-background relative overflow-hidden flex flex-col justify-end p-7 min-h-[220px]">
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_80%_at_75%_50%,hsl(var(--primary)/0.12),transparent)]" />
          {/* Decorative icon */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <Shield className="w-32 h-32 text-primary" strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              MSSClick · Poudlard RP
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-foreground leading-[1.08] tracking-tight mb-3">
              {user ? `Bienvenue,\u00a0${user.displayName}` : "Règlement\nFaction"}
            </h1>
            <p className="text-foreground/55 text-sm leading-relaxed max-w-xs mb-5">
              Consulte les règles de ta faction et ouvre un ticket directement
              depuis le panel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/reglement"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Voir le règlement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-white/[0.08] transition-colors"
              >
                Ouvrir un ticket
              </Link>
            </div>
          </div>
        </div>

        {/* Stat card — Joueurs en ligne */}
        <div className="w-64 shrink-0 rounded-2xl border border-white/[0.07] bg-white/[0.03] flex flex-col items-start justify-between p-6 gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-[0.7rem] text-foreground/45 mb-0.5">
              Joueurs en ligne
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold font-serif text-foreground leading-none">
                {playerCount === null ? "—" : playerCount}
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  playerCount !== null ? "bg-emerald-500" : "bg-white/20"
                }`}
              />
            </div>
          </div>
          <a
            href={`https://www.battlemetrics.com/servers/fivem?q=${SERVER_IP}`}
            target="_blank"
            rel="noreferrer"
            className="text-[0.72rem] text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
          >
            Voir le serveur <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ── Ticket cards ── */}
      <section>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Ticket
          </span>
          <h2 className="font-serif text-lg font-bold text-foreground">
            Demandes
          </h2>
          <div className="flex-1" />
          <Link
            href="/tickets"
            className="text-xs text-primary/70 hover:text-primary transition-colors font-semibold"
          >
            Tout voir →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TICKET_CARDS.map(({ key, icon: Icon, title, desc }) => (
            <Link
              key={key}
              href={`/tickets?category=${key}`}
              className="group flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 hover:border-primary/30 hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                  {title}
                </div>
                <p className="text-xs text-foreground/45 leading-snug">{desc}</p>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 text-center text-xs font-semibold text-foreground/70 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                Ouvrir un ticket
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Catégories du règlement ── */}
      {groups.length > 0 && (
        <section>
          <h2 className="font-serif text-base font-semibold text-primary mb-3">
            Catégories du règlement
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {groups.map((group) => {
              const Icon = groupIcons[group.slug] ?? BookOpen;
              const first = group.pages[0];
              const href = first ? `/${group.slug}/${first.slug}` : "/reglement";
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
