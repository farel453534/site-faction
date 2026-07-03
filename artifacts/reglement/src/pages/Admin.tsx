import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ShieldCheck,
  Trophy,
  Crosshair,
  MapPin,
  Calendar,
  Search,
  X,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import {
  useAuth,
  useAdminPlayers,
  useAdminPlayerStats,
  type LeaderboardEntry,
  type CaptureEntry,
} from "@/lib/use-auth";

function playerName(p: { displayName: string | null; userId: string }): string {
  if (p.displayName) return p.displayName;
  if (p.userId.startsWith("nom:")) return p.userId.slice(4);
  return `Joueur ${p.userId.slice(-4)}`;
}

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading, login } = useAuth();
  const players = useAdminPlayers(!!user && isAdmin);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const detail = useAdminPlayerStats(selected);

  const filtered = useMemo(() => {
    const list = players.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        playerName(p).toLowerCase().includes(q) ||
        p.userId.toLowerCase().includes(q),
    );
  }, [players.data, search]);

  const selectedPlayer = useMemo(
    () => (players.data ?? []).find((p) => p.userId === selected) ?? null,
    [players.data, selected],
  );

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
          Connecte-toi avec Discord pour accéder à l'administration.
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

  if (!isAdmin) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          Accès réservé
        </h1>
        <p className="text-foreground/60 leading-relaxed">
          Cette page est réservée aux administrateurs de la faction.
        </p>
      </div>
    );
  }

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
        <span className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </span>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Administration
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
            Statistiques des joueurs
          </h1>
        </div>
      </header>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un joueur (nom ou ID)…"
          className="w-full rounded-full bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {players.isLoading && (
        <div className="h-64 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
      )}

      {players.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80">
          Impossible de charger le classement pour le moment. Réessaie plus tard.
        </div>
      )}

      {players.data && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-3 px-4 py-3 border-b border-white/10 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            <span>#</span>
            <span>Joueur</span>
            <span className="text-right">Réputation</span>
            <span className="text-right pl-3">Captures</span>
          </div>
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-foreground/50">
              Aucun joueur trouvé.
            </p>
          ) : (
            <ul>
              {filtered.map((p) => (
                <li key={p.userId}>
                  <button
                    type="button"
                    onClick={() => setSelected(p.userId)}
                    className="grid w-full grid-cols-[3rem_1fr_auto_auto] gap-3 px-4 py-3 items-center border-b border-white/[0.04] last:border-b-0 text-left hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="font-serif font-bold text-primary">
                      {p.rank}
                    </span>
                    <span className="truncate text-foreground font-medium">
                      {playerName(p)}
                    </span>
                    <span className="text-right text-foreground/80 tabular-nums">
                      {p.points.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-right pl-3 text-foreground/60 tabular-nums">
                      {p.captures}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedPlayer && (
        <PlayerDetail
          player={selectedPlayer}
          detail={detail}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function PlayerDetail({
  player,
  detail,
  onClose,
}: {
  player: LeaderboardEntry;
  detail: ReturnType<typeof useAdminPlayerStats>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-popover shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/10 sticky top-0 bg-popover">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Joueur · Rang #{player.rank}
            </p>
            <h2 className="font-serif text-xl font-bold text-foreground">
              {playerName(player)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Trophy className="w-4 h-4" />
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                  Réputation
                </span>
              </div>
              <p className="font-serif text-2xl font-bold text-foreground">
                {player.points.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Crosshair className="w-4 h-4" />
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                  Captures
                </span>
              </div>
              <p className="font-serif text-2xl font-bold text-foreground">
                {player.captures.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>

          <h3 className="font-serif text-sm font-semibold text-primary mb-3">
            Dernières captures
          </h3>
          {detail.isLoading && (
            <div className="h-20 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
          )}
          {detail.isError && (
            <p className="text-sm text-foreground/60">
              Impossible de charger le détail.
            </p>
          )}
          {detail.data &&
            (detail.data.captures.recent.length === 0 ? (
              <p className="text-foreground/50 text-sm">
                Aucune capture recensée pour ce joueur.
              </p>
            ) : (
              <ul className="space-y-3">
                {detail.data.captures.recent.map((c, i) => (
                  <CaptureRow key={i} entry={c} />
                ))}
              </ul>
            ))}
        </div>
      </div>
    </div>
  );
}

function CaptureRow({ entry }: { entry: CaptureEntry }) {
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="font-semibold text-foreground">
          {entry.agresseur ? `Capturé par ${entry.agresseur}` : "Capture"}
          {entry.captureNumero ? (
            <span className="text-primary"> #{entry.captureNumero}</span>
          ) : null}
        </span>
        {entry.dateEvent && (
          <span className="flex items-center gap-1.5 text-xs text-foreground/50 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            {entry.dateEvent}
          </span>
        )}
      </div>
      {entry.lieu && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/65">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary/70" />
            {entry.lieu}
          </span>
        </div>
      )}
    </li>
  );
}
