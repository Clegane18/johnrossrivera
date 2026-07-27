export const siteConfig = {
  name: "John Ross Rivera",
  title: "John Ross Rivera - Backend Developer",
  description:
    "Personal portfolio of John Ross Rivera, a backend-focused developer building secure, scalable APIs and full-stack web applications.",
  url: "https://johnrossrivera.vercel.app",
  email: "johnrossrivera20@gmail.com",
  phone: "+63 921 670 6170",
  role: "Backend Developer",
  heroDescription:
    "I design backend systems built to handle real load — secure APIs, role-based access control, and data pipelines that hold under production pressure. Open to roles where I own the architecture, and to freelance projects.",
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
  // "users served" is deliberate. The 917k registered users belong to the CLIENT's platform, not to
  // John; stating the bare number would read as claiming their userbase, which costs more credibility
  // than the extra punch is worth. Each tile links to the case study that substantiates it — a number
  // a recruiter can check is worth more than a bigger one they cannot.
  heroMetrics: [
    {
      value: "917K",
      label: "users served",
      href: "/work/rola-access-platform",
    },
    { value: "1,000+", label: "KOL partners", href: "/work/kol-dashboard" },
    { value: "74", label: "vehicles managed", href: "/work/rr-remo-trucking" },
    { value: "6", label: "projects shipped", href: "#projects" },
  ],
  heroTagline: "Systems over shortcuts.",
  heroTaglineTranslation: "Deliberate architecture. Reliable by default.",
  about: {
    // Trimmed 591 -> ~190 chars for the minimalist pass. The two things a recruiter must still take
    // away are kept deliberately: WHAT I build (backend infrastructure) and PROOF OF SCALE (900k+).
    // Everything cut was elaboration on those two points, not additional evidence.
    bio: "Most of my work happens where users never look — auth systems, service layers, access control, data pipelines. I've shipped production systems serving 900k+ users. When the scope demands it, I own the full stack.",
    location: "Philippines",
    lightImageUrl: "/images/light-profile.webp",
    darkImageUrl: "/images/dark-profile.webp",
    imageAlt: "Portrait of John Ross Rivera",
  },
  education: {
    school: "Bulacan State University",
    degree:
      "Bachelor of Science in Information Technology, Major in Web and Mobile App Development",
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
    availabilityText: "Ownership roles & freelance",
    contactCtaLabel: "Let's Talk",
    resumeCtaLabel: "Resume",
    showCounters: false,
  },
  contact: {
    intro:
      "I'm not actively job-hunting, but I'm open to the right backend or full-stack role with real ownership — and I take on freelance and contract projects. If you're a potential client, email me and I'll scope the work with you. I respond within 24 hours.",
  },
  footer: {
    headline:
      "Architecting backend systems that scale. Open to roles where I own the architecture, and to freelance projects.",
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
        "Cost & abuse control: best-effort per-IP throttling (~20 req/hour, per instance) and a 1,024-token response cap.",
      ],
    },
  },
  nav: [
    { label: "About", href: "#about", counter: null },
    { label: "Skills", href: "#skills", counter: "3" },
    { label: "Experience", href: "#experience", counter: "3" },
    { label: "Projects", href: "#projects", counter: "4" },
    { label: "Live API", href: "#live-demo", counter: null },
    { label: "Contact", href: "#contact", counter: null },
  ],
};
