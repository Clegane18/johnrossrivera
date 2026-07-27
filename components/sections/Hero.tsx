"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Code2, Mail, type LucideIcon } from "lucide-react";
import { HeroMetrics } from "@/components/ui/HeroMetrics";
import { siteConfig } from "@/config/site";
import { useTheme } from "@/hooks/useTheme";

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
  const { theme, isReady } = useTheme();

  const profileImageUrl =
    isReady && theme === "dark"
      ? siteConfig.about.darkImageUrl
      : siteConfig.about.lightImageUrl;

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
            {filledName && (
              <span className="ml-4 text-foreground">{filledName}</span>
            )}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.12, ease: smoothEase }}
            className="pointer-events-none relative z-20 flex justify-center pb-4 md:pb-0 lg:absolute lg:inset-x-0 lg:bottom-0"
          >
            <Image
              src={profileImageUrl}
              alt={siteConfig.about.imageAlt}
              width={448}
              height={557}
              priority
              sizes="(max-width: 639px) 240px, (max-width: 767px) 280px, (max-width: 1023px) 260px, (max-width: 1279px) 340px, 460px"
              className="hero-portrait-size block h-auto object-contain"
            />
          </motion.div>

          <div className="relative z-30 flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between lg:absolute lg:inset-x-0 lg:bottom-8 xl:bottom-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: smoothEase }}
              className="bg-card/95 w-full rounded-2xl border border-border p-5 shadow-sm sm:max-w-xs sm:p-6 md:w-80 lg:max-w-none"
            >
              <p className="mb-1 font-display text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                {siteConfig.role}
              </p>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:mb-6">
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
                <Link
                  href={siteConfig.heroSecondaryCta.href}
                  download="John-Ross-Rivera-Resume.pdf"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {siteConfig.heroSecondaryCta.label}
                </Link>
              </div>
            </motion.div>

            {/* Proof strip: the numbers a recruiter scans for, each linked to the work behind it. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25, ease: smoothEase }}
              className="w-full"
            >
              <HeroMetrics />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: smoothEase }}
              className="bg-card/95 w-fit rounded-2xl border border-border p-3 shadow-sm"
            >
              <div className="flex flex-row flex-wrap gap-2 md:flex-col md:gap-2.5">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-shadow duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
