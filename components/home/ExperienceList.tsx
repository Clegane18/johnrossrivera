"use client";

import { SectionHead } from "@/components/home/SectionHead";
import { flash } from "@/components/layout/AgentRouter";
import { SHOW_EXPERIENCE_EVENT } from "@/lib/ai/page-actions";
import { experienceRows as rows } from "@/lib/data/experience-rows";
import { cn } from "@/lib/utils/cn";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function ExperienceList() {
  const [open, setOpen] = useState<Set<string>>(() => new Set([rows[0].id]));
  const allOpen = open.size === rows.length;

  // Nuggets' experience tour (and "show experience:ID"): open that row, bring it to the middle of
  // the screen once it has expanded, and outline it.
  useEffect(() => {
    function onShow(event: Event) {
      const id = (event as CustomEvent<string>).detail;
      if (!rows.some((r) => r.id === id)) return;
      setOpen((current) => new Set(current).add(id));
      window.setTimeout(() => {
        const row = document.getElementById(`xp-row-${id}`);
        if (!row) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        row.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        flash(row);
      }, 320);
    }
    window.addEventListener(SHOW_EXPERIENCE_EVENT, onShow);
    return () => window.removeEventListener(SHOW_EXPERIENCE_EVENT, onShow);
  }, []);

  function toggle(id: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section id="experience" className="pt-20 sm:pt-24">
      <SectionHead
        number="02"
        title="experience"
        aside={
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(rows.map((r) => r.id)))}
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        }
      />
      <div className="border-t border-border">
        {rows.map((row) => {
          const isOpen = open.has(row.id);
          return (
            <div key={row.id} id={`xp-row-${row.id}`} className="border-b border-border">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`xp-${row.id}`}
                onClick={() => toggle(row.id)}
                className="group grid w-full grid-cols-[48px_minmax(0,1fr)_16px] items-center gap-x-4 gap-y-0.5 py-3.5 text-left sm:grid-cols-[64px_minmax(0,1fr)_auto_16px]"
              >
                <span className="font-mono text-xs text-muted-foreground [font-variant-numeric:tabular-nums]">
                  {row.year}
                </span>
                <span className="font-medium text-foreground group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
                  {row.title}
                </span>
                <span className="col-start-2 row-start-2 text-[13px] text-muted-foreground sm:col-start-3 sm:row-start-1 sm:text-right sm:text-sm">
                  {row.org}
                </span>
                <Plus
                  aria-hidden="true"
                  className={cn(
                    "col-start-3 row-start-1 h-3 w-3 text-muted-foreground transition-transform sm:col-start-4",
                    isOpen && "rotate-45"
                  )}
                />
              </button>
              <div
                id={`xp-${row.id}`}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div
                  className={cn(
                    "overflow-hidden sm:pl-20",
                    // Collapsed rows stay in the DOM for the height animation, so hide them from
                    // the tab order and screen readers explicitly.
                    !isOpen && "invisible"
                  )}
                  aria-hidden={!isOpen}
                >
                  <p className="mb-2.5 text-[12.5px] text-muted-foreground">{row.meta}</p>
                  <ul className="flex flex-col gap-2 pb-1.5">
                    {row.points.map((point) => (
                      <li
                        key={point}
                        className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-[7px] before:bg-muted-foreground"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5 pb-4 pt-2.5">
                    {row.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
