import { Link } from "wouter";
import {
  ArrowLeft,
  Trophy,
  Crosshair,
  MapPin,
  Calendar,
  LogIn,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import { useAuth, usePlayerStats, type CaptureEntry } from "@/lib/use-auth";

export default function Profile() {
  const { user, isLoading: authLoading, login } = useAuth();
  const stats = usePlayerStats(!!user);

  if (authLoading) {
    return (
      <div className="animate-in fade-in duration-500 space-y-4">
        <div className="h-24 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
        <div className="h-40 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
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
          Connecte-toi avec Discord pour voir ta réputation et tes captures au
          sein de la faction.
        </p>
        <button
          type="button"
          onClick={login}
          className="inline-flex items-center gap-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-6 py-3 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Se connecter avec Discord
        </button>
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

      <header className="flex items-center gap-4 mb-10">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover ring-1 ring-primary/30"
          />
        ) : (
          <span className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
            <FaDiscord className="w-7 h-7 text-primary" />
          </span>
        )}
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Mon profil
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
            {user.displayName}
          </h1>
        </div>
      </header>

      {stats.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="h-32 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
        </div>
      )}

      {stats.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80 mb-8">
          Impossible de charger tes statistiques pour le moment. Réessaie plus
          tard.
        </div>
      )}

      {stats.data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 mb-10">
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Réputation"
              value={stats.data.reputation.points.toLocaleString("fr-FR")}
              hint={
                stats.data.reputation.rank
                  ? `Classé #${stats.data.reputation.rank} sur ${stats.data.reputation.totalPlayers}`
                  : "Non classé"
              }
            />
            <StatCard
              icon={<Crosshair className="w-5 h-5" />}
              label="Captures"
              value={stats.data.captures.count.toLocaleString("fr-FR")}
              hint={
                stats.data.captures.count > 0
                  ? "Fois capturé"
                  : "Jamais capturé"
              }
            />
          </div>

          <section>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
              Dernières captures
            </h2>
            {stats.data.captures.recent.length === 0 ? (
              <p className="text-foreground/50 text-sm">
                Aucune capture recensée pour l'instant.
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.data.captures.recent.map((c, i) => (
                  <CaptureRow key={i} entry={c} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-primary mb-3">
        {icon}
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      <p className="font-serif text-4xl font-bold text-foreground tracking-tight">
        {value}
      </p>
      <p className="text-foreground/50 text-sm mt-1">{hint}</p>
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
