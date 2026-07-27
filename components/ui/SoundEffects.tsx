"use client";

import { useEffect, useRef } from "react";

import { useSound } from "@/hooks/useSound";

// Renders nothing. Installs ONE delegated pointer/click listener for the whole page.
//
// The alternative was adding onMouseEnter/onClick to every button in every component — dozens of
// call sites, each one a place to forget. Delegation covers every interactive element that exists
// now and every one added later, and gives a single place to tune the behaviour.
//
// Only fires when the visitor has opted in, so for everyone else this is one no-op listener.

const INTERACTIVE = 'button, a[href], [role="button"], summary';

export function SoundEffects() {
  const { play, enabled } = useSound();
  // Which element the cursor is currently "on". Without this, pointerover fires again every time
  // the cursor crosses a CHILD of the same button (its icon, its label) — one hover, several ticks.
  const hoveredRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled) {
      hoveredRef.current = null;
      return;
    }

    function interactiveAncestor(target: EventTarget | null): Element | null {
      if (!(target instanceof Element)) {
        return null;
      }

      const el = target.closest(INTERACTIVE);

      // A disabled control does nothing when clicked, so it should not sound like it did.
      if (
        !el ||
        el.hasAttribute("disabled") ||
        el.getAttribute("aria-disabled") === "true"
      ) {
        return null;
      }

      return el;
    }

    function handlePointerOver(event: PointerEvent) {
      // Touch has its own haptics and no hover state; a tick on tap would double up with the click.
      if (event.pointerType === "touch") {
        return;
      }

      const el = interactiveAncestor(event.target);

      if (!el || el === hoveredRef.current) {
        return;
      }

      hoveredRef.current = el;
      play("hover");
    }

    function handlePointerOut(event: PointerEvent) {
      if (interactiveAncestor(event.target) === hoveredRef.current) {
        hoveredRef.current = null;
      }
    }

    function handleClick(event: MouseEvent) {
      const el = interactiveAncestor(event.target);

      if (!el) {
        return;
      }

      // These play their own, more specific sound at the call site. Without this they would fire
      // twice — the generic click plus their own.
      if (el.hasAttribute("data-sound-self")) {
        return;
      }

      play("click");
    }

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("click", handleClick);
    };
  }, [enabled, play]);

  return null;
}
