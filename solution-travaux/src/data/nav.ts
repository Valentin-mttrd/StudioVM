export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation. Anchors point at home-page sections. */
export const NAV: NavItem[] = [
  { label: 'La méthode', href: '/#methode' },
  { label: "Corps d'état", href: '/#corps-d-etat' },
  { label: 'Réalisations', href: '/nos-derniers-travaux/' },
  { label: 'Zone', href: '/#zone' },
  { label: 'Artisans', href: '/devenir-partenaire/' },
  { label: 'Contact', href: '/contactez-nous/' },
];

/** Every page of the site, as in the current site's menu and footer. */
export const PAGES: NavItem[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Nos réalisations', href: '/nos-derniers-travaux/' },
  { label: 'Devenir partenaire', href: '/devenir-partenaire/' },
  { label: 'Demande de rappel', href: '/demande-de-rappel/' },
  { label: 'Contactez-nous', href: '/contactez-nous/' },
  { label: 'Mentions légales', href: '/mentions-legales/' },
];

export const QUOTE_HREF = '/contactez-nous/#projet';
export const CALLBACK_HREF = '/demande-de-rappel/';
