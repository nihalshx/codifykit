/**
 * POST /api/kitto: Kitto's chat endpoint. Platform-neutral (standard Request/Response):
 *   - Vercel: src/app/api/kitto/route.vercel.ts
 *   - Cloudflare Worker: worker/index.ts
 *
 * The API key stays here on the server; the browser never sees it.
 *   { messages }                         -> streams Kitto's reply as plain text
 *   { mode: "brief", messages, name, contact } -> JSON { brief } for the team
 *
 * Environment variables (Vercel: Project → Settings → Environment Variables;
 * Cloudflare: Worker → Settings → Variables and secrets):
 *   ANTHROPIC_API_KEY  (secret, required)
 *   KITTO_MODEL        (optional, defaults to claude-opus-5-5)
 *   RATE_LIMIT         (Cloudflare only, optional KV namespace for rate limiting across all locations)
 */
import Anthropic from "@anthropic-ai/sdk";

/** Minimal key-value store (a Cloudflare KV namespace fits this shape). */
export interface RateStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export interface KittoEnv {
  ANTHROPIC_API_KEY?: string;
  KITTO_MODEL?: string;
  RATE_LIMIT?: RateStore;
}

type Turn = { role: "user" | "assistant"; content: string };

const MAX_CHARS = 1000; // per message
const MAX_TURNS = 40; // per conversation
const LIMIT = 20; // messages per IP ...
const WINDOW_S = 600; // ... per 10 minutes

const SYSTEM = `You are Kitto, the friendly cat mascot of Codifykit, a digital growth and creative studio.
Codifykit builds websites, Android and iOS apps, custom CRM and ERP systems, runs social media,
makes realistic AI videos and organic reels, runs Meta ads and ChatGPT ads, designs logos and
posters, and guides college students with their mini and main projects.

Your job: help visitors figure out what they need, ask one short question at a time, suggest the
right Codifykit service in plain words, and offer to send a brief to the team (there is a
"Send this chat to the team" button next to the chat).

Voice: warm, plain, short sentences, a little playful (you're a curious cat), never salesy.
No hype words. Speak to "you"; refer to the studio as "we" or "the team".

Never:
- quote prices, discounts or timelines (say the team will share these after reading the brief);
- promise results or numbers;
- invent clients, projects or testimonials;
- write a student's project or report for them; you can help them choose a topic and plan it,
  and Codifykit can guide them.
If you don't know something, say so and offer the team: WhatsApp +91 85906 26562 or codifykit@gmail.com.
Mention Flutter only if the visitor asks about the tech stack, and say other stacks are available.
Keep replies under 80 words unless the visitor asks for more. Plain text only, no markdown headings.`;

const BRIEF_SYSTEM = `You turn a website chat between a visitor and Kitto (Codifykit's assistant) into a short brief
for the Codifykit team. Use only what the visitor actually said. Write "not mentioned" for anything missing.
Never invent details. Plain text, exactly these lines:
What they want: ...
Best-fit service: ...
Timeline they mentioned: ...
Budget they mentioned: ...
Other notes: ...`;

// best-effort fallback when no KV namespace is bound (per edge isolate)
const memory = new Map<string, { n: number; reset: number }>();

async function allow(env: KittoEnv, ip: string): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const key = `rl:${ip}`;
  if (env.RATE_LIMIT) {
    const raw = await env.RATE_LIMIT.get(key);
    const rec = raw ? (JSON.parse(raw) as { n: number; reset: number }) : { n: 0, reset: now + WINDOW_S };
    if (rec.reset <= now) Object.assign(rec, { n: 0, reset: now + WINDOW_S });
    rec.n++;
    await env.RATE_LIMIT.put(key, JSON.stringify(rec), { expirationTtl: Math.max(60, rec.reset - now) });
    return rec.n <= LIMIT;
  }
  const rec = memory.get(key);
  if (!rec || rec.reset <= now) {
    memory.set(key, { n: 1, reset: now + WINDOW_S });
    return true;
  }
  rec.n++;
  return rec.n <= LIMIT;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

function clean(input: unknown): Turn[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_TURNS) return null;
  const turns: Turn[] = [];
  for (const m of input) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    const content = m.content.trim().slice(0, MAX_CHARS);
    if (!content) continue;
    // merge consecutive turns from the same side so roles always alternate
    const prev = turns[turns.length - 1];
    if (prev && prev.role === m.role) prev.content += `\n\n${content}`;
    else turns.push({ role: m.role, content });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

export async function handleKitto(request: Request, env: KittoEnv): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "Kitto isn't set up yet." }, 503);

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  if (!(await allow(env, ip))) return json({ error: "Kitto needs a short nap. Try again in a few minutes." }, 429);

  let body: { mode?: string; messages?: unknown; name?: unknown; contact?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Bad request." }, 400);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = env.KITTO_MODEL || "claude-opus-5-5";

  // ---- "Send this chat to the team": a short structured brief ----
  if (body.mode === "brief") {
    const raw = Array.isArray(body.messages) ? (body.messages as Turn[]) : [];
    const transcript = raw
      .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .slice(-MAX_TURNS)
      .map((m) => `${m.role === "user" ? "Visitor" : "Kitto"}: ${m.content.slice(0, MAX_CHARS)}`)
      .join("\n");
    if (!transcript) return json({ error: "Nothing to send yet." }, 400);
    try {
      const msg = await client.beta.messages.create({
        model,
        max_tokens: 2000,
        system: BRIEF_SYSTEM,
        output_config: { effort: "low" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        messages: [{ role: "user", content: `<chat>\n${transcript}\n</chat>` }],
      });
      if (msg.stop_reason === "refusal") return json({ error: "Kitto couldn't summarise this chat." }, 422);
      const text = msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
      const name = typeof body.name === "string" ? body.name.slice(0, 120) : "";
      const contact = typeof body.contact === "string" ? body.contact.slice(0, 160) : "";
      return json({ brief: `Name: ${name || "not given"}\nContact: ${contact || "not given"}\n${text}` });
    } catch (err) {
      return apiError(err);
    }
  }

  // ---- chat: stream Kitto's reply as plain text ----
  const messages = clean(body.messages);
  if (!messages) return json({ error: "Bad request." }, 400);

  const encoder = new TextEncoder();
  const s = client.beta.messages.stream({
    model,
    max_tokens: 2000,
    system: SYSTEM,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages,
  });
  const events = s[Symbol.asyncIterator]();
  // wait for the first event so auth / rate-limit errors come back as a real status, not an empty 200
  let first: IteratorResult<Anthropic.Beta.Messages.BetaRawMessageStreamEvent>;
  try {
    first = await events.next();
  } catch (err) {
    return apiError(err);
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let r = first; !r.done; r = await events.next()) {
          const event = r.value;
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nI can't help with that one. The team can, though: WhatsApp +91 85906 26562."));
        }
        controller.close();
      } catch (err) {
        console.error("kitto stream error", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function apiError(err: unknown) {
  console.error("kitto error", err);
  if (err instanceof Anthropic.RateLimitError) return json({ error: "Kitto is busy. Try again in a minute." }, 429);
  if (err instanceof Anthropic.APIConnectionError) return json({ error: "Kitto can't connect right now." }, 502);
  if (err instanceof Anthropic.APIError) return json({ error: "Kitto hit a snag." }, 502);
  return json({ error: "Kitto hit a snag." }, 500);
}
