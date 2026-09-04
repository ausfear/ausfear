"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import FloatingShapes from "./FloatingShapes";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setOffset({ x, y });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  const t = "cubic-bezier(0.22,1,0.36,1)";

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen overflow-hidden"
      id="hero"
    >
      {/* ═══════════════════════════════════════════
          MOBILE LAYOUT (stacked, no overlapping)
          ═══════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col items-center justify-between h-full pt-20 pb-4">
        {/* Top: Text */}
        <motion.div
          className="text-center px-4 pt-4 space-y-1"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-[12vw] uppercase tracking-tight leading-none text-[var(--color-text)]">
            AUDINTA
          </h1>
          <p className="font-[family-name:var(--font-syne-tactile)] text-[10vw] text-[var(--color-pop)] leading-none" style={{ textShadow: "0 0 30px rgba(255,107,43,0.25)" }}>
            ausfear
          </p>
          <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-[12vw] uppercase tracking-tight leading-none text-[var(--color-text)]">
            SAKTI
          </h1>
        </motion.div>

        {/* Middle: Image */}
        <motion.div
          className="relative flex-1 w-[80vw] max-w-[350px] mt-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className="hero-photo-mask relative w-full h-full">
            <Image
              src="/person-udin.png"
              alt="Audinta Sakti Firmansyah"
              fill
              priority
              className="object-contain object-bottom"
              sizes="80vw"
            />
          </div>
        </motion.div>

        {/* Bottom: Tagline */}
        <motion.p
          className="text-[9px] text-[var(--color-text-muted)] tracking-[0.2em] uppercase font-medium text-center pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Game Enjoyer · Music Listener · Occasional Math Guy
        </motion.p>
      </div>

      {/* ═══════════════════════════════════════════
          DESKTOP LAYOUT (overlapping, parallax)
          ═══════════════════════════════════════════ */}
      <div className="hidden md:flex items-end justify-center h-full relative">
        {/* Giant BG "AUSFEAR" — Layer 0 */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            transform: `translate3d(${offset.x * 30}px, ${offset.y * 30}px, 0)`,
            transition: `transform 0.25s ${t}`,
          }}
        >
          <span className="hero-giant-text text-[18vw] lg:text-[15vw] opacity-80">
            AUSFEAR
          </span>
        </div>

        {/* Particles — Layer 1 */}
        <FloatingShapes offsetX={offset.x} offsetY={offset.y} />

        {/* "AUDINTA" — Behind head, Layer 2 (z-5) */}
        <motion.div
          className="absolute z-[5] pointer-events-none"
          style={{
            top: "6%",
            left: "6%",
            transform: `translate3d(${offset.x * 50}px, ${offset.y * 50}px, 0)`,
            transition: `transform 0.2s ${t}`,
          }}
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        >
          <span className="hero-fg-bold text-[7vw] lg:text-[6vw] opacity-90">
            AUDINTA
          </span>
        </motion.div>

        {/* Photo — Layer 3 (z-10) */}
        <motion.div
          className="relative z-10 flex-shrink-0"
          style={{
            transform: `translate3d(${offset.x * 45}px, ${offset.y * 30}px, 0)`,
            transition: `transform 0.2s ${t}`,
          }}
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="hero-photo-mask relative w-[42vw] h-[88vh] lg:w-[34vw] lg:h-[92vh] max-w-[560px]">
            <Image
              src="/person-udin.png"
              alt="Audinta Sakti Firmansyah"
              fill
              priority
              className="object-contain object-bottom"
              sizes="(max-width: 1024px) 42vw, 34vw"
            />
          </div>
        </motion.div>

        {/* "ausfear" — Across chest, Layer 4 (z-20) */}
        <motion.div
          className="absolute z-20 pointer-events-none"
          style={{
            top: "44%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(-4deg) translate3d(${offset.x * 70}px, ${offset.y * 70}px, 0)`,
            transition: `transform 0.15s ${t}`,
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        >
          <span className="hero-fg-tactile text-[7vw] lg:text-[5.5vw]">
            ausfear
          </span>
        </motion.div>

        {/* "SAKTI" — Lower, overlapping waist, Layer 5 (z-20) */}
        <motion.div
          className="absolute z-20 pointer-events-none"
          style={{
            bottom: "10%",
            right: "6%",
            transform: `translate3d(${offset.x * 60}px, ${offset.y * 60}px, 0)`,
            transition: `transform 0.18s ${t}`,
          }}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        >
          <span className="hero-fg-bold text-[7vw] lg:text-[6vw] opacity-90">
            SAKTI
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="absolute bottom-8 lg:bottom-12 left-0 right-0 flex justify-center z-30 px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          <p className="text-xs text-[var(--color-text-muted)] tracking-[0.3em] uppercase font-medium">
            Game Enjoyer · Music Listener · Occasional Math Guy
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-[var(--color-text-faint)] flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 bg-[var(--color-text-muted)] rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
