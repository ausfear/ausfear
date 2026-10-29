"use client";

import { useEffect } from "react";

// Shared across callers so the preloader and the mobile menu can't unlock each other
let lockCount = 0;

/**
 * Locks page scrolling while `locked` is true.
 * Targets <html>: globals.css gives it `overflow-x: hidden`, which makes <html>
 * (not <body>) the scroll container, so locking <body> alone has no effect.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    document.documentElement.style.overflow = "hidden";
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.documentElement.style.overflow = "";
    };
  }, [locked]);
}
