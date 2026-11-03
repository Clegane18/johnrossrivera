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
// which is what gives the portrait its printed-dot look. 150 keeps the eyes and mouth legible.
const GRID = 150;
// Tone curve per theme, applied to the cut-out's grey (contrast and sharpening are already baked
// into the file). Light mode lifts the mid-tones so skin reads as paper and only the features take
// ink; dark mode draws the bright parts and needs no lift.
const GAMMA = { light: 0.75, dark: 1 };

/**
 * Draws the portrait as an ordered dither in the current ink colour. Falls back to the initials if
 * the photo cannot load, so the hero never shows an empty square.
 *
 * The source is a cut-out (transparent background), so one image serves both themes: it is drawn
 * on white in light mode, where dots go on the dark parts (ink on paper), and on black in dark
 * mode, where dots go on the bright parts, so the face stays a positive image, not a negative.
 */
function usePortraitDither(src: string) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let image: HTMLImageElement | null = null;

    function draw() {
      if (!canvas || !ctx) return;
      const dark = document.documentElement.classList.contains("dark");
      const off = document.createElement("canvas");
      off.width = off.height = GRID;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      const hasImage = Boolean(image && image.naturalWidth > 0);
      if (image && hasImage) {
        // Square, already cropped on the face. Left transparent: the alpha marks the background.
        octx.drawImage(image, 0, 0, GRID, GRID);
      } else {
        octx.fillStyle = dark ? "#000" : "#fff";
        octx.fillRect(0, 0, GRID, GRID);
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
      const gamma = dark ? GAMMA.dark : GAMMA.light;
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const i = (y * GRID + x) * 4;
          // Background (cut away) gets no dots in either theme.
          if (hasImage && data[i + 3] < 60) continue;
          const grey = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          const lum = hasImage ? Math.pow(grey, gamma) : grey;
          const threshold = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
          if (dark ? lum > threshold : lum < threshold) ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    const img = new Image();
    img.onload = () => {
      image = img;
      draw();
    };
    img.onerror = draw;
    img.src = src;
    draw();

    // Redraw when the theme flips, so the dots always use the current ink colour.
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [src]);

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
  const canvasRef = usePortraitDither(siteConfig.about.portraitCutoutUrl);
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
