"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { animate, useInView, useMotionValue, type MotionValue } from "framer-motion";

export type Track = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  /** 30-second iTunes preview (served with CORS, so Web Audio can analyse it) */
  src: string;
  appleMusicUrl: string;
  /** Where on the page it was played from (a song can appear in several places), for "jump to song" */
  source: string;
};

type AudioPlayerValue = {
  current: Track | null;
  isPlaying: boolean;
  failedId: string | null;
  /** Start a track, or resume it if it's already the current one */
  play: (track: Track) => void;
  pause: () => void;
  toggle: (track: Track) => void;
  /** Stop and forget the current track (hides the mini player) */
  stop: () => void;
  /** 0–1 through the preview */
  progress: MotionValue<number>;
  /** Seconds left in the preview */
  remaining: MotionValue<number>;
  /** 0–1 loudness, scaled to the range real songs move in (for glows) */
  energy: MotionValue<number>;
  /** 0–1 kick/beat pulse: how far the bass jumps above its recent average (for swells) */
  beat: MotionValue<number>;
  /** Latest frequency bins (0–255), refreshed every frame while playing */
  bins: RefObject<Uint8Array<ArrayBuffer> | null>;
  /** Song cards and rows report whether they're on screen (see useReportOnScreen) */
  reportOnScreen: (elementKey: string, trackId: string, onScreen: boolean) => void;
  /** True while any element showing the current song is on screen, so the mini player can step aside */
  currentOnScreen: boolean;
};

const AudioPlayerContext = createContext<AudioPlayerValue | null>(null);

export function useAudioPlayer() {
  const value = useContext(AudioPlayerContext);
  if (!value) throw new Error("useAudioPlayer must be used inside <AudioPlayerProvider>");
  return value;
}

// Bin ranges (fftSize 256 → 128 bins of ~172 Hz at 44.1 kHz)
const BASS_BINS: [number, number] = [1, 5];
const ENERGY_BINS: [number, number] = [1, 48];

/*
 * Calibrated on the actual previews (30 Oct 2026). With the analyser's default -100…-30 dB window,
 * loudly mastered tracks pin the bass at 0.91–1.0, so nothing visibly moves. With -85…-10 dB:
 * loudness sits around 0.35–0.50, and the bass jumps ~0.04–0.05 above its running average on a kick.
 */
const MIN_DB = -85;
const MAX_DB = -10;
const ENERGY_FLOOR = 0.25;
const ENERGY_SPAN = 0.3;
const BEAT_SPAN = 0.08;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function average(bins: Uint8Array, [from, to]: [number, number]) {
  let sum = 0;
  for (let i = from; i <= to; i++) sum += bins[i];
  return sum / ((to - from + 1) * 255);
}

/** Fast attack, slow release: visuals jump on a beat and settle gently */
const follow = (prev: number, target: number) => prev + (target - prev) * (target > prev ? 0.55 : 0.12);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const bins = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [failedId, setFailedId] = useState<string | null>(null);
  // elementKey → trackId for every song element currently on screen. Keyed per element, not per song:
  // the same song can sit in the spiderweb and in a playlist at once.
  const [onScreen, setOnScreen] = useState<ReadonlyMap<string, string>>(new Map());

  const progress = useMotionValue(0);
  const remaining = useMotionValue(30);
  const energy = useMotionValue(0);
  const beat = useMotionValue(0);

  /** Created lazily on the first play, inside the click handler (browsers require a user gesture) */
  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    // Must be set before src, or the analyser only ever sees silence (CORS-tainted media)
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";

    // iOS Safari mutes Web Audio when the ring/silent switch is on; declaring "playback" (Safari 16.4+)
    // makes it behave like a music app. Other browsers don't have audioSession and skip this.
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio); // allowed once per element, hence one shared element
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    analyser.minDecibels = MIN_DB;
    analyser.maxDecibels = MAX_DB;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    // Listeners go on at creation (not in an effect) so the very first "play" event can't be missed.
    // They mirror the element's real state, which OS media keys can change too.
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      audio.currentTime = 0;
      progress.set(0);
    });
    audio.addEventListener("error", () => {
      if (!audio.getAttribute("src")) return; // stop() clears src on purpose
      setIsPlaying(false);
      setFailedId(audio.dataset.trackId ?? null);
    });

    audioRef.current = audio;
    contextRef.current = ctx;
    analyserRef.current = analyser;
    bins.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    return audio;
  }, [progress]);

  const play = useCallback(
    (track: Track) => {
      const audio = ensureAudio();
      void contextRef.current?.resume();
      if (audio.dataset.trackId !== track.id) {
        audio.dataset.trackId = track.id;
        audio.src = track.src;
        progress.set(0);
      }
      // Also when only the source changed (same song resumed from another spot on the page)
      setCurrent(track);
      setFailedId(null);
      audio.play().catch(() => {
        setIsPlaying(false);
        setFailedId(track.id);
      });
    },
    [ensureAudio, progress]
  );

  const pause = useCallback(() => audioRef.current?.pause(), []);

  const toggle = useCallback(
    (track: Track) => {
      const audio = audioRef.current;
      if (audio && audio.dataset.trackId === track.id && !audio.paused) audio.pause();
      else play(track);
    },
    [play]
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      delete audio.dataset.trackId;
      audio.load();
    }
    progress.set(0);
    setCurrent(null);
  }, [progress]);

  const reportOnScreen = useCallback((elementKey: string, trackId: string, visible: boolean) => {
    setOnScreen((prev) => {
      if (prev.has(elementKey) === visible) return prev;
      const next = new Map(prev);
      if (visible) next.set(elementKey, trackId);
      else next.delete(elementKey);
      return next;
    });
  }, []);

  const currentOnScreen = useMemo(
    () => (current ? [...onScreen.values()].includes(current.id) : false),
    [current, onScreen]
  );

  // One analysis loop for the whole site, only while something is playing
  useEffect(() => {
    if (!isPlaying) {
      // Let the visuals settle instead of freezing mid-beat
      animate(energy, 0, { duration: 0.6 });
      animate(beat, 0, { duration: 0.6 });
      return;
    }
    let raf = 0;
    let loud = 0;
    let fastBass = 0;
    // Running bass average; seeded from the first frame so a song's start doesn't read as a huge beat
    let slowBass: number | null = null;
    const tick = () => {
      const audio = audioRef.current;
      const analyser = analyserRef.current;
      if (audio && analyser && bins.current) {
        analyser.getByteFrequencyData(bins.current);
        const bass = average(bins.current, BASS_BINS);
        fastBass = follow(fastBass, bass);
        if (slowBass === null) {
          if (bass > 0) slowBass = fastBass = bass;
        } else {
          slowBass += (bass - slowBass) * 0.03;
          beat.set(clamp01((fastBass - slowBass) / BEAT_SPAN));
        }
        loud = follow(loud, average(bins.current, ENERGY_BINS));
        energy.set(clamp01((loud - ENERGY_FLOOR) / ENERGY_SPAN));
        if (audio.duration > 0) {
          progress.set(audio.currentTime / audio.duration);
          remaining.set(Math.max(0, audio.duration - audio.currentTime));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, energy, beat, progress, remaining]);

  // OS media controls / lock screen
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!current) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: "ausfear · music library",
      artwork: [{ src: current.artwork, sizes: "240x240", type: "image/webp" }],
    });
    navigator.mediaSession.setActionHandler("play", () => play(current));
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("stop", stop);
  }, [current, play, pause, stop]);

  const value = useMemo<AudioPlayerValue>(
    () => ({
      current,
      isPlaying,
      failedId,
      play,
      pause,
      toggle,
      stop,
      progress,
      remaining,
      energy,
      beat,
      bins,
      reportOnScreen,
      currentOnScreen,
    }),
    [current, isPlaying, failedId, play, pause, toggle, stop, progress, remaining, energy, beat, reportOnScreen, currentOnScreen]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

/** Report an element showing `trackId` as on/off screen (half visible counts), for the mini player */
export function useReportOnScreen(ref: RefObject<HTMLElement | null>, trackId: string) {
  const { reportOnScreen } = useAudioPlayer();
  const key = useId();
  const inView = useInView(ref, { amount: 0.5 });
  useEffect(() => {
    reportOnScreen(key, trackId, inView);
    return () => reportOnScreen(key, trackId, false);
  }, [key, trackId, inView, reportOnScreen]);
}

export function formatTime(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
