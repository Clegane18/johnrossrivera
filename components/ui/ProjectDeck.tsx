"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { Project } from "@/types";

// A three-card diagonal carousel: the selected project centred at full size, its neighbours receding
// up-left and down-right.
//
// WHY THIS REPLACED THE VERTICAL STACK. The previous version laid every card on the same spot and
// pushed the ones behind down by 22px each. The intent was a thin sliver of card edge peeking out
// below the front card — but each card renders its FULL content, and the bottom ~22px of a card is
// exactly where the Case study / Live buttons sit. So the sliver was never an empty edge: it was two
// semi-transparent, slightly-offset copies of the button row bleeding out from underneath the real
// ones. Translucent, misaligned and repeating, which read as a holographic glitch rather than depth.
//
// The fix is structural, not cosmetic: the neighbours are now beside the active card rather than
// beneath it, and they render IMAGE AND TITLE ONLY. There is no second copy of the buttons anywhere
// on screen, so the artifact cannot come back by tuning an offset.

type Props = {
  projects: Project[];
};

/** Drag distance, in px, that commits to the next/previous card. Below this the deck springs back. */
const SWIPE_COMMIT_PX = 56;
/** Movement past this cancels the click-to-select, so a drag never also selects a card. */
const DRAG_SLOP_PX = 8;
/**
 * How far the deck follows the finger, as a fraction of the drag. Under 1 on purpose: the deck moves
 * with you but lags, which reads as weight and makes the snap-back feel intentional.
 */
const DRAG_FOLLOW = 0.32;
/**
 * Where a card waits while off-stage, in --x steps. Must be large enough that the card's near edge
 * clears the stage's clip at every breakpoint — at the natural ±2 the card still poked into view
 * and showed as a sliding shadow whenever its opacity was mid-transition.
 */
const OFFSTAGE_STEPS = 2.6;

export function ProjectDeck({ projects }: Props) {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const gesture = useRef({
    startX: 0,
    pointer: false,
    moved: false,
    captured: false,
  });
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

  /**
   * Signed distance from the active card: 0 centre, -1 previous, +1 next, anything else off-stage.
   * Taking the SHORT way around the loop is what lets a 4-project deck show a "previous" card that
   * is really index 3 — without it, the leftmost slot would sit empty on the first card.
   */
  const relativeTo = (index: number): number => {
    const forward = (index - active + count) % count;

    return forward > count / 2 ? forward - count : forward;
  };

  // NOTHING happens until the pointer has travelled past DRAG_SLOP_PX. That threshold is not a
  // nicety, it is what makes the buttons on the active card clickable at all.
  //
  // The first version called setPointerCapture on pointerdown, unconditionally. Per the Pointer
  // Events spec the capture target override retargets the compatibility mouse events too —
  // mousedown, mouseup and click all get delivered to the capturing element rather than to what is
  // actually under the cursor. So every press on "Case study" or "Live" was claimed by this stage
  // div and the anchor never saw a click. Capturing now waits until the gesture is definitely a
  // drag, which leaves an ordinary click entirely alone.
  //
  // Deferring setDrag matters for the same reason at one remove: it used to run on every
  // pointermove, so the pixel or two of jitter in a real mouse click re-rendered the deck and slid
  // the card under the cursor. That alone can break a click, and it made the bug look
  // input-dependent — a touch tap moves ~0px, so phones were unaffected.
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    gesture.current = {
      startX: event.clientX,
      pointer: true,
      moved: false,
      captured: false,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!gesture.current.pointer) return;

    const dx = event.clientX - gesture.current.startX;

    if (!gesture.current.moved) {
      if (Math.abs(dx) <= DRAG_SLOP_PX) return;

      gesture.current.moved = true;
      // Capture only once this is definitely a drag. Capturing on pointerdown would claim every
      // press, including the ones that are just clicks on a link.
      event.currentTarget.setPointerCapture(event.pointerId);
      gesture.current.captured = true;
    }

    setDrag(dx);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!gesture.current.pointer) return;

    const dx = event.clientX - gesture.current.startX;
    const dragged = gesture.current.moved;

    gesture.current.pointer = false;

    if (gesture.current.captured) {
      gesture.current.captured = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }

    setDrag(0);

    // A press that never became a drag is a click; leave it alone so the link can do its job.
    if (!dragged) return;

    if (dx <= -SWIPE_COMMIT_PX) go(active + 1);
    else if (dx >= SWIPE_COMMIT_PX) go(active - 1);
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* The stage owns the geometry as CSS variables so the three-card diagonal can collapse to a
          single card with peeking edges on small screens WITHOUT branching on a media query in JS —
          which would need the viewport at render time and mismatch on hydration.
            --x  horizontal offset per step   --y  vertical offset per step (0 on mobile = flat)
            --s  scale of a neighbour         --o  opacity of a neighbour                        */}
      <div
        role="group"
        aria-roledescription="carousel"
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "relative h-[400px] overflow-hidden rounded-2xl sm:h-[520px] lg:h-[560px]",
          // pan-y keeps vertical page scrolling working while we claim the horizontal axis.
          "touch-pan-y select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          // --x is a percentage of the CARD's own width, so it has to grow as the neighbour shrinks
          // or the three collapse into each other. At 56% the neighbours were ~42% buried under the
          // active card, which hid the left one's screenshot and the right one's title entirely.
          "[--o:0.55] [--s:0.9] [--x:84%] [--y:0px]",
          "sm:[--o:0.62] sm:[--s:0.8] sm:[--x:60%] sm:[--y:54px]",
          "lg:[--o:0.6] lg:[--s:0.78] lg:[--x:66%] lg:[--y:64px]"
        )}
      >
        {/* Only this wrapper moves during a drag, so all three cards travel together and none of
            their own transitions have to be fought. */}
        <div
          className="absolute inset-0"
          style={{ transform: `translateX(${drag * DRAG_FOLLOW}px)` }}
        >
          {projects.map((project, index) => {
            const rel = relativeTo(index);
            const isActive = rel === 0;
            const offStage = Math.abs(rel) > 1;
            // Park off-stage cards WELL past the clip rather than at their natural ±2. At ±2 a card
            // still overlapped the stage, so while its opacity was mid-transition it was visible —
            // a card-shaped shadow sliding in at the right edge on every step. OFFSTAGE_STEPS is
            // chosen so the card's near edge clears the stage at every breakpoint.
            const pos = offStage ? Math.sign(rel) * OFFSTAGE_STEPS : rel;

            return (
              <div
                key={project.id}
                aria-hidden={!isActive}
                style={{
                  transform: `translate(calc(-50% + (${pos} * var(--x))), calc(-50% + (${pos} * var(--y)))) scale(${
                    isActive ? "1" : "var(--s)"
                  })`,
                  zIndex: 10 - Math.abs(rel),
                  opacity: offStage ? 0 : isActive ? 1 : "var(--o)",
                }}
                className={cn(
                  "absolute left-1/2 top-1/2 w-[84vw] max-w-[380px] sm:w-[52%] sm:max-w-[480px] lg:w-[44%]",
                  "flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
                  // Off-stage cards must not ANIMATE into position. The deck loops, so on every step
                  // one card has to move from the far left to the far right to queue up again — with
                  // a transition that journey is a ghost travelling across the whole stage. Without
                  // one it teleports instantly, outside the clip, where nobody can see it. The three
                  // on-stage cards keep their transition, which is all the motion the eye follows.
                  offStage
                    ? "transition-none"
                    : "transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none",
                  isActive ? "shadow-2xl" : "shadow-lg",
                  offStage && "pointer-events-none"
                )}
              >
                {/* Select-this-card is a real <button> covering the neighbour, not an onClick on
                    the card div — a clickable div has no role, no key handling and no focus. It
                    cannot WRAP the card, because the card contains links and interactive content
                    inside a <button> is invalid HTML; an overlay gives the whole card as a hit area
                    with valid semantics. tabIndex -1 on purpose: the card is aria-hidden while
                    inactive, so a focusable control inside it would be an axe violation, and the
                    labelled dot buttons below already own the keyboard and screen-reader path. This
                    is the pointer convenience, not the only way in. */}
                {!isActive && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={`Show ${project.title}`}
                    onClick={() => {
                      // A drag that ends over a neighbour must not also select it.
                      if (gesture.current.moved) return;
                      go(index);
                    }}
                    className="absolute inset-0 z-10 cursor-pointer"
                  />
                )}

                <div className="p-3 pb-0">
                  {/* aspect-video matches the source screenshots, so object-cover crops nothing. */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                    {project.images?.[0] ? (
                      <Image
                        src={project.images[0]}
                        alt={`${project.title} interface`}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 84vw, (max-width: 1024px) 58vw, 553px"
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

                <div className="flex flex-col p-5">
                  {/* Centred on a neighbour, left-aligned on the active card. A neighbour is
                      partially covered by the active card, and it is always the INNER half that is
                      covered — so a left-aligned title on the right-hand neighbour lands underneath
                      the active card and cannot be read at all. Centring puts it in the exposed
                      half on whichever side the card sits. */}
                  <h3
                    className={cn(
                      "font-display text-base font-semibold text-foreground sm:text-lg",
                      !isActive && "text-center"
                    )}
                  >
                    {project.title}
                  </h3>

                  {/* Everything below the title belongs to the SELECTED card only — this is the
                      change that kills the ghosting, since a neighbour has no buttons to duplicate.
                      grid-rows 0fr -> 1fr animates to the content's natural height, which a plain
                      height transition cannot do without a hardcoded pixel value. */}
                  <div
                    className={cn(
                      "grid transition-all duration-500 ease-out motion-reduce:transition-none",
                      isActive
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      {project.impact?.[0] && (
                        <p className="pt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {project.impact[0].metric} {project.impact[0].label}
                        </p>
                      )}

                      <p className="line-clamp-3 pt-2 text-sm leading-relaxed text-muted-foreground">
                        {project.summary ?? project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-3">
                        {/* Inert cards must not be tab stops. */}
                        <Link
                          href={`/work/${project.id}`}
                          tabIndex={isActive ? undefined : -1}
                          draggable={false}
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
                            draggable={false}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            Live
                            <ArrowUpRight
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explicit controls. Arrow keys only help someone who already knows they exist, and neither
          click-a-neighbour nor swipe is discoverable to a keyboard or screen-reader user. */}
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
