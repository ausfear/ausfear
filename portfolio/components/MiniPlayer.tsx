"use client";

import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, Pause, X } from "lucide-react";
import { useAudioPlayer } from "./AudioPlayer";
import FrequencyBars from "./FrequencyBars";

/**
 * Floating "now playing" pill. Shows while a song is loaded but its card is off screen,
 * so it can be paused or stopped from anywhere on the page.
 */
export default function MiniPlayer() {
  const { current, isPlaying, toggle, stop, progress, currentOnScreen } = useAudioPlayer();
  const reduceMotion = useReducedMotion();
  const visible = !!current && !currentOnScreen;

  const jumpToCard = () => {
    if (!current) return;
    // Prefer the spot it was played from; the same song may also appear elsewhere
    const target =
      document.querySelector(`[data-song-card="${current.id}"][data-song-source="${current.source}"]`) ??
      document.querySelector(`[data-song-card="${current.id}"]`);
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  };

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          key="mini-player"
          role="region"
          aria-label="Now playing"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          // Below the navbar and mobile menu (z-40/50); full width on phones, a corner pill from sm up
          className="fixed z-30 left-3 right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:bottom-6 sm:w-[340px] overflow-hidden rounded-2xl border border-[var(--nav-border-scrolled)] bg-[var(--nav-bg-scrolled)] backdrop-blur-xl backdrop-saturate-200 shadow-[0_10px_40px_rgba(0,0,0,0.18)]"
        >
          <div className="flex items-center gap-3 p-2 pr-2.5">
            <button
              type="button"
              onClick={jumpToCard}
              aria-label={`Go to ${current.title}`}
              className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg"
            >
              <Image
                src={current.artwork}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-[var(--color-text)] truncate">{current.title}</span>
                <span className="block text-[11px] text-[var(--color-text-muted)] truncate">{current.artist}</span>
              </span>
            </button>

            <FrequencyBars active={isPlaying} bars={8} className="w-10 h-5 shrink-0" />

            <button
              type="button"
              onClick={() => toggle(current)}
              aria-label={isPlaying ? `Pause ${current.title}` : `Play ${current.title}`}
              className="shrink-0 w-9 h-9 rounded-full bg-[var(--color-pop)] text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition"
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label="Stop and close player"
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Preview progress along the bottom edge */}
          <motion.div
            aria-hidden="true"
            className="absolute left-0 right-0 bottom-0 h-[2px] origin-left bg-[var(--color-pop)]"
            style={{ scaleX: progress }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
