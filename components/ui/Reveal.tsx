"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Vertical offset (px) it slides in from. Matches every call site's previous `y` value. */
  y?: number;
  /** Horizontal offset (px) it slides in from. */
  x?: number;
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
}

const REVEAL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * CSS-driven replacement for framer-motion's `whileInView` fade/slide-up reveal — the ONLY thing
 * About/Skills/Experience/Contact/Projects/LiveDemo used `motion` for. Framer-motion no longer
 * ships in these sections; the animation itself is the `[data-reveal]` rule in globals.css, this
 * component just supplies the per-instance distance/timing those sections were already tuned to.
 */
export function Reveal({
  children,
  className,
  y = 20,
  x = 0,
  duration = 0.5,
  delay = 0,
}: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  const style = {
    "--reveal-x": `${x}px`,
    "--reveal-y": `${y}px`,
    "--reveal-duration": `${duration}s`,
    "--reveal-delay": `${delay}s`,
    "--reveal-ease": REVEAL_EASE,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-reveal={isVisible ? "visible" : "hidden"}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}
