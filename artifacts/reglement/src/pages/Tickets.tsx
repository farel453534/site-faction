import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Ticket as TicketIcon,
  Plus,
  X,
  Loader2,
  Send,
  UserPlus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ShieldHalf,
  MessageSquare,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import {
  useAuth,
  useMyTickets,
  useFactionTickets,
  useTicketDetail,
  useCreateTicket,
  useAddTicketMessage,
  useClaimTicket,
  useUnclaimTicket,
  useCloseTicket,
  useReopenTicket,
  useAddTicketParticipant,
  useRemoveTicketParticipant,
  type TicketEntry,
} from "@/lib/use-auth";

const STATUS_LABELS: Record<TicketEntry["status"], string> = {
  open: "Ouvert",
  claimed: "Pris en charge",
  closed: "Fermé",
};

const STATUS_COLORS: Record<TicketEntry["status"], string> = {
  open: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  claimed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  closed: "bg-white/10 text-foreground/50 border-white/10",
};

type Scope = "mine" | { faction: string };

export default function Tickets() {
  const { user, isLoading: authLoading, login } = useAuth();
  const gerantFactions = user?.gerantFactions ?? [];
  const [scope, setScope] = useState<Scope>("mine");
  const [openTicketId, setOpenTicketId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const mine = useMyTickets(!!user);
  const factionTickets = useFactionTickets(
    typeof scope === "object" ? scope.faction : null,
  );

  const list = scope === "mine" ? mine : factionTickets;

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
          Connecte-toi avec Discord pour accéder à tes tickets.
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <Link
        href="/"
        className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Accueil</span>
      </Link>

      <header className="flex items-center gap-4 mb-6">
        <span className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <TicketIcon className="w-7 h-7 text-primary" />
        </span>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Tickets
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
            {scope === "mine" ? "Mes tickets" : `Tickets · ${scope.faction}`}
          </h1>
        </div>
      </header>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 w-fit flex-wrap">
          <button
            type="button"
            onClick={() => setScope("mine")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              scope === "mine"
                ? "bg-primary/90 text-primary-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Mes tickets
          </button>
          {gerantFactions.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setScope({ faction: f })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                typeof scope === "object" && scope.faction === f
                  ? "bg-primary/90 text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Gestion · {f}
            </button>
          ))}
        </div>

        {user.faction && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau ticket
          </button>
        )}
      </div>

      {!user.faction && scope === "mine" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 mb-6 text-sm text-foreground/80">
          Tu dois appartenir à une faction pour ouvrir un ticket.
        </div>
      )}

      {list.isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse"
            />
          ))}
        </div>
      )}

      {list.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80">
          Impossible de charger les tickets pour le moment.
        </div>
      )}

      {list.data && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {list.data.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-foreground/50">
              Aucun ticket pour le moment.
            </p>
          ) : (
            <ul>
              {list.data.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setOpenTicketId(t.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 border-b border-white/[0.04] last:border-b-0 text-left hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">
                          {t.subject}
                        </span>
                        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] rounded-full bg-white/10 text-foreground/60 px-2 py-0.5">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/45 truncate">
                        {t.faction} · {t.authorUsername}
                        {t.claimedByUsername
                          ? ` · pris par ${t.claimedByUsername}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`text-[0.62rem] font-semibold uppercase tracking-[0.14em] rounded-full border px-2.5 py-1 shrink-0 ${STATUS_COLORS[t.status]}`}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showCreate && (
        <CreateTicketModal onClose={() => setShowCreate(false)} />
      )}

      {openTicketId !== null && (
        <TicketDetailModal
          ticketId={openTicketId}
          currentUserId={user.id}
          onClose={() => setOpenTicketId(null)}
        />
      )}
    </div>
  );
}

function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<"plainte" | "demande">("plainte");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const create = useCreateTicket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!subject.trim() || !body.trim()) {
      setError("Merci de remplir le sujet et le message.");
      return;
    }
    create.mutate(
      { category, subject: subject.trim(), body: body.trim() },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError((err as Error).message),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-popover shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/10 sticky top-0 bg-popover">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Nouveau ticket
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 w-fit">
            {(["plainte", "demande"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  category === c
                    ? "bg-primary/90 text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujet"
            className="w-full rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Décris ta plainte ou ta demande…"
            rows={5}
            className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-5 py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            {create.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}

function TicketDetailModal({
  ticketId,
  currentUserId,
  onClose,
}: {
  ticketId: number;
  currentUserId: string;
  onClose: () => void;
}) {
  const detail = useTicketDetail(ticketId);
  const addMessage = useAddTicketMessage(ticketId);
  const claim = useClaimTicket(ticketId);
  const unclaim = useUnclaimTicket(ticketId);
  const close = useCloseTicket(ticketId);
  const reopen = useReopenTicket(ticketId);
  const addParticipant = useAddTicketParticipant(ticketId);
  const removeParticipant = useRemoveTicketParticipant(ticketId);

  const [reply, setReply] = useState("");
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participantId, setParticipantId] = useState("");
  const [participantLabel, setParticipantLabel] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const ticket = detail.data?.ticket ?? null;
  const isStaff = detail.data?.isStaff ?? false;
  const canManage = isStaff && ticket?.status !== "closed";

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    addMessage.mutate(reply.trim(), {
      onSuccess: () => setReply(""),
    });
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!/^\d{15,25}$/.test(participantId.trim())) {
      setActionError("L'identifiant Discord doit contenir uniquement des chiffres (15 à 25).");
      return;
    }
    addParticipant.mutate(
      {
        discordId: participantId.trim(),
        label: participantLabel.trim() || undefined,
      },
      {
        onSuccess: () => {
          setParticipantId("");
          setParticipantLabel("");
          setShowAddParticipant(false);
        },
        onError: (err) => setActionError((err as Error).message),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-popover shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-4 duration-300 max-h-[88vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/10 sticky top-0 bg-popover z-10">
          <div className="min-w-0">
            {ticket && (
              <>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {ticket.faction} · {ticket.category}
                </p>
                <h2 className="font-serif text-xl font-bold text-foreground truncate">
                  {ticket.subject}
                </h2>
              </>
            )}
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

        {detail.isLoading && (
          <div className="p-5 space-y-3">
            <div className="h-16 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
            <div className="h-16 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
          </div>
        )}

        {detail.isError && (
          <div className="p-5">
            <p className="text-sm text-destructive">
              Impossible de charger ce ticket (accès refusé ou introuvable).
            </p>
          </div>
        )}

        {detail.data && ticket && (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[0.62rem] font-semibold uppercase tracking-[0.14em] rounded-full border px-2.5 py-1 ${STATUS_COLORS[ticket.status]}`}
              >
                {STATUS_LABELS[ticket.status]}
              </span>
              {ticket.claimedByUsername && (
                <span className="text-xs text-foreground/50">
                  Pris en charge par {ticket.claimedByUsername}
                </span>
              )}

              {canManage && (
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {ticket.status === "open" && (
                    <ActionButton
                      icon={<ShieldHalf className="w-3.5 h-3.5" />}
                      label="Prendre en charge"
                      onClick={() => claim.mutate()}
                      loading={claim.isPending}
                    />
                  )}
                  {ticket.status === "claimed" && (
                    <ActionButton
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                      label="Libérer"
                      onClick={() => unclaim.mutate()}
                      loading={unclaim.isPending}
                    />
                  )}
                  <ActionButton
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    label="Fermer"
                    onClick={() => close.mutate()}
                    loading={close.isPending}
                    variant="destructive"
                  />
                </div>
              )}
              {isStaff && ticket.status === "closed" && (
                <ActionButton
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  label="Rouvrir"
                  onClick={() => reopen.mutate()}
                  loading={reopen.isPending}
                />
              )}
            </div>

            <div className="space-y-3">
              {detail.data.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border px-4 py-3 ${
                    m.authorId === currentUserId
                      ? "border-primary/30 bg-primary/10 ml-6"
                      : "border-white/10 bg-white/[0.02] mr-6"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {m.authorUsername}
                    </span>
                    {m.isStaff && (
                      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] rounded-full bg-primary/15 text-primary px-2 py-0.5">
                        Gérant
                      </span>
                    )}
                    <span className="text-[0.68rem] text-foreground/40 ml-auto">
                      {new Date(m.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/85 whitespace-pre-wrap">
                    {m.body}
                  </p>
                </div>
              ))}
            </div>

            {ticket.status !== "closed" && (
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Écrire une réponse…"
                  className="flex-1 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={addMessage.isPending || !reply.trim()}
                  className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                  aria-label="Envoyer"
                >
                  {addMessage.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            )}

            {isStaff && (
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-sm font-semibold text-primary">
                    Participants
                  </h3>
                  {ticket.status !== "closed" && (
                    <button
                      type="button"
                      onClick={() => setShowAddParticipant((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                  )}
                </div>
                <p className="text-xs text-foreground/50 mb-3">
                  Ajoute un gérant d'une autre faction ou un joueur par son
                  identifiant Discord pour lui donner accès à ce ticket.
                </p>

                {showAddParticipant && (
                  <form
                    onSubmit={handleAddParticipant}
                    className="flex flex-col sm:flex-row gap-2 mb-3"
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      value={participantId}
                      onChange={(e) => setParticipantId(e.target.value)}
                      placeholder="Identifiant Discord"
                      className="flex-1 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <input
                      type="text"
                      value={participantLabel}
                      onChange={(e) => setParticipantLabel(e.target.value)}
                      placeholder="Nom (facultatif)"
                      className="sm:w-40 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={addParticipant.isPending}
                      className="rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-4 py-2 text-sm transition-colors disabled:opacity-50 shrink-0"
                    >
                      Ajouter
                    </button>
                  </form>
                )}
                {actionError && (
                  <p className="text-sm text-destructive mb-3">{actionError}</p>
                )}

                {detail.data.participants.length === 0 ? (
                  <p className="text-xs text-foreground/40">
                    Aucun participant ajouté.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {detail.data.participants.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
                      >
                        <span className="text-sm text-foreground flex-1 truncate">
                          {p.label || `Utilisateur ${p.discordId.slice(-4)}`}
                        </span>
                        <span className="text-xs text-foreground/40 font-mono">
                          {p.discordId}
                        </span>
                        {ticket.status !== "closed" && (
                          <button
                            type="button"
                            onClick={() => removeParticipant.mutate(p.discordId)}
                            aria-label="Retirer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  loading,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        variant === "destructive"
          ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
          : "bg-primary/15 text-primary hover:bg-primary/25"
      }`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {label}
    </button>
  );
}
