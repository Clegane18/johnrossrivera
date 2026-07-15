"use client";

import { siteConfig } from "@/config/site";
import { projects } from "@/lib/data/projects";
import { ProjectCarousel } from "@/components/ui/ProjectCarousel";
import { motion } from "framer-motion";
import {
  Code2,
  Database,
  ExternalLink,
  Layers,
  Network,
  Server,
  Shield,
  Sparkles,
  TestTube,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Filter = "All" | "Featured" | "Other";
const FILTERS: Filter[] = ["All", "Featured", "Other"];
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const techIconMap: Record<string, LucideIcon> = {
  TypeScript: Code2,
  "Next.js": Layers,
  "Next.js 16": Layers,
  "React 19": Layers,
  "Node.js": Server,
  "NestJS 11": Server,
  "Express.js": Server,
  MySQL: Database,
  PostgreSQL: Database,
  Sequelize: Database,
  Prisma: Database,
  JWT: Shield,
  RBAC: Shield,
  "RTK Query": Network,
  Jest: TestTube,
  Playwright: TestTube,
};

function getTechIcon(label: string): LucideIcon {
  return techIconMap[label] ?? Code2;
}

export function Projects() {
  const [active, setActive] = useState<Filter>("All");

  const filtered = projects.filter((p) => {
    if (active === "Featured") return p.featured;
    if (active === "Other") return !p.featured;
    return true;
  });

  return (
    <section id="projects" className="section-padding">
      <div className="section-container">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="mb-10 sm:mb-12"
        >
          <h2 className="section-heading mb-6 sm:mb-8">
            {siteConfig.sectionLabels.projects}
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter tabs */}
            <div className="flex items-center gap-3">
              <div
                role="tablist"
                aria-label="Project filter"
                className="flex items-center gap-1"
              >
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={active === f}
                    aria-controls="projects-list"
                    onClick={() => setActive(f)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4",
                      active === f
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {filtered.length} shown
              </p>
            </div>

            {/* View all link */}
            <Link
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-shadow duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View All Work
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12L12 2M12 2H5M12 2v7" />
              </svg>
            </Link>
          </div>
        </motion.div>

        <motion.ul
          id="projects-list"
          key={active}
          className="grid gap-5 sm:grid-cols-2 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((project) => (
            <motion.li
              key={project.id}
              variants={itemVariants}
              className="group"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg">
                {/* Image header – carousel or letter placeholder */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {project.images && project.images.length > 0 ? (
                    <ProjectCarousel
                      images={project.images}
                      mobileImages={project.mobileImages}
                      title={project.title}
                    />
                  ) : (
                    <div className="via-muted/60 flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-border/60 font-hero text-5xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">
                          {project.title.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-muted-foreground/60 max-w-[80%] text-center font-mono text-[10px] uppercase tracking-widest">
                          {project.title}
                        </span>
                      </div>
                    </div>
                  )}
                  {project.featured && (
                    <span className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg ring-1 ring-white/20">
                      <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                  <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
                    {project.title}
                  </h3>

                  {project.impact && project.impact.length > 0 && (
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {project.impact.map((stat) => (
                        <div key={stat.label}>
                          <p className="font-hero text-lg font-black leading-none text-foreground">
                            {stat.metric}
                          </p>
                          <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>

                  {project.problem && (
                    <Link
                      href={`/work/${project.id}`}
                      className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Read case study
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 12L12 2M12 2H5M12 2v7" />
                      </svg>
                    </Link>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {(() => {
                          const Icon = getTechIcon(t);
                          return (
                            <Icon className="h-3 w-3" aria-hidden="true" />
                          );
                        })()}
                        {t}
                      </span>
                    ))}
                  </div>

                  {(project.repoUrl ||
                    project.liveUrl ||
                    (project.repoUrls && project.repoUrls.length > 0)) && (
                    <div className="flex flex-wrap gap-4 border-t border-border pt-4">
                      {project.repoUrls
                        ? project.repoUrls.map((r) => (
                            <Link
                              key={r.url}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                              </svg>
                              {r.label}
                            </Link>
                          ))
                        : project.repoUrl && (
                            <Link
                              href={project.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                              </svg>
                              Source
                            </Link>
                          )}
                      {project.liveUrl && (
                        <Link
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {project.liveAuthGated
                            ? "View Production (login required)"
                            : "Live Demo"}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
