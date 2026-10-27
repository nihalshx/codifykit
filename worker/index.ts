/**
 * Cloudflare Worker for codifykit.
 * The static site (Next.js export in /out) is served as Worker assets; this script only runs
 * for requests that don't match a file, i.e. the Kitto API.
 */
import { handleKitto, type Env } from "./kitto";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/kitto" || url.pathname === "/api/kitto/") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed." }), {
          status: 405,
          headers: { "content-type": "application/json", allow: "POST" },
        });
      }
      return handleKitto(request, env);
    }
    // anything else falls through to the static site (and its 404 page)
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
