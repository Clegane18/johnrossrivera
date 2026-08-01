"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCarouselReturn {
  index: number;
  isPaused: boolean;
  next: () => void;
  prev: () => void;
  goTo: (n: number) => void;
  pause: () => void;
  resume: () => void;
  /** Attach to the carousel's root element so autoplay can pause once it scrolls off-screen. */
  containerRef: React.RefObject<HTMLDivElement>;
}

// Autoplay can be paused for more than one reason at once (hovered AND backgrounded, say), so a
// plain boolean isn't enough — one source calling resume() must not cancel another source's pause.
// Each reason owns its own flag and the effective isPaused is their OR.
type PauseReason = "hover" | "hidden" | "offscreen";

export function useCarousel(
  total: number,
  autoplayMs = 4000
): UseCarouselReturn {
  const [index, setIndex] = useState(0);

  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const [isPaused, setIsPaused] = useState(reducedMotion || total <= 1);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const pauseReasons = useRef<Record<PauseReason, boolean>>({
    hover: false,
    hidden: false,
    offscreen: false,
  });

  const recompute = useCallback(() => {
    if (reducedMotion || total <= 1) {
      setIsPaused(true);
      return;
    }
    const reasons = pauseReasons.current;
    setIsPaused(reasons.hover || reasons.hidden || reasons.offscreen);
  }, [reducedMotion, total]);

  const setReason = useCallback(
    (reason: PauseReason, value: boolean) => {
      pauseReasons.current[reason] = value;
      recompute();
    },
    [recompute]
  );

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goTo = useCallback(
    (n: number) => {
      setIndex(Math.max(0, Math.min(n, total - 1)));
    },
    [total]
  );

  // Public API unchanged — ProjectCarousel's onMouseEnter/onMouseLeave still call these directly,
  // now scoped to the "hover" reason so they can no longer stomp on a hidden-tab or off-screen pause.
  const pause = useCallback(() => setReason("hover", true), [setReason]);
  const resume = useCallback(() => setReason("hover", false), [setReason]);

  // An idle background tab shouldn't keep advancing the deck and downloading slides nobody sees.
  useEffect(() => {
    function handleVisibility() {
      setReason("hidden", document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [setReason]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Same idea for scroll position: a carousel scrolled out of the viewport shouldn't keep fetching
  // the next slide either.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setReason("offscreen", !entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setReason]);

  useEffect(() => {
    if (total <= 1) return;

    const tick = setInterval(() => {
      if (!isPausedRef.current) {
        setIndex((i) => (i + 1) % total);
      }
    }, autoplayMs);

    return () => clearInterval(tick);
  }, [total, autoplayMs]);

  return {
    index,
    isPaused,
    next,
    prev,
    goTo,
    pause,
    resume,
    containerRef,
  };
}
