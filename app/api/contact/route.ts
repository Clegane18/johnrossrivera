import { contactSchema } from "@/lib/validations/contact";
import { sendContactEmail } from "@/lib/email/resend";
import { NextResponse } from "next/server";
import { rateLimit, type RateLimitEntry } from "@/lib/utils/rate-limit";

const RATE_LIMIT_MAP = new Map<string, RateLimitEntry>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = getRateLimitKey(request);

  if (rateLimit(RATE_LIMIT_MAP, ip, MAX_REQUESTS, WINDOW_MS).limited) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        errors: result.error.issues,
      },
      { status: 400 }
    );
  }

  const { name, email, message } = result.data;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!toEmail) {
    console.error("CONTACT_TO_EMAIL environment variable is not set.");
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  try {
    await sendContactEmail({ name, email, message, toEmail });

    return NextResponse.json(
      { success: true, message: "Message sent successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to send email:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message. Please try again later.",
      },
      { status: 500 }
    );
  }
}
