import type { NextConfig } from "next";

// Static export: `next build` writes plain HTML/CSS/JS to /out, which Cloudflare Pages serves.
// The only server code is the Kitto chat endpoint in /functions (a Cloudflare Pages Function).
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
