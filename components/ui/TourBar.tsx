"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { tourStepInfo } from "@/lib/ai/page-actions";
import type { Tour } from "@/types";

/**
 * The guided tour. Nuggets only proposes the route; the visitor moves along it. Every step waits
 * for Next, so nothing flips past before it has been read, and Back is always there. Keys: ← and →
 * step, Esc leaves. `index === steps.length` is the end card.
 */
export function TourBar({
  tour,
  index,
  onStep,
  onExit,
  onAsk,
  onContact,
}: {
  tour: Tour;
  index: number;
  onStep: (index: number) => void;
  onExit: () => void;
  onAsk: (question: string) => void;
  onContact: () => void;
}) {
  const total = tour.steps.length;
  const done = index >= total;
  const step = done ? undefined : tour.steps[index];
  const info = step ? tourStepInfo(step) : undefined;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && !done) {
        e.preventDefault();
        onStep(index + 1);
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        onStep(Math.min(index, total) - 1);
      } else if (e.key === "Escape") {
        onExit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, index, onExit, onStep, total]);

  return (
    <motion.div
      role="region"
      aria-label={`Guided tour: ${tour.title}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "fixed z-[70] rounded-xl border border-border bg-card p-4 text-foreground",
        "shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]",
        // A phone gets the full width, above the home indicator. Wider screens keep Nuggets' corner.
        "inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
        "sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[25rem]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
          Tour · {tour.title}
          {!done && (
            <span className="ml-2 text-foreground">
              {index + 1} / {total}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit tour"
          className="-mr-1.5 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress: one segment per stop, so the visitor always knows how much is left. */}
      <div className="mt-2.5 flex gap-1" aria-hidden="true">
        {tour.steps.map((s, i) => (
          <button
            key={`${s.kind}:${s.id}`}
            type="button"
            tabIndex={-1}
            onClick={() => onStep(i)}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= index ? "bg-foreground" : "bg-border hover:bg-muted-foreground"
            )}
          />
        ))}
      </div>

      <div aria-live="polite" className="mt-3 min-h-[4.5rem]">
        {info ? (
          <>
            <p className="text-[15px] font-semibold leading-snug">{info.title}</p>
            {info.sub && (
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{info.sub}</p>
            )}
            {info.line && (
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                {info.line}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-[15px] font-semibold leading-snug">That&rsquo;s the tour.</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Want to talk to John about any of it, or ask Nuggets a follow-up?
            </p>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {info ? (
          <button
            type="button"
            onClick={() => onAsk(`Tell me more about ${info.title}`)}
            className="rounded-md px-2 py-1.5 text-[12px] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Ask about this
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAsk("")}
            className="rounded-md px-2 py-1.5 text-[12px] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Ask a question
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onStep(Math.min(index, total) - 1)}
            disabled={index === 0}
            aria-label="Previous stop"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-muted-foreground disabled:opacity-30 disabled:hover:border-border"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          {done ? (
            <button
              type="button"
              onClick={onContact}
              className="h-8 rounded-md bg-foreground px-3 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
            >
              Contact John
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStep(index + 1)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
            >
              {index === total - 1 ? "Finish" : "Next"}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
