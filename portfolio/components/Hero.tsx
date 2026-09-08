"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from "framer-motion";
import Image from "next/image";
import FloatingShapes, { MobileFloatingParticles } from "./FloatingShapes";

const HERO_PHOTOS = [
  { src: "/cutouts/sunglasses.png", alt: "Audinta with sunglasses" },
  { src: "/cutouts/guitar.png", alt: "Audinta with guitar" },
  { src: "/cutouts/gamepad.png", alt: "Audinta with gamepad" },
  { src: "/cutouts/sunglasses2.png", alt: "Audinta posing with sunglasses" },
];

// Vertical scanline wipe transition (Bottom-to-Top, zero-ghosting split)
const scanlineReveal = {
  initial: {
    clipPath: "inset(100% 0% 0% 0%)",
  },
  animate: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    clipPath: "inset(0% 0% 100% 0%)",
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const audintaRef = useRef<HTMLDivElement>(null);
  const tCharRef = useRef<HTMLSpanElement>(null);
  const [anchorDistance, setAnchorDistance] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Automatic photo rotation every 6.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % HERO_PHOTOS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Mouse tracking motion values (-0.5 to 0.5 normalized)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid, physics-based 3D parallax
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });

  // Scroll tracking for mobile vertical parallax
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms per layer
  // Background giant watermark (Layer 0)
  const bgX = useTransform(springX, [-0.5, 0.5], [-35, 35]);
  const bgY = useTransform(springY, [-0.5, 0.5], [-25, 25]);

  // Photo (Layer 2)
  const photoX = useTransform(springX, [-0.5, 0.5], [-22, 22]);
  const photoY = useTransform(springY, [-0.5, 0.5], [-14, 14]);

  // Left Quote Element (Layer 3)
  const leftQuoteX = useTransform(springX, [-0.5, 0.5], [-45, 45]);
  const leftQuoteY = useTransform(springY, [-0.5, 0.5], [-32, 32]);

  // Right Alias Element (Layer 3)
  const rightAliasX = useTransform(springX, [-0.5, 0.5], [-50, 50]);
  const rightAliasY = useTransform(springY, [-0.5, 0.5], [-32, 32]);

  // Foreground AUDINTA (Layer 4)
  const audintaX = useTransform(springX, [-0.5, 0.5], [-55, 55]);
  const audintaY = useTransform(springY, [-0.5, 0.5], [-38, 38]);

  // Foreground SAKTI (Layer 4)
  const saktiX = useTransform(springX, [-0.5, 0.5], [-55, 55]);
  const saktiY = useTransform(springY, [-0.5, 0.5], [-38, 38]);

  // Relative transforms for white text clones inside the photo container
  // Photo moves by (photoX, photoY). White text moves by (audintaDiffX, audintaDiffY) inside photo.
  // Net visual translation = photoX + audintaDiffX = [-55, 55] = audintaX!
  const audintaDiffX = useTransform(springX, [-0.5, 0.5], [-33, 33]);
  const audintaDiffY = useTransform(springY, [-0.5, 0.5], [-24, 24]);
  const saktiDiffX = useTransform(springX, [-0.5, 0.5], [-33, 33]);
  const saktiDiffY = useTransform(springY, [-0.5, 0.5], [-24, 24]);

  // Strict mathematical centering logic for AUDINTA and SAKTI
  useEffect(() => {
    const updateAnchor = () => {
      if (!audintaRef.current || !tCharRef.current) return;
      const audintaRect = audintaRef.current.getBoundingClientRect();
      const tRect = tCharRef.current.getBoundingClientRect();
      // Distance from left edge of "AUDINTA" to the exact center of letter 'T'
      const dist = tRect.left + tRect.width / 2 - audintaRect.left;
      setAnchorDistance(dist);
    };

    updateAnchor();
    // Recompute on window resize to ensure mathematical precision across all viewports
    window.addEventListener("resize", updateAnchor);
    return () => window.removeEventListener("resize", updateAnchor);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen overflow-hidden"
      id="hero"
    >
      {/* ═══════════════════════════════════════════
          MOBILE LAYOUT (stacked, clean)
          ═══════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col items-center justify-between h-full pt-20 pb-4 relative z-10">
        {/* Mobile Floating Particles with on-scroll vertical parallax */}
        <MobileFloatingParticles scrollYProgress={scrollYProgress} />

        {/* Top: Text */}
        <motion.div
          className="text-center px-4 pt-4 space-y-1 z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-[12vw] uppercase tracking-tight leading-none text-[var(--color-text)]">
            AUDINTA
          </h1>
          <p
            className="font-[family-name:var(--font-syne-tactile)] text-[9vw] text-[var(--color-pop)] leading-none my-1"
            style={{ textShadow: "0 0 30px rgba(255,107,43,0.3)" }}
          >
            ausfear
          </p>
          <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-[12vw] uppercase tracking-tight leading-none text-[var(--color-text)]">
            SAKTI
          </h1>
        </motion.div>

        {/* Quote on Mobile — Placed between Name (below SAKTI) and Picture */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="text-center px-6 my-auto py-1 z-10 pointer-events-none select-none"
        >
          <p className="font-[family-name:var(--font-syne-tactile)] text-xl sm:text-2xl text-[var(--color-text)] leading-snug">
            the best thing isn&apos;t<br />always the best choice.
          </p>
        </motion.div>

        {/* Middle: Image */}
        <motion.div
          className="relative flex-1 w-[90vw] max-w-[420px] mt-1 z-10 overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className="hero-photo-mask relative w-full h-full">
            <AnimatePresence initial={false}>
              <motion.div
                key={photoIndex}
                variants={scanlineReveal}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <Image
                  src={HERO_PHOTOS[photoIndex].src}
                  alt={HERO_PHOTOS[photoIndex].alt}
                  fill
                  priority
                  className="object-contain object-bottom grayscale contrast-[1.12] brightness-[1.02]"
                  sizes="90vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Vertical Laser Scanline Sweep on Switch (Bottom to Top) */}
            <motion.div
              key={`scan-m-${photoIndex}`}
              className="absolute inset-x-0 pointer-events-none z-20"
              initial={{ top: "100%", opacity: 0 }}
              animate={{ top: "0%", opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
                times: [0, 0.06, 0.82, 1],
              }}
            >
              <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-[var(--color-pop)] to-transparent shadow-[0_0_14px_var(--color-pop),0_0_28px_var(--color-pop)]" />
              <div className="w-full h-12 bg-gradient-to-b from-[var(--color-pop)]/25 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom: Tagline */}
        <motion.p
          className="text-[9px] text-[var(--color-text-muted)] tracking-[0.2em] uppercase font-medium text-center pb-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Game Enjoyer · Music Listener · Occasional Math Guy
        </motion.p>
      </div>

      {/* ═══════════════════════════════════════════
          DESKTOP LAYOUT (Mathematical Anchoring & Depth)
          ═══════════════════════════════════════════ */}
      <div className="hidden md:flex items-end justify-center h-full relative">
        {/* Giant BG "AUSFEAR" — Layer 0 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
          style={{ x: bgX, y: bgY }}
        >
          <span className="hero-giant-text text-[18vw] lg:text-[15vw] opacity-80">
            AUSFEAR
          </span>
        </motion.div>

        {/* Autonomous Floating Particles with Mouse Parallax — Layer 1 */}
        <FloatingShapes springX={springX} springY={springY} />

        {/* Central Photo — Layer 2 (+15% height: h-[88vh] lg:h-[92vh], Vertical Scanline Switch) */}
        <motion.div
          className="relative z-10 flex-shrink-0"
          style={{ x: photoX, y: photoY }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        >
          <div className="hero-photo-mask relative h-[88vh] lg:h-[92vh] aspect-[5/6]">
            <AnimatePresence initial={false}>
              <motion.div
                key={photoIndex}
                variants={scanlineReveal}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <Image
                  src={HERO_PHOTOS[photoIndex].src}
                  alt={HERO_PHOTOS[photoIndex].alt}
                  fill
                  priority
                  className="object-contain object-bottom grayscale contrast-[1.12] brightness-[1.02]"
                  sizes="(max-width: 1024px) 70vw, 55vw"
                />

                {/* White Text Overlay Masked to Photo Silhouette */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none select-none"
                  style={{
                    maskImage: `url('${HERO_PHOTOS[photoIndex].src}')`,
                    WebkitMaskImage: `url('${HERO_PHOTOS[photoIndex].src}')`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskPosition: "bottom center",
                    WebkitMaskPosition: "bottom center",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                  }}
                >
                  {/* White "AUDINTA" */}
                  <div
                    className="absolute pointer-events-none select-none whitespace-nowrap"
                    style={{
                      bottom: "22vh",
                      left: anchorDistance ? `calc(50% - ${anchorDistance}px)` : "18%",
                    }}
                  >
                    <motion.div style={{ x: audintaDiffX, y: audintaDiffY }}>
                      <span
                        className="hero-fg-bold text-[6.5vw] lg:text-[5.5vw] opacity-95 leading-none inline-block"
                        style={{ color: "#ffffff" }}
                      >
                        <span>AUDIN</span>
                        <span>T</span>
                        <span>A</span>
                      </span>
                    </motion.div>
                  </div>

                  {/* White "SAKTI" */}
                  <div
                    className="absolute pointer-events-none select-none whitespace-nowrap"
                    style={{
                      bottom: "15vh",
                      right: anchorDistance ? `calc(50% - ${anchorDistance}px)` : "18%",
                    }}
                  >
                    <motion.div style={{ x: saktiDiffX, y: saktiDiffY }}>
                      <span
                        className="hero-fg-bold text-[6.5vw] lg:text-[5.5vw] opacity-95 leading-none inline-block"
                        style={{ color: "#ffffff" }}
                      >
                        SAKTI
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Vertical Laser Scanline Sweep on Switch (Bottom to Top) */}
            <motion.div
              key={`scan-d-${photoIndex}`}
              className="absolute inset-x-0 pointer-events-none z-20"
              initial={{ top: "100%", opacity: 0 }}
              animate={{ top: "0%", opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
                times: [0, 0.06, 0.82, 1],
              }}
            >
              <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-[var(--color-pop)] to-transparent shadow-[0_0_16px_var(--color-pop),0_0_32px_var(--color-pop)]" />
              <div className="w-full h-12 bg-gradient-to-b from-[var(--color-pop)]/25 to-transparent pointer-events-none" />
            </motion.div>

            {/* Hidden image preloader for zero-latency switching */}
            <div className="hidden" aria-hidden="true">
              {HERO_PHOTOS.map((p, i) => (
                <Image key={i} src={p.src} alt="" width={10} height={12} priority />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Left Plain Text Quote Element (Dual-anchored bounds: left-4 md:left-8 right-[70%] md:right-[75%], text-right) */}
        <div
          className="absolute left-4 md:left-8 right-[70%] md:right-[75%] top-[44%] -translate-y-1/2 pointer-events-none select-none z-20 text-right"
        >
          <motion.div
            style={{ x: leftQuoteX, y: leftQuoteY }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="text-right"
          >
            <p className="font-[family-name:var(--font-syne-tactile)] text-2xl md:text-3xl lg:text-4xl text-black leading-snug">
              the best thing isn&apos;t<br />always the best choice.
            </p>
          </motion.div>
        </div>

        {/* Right Plain Text A.K.A Element (Dual-anchored bounds: right-4 md:right-8 left-[70%] md:left-[75%], text-left) */}
        <div
          className="absolute right-4 md:right-8 left-[70%] md:left-[75%] top-[44%] -translate-y-1/2 pointer-events-none select-none z-20 text-left"
        >
          <motion.div
            style={{ x: rightAliasX, y: rightAliasY }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="text-left"
          >
            <span className="text-xs md:text-sm text-[var(--color-text-faint)] tracking-tighter uppercase font-sans font-medium block mb-1">
              also known as:
            </span>
            <span className="font-[family-name:var(--font-syne-tactile)] text-3xl md:text-4xl lg:text-5xl text-[var(--color-pop)] leading-none block">
              ausfear
            </span>
          </motion.div>
        </div>

        {/* "AUDINTA" — Base Layer (Behind Photo, z-[5], Black) */}
        <div
          ref={audintaRef}
          className="absolute pointer-events-none select-none z-[5] whitespace-nowrap"
          style={{
            bottom: "22vh",
            left: anchorDistance ? `calc(50% - ${anchorDistance}px)` : "18%",
          }}
        >
          <motion.div
            style={{ x: audintaX, y: audintaY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            <span className="hero-fg-bold text-[6.5vw] lg:text-[5.5vw] opacity-90 leading-none inline-block">
              <span>AUDIN</span>
              <span ref={tCharRef}>T</span>
              <span>A</span>
            </span>
          </motion.div>
        </div>

        {/* "SAKTI" — Base Layer (Behind Photo, z-[5], Black) */}
        <div
          className="absolute pointer-events-none select-none z-[5] whitespace-nowrap"
          style={{
            bottom: "15vh",
            right: anchorDistance ? `calc(50% - ${anchorDistance}px)` : "18%",
          }}
        >
          <motion.div
            style={{ x: saktiX, y: saktiY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            <span className="hero-fg-bold text-[6.5vw] lg:text-[5.5vw] opacity-90 leading-none inline-block">
              SAKTI
            </span>
          </motion.div>
        </div>

        {/* Bottom Ambient White Gradation — Softens photo edge & guarantees tagline contrast */}
        <div className="absolute bottom-0 inset-x-0 h-28 lg:h-32 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/85 to-transparent pointer-events-none z-20" />

        {/* Tagline */}
        <motion.div
          className="absolute bottom-12 lg:bottom-14 left-0 right-0 flex justify-center z-30 px-6 pointer-events-none select-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          <p className="text-xs text-[var(--color-text)] opacity-75 tracking-[0.3em] uppercase font-medium">
            Game Enjoyer · Music Listener · Occasional Math Guy
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
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
