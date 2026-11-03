import { siteConfig } from "@/config/site";
import Link from "next/link";

/** Three credentials, then the hero metrics. Every cell links to the page that backs it. */
export function ProofGrid() {
  return (
    <div className="border-y border-border">
      <div className="grid sm:grid-cols-3">
        {siteConfig.proofCredentials.map((item, index) => (
          <Link
            key={item.title}
            href={item.href}
            className={`flex min-w-0 items-center gap-3 py-4 hover:bg-muted ${
              index > 0
                ? "border-t border-border sm:border-l sm:border-t-0 sm:pl-4"
                : "sm:pr-4"
            }`}
          >
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-md border border-border font-mono text-[10.5px] font-medium text-foreground">
              {item.mark}
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-medium text-foreground">
                {item.title}
              </span>
              <span className="block font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                {item.caption}
              </span>
            </span>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
        {siteConfig.heroMetrics.map((metric, index) => (
          <Link
            key={metric.label}
            href={metric.href}
            className={`group relative flex flex-col gap-1 py-5 hover:bg-muted ${
              index % 2 === 1 ? "border-l border-border pl-4" : ""
            } ${index >= 2 ? "border-t border-border sm:border-t-0" : ""} ${
              index === 2 ? "sm:border-l sm:pl-4" : ""
            }`}
          >
            <span className="font-mono text-[26px] font-normal leading-tight tracking-[-0.03em] text-foreground [font-variant-numeric:tabular-nums]">
              {metric.value}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
              {metric.label}
            </span>
            <span
              className="absolute right-3 top-4 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100"
              aria-hidden="true"
            >
              ↗
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
