import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production URL. A CNAME is intentionally NOT shipped from this repository until
// the gated cutover ticket (#12); previews deploy to the repository's Pages URL.
export default defineConfig({
  site: 'https://kidthales.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  redirects: {
    '/spiderex/': '/tools/spiderex/',
  },
});
