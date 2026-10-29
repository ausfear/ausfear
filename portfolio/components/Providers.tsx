"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/* Intro state — flips to true once the preloader starts its exit,
   so above-the-fold entrance animations play when they're actually visible. */
const IntroContext = createContext<{ ready: boolean; markReady: () => void }>({
  ready: true,
  markReady: () => {},
});

export function useIntroReady() {
  return useContext(IntroContext).ready;
}

export function useMarkIntroReady() {
  return useContext(IntroContext).markReady;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  return (
    <IntroContext.Provider value={{ ready, markReady }}>
      {/* Respect the OS "reduce motion" setting for every framer-motion animation */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </IntroContext.Provider>
  );
}
