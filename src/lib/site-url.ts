/**
 * The site's public address, for the sitemap, robots.txt and social previews.
 * Set NEXT_PUBLIC_SITE_URL to your domain. On Vercel it falls back to the project's production address.
 */
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercel ? `https://${vercel}` : "https://codifykit.com")
).replace(/\/$/, "");
