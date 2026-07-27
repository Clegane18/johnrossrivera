"use client";

import { useEffect, useState } from "react";

// ⌘K / Ctrl+K to open the Nuggets chat — the "ask anything" entry point.
//
// This deliberately does NOT build a command list. The chat already answers anything the site can
// answer, so a palette listing "jump to Projects" alongside it would be a second navigation system
// competing with the nav that already exists. The shortcut's whole job is to open the thing.

const MAC_LABEL = "⌘K";
const OTHER_LABEL = "Ctrl K";

/**
 * A key event that lands while the user is typing must be left alone — ⌘K is a browser-level
 * reflex, but stealing keystrokes from the chat textarea or the contact form is not.
 * Exported for tests: this predicate is the whole correctness story of the shortcut.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  // Duck-typed rather than `instanceof HTMLElement` for two reasons: `instanceof` is false for
  // elements from another realm (an iframe has its own HTMLElement), and it makes the function
  // untestable under this repo's `node` vitest environment, which has no DOM at all.
  const el = target as {
    tagName?: unknown;
    isContentEditable?: unknown;
  } | null;

  if (!el || typeof el.tagName !== "string") {
    return false;
  }

  const tag = el.tagName.toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable === true
  );
}

/**
 * Rendering "⌘K" to a Windows visitor tells them to press a key their keyboard does not have.
 * Exported for tests — a platform check that silently gets it backwards is invisible in review.
 */
export function getShortcutLabel(platform: string): string {
  return /mac|iphone|ipad|ipod/i.test(platform) ? MAC_LABEL : OTHER_LABEL;
}

/** Event the nav's affordance fires so it can open the chat without importing it. */
export const REQUEST_OPEN_EVENT = "nuggets:request-open";

/**
 * Label only. Split out so the nav can render "⌘K" WITHOUT registering a second keydown listener —
 * two components both calling useCommandPalette would open the chat twice per press.
 */
export function useShortcutLabel() {
  // Rendered on the server with no platform knowledge, so start with the neutral label and correct
  // it after mount. Guessing on the server would be a hydration mismatch.
  const [shortcutLabel, setShortcutLabel] = useState(OTHER_LABEL);

  useEffect(() => {
    setShortcutLabel(getShortcutLabel(window.navigator.platform));
  }, []);

  return shortcutLabel;
}

export function useCommandPalette(onTrigger: () => void) {
  const shortcutLabel = useShortcutLabel();

  // The nav's clickable hint routes through the same handler as the keypress, so both entry points
  // can never drift apart.
  useEffect(() => {
    window.addEventListener(REQUEST_OPEN_EVENT, onTrigger);

    return () => {
      window.removeEventListener(REQUEST_OPEN_EVENT, onTrigger);
    };
  }, [onTrigger]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "k" && event.key !== "K") {
        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      // Firefox focuses the search bar on Ctrl+K, Chrome focuses the address bar. Without this the
      // shortcut opens the chat AND yanks focus out of the page.
      event.preventDefault();
      onTrigger();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTrigger]);

  return { shortcutLabel };
}
