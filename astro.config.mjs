import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// On Vercel this is the project's live address, and becomes the school domain once it is attached there.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || 'rietinternationalschool.com';
export default defineConfig({ site: `https://${host}`, trailingSlash: 'always',
  // Fetch the next page as soon as a finger or cursor lands on its link (skipped on Save-Data)
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' }, integrations: [sitemap()] });
