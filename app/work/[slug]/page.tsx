import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { projects } from "@/lib/data/projects";
import { ProjectCarousel } from "@/components/ui/ProjectCarousel";

function GithubIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

// Only projects with case-study content get a detail page.
const caseStudies = projects.filter((p) => Boolean(p.problem));

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.id }));
}

// Next.js 14 — params is synchronous.
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = caseStudies.find((p) => p.id === params.slug);

  if (!project) return { title: "Case study not found" };

  return {
    title: `${project.title} — Case Study`,
    description: project.problem ?? project.description,
    alternates: { canonical: `/work/${project.id}` },
  };
}

export default function CaseStudyPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = caseStudies.find((p) => p.id === params.slug);

  if (!project) notFound();

  return (
    <article className="section-padding">
      <div className="section-container max-w-4xl">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Projects
        </Link>

        {/* Header */}
        <header className="mt-8">
          <h1 className="font-hero text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {project.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          {(project.liveUrl ||
            project.repoUrl ||
            (project.repoUrls && project.repoUrls.length > 0)) && (
            <div className="mt-5 flex flex-wrap gap-4">
              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {project.liveAuthGated
                    ? "View Production (login required)"
                    : "Live"}
                </Link>
              )}
              {project.repoUrls
                ? project.repoUrls.map((r) => (
                    <Link
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <GithubIcon />
                      {r.label}
                    </Link>
                  ))
                : project.repoUrl && (
                    <Link
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <GithubIcon />
                      Source
                    </Link>
                  )}
            </div>
          )}
        </header>

        {/* Impact stats */}
        {project.impact && project.impact.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {project.impact.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <p className="font-hero text-2xl font-black text-foreground sm:text-3xl">
                  {stat.metric}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Problem */}
        {project.problem && (
          <section className="mt-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              The Problem
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              {project.problem}
            </p>
          </section>
        )}

        {/* Role */}
        {project.role && (
          <section className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              My Role
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              {project.role}
            </p>
          </section>
        )}

        {/* Clients */}
        {project.clients && project.clients.length > 0 && (
          <section className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Clients
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.clients.map((c) => (
                <span
                  key={c.name}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
                >
                  {c.name}
                </span>
              ))}
            </div>
            {project.clients.some((c) => c.note) && (
              <div className="mt-3 flex flex-col gap-1">
                {project.clients
                  .filter((c) => c.note)
                  .map((c) => (
                    <p
                      key={c.name}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {c.note}
                    </p>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* Key decisions */}
        {project.decisions && project.decisions.length > 0 && (
          <section className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Key Decisions & Trade-offs
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {project.decisions.map((d) => (
                <li key={d} className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-base leading-relaxed text-muted-foreground">
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Architecture */}
        {project.architectureSvg && (
          <section className="mt-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Architecture
            </h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-6">
              <Image
                src={project.architectureSvg}
                alt={`${project.title} architecture diagram`}
                width={730}
                height={190}
                unoptimized
                className="mx-auto h-auto w-full max-w-2xl"
              />
            </div>
          </section>
        )}

        {/* Screenshots */}
        {project.images && project.images.length > 0 && (
          <section className="mt-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Screenshots
            </h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              <ProjectCarousel
                images={project.images}
                mobileImages={project.mobileImages}
                title={project.title}
              />
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
