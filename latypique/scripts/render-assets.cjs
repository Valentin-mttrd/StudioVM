/**
 * Renders the social image and app icons with the site's own fonts.
 * Needs Playwright (+ Chromium): `node scripts/render-assets.cjs`.
 * Outputs are committed, so a normal build never runs this.
 */
const path = require('node:path');
const fs = require('node:fs');
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');
}

const root = path.resolve(__dirname, '..');
const pub = (p) => path.join(root, 'public', p);

(async () => {
  const browser = await playwright.chromium.launch();

  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.goto('file://' + path.join(__dirname, 'og.html'));
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: pub('og.jpg'), type: 'jpeg', quality: 88 });

  const svg = fs.readFileSync(pub('favicon.svg'), 'utf8');
  const icons = [
    ['apple-touch-icon.png', 180, 0.1, '#f2ece3'],
    ['icons/icon-192.png', 192, 0, 'transparent'],
    ['icons/icon-512.png', 512, 0, 'transparent'],
    ['icons/icon-maskable-512.png', 512, 0.2, '#f2ece3'],
  ];
  for (const [file, size, pad, bg] of icons) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    const inner = Math.round(size * (1 - pad * 2));
    await page.setContent(
      `<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${bg}">` +
        svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `) +
        '</body>',
    );
    await page.screenshot({ path: pub(file), omitBackground: bg === 'transparent' });
    await page.close();
  }

  // favicon.ico: a single 32px PNG wrapped in an ICO container.
  const page = await browser.newPage({ viewport: { width: 32, height: 32 } });
  await page.setContent(
    '<body style="margin:0">' + svg.replace('<svg ', '<svg width="32" height="32" ') + '</body>',
  );
  const png = await page.screenshot({ omitBackground: true });
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // data offset
  fs.writeFileSync(pub('favicon.ico'), Buffer.concat([header, png]));

  await browser.close();
})();
