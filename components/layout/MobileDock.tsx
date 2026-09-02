"use client";

import Link from "next/link";
import {
  Briefcase,
  Code2,
  Layers,
  Mail,
  Terminal,
  User,
  type LucideIcon,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils/cn";

// The mobile navigation. Replaces a hamburger opening a right-hand drawer.
//
// WHY IT IS NOT A MENU. Every destination here is an anchor on the page the visitor is already
// looking at. A drawer charged two taps and a full-screen modal for that, and it put the trigger at
// the top-right — the least reachable point on a phone — while the primary CTAs sat at the very
// bottom, so one interaction spanned the whole screen twice. A permanent dock costs one tap, sits in
// the thumb zone, and can show WHERE YOU ARE, which a closed drawer structurally cannot.
//
// WHY ICON + LABEL, NOT TEXT CHIPS. The first version laid the six labels out as text pills, which
// needed ~390px and so scrolled sideways on any ordinary phone. A nav you have to scroll is a nav
// you have to explore — a destination the visitor cannot see is a destination that does not exist.
// Stacking a small icon over a small label fits all six into ~264px of a ~324px strip, so nothing is
// hidden and nothing scrolls. That also removed the auto-centring effect this file used to need.
//
// It reuses the same useScrollSpy the desktop nav uses, so the two can never disagree about the
// current section.

const iconByHref: Record<string, LucideIcon> = {
  "#about": User,
  "#skills": Code2,
  "#experience": Briefcase,
  "#projects": Layers,
  "#live-demo": Terminal,
  "#contact": Mail,
};

export function MobileDock() {
  const activeSection = useScrollSpy(
    siteConfig.nav.map((item) => item.href.replace("#", ""))
  );

  return (
    <nav
      aria-label="Section navigation"
      // Bottom inset accounts for the iOS home indicator; without it the dock sits under the gesture
      // bar on any modern iPhone.
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <ul className="bg-card/90 mx-auto flex max-w-lg items-stretch gap-0.5 rounded-2xl border border-border p-1.5 shadow-lg backdrop-blur-md">
        {siteConfig.nav.map((item) => {
          const isActive = activeSection === item.href.replace("#", "");
          const Icon = iconByHref[item.href] ?? Layers;

          return (
            // flex-1 on every item so the six share the row evenly — the layout must not depend on
            // how long any one label happens to be.
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                // "location", not "page": these are positions within the current document, not
                // separate pages.
                aria-current={isActive ? "location" : undefined}
                // WCAG 2.5.3 (Label in Name): the accessible name must CONTAIN the visible text, or
                // a voice-control user saying "click Work" matches nothing. Naming it purely
                // "Experience" broke that; naming it purely "Work" would lose the real section name
                // for screen-reader users. Leading with the visible word and appending the full
                // label satisfies both. Items with no abbreviation need no override at all — their
                // visible text already IS their accessible name.
                aria-label={
                  item.shortLabel
                    ? `${item.shortLabel} — ${item.label}`
                    : undefined
                }
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {/* 9px was below every legibility floor going — WCAG's smallest recommended body
                    size is 12px and iOS ships nothing under 10. At 10/11px all six labels still fit
                    a 360px strip without truncating, which was the constraint that drove it down. */}
                <span className="w-full truncate text-center text-[10px] font-medium leading-none sm:text-[11px]">
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
