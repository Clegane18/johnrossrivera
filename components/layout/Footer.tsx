import { siteConfig } from "@/config/site";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-muted/35 border-t border-border pb-28 pt-6 lg:pb-8 lg:pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:items-center">
          <div className="space-y-1">
            <p className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
              {siteConfig.name}
            </p>
            <p className="text-xs text-muted-foreground">{siteConfig.role}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              GitHub
            </Link>
            <Link
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              LinkedIn
            </Link>
            <Link
              href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {siteConfig.phone}
            </Link>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}.{" "}
            {siteConfig.footer.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
