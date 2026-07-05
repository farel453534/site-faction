import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Trophy,
  Crosshair,
  Users,
  ShieldHalf,
  AlertTriangle,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import { useAuth, useGerantMembers, type GerantMember } from "@/lib/use-auth";

const FACTION_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  Mangemort: {
    bg: "bg-red-950/30",
    border: "border-red-700/40",
    text: "text-red-300",
    accent: "bg-red-500",
  },
  Auror: {
    bg: "bg-blue-950/30",
    border: "border-blue-700/40",
    text: "text-blue-300",
    accent: "bg-blue-500",
  },
  Ministère: {
    bg: "bg-purple-950/30",
    border: "border-purple-700/40",
    text: "text-purple-300",
    accent: "bg-purple-500",
  },
  "Mage-Indépendant": {
    bg: "bg-emerald-950/30",
    border: "border-emerald-700/40",
    text: "text-emerald-300",
    accent: "bg-emerald-500",
  },
};

export default function Gerant() {
  const { user, isLoading: authLoading, login } = useAuth();
  const isGerant = (user?.gerantFactions.length ?? 0) > 0;
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const activeFaction = selectedFaction ?? user?.gerantFactions[0] ?? null;
  const members = useGerantMembers(isGerant, activeFaction);
  const [search, setSearch] = useState("");

  if (authLoading) {
    return (
      <div className="animate-in fade-in duration-500 space-y-4">
        <div className="h-24 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
        <div className="h-64 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
          <FaDiscord className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          Connexion requise
        </h1>
        <p className="text-foreground/60 mb-8 leading-relaxed">
          Connecte-toi avec Discord pour accéder à la gestion de ta faction.
        </p>
        <button
          type="button"
          onClick={login}
          className="inline-flex items-center gap-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-6 py-3 transition-colors"
        >
          Se connecter avec Discord
        </button>
      </div>
    );
  }

  if (!isGerant) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-6">
          <ShieldHalf className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          Accès réservé
        </h1>
        <p className="text-foreground/60 leading-relaxed">
          Cette page est réservée aux gérants de faction.
        </p>
      </div>
    );
  }

  const factionName = activeFaction!;
  const colors = FACTION_COLORS[factionName] ?? {
    bg: "bg-white/[0.03]",
    border: "border-white/10",
    text: "text-primary",
    accent: "bg-primary",
  };

  const isBotMissing =
    members.isError &&
    (members.error as Error)?.message === "bot_token_missing";

  const filtered = (members.data?.members ?? []).filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.displayName.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <Link
        href="/"
        className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Accueil</span>
      </Link>

      <header className="flex items-center gap-4 mb-8">
        <span className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
          <ShieldHalf className={`w-7 h-7 ${colors.text}`} />
        </span>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Ma faction
          </p>
          <h1 className={`font-serif text-3xl font-bold tracking-tight ${colors.text}`}>
            {factionName}
          </h1>
        </div>
      </header>

      {user.gerantFactions.length > 1 && (
        <div className="flex items-center gap-1 mb-6 p-1 rounded-full bg-white/[0.04] border border-white/10 w-fit flex-wrap">
          {user.gerantFactions.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFaction(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                f === factionName
                  ? "bg-primary/90 text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Bot token missing warning */}
      {isBotMissing && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">
              Configuration requise
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Pour afficher les membres Discord de ta faction, ajoute la
              variable <code className="font-mono bg-white/10 px-1 rounded">DISCORD_BOT_TOKEN</code> dans
              les variables d'environnement Railway.
            </p>
          </div>
        </div>
      )}

      {/* Other error */}
      {members.isError && !isBotMissing && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80 mb-6">
          Impossible de charger les membres pour le moment. Réessaie plus tard.
        </div>
      )}

      {/* Loading */}
      {members.isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Members list */}
      {members.data && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un membre…"
                className="w-full rounded-full bg-white/[0.04] border border-white/10 pl-4 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <span className="flex items-center gap-2 text-sm text-foreground/50">
              <Users className="w-4 h-4" />
              {members.data.members.length} membre{members.data.members.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-3 border-b border-white/10 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
              <span className="w-8" />
              <span>Membre</span>
              <span className="text-right">Réputation</span>
              <span className="text-right pl-3">Captures</span>
            </div>
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-foreground/50">
                {search ? "Aucun membre trouvé." : "Aucun membre dans cette faction."}
              </p>
            ) : (
              <ul>
                {filtered.map((m) => (
                  <MemberRow key={m.id} member={m} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MemberRow({ member }: { member: GerantMember }) {
  return (
    <li className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-3 items-center border-b border-white/[0.04] last:border-b-0">
      {member.avatarUrl ? (
        <img
          src={member.avatarUrl}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <span className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <FaDiscord className="w-4 h-4 text-primary" />
        </span>
      )}
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{member.displayName}</p>
        {member.displayName !== member.username && (
          <p className="text-xs text-foreground/40 truncate">{member.username}</p>
        )}
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1.5 justify-end">
          <Trophy className="w-3.5 h-3.5 text-primary/60" />
          <span className="text-foreground/80 tabular-nums text-sm">
            {member.points.toLocaleString("fr-FR")}
          </span>
        </div>
        {member.rank !== null && (
          <p className="text-xs text-foreground/40">#{member.rank}</p>
        )}
      </div>
      <div className="text-right pl-3">
        <div className="flex items-center gap-1.5 justify-end">
          <Crosshair className="w-3.5 h-3.5 text-foreground/30" />
          <span className="text-foreground/60 tabular-nums text-sm">
            {member.captures}
          </span>
        </div>
      </div>
    </li>
  );
}
