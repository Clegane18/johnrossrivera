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
    "I design backend systems built to handle real load — secure APIs, role-based access control, and data pipelines that hold under production pressure. Open to senior roles and freelance projects.",
  heroPrimaryCta: {
    label: "View My Work",
    href: "#projects",
  },
  heroSecondaryCta: {
    label: "Download Resume",
    href: "/john-ross-rivera-resume.pdf",
  },
  heroTagline: "Systems over shortcuts.",
  heroTaglineTranslation: "Deliberate architecture. Reliable by default.",
  about: {
    bio: "Most of my work happens where users never look — auth systems, service layers, access control, and data pipelines. I build the backend infrastructure that keeps products running when load spikes and edge cases hit.\n\nI've shipped production systems serving 900k+ users, built role-based access platforms for live competition workflows, and designed analytics and earnings dashboards for operations teams. When the scope demands it, I own the full stack.\n\nCurrently refining Smart-lift AI — a personal training system I built around one principle: you can't improve what you can't measure.",
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
    availabilityText: "Open to Senior Roles & Freelance Projects",
    contactCtaLabel: "Let's Talk",
    resumeCtaLabel: "Resume",
    showCounters: false,
  },
  contact: {
    intro:
      "I'm not actively job-hunting, but I'm open to the right senior backend or full-stack role — and I take on freelance and contract projects. If you're a potential client, email me and I'll scope the work with you. I respond within 24 hours.",
  },
  footer: {
    headline:
      "Architecting backend systems that scale. Open to senior roles and freelance projects.",
    copyrightText: "All rights reserved.",
  },
  projectFilters: ["All", "Featured", "Other"],
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
