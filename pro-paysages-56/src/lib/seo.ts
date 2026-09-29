import { SITE, SERVICES, SERVICE_GROUPS, TOWNS, HOME_BASE, ZONE_RADIUS_KM, type ServiceGroup } from '../data/site';

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}

/** Indexed titles are kept verbatim (AUDIT.md §7); the home adds the brand. */
export function pageTitle(title: string, withBrand = false): string {
  return withBrand ? `${title} – ${SITE.name}` : title;
}

const phone = SITE.phone.e164;

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE.url}/#entreprise`,
    name: SITE.name,
    description:
      'Paysagiste à Ploemeur (56) : création et entretien de jardins, pose de clôture, maçonnerie paysagère, taille de haie, pour les particuliers et les professionnels.',
    url: `${SITE.url}/`,
    image: absoluteUrl('/og-image.jpg'),
    logo: absoluteUrl('/icon-512.png'),
    telephone: phone,
    email: SITE.email,
    foundingDate: String(SITE.foundedYear),
    identifier: { '@type': 'PropertyValue', name: 'SIRET', value: SITE.siret.replace(/\s/g, '') },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${SITE.address.street}, ${SITE.address.area}`,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    ...(SITE.hours
      ? {
          openingHoursSpecification: SITE.hours.flatMap((h) =>
            h.opens.map((opens, i) => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: h.dayCodes.map((d) => DAY[d]),
              opens,
              closes: h.closes[i],
            })),
          ),
        }
      : {}),
    areaServed: [
      {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: HOME_BASE.lat, longitude: HOME_BASE.lon },
        geoRadius: String(ZONE_RADIUS_KM * 1000),
      },
      ...TOWNS.map((t) => ({ '@type': 'City', name: t })),
      { '@type': 'AdministrativeArea', name: 'Morbihan' },
    ],
    knowsAbout: SERVICES.map((s) => s.title),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Prestations de paysagiste',
      itemListElement: (Object.keys(SERVICE_GROUPS) as ServiceGroup[]).map((g) => ({
        '@type': 'OfferCatalog',
        name: SERVICE_GROUPS[g].title,
        itemListElement: SERVICES.filter((s) => s.group === g).map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.title },
        })),
      })),
    },
  };
}

const DAY: Record<string, string> = {
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
  Su: 'Sunday',
};

export function serviceSchema(group: ServiceGroup, description: string) {
  const g = SERVICE_GROUPS[group];
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: g.title,
    serviceType: g.title,
    description,
    url: absoluteUrl(g.path),
    provider: { '@id': `${SITE.url}/#entreprise` },
    areaServed: [...TOWNS.map((t) => ({ '@type': 'City', name: t })), { '@type': 'AdministrativeArea', name: 'Morbihan' }],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: g.title,
      itemListElement: SERVICES.filter((s) => s.group === group).map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.text },
      })),
    },
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

export function faqSchema(items: readonly { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
