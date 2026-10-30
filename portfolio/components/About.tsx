"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";

const aboutLines = [
  "I'm Audinta, though most people online know me as ausfear.",
  "I'm not a professional developer or designer. I just like making stuff on the internet for fun, playing the same song on repeat until it stops sounding like a song, and sinking way too many hours into games I'll never get good at.",
  "I finished a Mathematics degree at Universitas Lambung Mangkurat in about 3.5 years. I still need ten seconds of complete silence to split a dinner bill, though. These days the degree mostly goes into calculating gacha pity and min-maxing build stats.",
  "This is my little corner of the web. I tinker here, try things out, and leave some of it unpolished on purpose.",
];

function RevealLine({ text, index }: { text: string; index: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`text-base md:text-lg lg:text-2xl leading-relaxed ${
        index === 0
          ? "text-[var(--color-text)] font-medium"
          : "text-[var(--color-text-muted)]"
      }`}
    >
      {text}
    </motion.p>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" });
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-50px" });

  // Decorative "01" drifts up as the section scrolls past (start entering -> fully left)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const decoY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -80]), { stiffness: 120, damping: 30 });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 md:py-44 px-4 md:px-10 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Large Decorative Number */}
      <motion.div
        aria-hidden="true"
        style={{ y: decoY }}
        className="absolute -top-10 right-0 md:right-10 pointer-events-none select-none"
      >
        <span className="font-[family-name:var(--font-syne)] text-[10rem] md:text-[18rem] font-black text-[var(--deco-number)] leading-none">
          01
        </span>
      </motion.div>

      {/* Section Label */}
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, x: -30 }}
        animate={titleInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 md:mb-20"
      >
        <span className="text-xs tracking-[0.4em] uppercase text-[var(--color-text-faint)] font-medium">
          Who dis
        </span>
        <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl lg:text-6xl font-bold mt-4 tracking-tight">
          Game Enjoyer, Music Listener
          <br />
          <span className="text-[var(--color-text-muted)]">
            & Occasional Math Guy<span className="text-[var(--color-pop)]">.</span>
          </span>
        </h2>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Left — Accent Line */}
        <div className="hidden lg:flex lg:col-span-2 justify-center">
          <motion.div
            ref={lineRef}
            initial={{ scaleY: 0 }}
            animate={lineInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-[1px] h-full bg-[var(--color-border)] origin-top"
          />
        </div>

        {/* Right — Text */}
        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          {aboutLines.map((text, i) => (
            <RevealLine key={i} text={text} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
