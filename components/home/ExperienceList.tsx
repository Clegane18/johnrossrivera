"use client";

import { SectionHead } from "@/components/home/SectionHead";
import { siteConfig } from "@/config/site";
import { experiences } from "@/lib/data/experience";
import { cn } from "@/lib/utils/cn";
import { Plus } from "lucide-react";
import { useState } from "react";

type Row = {
  id: string;
  year: string;
  title: string;
  org: string;
  meta: string;
  points: string[];
  tech: string[];
};

function sortKey(date: string): number {
  if (date === "Present") return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(`1 ${date}`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Current role first, then by end date, newest first. Education closes the list.
const rows: Row[] = [
  ...experiences
    .filter((e) => !e.hiddenOnPage)
    .sort((a, b) => sortKey(b.endDate) - sortKey(a.endDate))
    .map((e) => ({
      id: e.id,
      year: e.endDate === "Present" ? "Now" : e.startDate.split(" ").pop() ?? "",
      title: e.role,
      org: e.company,
      meta: [e.employmentType, e.workMode, `${e.startDate} to ${e.endDate === "Present" ? "now" : e.endDate}`]
        .filter(Boolean)
        .join(" · "),
      points: e.highlights ?? e.description,
      tech: e.tech,
    })),
  {
    id: "education",
    year: siteConfig.education.years.split(" ")[0],
    title: siteConfig.education.degree.split(",")[0],
    org: siteConfig.education.school,
    meta: siteConfig.education.years.replace(" - ", " to "),
    points: [siteConfig.education.degree, `Coursework: ${siteConfig.education.coursework.join(", ")}.`],
    tech: [],
  },
];

export function ExperienceList() {
  const [open, setOpen] = useState<Set<string>>(() => new Set([rows[0].id]));
  const allOpen = open.size === rows.length;

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
            <div key={row.id} className="border-b border-border">
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
