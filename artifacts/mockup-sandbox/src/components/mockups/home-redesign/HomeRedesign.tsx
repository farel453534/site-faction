import {
  Home,
  Plus,
  Mail,
  BookOpen,
  Bell,
  Layers,
  X,
  Search,
  Shield,
  Skull,
  UserX,
  Ticket,
  ChevronRight,
  Users,
  Trophy,
  Crown,
  Swords,
  BookMarked,
  ShoppingBag,
  Settings,
  LogOut,
} from "lucide-react";

const GOLD = "#c9933c";
const GOLD_BRIGHT = "#e8b254";

const railItems = [
  { icon: Home, label: "Accueil", active: true },
  { icon: Plus, label: "Nouveau ticket" },
  { icon: Mail, label: "Messages" },
  { icon: BookOpen, label: "Règlement" },
  { icon: Bell, label: "Notifications" },
  { icon: Layers, label: "Wiki" },
  { icon: X, label: "Fermer" },
];

const stats = [
  { icon: Users, label: "Joueurs en ligne", sub: "Whitelist", value: "247", dot: true },
  { icon: Trophy, label: "Le plus actif", sub: "Ce mois-ci", value: "SiriusBlack_RP" },
  { icon: Crown, label: "Joueurs inscrits", sub: "Total", value: "1 842" },
];

const tickets = [
  {
    icon: Skull,
    color: "#c9933c",
    title: "Naissance RP",
    desc: "Demander une naissance RP pour un personnage",
  },
  {
    icon: UserX,
    color: "#c9933c",
    title: "Désertion",
    desc: "Demander une désertion de faction pour votre personnage",
  },
  {
    icon: Swords,
    color: "#c9933c",
    title: "Mort RP",
    desc: "Demander une mort RP pour un personnage ciblé",
  },
];

function RailButton({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      title={label}
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: active ? GOLD : "rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background 0.15s",
        flexShrink: 0,
      }}
    >
      <Icon
        size={24}
        color={active ? "#0a0a0a" : "rgba(255,255,255,0.65)"}
        strokeWidth={active ? 2.5 : 1.8}
      />
    </div>
  );
}

export function HomeRedesign() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      {/* ── Topbar ── */}
      <div
        style={{
          height: 60,
          background: "rgba(10,10,10,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 88,
          paddingRight: 24,
          gap: 16,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${GOLD} 0%, #7a5520 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
              color: "#0a0a0a",
              letterSpacing: "-0.5px",
            }}
          >
            MSS
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: GOLD_BRIGHT,
              letterSpacing: "0.02em",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Règlement Faction
          </span>
        </div>

        {/* Search */}
        <div
          style={{
            flex: 1,
            maxWidth: 340,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 14px",
            height: 36,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Search size={14} color="rgba(255,255,255,0.35)" />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            Recherche…
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Discord pill */}
        <div
          style={{
            background: "#5865F2",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>gg/mssclick</span>
        </div>

        {/* User */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 10,
            padding: "5px 12px 5px 6px",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${GOLD} 0%, #7a5520 100%)`,
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
              AurorMaster
            </div>
            <div style={{ fontSize: 10, color: GOLD, lineHeight: 1.2 }}>Whitelist</div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* ── Left Rail ── */}
        <div
          style={{
            width: 76,
            background: "#111111",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "18px 0",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {railItems.map((item) => (
            <RailButton key={item.label} {...item} />
          ))}
        </div>

        {/* ── Main Content ── */}
        <div
          style={{
            flex: 1,
            padding: "24px 28px",
            overflow: "auto",
            background:
              "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(201,147,60,0.06) 0%, transparent 70%), #0d0d0d",
          }}
        >
          {/* Top row: Hero + Stats */}
          <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
            {/* Hero banner */}
            <div
              style={{
                flex: "0 0 60%",
                borderRadius: 18,
                overflow: "hidden",
                background: "linear-gradient(135deg, #1a1209 0%, #16100a 40%, #0d0d0d 100%)",
                border: `1px solid rgba(201,147,60,0.2)`,
                minHeight: 220,
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                padding: 28,
              }}
            >
              {/* Gold glow */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 60% 80% at 70% 50%, rgba(201,147,60,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              {/* Decorative character silhouette */}
              <div
                style={{
                  position: "absolute",
                  right: 24,
                  top: 0,
                  bottom: 0,
                  width: 180,
                  background:
                    "linear-gradient(to bottom, rgba(201,147,60,0.08), rgba(201,147,60,0.03))",
                  borderRadius: "0 18px 18px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={80} color={`${GOLD}40`} strokeWidth={1} />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.15em",
                    color: GOLD,
                    fontWeight: 600,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  MSSClick · Poudlard RP
                </div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    lineHeight: 1.05,
                    marginBottom: 8,
                    fontFamily: "'Poppins', sans-serif",
                    background: `linear-gradient(90deg, #fff 0%, ${GOLD_BRIGHT} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Règlement
                  <br />
                  Faction
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 20,
                    maxWidth: 280,
                    lineHeight: 1.5,
                  }}
                >
                  Consulte les règles de ta faction et ouvre un ticket directement depuis
                  le panel.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    style={{
                      background: GOLD,
                      color: "#0a0a0a",
                      border: "none",
                      borderRadius: 10,
                      padding: "9px 20px",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Voir le règlement
                  </button>
                  <button
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      padding: "9px 20px",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Ouvrir un ticket
                  </button>
                </div>
              </div>
            </div>

            {/* Stats panel */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      background: `rgba(201,147,60,0.15)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <s.icon size={20} color={GOLD} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.45)",
                        marginBottom: 2,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
                    >
                      {s.sub}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "'Poppins', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {s.value}
                    {s.dot && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#22c55e",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket section */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: GOLD,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Ticket
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
                  color: "#fff",
                }}
              >
                Demandes
              </div>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: GOLD, cursor: "pointer", fontWeight: 600 }}>
                Tout voir →
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {tickets.map((t) => (
                <div
                  key={t.title}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "20px 20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "border-color 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "rgba(201,147,60,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <t.icon size={20} color={GOLD} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        fontFamily: "'Poppins', sans-serif",
                        marginBottom: 4,
                        color: "#fff",
                      }}
                    >
                      {t.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.45)",
                        lineHeight: 1.4,
                      }}
                    >
                      {t.desc}
                    </div>
                  </div>
                  <button
                    style={{
                      marginTop: "auto",
                      width: "100%",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 9,
                      padding: "8px 0",
                      color: "rgba(255,255,255,0.75)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Ouvrir un ticket
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
