import { business, hours, mapLinks } from '@/data/business';
import { soins } from '@/data/soins';
import type { FaqItem } from '@/data/faq';

export const SITE_DESCRIPTION =
  'Institut de beauté slow cosmétique à Lorient : soins visage et corps 100 % naturels, semi-permanent manioc & maïs, cire végétale. Réservation en ligne.';

export function absoluteUrl(path: string, site: URL | undefined): string {
  if (/^https?:/.test(path)) return path;
  return new URL(path, site).toString().replace(/\/$/, '');
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function businessSchema(site: URL | undefined) {
  const url = absoluteUrl('/', site);
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${url}/#institut`,
    name: business.name,
    legalName: business.legalName,
    description: SITE_DESCRIPTION,
    url,
    image: absoluteUrl('/og.jpg', site),
    logo: absoluteUrl('/icons/icon-512.png', site),
    telephone: business.phone.international,
    ...(business.email ? { email: business.email } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      postalCode: business.address.postalCode,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      addressCountry: business.address.country,
    },
    hasMap: mapLinks.google,
    areaServed: { '@type': 'City', name: business.address.city },
    openingHoursSpecification: hours
      .filter((d) => d.slots.length > 0)
      .flatMap((d) =>
        d.slots.map(([opens, closes]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${dayNames[d.day]}`,
          opens,
          closes,
        })),
      ),
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Parking facile d’accès', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Cabine UV', value: business.facilities.uvRoom },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Carte des soins',
      itemListElement: soins.map((family) => ({
        '@type': 'OfferCatalog',
        name: family.name,
        url: absoluteUrl(`/soins#${family.id}`, site),
        itemListElement: family.covers.map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      })),
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: { '@type': 'EntryPoint', urlTemplate: business.booking.url },
    },
    sameAs: [business.links.instagram, business.links.facebook, business.links.kalendesSite],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[], site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, site),
    })),
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
