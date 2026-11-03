"use client";

import { SectionHead } from "@/components/home/SectionHead";
import { flash } from "@/components/layout/AgentRouter";
import { SHOW_PROJECT_EVENT } from "@/lib/ai/page-actions";
import { projects } from "@/lib/data/projects";
import { cn } from "@/lib/utils/cn";
import type { Project } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

const shown = projects.filter((p) => p.featured && !p.hiddenOnPage);

// The deck shows one desktop screenshot per project. Rola's first frame is the login wall, so its
// second (the dashboard) is the one that says what was built.
const COVER_INDEX: Record<string, number> = { "rola-access-platform": 1 };

function cover(p: Project): string | undefined {
  return p.images?.[COVER_INDEX[p.id] ?? 0] ?? p.images?.[0];
}

function address(p: Project): string {
  const url = p.liveUrl ?? p.repoUrls?.[0]?.url ?? p.repoUrl;
  if (!url) return p.id;
  const { host, pathname } = new URL(url);
  return host === "github.com" ? `${host}${pathname}` : host;
}

const hasCaseStudy = (p: Project) => Boolean(p.problem);

/** The terminal-style card for projects that have nothing visual to show (provenly is hooks). */
function TerminalCover({ p }: { p: Project }) {
  return (
    <div className="h-full overflow-hidden whitespace-pre bg-background px-[7%] py-[6%] font-mono text-[clamp(9px,1.3vw,12.5px)] leading-[1.8] text-foreground">
      <span className="text-muted-foreground"># {p.title}</span>
      {"\n"}
      <span className="text-muted-foreground"># {p.tech.slice(0, 3).join(" · ")}</span>
      {"\n\n"}
      {(p.impact ?? []).slice(0, 3).map((item) => (
        <span key={item.label}>
          <span className="text-muted-foreground">› </span>
          {item.metric} <span className="text-muted-foreground">{item.label}</span>
          {"\n"}
        </span>
      ))}
    </div>
  );
}

export function WorkDeck() {
  const router = useRouter();
  const [view, setView] = useState<"deck" | "grid">("deck");
  const [current, setCurrent] = useState(0);
  const [height, setHeight] = useState<number>(420);
  const frontRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const count = shown.length;
  const p = shown[current];

  const go = useCallback(
    (index: number) => setCurrent(((index % count) + count) % count),
    [count]
  );

  // Nuggets asks for a project (lib/ai/page-actions.ts): switch to the deck, turn to that card once
  // the scroll has landed, then outline it.
  useEffect(() => {
    function onShow(event: Event) {
      const index = shown.findIndex(
        (project) => project.id === (event as CustomEvent<string>).detail
      );
      if (index === -1) return;
      setView("deck");
      setCurrent(index);
      window.setTimeout(() => {
        const card = frontRef.current?.firstElementChild;
        if (card) flash(card);
      }, 650);
    }
    window.addEventListener(SHOW_PROJECT_EVENT, onShow);
    return () => window.removeEventListener(SHOW_PROJECT_EVENT, onShow);
  }, []);

  // The deck's cards are absolutely positioned, so the container takes its height from the front
  // card. A ResizeObserver keeps that right as the column narrows.
  useEffect(() => {
    const el = frontRef.current;
    if (!el) return;
    const measure = () => {
      const narrow = window.innerWidth < 640;
      setHeight(el.offsetHeight * (narrow ? 1.14 : 1.3) + (narrow ? 24 : 40));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [current, view]);

  function openProject(project: Project) {
    if (hasCaseStudy(project)) {
      router.push(`/work/${project.id}`);
    } else if (project.liveUrl) {
      window.open(project.liveUrl, "_blank", "noopener,noreferrer");
    }
  }

  function onPointerDown(event: PointerEvent) {
    drag.current = { x: event.clientX, moved: false };
  }
  function onPointerMove(event: PointerEvent) {
    if (drag.current && Math.abs(event.clientX - drag.current.x) > 8) {
      drag.current.moved = true;
    }
  }
  function onPointerUp(event: PointerEvent) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
  }
  function onCardClick(index: number, offset: number) {
    if (drag.current?.moved) {
      drag.current = null;
      return;
    }
    drag.current = null;
    if (offset === 0) openProject(shown[index]);
    else go(index);
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(current - 1);
    } else if (event.key === "Enter") {
      openProject(p);
    }
  }

  const headline = p.impact?.[0];

  return (
    <section id="work" className="pt-20 sm:pt-24">
      <SectionHead
        number="01"
        title="work"
        aside={
          <div
            role="group"
            aria-label="Layout"
            className="inline-flex gap-0.5 rounded-full border border-border p-0.5"
          >
            {(["deck", "grid"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                  view === value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        }
      />

      {view === "deck" ? (
        <div>
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Projects. Use the left and right arrow keys to browse, Enter to open."
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (drag.current = null)}
            style={{ height }}
            className="relative -mx-4 touch-pan-y select-none overflow-hidden pt-3.5 outline-none [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] sm:-mx-12"
          >
            {shown.map((project, index) => {
              let offset = index - current;
              if (offset > count / 2) offset -= count;
              if (offset < -count / 2) offset += count;
              const distance = Math.abs(offset);
              const front = offset === 0;
              const image = cover(project);
              const phone = project.mobileImages?.[0];

              return (
                <div
                  key={project.id}
                  ref={front ? frontRef : undefined}
                  aria-hidden={!front}
                  onClick={() => onCardClick(index, offset)}
                  style={{
                    transform: `translateX(calc(-50% + ${offset * 30}%)) translateY(${distance * 16}px) rotate(${offset * 5}deg) scale(${1 - distance * 0.09})`,
                    zIndex: 10 - distance,
                    opacity: distance > 2 ? 0 : 1,
                    pointerEvents: distance > 2 ? "none" : undefined,
                  }}
                  className="group absolute left-1/2 top-3.5 w-[min(540px,80%)] origin-[50%_130%] cursor-pointer transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
                >
                  <div
                    className={cn(
                      "overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_28px_-16px_rgba(0,0,0,0.28)]",
                      !front && "group-hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex h-7 items-center gap-1.5 border-b border-border px-2.5">
                      <i className="h-2 w-2 rounded-full bg-border" />
                      <i className="h-2 w-2 rounded-full bg-border" />
                      <i className="h-2 w-2 rounded-full bg-border" />
                      <span className="mx-auto max-w-[60%] truncate rounded bg-muted px-2.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                        {address(project)}
                      </span>
                    </div>
                    <div className="relative aspect-[16/9.2]">
                      {image ? (
                        <Image
                          src={image}
                          alt={`${project.title} screenshot`}
                          fill
                          sizes="(min-width: 640px) 540px, 80vw"
                          priority={index === 0}
                          draggable={false}
                          className={cn(
                            "object-cover object-top transition-[filter] delay-150 duration-700",
                            !front && "brightness-[1.02] contrast-[0.92] grayscale"
                          )}
                        />
                      ) : (
                        <TerminalCover p={project} />
                      )}
                    </div>
                  </div>
                  {phone && (
                    <div
                      className={cn(
                        "absolute -bottom-[7%] -right-[3%] w-[21%] overflow-hidden rounded-2xl border-4 border-foreground bg-foreground shadow-[0_8px_18px_-8px_rgba(0,0,0,0.3)] transition-[opacity,transform] delay-200 duration-500",
                        front ? "opacity-100" : "translate-y-4 opacity-0"
                      )}
                    >
                      <div className="relative aspect-[686/1400]">
                        <Image
                          src={phone}
                          alt=""
                          fill
                          sizes="120px"
                          draggable={false}
                          className="object-cover object-top"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            aria-live="polite"
            className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
          >
            <div className="min-w-0">
              <span className="inline-block rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                {p.label ?? "Featured"}
              </span>
              <h3 className="mt-2 text-xl font-medium tracking-[-0.015em] text-foreground">
                {p.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.summary ?? p.description}
              </p>
            </div>
            {headline && (
              <div className="sm:text-right">
                <span className="block font-mono text-[26px] leading-tight tracking-[-0.03em] text-foreground [font-variant-numeric:tabular-nums]">
                  {headline.metric}
                </span>
                <span className="text-xs text-muted-foreground">
                  {headline.label}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {hasCaseStudy(p) && (
                <Link
                  href={`/work/${p.id}`}
                  className="inline-flex h-9 items-center rounded-lg bg-foreground px-3 text-[13px] font-medium text-background hover:opacity-85"
                >
                  Case study
                </Link>
              )}
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-medium text-foreground hover:bg-muted"
                >
                  {p.liveAuthGated ? "Production (login) ↗" : "Live site ↗"}
                </a>
              )}
              {!p.liveUrl && p.repoUrls?.[0] && (
                <a
                  href={p.repoUrls[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-medium text-foreground hover:bg-muted"
                >
                  Source ↗
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="mr-1.5 hidden gap-1.5 sm:flex">
                {shown.map((project, index) => (
                  <button
                    key={project.id}
                    type="button"
                    aria-label={`Show ${project.title}`}
                    aria-current={index === current}
                    onClick={() => go(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === current ? "w-[18px] bg-foreground" : "w-1.5 bg-border"
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Previous project"
                onClick={() => go(current - 1)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-[56px] text-center font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <button
                type="button"
                aria-label="Next project"
                onClick={() => go(current + 1)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((project) => {
            const image = cover(project);
            const metric = project.impact?.[0];
            const href = hasCaseStudy(project) ? `/work/${project.id}` : project.liveUrl ?? "#";
            return (
              <Link
                key={project.id}
                href={href}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:-translate-y-0.5 hover:border-muted-foreground"
              >
                <div className="relative aspect-[16/8] border-b border-border bg-background">
                  {image ? (
                    <Image
                      src={image}
                      alt={`${project.title} screenshot`}
                      fill
                      sizes="(min-width: 640px) 360px, 90vw"
                      className="object-cover object-top grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                    />
                  ) : (
                    <TerminalCover p={project} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="self-start rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {project.label ?? "Featured"}
                  </span>
                  <h3 className="text-base font-medium text-foreground">{project.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {project.summary ?? project.description}
                  </p>
                  {metric && (
                    <p className="mt-auto flex items-baseline justify-between gap-2 border-t border-dashed border-border pt-3">
                      <span className="font-mono text-lg text-foreground">{metric.metric}</span>
                      <span className="text-right text-xs text-muted-foreground">{metric.label} →</span>
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
