"use client";

import { siteConfig } from "@/config/site";
import {
  REQUEST_OPEN_EVENT,
  SHORTCUT_KEY,
  useShortcutModifier,
} from "@/hooks/useCommandPalette";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils/cn";
import { FileText, Menu, Moon, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SECTION_IDS = siteConfig.railNav.map((item) => item.id);

function GithubIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const rowClass =
  "flex min-h-9 items-center justify-between gap-3 rounded-md px-2 -mx-2 text-[13.5px] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * The site's navigation: a fixed left rail from lg, a sticky top bar with a slide-in panel below it.
 * "Ask about me" opens the Nuggets chat through the same event the ⌘K shortcut uses, so there is
 * still exactly one way into the chat.
 */
export function Rail() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const active = useScrollSpy(SECTION_IDS);
  const modifier = useShortcutModifier();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const onHome = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openChat() {
    setOpen(false);
    window.dispatchEvent(new Event(REQUEST_OPEN_EVENT));
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${siteConfig.email}`;
    }
  }

  const panel = (
    <>
      <Link
        href="/"
        className="font-mono text-sm font-medium text-foreground"
        onClick={() => setOpen(false)}
      >
        {siteConfig.name}
      </Link>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground">
        {siteConfig.role}
      </p>

      <div className="-mx-2 mt-6 min-h-0 flex-1 overflow-y-auto px-2">
        <nav aria-label="Sections" className="flex flex-col gap-px">
          {siteConfig.railNav.map((item) => {
            const isActive = onHome && active === item.id;
            return (
              <Link
                key={item.id}
                href={`/#${item.id}`}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  rowClass,
                  "justify-start",
                  isActive && "bg-muted text-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-[18px] font-mono text-[11px]",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.number}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <hr className="my-4 border-border" />

        <div className="flex flex-col gap-px">
          <button type="button" onClick={openChat} className={rowClass}>
            <span className="flex items-center gap-2.5">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Ask about me
            </span>
            <span className="flex gap-1" aria-hidden="true">
              <kbd className="rounded border border-border bg-card px-1.5 font-mono text-[10.5px]">
                {modifier}
              </kbd>
              <kbd className="rounded border border-border bg-card px-1.5 font-mono text-[10.5px]">
                {SHORTCUT_KEY}
              </kbd>
            </span>
          </button>
          <a
            href={siteConfig.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Resume
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-wider">
              PDF ↗
            </span>
          </a>
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass}
          >
            <span className="flex items-center gap-2.5">
              <GithubIcon />
              GitHub
            </span>
            <span className="font-mono text-[10.5px]">↗</span>
          </a>
          <a
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass}
          >
            <span className="flex items-center gap-2.5">
              <LinkedinIcon />
              LinkedIn
            </span>
            <span className="font-mono text-[10.5px]">↗</span>
          </a>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3.5 border-t border-border pt-4">
        <p className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-50 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground" />
          </span>
          {siteConfig.availability}
        </p>
        <div
          role="group"
          aria-label="Theme"
          className="inline-flex gap-0.5 self-start rounded-full border border-border bg-card p-0.5"
        >
          {(
            [
              ["light", Sun, "Light theme"],
              ["dark", Moon, "Dark theme"],
            ] as const
          ).map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
              className={cn(
                "grid h-6 w-8 place-items-center rounded-full",
                theme === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copyEmail}
          title="Copy email"
          // One line, always. The rail's text column is ~192px; with a mail icon beside it at 12px
          // the address wrapped mid-word ("…@gmai / l.com"). No icon and 11.5px fit it whole.
          className="whitespace-nowrap text-left font-mono text-[11.5px] text-foreground hover:underline hover:underline-offset-4"
        >
          {copied ? "Copied to clipboard" : siteConfig.email}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        aria-label="Site"
        className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-border bg-muted/30 px-5 py-7 lg:flex"
      >
        {panel}
      </aside>

      {/* Mobile bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="font-mono text-sm font-medium">
          {siteConfig.name}
        </Link>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={openChat}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Ask
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-rail"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            {open ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile panel */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="mobile-rail"
        aria-label="Site"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(300px,86vw)] flex-col border-r border-border bg-background px-5 py-7 transition-[transform,visibility] duration-300 lg:hidden",
          // `invisible` when closed keeps the panel's links out of the tab order.
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        )}
      >
        {panel}
      </aside>
    </>
  );
}
