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
  {
    // The slug stays `rola-access-platform` even though the title is now the resume's name for the
    // system. The id is the /work/[slug] URL and the hero metric's href; renaming it would 404 every
    // link already in the wild for a string a recruiter never reads.
    id: "rola-access-platform",
    title: "Rola Competition Platform",
    summary:
      "Sole developer of a 47-page admin console over a 200+ endpoint NestJS backend, on a platform with 917,026 registered users.",
    description:
      "The admin console and backend for a live song competition with 917,026 registered users. Sole developer of the console (34 modules, 47 pages) and primary developer of the NestJS backend behind both it and the mobile app — 37 modules, 200+ REST endpoints, 61 data models — including the payment stack and a concurrency-safe voting engine.",
    problem:
      "A legacy admin portal couldn't safely run a live competition at ~900k-user scale: operations staff needed to drive judging, moderation, payments and analytics without engineering involvement, judge and admin responsibilities shared one surface, contest results were exposed to vote manipulation and race conditions, and large lists degraded under load.",
    role: "Sole developer of the admin console (34 modules, 47 pages; Next.js/React) and primary developer of the NestJS backend serving both the console and the mobile app (37 modules, 200+ REST endpoints, 61 data models).",
    decisions: [
      "Two payment rails — on-chain USDC on Polygon and Xendit for fiat — reconciled so a user is never double-charged for a single entry.",
      "A concurrency-safe voting engine with per-user and per-IP rate limiting, so contest results hold against manipulation and race conditions under load.",
      "Guard-based RBAC isolating judge scoring from admin management — least privilege enforced per view.",
      "Cursor-based pagination so large datasets page without offset-scan degradation.",
      "Field-scoped API responses — each view receives only the fields it needs, minimising payload.",
      "9+ self-serve analytics dashboards with CSV export, so the business reads its own users, revenue and engagement without an engineer in the loop.",
    ],
    // Four tiles, and the user count is deliberately no longer alone: "registered users" is the
    // client's platform scale, while endpoints/models/pages are John's own output. A recruiter who
    // discounts the first number still has three they cannot attribute to anyone else.
    impact: [
      { metric: "200+", label: "REST endpoints owned" },
      { metric: "61", label: "data models designed" },
      { metric: "47", label: "admin pages shipped solo" },
      { metric: "917,026", label: "registered users on the platform" },
    ],
    architectureSvg: "/images/architecture/rola-access-platform.svg",
    tech: [
      "NestJS 11",
      "Node.js",
      "MySQL",
      "Sequelize",
      "JWT",
      "Passport.js",
      "Next.js",
      "React 19",
      "TypeScript",
      "RTK Query",
      "Xendit",
      "USDC / Polygon",
    ],
    liveUrl: "https://dashboard.rola.ai/en/login",
    liveAuthGated: true,
    images: seq("rola-access-platform", 16),
    featured: true,
  },
  {
    id: "kol-dashboard",
    title: "KOL Dashboard",
    summary:
      "Sole builder of a Laravel affiliate/payout portal — commission approvals that stay consistent under concurrent transactions.",
    description:
      "The company's entire KOL/affiliate program in one system, serving 1,000+ partners and tracking 5,000 referral-driven signups. Built solo on Laravel 12 with a schema designed from scratch (16 models, 23 migrations): a payout state machine with role-based approval across 4 access levels, OTP-hardened auth, and a reusable masking layer that keeps emails, names and wallet addresses out of the UI, logs and exports.",
    problem:
      "Finance was reconciling affiliate commissions and payouts by hand, KOL partners had no transparent view of their earnings, and sensitive partner data — emails, names, wallet addresses — leaked into dashboards, logs and CSV exports.",
    role: "Sole builder — designed the schema from scratch and owned the Laravel service layer, the payout state machine, auth hardening, the PII masking layer, and the operations dashboard UI.",
    decisions: [
      "A payout state machine with explicit, auditable transitions and role-based approval across 4 access levels, so commission approvals stop being a manual reconciliation.",
      "A reusable masking layer covering the UI, logs and exports, locked down by 25 unit tests — PII protection that a new export cannot silently bypass.",
      "Service-layer architecture isolating referral, earnings, and notification workflows to prevent data-consistency issues under concurrency.",
      "OTP-hardened auth: brute-force protection, rate-limited resend, and expiry enforcement.",
    ],
    impact: [
      { metric: "1,000+", label: "KOL partners served" },
      { metric: "16", label: "data models designed from scratch" },
      { metric: "4", label: "approval levels in the payout flow" },
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
    summary:
      "Rule-driven training engines — plateau detection, macro adjustment, workout generation.",
    description:
      "A personal production training system (10 active users) whose NestJS backend runs rule-driven engines for plateau detection, macro auto-adjustment, and equipment-aware workout generation — all scoped per user.",
    problem:
      "General fitness apps don't adapt to the individual — plateaus go undetected and macros drift as training changes.",
    role: "Full-stack — designed the NestJS rule engines and the Next.js client end to end.",
    decisions: [
      "Rule-driven engines for plateau detection, macro auto-adjustment, and equipment-aware workout generation, scoped per user.",
      "Aggregated analytics across strength, body weight, and caloric intake over the full training cycle.",
      "Modular domain workflows so training, nutrition, and analytics evolve independently.",
    ],
    impact: [
      { metric: "10", label: "active users in production" },
      {
        metric: "4",
        label: "automated coaching engines (plateau, macro, workout, ego-lift)",
      },
    ],
    architectureSvg: "/images/architecture/smart-lift-ai.svg",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "RTK Query",
      "NestJS 11",
      "Node.js",
      "Prisma",
      "MySQL",
      "JWT",
      "RBAC",
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
    summary:
      "Logistics platform with a streaming AI assistant built against hallucination.",
    description:
      "A production Next.js portfolio and AI logistics platform for a Philippine trucking company (74 vehicles) whose enterprise clients include Zuellig, Lazada, Jollibee, and Shopee — featuring 'Traki', a streaming Groq-backed assistant with a strict anti-hallucination prompt.",
    problem:
      "A growing trucking company needed a credible web presence and an AI assistant that answers customer questions accurately — without hallucinating logistics details.",
    role: "Full-stack (freelance) — owned the Next.js App Router build, the streaming AI assistant, and the SEO + contact stack.",
    decisions: [
      "'Traki' streaming assistant on Groq (LLaMA 3.1 8B) via ReadableStream, with a strict factual system prompt to prevent hallucination.",
      "Server Components by default — 'use client' on only three interactive components to minimise client JS.",
      "Full SEO stack: schema.org LocalBusiness JSON-LD, Open Graph, Twitter Card, dynamic sitemap.ts and robots.ts.",
    ],
    // "enterprise client won" claimed the win itself on a two-month freelance build, and John's own
    // resume names no clients for this engagement at all. The site should not out-claim the resume:
    // the site was part of the pitch, which is both true and still worth stating.
    impact: [
      { metric: "Zuellig", label: "pitch the site supported" },
      { metric: "74", label: "vehicles on the platform" },
    ],
    clients: [
      {
        name: "Zuellig",
        note: "Major PH distributor — the site John built was part of the winning pitch.",
      },
      { name: "Lazada" },
      { name: "Jollibee" },
      { name: "Shopee Philippines" },
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
