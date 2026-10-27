/**
 * Kitto's API on Vercel. This file is only picked up when building on Vercel
 * (see pageExtensions in next.config.ts); the Cloudflare build is a static export.
 */
import { handleKitto } from "@/lib/kitto-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleKitto(request, {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    KITTO_MODEL: process.env.KITTO_MODEL,
  });
}
