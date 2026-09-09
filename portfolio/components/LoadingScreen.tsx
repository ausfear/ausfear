"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAssetPreloader } from "@/hooks/useAssetPreloader";

export default function LoadingScreen() {
  const { progress, isComplete } = useAssetPreloader();
  const [shouldRender, setShouldRender] = useState(true);

  // Lock body scroll while the preloader is active
  useEffect(() => {
    if (!isComplete) {
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
      }, 900);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isComplete]);

  // Circumference for 92px radius SVG circle
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  // Orbital bead coordinates
  const angle = (progress / 100) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  const beadX = 100 + radius * Math.cos(rad);
  const beadY = 100 + radius * Math.sin(rad);

  return (
    <AnimatePresence onExitComplete={() => setShouldRender(false)}>
      {!isComplete && shouldRender && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1, y: 0 }}
          exit={{
            y: "-100%",
            transition: {
              duration: 0.85,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
          className="fixed inset-0 z-[99999] bg-[#09090b] flex flex-col items-center justify-center select-none overflow-hidden"
          style={{ willChange: "transform" }}
        >
          {/* Soft ambient warm glow behind portal */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255, 107, 43, 0.1) 0%, rgba(9, 9, 11, 0) 65%)",
            }}
          />

          {/* Central Portal */}
          <div className="relative flex flex-col items-center">
            {/* Circular Glassmorphism Portal with Progress Ring */}
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
              {/* Outer SVG Progress Orbit & Tip Bead */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 200 200"
              >
                <defs>
                  <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff8f5e" />
                    <stop offset="100%" stopColor="#ff6b2b" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="bead-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Base track */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.06"
                  strokeWidth="2.5"
                />

                {/* Animated progress ring - rotated -90deg around center (100,100) so 0% starts at 12 o'clock */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="url(#orbit-grad)"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  filter="url(#glow)"
                />

                {/* Orbital Glowing Head Bead - sits exactly at the stroke tip, rendered inside SVG */}
                {progress > 1 && progress < 99.5 && (
                  <circle
                    cx={beadX}
                    cy={beadY}
                    r="4.5"
                    fill="#ff6b2b"
                    filter="url(#bead-glow)"
                  />
                )}
              </svg>

              {/* Inner Circular Glass Capsule */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md preloader-glow flex items-center justify-center overflow-hidden">
                {/* ═══════════════════════════════════════════
                    THE "a" LOGO LIQUID FILL CONTAINER
                    ═══════════════════════════════════════════ */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                  {/* Layer 1: Ghost Silhouette of the "a" logo */}
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: "url('/icon.png')",
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      filter: "brightness(0) invert(1)",
                    }}
                  />

                  {/* Layer 2: Masked Rising Undulating Liquid Reservoir */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      maskImage: "url('/icon.png')",
                      WebkitMaskImage: "url('/icon.png')",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                    }}
                  >
                    {/* The rising liquid level container */}
                    <div
                      className="absolute inset-x-0 bottom-0"
                      style={{
                        height: `${progress}%`,
                        background:
                          "linear-gradient(180deg, #ff8f5e 0%, #ff6b2b 40%, #e05317 100%)",
                        boxShadow: "0 0 28px rgba(255, 107, 43, 0.7)",
                      }}
                    >
                      {/* Front animated SVG Sine Wave */}
                      <div
                        className="absolute -top-3 left-0 w-[200%] h-6 liquid-wave-layer-1 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 20 Q 100 40 200 20 T 400 20 T 600 20 T 800 20 L 800 40 L 0 40 Z' fill='%23ff8f5e' opacity='0.9'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "repeat-x",
                          backgroundSize: "320px 24px",
                        }}
                      />
                      {/* Back counter-oscillating SVG Sine Wave */}
                      <div
                        className="absolute -top-3.5 left-0 w-[200%] h-7 liquid-wave-layer-2 pointer-events-none opacity-60"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 20 Q 100 0 200 20 T 400 20 T 600 20 T 800 20 L 800 40 L 0 40 Z' fill='%23ff6b2b'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "repeat-x",
                          backgroundSize: "320px 28px",
                        }}
                      />
                    </div>
                  </div>

                  {/* Subtle bloom on 100% */}
                  {progress >= 98 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.6] }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-[var(--color-pop)]/40 filter blur-xl pointer-events-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Clean Editorial Readout (No tech-gimmicks / No brackets / No fake badges) */}
            <div className="mt-8 flex flex-col items-center text-center space-y-1">
              <span className="font-[family-name:var(--font-syne)] font-bold text-2xl sm:text-3xl text-white/90 tracking-tight">
                {progress}%
              </span>
              <span className="font-[family-name:var(--font-syne-tactile)] text-lg text-[var(--color-pop)] tracking-wide">
                ausfear
              </span>
            </div>
          </div>

          {/* Bottom Laser Seam on Curtain Exit */}
          <div className="absolute bottom-0 inset-x-0 pointer-events-none">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--color-pop)] to-transparent shadow-[0_0_20px_var(--color-pop)]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
