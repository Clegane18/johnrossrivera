import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ProjectDeck } from "@/components/ui/ProjectDeck";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { projects } from "@/lib/data/projects";

// Featured work goes in the deck, one card at a time; the rest is a compact list underneath.
//
// The filter tabs (All / Featured / Other) are gone: with the split made structural, they let a
// visitor rearrange a decision that has already been made for them, and every extra control in a
// section is one more thing between a recruiter and the work.

// `hiddenOnPage` entries stay in lib/data so the chat still knows them; they just don't render here.
const visible = projects.filter((p) => !p.hiddenOnPage);
const featured = visible.filter((p) => p.featured);
const other = visible.filter((p) => !p.featured);

export function Projects() {
  return (
    <section id="projects" className="section-padding">
      <div className="section-container">
        <Reveal duration={0.6} className="mb-10 sm:mb-12">
          <h2 className="section-heading mb-6 sm:mb-8">
            {siteConfig.sectionLabels.projects}
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {featured.length} featured &middot; use arrow keys or click a card
            </p>

            <Link
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-shadow duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View All Work
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal y={24} duration={0.6}>
          <ProjectDeck projects={featured} />
        </Reveal>

        {other.length > 0 && (
          <Reveal y={16} duration={0.5} className="mt-14 sm:mt-16">
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Also built
            </h3>

            {/* Text rows, not cards. One of these has no screenshots at all, and a deliberately
                plain list is honest about the difference rather than dressing it up to match. */}
            <ul className="flex flex-col divide-y divide-border border-y border-border">
              {other.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="w-full max-w-[14rem] shrink-0 text-sm font-medium text-foreground">
                    {project.title}
                  </span>
                  <span className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {project.summary ?? project.description}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {project.tech.slice(0, 2).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}
