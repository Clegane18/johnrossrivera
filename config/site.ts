export const siteConfig = {
  name: "John Ross Rivera",
  title: "John Ross Rivera - Full-Stack Software Engineer",
  description:
    "Personal portfolio of John Ross Rivera, a full-stack software engineer shipping production systems end to end — TypeScript, React and Next.js on the front, NestJS APIs and MySQL behind them.",
  url: "https://johnrossrivera.vercel.app",
  email: "johnrossrivera20@gmail.com",
  phone: "+63 921 670 6170",
  role: "Full-Stack Software Engineer",
  // Leads with countable ownership, not with "I ship production systems end to end" — that opener
  // is true of nearly every candidate and spent the 30-second skim on a claim with no number behind
  // it. This mirrors the CV's own summary line. 257 chars: the card is ~20rem wide on desktop, and
  // ~280 is where it starts to overflow, so keep any rewrite under that.
  heroDescription:
    "Sole developer of a 47-page competition admin console and primary developer of the NestJS backend behind it — 200+ endpoints, 61 data models, two payment rails. TypeScript front to back. Open to full-time full-stack or frontend roles, and to freelance work.",
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
  heroMetrics: [
    {
      value: "917K",
      label: "registered users",
      href: "/work/rola-access-platform",
    },
    { value: "1,000+", label: "KOL partners", href: "/work/kol-dashboard" },
    { value: "74", label: "vehicles managed", href: "/work/rr-remo-trucking" },
    { value: "5", label: "projects shipped", href: "#projects" },
  ],
  heroTagline: "Systems over shortcuts.",
  heroTaglineTranslation: "Deliberate architecture. Reliable by default.",
  about: {
    // Trimmed 591 -> ~190 chars for the minimalist pass. The two things a recruiter must still take
    // away are kept deliberately: WHAT I build (whole features, front to back) and PROOF OF SCALE
    // (900k+). Everything cut was elaboration on those two points, not additional evidence.
    bio: "I build whole features, not halves — the schema and the API, the screens on top of them, and the test coverage over both. TypeScript, React/Next.js and NestJS are my defaults. I've shipped production systems serving 900k+ users.",
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
    // 41 chars wrapped onto two lines in the navbar. Shortened to hold one line at every
    // breakpoint — the "Availability" label above it now carries the context the long phrase was
    // spending words on.
    availabilityText: "Open to full-time & freelance",
    contactCtaLabel: "Let's Talk",
    resumeCtaLabel: "Resume",
    showCounters: false,
  },
  contact: {
    intro:
      "I'm actively looking for full-stack or frontend roles with global teams — remote, hybrid, or relocation — and I can start after a 30-day notice period. I also take on freelance and contract work: email me and I'll scope it with you. I respond within 24 hours.",
  },
  footer: {
    copyrightText: "All rights reserved.",
  },
  links: {
    resume: "/john-ross-rivera-resume.pdf",
  },
  chat: {
    name: "Nuggets 🐾",
    avatarPath: "/images/nuggets.webp",
    // "How I built this" — surfaced in the widget so the chat reads as an engineering demo, not a toy.
    techNote: {
      heading: "How Nuggets works",
      points: [
        "Model: Llama 3.3 70B via Groq, streamed token-by-token over a ReadableStream.",
        "Grounded on real portfolio data — the system prompt is derived from the same project/experience files the site renders, so answers can't contradict the page.",
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
