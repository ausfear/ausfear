"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Music, Gamepad2, Sigma } from "lucide-react";
import TiltCard from "./TiltCard";

/* ═══════════════════════════════════════════════════
   MUSIC DATA
   ═══════════════════════════════════════════════════ */

const mainPlaylists = [
  {
    label: "acoustic",
    src: "https://embed.music.apple.com/id/playlist/acoustic/pl.u-kv9l2aaIJ36ybe0",
  },
  {
    label: "2024 recap | edm",
    src: "https://embed.music.apple.com/id/playlist/2024-recap-ytmusic/pl.u-KVXBkXVCLedbN9B",
  },
  {
    label: "jowo",
    src: "https://embed.music.apple.com/id/playlist/jowo/pl.u-KVXBkPLtLedbN9B",
  },
];

const scatteredSongs = [
  {
    genre: "EDM - Melodic Bass",
    src: "https://embed.music.apple.com/id/song/deep-blue-feat-monika-santucci/1652371778",
    height: 175,
    labelPos: "above" as const,
    targetX: "-175%",
    targetY: "-130%",
    rotate: -4,
    delay: 0.1,
    floatDuration: 3.8,
    // SVG line endpoint (% of container from center)
    lineEndX: -38,
    lineEndY: -34,
  },
  {
    genre: "Acoustic",
    src: "https://embed.music.apple.com/id/song/all-you-need-to-know-feat-calle-lehmann-acoustic/1482863953",
    height: 175,
    labelPos: "above" as const,
    targetX: "165%",
    targetY: "-140%",
    rotate: 3,
    delay: 0.2,
    floatDuration: 4.2,
    lineEndX: 36,
    lineEndY: -36,
  },
  {
    genre: "Koplo - Dangdut",
    src: "https://embed.music.apple.com/id/song/wirang/1726193449",
    height: 175,
    labelPos: "below" as const,
    targetX: "-160%",
    targetY: "120%",
    rotate: -2,
    delay: 0.15,
    floatDuration: 5.5,
    lineEndX: -35,
    lineEndY: 30,
  },
  {
    genre: "Anime",
    src: "https://embed.music.apple.com/id/song/next-frontier/1813815070",
    height: 175,
    labelPos: "below" as const,
    targetX: "-20%",
    targetY: "150%",
    rotate: 5,
    delay: 0.25,
    floatDuration: 4.8,
    lineEndX: -4,
    lineEndY: 38,
  },
  {
    genre: "Alt Z",
    src: "https://embed.music.apple.com/id/song/cold/1473421589",
    height: 175,
    labelPos: "below" as const,
    targetX: "180%",
    targetY: "110%",
    rotate: -6,
    delay: 0.3,
    floatDuration: 3.2,
    lineEndX: 39,
    lineEndY: 28,
  },
];

/* Floating particles scattered around the spiderweb */
const spiderwebParticles = [
  { x: "12%", y: "18%", size: 4, opacity: 0.15, dur: 4.5, type: "dot" as const },
  { x: "85%", y: "22%", size: 6, opacity: 0.1, dur: 5.2, type: "ring" as const },
  { x: "8%", y: "72%", size: 5, opacity: 0.12, dur: 3.8, type: "dot" as const },
  { x: "78%", y: "80%", size: 4, opacity: 0.18, dur: 4.1, type: "cross" as const },
  { x: "50%", y: "10%", size: 3, opacity: 0.1, dur: 5.8, type: "dot" as const },
  { x: "25%", y: "45%", size: 5, opacity: 0.08, dur: 4.9, type: "ring" as const },
  { x: "72%", y: "48%", size: 3, opacity: 0.14, dur: 3.5, type: "dot" as const },
  { x: "92%", y: "55%", size: 5, opacity: 0.1, dur: 6.1, type: "cross" as const },
  { x: "35%", y: "88%", size: 4, opacity: 0.12, dur: 4.3, type: "ring" as const },
  { x: "60%", y: "92%", size: 3, opacity: 0.16, dur: 5.0, type: "dot" as const },
  { x: "18%", y: "30%", size: 6, opacity: 0.07, dur: 5.5, type: "cross" as const },
  { x: "88%", y: "38%", size: 4, opacity: 0.11, dur: 4.7, type: "dot" as const },
];

/* ═══════════════════════════════════════════════════
   MUSIC SECTION
   ═══════════════════════════════════════════════════ */

function MusicSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  /* Detect mobile for conditional scatter animation */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Circular modulo logic — always exactly 1 center, 1 left, 1 right */
  const getCarouselVariant = (index: number) => {
    if (index === activeIndex)
      return { x: "0%", scale: 1, zIndex: 10, opacity: 1 };
    if (index === (activeIndex + 1) % 3)
      return { x: "60%", scale: 0.85, zIndex: 5, opacity: 0.4 };
    // index === (activeIndex + 2) % 3  →  left
    return { x: "-60%", scale: 0.85, zIndex: 5, opacity: 0.4 };
  };

  /* Swipe handler for mobile carousel */
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    if (info.offset.x < -50) {
      // Swiped left → next
      setActiveIndex((prev) => (prev + 1) % 3);
    } else if (info.offset.x > 50) {
      // Swiped right → prev
      setActiveIndex((prev) => (prev + 2) % 3);
    }
  };

  return (
    <div ref={ref} className="interest-section py-20 md:py-32 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center">
              <Music size={20} className="text-[var(--color-pop)]" />
            </div>
            <span className="text-xs tracking-[0.4em] uppercase text-[var(--color-text-faint)] font-medium">
              What I Listen To
            </span>
          </div>

          <h3 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Music
          </h3>

          <p className="text-[var(--color-text-muted)] text-sm md:text-base lg:text-lg leading-relaxed mb-4 max-w-2xl">
            If I&apos;m not gaming or staring at code, I&apos;m probably lost in a playlist somewhere.
            My taste is all over the place — one minute it&apos;s lo-fi beats, the next it&apos;s
            full-blown EDM drops that make my neighbors question their life choices.
          </p>
          <p className="text-[var(--color-text-muted)] text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl">
            I also mess around with music production in FL Studio from time to time.
            Nothing serious — just enough to appreciate how insanely talented real producers are.
          </p>
        </motion.div>

        {/* ── Cover Flow Playlist Carousel ── */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-24 md:mb-32"
        >
          <div className="relative flex items-center justify-center w-full" style={{ height: 500 }}>
            {mainPlaylists.map((pl, i) => {
              const variant = getCarouselVariant(i);
              const isActive = i === activeIndex;
              return (
                <motion.div
                  key={pl.label}
                  animate={variant}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="absolute"
                  style={{
                    width: "100%",
                    maxWidth: 660,
                    zIndex: variant.zIndex,
                  }}
                >
                  <div className={`relative transition-shadow duration-500 ${isActive ? "shadow-2xl shadow-black/30" : ""}`}>
                    {/* Transparent overlay catches clicks on inactive iframes */}
                    {!isActive && (
                      <div
                        className="absolute inset-0 z-50 cursor-pointer"
                        onClick={() => setActiveIndex(i)}
                      />
                    )}
                    <iframe
                      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                      frameBorder="0"
                      height="450"
                      style={{
                        width: "100%",
                        maxWidth: "660px",
                        overflow: "hidden",
                        borderRadius: "10px",
                        display: "block",
                      }}
                      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                      src={pl.src}
                      title={`Playlist — ${pl.label}`}
                    />
                  </div>
                  {/* Playlist label pill */}
                  <div className="flex justify-center mt-4">
                    <span
                      className={`text-[10px] md:text-xs tracking-[0.3em] uppercase font-medium px-4 py-1.5 rounded-full border transition-all duration-300 ${isActive
                        ? "bg-[var(--color-pop)]/10 border-[var(--color-pop)]/30 text-[var(--color-pop)]"
                        : "bg-transparent border-[var(--color-border)] text-[var(--color-text-faint)]"
                        }`}
                    >
                      {pl.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2.5 mt-6">
            {mainPlaylists.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex
                  ? "bg-[var(--color-pop)] scale-125 shadow-[0_0_8px_var(--color-pop)]"
                  : "bg-[var(--color-text-faint)]/30 hover:bg-[var(--color-text-faint)]/60"
                  }`}
                aria-label={`Show playlist ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Spiderweb Ingredients ── */}
        <div className="relative w-full flex flex-col items-center gap-10 md:block" style={{ minHeight: isMobile ? "auto" : "90vh" }}>
          {/* SVG connecting lines — hidden on mobile */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {scatteredSongs.map((song, i) => (
                <linearGradient
                  key={`grad-${i}`}
                  id={`line-fade-${i}`}
                  x1="50%" y1="50%"
                  x2={`${50 + song.lineEndX}%`}
                  y2={`${50 + song.lineEndY}%`}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                  <stop offset="25%" stopColor="currentColor" stopOpacity="0.12" />
                  <stop offset="75%" stopColor="currentColor" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {scatteredSongs.map((song, i) => (
              <motion.line
                key={`line-${i}`}
                x1="50" y1="50"
                x2={50 + song.lineEndX}
                y2={50 + song.lineEndY}
                stroke={`url(#line-fade-${i})`}
                strokeWidth="0.15"
                className="text-[var(--color-text-faint)]"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 + song.delay, ease: "easeOut" }}
              />
            ))}
          </svg>

          {/* Floating particles — hidden on mobile */}
          {spiderwebParticles.map((p, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute pointer-events-none z-[1] hidden md:block"
              style={{ left: p.x, top: p.y }}
              animate={{ y: ["-8px", "8px"], opacity: [p.opacity, p.opacity * 1.8, p.opacity] }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            >
              {p.type === "dot" && (
                <div
                  className="rounded-full bg-[var(--color-text-faint)]"
                  style={{ width: p.size, height: p.size, opacity: p.opacity }}
                />
              )}
              {p.type === "ring" && (
                <div
                  className="rounded-full border border-[var(--color-text-faint)]"
                  style={{ width: p.size * 2, height: p.size * 2, opacity: p.opacity }}
                />
              )}
              {p.type === "cross" && (
                <div className="relative" style={{ width: p.size * 2, height: p.size * 2, opacity: p.opacity }}>
                  <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--color-text-faint)] -translate-y-1/2" />
                  <div className="absolute left-1/2 top-0 h-full w-px bg-[var(--color-text-faint)] -translate-x-1/2" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Central readable title */}
          <div className="flex items-center justify-center py-10 md:py-0" style={isMobile ? {} : { minHeight: "90vh" }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center select-none relative z-[3]"
            >
              <h4 className="font-[family-name:var(--font-syne)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-[var(--color-text)]">
                INGREDIENTS OF
                <br />
                MY MUSIC LIBRARY
              </h4>
            </motion.div>
          </div>

          {/* Scattered song embeds — stacked on mobile, explode on desktop */}
          {scatteredSongs.map((song) => (
            <motion.div
              key={song.src}
              className={`z-[4] w-[280px] ${
                isMobile
                  ? "relative"
                  : "absolute top-1/2 left-1/2"
              }`}
              style={isMobile ? {} : { marginLeft: "-140px", marginTop: "-88px" }}
              initial={{ opacity: 0, scale: 0.8, y: isMobile ? 30 : 0 }}
              whileInView={
                isMobile
                  ? { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }
                  : {
                      opacity: 1,
                      scale: 1,
                      x: song.targetX,
                      y: song.targetY,
                      rotate: song.rotate,
                    }
              }
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 18,
                delay: song.delay,
              }}
            >
              {/* Continuous async floating (desktop only) */}
              <motion.div
                animate={isMobile ? {} : { y: ["-10px", "10px"] }}
                transition={{
                  duration: song.floatDuration,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              >
                <div className="relative">
                  {(song.labelPos === "above" || isMobile) && (
                    <span className="absolute bottom-full mb-3 left-0 text-xs uppercase tracking-widest text-[var(--color-text-faint)]/50 whitespace-nowrap">
                      {song.genre}
                    </span>
                  )}
                  <TiltCard tiltAmount={10} glareEnabled className="rounded-xl">
                    <iframe
                      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                      frameBorder="0"
                      height={song.height}
                      style={{
                        width: "100%",
                        maxWidth: "660px",
                        overflow: "hidden",
                        borderRadius: "10px",
                        display: "block",
                      }}
                      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                      src={song.src}
                      title={song.genre}
                    />
                  </TiltCard>
                  {song.labelPos === "below" && !isMobile && (
                    <span className="absolute top-full mt-3 left-0 text-xs uppercase tracking-widest text-[var(--color-text-faint)]/50 whitespace-nowrap">
                      {song.genre}
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GAMING SECTION
   ═══════════════════════════════════════════════════ */

const gamingPlatforms = [
  {
    name: "Steam",
    handle: "ausféar™",
    href: "https://steamcommunity.com/id/ausfear/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12.021-5.373 12.021-12S18.606 0 11.979 0z" />
      </svg>
    ),
  },
  {
    name: "Epic Games",
    handle: "ausfear",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.537 0C2.165 0 1.66.506 1.66 1.879V18.44c0 .325.024.61.068.858.128.718.49 1.211 1.1 1.455.162.065.362.12.595.162.047.009 1.373.239 1.373.239L12 24l7.399-2.84s2.142-.362 2.564-1.478c.099-.261.138-.564.138-.912V1.879C22.101.506 21.596 0 20.225 0H3.537zm10.752 3.14c1.721 0 2.573.82 2.573 2.364v1.57c0 1.546-.853 2.366-2.573 2.366H12.4v3.12h-1.78V3.14h3.669zm-5.904.001h1.778v9.42H8.385zm5.753 1.473H12.4v3.354h1.738c.6 0 .944-.314.944-.931V5.543c0-.618-.345-.93-.944-.93z" />
      </svg>
    ),
  },
  {
    name: "Riot Games",
    handle: "ausfear#SEA",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.534 21.77l-1.09-2.81 10.52-2.96V3.96L2.036 8.67v9.5l3.655 1.03-.58 2.81L0 19.7V7.73L24 1.31v16.49l-11.466 3.97z" />
      </svg>
    ),
  },
];

const gameStats = [
  { label: "Hours Wasted", value: "5,000+" },
  { label: "Games Owned (Unplayed)", value: "200+" },
  { label: "Skill Level", value: "Copium" },
  { label: "Rage Quit Frequency", value: "Moderate" },
];

function GamingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="interest-section py-20 md:py-32 px-4 md:px-10 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-14"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <Gamepad2 size={20} className="text-[var(--color-pop)]" />
            </div>
            <span className="text-xs tracking-[0.4em] uppercase text-white/30 font-medium">
              What I Play
            </span>
          </div>
          <h3 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Gaming
          </h3>
        </motion.div>

        {/* Swapped layout: Steam Showcase on LEFT, Gaming text description and metrics on RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column — Steam Widget (Wider wrapper w-[340px] to prevent clipping) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col items-center lg:items-start justify-start order-2 lg:order-1"
          >
            <div className="w-full max-w-[406px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/40 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                  Steam Live
                </span>
                <a
                  href="https://steamcommunity.com/id/ausfear/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] md:text-xs text-[var(--color-pop)] hover:underline tracking-wider uppercase font-medium flex items-center gap-1"
                >
                  Profile ↗
                </a>
              </div>

              <div className="w-full max-w-[406px] h-[406px]">
                <iframe
                  src="https://gamer2810.github.io/steam-miniprofile/?accountId=887140676&appId=730&interactive=true&vanityId=ausfear"
                  style={{
                    border: "0px #ffffff none",
                    display: "block",
                  }}
                  name="myiFrame"
                  scrolling="no"
                  frameBorder="1"
                  marginHeight={0}
                  marginWidth={0}
                  className="w-[325px] h-[325px] scale-[1.25] origin-top-left"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column — Gaming text description + Redesigned Player Metrics + Connected Handles */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-8 order-1 lg:order-2"
          >
            {/* Descriptive Text */}
            <div className="space-y-4">
              <p className="text-white/60 text-sm md:text-base lg:text-lg leading-relaxed">
                I have an unhealthy relationship with my Steam library. Hundreds of
                games, most untouched, while I keep playing the same three on rotation.
                It&apos;s a lifestyle choice, not a problem.
              </p>
              <p className="text-white/60 text-sm md:text-base lg:text-lg leading-relaxed">
                From competitive FPS rounds where I convince myself &quot;that was lag&quot; to
                story-driven RPGs that make me question my life at 3 AM — gaming is
                where I decompress, strategize, and occasionally rage quit with dignity.
              </p>
              <p className="text-white/35 text-xs md:text-sm leading-relaxed italic">
                Current status: telling myself &quot;one more game&quot; for the fourth hour in a row.
              </p>
            </div>

            {/* Redesigned Player Metrics: Reduced padding, smaller label, drastically larger value, bottom-left and bottom-right anchored */}
            <div className="pt-2">
              <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/40 font-semibold mb-4 block">
                Player Metrics &amp; Habits
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gameStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-colors flex flex-row items-end justify-between gap-3 overflow-hidden"
                  >
                    <span className="text-white/40 text-[10px] md:text-[11px] tracking-wider uppercase font-medium pb-1 leading-snug">
                      {stat.label}
                    </span>
                    <span className="text-[var(--color-pop)] text-2xl md:text-3xl font-[family-name:var(--font-syne-tactile)] leading-none text-right flex-shrink-0">
                      {stat.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Connected Platform Handles */}
            <div className="pt-2">
              <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/40 font-semibold mb-3 block">
                Connected Handles
              </span>
              <div className="flex flex-wrap gap-2.5">
                {gamingPlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gamer-badge !bg-white/[0.03] !border-white/10 !text-white/60 hover:!border-[var(--color-pop)] hover:!text-[var(--color-pop)] !text-[11px] md:!text-xs py-2 px-3.5 transition-all duration-200"
                  >
                    {platform.icon}
                    <span>{platform.name}</span>
                    <span className="text-white/30 text-[10px]">({platform.handle})</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MATH SECTION
   ═══════════════════════════════════════════════════ */

const mathFacts = [
  { symbol: "Σ", use: "Calculating total damage output in builds" },
  { symbol: "∫", use: "Looks cool in bios, barely used in real life" },
  { symbol: "π", use: "Exclusively for pizza circumference calculations" },
  { symbol: "∞", use: "How many hours I've wasted on gacha banners" },
];

function MathSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="interest-section py-20 md:py-32 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center">
                <Sigma size={20} className="text-[var(--color-pop)]" />
              </div>
              <span className="text-xs tracking-[0.4em] uppercase text-[var(--color-text-faint)] font-medium">
                The &quot;Serious&quot; One
              </span>
            </div>

            <h3 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Math
            </h3>

            <p className="text-[var(--color-text-muted)] text-sm md:text-base lg:text-lg leading-relaxed mb-4">
              I have a Mathematics background, which I now exclusively use to
              calculate my terrible gacha pull rates, optimize game damage stats,
              and appreciate the aesthetic of Greek symbols.
            </p>
            <p className="text-[var(--color-text-muted)] text-sm md:text-base lg:text-lg leading-relaxed mb-4">
              Four years of proofs and theorems, and my most practical application
              is figuring out whether a 0.6% banner rate is worth my dignity.
              Spoiler: it never is, but I pull anyway.
            </p>
            <p className="text-[var(--color-text-muted)] text-xs md:text-sm leading-relaxed italic">
              &quot;Mathematics is the queen of sciences&quot; — Gauss, who clearly never
              had to deal with gacha.
            </p>
          </motion.div>

          {/* Right — Greek Symbol Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3 md:space-y-4"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-faint)] font-medium mb-4 md:mb-6">
              Practical Applications of My Degree
            </p>

            {mathFacts.map((fact, i) => (
              <motion.div
                key={fact.symbol}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-pop)] hover:shadow-[0_0_30px_rgba(255,107,43,0.06)] transition-all duration-300"
              >
                <span className="text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-syne)] font-bold text-[var(--color-text-faint)] group-hover:text-[var(--color-pop)] transition-colors duration-300 w-10 md:w-12 text-center flex-shrink-0">
                  {fact.symbol}
                </span>
                <p className="text-xs md:text-sm lg:text-base text-[var(--color-text-muted)]">
                  {fact.use}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN INTERESTS EXPORT
   ═══════════════════════════════════════════════════ */

export default function Interests() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" });

  useEffect(() => {
    let ctx: ReturnType<typeof import("gsap").gsap.context> | undefined;

    const initGSAP = async () => {
      const gsapModule = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap;
      gsap.registerPlugin(ScrollTrigger);

      if (sectionRef.current) {
        ctx = gsap.context(() => {
          gsap.to(".interests-deco-number", {
            y: -60,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }, sectionRef.current);
      }
    };

    initGSAP();
    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="interests" className="relative">
      <div className="relative py-16 md:py-28 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="interests-deco-number absolute -top-10 left-0 md:left-10 pointer-events-none select-none">
          <span className="font-[family-name:var(--font-syne)] text-[10rem] md:text-[18rem] font-black text-[#f5f5f5] leading-none">
            02
          </span>
        </div>

        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, x: -30 }}
          animate={titleInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <span className="text-xs tracking-[0.4em] uppercase text-[var(--color-text-faint)] font-medium">
            Deep Dives
          </span>
          <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl lg:text-6xl font-bold mt-4 tracking-tight">
            Things I&apos;m Into
          </h2>
        </motion.div>
      </div>

      <MusicSection />
      <GamingSection />
      <MathSection />
    </section>
  );
}
