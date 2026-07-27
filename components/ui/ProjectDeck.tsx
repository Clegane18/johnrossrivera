"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { Project } from "@/types";

// A card index: one project face-up, the next few receding beneath it.
//
// The first cut of this failed for a concrete reason — the card was as wide as the section and its
// content was taller than the container, so the "stack" was completely hidden behind the front card
// and the whole thing read as one enormous screenshot. Two fixes: the card is CONSTRAINED (a card
// containing a screenshot, not a screenshot pretending to be a card) and it has a FIXED height, so
// the cards behind reliably peek out below it.
//
// The recession is vertical + inset rather than rotated. Bryl's fanned, tilted deck is the most
// recognisable thing about his site; this reads as a considered stack without borrowing his gesture.

type Props = {
  projects: Project[];
};

/** How many cards sit visibly behind the front one. Past this they fade out entirely. */
const VISIBLE_BEHIND = 3;
/** Vertical peek per card behind, in px. 16 was too subtle to register as a stack at all. */
const PEEK = 22;
/** Width lost per card behind. Combined with the peek this reads as depth rather than a shadow. */
const SCALE_STEP = 0.05;
/** Cards behind dim slightly — depth cue the eye reads before it reads the offset. */
const DIM_STEP = 0.18;

export function ProjectDeck({ projects }: Props) {
  const [active, setActive] = useState(0);
  const count = projects.length;

  const go = useCallback(
    (next: number) => {
      setActive(((next % count) + count) % count);
    },
    [count]
  );

  if (count === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        role="listbox"
        aria-label="Featured projects"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            go(active + 1);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            go(active - 1);
          }
        }}
        className="relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        // The FRONT card stays in normal flow, so the container height follows its real content.
        // A fixed height was the cause of the dead gap: the card was 480px for ~150px of content,
        // and `mt-auto` gathered the leftover ~140px into a single void above the buttons. The
        // padding below just reserves room for the peeking cards, which are absolute.
        style={{ paddingBottom: VISIBLE_BEHIND * PEEK }}
      >
        {projects.map((project, index) => {
          const offset = (index - active + count) % count;
          const isActive = offset === 0;
          const faded = offset > VISIBLE_BEHIND;

          return (
            <div
              key={project.id}
              role="option"
              aria-selected={isActive}
              aria-hidden={!isActive}
              onClick={() => !isActive && go(index)}
              style={{
                transform: `translateY(${offset * PEEK}px) scale(${1 - offset * SCALE_STEP})`,
                zIndex: count - offset,
                opacity: faded ? 0 : 1 - offset * DIM_STEP,
              }}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
                "transition-[transform,opacity,box-shadow] duration-500 ease-out motion-reduce:transition-none",
                // Only the focused card is in flow; the rest are absolute so they cannot stretch
                // the container to their own height.
                isActive
                  ? "relative shadow-2xl"
                  : "absolute inset-x-0 top-0 cursor-pointer shadow-lg",
                faded && "pointer-events-none"
              )}
            >
              {/* Inset preview. Padding around the screenshot is what makes this read as a card
                  holding an image rather than a bare screenshot with a border. */}
              <div className="p-3 pb-0">
                {/* aspect-video, NOT a fixed height. At 672px wide a fixed h-44 made the box 3.68:1
                    while the screenshots are 16:9 — object-cover was discarding 52% of every image,
                    which is the "cut out" look. Matching the source ratio crops nothing. */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                  {project.images?.[0] ? (
                    <Image
                      src={project.images[0]}
                      alt={`${project.title} interface`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 672px) 100vw, 672px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-hero text-5xl font-black uppercase text-border">
                        {project.title.slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {project.title}
                  </h3>
                  {project.impact?.[0] && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {project.impact[0].metric} {project.impact[0].label}
                    </span>
                  )}
                </div>

                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {project.summary ?? project.description}
                </p>

                <div className="mt-1 flex flex-wrap gap-2">
                  {/* Inert cards must not be tab stops. */}
                  <Link
                    href={`/work/${project.id}`}
                    tabIndex={isActive ? undefined : -1}
                    className="inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Case study
                  </Link>
                  {project.liveUrl && (
                    <Link
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={isActive ? undefined : -1}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Live
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explicit controls. Arrow keys only help someone who already knows they exist, and the
          click-a-card-behind affordance is invisible on the last card in the stack. */}
      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>

        <div className="flex items-center gap-2">
          {projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              onClick={() => go(index)}
              aria-label={`Show ${project.title}`}
              aria-current={index === active}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                index === active
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-border hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous project"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next project"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
