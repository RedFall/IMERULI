# IMERULI eMenu

Mobile-first one-page website for Restauracja Gruzińska IMERULI, built with React, TypeScript and Vite.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
```

The build emits the main landing page plus `/privacy.html` and `/cookies.html`. Fonts are self-hosted under `public/fonts/`; their OFL texts are kept in `public/fonts/licenses/`. A direct `/#menu` entry defers Hero imagery until the visitor approaches the Hero section.

## Content before production

The current dishes, prices, story, address, opening hours, phone number, rating and review texts are demonstrational. Confirm and replace them with owner-approved data before publishing.

- Menu data: `src/data/menu.ts`
- Polish, English, Russian and Ukrainian copy: `src/i18n/*.json`
- Translation registry, persisted language selection and localized menu composition: `src/i18n/index.tsx`
- Translation structure check: `npm run validate:i18n`
- Hero video: add `public/video/imeruli-interior.webm` and/or `public/video/imeruli-interior.mp4`; the generated poster remains as fallback.
- Google integration: replace the static map preview and sample reviews with an approved API/widget integration after consent requirements are decided.
- Contact form: connect a real endpoint, delivery provider, validation, rate limiting and error handling. The current interaction does not send data.
- Legal pages: replace every draft placeholder with the legal owner, hosting, retention and recipient details, then obtain a production legal review.
- Menu photography: every published dish needs its own owner-approved photograph; repeated prototype images must not ship as real menu photography.

Generated image assets are stored under `public/images/`. Replace dish images with real restaurant photography for the final release.
