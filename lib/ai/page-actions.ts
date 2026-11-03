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
import { projects } from "@/lib/data/projects";
import type { PageAction } from "@/types";

export const MAX_ACTIONS = 2;

/** Window event the chat fires with a PageAction[]; components/layout/AgentRouter.tsx runs them. */
export const AGENT_EVENT = "nuggets:agent";
/** Fired by the router on the home page; the project deck listens and turns to the project. */
export const SHOW_PROJECT_EVENT = "nuggets:show-project";

export const ACTION_SECTIONS = siteConfig.railNav.map((item) => ({
  id: item.id,
  label: item.label,
}));

// Exactly the projects the deck shows, so every project action has a card to turn to.
export const ACTION_PROJECTS = projects
  .filter((p) => p.featured && !p.hiddenOnPage)
  .map((p) => ({ id: p.id, label: p.title, hasCaseStudy: Boolean(p.problem) }));

const DIRECTIVE = /<<\s*show\s+(section|project)\s*:\s*([a-z0-9-]+)\s*>>/gi;
// Anything shaped like a directive, valid or not. Stripped from display either way: a malformed or
// unknown directive must not leak into the reply as visible text.
const ANY_DIRECTIVE = /<<[^<>\n]{0,80}>>/g;

/**
 * The part of a streaming reply that is safe to show right now: complete directives removed, and a
 * directive that is still arriving held back, so the visitor never sees "<<show proj" flash by.
 *
 * Prefix-stable by design: called on the whole reply so far after every chunk, it only ever grows
 * by appending, which is what lets the chat type out `visible.slice(alreadyShown)`.
 */
export function visibleText(raw: string): string {
  let text = raw.replace(ANY_DIRECTIVE, "");
  const open = text.lastIndexOf("<<");
  if (open !== -1 && !text.includes(">>", open)) {
    text = text.slice(0, open);
  } else if (text.endsWith("<")) {
    text = text.slice(0, -1);
  }
  return text.trimEnd();
}

/** The finished reply: what to show, and the validated actions to run. */
export function parseAgentReply(raw: string): {
  text: string;
  actions: PageAction[];
} {
  const actions: PageAction[] = [];

  // Array.from rather than for...of over matchAll: the tsconfig target does not iterate RegExp
  // iterators without downlevelIteration.
  for (const match of Array.from(raw.matchAll(DIRECTIVE))) {
    if (actions.length >= MAX_ACTIONS) break;
    const kind = match[1].toLowerCase() as PageAction["kind"];
    const id = match[2].toLowerCase();
    const allowed = kind === "section" ? ACTION_SECTIONS : ACTION_PROJECTS;
    if (!allowed.some((target) => target.id === id)) continue;
    if (actions.some((a) => a.kind === kind && a.id === id)) continue;
    actions.push({ kind, id });
  }

  return { text: visibleText(raw).trim(), actions };
}

/** Chip text for an action that ran, e.g. "Showing Rola Competition Platform". */
export function actionLabel(action: PageAction): string {
  const list = action.kind === "section" ? ACTION_SECTIONS : ACTION_PROJECTS;
  const label = list.find((target) => target.id === action.id)?.label ?? action.id;
  return action.kind === "section" ? `Showing ${label.toLowerCase()}` : `Showing ${label}`;
}
