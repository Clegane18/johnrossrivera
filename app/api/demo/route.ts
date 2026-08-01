import { NextResponse } from "next/server";
import { demoEchoSchema } from "@/lib/validations/demo";
import { rateLimit, type RateLimitEntry } from "@/lib/utils/rate-limit";
import { getClientIp } from "@/lib/utils/client-ip";

// A small, real backend endpoint that powers the "Live API" playground on the portfolio. GET is a
// health/ping; POST is a Zod-validated echo so visitors can watch server-side validation reject bad
// input live. Lightly rate-limited so it can't be hammered.

const RATE_LIMIT_MAP = new Map<string, RateLimitEntry>();
const MAX_REQUESTS = 30;
const WINDOW_MS = 60 * 1000; // 1 minute

function region(): string {
  return process.env.VERCEL_REGION ?? "local";
}

export async function GET(): Promise<Response> {
  return NextResponse.json({
    status: "ok",
    region: region(),
    runtime: "nodejs",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request): Promise<Response> {
  if (
    rateLimit(RATE_LIMIT_MAP, getClientIp(request), MAX_REQUESTS, WINDOW_MS)
      .limited
  ) {
    return NextResponse.json(
      { ok: false, message: "Rate limit exceeded. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = demoEchoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Validation failed.",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join(".") || "(root)",
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const { text } = parsed.data;

  return NextResponse.json({
    ok: true,
    received: { text },
    analysis: {
      length: text.length,
      words: text.trim().split(/\s+/).filter(Boolean).length,
      upper: text.toUpperCase(),
    },
    region: region(),
    timestamp: new Date().toISOString(),
  });
}
