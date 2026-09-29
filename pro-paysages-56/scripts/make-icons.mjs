/**
 * Renders the PNG and ICO icons from public/favicon.svg (the logo mark).
 *   node scripts/make-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url));
const out = (name) => new URL(`../public/${name}`, import.meta.url);

// Maskable/touch icons get a full-bleed background with the mark inset.
const padded = (size, pad) =>
  sharp({ create: { width: size, height: size, channels: 4, background: '#1d3a2c' } })
    .composite([{ input: Buffer.from(svg.toString().replace('rx="9"', 'rx="0"')), density: 72 * ((size - pad * 2) / 32) }])
    .png();

await (await padded(180, 0)).toFile(out('apple-touch-icon.png').pathname);
await sharp(svg, { density: 72 * (192 / 32) }).resize(192, 192).png().toFile(out('icon-192.png').pathname);
await sharp(svg, { density: 72 * (512 / 32) }).resize(512, 512).png().toFile(out('icon-512.png').pathname);

// favicon.ico: a single 32×32 PNG wrapped in an ICO container.
const png = await sharp(svg, { density: 72 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bpp
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18); // offset
writeFileSync(out('favicon.ico'), Buffer.concat([header, png]));
console.log('icons written');
