"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { useAudioPlayer } from "./AudioPlayer";

type Point = { x: number; y: number };

/**
 * Tracks the live center of every song card ([data-song-card]) inside `containerRef`, in pixels
 * relative to the container, while `enabled`. Measured each frame because the cards' final spots come
 * from transforms, rotation, a floating animation and their own height, so fixed coordinates drift.
 * Also exposes each center as SVG viewBox units (0–100) for the static web lines.
 */
export function useCardCenters(containerRef: RefObject<HTMLElement | null>, count: number, enabled: boolean) {
  const centers = useRef<Point[]>([]);
  const origin = useRef<Point>({ x: 0, y: 0 });
  // Plain motion values (not hooks) so the count can vary without breaking hook order
  const [lineEnds] = useState(() => Array.from({ length: count }, () => ({ x: motionValue(50), y: motionValue(50) })));

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const tick = () => {
      const container = containerRef.current;
      if (container) {
        const box = container.getBoundingClientRect();
        origin.current = { x: box.width / 2, y: box.height / 2 };
        container.querySelectorAll<HTMLElement>("[data-song-card]").forEach((card, i) => {
          const r = card.getBoundingClientRect(); // a rotated box's center is still the card's center
          const x = r.left + r.width / 2 - box.left;
          const y = r.top + r.height / 2 - box.top;
          centers.current[i] = { x, y };
          lineEnds[i]?.x.set((x / box.width) * 100);
          lineEnds[i]?.y.set((y / box.height) * 100);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [containerRef, enabled, lineEnds]);

  return { centers, origin, lineEnds } as {
    centers: RefObject<Point[]>;
    origin: RefObject<Point>;
    lineEnds: { x: MotionValue<number>; y: MotionValue<number> }[];
  };
}

/* Waveform recipe: one sine per frequency band, each wiggling along the line at its own spatial
   frequency and speed, with an amplitude that follows that band. Bin ranges are for fftSize 256. */
const BANDS = [
  { bins: [1, 4], cycles: 1.5, speed: 2.2, weight: 1 },
  { bins: [5, 12], cycles: 3.5, speed: 3.4, weight: 0.7 },
  { bins: [13, 30], cycles: 7, speed: 5.2, weight: 0.45 },
  { bins: [31, 60], cycles: 12, speed: 7.5, weight: 0.3 },
] as const;
// With the player's -85…-10 dB window, bands mostly sit between ~0.3 and ~0.8
const BAND_FLOOR = 0.3;
const BAND_SPAN = 0.5;
const POINTS = 140;
const POP_RGB = "255, 107, 43";

/**
 * The line from the title to the song that's playing, drawn as a living waveform on a canvas.
 * Flattens back to a straight, dimmer line when paused; straight and static with reduced motion.
 */
export default function WaveformLine({
  centers,
  origin,
  activeIndex,
  className = "",
}: {
  centers: RefObject<Point[]>;
  origin: RefObject<Point>;
  activeIndex: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { bins, isPlaying } = useAudioPlayer();
  const reduceMotion = useReducedMotion();

  // Read inside the draw loop via refs, so pausing eases the wave flat instead of restarting the loop
  const playingRef = useRef(isPlaying);
  const reduceRef = useRef(reduceMotion);
  useEffect(() => {
    playingRef.current = isPlaying;
    reduceRef.current = reduceMotion;
  }, [isPlaying, reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    if (activeIndex < 0) {
      ctx.clearRect(0, 0, width, height);
      return () => observer.disconnect();
    }

    const amps = new Float32Array(BANDS.length);
    let alpha = 0;
    let raf = 0;
    const start = performance.now();

    const strand = (from: Point, dir: Point, normal: Point, length: number, phase: number, scale: number) => {
      ctx.beginPath();
      for (let p = 0; p <= POINTS; p++) {
        const s = p / POINTS;
        // Pinned at both ends: zero offset at the title and at the card
        const envelope = Math.pow(Math.sin(Math.PI * s), 0.8);
        let offset = 0;
        BANDS.forEach((band, k) => {
          offset += amps[k] * band.weight * Math.sin(2 * Math.PI * band.cycles * s - phase * band.speed + k);
        });
        offset *= envelope * scale;
        const x = from.x + dir.x * length * s + normal.x * offset;
        const y = from.y + dir.y * length * s + normal.y * offset;
        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const draw = (now: number) => {
      const target = centers.current?.[activeIndex];
      const from = origin.current;
      ctx.clearRect(0, 0, width, height);
      if (target && from) {
        const dx = target.x - from.x;
        const dy = target.y - from.y;
        const length = Math.hypot(dx, dy) || 1;
        const dir = { x: dx / length, y: dy / length };
        const normal = { x: -dir.y, y: dir.x };
        const maxAmp = Math.min(22, length * 0.06);

        // Band levels with fast attack / slow release; they fall to 0 (a straight line) when paused
        const data = bins.current;
        const playing = playingRef.current;
        BANDS.forEach((band, k) => {
          let level = 0;
          if (playing && !reduceRef.current && data) {
            let sum = 0;
            for (let b = band.bins[0]; b <= band.bins[1]; b++) sum += data[b];
            level = Math.min(1, Math.max(0, (sum / ((band.bins[1] - band.bins[0] + 1) * 255) - BAND_FLOOR) / BAND_SPAN));
          }
          amps[k] += (level - amps[k]) * (level > amps[k] ? 0.5 : 0.08);
        });
        alpha += ((playing ? 0.95 : 0.4) - alpha) * 0.08;

        // Transparent near the title, solid toward the card (the card covers the end)
        const gradient = ctx.createLinearGradient(from.x, from.y, target.x, target.y);
        gradient.addColorStop(0, `rgba(${POP_RGB}, 0)`);
        gradient.addColorStop(0.35, `rgba(${POP_RGB}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${POP_RGB}, ${alpha})`);

        const t = (now - start) / 1000;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = gradient;
        // Ghost strand: thinner, out of phase, for a fuller "signal" look
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1;
        strand(from, dir, normal, length, t * 1.3 + 2, maxAmp * 0.7);
        // Main strand with a soft glow
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
        ctx.shadowColor = `rgba(${POP_RGB}, 0.6)`;
        ctx.shadowBlur = 10;
        strand(from, dir, normal, length, t, maxAmp);
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [activeIndex, bins, centers, origin]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
