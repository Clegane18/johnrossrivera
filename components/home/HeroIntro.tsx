"use client";

import { siteConfig } from "@/config/site";
import {
  REQUEST_OPEN_EVENT,
  SHORTCUT_KEY,
  useShortcutModifier,
} from "@/hooks/useCommandPalette";
import Image from "next/image";
import { useEffect, useState } from "react";

function useManilaTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        minute: "2-digit",
      })
        .format(new Date())
        .toLowerCase();
    setTime(format());
    const id = window.setInterval(() => setTime(format()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function HeroIntro() {
  const modifier = useShortcutModifier();
  const time = useManilaTime();

  return (
    <section
      aria-label="Introduction"
      className="grid items-center gap-6 pb-10 pt-10 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-10 sm:pb-12 sm:pt-24"
    >
      {/* The original portrait, as a plain black-and-white photo. Two files because each is lit
          for its theme; the .hero-portrait-light/-dark rules in globals.css show one, keyed off
          the `dark` class layout.tsx sets before paint. The hidden one has no box, so with lazy
          loading it is never fetched. Cropped square on the head and shoulders. */}
      <div className="relative aspect-square w-28 overflow-hidden sm:w-[200px]">
        {[
          [siteConfig.about.lightImageUrl, "hero-portrait-light"],
          [siteConfig.about.darkImageUrl, "hero-portrait-dark"],
        ].map(([src, themeClass]) => (
          <Image
            key={themeClass}
            src={src}
            alt={siteConfig.about.imageAlt}
            fill
            sizes="(min-width: 640px) 200px, 112px"
            className={`${themeClass} object-cover object-[50%_12%] grayscale`}
          />
        ))}
      </div>
      <div className="min-w-0">
        <h1 className="font-mono text-[clamp(30px,4.4vw,44px)] font-normal leading-[1.05] tracking-[-0.03em] text-foreground">
          {siteConfig.name}
        </h1>
        <p className="mt-2.5 text-base font-medium text-foreground">
          {siteConfig.role} · {siteConfig.heroStack.slice(2, 4).join(", ")},{" "}
          {siteConfig.heroStack[0]}
        </p>
        <p className="mt-3.5 max-w-[460px] text-[15px] leading-relaxed text-muted-foreground">
          {siteConfig.about.bio}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="#work"
            className="inline-flex h-10 items-center rounded-lg bg-foreground px-4 text-[13.5px] font-medium text-background hover:opacity-85"
          >
            See my work
          </a>
          <a
            href={siteConfig.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-[13.5px] font-medium text-foreground hover:bg-muted"
          >
            Resume ↗
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(REQUEST_OPEN_EVENT))}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-[13.5px] font-medium text-foreground hover:bg-muted"
          >
            Ask about me
            <span className="flex gap-1" aria-hidden="true">
              <kbd className="rounded border border-border bg-card px-1.5 font-mono text-[10.5px] font-normal text-muted-foreground">
                {modifier}
              </kbd>
              <kbd className="rounded border border-border bg-card px-1.5 font-mono text-[10.5px] font-normal text-muted-foreground">
                {SHORTCUT_KEY}
              </kbd>
            </span>
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[12.5px]">
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-4"
          >
            github ↗
          </a>
          <a
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-4"
          >
            linkedin ↗
          </a>
          <span className="text-muted-foreground">
            {siteConfig.about.location.split(",")[0].toLowerCase()}, ph
            {time ? ` · ${time}` : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
