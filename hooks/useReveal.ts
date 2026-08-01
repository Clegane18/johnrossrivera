"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Minimal replacement for framer-motion's `whileInView`. Fires once, the first time the element
 * crosses into the viewport — mirroring every call site's previous `viewport={{ once: true }}` —
 * then disconnects. Pairs with the `[data-reveal]` / `[data-reveal-group]` CSS in globals.css,
 * which owns the actual opacity/transform transition; this hook only tracks visibility (no JSX,
 * no styling), per the hooks layer rule in CLAUDE.md.
 *
 * `threshold: 0` matches framer-motion's default `viewport.amount: "some"` — the element counts as
 * in view as soon as any part of it is visible.
 */
export function useReveal<T extends HTMLElement>(threshold = 0) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
