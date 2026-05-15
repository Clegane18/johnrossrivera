"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export function ScrollToTop() {
  const { isVisible, scrollToTop } = useScrollPosition(0.3);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setIsChatOpen((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener("nuggets:open", handler);
    return () => window.removeEventListener("nuggets:open", handler);
  }, []);

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
            "fixed bottom-[30px] right-24 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-lg transition-colors duration-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
            "hover:bg-zinc-100 dark:hover:bg-zinc-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isChatOpen && "max-md:hidden"
          )}
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
