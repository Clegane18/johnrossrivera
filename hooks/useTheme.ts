"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "portfolio-theme";
const THEME_CHANGE_EVENT = "portfolio-theme-change";

type Theme = "light" | "dark";

/** Where the circular reveal starts — the coordinates of the toggle that was clicked. */
export type ThemeToggleOrigin = { x: number; y: number };

// The View Transitions API is not in this TypeScript version's DOM lib. Declared narrowly here
// rather than reaching for `any`, which CLAUDE.md forbids.
type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

const REVEAL_MS = 420;
// Decelerating curve, not ease-in-out. The circle starts at full speed and settles — ease-in-out
// ramps UP from zero, which at this size reads as the animation hesitating before it commits.
const REVEAL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    } else {
      setTheme(getSystemTheme());
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    function handleThemeChange(event: Event) {
      const customEvent = event as CustomEvent<Theme>;
      const nextTheme = customEvent.detail;

      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme(nextTheme);
      }
    }

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, isReady]);

  const updateTheme = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
    window.dispatchEvent(
      new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: nextTheme })
    );
  }, []);

  // `origin` is optional on purpose: both Navbar call sites (desktop and mobile) keep compiling
  // while they are updated, and any caller that cannot supply coordinates still gets a working
  // theme switch — just without the reveal.
  const toggleTheme = useCallback(
    (origin?: ThemeToggleOrigin) => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      const doc = document as DocumentWithViewTransition;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // THE THEME MUST CHANGE REGARDLESS. The animation is decoration layered on top; if the API is
      // missing, motion is reduced, or no origin was passed, fall straight through to the plain
      // update. A decorative enhancement must never be the only path to the actual behaviour.
      if (!doc.startViewTransition || prefersReducedMotion || !origin) {
        updateTheme(nextTheme);
        return;
      }

      // Freeze CSS transitions for the duration. Without this the site's ~37 `transition-colors`
      // elements cross-fade their colours underneath the expanding circle, so you see two
      // animations fighting — the "glitch mid-way". Added BEFORE the snapshot so the frozen state
      // is what gets captured.
      const root = document.documentElement;
      root.classList.add("theme-switching");

      const transition = doc.startViewTransition(() => updateTheme(nextTheme));

      // Always unfreeze, even if the animation is interrupted — leaving the class on would kill
      // every hover transition on the site for the rest of the session.
      void transition.finished.finally(() => {
        root.classList.remove("theme-switching");
      });

      void transition.ready.then(() => {
        // Radius to the farthest corner, so the circle always covers the viewport.
        const radius = Math.hypot(
          Math.max(origin.x, window.innerWidth - origin.x),
          Math.max(origin.y, window.innerHeight - origin.y)
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${origin.x}px ${origin.y}px)`,
              `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
            ],
          },
          {
            duration: REVEAL_MS,
            easing: REVEAL_EASING,
            // Animate the INCOMING snapshot only — the outgoing one stays put underneath, which is
            // what produces a reveal rather than a cross-fade.
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    },
    [theme, updateTheme]
  );

  return { theme, setTheme: updateTheme, toggleTheme, isReady };
}
