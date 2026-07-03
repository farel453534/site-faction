// Accueil ("Règlement spécifique au RP") — 8 accordion cards, converted from the
// original bespoke JSX to markdown so they are editable as plain text like the rule pages.
// Callouts (Exemple / Attention) are rendered as blockquotes.
import type { HomeCard, HomeMeta } from "./types";

export const homeMeta: HomeMeta = { title: "Règlement spécifique au RP" };

export const homeCards: HomeCard[] = [
  {
    key: "item-1",
    title: "Fiche de suivie",
    keywords: "fiche de suivie suivi ck",
    markdown:
      "Un système suivie a été mis en place est obligatoire pour tout membre de faction, il s'agit tout simplement de votre fiche personnelle ou seront inscrit : vos informations RP, vos interactions RP, votre histoire, vos dons et toutes informations complémentaires.\n\nCe système est mit en place pour seconder le système de CK qui prend désormais la place du système de capture, pour résumer, vous devrez noter sous forme de résumé très court les interactions que vous aurez avec un autre personnage, qu'elles soient positive comme négative.\n\nAinsi pour vos demandes futurs nous aurons une potentielle trace de vos agissements et donc une meilleures gestion et rapidité de traitement !\n\n*Nous vous invitons à le prendre au premier degrés, car toutes informations que vous oublierez ne pourront être comptées !*",
  },
  {
    key: "item-2",
    title: "Le FearRP",
    keywords: "le fearrp peur fear",
    markdown:
      "Le FearRP est \"le jeu de la peur\". Lorsque l'occasion se présente, vous devez absolument avoir peur. Rappelez-vous que vous incarnez un personnage et qu'il n'a qu'une seule vie ! Si sa vie est en danger, vous devez obligatoirement respecter la peur de mourir.\n\n> **Exemple —** Vous ne pouvez pas fuir lorsqu'un Mangemort vous pointe avec sa baguette magique puisqu'il a juste à prononcer l'incantation pour vous tuer, si vous avez le malheur de bouger. Vous n'êtes pas immortel comme l'a été Nicolas Flamel !\n\n> **⚠️ Attention —** Le FearRP ne comprend pas uniquement la \"peur de mourir\" mais également la peur d'une sanction. Il s'applique donc également aux interactions avec les Préfets, Professeurs, Aurors, Membres du ministère, Directeur, etc. Attention à bien faire des choix logiques et respectant le RolePlay. Désormais, en cas de NoFear face à des personnes de faction, si celles-ci jugent que votre Fear n'est pas assez présent et que vous faites preuve de NoFear, cela pourra mener à un CK direct de votre personnage sur scène, suite à un support afin d'apporter les différents points de vue.",
  },
  {
    key: "item-3",
    title: "Le PainRP",
    keywords: "le painrp douleur pain",
    markdown:
      "Le PainRP est le \"jeu de la douleur\" dans le RolePlay. Comme son nom l'indique, vous devez respecter le jeu de la douleur en la simulant lorsque la situation se présente. Vous ne pouvez pas, par exemple, faire comme si de rien n'était alors que vous avez reçu un Endoloris (Le Sortilège Doloris est l'un des trois Sortilèges Impardonnables). Il y a des conséquences mentales et physiques derrière.\n\nDésormais, pour que les choses soient plus claires dans l'esprit de tout le monde, un Auror, Mangemort, Professeur, membre du Ministère, Mage indépendant, Vampire ou Élève passant sous le seuil des 30 HP ou l'égalant, ne pourra plus faire usage de sortilèges, ne pourra plus courir et devra simplement trotter ACCROUPI en espérant recevoir de l'aide de ses alliés, se cacher afin de semer les opposants ou bien se rendre.",
  },
  {
    key: "item-4",
    title: "NLR (New Life Rule)",
    keywords: "nlr new life rule mort coma",
    markdown:
      "La New Life Rule (NLR) entre en vigueur après la mort ou un coma IC. Lorsqu'un personnage est vaincu en combat, il ne meurt pas réellement ; il est transporté, de manière passive, à l'infirmerie ou à l'hôpital pour recevoir des soins. Il est strictement interdit de revenir sur les lieux de votre mort pour chercher vengeance.\n\n> **⚠️ Attention —** Il est interdit de revenir sur la scène ayant provoqué votre mort, interdiction donc d'y revenir tant qu'elle n'est pas finie, généralement un \"/advert\" ou un message dans le chat pour vous avertir de la fin de celle-ci.\n\n> **Exemple —** Vous êtes impliqué dans un combat contre un Mangemort et vous êtes vaincu. Conformément à la NLR, vous ne devez pas retourner sur le champ de bataille pour vous venger. Au lieu de cela, vous devez jouer une scène de RP où votre personnage se réveille à l'infirmerie, reçoit des soins et se remet progressivement de ses blessures.",
  },
  {
    key: "item-5",
    title: "Le FairPlay",
    keywords: "le fairplay fair play",
    markdown:
      "Assurez vous que les scènes soient menés avec respect et bienséance. Favorisez des interactions qui enrichissent l'expérience de jeu pour toutes les factions, en mettant l'accent sur des scénarios créatifs et intéressants pour tout le monde.\n\n> **Exemple —** Vous êtes en négociation et vous êtes en surnombre comparé a vos opposants face à vous, vous devez laisser des portes de sortie a la factions en minorité.\n\n*Attention, cela n'interdit pas que vous pouvez mener un combat si la scène tourne au \"vinaigre\".*",
  },
  {
    key: "item-6",
    title: "Les Temps de RP",
    keywords: "les temps de rp couvre feu horaires temps",
    markdown:
      "Afin de garder une exclusivité aux scènes, une gestion plus accrue avec d'avantage d'observation sur vos agissements et donc un meilleur Gameplay pour vous, nous avons, la gérance, votés pour instaurer un couvre feu a fenêtre très large. Le couvre feu a pour But de minimiser les scènes RP faites à l'arrache sans réel but derrière et donc favoriser les heures de pointes avec d'avantages de mondes et de propositions.\n\n- **En semaine (Lundi-Jeudi) :** de 17h à 1h du matin\n- **En Week-end (Vendredi-Dimanche) :** 16h a 2h du matin\n\nPendant la tranche horaire de couvre feu (1h01/2h01 à 11h59) il est interdit de jouer **QUELCONQUE INTERACTIONS** en membre de faction, que ce soit d'une simple capture d'un élève à une entrevue entre différentes factions. Il est autorisé néanmoins de faire des scènes entre membre d'une même faction, qui ne crée aucun conflit extérieur, style entraînement/cours...",
  },
  {
    key: "item-7",
    title: "Les Sanctions",
    keywords: "les sanctions drapeau rouge noir hrp rp staff",
    markdown:
      "Au sein d'une faction, plusieurs types de sanctions peuvent être appliqués selon la nature de la faute (RP ou HRP). Voici un récapitulatif :\n\n### Sanctions RP\n\n- Ces sanctions sont décidées par un supérieur hiérarchique RP.\n- Elles ont une portée uniquement roleplay et doivent être jouées en conséquence.\n- Elles peuvent également être levées par un supérieur RP.\n\n> **Exemple —** \"Tu es sanctionné pour ton comportement, tu dois nettoyer l'ensemble du Ministère.\"\n\n### Sanctions HRP\n\nCes sanctions sont plus graves car elles concernent le comportement hors roleplay. Elles sont infligées par votre gérant de faction et fonctionnent par palier :\n\n- **1 / 2 / 3 :** Chaque croix représente un avertissement officiel.\n- À la 3e croix, vous perdez automatiquement votre rôle dans la faction.\n\n> **🚩 Le Drapeau Rouge —**\n> - Sanction exceptionnelle décidée par un conseil regroupant votre gérant de faction et un Super Admin.\n> - Cela signifie que si vous êtes capturé, votre vie est en jeu.\n> - Le gérant de la faction vous ayant capturé pourra demander un CK immédiat, sans avoir à faire de requête.\n\n> **🏴 Le Drapeau Noir —**\n> - Sanction extrême, infligée uniquement par un Super Admin.\n> - Elle signifie que votre vie est systématiquement en danger lors de tout combat RP.\n> - Si vous tombez au combat, vous serez automatiquement CK, sans discussion.\n> - Si vous tentez d'ésquivez cette sanction par un moyen visible, vous serez automatiquement CK.\n\n### Sanction Staff\n\n- Le staff peut vous sanctionner en cas d'infraction au règlement du serveur, même en dehors du cadre RP.\n- En cas de sanction, votre gérant de faction sera immédiatement prévenu.\n- L'Administration (Admin, Super Admin…) se réserve le droit d'appliquer des sanctions sévères si une faute dépasse les compétences du staff ou de votre gérant.\n- Ces décisions sont souveraines et peuvent entraîner des bannissements ou exclusions définitives de votre faction ou du serveur.",
  },
  {
    key: "item-8",
    title: "Les élèves",
    keywords: "les eleves eleves capture foret quidditch",
    markdown:
      "### Capture en Forêt\n\nLes factions Vampire et Mangemort sont autorisées à capturer des élèves en Forêt, uniquement dans un cadre RP justifié.\n\nUne capture est autorisée si au moins l'une des conditions suivantes est remplie :\n\n- L'élève adopte un comportement agressif, provocateur ou un NoFear manifeste ;\n- L'élève interfère volontairement avec une action RP de la faction ;\n- La faction est explicitement à la recherche d'un élève précis dans le cadre d'une mission, d'un ordre hiérarchique ou d'un Ordre de Capture.\n\nEn revanche, il est strictement interdit de capturer un élève :\n\n- se promenant calmement en forêt ;\n- chassant ou prenant l'air sans comportement agressif ;\n- respectant le Fear RP et n'interagissant pas avec la faction.\n\n*Toute capture sans justification RP valable sera considérée comme un abus / WinRP et pourra être sanctionnée.*\n\n> **Capture au Terrain de Quidditch —**\n> Les captures d'élèves au Terrain de Quidditch sont strictement interdites, sans exception.\n> De plus :\n> - L'accès au Terrain de Quidditch est interdit à toute personne en dessous du grade de Membre du Conseil/Commandant Auror/Emissaire du Sang ;\n> - Toute présence non autorisée ou tentative de capture dans cette zone sera sanctionnée.",
  },
];
