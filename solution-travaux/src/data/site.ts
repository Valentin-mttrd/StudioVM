/**
 * Every fact the site states about Solution Travaux lives here, and only
 * here. Each value was recovered from the current solution-travaux.fr (see
 * AUDIT.md for sources and confidence). Nothing in this file is invented:
 * unknown values are `null` and the components simply don't render them.
 */

export const SITE = {
  name: 'Solution Travaux',
  legalName: 'SOLUTION TRAVAUX',
  url: 'https://solution-travaux.fr',
  role: 'Courtier en travaux',
  foundedYear: 2010,
  siret: '520 600 032 00012',

  broker: {
    name: "Franck L'Hours",
    // As printed on the current site (surname in capitals).
    displayName: "Franck L'HOURS",
    role: 'Courtier en travaux',
    experience: 'Professionnel du bâtiment depuis plus de 20 ans',
  },

  address: {
    street: '26 rue du Maréchal Foch',
    postalCode: '56410',
    city: 'Étel',
    department: 'Morbihan',
    region: 'Bretagne',
    country: 'FR',
  },

  phone: { display: '02 97 55 27 48', href: 'tel:+33297552748' },
  mobile: { display: '06 74 01 92 82', href: 'tel:+33674019282' },
  email: 'solutiontravaux56@gmail.com',

  // Public page found in search results; confirm it is the one linked from
  // the current site before launch (AUDIT.md).
  facebook: 'https://www.facebook.com/p/Solution-Travaux-%C3%A0-ETEL-100063631987144/',

  // Not published on the current site. Leave null until the client gives them.
  hours: null as null | { days: string; time: string }[],

  // Current host, as stated on the current legal page. Update on migration.
  host: {
    name: 'OVH',
    address: '2 rue Kellermann – 59100 Roubaix – France',
  },
} as const;

export const MAPS_URL =
  'https://www.openstreetmap.org/search?query=26%20rue%20du%20Mar%C3%A9chal%20Foch%2056410%20Etel';

/** Sentences carried over from the current home page. */
export const COPY = {
  intro:
    "Courtier en travaux, nous vous offrons un accompagnement commercial tout au long de la réalisation de votre projet, qu'il s'agisse de construction, d'agrandissement ou simplement de mise aux normes.",
  selection:
    "Solution Travaux a sélectionné pour vous des entreprises dans tous les corps d'état et vous propose celles qui correspondent le mieux à votre besoin.",
  scope:
    "Nous sélectionnons pour vous des professionnels du bâtiment pour tous vos travaux, quelle qu'en soit l'ampleur : rénovation, extension, aménagement de combles, salle de bain, jardin, terrasse, muret, clôture…",
  verification:
    "Franck L'HOURS, professionnel du bâtiment depuis plus de 20 ans, vérifie les assurances et les compétences de toutes les entreprises qu'il vous présente.",
  zone:
    "Créée en 2010, l'agence de courtage en travaux Solution Travaux intervient dans un rayon de 50 km environ autour d'Étel, entre Lorient et Vannes, en passant par Carnac, Quiberon et Auray.",
} as const;

/** The broker's method, in the order the current site describes it. */
export const STEPS = [
  {
    title: 'Visite chez vous sous 48 h',
    text: 'Le courtier se déplace chez vous sous 48 heures maximum pour découvrir le lieu et votre besoin.',
    tag: 'Visite',
  },
  {
    title: 'Définition du projet',
    text: 'Nous définissons ensemble votre projet de travaux et vérifions sa faisabilité.',
    tag: 'Faisabilité',
  },
  {
    title: 'Cahier des charges',
    text: 'Nous établissons le cahier des charges : la base commune sur laquelle chaque entreprise chiffrera.',
    tag: 'Cahier des charges',
  },
  {
    title: 'Consultation des entreprises',
    text: 'Nous présentons votre projet aux entreprises sélectionnées, dont les assurances et les compétences ont été vérifiées.',
    tag: 'Sélection',
  },
  {
    title: 'Réunion sur place si besoin',
    text: 'Si nécessaire, nous organisons une réunion sur place avec tous les intervenants pour étudier la faisabilité selon vos exigences.',
    tag: 'Coordination',
  },
  {
    title: 'Devis vérifiés et expliqués',
    text: 'Nous récupérons tous les devis détaillés, les vérifions et vous les présentons avec nos explications.',
    tag: 'Devis',
  },
  {
    title: 'Vous validez, les travaux démarrent',
    text: 'Vous validez les devis s’ils vous conviennent, et les travaux démarrent.',
    tag: 'Démarrage',
  },
] as const;

/**
 * The trades listed on the current site ("corps d'état"), complete and in
 * their original wording, grouped by building phase for readability.
 * `zone` ties each group to a part of the house drawing (HouseSection).
 */
export const TRADE_GROUPS = [
  {
    id: 'conception',
    title: 'Conception',
    caption: 'Avant le premier coup de pioche',
    zone: 'plan',
    trades: ['Architectes', 'Plans'],
  },
  {
    id: 'gros-oeuvre',
    title: 'Gros œuvre',
    caption: 'Le sol, les fondations, les murs',
    zone: 'ground',
    trades: ['Terrassement', 'Assainissement', 'Maçonnerie'],
  },
  {
    id: 'clos-couvert',
    title: 'Clos & couvert',
    caption: 'Mettre la maison hors d’eau et hors d’air',
    zone: 'envelope',
    trades: ['Charpente', 'Couverture', 'Menuiserie extérieure', 'Fenêtres', 'Enduit'],
  },
  {
    id: 'lots-techniques',
    title: 'Lots techniques',
    caption: 'Confort, énergie, réseaux',
    zone: 'network',
    trades: ['Électricité', 'Plomberie', 'Chauffage', 'Sanitaire', 'Isolation'],
  },
  {
    id: 'second-oeuvre',
    title: 'Second œuvre',
    caption: 'Aménager et finir l’intérieur',
    zone: 'interior',
    trades: [
      'Cloisons',
      'Plaquistes',
      'Portes',
      'Menuiserie intérieure',
      'Chapes',
      'Carrelage',
      'Revêtement de sol',
      'Parquets',
      'Escaliers',
      'Agencement',
      'Peintures',
      'Décorateurs',
    ],
  },
  {
    id: 'exterieurs',
    title: 'Extérieurs',
    caption: 'Clore, accéder, planter',
    zone: 'outside',
    trades: ['Portails', 'Clôtures', 'Paysage'],
  },
] as const;

export const TRADE_COUNT = TRADE_GROUPS.reduce((n, g) => n + g.trades.length, 0);

/**
 * Kinds of projects named on the current site. `id` doubles as the value
 * pre-selected in the project form (/contactez-nous/?projet=<id>).
 */
export const PROJECT_TYPES = [
  { id: 'renovation', label: 'Rénovation', hint: 'Remettre à neuf tout ou partie d’un logement' },
  { id: 'extension', label: 'Extension', hint: 'Gagner des mètres carrés au sol' },
  { id: 'combles', label: 'Aménagement de combles', hint: 'Transformer les combles en pièces à vivre' },
  { id: 'salle-de-bain', label: 'Salle de bain', hint: 'Créer ou refaire une salle d’eau' },
  { id: 'jardin', label: 'Jardin', hint: 'Aménager les abords de la maison' },
  { id: 'terrasse', label: 'Terrasse', hint: 'Prolonger la maison vers l’extérieur' },
  { id: 'muret-cloture', label: 'Muret, clôture', hint: 'Délimiter et fermer la parcelle' },
  { id: 'construction', label: 'Construction', hint: 'Bâtir un projet neuf' },
  { id: 'agrandissement', label: 'Agrandissement', hint: 'Surélever, agrandir, restructurer' },
  { id: 'mise-aux-normes', label: 'Mise aux normes', hint: 'Mettre un bien en conformité' },
  { id: 'economies-energie', label: 'Économies d’énergie', hint: 'Isolation, chauffage, menuiseries' },
] as const;

export type ProjectTypeId = (typeof PROJECT_TYPES)[number]['id'];

/**
 * Towns named on the current site. Coordinates are public town-centre
 * coordinates (WGS84), used only to place the dots on the zone map.
 */
export const HOME_BASE = { name: 'Étel', lat: 47.6563, lon: -3.2004 } as const;

export interface Town {
  name: string;
  lat: number;
  lon: number;
  /** Lorient and Vannes: the ends of the zone as the site describes it. */
  bound?: boolean;
}

export const TOWNS: readonly Town[] = [
  { name: 'Lorient', lat: 47.7483, lon: -3.3702, bound: true },
  { name: 'Gâvres', lat: 47.6922, lon: -3.3392 },
  { name: 'Riantec', lat: 47.7117, lon: -3.3122 },
  { name: 'Merlevenez', lat: 47.7358, lon: -3.2311 },
  { name: 'Plouhinec', lat: 47.6967, lon: -3.2511 },
  { name: 'Erdeven', lat: 47.6417, lon: -3.1567 },
  { name: 'Plouharnel', lat: 47.5975, lon: -3.1128 },
  { name: 'Carnac', lat: 47.5842, lon: -3.0781 },
  { name: 'La Trinité-sur-Mer', lat: 47.5867, lon: -3.0292 },
  { name: 'Quiberon', lat: 47.4839, lon: -3.1194 },
  { name: 'Auray', lat: 47.6678, lon: -2.9817 },
  { name: 'Vannes', lat: 47.6582, lon: -2.7608, bound: true },
];

export const ZONE_RADIUS_KM = 50;

/** Artisan partnership page (/devenir-partenaire/). */
export const PARTNER = {
  audience:
    'Vous êtes artisan et souhaitez trouver de nouveaux chantiers, mais ne pouvez pas ou ne savez pas consacrer assez de temps à la recherche de clients ? Un courtier en travaux vous aide à trouver de nouveaux clients dans les meilleures conditions.',
  benefits: [
    {
      title: 'Des projets pré-évalués',
      text: 'Chaque projet vous arrive déjà évalué : besoin défini, faisabilité étudiée, cahier des charges établi.',
    },
    {
      title: 'Un budget contrôlé',
      text: 'L’adéquation du projet avec le budget du client a été contrôlée par Solution Travaux.',
    },
    {
      title: 'Du temps pour vos chantiers',
      text: 'Vous gagnez le temps du développement commercial pour vous concentrer sur vos chantiers et vos clients.',
    },
  ],
  requirements: [
    'Des attestations d’assurance à jour (responsabilité civile et décennale).',
    'Justifier de la qualité de votre travail : qualifications et respect des normes.',
  ],
} as const;

/**
 * FAQ built only from facts above — each answer restates the current site.
 * Rendered on the home page and exposed as FAQPage structured data.
 */
export const FAQ = [
  {
    q: 'Qu’est-ce qu’un courtier en travaux ?',
    a: `Un intermédiaire entre vous et les professionnels du bâtiment. ${COPY.selection} Il vous accompagne tout au long de la réalisation de votre projet, qu’il s’agisse de construction, d’agrandissement ou de mise aux normes.`,
  },
  {
    q: 'Dans quel délai venez-vous voir mon projet ?',
    a: 'Le courtier se déplace chez vous sous 48 heures maximum.',
  },
  {
    q: 'Comment les entreprises sont-elles choisies ?',
    a: `${COPY.verification} Solution Travaux vous propose celles qui correspondent le mieux à votre besoin.`,
  },
  {
    q: 'Quels travaux pouvez-vous prendre en charge ?',
    a: `Tous les travaux, quelle qu’en soit l’ampleur : rénovation, extension, aménagement de combles, salle de bain, jardin, terrasse, muret, clôture… Le réseau couvre l’ensemble des corps d’état, des plans à la décoration et au paysage.`,
  },
  {
    q: 'Où intervenez-vous ?',
    a: 'Dans un rayon de 50 km environ autour d’Étel, entre Lorient et Vannes : Auray, Erdeven, Merlevenez, Plouhinec, Riantec, Gâvres, Plouharnel, Carnac, Quiberon, La Trinité-sur-Mer…',
  },
  {
    q: 'Qui décide du choix des devis ?',
    a: 'Vous. Nous récupérons les devis détaillés, les vérifions et vous les présentons avec nos explications ; vous les validez s’ils vous conviennent, puis les travaux démarrent.',
  },
  {
    q: 'Je suis artisan : comment rejoindre le réseau ?',
    a: 'Présentez votre entreprise depuis la page « Devenir partenaire ». Des attestations d’assurance à jour et des justificatifs de la qualité de votre travail vous seront demandés.',
  },
] as const;
