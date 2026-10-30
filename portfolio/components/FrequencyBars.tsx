"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useAudioPlayer } from "./AudioPlayer";
import { useTheme } from "@/hooks/useTheme";

// Highest analyser bin to show (~11 kHz); above that previews carry little energy
const MAX_BIN = 64;
// A static, equaliser-like silhouette for reduced motion
const STATIC_SHAPE = [0.35, 0.6, 0.85, 0.55, 0.7, 0.4, 0.65, 0.5];

/**
 * Live frequency bars drawn on a canvas. Only animates while `active`; otherwise draws flat idle bars.
 * Reads the shared analyser bins from the audio player, so any number of these stay in sync.
 */
export default function FrequencyBars({
  active,
  bars = 24,
  className = "",
}: {
  active: boolean;
  bars?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { bins } = useAudioPlayer();
  const reduceMotion = useReducedMotion();
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Colors come from the theme tokens; the effect re-runs when the theme changes
    const styles = getComputedStyle(canvas);
    const activeColor = styles.getPropertyValue("--color-pop").trim();
    const idleColor = styles.getPropertyValue("--color-decor").trim();

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

    // Log-spaced bin ranges so bass and treble both get a fair share of bars
    const ranges = Array.from({ length: bars }, (_, i) => {
      const from = Math.max(1, Math.floor(Math.pow(i / bars, 1.7) * MAX_BIN));
      const to = Math.max(from + 1, Math.floor(Math.pow((i + 1) / bars, 1.7) * MAX_BIN));
      return [from, to] as const;
    });
    const smoothed = new Float32Array(bars);

    const draw = (level: (i: number) => number, color: string) => {
      ctx.clearRect(0, 0, width, height);
      const gap = Math.max(1.5, width / bars / 3);
      const barWidth = (width - gap * (bars - 1)) / bars;
      ctx.fillStyle = color;
      for (let i = 0; i < bars; i++) {
        const h = Math.max(2, level(i) * height);
        const x = i * (barWidth + gap);
        ctx.beginPath();
        ctx.roundRect(x, (height - h) / 2, barWidth, h, Math.min(barWidth / 2, 2));
        ctx.fill();
      }
    };

    let raf = 0;
    const tick = () => {
      const data = bins.current;
      if (data) {
        for (let i = 0; i < bars; i++) {
          const [from, to] = ranges[i];
          let sum = 0;
          for (let b = from; b < to; b++) sum += data[b];
          // With the player's -85…-10 dB window bars mostly land between 0.2 and 0.9 (see AudioPlayer)
          const target = Math.pow(sum / ((to - from) * 255), 1.25);
          smoothed[i] += (target - smoothed[i]) * (target > smoothed[i] ? 0.6 : 0.15);
        }
      }
      draw((i) => smoothed[i], activeColor);
      raf = requestAnimationFrame(tick);
    };

    const render = () => {
      resize();
      if (!active) draw(() => 0, idleColor);
      else if (reduceMotion) draw((i) => STATIC_SHAPE[i % STATIC_SHAPE.length] * 0.8, activeColor);
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    if (active && !reduceMotion) raf = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [active, bars, bins, reduceMotion, theme]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
