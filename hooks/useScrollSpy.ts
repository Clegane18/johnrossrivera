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
    const handleScroll = () => {
      const scrollY = window.scrollY + offset;
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
