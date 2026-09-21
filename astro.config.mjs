import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';

// Whole site is prerendered to static HTML (see `export const prerender`
// only ever set to `false` on src/pages/api/contact.ts) and served from
// Netlify's CDN; the Netlify adapter turns that one route into a Netlify
// Function. Swap for @astrojs/node or @astrojs/vercel if hosting moves.
export default defineConfig({
  site: 'https://www.studiovm-design.fr',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/mentions-legales') && !page.includes('/politique-de-confidentialite'),
    }),
    mdx(),
  ],
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});