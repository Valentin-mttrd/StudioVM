/**
 * Every fact about the institute lives here, once. Pages and components
 * read from this file — never hard-code an address, a number or an hour
 * anywhere else.
 *
 * Sources and open questions: see AUDIT.md at the project root. Values
 * marked "à confirmer" there must be validated with the institute before
 * going live (the opening hours drive the live "Ouvert / Fermé" status).
 */

export const business = {
  name: "L'atypique",
  legalName: "L'ATYPIQUE",
  activity: 'Institut de beauté',
  positioning: 'Slow cosmétique',
  city: 'Lorient',

  address: {
    street: '14 rue du Général Dubail',
    postalCode: '56100',
    city: 'Lorient',
    department: 'Morbihan',
    region: 'Bretagne',
    country: 'FR',
  },

  phone: {
    display: '09 81 94 09 93',
    href: 'tel:+33981940993',
    international: '+33981940993',
  },

  /** Contact e-mail — not published anywhere we could reach. To complete. */
  email: null as string | null,

  /** Online booking stays on Kalendes, the institute's booking engine. */
  booking: {
    url: 'https://www.kalendes.com/platform/booking/latypique',
    provider: 'Kalendes',
  },

  links: {
    kalendesSite: 'https://www.kalendes.com/latypique/#/welcome',
    instagram: 'https://www.instagram.com/latypique_lorient/',
    instagramHandle: '@latypique_lorient',
    facebook: 'https://www.facebook.com/p/Latypique-institut-de-beaut%C3%A9-100070547212556/',
  },

  maps: {
    query: "L'atypique, 14 rue du Général Dubail, 56100 Lorient",
  },

  /** Average of public online reviews (Unib-France, Sept. 2026). À confirmer. */
  rating: {
    value: 4.9,
    best: 5,
    countLabel: 'plus de 50 avis',
  },

  facilities: {
    treatmentRooms: 2,
    uvRoom: true,
    parking: 'Parking facile d’accès',
    renovated: true,
  },

  legal: {
    form: 'SARL unipersonnelle',
    capital: '3 000 €',
    siren: '901 208 744',
    siret: '901 208 744 00010',
    rcs: 'RCS Lorient 901 208 744',
    ape: '96.02B — Soins de beauté',
    manager: 'Lucia Rideau',
    created: '13 juillet 2021',
  },
} as const;

const encodedQuery = encodeURIComponent(business.maps.query);

export const mapLinks = {
  google: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
  apple: `https://maps.apple.com/?q=${encodeURIComponent(business.name)}&address=${encodeURIComponent(
    `${business.address.street}, ${business.address.postalCode} ${business.address.city}`,
  )}`,
  waze: `https://waze.com/ul?q=${encodeURIComponent(
    `${business.address.street} ${business.address.postalCode} ${business.address.city}`,
  )}&navigate=yes`,
  embed: `https://www.google.com/maps?q=${encodedQuery}&output=embed`,
  reviews: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
} as const;

export type Slot = readonly [open: string, close: string];

export interface DayHours {
  /** 0 = Sunday … 6 = Saturday (same as Date#getDay). */
  day: number;
  label: string;
  short: string;
  slots: readonly Slot[];
}

/**
 * Opening hours, Monday first. Saturday is the one value sources disagree
 * on (10h–17h vs 10h–13h30) — à confirmer, see AUDIT.md.
 */
export const hours: readonly DayHours[] = [
  { day: 1, label: 'Lundi', short: 'Lun', slots: [['14:00', '18:00']] },
  { day: 2, label: 'Mardi', short: 'Mar', slots: [['09:30', '19:00']] },
  { day: 3, label: 'Mercredi', short: 'Mer', slots: [['09:30', '19:00']] },
  { day: 4, label: 'Jeudi', short: 'Jeu', slots: [['09:30', '19:00']] },
  { day: 5, label: 'Vendredi', short: 'Ven', slots: [['09:30', '19:00']] },
  { day: 6, label: 'Samedi', short: 'Sam', slots: [['10:00', '17:00']] },
  { day: 0, label: 'Dimanche', short: 'Dim', slots: [] },
];

export const TIME_ZONE = 'Europe/Paris';
