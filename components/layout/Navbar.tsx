"use client";

import { siteConfig } from "@/config/site";
import {
  REQUEST_OPEN_EVENT,
  SHORTCUT_KEY,
  useShortcutModifier,
} from "@/hooks/useCommandPalette";
import { useSound } from "@/hooks/useSound";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils/cn";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { Moon, Search, Sun, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";

const sectionIds = siteConfig.nav.map((item) => item.href.replace("#", ""));

export function Navbar() {
  const activeSection = useScrollSpy(sectionIds);
  const { theme, toggleTheme, isReady } = useTheme();
  const {
    enabled: soundEnabled,
    isReady: soundReady,
    play,
    toggleSound,
  } = useSound();
  const shortcutModifier = useShortcutModifier();

  // Shared by BOTH theme toggles (desktop and mobile). The click coordinates are what the circular
  // reveal expands from — without them useTheme falls back to an instant switch, so a call site that
  // forgets to pass the event silently loses the animation. One handler means that cannot happen.
  function handleThemeToggle(event: MouseEvent<HTMLButtonElement>) {
    play(theme === "dark" ? "toggle-off" : "toggle-on");
    toggleTheme({ x: event.clientX, y: event.clientY });
  }

  return (
    <header className="navbar-reveal bg-background/90 fixed inset-x-0 top-0 z-50 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        {/* Availability status.
            Was a pill with a pulsing green dot and 41 characters of text that wrapped onto two
            lines. The pulsing dot is a SaaS-marketing tell — it says "live status indicator" while
            indicating nothing, and it animates forever, which also made it a source of flicker
            during the theme transition. A quiet uppercase mono label reads as deliberate; a
            blinking badge reads as decoration. `whitespace-nowrap` guarantees one line. */}
        <div className="hidden lg:flex lg:flex-col">
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Availability
          </span>
          <span className="whitespace-nowrap text-xs font-medium text-foreground">
            {siteConfig.navbar.availabilityText}
          </span>
        </div>

        <ul className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => {
            const isActive = activeSection === item.href.replace("#", "");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "nav-active bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  {siteConfig.navbar.showCounters && item.counter && (
                    <span
                      className={cn(
                        "font-mono text-[10px] leading-none",
                        isActive
                          ? "text-background/60"
                          : "text-muted-foreground"
                      )}
                    >
                      [{item.counter}]
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ml-auto because below lg the availability label and the link list are both display:none,
            leaving this as justify-between's only child — which parks it against the LEFT edge. */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* UTILITY CLUSTER — search, theme, sound in ONE segmented control.
              Three separate pills read as three unrelated decisions competing with Resume and
              Let's Talk for attention. Grouping them into a single bordered unit with hairline
              dividers drops the visual object count in the bar from five to three, and says these
              belong together. Each control keeps its own accessible name. */}
          <div className="inline-flex items-center overflow-hidden rounded-full border border-border bg-card">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new Event(REQUEST_OPEN_EVENT))
              }
              className="hidden min-h-11 items-center gap-1.5 px-3.5 text-sm text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:inline-flex"
              aria-label="Ask anything"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <kbd className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] leading-none">
                {/* The ⌘ glyph is bumped up and taken out of the mono run. Space Mono has no U+2318,
                    so it falls back to a system face whose ⌘ sits far below the cap height of the K
                    beside it — at 10px the two stop looking like the same size of key. The length
                    check is the discriminator: a one-character modifier is the glyph and needs the
                    correction, while "Ctrl" is a word that belongs in the mono run with the K. */}
                <span
                  className={cn(
                    "leading-none",
                    shortcutModifier.length === 1 && "font-sans text-[13px]"
                  )}
                >
                  {shortcutModifier}
                </span>
                {SHORTCUT_KEY}
              </kbd>
            </button>

            <span
              className="hidden h-5 w-px bg-border lg:block"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={handleThemeToggle}
              data-sound-self
              className="inline-flex min-h-11 items-center px-3.5 text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              aria-label={
                isReady && theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {isReady && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <span className="h-5 w-px bg-border" aria-hidden="true" />

            {/* Sound is OFF by default, so this control is the only way anyone discovers it.
                soundReady mirrors the theme toggle's isReady guard against a hydration mismatch. */}
            <button
              type="button"
              onClick={() => {
                // Play on the way ON only: making a noise to announce silence is absurd.
                if (!soundEnabled) play("toggle-on");
                toggleSound();
              }}
              data-sound-self
              className="inline-flex min-h-11 items-center px-3.5 text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              aria-pressed={soundReady ? soundEnabled : undefined}
              aria-label={
                soundReady && soundEnabled
                  ? "Turn interface sounds off"
                  : "Turn interface sounds on"
              }
            >
              {soundReady && soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Plain <a> — see Hero. next/link RSC-prefetches this static PDF and 404s. */}
          <a
            href={siteConfig.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {siteConfig.navbar.resumeCtaLabel}
          </a>
          {/* Desktop only. Below lg the dock's Contact chip is this link, permanently in the thumb
              zone — keeping both would put the same destination on screen twice and crowd a 360px
              top bar. */}
          <Link
            href="#contact"
            className="hidden min-h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-all duration-300 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:inline-flex"
          >
            {siteConfig.navbar.contactCtaLabel}
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
      </nav>
    </header>
  );
}
