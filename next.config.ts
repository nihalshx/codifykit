import type { NextConfig } from "next";

// Two hosts, one codebase:
// - Vercel (VERCEL=1): a normal Next.js build. Pages are still pre-rendered as static HTML, and
//   Kitto's API runs as a route handler (src/app/api/kitto/route.vercel.ts).
// - Anywhere else (Cloudflare): a static export to /out, with Kitto's API in worker/index.ts.
const onVercel = process.env.VERCEL === "1";

const config: NextConfig = {
  ...(onVercel ? {} : { output: "export" as const }),
  // `*.vercel.ts` files (the API route) only exist in the Vercel build
  pageExtensions: onVercel ? ["vercel.ts", "tsx", "ts"] : ["tsx", "ts"],
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
