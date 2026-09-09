"use client";

import { useState, useEffect, useRef } from "react";

export const PRELOAD_IMAGES = [
  "/icon.png",
  "/cutouts/sunglasses.png",
  "/cutouts/guitar.png",
  "/cutouts/gamepad.png",
  "/cutouts/sunglasses2.png",
];

export function useAssetPreloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const totalImages = PRELOAD_IMAGES.length;
    let loadedCount = 0;
    let assetsDone = false;

    // Track real image decoding
    const handleOneLoaded = () => {
      loadedCount += 1;
      if (loadedCount >= totalImages) {
        assetsDone = true;
      }
    };

    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = handleOneLoaded;
      img.onerror = handleOneLoaded;
      img.src = src;
      // If already cached by browser
      if (img.complete) {
        handleOneLoaded();
      }
    });

    // Also check fonts
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.catch(() => {}).finally(() => {
        // fonts ready
      });
    }

    // Smooth progress animation over ~2.2s for steady, enjoyable liquid filling
    const startTime = performance.now();
    const duration = 2200; // 2.2 seconds animation duration
    let rafId: number;

    const update = (now: number) => {
      if (!isMountedRef.current) return;

      const elapsed = now - startTime;
      const progressFraction = Math.min(elapsed / duration, 1);

      // Smooth ease-in-out quadratic: gentle start, steady middle, graceful arrival at 100%
      const eased =
        progressFraction < 0.5
          ? 2 * progressFraction * progressFraction
          : 1 - Math.pow(-2 * progressFraction + 2, 2) / 2;

      const currentPct = Math.min(Math.round(eased * 100), 100);

      setProgress(currentPct);

      if (currentPct < 100) {
        rafId = requestAnimationFrame(update);
      } else {
        // Reached 100% — hold briefly for visual payoff, then complete
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsComplete(true);
          }
        }, 260);
      }
    };

    rafId = requestAnimationFrame(update);

    return () => {
      isMountedRef.current = false;
      cancelAnimationFrame(rafId);
    };
  }, []); // Run once on mount

  return {
    progress,
    isComplete,
  };
}
