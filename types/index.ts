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

export interface Project {
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

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | "Present";
  description: string[];
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

// What the chat shows when it cannot answer. Not an "error" shape on purpose: on a portfolio the
// visitor is often a recruiter, so an outage has to keep offering a way through to John rather than
// dead-ending in a red box. See lib/utils/chat-fallback.ts.
export interface ChatFallback {
  message: string;
  canRetry: boolean;
  showContact: boolean;
}
