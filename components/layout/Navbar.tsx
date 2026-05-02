"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { siteConfig } from "@/config/site";
import { useMobileMenu } from "@/hooks/useMobileMenu";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils/cn";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { motion } from "framer-motion";
import { Moon, Sun, X } from "lucide-react";
import Link from "next/link";

const sectionIds = siteConfig.nav.map((item) => item.href.replace("#", ""));

const navItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.35,
      ease: "easeOut" as const,
    },
  }),
};

export function Navbar() {
  const { isOpen, open, close } = useMobileMenu();
  const activeSection = useScrollSpy(sectionIds);
  const { theme, toggleTheme, isReady } = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-background/90 fixed inset-x-0 top-0 z-50 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="availability-dot relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-foreground">
            {siteConfig.navbar.availabilityText}
          </span>
        </div>

        <ul className="hidden items-center gap-1 md:flex">
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

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            <span className="hidden lg:inline">
              {isReady && theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>
          <Link
            href={siteConfig.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {siteConfig.navbar.resumeCtaLabel}
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-all duration-300 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

        {/* ── Mobile trigger ── */}
        <Dialog.Root open={isOpen} onOpenChange={(v) => (v ? open() : close())}>
          <Dialog.Trigger asChild>
            <button
              className="hover:border-foreground/40 relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
            >
              {/* Animated three-bar → X icon */}
              <span className="flex h-[14px] w-[18px] flex-col justify-between">
                <motion.span
                  className="block h-[1.5px] w-full rounded-full bg-current"
                  animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                />
                <motion.span
                  className="block h-[1.5px] rounded-full bg-current"
                  style={{ originX: 0 }}
                  animate={
                    isOpen
                      ? { scaleX: 0, opacity: 0 }
                      : { scaleX: 1, opacity: 1 }
                  }
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="block h-[1.5px] w-full rounded-full bg-current"
                  animate={
                    isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                />
              </span>
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[300px] max-w-[85vw] flex-col bg-card shadow-2xl outline-none data-[state=closed]:animate-slide-out data-[state=open]:animate-slide-in">
              {/* Panel header */}
              <div className="border-border/60 flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Navigation
                  </span>
                </div>
                <Dialog.Close asChild>
                  <button
                    aria-label="Close menu"
                    className="hover:border-foreground/40 flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Nav links */}
              <nav className="flex flex-1 flex-col justify-center overflow-y-auto px-5 py-2">
                <ul className="flex flex-col">
                  {siteConfig.nav.map((item, i) => (
                    <motion.li
                      key={item.href}
                      custom={i}
                      variants={navItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        className="border-border/40 group flex items-center justify-between border-b py-4 last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="text-muted-foreground/40 w-5 font-mono text-[10px]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-xl font-semibold text-foreground transition-all duration-200 group-hover:translate-x-0.5">
                            {item.label}
                          </span>
                        </div>
                        <svg
                          className="text-muted-foreground/30 h-3.5 w-3.5 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
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
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Panel footer */}
              <div className="border-border/60 flex flex-col gap-3 border-t px-5 py-5">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  {isReady && theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href={siteConfig.links.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    className="flex items-center justify-center rounded-full border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {siteConfig.navbar.resumeCtaLabel}
                  </Link>
                  <Link
                    href="#contact"
                    onClick={close}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {siteConfig.navbar.contactCtaLabel}
                    <svg
                      className="h-3 w-3"
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
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </motion.header>
  );
}
