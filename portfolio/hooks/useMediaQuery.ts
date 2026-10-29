"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Hydration-safe media query. The server (and the hydration pass) always sees
 * `false`, then React re-renders with the real value — no mismatch warnings.
 * Use CSS breakpoints for layout; reach for this only when JS values must differ.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
