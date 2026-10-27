# Codifykit website

The marketing site for Codifykit: a Next.js site (every page pre-rendered as static HTML) plus one small API, Kitto's AI chat. It deploys to **Vercel** (recommended) or to **Cloudflare**.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000 (Kitto's chat needs `npm start`, below)
npm run build        # writes the static site to /out
npm start            # builds, then serves /out + the Kitto API with Cloudflare's local runtime
```

For the chat to work locally, create `.dev.vars` (never commit it):

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Deploy to Vercel (recommended)

1. Go to vercel.com → **Add New… → Project** → import the `codifykit` GitHub repo.
2. Framework preset: **Next.js** (detected automatically). Leave the build command and output directory on their defaults.
3. If the repo's default branch isn't the one with the code, pick `claude/clever-cerf-4fh0l0` (or merge it into `main` first).
4. **Environment Variables**:
   - `ANTHROPIC_API_KEY`: your Claude API key from console.anthropic.com (Kitto's chat needs it).
   - `NEXT_PUBLIC_SITE_URL`: your final address, e.g. `https://codifykit.com` (sitemap + social previews). If you leave it out, Vercel's production address is used.
   - Optional: `KITTO_MODEL` to use a different Claude model (default `claude-opus-5-5`).
5. **Deploy**. Every push redeploys, and pull requests get preview links. Add your domain under **Settings → Domains**.

On Vercel the pages are static and Kitto runs as a Next.js route handler (`src/app/api/kitto/route.vercel.ts`). Nothing in `worker/` or `wrangler.jsonc` is used there.

## Deploy to Cloudflare (Workers)

The site deploys as a Cloudflare **Worker** with static assets: `wrangler.jsonc` serves `./out` and runs `worker/index.ts` for `/api/kitto`.

### Connected to GitHub (Workers Builds)

In Cloudflare → **Workers & Pages** → `codifykit` → **Settings** → **Build**:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/` (leave empty)
- Build variable: `NODE_VERSION` = `22`

Then in **Settings → Variables and secrets** add:

- `ANTHROPIC_API_KEY` (type **Secret**): your Claude API key from console.anthropic.com.
- `NEXT_PUBLIC_SITE_URL` (a **build** variable): your final address, e.g. `https://codifykit.com`. It's used for the sitemap and social previews.

Every push to the connected branch rebuilds and redeploys. Add your domain under **Settings → Domains & Routes**.

### From your computer

```bash
npx wrangler login
npm run deploy                                   # builds and deploys
npx wrangler secret put ANTHROPIC_API_KEY
```

### Optional: stronger rate limiting for Kitto

By default Kitto allows 20 messages per visitor every 10 minutes, counted per Cloudflare location. To count across all locations, create a KV namespace and add it to `wrangler.jsonc` as `"kv_namespaces": [{ "binding": "RATE_LIMIT", "id": "<id>" }]`.

## Where things live

| What | Where |
|---|---|
| All text content (services, projects, posters, apps, wheel cards) | `content/*.json` |
| Brand colours, type, spacing, motion | `src/styles/tokens.css` |
| Backgrounds: hero ring on the painted cloud sky `public/images/hero-sky.webp` (`HeroReels.module.css`); 3D and service pages on the clean `--ck-studio` grey. The old graph paper is still in `public/images/graph-paper.webp` if wanted | `src/styles/tokens.css` |
| Homepage sections: hero, marquee, what we do, apps (scroll showcase), websites (browser you can scroll), posters (deck you flip through), process, students, Kitto | `src/components/sections/` (`AppShowcase`, `WebBrowser`, `PosterDeck`) |
| Web and app service pages (`/services/web`, `/services/apps`): one template, text in `content/service-pages.json` | `src/components/landing/ServiceLanding.tsx` |
| "Start a project" form (`/contact`): opens WhatsApp or email with the message filled in, nothing stored | `src/app/contact/` |
| Hero: loader + reel cylinder in one CSS 3D scene (Motion). Pose maths + unit tests: `npm test` | `src/components/hero/HeroReels.tsx`, `src/components/hero/reelPose.ts` (+ `.test.ts`) |
| Apps: tilted phones intro + pinned parallax columns with the hand-held phone (GSAP ScrollTrigger) | `src/components/sections/AppShowcase.tsx` |
| 3D laptops / phones (`/work/web`, `/work/apps`) | `src/components/three/Showcase.tsx` |
| 3D models + credits | `public/models/` (`manifest.json`, `CREDITS.md`) |
| Kitto mascot (SVG version) | `src/components/kitto/Kitto.tsx`, `public/kitto/` |
| Kitto chat UI | `src/components/chat/KittoChat.tsx` |
| Kitto API (Claude API, rate limit, brief) | `src/lib/kitto-server.ts`; Vercel route `src/app/api/kitto/route.vercel.ts`; Cloudflare entry `worker/index.ts` |
| Logos | `public/brand/` |

## 3D models

`/work/web` (websites on laptops) and `/work/apps` (app screens on phones) use real models from Sketchfab: an Apple MacBook Pro and an Apple iPhone 18 Pro Max. Credits, licences and how they were prepared are in `public/models/CREDITS.md`, and `public/models/manifest.json` says which file each page loads.

To swap a model:

1. Use a GLB you're allowed to use commercially.
2. Phone: its screen material must be named with `screen` or `display`. Laptop: it needs a hinge node `screenflip` (lid upright at rotation 0) and a `screen` plane with 0..1 UVs. `scripts/split-macbook.mjs` shows how a one-piece laptop model was split.
3. Compress it: `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024 --join false --flatten false --palette false --simplify false --prune-attributes false`
4. Put it in `public/models/` and update `manifest.json` and `CREDITS.md`.

## Replacing placeholders with real work

Anything in `content/*.json` that starts with `[PLACEHOLDER` or `[FILL IN` shows on the site with a dashed outline, so it's easy to spot. The placeholder images in `public/work/` are generated by `npm run placeholders`; each one has a small "PLACEHOLDER" tag.

To add real work:

1. Put files in `public/work/web/`, `public/work/apps/`, `public/work/posters/` and `public/work/reels/` (sizes are in `docs/07-assets.md` of the handoff pack).
2. Update the matching JSON file: titles, clients, years and image paths. Use `null` for anything you can't share; the site hides it. Case studies can also take `"problem"` and `"result"` (one or two sentences each); they show on the case study page only when filled in.
3. Reels in the hero wheel: set `video` on a card in `content/wheel-cards.json` to a muted 9:16 MP4. Cards near the top play it automatically.
4. Team photo: add `public/images/team-pill.webp` and swap the placeholder in `src/components/sections/Story.tsx` and `src/app/about/page.tsx`.
5. Delete the placeholder files you no longer use.

Never add clients, numbers or testimonials you don't have permission to use.
