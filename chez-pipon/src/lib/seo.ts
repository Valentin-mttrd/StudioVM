import { ADDRESS, AWARDS, CONTACT, DAY_NAMES, ELSEWHERE, HOURS, LEGAL, MENU, SITE, STORY, TEAM } from '../data/site';

const SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}

export function pageTitle(title: string, isHome = false): string {
  return isHome ? title : `${title} · ${SITE.name}, restaurant à Lorient`;
}

/** schema.org Restaurant — every value comes from data/site.ts. */
export function restaurantSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE.url}/#restaurant`,
    name: SITE.name,
    alternateName: SITE.brandName,
    legalName: LEGAL.company,
    url: `${SITE.url}/`,
    image: absoluteUrl('/og-image.jpg'),
    telephone: CONTACT.phoneE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ADDRESS.street,
      postalCode: ADDRESS.postalCode,
      addressLocality: ADDRESS.city,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.country,
    },
    servesCuisine: ['Française', 'Cuisine de saison', 'Fait maison'],
    priceRange: MENU.budget.replace(' à ', ' – '),
    acceptsReservations: true,
    foundingDate: STORY.opened,
    openingHoursSpecification: HOURS.flatMap((services, day) =>
      services.map((s) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${SCHEMA_DAYS[day]}`,
        opens: s.open,
        closes: s.close,
      }))
    ),
    award: AWARDS.map((a) => `${a.source} — ${a.title} (${a.detail})`),
    employee: TEAM.map((p) => ({
      '@type': 'Person',
      name: p.name,
      jobTitle: p.id === 'victor' ? 'Chef' : 'Service en salle',
    })),
    sameAs: [CONTACT.instagramUrl, ...ELSEWHERE.filter((e) => e.label !== 'Le Bouillon').map((e) => e.url)],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: `${SITE.url}/`,
    inLanguage: 'fr-FR',
    publisher: { '@id': `${SITE.url}/#restaurant` },
  };
}

export { DAY_NAMES };
