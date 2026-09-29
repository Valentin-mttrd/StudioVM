import { HOME_BASE } from '../data/site';

const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance from Ploemeur, in km. */
export function kmFromBase(lat: number, lon: number): number {
  const a =
    Math.sin(rad(lat - HOME_BASE.lat) / 2) ** 2 +
    Math.cos(rad(HOME_BASE.lat)) * Math.cos(rad(lat)) * Math.sin(rad(lon - HOME_BASE.lon) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Local equirectangular projection centred on Ploemeur: accurate to well
 * under a percent over 70 km, which is all the zone map needs.
 * Returns km east (x) and km south (y).
 */
export function project(lat: number, lon: number): [number, number] {
  const kx = 111.32 * Math.cos(rad(HOME_BASE.lat));
  return [(lon - HOME_BASE.lon) * kx, (HOME_BASE.lat - lat) * 110.57];
}
