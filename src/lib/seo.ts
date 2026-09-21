import { SITE } from './constants';

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean === '/' ? '' : clean}`;
}

export function pageTitle(title: string, isHome = false): string {
  return isHome ? title : `${title} · ${SITE.name}`;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    founder: {
      '@type': 'Person',
      name: SITE.founder,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.latitude,
      longitude: SITE.longitude,
    },
    areaServed: 'FR',
    knowsAbout: [
      'Création de sites web',
      'Développement web sur mesure',
      'Applications métier',
      'Visualisation 3D architecturale',
    ],
    sameAs: [],
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
