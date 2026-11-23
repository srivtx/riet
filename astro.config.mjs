import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// On Vercel this is the project's live address, and becomes the school domain once it is attached there.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || 'rietinternationalschool.com';
export default defineConfig({ site: `https://${host}`, trailingSlash: 'always', integrations: [sitemap()] });
