import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Final domain still to be confirmed with the institute (see AUDIT.md).
// Set SITE_URL in the hosting provider's environment to override it: it
// drives canonical URLs, Open Graph URLs, JSON-LD, the sitemap and robots.txt.
const SITE_URL = process.env.SITE_URL ?? 'https://www.latypique-lorient.fr';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !/\/(mentions-legales|confidentialite|404)$/.test(page),
    }),
  ],
  // Pages are light (≈10 KB of CSS gzipped): inlining removes the only
  // render-blocking requests on first visit.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    // Pin this project's tsconfig: left to auto-discovery, Vite walks up
    // into the parent Studio VM repo's tsconfig, whose `extends` can't
    // resolve without the parent's node_modules (e.g. on Netlify).
    tsconfig: './tsconfig.json',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
