import { SITE, TOWNS, HOME_BASE, TRADE_GROUPS, FAQ } from '../data/site';

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}

/** The home page keeps its indexed title verbatim; other pages end with the brand and place. */
export function pageTitle(title: string, isHome = false): string {
  return isHome ? title : `${title} – ${SITE.name}, Étel (56)`;
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE.url}/#entreprise`,
    name: SITE.name,
    description:
      "Courtier en travaux à Étel (56) : sélection de professionnels du bâtiment dans tous les corps d'état, entre Lorient et Vannes.",
    url: `${SITE.url}/`,
    image: absoluteUrl('/og-image.jpg'),
    telephone: '+33297552748',
    email: SITE.email,
    foundingDate: String(SITE.foundedYear),
    identifier: { '@type': 'PropertyValue', name: 'SIRET', value: SITE.siret.replace(/\s/g, '') },
    founder: { '@type': 'Person', name: SITE.broker.name, jobTitle: SITE.broker.role, telephone: '+33674019282' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    areaServed: [
      {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: HOME_BASE.lat, longitude: HOME_BASE.lon },
        geoRadius: '50000',
      },
      ...[HOME_BASE, ...TOWNS].map((t) => ({ '@type': 'City', name: t.name })),
    ],
    knowsAbout: ['Courtage en travaux', ...TRADE_GROUPS.flatMap((g) => g.trades)],
    sameAs: [SITE.facebook],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** Great-circle distance, used to label towns on the zone map. */
export function kmFromEtel(lat: number, lon: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat - HOME_BASE.lat);
  const dLon = rad(lon - HOME_BASE.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(HOME_BASE.lat)) * Math.cos(rad(lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
