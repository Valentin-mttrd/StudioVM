import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/data/site-url.mjs';

// Fully static: every page is prerendered to HTML and served from a CDN.
// The only runtime behaviour (live "open now" status, booking message
// helper, click-to-load map) runs in the browser and needs no server.
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/mentions-legales') && !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // This project lives inside the Studio VM repository, whose own
    // tsconfig.json (one level up) extends a package that isn't installed
    // here. Pointing Vite at this project's tsconfig stops the automatic
    // lookup from wandering up to that parent file.
    tsconfig: './tsconfig.json',
  },
});
