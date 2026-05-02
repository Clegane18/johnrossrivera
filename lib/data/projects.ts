import { Project } from "@/types";

function seq(id: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/images/projects/${id}/${String(i + 1).padStart(2, "0")}.png`
  );
}

function seqPrefixed(id: string, prefix: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) =>
      `/images/projects/${id}/${prefix}${String(i + 1).padStart(2, "0")}.png`
  );
}

export const projects: Project[] = [
  {
    id: "rola-access-platform",
    title: "Rola Access Platform",
    description:
      "Built to manage a live song competition platform serving 913,989 registered users. Replaced a legacy admin portal with a modular NestJS + Next.js system — implementing guard-based RBAC that isolates judge scoring views from admin management, cursor-based pagination to handle large datasets without performance degradation, and a dedicated judge portal for real-time contest entry scoring. APIs are designed to return only the fields each view requires, minimising payload size across all admin and judge workflows.",
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
    images: seq("rola-access-platform", 16),
    featured: true,
  },
  {
    id: "kol-dashboard",
    title: "KOL Dashboard",
    description:
      "Operations and earnings dashboard for 1,000+ KOL partners, directly contributing to 5,000 new user acquisitions through transparent performance visibility. Handles 50+ daily transactions with a multi-state withdrawal approval flow, OTP-hardened authentication with brute-force protection, rate-limited resend logic, and expiry enforcement. The Laravel 12 service-layer architecture isolates referral, earnings, and notification workflows to prevent data consistency issues during concurrent transaction processing.",
    tech: [
      "Laravel 12",
      "PHP",
      "RBAC",
      "FormRequest Validation",
      "CSV Export",
      "OTP Security",
    ],
    liveUrl: "https://kol.rola.ai/login",
    images: seq("kol-dashboard", 16),
    featured: true,
  },
  {
    id: "smart-lift-ai",
    title: "Smart-lift AI",
    description:
      "Personal production training system with 10 active users, built on one principle: you can't improve what you can't measure. The NestJS backend runs rule-driven engines for automatic plateau detection, macro auto-adjustment, equipment-aware workout generation, and ego-lift alerts — all scoped to each user's goals, training frequency, difficulty level, and muscle prioritization. Tracks strength progressions, body weight, and caloric intake with aggregated analytics across the full training cycle.",
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
      "TypeScript",
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
];
