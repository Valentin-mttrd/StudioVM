export interface NavItem {
  label: string;
  href: string;
  /** Short line under the label in the mobile menu. */
  hint: string;
}

export const nav: NavItem[] = [
  { label: 'Soins', href: '/soins', hint: 'Visage, corps, épilation, mains, pieds…' },
  { label: 'L’institut', href: '/institut', hint: 'La slow cosmétique, l’espace, l’équipe' },
  { label: 'Infos pratiques', href: '/infos-pratiques', hint: 'Accès, horaires, contact, questions' },
];

export const legalNav: NavItem[] = [
  { label: 'Mentions légales', href: '/mentions-legales', hint: '' },
  { label: 'Confidentialité', href: '/confidentialite', hint: '' },
];
