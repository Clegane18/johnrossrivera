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
    id: "rola-access-platform",
    title: "Rola Access Platform",
    summary:
      "Guard-based RBAC and cursor pagination for a live competition console that holds under load.",
    description:
      "A modular NestJS + Next.js platform for a live song competition serving 917,026 registered users — guard-based RBAC isolates judge and admin views, and cursor pagination holds under load.",
    problem:
      "A legacy admin portal couldn't safely scale to a live, ~900k-user song competition — judge and admin responsibilities shared the same surface, and large lists degraded under load.",
    role: "Full-stack engineer (backend-focused) — owned the NestJS API, guard-based RBAC, and pagination, and built the Next.js + RTK Query admin frontend.",
    decisions: [
      "Guard-based RBAC isolating judge scoring from admin management — least privilege enforced per view.",
      "Cursor-based pagination so large datasets page without offset-scan degradation.",
      "Field-scoped API responses — each view receives only the fields it needs, minimising payload.",
    ],
    impact: [{ metric: "917,026", label: "registered users served" }],
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
      "Earnings and withdrawal approvals that stay consistent under concurrent transactions.",
    description:
      "Operations and earnings dashboard for 1,000+ KOL partners on a Laravel 12 service layer — multi-state withdrawal approvals and OTP-hardened auth that stay consistent under concurrent transactions.",
    problem:
      "KOL partners needed transparent, tamper-resistant earnings and a withdrawal flow that stays consistent under concurrent transactions.",
    role: "Full-stack engineer (backend-focused) — owned the Laravel service layer, auth hardening, the approval workflow, and the operations dashboard UI.",
    decisions: [
      "Service-layer architecture isolating referral, earnings, and notification workflows to prevent data-consistency issues under concurrency.",
      "Multi-state withdrawal approval flow with explicit, auditable state transitions.",
      "OTP-hardened auth: brute-force protection, rate-limited resend, and expiry enforcement.",
    ],
    impact: [
      { metric: "1,000+", label: "KOL partners served" },
      { metric: "5,000", label: "referral-driven signups tracked" },
    ],
    architectureSvg: "/images/architecture/kol-dashboard.svg",
    tech: [
      "Laravel 12",
      "PHP",
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
    impact: [
      { metric: "Zuellig", label: "enterprise client won" },
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
