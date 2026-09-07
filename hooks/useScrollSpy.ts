"use client";

import { useEffect, useState } from "react";

export function useScrollSpy(sectionIds: string[], offset = 80): string {
  // Starts empty, not at sectionIds[0].
  //
  // Seeding it with "about" meant the nav and the dock both painted About as the current section on
  // every /work/* case study, where not one of these sections exists — telling a reader they were
  // somewhere they had already left. Nothing is highlighted until a section is actually under the
  // scroll line, and on the home page the first pass of the effect sets it before paint anyway.
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    // The activation line is read from scroll-padding-top, not assumed.
    //
    // Two numbers decide where a section "starts": the CSS scroll-padding-top that an anchor jump
    // lands against, and this offset. They have to agree, and as separate constants they silently
    // did not — scroll-padding-top is 6rem (96px) and this defaulted to 80, so a nav click landed
    // at exactly `offsetTop - 96`, which is 16px short of the `offsetTop - 80` this needed to flip
    // the highlight. Clicking Skills scrolled to Skills and left About lit, and no amount of
    // reading either file alone would show it. Deriving one from the other means the pair cannot
    // drift again: change the CSS and the spy follows.
    //
    // The +1 absorbs sub-pixel rounding in the landing position. The `offset` argument stays as the
    // fallback for a document that sets no scroll-padding.
    const activationOffset = () => {
      const padding = Number.parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop
      );
      return Number.isFinite(padding) ? padding + 1 : offset;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY + activationOffset();
      for (const id of [...sectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          setActive(id);
          return;
        }
      }
      setActive("");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionIds, offset]);

  return active;
}
