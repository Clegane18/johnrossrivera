import { Project } from "@/types";

function seq(id: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/images/projects/${id}/${String(i + 1).padStart(2, "0")}.webp`
  );
}

function seqPrefixed(id: string, prefix: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) =>
      `/images/projects/${id}/${prefix}${String(i + 1).padStart(2, "0")}.webp`
  );
}

export const projects: Project[] = [
  // Coffeegusto and Pedia Dental are written to read for a small business owner and a recruiter
  // alike: plain words, no metrics nobody can check, and bullets about what the build does.
  // First in the array on purpose, so Coffeegusto is the card the deck opens on.
  {
    id: "coffeegusto",
    title: "Coffeegusto",
    label: "Prototype",
    summary:
      "Customers order and pay from their phone, so orders stop piling up in chat.",
    description:
      "A brand site and ordering app for a coffee shop, built as a prototype for a proposal. Customers browse the menu, choose a pickup branch, pay with GCash, and earn a stamp toward a free drink. The same setup fits any shop that takes orders.",
    problem:
      "Taking orders over chat eats the whole day. Every customer asks what is available, how much it costs, and when it will be ready. The owner answers each one by hand.",
    // "Built", not "sole author": 32 of its 42 commits are John's and 10 are an AI coding agent's
    // (evidence bank E32). The partnership the pitch led to is verbal, and there are no paying users.
    role: "Built the prototype and pitched it to the owners, which led to a partnership offer: menu, item options, branch picker, checkout with GCash, and a digital stamp card.",
    decisionsHeading: "What it does",
    decisions: [
      "Customers see every item with a photo and a price, and choose sugar, ice and add-ons on their own.",
      "They pick a branch and a pickup time, then pay with GCash or at the counter. The order comes in complete.",
      "A digital stamp card brings them back. Ten orders earn a free drink.",
    ],
    tech: ["Next.js", "Vercel"],
    liveUrl: "https://coffee-gusto-eight.vercel.app/",
    images: seqPrefixed("coffeegusto", "d-", 6),
    mobileImages: seqPrefixed("coffeegusto", "m-", 6),
    featured: true,
  },
  {
    // The id stays `pedia-dental` so the existing /work URL keeps working; the product is now called
    // Primolar, as on the CV. From the evidence bank (E27): a demo only. The backend is not deployed
    // and there are no real clinics on it, so never say "deployed" or "in use".
    id: "pedia-dental",
    title: "Primolar",
    label: "Demo",
    summary:
      "A multi-tenant clinic SaaS built solo: 53 data models, 142 API routes and about 2,150 tests.",
    description:
      "A SaaS for pediatric dental clinics, built solo (297 of 297 commits). Each clinic gets its own branches, staff, branding and plan tier, plus an operator console. NestJS and Prisma on MySQL, a Next.js web app and shared Zod schemas in a pnpm monorepo, with AWS CDK stacks and a GitHub Actions deploy. The web demo runs on sample data; the backend is not deployed and no clinic uses it yet.",
    problem:
      "A small clinic runs on calls and chat messages. Booking, reminding and confirming each visit takes a lot of back and forth, and it is easy to lose track of who is coming in.",
    role: "Sole developer: the API, the web app, the shared schemas, the infrastructure and the tests.",
    decisions: [
      "One codebase serves many clinics: each gets its own branches, staff, branding and a Small, Mid or Big tier.",
      "AWS CDK stacks (ECS Fargate, RDS) deployed by a GitHub Actions workflow that signs in with OIDC, so no AWS keys are stored anywhere.",
      "A pilot by 9 AI tester personas ran 469 UI tests and found 13 unique bugs. All 13 were fixed.",
      "Each role sees only what it needs: parents, front desk, dentists and admin.",
    ],
    impact: [
      { metric: "53", label: "data models" },
      { metric: "142", label: "API routes" },
      { metric: "~2,150", label: "test cases" },
    ],
    tech: [
      "NestJS",
      "Prisma",
      "MySQL",
      "Next.js",
      "Zod",
      "pnpm",
      "AWS CDK",
      "GitHub Actions",
      "Playwright",
    ],
    liveUrl: "https://primoral.vercel.app/login",
    images: seqPrefixed("pedia-dental", "d-", 4),
    mobileImages: seqPrefixed("pedia-dental", "m-", 4),
    featured: true,
  },
  {
    // The slug stays `rola-access-platform` even though the title is now the resume's name for the
    // system. The id is the /work/[slug] URL and the hero metric's href; renaming it would 404 every
    // link already in the wild for a string a recruiter never reads.
    id: "rola-access-platform",
    title: "Rola Competition Platform",
    // Every number below is from the CV evidence bank (E1, E6, E11, E16, E21, E23), checked against
    // the repos. Two claims this entry used to make are deliberately gone: "primary developer of the
    // backend / 200+ endpoints / 61 models" (John wrote 38.9% of that API; the modules that are his
    // total 49 endpoints) and the "concurrency-safe voting engine" (its rate limiters are a
    // colleague's). The 574 is the PRODUCT's active users, never the console's.
    summary:
      "Sole developer of the 52-module admin console for a live song competition with 574 active users.",
    description:
      "The admin console that runs a live song competition: judging, moderation, payments and analytics. John is the sole developer of the console (52 modules, 61 pages; Next.js, React, RTK Query), owns 8 modules and 49 endpoints of the shared NestJS admin API (analytics, rubrics, contest participants and the payment transaction reports), and built the Xendit fiat payment rail in the mobile API. The product had 574 active users in its first contest (Apr 22 to Jun 3, 2026).",
    problem:
      "Operations staff needed to run a live competition (judging, moderation, payments and analytics) without an engineer in the loop. Underneath, 115 of the admin API's 123 endpoints were never role-checked, the product only took crypto, and a worker crash at the wrong moment could leave a paying entrant permanently unregistered.",
    role: "Sole developer of the admin console (52 modules, 61 pages). Owner of 8 modules (49 endpoints) in the shared NestJS admin API and of the Xendit fiat rail in the mobile API.",
    decisions: [
      "Closed a fail-open authorisation guard. Any endpoint without an explicit role decorator was waved through, which was 115 of 123. Registered the guard globally and made undecorated routes admin-only, so a new route is closed until someone opens it.",
      "Fixed a payment queue that stranded paying users. A worker that crashed between confirming a payment and registering the entrant made all 5 retries dead-end at a duplicate-job return. Moving the idempotent upsert above that return lets the first retry recover.",
      "Built the Xendit fiat rail end to end so a crypto-only product could take fiat: the invoice service, the webhook with token validation, and the tests.",
      "Took the console from 0 tests to a 251-test gate that fails the build on any new red, across unit suites and Playwright end-to-end specs. The baseline is version-controlled, so re-blessing a failure leaves a reviewable diff.",
      "Wrote tests that compare what the console shows with what the database holds, then fixed every mismatch they found across 13 screens.",
      "Split Super Admin from Operation Admin, so exports and USDC payouts are no longer open to every admin.",
    ],
    impact: [
      { metric: "52", label: "admin modules, sole developer" },
      { metric: "115 of 123", label: "endpoints moved to default-deny" },
      { metric: "251", label: "tests in the build gate" },
      { metric: "574", label: "active users in the first contest" },
    ],
    architectureSvg: "/images/architecture/rola-access-platform.svg",
    tech: [
      "Next.js",
      "React 19",
      "TypeScript",
      "RTK Query",
      "NestJS 11",
      "MySQL",
      "Sequelize",
      "BullMQ",
      "JWT",
      "Xendit",
      "Playwright",
      "Jest",
    ],
    liveUrl: "https://dashboard.rola.ai/en/login",
    liveAuthGated: true,
    images: seq("rola-access-platform", 16),
    featured: true,
  },
  {
    id: "kol-dashboard",
    title: "KOL Dashboard",
    // From the evidence bank (E2, E3, E13, E22). "Owned end to end", not "sole builder": John has
    // 86% of the commits. Partner and signup counts are gone because nothing in the bank backs them.
    summary:
      "A Laravel 12 affiliate and payout portal, owned end to end: schema, payouts, OTP lockout and PII masking.",
    description:
      "The company's KOL and affiliate program in one system, replacing manual commission and payout reconciliation. Laravel 12 on a 16-model schema (John authored 15 of its 17 migration commits): referral tracking, commission on verification, a withdrawal flow with admin approval across 4 access levels, OTP login with lockout, and a masking layer that keeps partner PII off admin screens.",
    problem:
      "Finance reconciled affiliate commissions and payouts by hand, login codes could be guessed without limit, and partner emails, names and wallet details showed raw on admin screens.",
    role: "Owned it end to end (86% of commits): schema, service layer, payout flow, OTP hardening, PII masking and the admin UI.",
    decisions: [
      "A withdrawal flow from request to admin approval to completion, with receipt upload and transaction ID capture, across 4 access levels including a finance-restricted admin role.",
      "OTP login that used to allow unlimited guesses now expires in 10 minutes, waits 30 seconds between resends, and locks out after 5 failed attempts.",
      "A masking trait with 7 accessors (email, full name, wallet address, bank account and more) applied at the model layer across 5 admin views, covered by 25 unit tests, replacing masking that had been duplicated in controllers.",
      "Referral tracking moved to referral codes, with geo and device analytics from real data and CSV exports.",
    ],
    impact: [
      { metric: "16", label: "data models in the schema" },
      { metric: "15 of 17", label: "migration commits authored" },
      { metric: "4", label: "access levels in the payout flow" },
      { metric: "25", label: "unit tests on the PII masking layer" },
    ],
    architectureSvg: "/images/architecture/kol-dashboard.svg",
    tech: [
      "Laravel 12",
      "PHP",
      "MySQL",
      "RBAC",
      "FormRequest Validation",
      "CSV Export",
      "OTP Security",
    ],
    liveUrl: "https://kol.rola.ai/login",
    liveAuthGated: true,
    images: seq("kol-dashboard", 16),
    featured: true,
  },
  {
    id: "smart-lift-ai",
    title: "Smart-lift AI",
    // From the evidence bank (E20). No user count: none of John's personal projects has outside
    // users yet. The 249 tests are the API's; the client has none, so never say "fully tested".
    summary:
      "Built solo: a 78-endpoint NestJS API with 249 tests and real training logic, plus a Next.js client.",
    description:
      "A training platform built solo across two repos (135 commits). The NestJS API has 19 modules, 78 REST endpoints and 30 Prisma models, with domain logic rather than CRUD: plateau and ego-lift detection, progression evaluation, and nutrition targets that cap the calorie deficit. 249 API test cases, written alongside the features, and a Docker setup. The Next.js 16 client has 102 components.",
    problem:
      "General fitness apps don't adapt to the individual, so plateaus go undetected and macros drift as training changes.",
    role: "Sole developer of both repos: the NestJS API and the Next.js client.",
    decisions: [
      "Plateau detection and ego-lift detection with notifications, so the app flags a stall or an unsafe jump in weight.",
      "Nutrition targets that cap the calorie deficit and floor TDEE by training days, instead of a fixed formula.",
      "One in-progress session per user, enforced by the API rather than trusted to the client.",
      "Tests written alongside each feature: 249 cases across 17 spec files.",
    ],
    impact: [
      { metric: "78", label: "REST endpoints" },
      { metric: "249", label: "API test cases" },
      { metric: "30", label: "data models" },
    ],
    architectureSvg: "/images/architecture/smart-lift-ai.svg",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Redux Toolkit",
      "NestJS 11",
      "Node.js",
      "Prisma",
      "MariaDB",
      "Docker",
      "JWT",
    ],
    liveUrl: "https://smartlift-web.netlify.app/dashboard",
    repoUrls: [
      {
        label: "Frontend",
        url: "https://github.com/HeisenbergI8/smartlift",
      },
      {
        label: "Backend",
        url: "https://github.com/HeisenbergI8/smarlift-api",
      },
    ],
    images: seqPrefixed("smart-lift-ai", "d-", 15),
    mobileImages: seqPrefixed("smart-lift-ai", "m-", 14),
    featured: true,
  },
  {
    // Renamed from `claude-harness` on 2026-09-01, when the package became `provenly` on npm and the
    // GitHub repo followed. The slug moves with it, unlike `rola-access-platform` above, because the
    // reason that comment gives does not hold here: this entry was nine days old, GitHub 301s the old
    // repo name, and what changed is the project's public identity rather than a display title — a
    // /work/claude-harness URL would name a package that no longer exists anywhere.
    id: "provenly",
    title: "provenly",
    summary:
      "Open-source gate layer for Claude Code. Blocks a turn that claims the tests passed when the ledger says nothing ran.",
    description:
      "An MIT-licensed harness that installs into any repository and makes an AI agent's claims checkable. A per-turn ledger records which source files were edited and which verification commands actually ran, with each one's exit code; a Stop gate refuses a turn that edited source and verified nothing, or that asserts a green gate the ledger cannot support. Above the gates sit a plan pipeline and supervised task loop, advisory locks for two sessions sharing one checkout, and three reporters that price what the harness costs and grade the subagents whose only output is a report. 31 hook scripts, 5 role-separated agents, 11 skills and a 602-line installer, with zero npm dependencies, 534 tests on Node's built-in runner, on macOS, Linux and Windows.",
    problem:
      "An agent that writes code will eventually tell you it verified the code, sometimes having run nothing, not maliciously, but because 'the change looks right' and 'the change is checked' feel identical from the inside. A false green is worse than a reported red: a red gate gets fixed, a false green gets shipped. Instructions cannot close it, because a CLAUDE.md rule saying 'always run the tests' holds most of the time, which is the worst possible reliability: high enough to trust, low enough to burn you.",
    role: "Sole author: the evidence ledger and Stop gates, the five PreToolUse guards, the agent role separation, the plan pipeline and supervised task loop, the agent locks, the cost and agent-grading reporters, the installer, the docs, and the 534-test suite.",
    decisions: [
      "The fix lives outside the model. Hooks record what actually ran and a Stop gate compares the turn's claims against that record, so 'verified' stops being something the agent can assert about itself.",
      "Claims are classified by use versus mention. A naive matcher for 'all tests pass' fired 29 times in one session on pasted command output and on the tables documenting the matcher itself, and the 29th on the table listing the first 28. Commands are classified by the binary invoked per command segment, so grepping for a verify command in the docs never counts as having run it.",
      "The repair loop escalates on stuck failures, not on retries. Each iteration fingerprints the failure set with line and column numbers stripped; a changed fingerprint resets the counter, an unchanged one escalates and names what was already tried. Counting retries punishes a loop that is converging and rewards one that thrashes.",
      "The writer owns the format: the ledger writer exports its own reader, so a consumer cannot drift onto a field the writer never emits. Agreement is structural rather than merely tested: the worst bug here is a gate that silently stops working while its unit tests keep passing.",
      "'Registered' and 'firing' are different states. A heartbeat records which hooks actually fired and the selftest fails on anything registered but never seen, because a guard that never runs looks exactly like a guard with nothing to do.",
      "Model-authored strings get no shell. The plan verifier runs the command attached to each plan step, and a plan is a document a model wrote, so it executes an argument vector instead of a shell string, and ';', '&&' and '|' become inert literal arguments by construction. An earlier fix stripped metacharacters by regex and immediately refused legitimate checks. Nothing has to recognise an attack, so nothing can fail to; the commands you committed to the config still get a shell, because the boundary is provenance, not uniformity.",
      "A check that cannot fail is not a gate. A step verified by grepping for the token that same step writes passes the instant the text is typed. On one real plan, 11 of 16 checks were that shape. So every check is graded real, self, exists or none, and a linter scores every plan and diffs two scorings, because a number you can re-take and difference is an instrument where a number written down once is only a measurement.",
      "The graders get graded. A tester reporting PASS and an auditor reporting a score out of 100 are self-assessments no mechanism had ever checked, so the claim checker was pointed at the subagents' own transcripts. Across 71 real runs it found five audit reports whose rubric rows did not sum to the confidence score in their own header. It stays advisory: it reports on history, and history cannot be fixed by failing a build.",
      "Failure direction is chosen per actor and written down. A write guard fails closed for an agent under a rule, because a guard that fails open produces confidence it has not earned; for everyone else it fails open, because the alternative blocks every write in the session over a bug in one file. Every gate also stands aside after a bounded number of blocks. A gate that can trap a session gets switched off, and a switched-off gate protects nothing.",
    ],
    // 534 measured 2026-11-03 by running `node --test` on provenly v0.2.1 (all passing).
    impact: [
      { metric: "534", label: "tests, on Node's built-in runner" },
      { metric: "31", label: "gates, guards and hooks shipped" },
      { metric: "0", label: "npm dependencies" },
      {
        metric: "29",
        label: "false blocks removed by scoping claims to use, not mention",
      },
      {
        metric: "56%",
        label:
          "of 473 plan steps found gated on a check that cannot report failure",
      },
      {
        metric: "71",
        label: "subagent runs graded against their own transcripts",
      },
    ],
    architectureSvg: "/images/architecture/provenly.svg",
    tech: [
      "Node.js",
      "JavaScript (ESM)",
      "Claude Code Hooks",
      "node:test",
      "JSON Schema",
    ],
    // No liveUrl and no screenshots on purpose: it is a set of hooks, so there is nothing to look at
    // and no deployment to visit. The repo is the artifact, and the deck card falls back to its
    // monogram tile rather than dressing a CLI up as a product. The README's demo GIF is the one
    // frame worth showing, and it is deliberately not wired in here: next/image would serve a static
    // first frame, and un-optimising it means changing the carousel for every other project too.
    repoUrls: [
      {
        label: "Source",
        url: "https://github.com/HeisenbergI8/provenly",
      },
    ],
    featured: true,
  },
  {
    id: "gf-commerce",
    // See the matching entry in lib/data/experience.ts — dropped from the CV, hidden from the page,
    // retained here so the chat can still speak to it.
    hiddenOnPage: true,
    title: "G&F Auto Supply Commerce",
    description:
      "Unified commerce backend for POS, inventory, payment, and reservation workflows with secure OAuth integration and audit-backed admin analytics for retail operations.",
    tech: [
      "Node.js",
      "JavaScript",
      "PostgreSQL",
      "Sequelize",
      "OAuth",
      "Express.js",
    ],
    repoUrls: [
      {
        label: "Frontend",
        url: "https://github.com/Clegane18/front-end-rev-auto-parts",
      },
      {
        label: "Backend",
        url: "https://github.com/Clegane18/rev-auto-parts",
      },
    ],
    images: seq("gf-commerce", 27),
    featured: false,
  },
  {
    id: "sniff-sense-ai",
    title: "Sniff Sense AI",
    description:
      "Backend-driven perfume recommendation platform with layered architecture, JWT security, validation, logging, and optimized PostgreSQL queries for collection management, scent logging, and analytics.",
    tech: [
      "Node.js",
      "TypeScript",
      "Express.js",
      "PostgreSQL",
      "Sequelize",
      "JWT",
    ],
    repoUrls: [
      {
        label: "Frontend",
        url: "https://github.com/HeisenbergI8/sniffsense-ai-web",
      },
      {
        label: "Backend",
        url: "https://github.com/Clegane18/sniff-sense-ai-api",
      },
    ],
    featured: false,
  },
  {
    id: "rr-remo-trucking",
    title: "RR Remo Trucking",
    // From the evidence bank (E17) and the CV, which names no clients for this engagement. The fleet
    // size, the client list and the Zuellig pitch are gone: they are the company's facts, not the
    // software's, and nothing in the bank backs the pitch claim.
    summary:
      "A trucking company's site and Groq assistant that refuses to invent a price, address or delivery date.",
    description:
      "A Next.js 16 site for a Philippine trucking company with 'Traki', a Groq LLaMA 3.1 assistant grounded in a fixed fact sheet. Its standing rules: answer only from the facts given, never invent an address, phone number, price or date, and send anything unlisted to a real phone number. Validated input and a Resend contact form.",
    problem:
      "A trucking company wanted an assistant that answers customers at any hour, and an assistant that guesses a price or a delivery date does more harm than having none.",
    role: "Sole author (freelance): the site, the assistant and its guardrails, and the contact form.",
    decisions: [
      "Grounded on a fixed fact sheet: the assistant refuses rather than invents, and routes anything it does not know to a real phone number.",
      "Replies capped at 300 tokens and streamed, so answers stay short and arrive fast.",
      "Malformed message arrays are rejected with a 400 before they reach the model.",
    ],
    architectureSvg: "/images/architecture/rr-remo-trucking.svg",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "Groq API",
      "LLaMA 3.1",
      "Resend",
      "Vercel",
    ],
    liveUrl: "https://rrremo-trucking.vercel.app/",
    repoUrls: [
      {
        label: "Source",
        url: "https://github.com/HeisenbergI8/rrremo-trucking",
      },
    ],
    images: seqPrefixed("rr-remo-trucking", "d-", 6),
    mobileImages: seqPrefixed("rr-remo-trucking", "m-", 7),
    featured: true,
  },
];
