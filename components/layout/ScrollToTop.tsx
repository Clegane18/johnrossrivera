"use client";

import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export function ScrollToTop() {
  const { isVisible, scrollToTop } = useScrollPosition(0.3);
  // Hidden while the chat is open: its panel ends where this button sits, so the button would
  // cover the chat's Send button. ChatWidget announces open/close with this event.
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    function onChat(event: Event) {
      setChatOpen(Boolean((event as CustomEvent<boolean>).detail));
    }
    window.addEventListener("nuggets:open", onChat);
    return () => window.removeEventListener("nuggets:open", onChat);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && !chatOpen && (
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
            //
            // Stacked above the chat launcher, not beside it: the launcher became a labelled
            // ~190px button, and the old right-24 slot landed on top of it. Styled like the rail's
            // controls so the two floating buttons read as one set.
            "fixed bottom-24 right-6 z-[60] hidden h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-colors duration-200 lg:bottom-[84px] lg:flex",
            "hover:border-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
