// Page actions: how Nuggets moves the page to the proof of what it just said.
//
// The model ends a reply with up to MAX_ACTIONS directives, one per line:
//   <<show project:rola-access-platform>>
//   <<show section:contact>>
// The client strips them from the visible text while the reply streams, then runs the valid ones.
//
// Why a text directive and not Groq tool calls: the answer is streamed token by token, and the
// reasoning model in use spends part of its 400-token budget thinking. A trailing line costs a few
// tokens and keeps the stream a plain text stream; tool calls would mean buffering the whole reply
// or a second request. The safety does not come from the format anyway: it comes from the
// allow-list below. The model can only name ids, and an id that is not on the page is dropped.

import { siteConfig } from "@/config/site";
import { experienceRows } from "@/lib/data/experience-rows";
import { projects } from "@/lib/data/projects";
import type { PageAction, Tour, TourStep } from "@/types";

export const MAX_ACTIONS = 2;

/** Window event the chat fires with a PageAction[]; components/layout/AgentRouter.tsx runs them. */
export const AGENT_EVENT = "nuggets:agent";
/** Fired by the router on the home page; the project deck listens and turns to the project. */
export const SHOW_PROJECT_EVENT = "nuggets:show-project";
/** Fired by the router on the home page; Experience opens that row and brings it into view. */
export const SHOW_EXPERIENCE_EVENT = "nuggets:show-experience";
/** Fired by the chat with a Tour when an answer starts one; the chat widget runs the tour bar. */
export const TOUR_EVENT = "nuggets:tour";
/** Fired by the tour bar with one TourStep; AgentRouter shows it on the home page. */
export const TOUR_STEP_EVENT = "nuggets:tour-step";

export const ACTION_SECTIONS = siteConfig.railNav.map((item) => ({
  id: item.id,
  label: item.label,
}));

// Exactly the projects the deck shows, so every project action has a card to turn to.
export const ACTION_PROJECTS = projects
  .filter((p) => p.featured && !p.hiddenOnPage)
  .map((p) => ({ id: p.id, label: p.title, hasCaseStudy: Boolean(p.problem) }));

export const ACTION_EXPERIENCE = experienceRows.map((r) => ({
  id: r.id,
  label: `${r.title}, ${r.org}`,
}));

/** Tours have 2 to this many stops. More than this and a visitor stops reading. */
export const MAX_TOUR_STEPS = 7;

export const TOUR_WORK: Tour = {
  title: "John's work",
  steps: ACTION_PROJECTS.map((p) => ({ kind: "project", id: p.id })),
};

export const TOUR_EXPERIENCE: Tour = {
  title: "John's experience",
  steps: ACTION_EXPERIENCE.map((e) => ({ kind: "experience", id: e.id })),
};

const DIRECTIVE = /<<\s*show\s+(section|project|experience)\s*:\s*([a-z0-9-]+)\s*>>/gi;
const TOUR = /<<\s*tour\s+(work|experience|projects\s*:\s*([a-z0-9,\s-]+))\s*>>/i;
// A drafted message to John. Multi-line, so it is a block, not a one-line directive.
const EMAIL_BLOCK = /<<\s*email\s*>>([\s\S]*?)<<\s*\/\s*email\s*>>/i;
const EMAIL_OPEN = /<<\s*email\s*>>/i;
// Anything shaped like a directive, valid or not. Stripped from display either way: a malformed or
// unknown directive must not leak into the reply as visible text.
const ANY_DIRECTIVE = /<<[^<>\n]{0,120}>>/g;

/**
 * The part of a streaming reply that is safe to show right now: directives and the email draft
 * removed, and anything still arriving held back, so the visitor never sees "<<show proj" or half a
 * draft flash by. (The draft is shown separately, as an editable card.)
 *
 * Prefix-stable by design: called on the whole reply so far after every chunk, it only ever grows
 * by appending, which is what lets the chat type out `visible.slice(alreadyShown)`.
 */
export function visibleText(raw: string): string {
  let text = raw.replace(new RegExp(EMAIL_BLOCK.source, "gi"), "");
  const openEmail = text.search(EMAIL_OPEN);
  if (openEmail !== -1) text = text.slice(0, openEmail);
  text = text.replace(ANY_DIRECTIVE, "");
  const open = text.lastIndexOf("<<");
  if (open !== -1 && !text.includes(">>", open)) {
    text = text.slice(0, open);
  } else if (text.endsWith("<")) {
    text = text.slice(0, -1);
  }
  return text.trimEnd();
}

function parseTour(raw: string): Tour | undefined {
  const match = raw.match(TOUR);
  if (!match) return undefined;
  const which = match[1].toLowerCase();
  if (which === "work") return TOUR_WORK;
  if (which === "experience") return TOUR_EXPERIENCE;
  const ids = (match[2] ?? "")
    .split(",")
    .map((id) => id.trim().toLowerCase())
    .filter((id, i, all) => id && all.indexOf(id) === i)
    .filter((id) => ACTION_PROJECTS.some((p) => p.id === id))
    .slice(0, MAX_TOUR_STEPS);
  // One valid project is not a tour; that is a plain "show", which the page handles below.
  if (ids.length < 2) return undefined;
  return {
    title: "Selected projects",
    steps: ids.map((id): TourStep => ({ kind: "project", id })),
  };
}

/** The finished reply: what to show, the validated actions, and any tour or email draft. */
export function parseAgentReply(raw: string): {
  text: string;
  actions: PageAction[];
  tour?: Tour;
  draft?: string;
} {
  const tour = parseTour(raw);
  const draft = raw.match(EMAIL_BLOCK)?.[1].trim() || undefined;
  const actions: PageAction[] = [];

  // A tour drives the page itself, one stop at a time, so it replaces any one-off actions.
  if (!tour) {
    // Array.from rather than for...of over matchAll: the tsconfig target does not iterate RegExp
    // iterators without downlevelIteration.
    for (const match of Array.from(raw.matchAll(DIRECTIVE))) {
      if (actions.length >= MAX_ACTIONS) break;
      const kind = match[1].toLowerCase() as PageAction["kind"];
      const id = match[2].toLowerCase();
      const allowed =
        kind === "section" ? ACTION_SECTIONS : kind === "project" ? ACTION_PROJECTS : ACTION_EXPERIENCE;
      if (!allowed.some((target) => target.id === id)) continue;
      if (actions.some((a) => a.kind === kind && a.id === id)) continue;
      actions.push({ kind, id });
    }
  }

  return { text: visibleText(raw).trim(), actions, tour, draft };
}

/** What a tour step shows in the tour bar: a name, a sub-line, and one line of substance. */
export function tourStepInfo(step: TourStep): { title: string; sub: string; line: string } {
  if (step.kind === "project") {
    const p = projects.find((x) => x.id === step.id);
    const headline = p?.impact?.[0];
    return {
      title: p?.title ?? step.id,
      sub: headline ? `${headline.metric} ${headline.label}` : (p?.label ?? "Project"),
      line: p?.summary ?? "",
    };
  }
  const row = experienceRows.find((r) => r.id === step.id);
  return {
    title: row ? `${row.title}` : step.id,
    sub: row ? `${row.org} · ${row.meta}` : "",
    line: row?.points[0] ?? "",
  };
}

/**
 * What the visitor's latest message asks for, when it is one of the guided features. Used twice:
 * the route adds a one-line task for this reply to the end of the prompt (the model follows the
 * end of a prompt most closely), and the client falls back to the right tour if the model skips it.
 */
export type Intent = "tour-work" | "tour-experience" | "compare" | "draft";

export function detectIntent(message: string): Intent | null {
  const m = message.toLowerCase();
  if (
    /\b(send|write|draft|compose)\b.*\b(email|e-mail|message|note|john|him)\b/.test(m) ||
    /\b(email|message)\s+(to\s+)?(john|him)\b/.test(m)
  ) {
    return "draft";
  }
  if (/\bcompare\b|\bversus\b|\bvs\.?\s|difference between/.test(m)) return "compare";
  if (/\b(walk|take|guide|show)\s+me\s+through\b|\btour\b|\bone by one\b/.test(m)) {
    return /experience|career|jobs?\b|roles?\b|history|timeline|worked/.test(m)
      ? "tour-experience"
      : "tour-work";
  }
  return null;
}

/** The one-line task the prompt ends with for a guided request. */
export const INTENT_TASK: Record<Intent, string> = {
  "tour-work":
    "THIS REPLY: the visitor wants a walkthrough. Write ONE short sentence, then <<tour work>> on its own line. Nothing else.",
  "tour-experience":
    "THIS REPLY: the visitor wants a walkthrough. Write ONE short sentence, then <<tour experience>> on its own line. Nothing else.",
  compare:
    "THIS REPLY: the visitor wants to compare projects. In 2 to 4 sentences say how they differ, then <<tour projects:ID,ID>> with those project IDs.",
  draft:
    "THIS REPLY: the visitor wants to message John. Write one sentence telling them to add their name and email and press Send, then the draft between <<email>> and <</email>>. End it with Best, and no signature: their name and email come from the form.",
};

function projectsNamedIn(message: string): string[] {
  const m = message.toLowerCase();
  return ACTION_PROJECTS.filter(
    (p) => m.includes(p.label.toLowerCase()) || m.includes(p.id.replace(/-/g, " ")) || m.includes(p.id)
  )
    .map((p) => p.id)
    .slice(0, MAX_TOUR_STEPS);
}

/**
 * Makes a guided request work even when the model ignores the format: a walkthrough request gets
 * its tour, and a compare names its projects from the visitor's own words if the model did not.
 */
export function applyIntent(
  reply: ReturnType<typeof parseAgentReply>,
  intent: Intent | null,
  message: string
): ReturnType<typeof parseAgentReply> {
  if (reply.tour || !intent || intent === "draft") return reply;
  let tour: Tour | undefined;
  if (intent === "tour-work") tour = TOUR_WORK;
  if (intent === "tour-experience") tour = TOUR_EXPERIENCE;
  if (intent === "compare") {
    const shown = reply.actions.filter((a) => a.kind === "project").map((a) => a.id);
    const ids = shown.length >= 2 ? shown : projectsNamedIn(message);
    if (ids.length >= 2) {
      tour = { title: "Selected projects", steps: ids.map((id) => ({ kind: "project", id })) };
    }
  }
  return tour ? { ...reply, actions: [], tour } : reply;
}

/** Chip text for an action that ran, e.g. "Showing Rola Competition Platform". */
export function actionLabel(action: PageAction): string {
  const list =
    action.kind === "section"
      ? ACTION_SECTIONS
      : action.kind === "project"
        ? ACTION_PROJECTS
        : ACTION_EXPERIENCE;
  const label = list.find((target) => target.id === action.id)?.label ?? action.id;
  return action.kind === "section" ? `Showing ${label.toLowerCase()}` : `Showing ${label}`;
}
