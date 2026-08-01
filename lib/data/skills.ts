import { Skill } from "@/types";

// The single source of truth for skills — the Skills section renders this, and
// lib/ai/system-prompt.ts derives the chat's TECHNICAL SKILLS block from it, so the page and
// Nuggets cannot list different stacks.
//
// Deliberately SHORT. The previous list ran 33 entries across Languages/Frameworks/Dev Tools and
// included things John touched once (Angular, Moleculer.js, Pest, "DevOps"). A long list does not
// read as range, it reads as unfiltered — and every item on it is something an interviewer may
// probe. What is here is what he can be questioned on cold. Order is load-bearing: the first card
// is the stack he is applying with.
export const skills: Skill[] = [
  {
    id: "core",
    category: "Core Stack",
    // Laravel and PHP are last, not absent. They are the stack of a featured project (the KOL payout
    // portal, built solo) and of the Crystal Vision role, and they lead the frameworks line on the
    // resume — omitting them left the Skills section contradicting the site's own case study.
    items: [
      "TypeScript",
      "React",
      "Next.js",
      "NestJS",
      "Node.js",
      "Laravel",
      "PHP",
    ],
  },
  {
    id: "data-apis",
    category: "Data & APIs",
    // Sequelize and RTK Query are here because the site's own work claims them — Sequelize across 5
    // project/experience entries, RTK Query across 4 — and both sit on the CV's frameworks and
    // dev-tools lines. Listing a stack in a case study that the Skills section denies is the drift
    // this file exists to prevent.
    items: ["MySQL", "Prisma", "Sequelize", "REST", "RTK Query", "JWT", "RBAC"],
  },
  {
    id: "testing-tooling",
    category: "Testing & Tooling",
    items: ["Jest", "Playwright", "Git", "Docker"],
  },
  {
    id: "engineering-leverage",
    category: "Engineering Leverage",
    items: [
      "Agentic dev harness",
      "Automated code review",
      "Test generation",
      "Secret scanning",
    ],
    // No "this isn't a crutch" disclaimer here on purpose. Two independent recruiter-lens passes
    // read the earlier defensive version as planting the exact doubt it was rebutting. What replaces
    // it is falsifiable: the harness is in this repo, and every claim below is a hook you can open.
    note: "I build my own agentic tooling. This portfolio ships with a 14-subagent Claude Code harness that checks every diff against the architecture rules, generates the tests, and hard-blocks any commit that would leak a secret or break the production build — and a separate 8-subagent harness does the same for my production work at Crystal Vision.",
  },
];
