"use client";

import {
  ACTION_PROJECTS,
  AGENT_EVENT,
  SHOW_EXPERIENCE_EVENT,
  SHOW_PROJECT_EVENT,
  TOUR_STEP_EVENT,
} from "@/lib/ai/page-actions";
import type { PageAction } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const FLASH_MS = 2600;
const STEP_MS = 1400;

/** Outlines an element briefly so the visitor sees what Nuggets pointed at. */
export function flash(el: Element) {
  el.classList.remove("agent-flash");
  // Force a reflow so re-adding the class restarts the animation on a repeat action.
  void (el as HTMLElement).offsetWidth;
  el.classList.add("agent-flash");
  window.setTimeout(() => el.classList.remove("agent-flash"), FLASH_MS);
}

/**
 * Carries out the page actions Nuggets asks for (see lib/ai/page-actions.ts). Mounted once in the
 * layout so it works from every route: on the home page it moves the page itself; anywhere else it
 * navigates to where the evidence lives.
 */
export function AgentRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const runId = useRef(0);
  // A tour step asked for off the home page: held until the home page has mounted, then run.
  const pending = useRef<PageAction[] | null>(null);

  useEffect(() => {
    async function run(actions: PageAction[]) {
      const id = ++runId.current;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

      if (pathname !== "/") {
        const first = actions[0];
        const project =
          first.kind === "project"
            ? ACTION_PROJECTS.find((p) => p.id === first.id)
            : undefined;
        router.push(
          project?.hasCaseStudy
            ? `/work/${project.id}`
            : `/#${first.kind === "project" ? "work" : first.kind === "experience" ? "experience" : first.id}`
        );
        return;
      }

      for (const action of actions) {
        if (id !== runId.current) return;
        if (action.kind === "section") {
          const section = document.getElementById(action.id);
          if (!section) continue;
          section.scrollIntoView({ behavior, block: "start" });
          flash(section.querySelector("h2") ?? section);
        } else if (action.kind === "experience") {
          document.getElementById("experience")?.scrollIntoView({ behavior, block: "start" });
          window.dispatchEvent(
            new CustomEvent(SHOW_EXPERIENCE_EVENT, { detail: action.id })
          );
        } else {
          // The deck itself, not the section heading: that puts the project's name and links in view
          // above the tour bar and the chat panel instead of under them. Grid view has no deck.
          (document.querySelector("#work [data-deck-stage]") ?? document.getElementById("work"))
            ?.scrollIntoView({ behavior, block: "start" });
          window.dispatchEvent(
            new CustomEvent(SHOW_PROJECT_EVENT, { detail: action.id })
          );
        }
        await new Promise((resolve) => window.setTimeout(resolve, STEP_MS));
      }
    }

    function onAgent(event: Event) {
      const actions = (event as CustomEvent<PageAction[]>).detail;
      if (Array.isArray(actions) && actions.length > 0) void run(actions);
    }

    // A tour always plays on the home page, where the deck and the timeline are, even when the
    // visitor started it from a case study.
    function onTourStep(event: Event) {
      const action = (event as CustomEvent<PageAction>).detail;
      if (!action) return;
      if (pathname === "/") {
        void run([action]);
      } else {
        pending.current = [action];
        router.push("/");
      }
    }

    if (pathname === "/" && pending.current) {
      const actions = pending.current;
      pending.current = null;
      // Let the home sections mount and register their listeners first.
      window.setTimeout(() => void run(actions), 300);
    }

    window.addEventListener(AGENT_EVENT, onAgent);
    window.addEventListener(TOUR_STEP_EVENT, onTourStep);
    return () => {
      window.removeEventListener(AGENT_EVENT, onAgent);
      window.removeEventListener(TOUR_STEP_EVENT, onTourStep);
    };
  }, [pathname, router]);

  return null;
}
