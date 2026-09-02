import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { rateLimit, type RateLimitEntry } from "@/lib/utils/rate-limit";
import { getClientIp } from "@/lib/utils/client-ip";
import { chatSchema } from "@/lib/validations/chat";

const RATE_LIMIT_MAP = new Map<string, RateLimitEntry>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// The system prompt lives in lib/ai/system-prompt.ts so its invariants (scope contract present and
// FIRST, never-disclose rules intact) can be unit-tested. Built once at module load — it is derived
// from static data and does not change per request.
const SYSTEM_PROMPT = buildSystemPrompt();

export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request);

  const { limited, minutesLeft, remaining } = rateLimit(
    RATE_LIMIT_MAP,
    ip,
    MAX_REQUESTS,
    WINDOW_MS
  );
  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(MAX_REQUESTS),
    "X-RateLimit-Remaining": String(remaining),
  };

  if (limited) {
    return NextResponse.json(
      {
        success: false,
        message: `Nuggets has hit its message limit. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}, or email John directly.`,
      },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const result = chatSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        errors: result.error.issues,
      },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY environment variable is not set.");
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500, headers: rateLimitHeaders }
    );
  }

  const groq = new Groq({ apiKey });

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...result.data.messages,
      ],
      stream: true,
      // Brevity is enforced in two places, because the prompt alone did not hold: the rules ask for
      // 2–4 sentences, and this is the hard ceiling behind them. 1024 permitted ~750 words, which is
      // far longer than any answer here should be. 400 leaves headroom for a genuinely detailed
      // answer (an interview-style story with a Live URL) without allowing a wall of text —
      // truncating mid-sentence reads worse than being slightly long, so this is deliberately not
      // set to the 2–4 sentence budget itself.
      max_tokens: 400,
      // Lowered from 0.4: less drift from the answer rules and the scope contract, tighter phrasing.
      temperature: 0.2,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          // NOT in a `finally`: calling close() after error() throws "Invalid state" and surfaces as
          // an unhandled rejection that hides the original failure. Each path terminates the stream
          // exactly once.
          console.error(
            "Groq stream error:",
            err instanceof Error ? err.message : err
          );
          controller.error(err);
          return;
        }

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...rateLimitHeaders,
      },
    });
  } catch (err) {
    // This used to be a bare `catch {}` logging the literal string "Groq API error" — so an expired
    // key, an exhausted quota, a decommissioned model and a network blip were indistinguishable in
    // the logs. The cause is logged server-side ONLY; it can carry account/quota detail and must
    // never reach the client.
    const status =
      typeof (err as { status?: unknown })?.status === "number"
        ? (err as { status: number }).status
        : undefined;
    const detail = err instanceof Error ? err.message : String(err);

    console.error(
      `Groq API error${status ? ` (HTTP ${status})` : ""}: ${detail}`
    );

    // Groq's OWN rate limit is not a fault in this deployment. Returning 500 for it is misleading —
    // it sends you debugging a server that is fine. Pass the 429 through so it is distinguishable.
    if (status === 429) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nuggets is handling too many messages right now. Try again in a moment.",
        },
        { status: 429, headers: rateLimitHeaders }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get a response. Please try again.",
      },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
