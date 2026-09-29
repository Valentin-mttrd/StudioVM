/**
 * Every fact the site states about PRO PAYSAGES lives here, and only here.
 * Each value was recovered from the current pro-paysages-56.fr or from the
 * company's own directory listing (see AUDIT.md for sources and confidence).
 * Nothing in this file is invented: unknown values are `null` and the
 * components simply don't render them.
 */

export const SITE = {
  name: 'PRO PAYSAGES',
  // Display form used in running text.
  shortName: 'Pro Paysages',
  url: 'https://pro-paysages-56.fr',
  role: 'Paysagiste',
  foundedYear: 2012,
  legalForm: 'SARL',
  siren: '749 903 365',
  siret: '749 903 365 00015',

  address: {
    street: 'Route du Quartz',
    area: 'PA de Kergantic',
    postalCode: '56270',
    city: 'Ploemeur',
    department: 'Morbihan',
    region: 'Bretagne',
    country: 'FR',
  },

  phone: { display: '06 16 46 75 24', href: 'tel:+33616467524', e164: '+33616467524' },
  email: 'propaysages56@orange.fr',

  /**
   * From the company's PagesJaunes listing; not shown on the current site.
   * Confirm with the client before launch — set to null to hide everywhere.
   */
  hours: [
    { days: 'Lundi – vendredi', time: '8 h – 12 h · 13 h 30 – 18 h 30', dayCodes: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: ['08:00', '13:30'], closes: ['12:00', '18:30'] },
    { days: 'Samedi, dimanche', time: 'Fermé', dayCodes: [], opens: [], closes: [] },
  ] as null | { days: string; time: string; dayCodes: string[]; opens: string[]; closes: string[] }[],

  /**
   * Host of the new site, for the legal notice. Netlify is the planned host;
   * update if it goes elsewhere.
   */
  host: {
    name: 'Netlify, Inc.',
    address: '44 Montgomery Street, Suite 300, San Francisco, CA 94104, États-Unis',
    url: 'https://www.netlify.com',
  },
} as const;

export const MAPS_URL =
  'https://www.openstreetmap.org/search?query=Route%20du%20Quartz%2C%2056270%20Ploemeur';

/** The towns the current site names, in its order. */
export const TOWNS = ['Ploemeur', 'Larmor-Plage', 'Quéven', 'Hennebont'] as const;
export const TOWNS_TEXT = 'Ploemeur, Larmor-Plage, Quéven et Hennebont';

/** "Rayon de 50 km autour de Ploemeur" — company listing (AUDIT.md). */
export const ZONE_RADIUS_KM = 50;
/** Ploemeur town centre (GeoNames), centre of the zone. */
export const HOME_BASE = { name: 'Ploemeur', lat: 47.73512, lon: -3.42952 } as const;

/** Sentences carried over from the current site (lightly trimmed where marked in AUDIT.md). */
export const COPY = {
  intro:
    'Située à Ploemeur, l’entreprise PRO PAYSAGES prend en charge tous vos projets de création et d’entretien de jardin à proximité de Larmor-Plage, Quéven et Hennebont.',
  expertise:
    'Au service des particuliers et des professionnels depuis 2012, notre paysagiste qualifié met son expertise à votre disposition pour vous offrir un espace extérieur qui reflète votre style et répond à vos besoins.',
  scope:
    'Nos prestations à Ploemeur, Quéven, Hennebont, Larmor-Plage et alentours : de la conception à la réalisation, en passant par l’entretien régulier de votre espace vert.',
  listening: 'Une communication ouverte et transparente, pour comprendre vos besoins et vos envies.',
  commitment:
    'Notre engagement en tant que paysagiste va au-delà du simple travail de création d’espaces extérieurs ou d’entretien de jardin : nous déployons tous nos efforts pour concevoir un aménagement qui vous ressemble.',
  creation:
    'Pour la création de votre jardin à Ploemeur, Quéven, Hennebont et Larmor-Plage, nos artisans qualifiés assurent la pose de clôture, la création de massifs et différents travaux de maçonnerie paysagère.',
  creationAtoZ:
    'Pour l’engazonnement, la plantation de fleurs et d’arbustes, la création de massifs floraux ou la mise en place d’un système d’arrosage automatisé, nos paysagistes expérimentés vous accompagnent de A à Z.',
  maintenance:
    'Pour la taille de haie, la tonte de pelouse et bien d’autres interventions, notre équipe qualifiée est disponible dans tout le Morbihan, notamment à Ploemeur, Larmor-Plage, Quéven et Hennebont.',
  maintenanceFull:
    'En plus de notre expérience en création de jardin, nous proposons des services complets pour maintenir votre espace extérieur dans un état optimal.',
  quote: 'Pour un devis gratuit ou plus d’informations, contactez-nous au 06 16 46 75 24.',
  contact:
    'Pour toutes vos demandes ou suggestions, remplissez le formulaire ci-dessous : nous vous répondrons dans les plus brefs délais.',
} as const;

export type ServiceGroup = 'creation' | 'entretien';

export interface Service {
  /** Also the value pre-selected in the quote form (/contact/?projet=<id>). */
  id: string;
  group: ServiceGroup;
  title: string;
  text: string;
  icon: IconName;
}

export type IconName =
  | 'garden'
  | 'fence'
  | 'wall'
  | 'paving'
  | 'lawn'
  | 'flower'
  | 'water'
  | 'hedge'
  | 'mower'
  | 'brush'
  | 'edge'
  | 'shrub'
  | 'leaves';

/**
 * Every service named on the current site or in the company's own listing
 * (AUDIT.md §2). Descriptions only restate that wording.
 */
export const SERVICES: readonly Service[] = [
  {
    id: 'creation-jardin',
    group: 'creation',
    title: 'Création de jardins et de parcs',
    text: 'Votre extérieur pensé de la conception à la réalisation, pour qu’il reflète votre style et réponde à vos besoins.',
    icon: 'garden',
  },
  {
    id: 'cloture',
    group: 'creation',
    title: 'Pose de clôture',
    text: 'Construction et pose de clôtures par nos artisans qualifiés.',
    icon: 'fence',
  },
  {
    id: 'maconnerie',
    group: 'creation',
    title: 'Maçonnerie paysagère',
    text: 'Différents travaux de maçonnerie paysagère pour structurer le jardin.',
    icon: 'wall',
  },
  {
    id: 'dallage',
    group: 'creation',
    title: 'Dallage et pavage',
    text: 'Des surfaces dallées ou pavées pour circuler et profiter du jardin.',
    icon: 'paving',
  },
  {
    id: 'massifs',
    group: 'creation',
    title: 'Massifs et plantations',
    text: 'Création de massifs floraux, plantation de fleurs et d’arbustes.',
    icon: 'flower',
  },
  {
    id: 'engazonnement',
    group: 'creation',
    title: 'Engazonnement',
    text: 'La mise en place de votre pelouse, accompagnée de A à Z.',
    icon: 'lawn',
  },
  {
    id: 'arrosage',
    group: 'creation',
    title: 'Arrosage automatique',
    text: 'La mise en place d’un système d’arrosage automatisé.',
    icon: 'water',
  },
  {
    id: 'taille-haie',
    group: 'entretien',
    title: 'Taille de haie',
    text: 'Des haies nettes et maîtrisées, taillées par notre équipe qualifiée.',
    icon: 'hedge',
  },
  {
    id: 'tonte',
    group: 'entretien',
    title: 'Tonte de pelouse',
    text: 'L’entretien et la tonte de votre pelouse.',
    icon: 'mower',
  },
  {
    id: 'taille-arbustes',
    group: 'entretien',
    title: 'Taille d’arbustes, de talus et de massifs',
    text: 'Arbustes, talus et massifs taillés pour garder leur forme.',
    icon: 'shrub',
  },
  {
    id: 'debroussaillage',
    group: 'entretien',
    title: 'Débroussaillage',
    text: 'Remettre au propre un terrain envahi par la végétation.',
    icon: 'brush',
  },
  {
    id: 'bordures',
    group: 'entretien',
    title: 'Découpe de bordures',
    text: 'Des limites franches entre pelouse, massifs et allées.',
    icon: 'edge',
  },
  {
    id: 'ramassage',
    group: 'entretien',
    title: 'Ramassage des feuilles et des branches',
    text: 'Ramassage des feuilles mortes et des branches cassées.',
    icon: 'leaves',
  },
] as const;

export const SERVICE_GROUPS = {
  creation: {
    title: 'Création de jardin',
    kicker: 'Concevoir et réaliser',
    path: '/creation-de-jardin-ploemeur-pose-de-cloture-larmor-plage-queven-hennebont/',
    short: 'Clôtures, massifs, maçonnerie paysagère, dallage, gazon, arrosage.',
  },
  entretien: {
    title: 'Entretien de jardin',
    kicker: 'Entretenir, saison après saison',
    path: '/entretien-de-jardin-taille-de-haie-ploemeur-larmor-plage-queven-hennebont/',
    short: 'Taille de haie, tonte, débroussaillage, bordures, ramassage.',
  },
} as const;

export const servicesOf = (group: ServiceGroup) => SERVICES.filter((s) => s.group === group);

/**
 * How a project unfolds, in the order the current site describes it
 * ("de la conception à la réalisation, en passant par l'entretien") preceded
 * by the free quote it offers. No step, delay or tool is added.
 */
export const STEPS = [
  {
    id: 'echange',
    title: 'Premier échange',
    text: 'Un appel ou un message pour nous présenter votre jardin. Une communication ouverte et transparente, pour comprendre vos besoins et vos envies.',
  },
  {
    id: 'devis',
    title: 'Devis gratuit',
    text: 'Vous recevez un devis gratuit pour votre projet de création ou d’entretien.',
  },
  {
    id: 'conception',
    title: 'Conception',
    text: 'Nous concevons avec vous un aménagement qui vous ressemble et qui répond à vos besoins.',
  },
  {
    id: 'realisation',
    title: 'Réalisation',
    text: 'Nos artisans qualifiés réalisent les travaux : clôtures, massifs, maçonnerie paysagère, gazon, arrosage.',
  },
  {
    id: 'entretien',
    title: 'Entretien régulier',
    text: 'Taille, tonte, ramassage : nous maintenons votre espace extérieur dans un état optimal.',
  },
] as const;

/**
 * FAQ built only from facts above — each answer restates the current site
 * or the company's listing. Rendered with FAQPage structured data.
 */
export const FAQ = [
  {
    id: 'zone',
    q: 'Dans quelles communes intervenez-vous ?',
    a: `Nous sommes installés à Ploemeur et intervenons notamment à Larmor-Plage, Quéven et Hennebont, dans un rayon de ${ZONE_RADIUS_KM} km autour de Ploemeur. Pour l’entretien de jardin, notre équipe est disponible dans tout le Morbihan.`,
    pages: ['home', 'creation', 'entretien'],
  },
  {
    id: 'devis',
    q: 'Le devis est-il gratuit ?',
    a: `Oui. Pour un devis gratuit ou plus d’informations, appelez le ${SITE.phone.display} ou décrivez votre projet dans le formulaire de contact.`,
    pages: ['home', 'creation', 'entretien'],
  },
  {
    id: 'clients',
    q: 'Travaillez-vous pour les particuliers et les professionnels ?',
    a: 'Oui : PRO PAYSAGES est au service des particuliers et des professionnels depuis 2012, pour l’entretien de jardins comme de parcs.',
    pages: ['home', 'entretien'],
  },
  {
    id: 'a-z',
    q: 'Pouvez-vous prendre en charge tout mon projet de jardin ?',
    a: 'Oui, de la conception à la réalisation, puis l’entretien régulier : engazonnement, plantation de fleurs et d’arbustes, massifs, arrosage automatique, pose de clôture et maçonnerie paysagère.',
    pages: ['home', 'creation'],
  },
  {
    id: 'entretien',
    q: 'Quelles interventions d’entretien proposez-vous ?',
    a: 'Taille de haie, tonte de pelouse, débroussaillage, découpe de bordures, taille d’arbustes, de talus et de massifs, ramassage des feuilles mortes et des branches cassées.',
    pages: ['home', 'entretien'],
  },
  {
    id: 'contact',
    q: 'Comment vous joindre ?',
    a: `Par téléphone au ${SITE.phone.display}, par e-mail à ${SITE.email}, ou via le formulaire de contact : nous vous répondrons dans les plus brefs délais.`,
    pages: ['home', 'creation', 'entretien'],
  },
] as const;

export type FaqPage = (typeof FAQ)[number]['pages'][number];
export const faqFor = (page: FaqPage) => FAQ.filter((f) => (f.pages as readonly string[]).includes(page));
