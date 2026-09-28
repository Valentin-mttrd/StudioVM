import type { ImageMetadata } from 'astro';
import type { ProjectTypeId } from './site';

/**
 * Projects shown on /nos-derniers-travaux/ and teased on the home page.
 *
 * Empty on purpose: the current site's photos could not be retrieved during
 * the redesign (AUDIT.md) and no project is ever made up. Until real entries
 * exist, both places render clearly labelled "photo à intégrer" frames.
 *
 * To add a project, drop its photos in src/assets/realisations/ and add:
 *
 *   import apres from '../assets/realisations/erdeven-apres.jpg';
 *   import avant from '../assets/realisations/erdeven-avant.jpg';
 *   {
 *     id: 'extension-erdeven',
 *     title: 'Extension ossature bois',
 *     town: 'Erdeven',
 *     type: 'extension',
 *     trades: ['Maçonnerie', 'Charpente', 'Couverture'],
 *     cover: { src: apres, alt: 'Extension vue du jardin, bardage bois clair' },
 *     before: { src: avant, alt: 'Façade avant travaux' }, // optional → before/after slider
 *     gallery: [],                                                 // optional extra photos
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
  type: ProjectTypeId;
  trades?: string[];
  summary?: string;
  cover: Photo;
  before?: Photo;
  gallery?: Photo[];
}

export const REALISATIONS: Realisation[] = [];
