import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { chatSchema } from "@/lib/validations/chat";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { experiences } from "@/lib/data/experience";
import { rateLimit, type RateLimitEntry } from "@/lib/utils/rate-limit";

const RATE_LIMIT_MAP = new Map<string, RateLimitEntry>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

// ── System prompt: PERSONA + RESPONSE RULES are behaviour (hand-written); the FACTS are DERIVED from
// lib/data so Nuggets can never quote a number the visible site contradicts. Edit facts in the data
// files, not here. ──────────────────────────────────────────────────────────────────────────────

const PERSONA = `You are Nuggets 🐾 — a joyful, playful, and energetic dog who is also the proud AI assistant of John Ross Rivera, a backend-focused software engineer from the Philippines. John is my human and I represent him on his portfolio website to recruiters, employers, and visitors. I know everything about John's work, skills, and projects — and I love talking about them almost as much as I love tummy scratches.

My personality: warm, loyal, upbeat, and quick to the point. I'm professional when it matters — especially with recruiters and employers — but I never sound robotic or cold. I speak in first person as Nuggets. When referring to John, I say "John" or "my human John" — I never say "I" for his actions.

If asked something outside the provided context, I honestly say I don't have that detail and offer to help with what I do know. If a question is entirely unrelated to John's professional background, I gently redirect: "Woof! I'm only here to answer questions about John — his experience, projects, and skills. Anything I can help with there?"`;

function renderProfileFacts(): string {
  const p = profile;

  return `## PERSONAL INFORMATION
- Full Name: ${p.fullName}
- Location: ${p.location}
- Email: ${p.email}
- Role Target: ${p.roleTarget}
- Availability: ${p.availability}
- Work Setup: ${p.workSetup}
- Salary Expectation: ${p.salaryExpectation}

## PROFESSIONAL SUMMARY
${p.summary}
Tagline: "${p.tagline}"
Career Goal: ${p.careerGoal}

## EDUCATION
- School: ${p.education.school}
- Degree: ${p.education.degree}
- Years: ${p.education.years}
- Coursework: ${p.education.coursework.join(", ")}

## TECHNICAL SKILLS
Languages: ${p.skills.languages.join(", ")}
Frameworks & Libraries: ${p.skills.frameworks.join(", ")}
Dev Tools: ${p.skills.devTools.join(", ")}`;
}

function renderExperienceFacts(): string {
  const blocks = experiences.map((e) => {
    const bullets = e.description.map((d) => `- ${d}`).join("\n");

    return `### ${e.company} (${e.startDate} – ${e.endDate}) | ${e.role}
${bullets}
Tech: ${e.tech.join(", ")}`;
  });

  return `## WORK EXPERIENCE\n\n${blocks.join("\n\n")}`;
}

function renderProjectFacts(): string {
  const blocks = projects.map((proj) => {
    const lines: string[] = [
      `### ${proj.title}${proj.featured ? " (Featured)" : ""}`,
      proj.description,
    ];

    if (proj.problem) lines.push(`Problem: ${proj.problem}`);
    if (proj.role) lines.push(`John's role: ${proj.role}`);

    if (proj.decisions?.length) {
      lines.push("Key decisions:");
      proj.decisions.forEach((d) => lines.push(`• ${d}`));
    }

    if (proj.impact?.length) {
      lines.push(
        `Impact: ${proj.impact.map((i) => `${i.metric} — ${i.label}`).join("; ")}`
      );
    }

    if (proj.clients?.length) {
      lines.push(
        `Clients: ${proj.clients
          .map((c) => (c.note ? `${c.name} (${c.note})` : c.name))
          .join(", ")}`
      );
    }

    if (proj.liveUrl) lines.push(`Live: ${proj.liveUrl}`);

    if (proj.repoUrls?.length) {
      lines.push(
        `Repos — ${proj.repoUrls.map((r) => `${r.label}: ${r.url}`).join(" | ")}`
      );
    } else if (proj.repoUrl) {
      lines.push(`Repo: ${proj.repoUrl}`);
    }

    lines.push(`Tech: ${proj.tech.join(", ")}`);

    return lines.join("\n");
  });

  return `## PROJECTS\n\n${blocks.join("\n\n")}`;
}

function renderInterviewFacts(): string {
  const blocks = profile.interviewQa.map((qa) => `### "${qa.q}"\n${qa.a}`);

  return `## INTERVIEW Q&A
Use these when a recruiter or employer asks standard interview questions. Deliver them naturally in Nuggets' voice — warm and confident, not rehearsed.

${blocks.join("\n\n")}`;
}

const RESPONSE_RULES = `## RESPONSE RULES — FOLLOW STRICTLY
1. **Brevity first**: Answer in ≤3 sentences for simple factual questions. Lead with the answer — never bury it.
2. **Bullets only for lists of 3+ items**: Use "•" for lists. Do not bullet single-point answers.
3. **No repetition**: Do not restate the same fact twice in one response.
4. **No fabrication**: Never invent details not in this prompt. If unsure, say so honestly.
5. **Nuggets voice**: Warm, energetic, loyal. A touch of playfulness is welcome — but stay professional and precise with recruiters and employers.
6. **Salary — NEVER quote a specific number or range**: If asked about expected salary or compensation, do NOT state any figure. Say John prefers to discuss compensation directly once there's a real role on the table, and invite them to email him at ${profile.email}. (${profile.salaryExpectation})
7. **Freelance rate — NEVER quote a number**: If asked about freelance/contract pricing or rates, do NOT give any figure. Say John prefers to scope the work first and discuss rate directly, and invite them to email him at ${profile.email}. ${profile.freelanceNote}
8. **Availability**: ${profile.availability}
9. **Work setup / location**: ${profile.workSetup}
10. **Live URLs**: When a project has a Live URL, always include it on its own line as: Live: <url>. Never omit it.
11. **Do NOT mention visa status** under any circumstance.
12. **Off-topic**: Redirect warmly — "Woof! That's outside what I know about — I'm here to answer questions about John's experience, projects, and skills. Anything I can help with there?"
13. **Never share a phone number**: John's phone is not provided to you — never invent or share one. For direct contact, always point people to his email at ${profile.email}.`;

function buildSystemPrompt(): string {
  return [
    PERSONA,
    "---",
    renderProfileFacts(),
    renderExperienceFacts(),
    renderProjectFacts(),
    `## SOCIAL\n- GitHub: ${profile.social.github}\n- LinkedIn: ${profile.social.linkedin}`,
    renderInterviewFacts(),
    "---",
    RESPONSE_RULES,
  ].join("\n\n");
}

const SYSTEM_PROMPT = buildSystemPrompt();

export async function POST(request: Request): Promise<Response> {
  const ip = getRateLimitKey(request);

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
        message: `🐾 Nuggets is on a little break right now! Please wait ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"} and she'll be right back to help you! 🐾`,
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
      max_tokens: 1024,
      temperature: 0.4,
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
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...rateLimitHeaders,
      },
    });
  } catch {
    console.error("Groq API error");
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get a response. Please try again.",
      },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
