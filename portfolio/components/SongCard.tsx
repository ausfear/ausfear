"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { Play, Pause, ArrowUpRight } from "lucide-react";
import { useAudioPlayer, useReportOnScreen, formatTime, type Track } from "./AudioPlayer";
import FrequencyBars from "./FrequencyBars";

/** A song from the music section: cover, title, 30-second preview with live frequency bars. */
export default function SongCard({ track }: { track: Track }) {
  const ref = useRef<HTMLDivElement>(null);
  const { current, isPlaying, failedId, toggle, progress, remaining } = useAudioPlayer();
  const isCurrent = current?.id === track.id;
  const playing = isCurrent && isPlaying;
  const failed = failedId === track.id;
  const remainingText = useTransform(remaining, formatTime);
  // Tell the player when this card is in view, so the floating mini player can step aside
  useReportOnScreen(ref, track.id);

  return (
    <div
      ref={ref}
      data-song-card={track.id}
      data-song-source={track.source}
      className={`relative rounded-xl border bg-[var(--color-surface)] p-3.5 transition-[border-color,box-shadow] duration-500 ${
        isCurrent
          ? "border-[var(--color-pop)]/50 shadow-[0_0_32px_rgba(255,107,43,0.18)]"
          : "border-[var(--color-border)] shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <Image
          src={track.artwork}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="w-16 h-16 rounded-lg object-cover shrink-0"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-[family-name:var(--font-syne)] font-semibold text-sm leading-snug text-[var(--color-text)] line-clamp-2">
            {track.title}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)] truncate" title={track.artist}>
            {track.artist}
          </p>
        </div>
        <a
          href={track.appleMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${track.title} on Apple Music`}
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-md text-[var(--color-text-faint)] hover:text-[var(--color-pop)] transition-colors"
        >
          <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => toggle(track)}
          aria-label={playing ? `Pause ${track.title}` : `Play preview of ${track.title}`}
          className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-pop)] text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition"
        >
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>
        <FrequencyBars active={playing} className="h-7 flex-1 min-w-0" />
        {/* Separate elements (by key): a span that once rendered a MotionValue keeps following it,
            so reusing it would show another song's countdown on this card */}
        {isCurrent ? (
          <motion.span key="live" className="w-8 text-right text-[11px] tabular-nums text-[var(--color-text-faint)]">
            {remainingText}
          </motion.span>
        ) : (
          <span key="idle" className="w-8 text-right text-[11px] tabular-nums text-[var(--color-text-faint)]">
            0:30
          </span>
        )}
      </div>

      <div className="mt-3 h-[2px] rounded-full bg-[var(--color-border)] overflow-hidden">
        <motion.div
          className="h-full origin-left bg-[var(--color-pop)]"
          style={{ scaleX: isCurrent ? progress : 0 }}
        />
      </div>

      {failed && (
        <p className="mt-2 text-[11px] text-[var(--color-text-faint)]">
          Preview unavailable.{" "}
          <a href={track.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-pop)]">
            Listen on Apple Music
          </a>
        </p>
      )}
    </div>
  );
}
