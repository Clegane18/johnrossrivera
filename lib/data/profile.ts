// Single source of truth for the facts Nuggets (the chat assistant) grounds on that are NOT already
// captured by lib/data/projects.ts or lib/data/experience.ts. The chat route composes its system
// prompt from this module + those two data files, so a fact is edited in exactly one place.
//
// IMPORTANT: positioning fields (roleTarget, availability, workSetup, salaryExpectation,
// freelanceNote) reflect John's current stance (changed 2026-11-06): open to remote, contract and
// freelance work, worded neutrally because he is still at Crystal Vision and the site is public, so
// it must not say he is job hunting or name a notice period. NOT disclosing a salary/rate figure. Level is signalled through SCOPE (owning features front to back,
// leading systems, mentoring) rather than the word "senior" — describing the work is more credible
// than claiming the title, and it does not date as the title inflates.
//
// These must agree with siteConfig.contact.intro and siteConfig.availability. A recruiter
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
    "AI-Native Full-Stack Engineer (TypeScript: React/Next.js front end, NestJS/Node.js back end, AI agent tooling and LLM features); also open to frontend-focused roles",
  availability:
    "Open to remote, contract and freelance work with global teams. He is employed full-time now, so start dates are best discussed with him directly by email.",
  workSetup:
    "Open to remote / WFH (including remote roles for overseas companies), onsite, or hybrid, and open to relocation for the right full-time role",
  salaryExpectation:
    "Open to competitive compensation matched to the scope of the role. John prefers to discuss specifics directly for the role rather than list a figure.",
  freelanceNote:
    "Available for freelance/contract work; John scopes the project first, then discusses rate directly by email.",
  tagline: "Systems over shortcuts.",
  careerGoal:
    "Owning features end to end (data model, API, and UI) and the architecture decisions behind them (TypeScript/NestJS/Next.js preferred)",
  summary:
    "John has been building since he started self-studying in 2022 (four years hands-on), with professional production work at Crystal Vision since August 2025. He is a full-stack TypeScript engineer (NestJS, Next.js) who builds and operates production systems end to end: the admin console for a live song competition with 574 active users, where he is the sole developer of all 52 modules; the Xendit fiat payment rail; and a Laravel affiliate portal he owns end to end. He closed an authorisation hole that left 115 of 123 API endpoints role-unchecked, and took the console from 0 tests to a 251-test gate. He is also the author of provenly, an open-source verification layer that makes AI coding agents prove their work.",
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
      "BullMQ",
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
      a: "John holds a BS in Information Technology (Web and Mobile App Development) from Bulacan State University. He started self-studying programming in 2022 and has been building ever since. His first full production system was a complete e-commerce platform for G&F Auto Supply: POS, inventory, and an in-store pickup flow for items that need a face-to-face check before purchase. He then completed an SAP ABAP training at Accenture PH, followed by a role at Crystal Vision where he wrote tests for the ROLA.ai Flutter mobile app and built LMS quiz features full-stack. Most recently he has owned two production systems at Crystal Vision. On the Rola Competition Platform, a live song competition with 574 active users, he is the sole developer of the 52-module admin console, owns 8 modules of the shared NestJS admin API, and built the Xendit fiat payment rail. Separately he owns the KOL Dashboard end to end: a Laravel 12 affiliate and payout portal. Outside work he wrote provenly, an open-source verification layer for AI coding agents. He's full-stack: he ships the whole feature, not one half of it.",
    },
    {
      q: "Are you open to opportunities right now?",
      a: "John is open to remote, contract and freelance work with global teams. He's employed full-time now, so for a role, timing or a project, the best route is to email him and he'll reply within 24 hours.",
    },
    // The three technical answers sit high on purpose. They are the only ones backed by countable
    // scope, and a recruiter who asks one standard question usually asks it early.
    {
      q: "Tell me about a system you own end to end",
      a: "The admin console for the Rola Competition Platform. John is the sole developer of all 52 modules (61 pages in Next.js and React), and he owns 8 modules and 49 endpoints of the shared NestJS admin API behind it. The result is that operations staff run judging, moderation, payments and analytics themselves, with no engineer in the loop. He also took it from 0 tests to a 251-test gate that fails the build on any new red.",
    },
    {
      q: "What is the hardest technical problem you have solved?",
      a: "A payment queue that stranded people who had paid. The worker confirmed a payment, then registered the entrant. If it crashed between those two steps, the next retry saw the payment already confirmed, hit the duplicate-job early return and never registered them, and all 5 retries ended the same way, so the user saw 'You are not registered' after paying. John moved the registration upsert above that early return. The upsert is idempotent, so duplicate jobs stay harmless, and a crashed job now recovers on the first retry.",
    },
    {
      q: "What security problem have you fixed?",
      a: "The admin API's role guard was fail-open: any endpoint without an explicit role decorator was let through, and that was 115 of its 123 endpoints. John registered the guard globally and made undecorated routes admin-only by default. A route that is missing its decorator now fails loudly instead of quietly staying open to everyone.",
    },
    {
      q: "How do you handle sensitive user data?",
      a: "He handles it at the model layer, not screen by screen. On the KOL Dashboard, partner emails, names, wallet addresses and bank details showed raw on 5 admin views, and masking had been copied into controllers. John replaced that with one masking trait covering 7 kinds of personal data, locked down by 25 unit tests, so a new screen gets masked data by default.",
    },
    {
      q: "What are your strengths?",
      a: "John is strong on both backend and frontend, so he can own a feature end-to-end without handoffs. His biggest asset is grit: he doesn't give up on a problem until it's solved properly. He also practices stoicism, which means he stays composed under pressure and executes with full commitment regardless of how messy the situation gets.",
    },
    {
      q: "What is your weakness?",
      a: "John goes deep. He'll keep refining a system past the point the deadline actually needed, because he wants it right rather than merely done. The KOL masking layer got 25 unit tests when far fewer would have shipped. He's learned to timebox that: deliver the version that solves the problem, then come back and improve it. It's a trade-off he now manages deliberately rather than one he's blind to.",
    },
    {
      q: "How do you handle tight deadlines or pressure?",
      a: "John prioritizes by impact. At Crystal Vision, the team needed to add a FIAT payment option to the song competition, a significant backend change. But the CTO correctly identified the mobile API as Phase 1, the user-facing priority that had to ship first. John set the fiat work aside, shipped the mobile API first, then came back and built the Xendit fiat rail end to end, so a product that only took crypto could take fiat too. No drama, just execution in the right order.",
    },
    {
      q: "Where do you see yourself in 3–5 years?",
      a: "John's goal is to own features end to end (the data model, the API, and the interface), making the architecture decisions, mentoring other developers, and leading complex systems from design through production. He's building toward that deliberately with every project.",
    },
    {
      q: "Why should we hire you?",
      a: "Because he already owns production systems end to end. At Crystal Vision he is the sole developer of a 52-module competition admin console, he closed an authorisation hole that left 115 of 123 endpoints unchecked, he built the Xendit fiat rail, and he owns the Laravel affiliate portal from schema to screens. He also builds the guardrails that make AI coding agents prove their work. He ships whole systems, not tickets.",
    },
  ] as InterviewQa[],
} as const;
