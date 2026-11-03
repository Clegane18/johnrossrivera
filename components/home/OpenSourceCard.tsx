import { SectionHead } from "@/components/home/SectionHead";
import { projects } from "@/lib/data/projects";
import Link from "next/link";

const provenly = projects.find((p) => p.id === "provenly");

export function OpenSourceCard() {
  if (!provenly) return null;
  const repo = provenly.repoUrls?.[0]?.url;

  return (
    <section id="open-source" className="pt-20 sm:pt-24">
      <SectionHead
        number="04"
        title="open source"
        aside={
          repo ? (
            <a
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
            >
              Repo ↗
            </a>
          ) : undefined
        }
      />
      <div className="grid gap-6 rounded-xl border border-border bg-card p-5 sm:grid-cols-[minmax(0,1fr)_200px] sm:p-6">
        <div>
          <span className="inline-block rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            MIT · Claude Code
          </span>
          <h3 className="mt-2 font-mono text-[22px] font-normal tracking-[-0.02em] text-foreground">
            {provenly.title}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {provenly.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/work/${provenly.id}`}
              className="inline-flex h-9 items-center rounded-lg bg-foreground px-3 text-[13px] font-medium text-background hover:opacity-85"
            >
              Case study
            </Link>
            {repo && (
              <a
                href={repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-medium text-foreground hover:bg-muted"
              >
                Source ↗
              </a>
            )}
          </div>
        </div>
        <dl className="flex flex-row flex-wrap gap-x-7 gap-y-4 border-t border-border pt-4 sm:flex-col sm:flex-nowrap sm:gap-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          {(provenly.impact ?? []).slice(0, 4).map((item) => (
            <div key={item.label}>
              <dt className="font-mono text-[22px] tracking-[-0.02em] text-foreground [font-variant-numeric:tabular-nums]">
                {item.metric}
              </dt>
              <dd className="text-xs text-muted-foreground">{item.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
