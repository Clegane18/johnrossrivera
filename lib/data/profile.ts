// Single source of truth for the facts Nuggets (the chat assistant) grounds on that are NOT already
// captured by lib/data/projects.ts or lib/data/experience.ts. The chat route composes its system
// prompt from this module + those two data files, so a fact is edited in exactly one place.
//
// IMPORTANT: positioning fields (workSetup, salaryExpectation, freelanceNote) reflect John's current
// stance — employed, open to senior roles + freelance, and NOT disclosing a salary/rate figure.
// Edit them here — they flow into everything Nuggets tells a recruiter.

import { siteConfig } from "@/config/site";

export interface InterviewQa {
  q: string;
  a: string;
}

export const profile = {
  fullName: "John Ross Rivera",
  location: "Bacoor, Cavite, Philippines",
  // Single source of truth for contact details is config/site.ts (Contact + Footer render it).
  email: siteConfig.email,
  roleTarget:
    "Backend Developer (open to full-stack if Node.js/TypeScript-based)",
  availability:
    "Currently employed and happy in the role — not actively job-hunting, but open to the right senior full-time opportunity and to freelance/contract projects.",
  workSetup:
    "Open to remote / WFH (including remote roles for overseas companies), onsite, or hybrid — and open to relocation for the right full-time role",
  salaryExpectation:
    "Open to competitive senior-level compensation — John prefers to discuss specifics directly for the role rather than list a figure.",
  freelanceNote:
    "Available for freelance/contract work; John scopes the project first, then discusses rate directly by email.",
  tagline: "Systems over shortcuts.",
  careerGoal: "Senior Backend Developer (Node.js/TypeScript/NestJS preferred)",
  summary:
    "John started self-studying programming and building projects in 2022 — about 4 years of hands-on development experience. He specializes in production backend infrastructure: auth systems, service layers, access control, and data pipelines. He has shipped systems serving 900k+ users, built role-based access platforms for live competition workflows, and designed analytics and earnings dashboards for operations teams. When scope demands it, he owns the full stack.",
  education: {
    school: "Bulacan State University",
    degree:
      "BS Information Technology, Major in Web and Mobile App Development",
    years: "2020–2025",
    coursework: [
      "Software Engineering",
      "Database Systems",
      "Artificial Intelligence",
    ],
  },
  skills: {
    languages: [
      "JavaScript",
      "TypeScript",
      "Java",
      "SQL",
      "HTML",
      "CSS",
      "PHP",
    ],
    frameworks: [
      "React",
      "Next.js",
      "Angular",
      "Moleculer.js",
      "Laravel",
      "Tailwind CSS",
      "Node.js",
      "Express.js",
      "NestJS",
      "Redux Toolkit",
      "RTK Query",
      "Sequelize",
      "Prisma",
      "Passport.js",
      "Jest",
      "Playwright",
      "Pest",
      "PHPUnit",
    ],
    devTools: [
      "Git",
      "GitHub",
      "Bash",
      "Visual Studio Code",
      "Jira",
      "Docker",
      "Postman",
      "DevOps",
    ],
  },
  social: {
    github: "https://github.com/HeisenbergI8",
    linkedin: "https://www.linkedin.com/in/john-ross-rivera-a39a94273",
  },
  interviewQa: [
    {
      q: "Tell me about yourself / Walk me through your background",
      a: "John holds a BS in Information Technology (Web and Mobile App Development) from Bulacan State University. He started self-studying programming in 2022 and has been building ever since. His first full production system was a complete e-commerce platform for G&F Auto Supply — POS, inventory, and an in-store pickup flow for items that need a face-to-face check before purchase. He then completed an SAP ABAP training at Accenture PH, followed by a role at Crystal Vision where he worked as both a software engineer and QA tester — writing tests for the ROLA.ai Flutter mobile app and building LMS quiz features full-stack. Most recently he architected two production systems at Crystal Vision that now serve 917,026 users: the Rola Access Platform and KOL Dashboard. He's backend-focused by specialty, full-stack by practice.",
    },
    {
      q: "Are you open to opportunities right now?",
      a: "John is currently employed and happy where he is, so he's not actively job-hunting. That said, he's open to the right senior full-time opportunity down the line, and he takes on freelance/contract projects now. He's driven by growth and genuinely hard engineering problems — for freelance work, the best move is to email him so he can scope it with you.",
    },
    {
      q: "What are your strengths?",
      a: "John is strong on both backend and frontend — he can own a feature end-to-end without handoffs. His biggest asset is grit: he doesn't give up on a problem until it's solved properly. He also practices stoicism, which means he stays composed under pressure and executes with full commitment regardless of how messy the situation gets.",
    },
    {
      q: "What is your weakness?",
      a: "John is honest about this: he's not the most articulate speaker on first pass — he sometimes needs to hear instructions more than once to fully internalize them before acting. He's actively working on this. What he lacks in first-take articulation, he makes up for in execution quality.",
    },
    {
      q: "How do you handle tight deadlines or pressure?",
      a: "John prioritizes by impact. At Crystal Vision, the team needed to add a FIAT payment option to the song competition — a significant backend change. But the CTO correctly identified the mobile API as Phase 1, the user-facing priority that had to ship first. John set the FIAT work aside, completed the mobile API, then picked up the admin-side changes. No drama — just execution in the right order.",
    },
    {
      q: "Where do you see yourself in 3–5 years?",
      a: "John's goal is to grow into a Senior Backend Developer role — owning architecture decisions, mentoring junior developers, and leading complex backend systems from design to production. He's building toward that deliberately with every project.",
    },
    {
      q: "Why should we hire you?",
      a: "Beyond the technical breadth — backend, frontend, QA, architecture — what sets John apart is his mindset. He practices stoicism: he shows up fully, does the work with discipline, and doesn't fold under difficulty. He won't be the loudest voice in the room, but he'll be one of the most reliable.",
    },
  ] as InterviewQa[],
} as const;
