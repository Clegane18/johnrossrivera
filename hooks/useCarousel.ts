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
}

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

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => {
    if (!reducedMotion && total > 1) setIsPaused(false);
  }, [reducedMotion, total]);

  useEffect(() => {
    if (total <= 1) return;

    const tick = setInterval(() => {
      if (!isPausedRef.current) {
        setIndex((i) => (i + 1) % total);
      }
    }, autoplayMs);

    return () => clearInterval(tick);
  }, [total, autoplayMs]);

  return { index, isPaused, next, prev, goTo, pause, resume };
}
