export const siteConfig = {
  name: "John Ross Rivera",
  title: "John Ross Rivera - Full-Stack Software Engineer",
  description:
    "Personal portfolio of John Ross Rivera, a full-stack software engineer shipping production systems end to end: TypeScript, React and Next.js on the front, NestJS APIs and MySQL behind them.",
  url: "https://johnrossrivera.vercel.app",
  email: "johnrossrivera20@gmail.com",
  phone: "+63 921 670 6170",
  role: "Full-Stack Software Engineer",
  // One copy, read by BOTH the navbar label and the hero role card. It used to sit under `navbar`,
  // which framed a hiring fact as chrome and left the hero unable to use it without a second copy.
  // The hero needs it because the navbar label is `hidden lg:flex`, and lg is 1280 here, so on
  // every phone and tablet the navbar states no availability at all.
  availability: "Open to full-time & freelance",
  // Held to ~18 words. Eye-tracking puts the first-screen scan at roughly 7 seconds, which is
  // 25-30 words for the WHOLE card, and this sentence shares that budget with the role heading,
  // two CTAs and the availability line beneath them. The previous version spent 40 words, and
  // most of them restating numbers that heroMetrics already renders as tiles directly alongside
  // it, so the scan paid twice for one fact and the stack was never stated at all.
  // What is left is the part no tile can carry: the seniority of the ownership.
  // The card is ~20rem wide on desktop and overflows past ~280 chars, so that is still the ceiling.
  heroDescription:
    "Sole developer of a live song competition's 52-module admin console, and author of provenly, an open-source verification layer for AI coding agents.",
  heroPrimaryCta: {
    label: "View My Work",
    href: "#projects",
  },
  heroSecondaryCta: {
    label: "Download Resume",
    href: "/john-ross-rivera-resume.pdf",
  },
  // Proof strip under the hero. Every value is a number already in lib/data/projects.ts, and every
  // one is John's own output, checked against the CV evidence bank (E1, E16, E21) or measured:
  // pointers, not new claims. Each tile links to the case study that backs it.
  //
  // The old set led with "917K users served", "200+ endpoints" and "47 pages". The bank lists the
  // backend claim under "do not use" (John wrote 38.9% of that API), the page count is out of date,
  // and the user figure is not one the CV makes. Product scale now lives in the case study as the
  // 574 active users, where it can be stated precisely.
  //
  // Labels stay short (12-18 characters) so the four-across row never wraps one tile.
  heroMetrics: [
    {
      value: "52",
      label: "modules built solo",
      href: "/work/rola-access-platform",
    },
    {
      value: "115/123",
      label: "routes locked down",
      href: "/work/rola-access-platform",
    },
    {
      value: "251",
      label: "tests in CI gate",
      href: "/work/rola-access-platform",
    },
    // Measured 2026-11-03: `node --test` on provenly v0.2.1, 534 passing.
    { value: "534", label: "provenly tests", href: "/work/provenly" },
  ],
  // The stack row that sits above the proof strip. A recruiter filtering for "React + NestJS" could
  // previously only confirm the stack by scrolling to the Skills section, which is the one question
  // the fold was silent on while spending 40 words on numbers the tiles were already showing.
  //
  // Six, not sixteen. Every source on portfolio heroes makes the same point about long stack lists:
  // past roughly eight, none of the entries reads as credible, because the list stops looking
  // chosen. These six are the stack John is applying with, in the order lib/data/skills.ts already
  // puts them.
  //
  // It was briefly cut to five, when the row carried a "Stack" eyebrow label and a sixth entry
  // wrapped it to two lines. That label is gone and the row is capsules now, so the constraint went
  // with it and Prisma is back: MySQL alone states the database but not how the app talks to it.
  //
  // Deliberately a SUBSET of lib/data/skills.ts rather than its own list. A hero that features a
  // technology the Skills section omits is the same drift heroMetrics avoids by linking each tile
  // to its case study, and config/site.test.ts fails if this stops being a subset.
  heroStack: ["TypeScript", "React", "Next.js", "NestJS", "MySQL", "Prisma"],
  // The row of three above the metric tiles. Each one links to the page that backs it, the same
  // rule the metrics follow, so the strip is a set of pointers rather than new claims.
  proofCredentials: [
    {
      mark: "CV",
      title: "Crystal Vision",
      caption: "Full-stack · 2025 to now",
      href: "/#experience",
    },
    {
      mark: "pv",
      title: "provenly",
      caption: "Open source author",
      href: "/work/provenly",
    },
    {
      mark: "RR",
      title: "RR Remo Trucking",
      caption: "Grounded AI assistant",
      href: "/work/rr-remo-trucking",
    },
  ],
  // The left rail's section list. The rail renders these as "/#id" links so they also work from
  // /work/* pages, where none of these sections exist.
  railNav: [
    { number: "01", label: "Work", id: "work" },
    { number: "02", label: "Experience", id: "experience" },
    { number: "03", label: "Stack", id: "stack" },
    { number: "04", label: "Open source", id: "open-source" },
    { number: "05", label: "Contact", id: "contact" },
  ],
  heroTagline: "Systems over shortcuts.",
  heroTaglineTranslation: "Deliberate architecture. Reliable by default.",
  about: {
    // The CV's summary (Oct 31 2026) in first person. It replaced a "900k+ users" claim the CV no
    // longer makes; 574 is the product's active users, never the console's.
    bio: "I build and run production systems end to end in TypeScript (NestJS, Next.js): the admin console for a live song competition with 574 active users, a fiat payment rail, and a Laravel affiliate portal. I also wrote provenly, an open-source layer that makes AI coding agents prove their work.",
    // Full locality, not just "Philippines". lib/data/profile.ts reads this field rather than
    // keeping its own copy, so the page and the chat can no longer state two different locations.
    location: "Bacoor, Cavite, Philippines",
    lightImageUrl: "/images/light-profile.webp",
    darkImageUrl: "/images/dark-profile.webp",
    imageAlt: "Portrait of John Ross Rivera",
  },
  // The single copy of the degree. It used to be written one way here and another in
  // lib/data/profile.ts ("Bachelor of Science in…" vs "BS…"), which is two answers to one question.
  // "BS Information Technology" matches the resume exactly.
  education: {
    school: "Bulacan State University",
    degree:
      "BS Information Technology, Major in Web and Mobile App Development",
    years: "2020 - 2025",
    coursework: [
      "Software Engineering",
      "Database Systems",
      "Artificial Intelligence",
    ],
  },
  social: {
    github: "https://github.com/HeisenbergI8",
    linkedin: "https://www.linkedin.com/in/john-ross-rivera-a39a94273",
  },
  sectionLabels: {
    about: "/About Me",
    skills: "/Technical Skills",
    experience: "/Experience",
    projects: "/Selected Work",
    liveDemo: "/Live API",
    contact: "/Get In Touch",
  },
  navbar: {
    contactCtaLabel: "Let's Talk",
    resumeCtaLabel: "Resume",
    showCounters: false,
  },
  contact: {
    intro:
      "I'm actively looking for full-stack or frontend roles with global teams (remote, hybrid, or relocation), and I can start after a 30-day notice period. I also take on freelance and contract work: email me and I'll scope it with you. I respond within 24 hours.",
  },
  footer: {
    copyrightText: "All rights reserved.",
  },
  links: {
    resume: "/john-ross-rivera-resume.pdf",
  },
  chat: {
    // No paw emoji. The name and the portrait are the character here; an emoji stapled to the name
    // in the panel header was the thing that made an assistant grounded on real project data read
    // as a novelty. `role` gives the header a second line that says what the tool IS, which is what
    // the fake pulsing "Online" dot used to occupy.
    name: "Nuggets",
    role: "Portfolio assistant",
    avatarPath: "/images/nuggets.webp",
    // "How I built this" — surfaced in the widget so the chat reads as an engineering demo, not a toy.
    techNote: {
      heading: "How Nuggets works",
      points: [
        "Model: Llama 3.3 70B via Groq, streamed token-by-token over a ReadableStream.",
        "Grounded on real portfolio data: the system prompt is derived from the same project/experience files the site renders, so answers can't contradict the page.",
        "Guardrails: Zod-validated requests, a strict factual prompt, and a no-fabrication rule.",
        "Cost & abuse control: best-effort per-IP throttling (~20 req/hour, per instance) and a 400-token response cap.",
      ],
    },
  },
  // `shortLabel` is for the mobile dock ONLY, where six labels share one phone-width row. It is
  // null wherever the full label already fits, so the two never drift for no reason — the desktop
  // nav and the section headings always render `label`.
  nav: [
    { label: "About", href: "#about", counter: null, shortLabel: null },
    { label: "Skills", href: "#skills", counter: "4", shortLabel: null },
    {
      label: "Experience",
      href: "#experience",
      counter: "3",
      shortLabel: "Work",
    },
    { label: "Projects", href: "#projects", counter: "4", shortLabel: null },
    {
      label: "Live API",
      href: "#live-demo",
      counter: null,
      shortLabel: "API",
    },
    { label: "Contact", href: "#contact", counter: null, shortLabel: null },
  ],
};
