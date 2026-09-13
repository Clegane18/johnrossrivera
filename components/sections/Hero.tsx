"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Code2, Mail, type LucideIcon } from "lucide-react";
import { HeroMetrics } from "@/components/ui/HeroMetrics";
import { siteConfig } from "@/config/site";

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const [outlinedName, filledName = ""] = siteConfig.name.split(" ");

type SocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  external: boolean;
};

const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: siteConfig.social.github,
    icon: Code2,
    external: true,
  },
  {
    label: "LinkedIn",
    href: siteConfig.social.linkedin,
    icon: BriefcaseBusiness,
    external: true,
  },
  {
    label: "Email",
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    external: false,
  },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-background px-4 pb-14 pt-24 sm:px-6 md:pt-28"
    >
      <div className="border-border/70 bg-card/30 mx-auto w-full max-w-7xl rounded-3xl border px-4 pb-8 pt-8 shadow-sm sm:px-6 md:pb-0 md:pt-10 lg:px-8">
        <div className="hero-stage relative isolate">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothEase }}
            aria-label={siteConfig.name}
            className="hero-name-size pointer-events-none absolute inset-x-0 top-0 z-10 select-none text-center font-hero font-black uppercase"
          >
            <span className="text-outline">{outlinedName}</span>
            {/* The gap scales with the type. ml-4 is a flat 16px, which reads as a word space at
                the 48px mobile size and closes to nothing at 198px — at 1024 and up the two words
                ran together as "JOHNROSS". An em is the same optical gap at every size. */}
            {filledName && (
              <span className="ml-[0.12em] text-foreground">{filledName}</span>
            )}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.12, ease: smoothEase }}
            className="hero-portrait-slot pointer-events-none relative z-20 flex justify-center pb-4 md:pb-0 lg:absolute lg:inset-x-0 lg:bottom-0"
          >
            {/* Two portraits, not one swapped via useTheme(). The theme-init script in
                app/layout.tsx already resolves light/dark and sets the `dark` class on <html>
                BEFORE this paints, so a plain CSS rule (.hero-portrait-light/-dark below) can
                pick the right one with zero extra JS and no post-hydration repaint.

                Neither carries `priority`: eager-loading both would defeat the point (both would
                fetch regardless of which is hidden). Left at the default `loading="lazy"`, the
                hidden one has no layout box, so browsers never consider it near-viewport and never
                fetch it — only the one the CSS rule actually shows loads, for either theme. */}
            <Image
              src={siteConfig.about.lightImageUrl}
              alt={siteConfig.about.imageAlt}
              width={448}
              height={557}
              sizes="(max-width: 639px) 240px, (max-width: 767px) 280px, (max-width: 1023px) 260px, (max-width: 1279px) 320px, 460px"
              className="hero-portrait-size hero-portrait-light h-auto object-contain"
            />
            <Image
              src={siteConfig.about.darkImageUrl}
              alt={siteConfig.about.imageAlt}
              width={448}
              height={557}
              sizes="(max-width: 639px) 240px, (max-width: 767px) 280px, (max-width: 1023px) 260px, (max-width: 1279px) 320px, 460px"
              className="hero-portrait-size hero-portrait-dark h-auto object-contain"
            />
          </motion.div>

          {/* Stacked until lg, NOT md. NOTE `lg` is 1280px here, not Tailwind's default 1024 — see
              tailwind.config.ts. So the band to watch is 768px–1279px, which is every tablet and a
              good many laptops. This was once a three-across row there while the absolute
              bottom-anchored layout had not yet engaged, so all three blocks competed for one flow
              row; flex items shrink by default and the metrics block is w-full, so the role card
              collapsed to ~150px and its heading broke onto three lines. Stacking fixed that but
              stacked them UNDER a full-width portrait, which pushed the whole column off a 768px-tall
              screen — so .hero-content-col in globals.css now takes the left half of the band and
              the portrait takes the right. shrink-0 below keeps the card and the socials at their
              intended widths once the row DOES engage at 1280. */}
          <div className="hero-content-col relative z-30 flex flex-col gap-4 sm:gap-6 lg:absolute lg:inset-x-0 lg:bottom-8 lg:flex-row lg:items-end lg:justify-between xl:bottom-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: smoothEase }}
              className="bg-card/95 w-full shrink-0 rounded-2xl border border-border p-5 shadow-sm sm:max-w-xs sm:p-6 lg:w-80 lg:max-w-none"
            >
              <p className="mb-1 font-display text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                {siteConfig.role}
              </p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:mb-5">
                {siteConfig.heroDescription}
              </p>
              <div className="flex flex-col gap-2.5">
                <Link
                  href={siteConfig.heroPrimaryCta.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {siteConfig.heroPrimaryCta.label}
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
                {/* A plain <a>, not next/link. The resume is a static file in public/, not an app
                    route — next/link treats it as one and RSC-prefetches it, which requests
                    /john-ross-rivera-resume.pdf?_rsc=... and 404s in production. */}
                <a
                  href={siteConfig.heroSecondaryCta.href}
                  download="John-Ross-Rivera-Resume.pdf"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {siteConfig.heroSecondaryCta.label}
                </a>
              </div>

              {/* Availability and location as a quiet metadata line, NOT a status pill. A rounded
                  chip with a pulsing green dot is the same tell the navbar label already rejected
                  (see the comment in components/layout/Navbar.tsx): it performs "live status"
                  while indicating nothing, and it is the single element of a portfolio hero that
                  reads as generated rather than written. Plain small type in the card's own muted
                  colour states the same two facts and asks for no credit for doing so.

                  It belongs here rather than only in the navbar because that label is
                  `hidden lg:flex` at a 1280px lg, so a recruiter on a phone or an iPad currently
                  sees no availability anywhere in the fold. Both values read from config, so the
                  two places can no longer disagree. */}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {/* The availability half is lg:hidden because the navbar states it from lg up, and
                    the two sit one screen apart: rendering both put the same six words on the fold
                    twice, which reads as a template filling a slot. Below lg the navbar label is
                    itself hidden, so here is the only place either fact appears. The result is
                    exactly one copy of each at every width. */}
                <span className="lg:hidden">{siteConfig.availability} · </span>
                {siteConfig.about.location}
              </p>
            </motion.div>

            {/* Proof strip: the numbers a recruiter scans for, each linked to the work behind it. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25, ease: smoothEase }}
              className="w-full"
            >
              {/* The stack as capsules, in the same family as the GitHub/LinkedIn/Email buttons in
                  the right column: same rounded-full, same border, same bg-card, same shadow-sm.
                  Three earlier attempts failed for one reason each and all are worth not repeating.

                  As pills INSIDE the metrics card they carried bg-card/95, and an alpha modifier on
                  this project's colour tokens compiles to NO CSS at all (tailwind.config.ts maps
                  them to var(--card), and globals.css defines that as a hex, which Tailwind cannot
                  add an alpha to). So they had no background whatever and the portrait showed
                  straight through them. bg-card, solid, is the class that actually renders.

                  As a bare text band they read as raw text rather than content. Capsules give the
                  eye a shape to count, which is what a stack list is for.

                  No icons: skillIconMap in Skills.tsx maps React and Next.js both to Layers, and
                  MySQL and Prisma both to Database, so a row of these would show the same glyph
                  twice in a row. Text-only keeps them honest.

                  ABOVE the proof strip rather than below it, but NOT because below overflows: at
                  lg this whole column is absolutely positioned at bottom-8, so its bottom edge is
                  pinned and the order of the two children cannot change where the block ends. At
                  1440x900 both arrangements sit entirely inside the fold and the choice is free.

                  It only matters on a short viewport. At 1280x800 the pinned bottom lands at 821px
                  against an 800px fold, so 21px is clipped from whichever child is LAST, and the
                  two are not equally cheap to clip. Losing 21px off the metrics card takes its
                  bottom padding and leaves every number and label legible; losing 21px off a 37px
                  capsule row cuts the capsules in half. So the strip that survives clipping goes
                  last, and the stack goes on top.

                  Not in the right-hand column either, which was the other candidate and has the
                  room for it (that column is 178px tall in a stage that allows 443px). Stacked
                  under GitHub/LinkedIn/Email it produced nine identical capsules in one rail, three
                  of them links and six of them inert labels, with nothing to tell them apart. A
                  visitor trying to click "TypeScript" is a worse outcome than an unused 190px. */}
              <ul
                aria-label="Primary stack"
                className="mb-3 flex flex-wrap gap-2"
              >
                {siteConfig.heroStack.map((tech) => (
                  <li
                    key={tech}
                    className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] font-medium text-foreground shadow-sm"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
              <HeroMetrics />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: smoothEase }}
              className="bg-card/95 w-fit shrink-0 rounded-2xl border border-border p-3 shadow-sm"
            >
              <div className="hero-social-row flex flex-row flex-wrap gap-2 md:flex-col md:gap-2.5">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex min-h-11 items-center gap-2.5 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-shadow duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
