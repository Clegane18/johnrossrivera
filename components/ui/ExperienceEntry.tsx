"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { companyInitials, formatDuration } from "@/lib/utils/duration";
import { cn } from "@/lib/utils/cn";
import type { Experience } from "@/types";

// One timeline entry. Its own component because the show-more state is per-entry — keeping it in the
// section would mean tracking an open/closed map keyed by id for no benefit.

type Props = {
  experience: Experience;
  /** Injected so the rendered duration is deterministic rather than dependent on render time. */
  now: Date;
};

export function ExperienceEntry({ experience, now }: Props) {
  const [expanded, setExpanded] = useState(false);

  const duration = formatDuration(
    experience.startDate,
    experience.endDate,
    now
  );
  // Fall back to the first two long bullets if an entry has no short ones yet, so a new entry can
  // never render an empty body.
  const short = experience.highlights ?? experience.description.slice(0, 2);
  // Nothing to reveal if the short copy already IS the full copy — no dead control.
  const canExpand =
    experience.description.length > 0 && short !== experience.description;

  return (
    <li className="group relative pl-14 sm:pl-16">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card font-mono text-xs tracking-wider text-muted-foreground"
      >
        {companyInitials(experience.company)}
      </span>

      <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
        {experience.company}
      </h3>

      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        {experience.employmentType}
        {duration && <> &middot; {duration}</>}
        {experience.workMode && <> &middot; {experience.workMode}</>}
      </p>

      <p className="mt-3 text-sm font-medium text-foreground">
        {experience.role}
      </p>
      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {experience.startDate} &mdash; {experience.endDate}
      </p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {short.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
          >
            <span className="bg-foreground/40 mt-2 h-1 w-1 shrink-0 rounded-full" />
            {point}
          </li>
        ))}
      </ul>

      {canExpand && (
        <>
          {/* The full description stays in lib/data for the chat either way; this only controls
              whether the PAGE shows it. Rendered rather than mounted-on-open so the content is in
              the DOM for find-in-page and for crawlers. */}
          {/* The `hidden` attribute must sit on an element with NO display utility. `[hidden]` is
              `display:none` from the UA sheet at the same specificity as Tailwind's `.flex`, and
              Tailwind's utilities come later in the cascade — so `flex` won and the "collapsed"
              list was always visible, which made the button look broken. The wrapper carries the
              attribute; the flex layout lives one level in. */}
          <div id={`${experience.id}-detail`} hidden={!expanded}>
            <ul className="mt-3 flex flex-col gap-2 border-l border-border pl-4">
              {experience.description.map((point) => (
                <li
                  key={point}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`${experience.id}-detail`}
            // 82x17 as measured — the smallest control on the page, and the only way to read the
            // detail behind any role. min-h-11 gives it the 44px touch floor without changing the
            // type, and the underline gives it the affordance the bare uppercase label lacked.
            className="mt-1 inline-flex min-h-11 items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {expanded ? "Show less" : "Show more"}
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                expanded && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {experience.tech.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </li>
  );
}
