import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { siteConfig } from "@/config/site";

// The proof strip. A recruiter's first question about any portfolio claim is "says who" — every tile
// links to the case study that substantiates it, so the number is checkable in one click rather than
// asserted and left hanging.
//
// Server component on purpose: it is static content from config with no interactivity, so it costs
// nothing in the client bundle.

export function HeroMetrics() {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
      {siteConfig.heroMetrics.map((metric) => (
        <Link
          key={metric.label}
          href={metric.href}
          // The whole tile is the target, not just the number — a 44px+ hit area is the mobile
          // accessibility floor, and a bare number is a cramped thing to tap.
          className="group flex flex-col gap-1 bg-background p-4 transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5"
        >
          <dt className="order-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {metric.label}
          </dt>
          <dd className="order-1 flex items-start gap-1 font-hero text-2xl font-black leading-none text-foreground sm:text-3xl">
            {metric.value}
            <ArrowUpRight
              className="h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
              aria-hidden="true"
            />
          </dd>
        </Link>
      ))}
    </dl>
  );
}
