export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "ausfear:theme";

/**
 * Inlined in <head> so the right theme is on <html> before the first paint (no white flash).
 * A saved choice wins; otherwise follow the OS setting.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function hasSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark";
  } catch {
    return false;
  }
}

/** Switch theme. With `animate`, wipes the new theme in behind an orange scanline (see globals.css). */
export function setTheme(next: Theme, { animate = false, persist = false } = {}) {
  const root = document.documentElement;
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable; the choice then lasts until reload
    }
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animate || reduceMotion || !document.startViewTransition) {
    root.dataset.theme = next;
    return;
  }

  // The scanline is added inside the update so it only exists in the "new" snapshot,
  // where its own view-transition group animates it up the screen
  const scanline = document.createElement("div");
  scanline.className = "theme-scanline";
  scanline.setAttribute("aria-hidden", "true");
  const transition = document.startViewTransition(() => {
    root.dataset.theme = next;
    document.body.appendChild(scanline);
  });
  transition.finished.finally(() => scanline.remove());
}
