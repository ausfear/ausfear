"use client";

import { useEffect, useSyncExternalStore } from "react";
import { hasSavedTheme, readTheme, setTheme, type Theme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/**
 * Current theme, kept in sync with <html data-theme>. The server (and hydration pass) sees "light";
 * React then re-renders with the real value, so there's no hydration mismatch.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "light");
}

/** Follow OS light/dark changes until the visitor picks a theme with the toggle. Mount once. */
export function useSystemThemeSync() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!hasSavedTheme()) setTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
}
