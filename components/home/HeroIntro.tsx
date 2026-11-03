"use client";

import { siteConfig } from "@/config/site";
import {
  REQUEST_OPEN_EVENT,
  SHORTCUT_KEY,
  useShortcutModifier,
} from "@/hooks/useCommandPalette";
import { useEffect, useRef, useState } from "react";

// 4x4 Bayer matrix for ordered dithering.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
// Dither grid size. The canvas is drawn at this resolution and scaled up with pixelated rendering,
// which is what gives the portrait its printed-dot look.
const GRID = 120;

/**
 * Draws the portrait as an ordered dither in the current ink colour. Falls back to the initials if
 * the photo cannot load, so the hero never shows an empty square.
 *
 * Each theme dithers its own photo. In light mode dots go where the photo is dark (ink on paper);
 * in dark mode they go where it is bright, so the face stays a positive image rather than a
 * negative. The dark photo is shot against a dark ground, which keeps that background dot-free.
 */
function usePortraitDither(lightSrc: string, darkSrc: string) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: Record<"light" | "dark", HTMLImageElement | null> = {
      light: null,
      dark: null,
    };

    function draw() {
      if (!canvas || !ctx) return;
      const dark = document.documentElement.classList.contains("dark");
      const image = images[dark ? "dark" : "light"];
      const off = document.createElement("canvas");
      off.width = off.height = GRID;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      octx.fillStyle = dark ? "#000" : "#fff";
      octx.fillRect(0, 0, GRID, GRID);
      if (image && image.naturalWidth > 0) {
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        // The dark photo is low-key, so it gets a lift before dithering or the face drops out.
        octx.filter = dark
          ? "grayscale(1) brightness(1.8) contrast(1.15)"
          : "grayscale(1) contrast(1.25)";
        octx.drawImage(
          image,
          (image.naturalWidth - side) / 2,
          (image.naturalHeight - side) * 0.25,
          side,
          side,
          0,
          0,
          GRID,
          GRID
        );
      } else {
        octx.fillStyle = dark ? "#eee" : "#111";
        octx.font = '500 52px "JetBrains Mono", ui-monospace, monospace';
        octx.textAlign = "center";
        octx.textBaseline = "middle";
        octx.fillText("JR", GRID / 2, GRID / 2 + 2);
      }

      const data = octx.getImageData(0, 0, GRID, GRID).data;
      const ink = getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim();

      canvas.width = canvas.height = GRID;
      ctx.clearRect(0, 0, GRID, GRID);
      ctx.fillStyle = ink || "#0a0a0a";
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const i = (y * GRID + x) * 4;
          const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          const threshold = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
          if (dark ? lum > threshold : lum < threshold) ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    (["light", "dark"] as const).forEach((key) => {
      const img = new Image();
      img.onload = () => {
        images[key] = img;
        draw();
      };
      img.onerror = draw;
      img.src = key === "dark" ? darkSrc : lightSrc;
    });
    draw();

    // Redraw when the theme flips, so the dots always use the current ink colour.
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [lightSrc, darkSrc]);

  return ref;
}

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
  const canvasRef = usePortraitDither(
    siteConfig.about.lightImageUrl,
    siteConfig.about.darkImageUrl
  );
  const modifier = useShortcutModifier();
  const time = useManilaTime();

  return (
    <section
      aria-label="Introduction"
      className="grid items-center gap-6 pb-10 pt-10 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-10 sm:pb-12 sm:pt-24"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={siteConfig.about.imageAlt}
        className="aspect-square w-28 [image-rendering:pixelated] sm:w-[200px]"
      />
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
