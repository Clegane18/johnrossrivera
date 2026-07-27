export interface ProjectRepo {
  label: string;
  url: string;
}

export interface ProjectClient {
  name: string;
  note?: string;
}

export interface ProjectImpact {
  metric: string;
  label: string;
}

export interface Project extends ProjectCardCopy {
  id: string;
  title: string;
  description: string;
  tech: string[];
  // Case-study fields (optional — only featured projects fill these; description is the fallback).
  problem?: string;
  role?: string;
  decisions?: string[];
  impact?: ProjectImpact[];
  clients?: ProjectClient[];
  architectureSvg?: string;
  liveUrl?: string;
  // When the live URL lands on an auth/login wall (e.g. a production admin), the UI labels the link
  // "View Production (login required)" instead of a dead-ending "Live Demo".
  liveAuthGated?: boolean;
  repoUrl?: string;
  repoUrls?: ProjectRepo[];
  imageUrl?: string;
  images?: string[];
  mobileImages?: string[];
  featured: boolean;
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

/**
 * Which timeline an entry belongs to.
 *
 * Four roles previously ran as "Present" simultaneously, three of which were freelance or personal.
 * A single sequential timeline made that read as padding, and it buried the one thing a recruiter
 * is actually scanning for: the real employment history. Splitting the groups states plainly what
 * each entry is, which is both more honest and easier to read.
 */
export type ExperienceGroup = "work" | "personal" | "academic";

export type EmploymentType =
  | "Full-time"
  | "Freelance"
  | "Personal project"
  | "Capstone project";

export interface Experience {
  id: string;
  company: string;
  role: string;
  group: ExperienceGroup;
  employmentType: EmploymentType;
  /** All of John's work has been remote; kept per-entry so a future on-site role can say so. */
  workMode?: "Remote" | "Hybrid" | "On-site";
  startDate: string;
  endDate: string | "Present";
  description: string[];
  // Short page-facing bullets. Same reasoning as Project.summary: `description` runs 250-350 chars
  // per bullet and is read by lib/ai/system-prompt.ts, so shortening it there would shrink what the
  // chat knows. Experience has no /work/[slug] page to hold the long form, so the page reads these
  // and the data keeps everything.
  highlights?: string[];
  tech: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Homepage card copy for a project.
//
// `summary` exists so the card can be scanned in a second while `description` stays untouched —
// the case study at /work/[slug] renders it, and lib/ai/system-prompt.ts derives the chat's
// knowledge from it. Shortening `description` would silently shrink what Nuggets knows, so the
// homepage gets its own shorter field instead.
//
// There is deliberately NO separate "headline metric" field: the card already renders `impact[]`
// prominently, so a second metric field would state the same number twice and let the two drift.
export interface ProjectCardCopy {
  summary?: string;
}

// What the chat shows when it cannot answer. Not an "error" shape on purpose: on a portfolio the
// visitor is often a recruiter, so an outage has to keep offering a way through to John rather than
// dead-ending in a red box. See lib/utils/chat-fallback.ts.
export interface ChatFallback {
  message: string;
  canRetry: boolean;
  showContact: boolean;
}
