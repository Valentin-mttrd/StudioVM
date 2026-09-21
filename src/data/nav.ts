export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Services', href: '/services' },
  { label: 'Réalisations', href: '/realisations' },
  { label: 'À propos', href: '/a-propos' },
];

export const PRIMARY_CTA: NavLink = {
  label: 'Parlons de votre projet',
  href: '/contact',
};

export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
];
