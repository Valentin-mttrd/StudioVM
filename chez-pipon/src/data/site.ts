/**
 * Chez Pipon — every fact the site shows lives here, once.
 *
 * Nothing below is invented: each block names where it comes from (see
 * AUDIT.md for the full list of sources and the points that still need the
 * owners' confirmation). To update the site, edit this file — hours, prices,
 * links and texts flow to every section, the live "open now" status, the
 * booking helper and the structured data at once.
 */
import { SITE_URL } from './site-url.mjs';

export const SITE = {
  url: SITE_URL,
  name: 'Chez Pipon',
  /** Stylisation used by the restaurant itself on Instagram (@chezpipon). */
  brandName: 'Chez PiPon',
  kind: 'Restaurant',
  city: 'Lorient',
  locale: 'fr_FR',
} as const;

export const CONTACT = {
  phoneDisplay: '06 98 33 63 15',
  phoneHref: 'tel:+33698336315',
  phoneE164: '+33698336315',
  instagramHandle: 'chezpipon',
  instagramUrl: 'https://www.instagram.com/chezpipon/',
  /** Opens a direct-message thread with @chezpipon (app or web). */
  instagramDmUrl: 'https://ig.me/m/chezpipon',
} as const;

export const ADDRESS = {
  street: '9 avenue de la Perrière',
  postalCode: '56100',
  city: 'Lorient',
  region: 'Bretagne',
  country: 'FR',
  /** Wording used by Lorient Bretagne Sud Tourisme. */
  situation: "À l'entrée de l'avenue de la Perrière",
} as const;

const mapQuery = encodeURIComponent(`Chez Pipon, ${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.city}`);

export const MAPS = {
  google: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
  apple: `https://maps.apple.com/?q=${encodeURIComponent('Chez Pipon')}&address=${encodeURIComponent(`${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.city}, France`)}`,
  waze: `https://waze.com/ul?q=${mapQuery}&navigate=yes`,
  /** Keyless Google Maps embed — only injected after the visitor asks for it. */
  embed: `https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`,
} as const;

/* --------------------------------------------------------------------------
   Opening hours
   Most recent published schedule: Gault&Millau 2026 (“le midi et le
   vendredi soir”), Tripadvisor and Kazfeed listings. The opening-time
   listings (Office de tourisme, déc. 2025) still say Monday to Friday lunch
   + Monday evening — ⚠️ to confirm with the owners (see AUDIT.md).
   Days: 0 = Monday … 6 = Sunday. Times are Europe/Paris wall-clock.
   -------------------------------------------------------------------------- */
export type ServiceName = 'midi' | 'soir';
export interface Service {
  name: ServiceName;
  open: string;
  close: string;
}

export const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const;

export const HOURS: Service[][] = [
  /* lundi */ [],
  /* mardi */ [{ name: 'midi', open: '11:30', close: '15:00' }],
  /* mercredi */ [{ name: 'midi', open: '11:30', close: '15:00' }],
  /* jeudi */ [{ name: 'midi', open: '11:30', close: '15:00' }],
  /* vendredi */ [
    { name: 'midi', open: '11:30', close: '15:00' },
    { name: 'soir', open: '19:00', close: '22:00' },
  ],
  /* samedi */ [],
  /* dimanche */ [],
];

export const HOURS_NOTE =
  'Horaires susceptibles d’évoluer (jours fériés, congés) : les nouvelles sont publiées sur Instagram, et un coup de fil lève tout doute.';

/* --------------------------------------------------------------------------
   Menu & prices — Office de tourisme, Tripadvisor, Gault&Millau 2026.
   -------------------------------------------------------------------------- */
export const MENU = {
  format: [
    { count: 2, label: 'entrées' },
    { count: 3, label: 'plats', note: 'dont une option végétarienne' },
    { count: 2, label: 'desserts' },
  ],
  lunchSet: { label: 'Entrée · plat · dessert', price: '22 €', when: 'le midi en semaine' },
  /** Gault&Millau 2026 budget per person, drinks excluded. */
  budget: '19,50 € à 22 €',
  budgetNote: 'hors boissons',
  /** Dishes named in the Gault&Millau 2026 review — past plates, not today's menu. */
  notedDishes: [
    { title: 'Terrine de campagne porto-pistache', detail: 'pickles maison' },
    { title: 'Filet de dorade rôti', detail: 'crème de pois cassés et potimarron' },
  ],
} as const;

/* --------------------------------------------------------------------------
   People — Gault&Millau 2026, Le Télégramme, presse locale (déc. 2025).
   -------------------------------------------------------------------------- */
export const TEAM = [
  {
    id: 'victor',
    name: 'Victor Chaigneau',
    role: 'En cuisine',
    bio: [
      'Formé à l’école Ferrandi, passé par des maisons étoilées, il a dirigé le Café Parisien, rue Monge, dans le 5e arrondissement de Paris.',
      'Dans sa petite cuisine de l’avenue de la Perrière, il compose avec le marché et les arrivages du jour : des assiettes simples, qui révèlent un vrai savoir-faire.',
    ],
    award: 'Une toque au Gault&Millau Bretagne 2026',
  },
  {
    id: 'eileen',
    name: 'Eileen Wallet',
    role: 'En salle',
    bio: [
      'Musicienne — piano, jazz, punk — puis fleuriste, elle rencontre Victor dans le 5e arrondissement de Paris.',
      'En salle, elle apporte toute son énergie et sa bonne humeur.',
    ],
    award: 'Jeune Talent en salle — Gault&Millau Bretagne 2026',
  },
] as const;

export const STORY = {
  opened: '2025-12-01',
  openedLabel: '1er décembre 2025',
  /** À deux, ils assurent jusqu'à ~35 couverts par service (Gault&Millau 2026). */
  covers: 35,
  predecessor: 'Paihia Kitchen',
} as const;

/* --------------------------------------------------------------------------
   Recognition & press — links point to the original pages.
   -------------------------------------------------------------------------- */
export const AWARDS = [
  {
    source: 'Gault&Millau',
    title: 'Une toque',
    detail: 'Guide Bretagne 2026 — Victor Chaigneau, chef',
  },
  {
    source: 'Gault&Millau',
    title: 'Jeune Talent en salle',
    detail: 'Tour Bretagne 2026 — Eileen Wallet, remis le 1er juin 2026 à Vannes',
  },
] as const;

/**
 * What the Gault&Millau review describes — summarised, not quoted verbatim
 * (the original page could not be read during the audit). Replace with the
 * exact wording once checked on the guide's page.
 */
export const REVIEW_SUMMARY = {
  source: 'Gault&Millau 2026',
  url: 'https://fr.gaultmillau.com/fr/restaurants/chez-pi-pon',
  points: [
    'Un restaurant d’angle aux airs de brasserie, avec une large devanture verte et vitrée.',
    'Une cuisine inspirée du marché : des assiettes simples qui révèlent un vrai savoir-faire.',
    'Une jolie formule à prix serrés, dans un cadre décontracté et lumineux.',
  ],
} as const;

export const ELSEWHERE = [
  { label: 'Gault&Millau', detail: 'La fiche du guide', url: 'https://fr.gaultmillau.com/fr/restaurants/chez-pi-pon' },
  {
    label: 'Le Bouillon',
    detail: 'Le chef qui cuisine sans menu fixe',
    url: 'https://www.le-bouillon-larochelle.fr/chez-pipon-a-lorient-le-secret-de-ce-chef-distingue-par-le-gault-et-millau-qui-cuisine-sans-menu-fixe/',
  },
  {
    label: 'Tripadvisor',
    detail: 'Les avis des clients',
    url: 'https://www.tripadvisor.fr/Restaurant_Review-g196530-d34442199-Reviews-Chez_Pipon-Lorient_Morbihan_Brittany.html',
  },
  {
    label: 'Lorient Bretagne Sud Tourisme',
    detail: 'La fiche de l’office de tourisme',
    url: 'https://www.lorientbretagnesudtourisme.fr/fr/fiche/chez-pipon-lorient_TFOTCHEZPIPON/',
  },
] as const;

/* --------------------------------------------------------------------------
   Commitments — Office de tourisme, presse locale, En Boîte Le Plat.
   -------------------------------------------------------------------------- */
export const TAKEAWAY = {
  network: 'En Boîte Le Plat',
  url: 'https://www.enboiteleplat.fr/commerces-utilisateurs/chez-pipon',
  text: 'Chez Pipon fait partie du réseau En Boîte Le Plat : à emporter, les plats partent dans des boîtes en verre consignées, à rapporter dans n’importe quel commerce partenaire, qui les lave et les remet en circulation.',
} as const;

/* --------------------------------------------------------------------------
   Access — Acceslibre (fiche confirmée le 25/12/2025).
   -------------------------------------------------------------------------- */
export const ACCESS = {
  bus: 'Arrêt Beaux Arts, à proximité',
  parking: 'Pas de parking privé ; places dans la rue à proximité, dont des places réservées PMR',
  entrance: 'Entrée bien visible, porte vitrée battante à ouvrir soi-même',
  step: 'Une marche à monter pour entrer',
  sourceLabel: 'Fiche Acceslibre',
  sourceUrl: 'https://acceslibre.beta.gouv.fr/app/56-lorient/a/restaurant/erp/chez-pipon/',
} as const;

/* --------------------------------------------------------------------------
   Legal — Annuaire des entreprises (data.gouv.fr).
   -------------------------------------------------------------------------- */
export const LEGAL = {
  company: 'EILVIC',
  form: 'SARL au capital de 10 000 €',
  siren: '991 517 301',
  rcs: 'RCS Lorient',
  headOffice: `${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.city}`,
  /** ⚠️ À compléter par l'éditeur avant mise en ligne. */
  publicationDirector: null as string | null,
  host: {
    name: 'Netlify, Inc.',
    address: '512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis',
    url: 'https://www.netlify.com',
  },
  design: { name: 'Studio VM', url: 'https://www.studiovm-design.fr' },
} as const;

export const NAV = [
  { href: '/#cuisine', label: 'La cuisine' },
  { href: '/#ardoise', label: 'L’ardoise' },
  { href: '/#duo', label: 'Le duo' },
  { href: '/#infos', label: 'Infos pratiques' },
] as const;
