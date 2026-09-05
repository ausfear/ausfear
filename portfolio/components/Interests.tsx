"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Music, Gamepad2, Sigma } from "lucide-react";
import TiltCard from "./TiltCard";

/* ═══════════════════════════════════════════════════
   MUSIC SECTION
   ═══════════════════════════════════════════════════ */

function MusicSection() {
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
                <Music size={20} className="text-[var(--color-pop)]" />
              </div>
              <span className="text-xs tracking-[0.4em] uppercase text-[var(--color-text-faint)] font-medium">
                What I Listen To
              </span>
            </div>

            <h3 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Music
            </h3>

            <p className="text-[var(--color-text-muted)] text-sm md:text-base lg:text-lg leading-relaxed mb-4">
              If I&apos;m not gaming or staring at code, I&apos;m probably lost in a playlist somewhere.
              My taste is all over the place — one minute it&apos;s lo-fi beats, the next it&apos;s
              full-blown EDM drops that make my neighbors question their life choices.
            </p>
            <p className="text-[var(--color-text-muted)] text-sm md:text-base lg:text-lg leading-relaxed">
              I also mess around with music production in FL Studio from time to time.
              Nothing serious — just enough to appreciate how insanely talented real producers are.
            </p>
          </motion.div>

          {/* Right — Apple Music Embed with 3D Tilt */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard tiltAmount={8} glareEnabled className="rounded-2xl">
              <div className="music-embed-glow p-1.5 md:p-2">
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
                  src="https://embed.music.apple.com/id/playlist/2024-recap-ytmusic/pl.u-KVXBkXVCLedbN9B"
                  title="Apple Music Playlist"
                />
              </div>
            </TiltCard>
          </motion.div>
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
