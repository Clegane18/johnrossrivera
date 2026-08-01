// Single source of truth for the facts Nuggets (the chat assistant) grounds on that are NOT already
// captured by lib/data/projects.ts or lib/data/experience.ts. The chat route composes its system
// prompt from this module + those two data files, so a fact is edited in exactly one place.
//
// IMPORTANT: positioning fields (roleTarget, availability, workSetup, salaryExpectation,
// freelanceNote) reflect John's current stance — ACTIVELY looking for full-stack/frontend roles,
// still at Crystal Vision so starting after a 30-day notice period, open to freelance, and NOT
// disclosing a salary/rate figure. Level is signalled through SCOPE (owning features front to back,
// leading systems, mentoring) rather than the word "senior" — describing the work is more credible
// than claiming the title, and it does not date as the title inflates.
//
// These must agree with siteConfig.contact.intro and siteConfig.navbar.availabilityText. A recruiter
// who reads one notice period on the page and hears a different one from the chat trusts neither —
// and the same goes for whether John is looking at all.
// Edit them here — they flow into everything Nuggets tells a recruiter.

import { siteConfig } from "@/config/site";

export interface InterviewQa {
  q: string;
  a: string;
}

export const profile = {
  fullName: "John Ross Rivera",
  // Location, email, education and social are READ from config/site.ts, never re-typed. Each was
  // previously a second literal here, and each had already drifted: the page said "Philippines"
  // while the chat said "Bacoor, Cavite, Philippines", and the degree was written two different ways.
  location: siteConfig.about.location,
  email: siteConfig.email,
  roleTarget:
    "Full-Stack Software Engineer (TypeScript — React/Next.js front end, NestJS/Node.js back end); also open to frontend-focused roles",
  availability:
    "Actively looking — open to full-stack or frontend roles with global teams, and able to start after a 30-day notice period at his current role. Also open to freelance/contract projects alongside that.",
  workSetup:
    "Open to remote / WFH (including remote roles for overseas companies), onsite, or hybrid — and open to relocation for the right full-time role",
  salaryExpectation:
    "Open to competitive compensation matched to the scope of the role — John prefers to discuss specifics directly for the role rather than list a figure.",
  freelanceNote:
    "Available for freelance/contract work; John scopes the project first, then discusses rate directly by email.",
  tagline: "Systems over shortcuts.",
  careerGoal:
    "Owning features end to end — data model, API, and UI — and the architecture decisions behind them (TypeScript/NestJS/Next.js preferred)",
  summary:
    "John has been building since he started self-studying in 2022 — four years hands-on, with professional production work at Crystal Vision since August 2025. He is a full-stack engineer: he owns a feature from the schema and the NestJS API through to the React/Next.js screens and the tests that cover both, without handoffs. At Crystal Vision he is sole developer of a 47-page competition admin console and primary developer of the NestJS backend behind it and the mobile app — 200+ REST endpoints across 61 data models, including a two-rail payment stack and a concurrency-safe voting engine — and he built the Laravel 12 KOL payout portal solo. TypeScript is his default across both halves of the stack.",
  education: siteConfig.education,
  // The page's Skills section is a deliberate SHORTLIST (lib/data/skills.ts) — the stack John is
  // applying with. This is the COMPLETE list from his CV, in CV order, and it exists for one job:
  // when a recruiter asks Nuggets "does he know Redis / AWS / CI/CD?", the honest answer is yes, and
  // without this the chat would say it has no detail while the CV in the same recruiter's inbox says
  // otherwise.
  //
  // This is NOT the old duplicate skills list. The shortlist must be a SUBSET of this — enforced by
  // a test in lib/ai/system-prompt.test.ts, so the two can never drift into disagreeing.
  cvSkills: {
    languages: ["TypeScript", "JavaScript", "PHP", "SQL", "HTML", "CSS"],
    frameworks: [
      "NestJS",
      "Node.js",
      "Express",
      "Next.js",
      "React",
      "Redux Toolkit",
      "RTK Query",
      "Laravel",
      "Tailwind CSS",
    ],
    devTools: [
      "MySQL",
      "Prisma",
      "Sequelize",
      "Redis",
      "JWT",
      "RBAC",
      "Jest",
      "Playwright",
      "Pest / PHPUnit",
      "Git",
      "GitHub",
      "Docker",
      "AWS S3",
      "Postman",
      "Jira",
      "CI/CD",
    ],
  },
  social: siteConfig.social,
  interviewQa: [
    {
      q: "Tell me about yourself / Walk me through your background",
      a: "John holds a BS in Information Technology (Web and Mobile App Development) from Bulacan State University. He started self-studying programming in 2022 and has been building ever since. His first full production system was a complete e-commerce platform for G&F Auto Supply — POS, inventory, and an in-store pickup flow for items that need a face-to-face check before purchase. He then completed an SAP ABAP training at Accenture PH, followed by a role at Crystal Vision where he wrote tests for the ROLA.ai Flutter mobile app and built LMS quiz features full-stack. Most recently he has owned two production systems at Crystal Vision. On the Rola Competition Platform — a live song competition with 917,026 registered users — he is sole developer of the admin console (34 modules, 47 pages) and primary developer of the NestJS backend behind both it and the mobile app (37 modules, 200+ REST endpoints, 61 data models), including a two-rail payment stack and a concurrency-safe voting engine. Separately he built the KOL Dashboard solo: a Laravel 12 affiliate and payout portal serving 1,000+ partners. He's full-stack: he ships the whole feature, not one half of it.",
    },
    {
      q: "Are you open to opportunities right now?",
      a: "Yes — John is actively looking. He's after a full-stack or frontend role with a global team, and he's open to remote, hybrid, onsite, or relocating for the right one. He's still at Crystal Vision, so he can start after a 30-day notice period. He also takes on freelance and contract work. The fastest route either way is to email him.",
    },
    // The three technical answers sit high on purpose. They are the only ones backed by countable
    // scope, and a recruiter who asks one standard question usually asks it early.
    {
      q: "Tell me about a system you own end to end",
      a: "The Rola Competition Platform. John is sole developer of its admin console — 34 modules, 47 pages in Next.js and React — and primary developer of the NestJS backend behind both that console and the mobile app: 37 modules, 200+ REST endpoints, 61 data models. The result is that operations staff run judging, moderation, payments and analytics themselves, with no engineer in the loop.",
    },
    {
      q: "What is the hardest technical problem you have solved?",
      a: "Keeping contest results trustworthy under load. Votes arrive in bursts, and a result has to hold against both deliberate manipulation and ordinary race conditions — two requests landing at the same instant must not become two counted votes. John built a concurrency-safe voting engine with per-user and per-IP rate limiting, so the integrity of a result no longer depends on how much traffic hit it that second.",
    },
    {
      q: "How do you handle sensitive user data?",
      a: "He keeps it out of the places people forget to check. On the KOL Dashboard, emails, names and wallet addresses were reaching the UI, the logs and the CSV exports, so John built one reusable masking layer covering all three and locked it down with 25 unit tests. The tests are the real point: an export added months later cannot quietly bypass the masking.",
    },
    {
      q: "What are your strengths?",
      a: "John is strong on both backend and frontend — he can own a feature end-to-end without handoffs. His biggest asset is grit: he doesn't give up on a problem until it's solved properly. He also practices stoicism, which means he stays composed under pressure and executes with full commitment regardless of how messy the situation gets.",
    },
    {
      q: "What is your weakness?",
      a: "John goes deep. He'll keep refining a system past the point the deadline actually needed, because he wants it right rather than merely done — the KOL masking layer got 25 unit tests when far fewer would have shipped. He's learned to timebox that: deliver the version that solves the problem, then come back and improve it. It's a trade-off he now manages deliberately rather than one he's blind to.",
    },
    {
      q: "How do you handle tight deadlines or pressure?",
      a: "John prioritizes by impact. At Crystal Vision, the team needed to add a FIAT payment option to the song competition — a significant backend change. But the CTO correctly identified the mobile API as Phase 1, the user-facing priority that had to ship first. John set the fiat work aside, shipped the mobile API first, then came back and delivered both payment rails — on-chain USDC on Polygon and Xendit — so users could pay in crypto or fiat without ever being double-charged. No drama, just execution in the right order.",
    },
    {
      q: "Where do you see yourself in 3–5 years?",
      a: "John's goal is to own features end to end — the data model, the API, and the interface — making the architecture decisions, mentoring other developers, and leading complex systems from design through production. He's building toward that deliberately with every project.",
    },
    {
      q: "Why should we hire you?",
      a: "Because he has already done the job at the scale you're hiring for. At Crystal Vision he is sole developer of a 47-page competition admin console and primary developer of the 200+ endpoint NestJS backend behind it, and he built the entire KOL payout portal on his own — two payment rails, and a PII masking layer with 25 tests holding it in place. He ships whole systems, not tickets.",
    },
  ] as InterviewQa[],
} as const;
