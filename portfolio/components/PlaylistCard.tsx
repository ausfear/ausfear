"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { Play, Pause, ArrowUpRight } from "lucide-react";
import { useAudioPlayer, useReportOnScreen, formatTime, type Track } from "./AudioPlayer";
import FrequencyBars from "./FrequencyBars";

export type PlaylistData = {
  id: string;
  label: string;
  title: string;
  curator: string;
  url: string;
  trackCount: number;
  cover: string | null;
  tracks: Track[];
};

function TrackRow({ track, index }: { track: Track; index: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { current, isPlaying, toggle, remaining } = useAudioPlayer();
  const isCurrent = current?.id === track.id;
  const playing = isCurrent && isPlaying;
  const remainingText = useTransform(remaining, formatTime);
  useReportOnScreen(ref, track.id);

  return (
    <li>
      <button
        ref={ref}
        type="button"
        data-song-card={track.id}
        data-song-source={track.source}
        onClick={() => toggle(track)}
        aria-label={playing ? `Pause ${track.title}` : `Play preview of ${track.title}`}
        className={`group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors ${
          isCurrent ? "bg-[var(--color-pop)]/10" : "hover:bg-[var(--color-hover)]"
        }`}
      >
        {/* Track number; becomes live bars while playing, a play icon on hover */}
        <span className="w-5 h-4 shrink-0 flex items-center justify-center text-xs tabular-nums text-[var(--color-text-faint)]">
          {playing ? (
            <FrequencyBars active bars={4} className="w-5 h-4" />
          ) : isCurrent ? (
            <Play size={12} fill="currentColor" className="text-[var(--color-pop)]" />
          ) : (
            <>
              <span className="group-hover:hidden">{index + 1}</span>
              <Play size={12} fill="currentColor" className="hidden group-hover:block text-[var(--color-pop)]" />
            </>
          )}
        </span>
        <Image
          src={track.artwork}
          alt=""
          width={40}
          height={40}
          unoptimized
          loading="lazy"
          className="w-10 h-10 rounded-md object-cover shrink-0"
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm leading-snug truncate ${
              isCurrent ? "text-[var(--color-pop)] font-medium" : "text-[var(--color-text)]"
            }`}
          >
            {track.title}
          </span>
          <span className="block text-xs text-[var(--color-text-muted)] truncate">{track.artist}</span>
        </span>
        {/* Keyed apart: a span that once rendered a MotionValue keeps following it */}
        {isCurrent ? (
          <motion.span key="live" className="w-8 shrink-0 text-right text-[11px] tabular-nums text-[var(--color-text-faint)]">
            {remainingText}
          </motion.span>
        ) : (
          <span key="idle" className="w-8 shrink-0 text-right text-[11px] tabular-nums text-[var(--color-text-faint)]">
            0:30
          </span>
        )}
      </button>
    </li>
  );
}

/** A playlist from the music carousel: cover and details, a playable short list, and a link to the rest. */
export default function PlaylistCard({ playlist }: { playlist: PlaylistData }) {
  const { current, isPlaying, toggle, play } = useAudioPlayer();
  const playingHere = !!current && current.source === playlist.id;
  const more = playlist.trackCount - playlist.tracks.length;

  // Header button: pause/resume this playlist's song, otherwise start from the top
  const onPlayButton = () => {
    if (playingHere && current) toggle(current);
    else if (playlist.tracks[0]) play(playlist.tracks[0]);
  };

  return (
    // Tall enough for all 8 rows plus the "+N more" footer on both layouts. On phones the header has a
    // fixed shape (cover + one-line text, buttons on their own row) so its height doesn't change with width.
    <div className="h-[680px] sm:h-[530px] flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Details */}
      <div className="shrink-0 grid grid-cols-[80px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 p-4 sm:flex sm:flex-col sm:items-stretch sm:gap-4 sm:p-5 sm:w-[236px] border-b sm:border-b-0 sm:border-r border-[var(--color-border)]">
        {playlist.cover && (
          <Image
            src={playlist.cover}
            alt=""
            width={196}
            height={196}
            unoptimized
            loading="lazy"
            className="w-20 h-20 sm:w-full sm:h-auto aspect-square rounded-xl object-cover shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-syne)] font-bold text-lg sm:text-xl leading-tight text-[var(--color-text)] line-clamp-1 sm:line-clamp-2">
            {playlist.title}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)] truncate sm:whitespace-normal">
            Playlist by {playlist.curator} · {playlist.trackCount} songs
          </p>
        </div>
        {/* Fixed-width Play/Pause and no wrapping: "Pause" is wider than "Play", and in the 196px desktop
            column that extra width used to push "Full playlist" onto two lines */}
        <div className="col-span-2 sm:mt-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onPlayButton}
            // Transparent border so it's exactly as tall as the outlined "Full playlist" next to it
            className="inline-flex w-[80px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-transparent bg-[var(--color-pop)] py-1.5 text-xs font-medium text-white hover:brightness-110 active:scale-95 transition"
          >
            {playingHere && isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            {playingHere && isPlaying ? "Pause" : "Play"}
          </button>
          <a
            href={playlist.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-pop)] hover:border-[var(--color-pop)] transition-colors"
          >
            Full playlist
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>

      {/* Short, playable track list */}
      <div className="min-h-0 flex-1 flex flex-col">
        <ol className="min-h-0 flex-1 overflow-y-auto p-2 space-y-0.5" aria-label={`Songs from ${playlist.title}`}>
          {playlist.tracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} />
          ))}
        </ol>
        {more > 0 && (
          <a
            href={playlist.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center justify-between gap-2 px-5 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-pop)] transition-colors"
          >
            <span>
              +{more} more {more === 1 ? "song" : "songs"} on Apple Music
            </span>
            <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
