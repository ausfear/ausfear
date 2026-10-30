"use client";

import { useState, useEffect } from "react";
import heroPhotos from "@/data/hero-photos.generated.json";

// The logo plus every hero photo (generated list, so new photos are preloaded automatically)
export const PRELOAD_IMAGES = ["/icon.png", ...heroPhotos.map((p) => p.src)];

// Minimum on-screen time so the liquid fill still reads as an animation
const MIN_DURATION_FIRST_VISIT = 2200;
// Assets are already in the browser cache on repeat visits within a session
const MIN_DURATION_REPEAT_VISIT = 900;
// Never hold visitors hostage if an asset hangs
const MAX_WAIT = 8000;
// Progress the timer may reach on its own before real assets catch up
const TIME_PROGRESS_CAP = 0.9;
const SEEN_KEY = "ausfear:preloader-seen";

function hasSeenPreloader() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markPreloaderSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage may be unavailable (private mode, blocked cookies)
  }
}

export function useAssetPreloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;

    const totalTasks = PRELOAD_IMAGES.length + 1; // images + web fonts
    let doneTasks = 0;
    const markTaskDone = () => {
      doneTasks += 1;
    };

    // Real image loading + decoding (decode() resolves once, so cached images aren't double-counted)
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.decode().catch(() => {}).finally(markTaskDone);
    });

    // Web fonts (Syne / Inter) — the hero layout is measured against these
    document.fonts.ready.catch(() => {}).finally(markTaskDone);

    const minDuration = hasSeenPreloader() ? MIN_DURATION_REPEAT_VISIT : MIN_DURATION_FIRST_VISIT;
    const startTime = performance.now();
    let displayed = 0;

    const update = (now: number) => {
      if (cancelled) return;

      const elapsed = now - startTime;
      const timeFraction = Math.min(elapsed / minDuration, 1);

      // Smooth ease-in-out quadratic: gentle start, steady middle, graceful arrival
      const eased =
        timeFraction < 0.5
          ? 2 * timeFraction * timeFraction
          : 1 - Math.pow(-2 * timeFraction + 2, 2) / 2;

      const assetsDone = doneTasks >= totalTasks || elapsed >= MAX_WAIT;
      // Until every asset is ready the bar can't pass the cap — it waits for the real load
      const target = assetsDone ? eased : Math.min(eased, TIME_PROGRESS_CAP);
      // Ease toward the target so a late asset finish glides from 90% instead of jumping
      displayed += (target - displayed) * 0.2;
      if (target - displayed < 0.005) displayed = target;
      const currentPct = Math.round(displayed * 100);

      setProgress(currentPct);

      if (currentPct < 100) {
        rafId = requestAnimationFrame(update);
      } else {
        markPreloaderSeen();
        // Reached 100% — hold briefly for visual payoff, then complete
        holdTimer = setTimeout(() => {
          if (!cancelled) setIsComplete(true);
        }, 260);
      }
    };

    rafId = requestAnimationFrame(update);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(holdTimer);
    };
  }, []);

  return {
    progress,
    isComplete,
  };
}
