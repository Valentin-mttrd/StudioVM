import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Fully static site. URLs keep the trailing slash of the current site
// (/contact/, /creation-de-jardin-…/) so every indexed page keeps its
// address; public/_redirects covers the variants.
export default defineConfig({
  site: 'https://pro-paysages-56.fr',
  trailingSlash: 'always',
  // Small site, small CSS: inline it so the first paint never waits on a
  // stylesheet request.
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/merci/') && !page.includes('/404'),
    }),
  ],
  vite: {
    // Pin the bundler to this project's tsconfig so a parent folder's
    // tsconfig (e.g. when nested in another repo) is never picked up.
    tsconfig: './tsconfig.json',
  },
  devToolbar: { enabled: false },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
