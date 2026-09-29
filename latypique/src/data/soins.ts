/**
 * La carte des soins, by family.
 *
 * Descriptions only restate what the institute publishes (see AUDIT.md).
 * `prestations` is where the exact Kalendes price list goes — name,
 * duration, price. While a family's list is empty, the site shows a
 * "tarifs et durées sur l'agenda en ligne" card that links to booking
 * instead of inventing numbers.
 */

export interface Prestation {
  name: string;
  /** e.g. "45 min" */
  duration?: string;
  /** e.g. "55 €" or "à partir de 30 €" */
  price?: string;
  description?: string;
}

export type Tone = 'argile' | 'sauge' | 'cire' | 'mais' | 'lin' | 'rose' | 'soleil';

export interface SoinFamily {
  id: string;
  name: string;
  /** One line, used in the home index and cards. */
  summary: string;
  /** Short paragraph for the soins page. */
  description: string;
  /** "Composition" label — the ingredient / method signature of the family. */
  composition?: string;
  /** What the family covers, as published by the institute. */
  covers: string[];
  tone: Tone;
  prestations: Prestation[];
}

export const soins: SoinFamily[] = [
  {
    id: 'visage',
    name: 'Soins du visage',
    summary: 'Adaptés à votre peau, avec des produits 100 % naturels.',
    description:
      'Chaque soin du visage est adapté à vos envies et aux besoins de votre peau, et réalisé avec des produits 100 % naturels.',
    composition: 'Produits 100 % naturels',
    covers: ['Soins du visage'],
    tone: 'argile',
    prestations: [],
  },
  {
    id: 'corps',
    name: 'Soins du corps & minceur',
    summary: 'Pour se sentir mieux dans sa peau, au naturel.',
    description:
      'Des soins du corps et des soins minceur adaptés à vos envies et à vos besoins, réalisés avec des produits 100 % naturels — pour se sentir mieux dans sa peau.',
    composition: 'Produits 100 % naturels',
    covers: ['Soins du corps', 'Soins minceur'],
    tone: 'sauge',
    prestations: [],
  },
  {
    id: 'epilation',
    name: 'Épilation',
    summary: 'À la cire végétale, sans ingrédients controversés.',
    description:
      'L’épilation se fait à la cire végétale, formulée sans ingrédients controversés.',
    composition: 'Cire végétale · sans ingrédients controversés',
    covers: ['Épilation à la cire végétale'],
    tone: 'cire',
    prestations: [],
  },
  {
    id: 'mains',
    name: 'Beauté des mains',
    summary: 'Manucure et semi-permanent à base de manioc et de maïs.',
    description:
      'Manucure et pose de vernis semi-permanent, avec un semi-permanent à base de manioc et de maïs.',
    composition: 'Semi-permanent à base de manioc et de maïs',
    covers: ['Manucure', 'Pose de vernis semi-permanent'],
    tone: 'mais',
    prestations: [],
  },
  {
    id: 'pieds',
    name: 'Beauté des pieds',
    summary: 'Le pédi-spa, pour prendre soin de vos pieds.',
    description: 'Le pédi-spa, pour prendre soin de vos pieds dans le même esprit que le reste de la carte.',
    covers: ['Pédi-spa'],
    tone: 'lin',
    prestations: [],
  },
  {
    id: 'maquillage',
    name: 'Maquillage',
    summary: 'Une mise en beauté réalisée à l’institut.',
    description: 'Une mise en beauté réalisée à l’institut, adaptée à vos envies.',
    covers: ['Maquillage'],
    tone: 'rose',
    prestations: [],
  },
  {
    id: 'uv',
    name: 'Cabine UV',
    summary: 'Une cabine UV, au sein de l’institut rénové.',
    description: 'L’institut dispose d’une cabine UV. Pour en savoir plus, appelez l’institut.',
    covers: ['Cabine UV'],
    tone: 'soleil',
    prestations: [],
  },
];

/** The three commitments that make the institute "atypique". */
export const engagements = [
  {
    number: '01',
    title: 'Des produits 100 % naturels',
    text: 'Pour le visage comme pour le corps, les soins sont réalisés avec des produits 100 % naturels.',
    link: { href: '/soins#visage', label: 'Soins visage & corps' },
    tone: 'argile' as Tone,
  },
  {
    number: '02',
    title: 'Un semi-permanent à base de manioc et de maïs',
    text: 'Pour la beauté des mains, la pose de vernis semi-permanent se fait avec une formule à base de manioc et de maïs.',
    link: { href: '/soins#mains', label: 'Beauté des mains' },
    tone: 'mais' as Tone,
  },
  {
    number: '03',
    title: 'Une épilation à la cire végétale',
    text: 'Une cire végétale, sans ingrédients controversés, pour l’épilation.',
    link: { href: '/soins#epilation', label: 'Épilation' },
    tone: 'cire' as Tone,
  },
] as const;
