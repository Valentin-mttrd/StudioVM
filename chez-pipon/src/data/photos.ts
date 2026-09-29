/**
 * Real photos of the restaurant, picked up automatically.
 *
 * Drop a file named after a slot into src/assets/photos/ — for example
 * `devanture.jpg` or `victor.webp` — and every place that uses that slot
 * shows it, resized and converted to WebP at build time. Until then
 * the slot renders a clearly labelled placeholder: no stock or invented
 * pictures stand in for the real place.
 *
 * Source to use: the restaurant's own pictures (@chezpipon), with their
 * permission.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

export const PHOTO_SLOTS = {
  devanture: 'La devanture verte et vitrée, à l’angle de l’avenue de la Perrière',
  salle: 'La salle, lumineuse, aux airs de brasserie',
  assiette: 'Une assiette de l’ardoise du jour',
  cuisine: 'Victor en cuisine',
  detail: 'Un détail de table ou de comptoir',
  victor: 'Portrait de Victor Chaigneau, chef',
  eileen: 'Portrait d’Eileen Wallet, en salle',
} as const;

export type PhotoSlot = keyof typeof PHOTO_SLOTS;

export function photoFor(slot: PhotoSlot): ImageMetadata | undefined {
  const entry = Object.entries(files).find(([path]) => path.split('/').pop()?.replace(/\.\w+$/, '') === slot);
  return entry?.[1].default;
}
