# Codifykit — website

Marketing site for **Codifykit**, a digital growth & creative studio.

Built with Next.js (App Router), Tailwind CSS v4 and Motion. The whole site is statically prerendered.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Edit content

- `lib/site.ts` — company name, email, social links, nav
- `components/*` — one file per section (hero, services, who-we-help, process, contact…)
- `components/logo.tsx` — the logo mark as SVG
- `app/icon.svg`, `app/opengraph-image.jpg` — favicon and social share image

The contact form opens the visitor's email client addressed to `site.email`.

## Deploy to Vercel

1. Go to https://vercel.com/new and import this GitHub repository.
2. Framework preset: **Next.js** (auto-detected). No environment variables needed.
3. Click **Deploy**. Every push to the production branch redeploys automatically.

After adding your custom domain, update `url` in `lib/site.ts` so share previews use it.
