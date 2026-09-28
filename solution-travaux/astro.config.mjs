import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Fully static site. URLs keep the trailing slash of the current WordPress
// site (/contactez-nous/, /nos-derniers-travaux/…) so every indexed page
// keeps its address; public/_redirects covers the variants.
export default defineConfig({
  site: 'https://solution-travaux.fr',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/merci/') && !page.includes('/404'),
    }),
  ],
  vite: {
    // This project sits inside the Studio VM repository: pin the bundler
    // to this folder's tsconfig instead of letting it find the parent one.
    tsconfig: './tsconfig.json',
  },
  devToolbar: { enabled: false },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
