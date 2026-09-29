/**
 * Generates src/data/communes.json, the offline list behind the
 * "Intervenez-vous chez moi ?" checker. Run once; the output is committed.
 *
 *   npm i --no-save cities.json @etalab/decoupage-administratif
 *   node scripts/build-communes.mjs
 *
 * - Every commune of the Morbihan (official list, INSEE via Etalab), since
 *   the current site says the team works "dans tout le Morbihan".
 * - Communes of neighbouring departments within 70 km of Ploemeur, so the
 *   checker can also answer "no" honestly just past the 50 km radius.
 * Coordinates: GeoNames (CC BY 4.0), town centres. Postal codes: Etalab.
 * Row format: [name, postal code, department, lat, lon] (lat/lon may be null).
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const cities = require('cities.json/cities.json');
const communes = require('@etalab/decoupage-administratif/data/communes.json');

const BASE = { lat: 47.73512, lon: -3.42952 }; // Ploemeur, GeoNames
const rad = (d) => (d * Math.PI) / 180;
const km = (lat, lon) => {
  const a =
    Math.sin(rad(lat - BASE.lat) / 2) ** 2 +
    Math.cos(rad(BASE.lat)) * Math.cos(rad(lat)) * Math.sin(rad(lon - BASE.lon) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
};
const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s*\(.*\)\s*/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const geo = new Map();
for (const c of cities) {
  if (c.country !== 'FR') continue;
  const key = `${c.admin2}|${norm(c.name)}`;
  if (!geo.has(key)) geo.set(key, { lat: +c.lat, lon: +c.lng });
}

// Official name → GeoNames name, where GeoNames predates a merger or drops
// the article.
const ALIAS = { 'Le Bono': 'Bono', 'Theix-Noyalo': 'Theix', 'Pluméliau-Bieuzy': 'Pluméliau' };

// Communes near Ploemeur missing from GeoNames' cities1000 extract:
// public town-centre coordinates (approximate, used for a km figure only).
const EXTRA = {
  Guidel: { lat: 47.7917, lon: -3.4878 },
  'Gâvres': { lat: 47.6922, lon: -3.3392 },
  Plouhinec: { lat: 47.6967, lon: -3.2511 },
  'Inzinzac-Lochrist': { lat: 47.8586, lon: -3.2492 },
};

const rows = [];
for (const c of communes) {
  if (c.type !== 'commune-actuelle') continue;
  const point =
    geo.get(`${c.departement}|${norm(ALIAS[c.nom] ?? c.nom)}`) ??
    (c.departement === '56' ? EXTRA[c.nom] : undefined) ??
    null;
  const cp = c.codesPostaux?.[0] ?? '';
  if (c.departement === '56') {
    rows.push([c.nom, cp, '56', point ? +point.lat.toFixed(4) : null, point ? +point.lon.toFixed(4) : null]);
  } else if (['29', '22', '35', '44'].includes(c.departement) && point && km(point.lat, point.lon) <= 70) {
    rows.push([c.nom, cp, c.departement, +point.lat.toFixed(4), +point.lon.toFixed(4)]);
  }
}
rows.sort((a, b) => a[0].localeCompare(b[0], 'fr'));
writeFileSync(new URL('../src/data/communes.json', import.meta.url), JSON.stringify(rows));
const missing = rows.filter((r) => r[3] === null).map((r) => r[0]);
console.log(`${rows.length} communes, ${rows.filter((r) => r[2] === '56').length} in 56, ${missing.length} without coordinates`);
console.log('without coordinates:', missing.join(', '));
