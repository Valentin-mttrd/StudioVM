import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

import mdx from '@astrojs/mdx';

// Whole site is prerendered to static HTML (see `export const prerender`
// only ever set to `false` on src/pages/api/contact.ts). The Node adapter
// is only here so that one endpoint can run on demand; swap for
// @astrojs/vercel or @astrojs/netlify if deploying to those platforms.
export default defineConfig({
  site: 'https://www.studiovm.fr',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/mentions-legales') && !page.includes('/politique-de-confidentialite'),
    }),
    mdx(),
  ],
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});