"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const aboutLines = [
  "I'm Audinta — but most people on the internet know me as ausfear.",
  "I'm not a professional developer, designer, or any of that fancy stuff. I just like making cool things on the internet for fun, listening to good tracks on repeat until they lose all meaning, and spending way too many hours in games I'll never actually master.",
  "I studied Mathematics at Universitas Lambung Mangkurat — which sounds impressive until you realize I mostly use that knowledge to calculate gacha pull probabilities and argue about optimal damage builds.",
  "This site? It's just my little corner of the web. No portfolio, no résumé, no hustle. Just vibes.",
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

  useEffect(() => {
    let ctx: ReturnType<typeof import("gsap").gsap.context> | undefined;

    const initGSAP = async () => {
      const gsapModule = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap;
      gsap.registerPlugin(ScrollTrigger);

      if (sectionRef.current) {
        ctx = gsap.context(() => {
          gsap.to(".about-deco-number", {
            y: -80,
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
    return () => { ctx?.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 md:py-44 px-4 md:px-10 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Large Decorative Number */}
      <div className="about-deco-number absolute -top-10 right-0 md:right-10 pointer-events-none select-none">
        <span className="font-[family-name:var(--font-syne)] text-[10rem] md:text-[18rem] font-black text-[#f5f5f5] leading-none">
          01
        </span>
      </div>

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
