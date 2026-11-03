import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type {
  ChatCompletionChunk,
  ChatCompletionCreateParamsStreaming,
} from "groq-sdk/resources/chat/completions";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { detectIntent } from "@/lib/ai/page-actions";
import { rateLimit, type RateLimitEntry } from "@/lib/utils/rate-limit";
import { getClientIp } from "@/lib/utils/client-ip";
import { chatSchema } from "@/lib/validations/chat";

const RATE_LIMIT_MAP = new Map<string, RateLimitEntry>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Models to try, in order. Each has its OWN 8,000 tokens-per-minute allowance on the free tier, so
// when one is at its limit the next answers immediately instead of the visitor waiting out the
// minute. All three measured under a second for a short reply (2026-11-03). qwen needs
// reasoning_format "hidden" or its thinking text lands in the answer.
const MODELS = [
  { model: "openai/gpt-oss-120b", extra: { reasoning_effort: "low" } },
  { model: "openai/gpt-oss-20b", extra: { reasoning_effort: "low" } },
  { model: "qwen/qwen3.8-27b", extra: { reasoning_format: "hidden" } },
] as const;

function statusOf(err: unknown): number | undefined {
  const status = (err as { status?: unknown })?.status;
  return typeof status === "number" ? status : undefined;
}

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

  // maxRetries 0: the SDK's default retry honours Groq's retry-after, which on a per-minute limit
  // is up to 60 seconds of a visitor watching typing dots. The model fallback above replaces it.
  const groq = new Groq({ apiKey, maxRetries: 0, timeout: 20_000 });

  try {
    // The system prompt is focused on what the visitor is asking about (see pickFocus in
    // lib/ai/system-prompt.ts): the last two user messages, so a follow-up keeps its subject.
    const focusText = result.data.messages
      .filter((m) => m.role === "user")
      .slice(-2)
      .map((m) => m.content)
      .join(" ");
    const messages = [
      {
        role: "system" as const,
        content: buildSystemPrompt(focusText, detectIntent(lastUserText(result.data.messages))),
      },
      ...result.data.messages,
    ];

    // Rate-limited (429) or over the per-minute size (413) on one model: move straight to the
    // next. Anything else is a real failure and goes to the catch below.
    let lastErr: unknown;
    let stream: AsyncIterable<ChatCompletionChunk> | undefined;
    for (const { model, extra } of MODELS) {
      try {
        stream = await groq.chat.completions.create({
          model,
          ...extra,
          messages,
          stream: true,
          // Brevity is enforced in two places, because the prompt alone did not hold: the rules ask
          // for 2-4 sentences, and this is the hard ceiling behind them.
          max_tokens: 400,
          temperature: 0.2,
        } as ChatCompletionCreateParamsStreaming);
        break;
      } catch (err) {
        lastErr = err;
        const status = statusOf(err);
        if (status !== 429 && status !== 413) throw err;
        console.warn(`Groq ${model} at its limit (HTTP ${status}); trying the next model.`);
      }
    }
    if (!stream) throw lastErr;

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

function lastUserText(messages: { role: string; content: string }[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}
