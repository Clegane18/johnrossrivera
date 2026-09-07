"use client";

import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export function ScrollToTop() {
  const { isVisible, scrollToTop } = useScrollPosition(0.3);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-to-top"
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            // Desktop only. Below lg this sat at right-24 — a second floating circle beside the
            // chat avatar, the pair of them parked over whatever body text happened to be at that
            // scroll offset (on the contact section, over the Email field). The dock's first chip
            // is "About", which is the top of the page, so the mobile affordance already exists in
            // the thumb zone and did not need a duplicate laid over the content.
            "fixed bottom-24 right-24 z-[60] hidden h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-lg transition-colors duration-200 lg:bottom-[30px] lg:flex dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
            "hover:bg-zinc-100 dark:hover:bg-zinc-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
