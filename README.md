# RIET International School website

Astro static site. `npm install`, `npm run dev`, `npm run build` (output in `dist/`, upload to `public_html`).

- Facts, phone, campuses: `src/site.ts`
- Photos: `src/assets/` (`sky-*` and `art-*` are generated illustrations; `founder-*` are AI-edited from a real photo), gallery list in `src/pages/gallery.astro`
- Disclosure PDFs: `public/documents/`, rows in `src/pages/mandatory-disclosure.astro`
- Strategy: `docs/STRATEGY.md`. Mood board: `design/moodboard/index.html`. Old site text: `content-archive/`

## Photos and speed
Use `<Pic name="file-name" alt="..." sizes="..." />` for every photo. It makes AVIF and WebP in several sizes plus a blurred preview. `npm run build && npm run preview` shows the true speed; `npm run dev` converts images on request and is slow the first time.
`src/fonts/anek-odia.woff2` holds only the Odia letters used on the site. Adding new Odia text needs a new subset.
