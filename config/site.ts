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
    "Sole developer of a live competition platform's admin console, and primary developer of the NestJS backend behind it.",
  heroPrimaryCta: {
    label: "View My Work",
    href: "#projects",
  },
  heroSecondaryCta: {
    label: "Download Resume",
    href: "/john-ross-rivera-resume.pdf",
  },
  // Proof strip under the hero. Every value is a real number already present in lib/data/projects.ts —
  // these are pointers to it, not new claims, so the two cannot drift into disagreeing.
  //
  // "registered users", not "users served": the 917k belong to the CLIENT's platform, not to John,
  // and the label should not imply he served them. The case study behind this tile now leads with
  // numbers that ARE his own output (200+ endpoints, 61 data models, 47 pages shipped solo), so the
  // borrowed-scale number no longer has to carry the claim alone. Each tile links to the case study
  // that substantiates it — a number a recruiter can check beats a bigger one they cannot.
  // One number for the scale worked at, three for the work done.
  //
  // The previous set was four of the CLIENTS' business numbers: 74 vehicles is a haulier's fleet
  // size, 1,000+ KOL partners is a marketing programme's headcount, and neither says anything about
  // the engineer. Scale is still worth stating — it is what separates this from a bootcamp
  // portfolio — so one tile keeps it, phrased as work done for those users rather than ownership of
  // them. The other three are output: endpoints, pages, tests.
  //
  // Labels are deliberately short and parallel (all past-tense verbs, 12-18 characters). The strip
  // is a four-across row at lg, so a label long enough to wrap leaves one tile two lines tall beside
  // three that are not.
  heroMetrics: [
    {
      value: "917K",
      label: "users served",
      href: "/work/rola-access-platform",
    },
    {
      value: "200+",
      label: "endpoints built",
      href: "/work/rola-access-platform",
    },
    {
      value: "47",
      // "shipped solo" would be the stronger claim, but at 18 characters it wrapped to two lines
      // in a 176px tile while the other three stayed on one. The card directly above already opens
      // "Sole developer of a 47-page competition admin console", so the word is not lost — it is
      // said once, in a sentence, instead of twice with a ragged strip as the price.
      label: "pages shipped",
      href: "/work/rola-access-platform",
    },
    { value: "523", label: "tests written", href: "/work/provenly" },
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
  heroTagline: "Systems over shortcuts.",
  heroTaglineTranslation: "Deliberate architecture. Reliable by default.",
  about: {
    // Trimmed 591 -> ~190 chars for the minimalist pass. The two things a recruiter must still take
    // away are kept deliberately: WHAT I build (whole features, front to back) and PROOF OF SCALE
    // (900k+). Everything cut was elaboration on those two points, not additional evidence.
    bio: "I build whole features, not halves: the schema and the API, the screens on top of them, and the test coverage over both. TypeScript, React/Next.js and NestJS are my defaults. I've shipped production systems serving 900k+ users.",
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
