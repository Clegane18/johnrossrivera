"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "portfolio-theme";
const THEME_CHANGE_EVENT = "portfolio-theme-change";

type Theme = "light" | "dark";

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

  const toggleTheme = useCallback(() => {
    updateTheme(theme === "dark" ? "light" : "dark");
  }, [theme, updateTheme]);

  return { theme, setTheme: updateTheme, toggleTheme, isReady };
}
