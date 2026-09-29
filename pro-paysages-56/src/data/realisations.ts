import type { ImageMetadata } from 'astro';
import type { ServiceGroup } from './site';

/**
 * Projects shown on the home page and on each service page.
 *
 * Empty on purpose: the current site's photos could not be retrieved during
 * the redesign (AUDIT.md) and no project is ever made up. Until real entries
 * exist, those places render clearly labelled « Photo à intégrer » frames.
 *
 * To add a project, drop its photos in src/assets/realisations/ and add:
 *
 *   import apres from '../assets/realisations/larmor-apres.jpg';
 *   import avant from '../assets/realisations/larmor-avant.jpg';
 *   {
 *     id: 'jardin-larmor-plage',
 *     title: 'Création d’un jardin et pose de clôture',
 *     town: 'Larmor-Plage',
 *     group: 'creation',
 *     services: ['cloture', 'massifs', 'engazonnement'],   // ids from SERVICES
 *     cover: { src: apres, alt: 'Jardin terminé, massifs et clôture bois' },
 *     before: { src: avant, alt: 'Le terrain avant travaux' },  // optional → before/after slider
 *     gallery: [],                                               // optional extra photos
 *   },
 *
 * Filters, lightbox and before/after slider pick entries up automatically.
 */

export interface Photo {
  src: ImageMetadata;
  alt: string;
}

export interface Realisation {
  id: string;
  title: string;
  town?: string;
  group: ServiceGroup;
  services?: string[];
  summary?: string;
  cover: Photo;
  before?: Photo;
  gallery?: Photo[];
}

export const REALISATIONS: Realisation[] = [];
