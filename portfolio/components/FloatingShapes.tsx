"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

interface ParticleBase {
  className?: string;
  delay?: number;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  parallaxMultiplier?: number;
}

/* ── Circle Particle ── */
function Circle({
  className = "",
  size = 10,
  delay = 0,
  springX,
  springY,
  parallaxMultiplier = 90,
  color = "var(--color-border)",
  animClass = "animate-float-slow",
}: ParticleBase & { size?: number; color?: string; animClass?: string }) {
  const x = useTransform(springX, [-0.5, 0.5], [-parallaxMultiplier, parallaxMultiplier]);
  const y = useTransform(springY, [-0.5, 0.5], [-parallaxMultiplier * 0.8, parallaxMultiplier * 0.8]);

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 + delay, duration: 0.6 }}
    >
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          border: `1.5px solid ${color}`,
          animation: `${animClass === "animate-float-slow" ? "float-slow 7s" : animClass === "animate-float-med" ? "float-med 5s" : "float-fast 4s"} ease-in-out infinite`,
          animationDelay: `${delay * 1000}ms`,
        }}
      />
    </motion.div>
  );
}

/* ── Plus Sign Particle ── */
function Plus({
  className = "",
  size = 18,
  delay = 0,
  springX,
  springY,
  parallaxMultiplier = 80,
  color = "var(--color-text-faint)",
}: ParticleBase & { size?: number; color?: string }) {
  const x = useTransform(springX, [-0.5, 0.5], [-parallaxMultiplier, parallaxMultiplier]);
  const y = useTransform(springY, [-0.5, 0.5], [-parallaxMultiplier * 0.8, parallaxMultiplier * 0.8]);

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.6, scale: 1 }}
      transition={{ delay: 0.7 + delay, duration: 0.5 }}
    >
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          animation: "float-med 6s ease-in-out infinite",
          animationDelay: `${delay * 1000}ms`,
        }}
      >
        <div className="absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2" style={{ background: color }} />
        <div className="absolute top-0 left-1/2 w-[1.5px] h-full -translate-x-1/2" style={{ background: color }} />
      </div>
    </motion.div>
  );
}

/* ── Triangle Particle ── */
function Triangle({
  className = "",
  size = 14,
  delay = 0,
  springX,
  springY,
  parallaxMultiplier = 100,
  color = "var(--color-text-faint)",
}: ParticleBase & { size?: number; color?: string }) {
  const x = useTransform(springX, [-0.5, 0.5], [-parallaxMultiplier, parallaxMultiplier]);
  const y = useTransform(springY, [-0.5, 0.5], [-parallaxMultiplier * 0.8, parallaxMultiplier * 0.8]);

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.45, scale: 1 }}
      transition={{ delay: 0.8 + delay, duration: 0.5 }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          animation: "float-slow 8s ease-in-out infinite",
          animationDelay: `${delay * 1200}ms`,
        }}
      />
    </motion.div>
  );
}

/* ── Ring Particle ── */
function Ring({
  className = "",
  size = 60,
  delay = 0,
  springX,
  springY,
  parallaxMultiplier = 40,
}: ParticleBase & { size?: number }) {
  const x = useTransform(springX, [-0.5, 0.5], [-parallaxMultiplier, parallaxMultiplier]);
  const y = useTransform(springY, [-0.5, 0.5], [-parallaxMultiplier * 0.8, parallaxMultiplier * 0.8]);

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.35, scale: 1 }}
      transition={{ delay: 0.5 + delay, duration: 0.8 }}
    >
      <div
        className="rounded-full border-2 border-[var(--color-border)]"
        style={{
          width: size,
          height: size,
          animation: "pulse-soft 6s ease-in-out infinite",
          animationDelay: `${delay * 800}ms`,
        }}
      />
    </motion.div>
  );
}

/* ── Diamond Particle ── */
function Diamond({
  className = "",
  size = 12,
  delay = 0,
  springX,
  springY,
  parallaxMultiplier = 110,
  color = "var(--color-pop)",
}: ParticleBase & { size?: number; color?: string }) {
  const x = useTransform(springX, [-0.5, 0.5], [-parallaxMultiplier, parallaxMultiplier]);
  const y = useTransform(springY, [-0.5, 0.5], [-parallaxMultiplier * 0.8, parallaxMultiplier * 0.8]);

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.5, scale: 1 }}
      transition={{ delay: 0.7 + delay, duration: 0.5 }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `1.5px solid ${color}`,
          transform: "rotate(45deg)",
          animation: "spin-slow 24s linear infinite",
          animationDelay: `${delay * 600}ms`,
        }}
      />
    </motion.div>
  );
}

/* ── Dot Particle ── */
function Dot({
  className = "",
  size = 5,
  delay = 0,
  springX,
  springY,
  parallaxMultiplier = 120,
  color = "var(--color-pop)",
}: ParticleBase & { size?: number; color?: string }) {
  const x = useTransform(springX, [-0.5, 0.5], [-parallaxMultiplier, parallaxMultiplier]);
  const y = useTransform(springY, [-0.5, 0.5], [-parallaxMultiplier * 0.8, parallaxMultiplier * 0.8]);

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ delay: 0.8 + delay, duration: 0.4 }}
    >
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          animation: "pulse-soft 4s ease-in-out infinite",
          animationDelay: `${delay * 500}ms`,
        }}
      />
    </motion.div>
  );
}

export default function FloatingShapes({
  springX,
  springY,
}: {
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[8]">
      {/* ─── Top Left ─── */}
      <Plus className="top-[10%] left-[6%]" size={20} delay={0} springX={springX} springY={springY} parallaxMultiplier={90} color="var(--color-pop)" />
      <Circle className="top-[18%] left-[12%]" size={8} delay={0.2} springX={springX} springY={springY} parallaxMultiplier={120} />
      <Triangle className="top-[28%] left-[8%]" size={12} delay={0.1} springX={springX} springY={springY} parallaxMultiplier={105} color="var(--color-pop)" />
      <Diamond className="top-[14%] left-[20%]" size={10} delay={0.3} springX={springX} springY={springY} parallaxMultiplier={95} />

      {/* ─── Top Right ─── */}
      <Ring className="top-[8%] right-[8%]" size={70} delay={0.15} springX={springX} springY={springY} parallaxMultiplier={45} />
      <Plus className="top-[22%] right-[5%]" size={16} delay={0.25} springX={springX} springY={springY} parallaxMultiplier={85} />
      <Dot className="top-[12%] right-[18%]" size={5} delay={0.1} springX={springX} springY={springY} parallaxMultiplier={130} />
      <Circle className="top-[30%] right-[12%]" size={6} delay={0.35} springX={springX} springY={springY} parallaxMultiplier={110} color="var(--color-pop)" animClass="animate-float-fast" />
      <Triangle className="top-[16%] right-[22%]" size={10} delay={0.4} springX={springX} springY={springY} parallaxMultiplier={95} />

      {/* ─── Bottom Left ─── */}
      <Circle className="bottom-[20%] left-[5%]" size={12} delay={0.3} springX={springX} springY={springY} parallaxMultiplier={100} animClass="animate-float-med" />
      <Plus className="bottom-[30%] left-[14%]" size={14} delay={0.2} springX={springX} springY={springY} parallaxMultiplier={75} />
      <Diamond className="bottom-[15%] left-[10%]" size={8} delay={0.45} springX={springX} springY={springY} parallaxMultiplier={120} />
      <Ring className="bottom-[35%] left-[2%]" size={45} delay={0.5} springX={springX} springY={springY} parallaxMultiplier={40} />
      <Dot className="bottom-[25%] left-[20%]" size={4} delay={0.15} springX={springX} springY={springY} parallaxMultiplier={125} />

      {/* ─── Bottom Right ─── */}
      <Plus className="bottom-[18%] right-[10%]" size={18} delay={0.35} springX={springX} springY={springY} parallaxMultiplier={85} color="var(--color-pop)" />
      <Circle className="bottom-[28%] right-[6%]" size={10} delay={0.4} springX={springX} springY={springY} parallaxMultiplier={115} animClass="animate-float-fast" />
      <Triangle className="bottom-[22%] right-[18%]" size={14} delay={0.5} springX={springX} springY={springY} parallaxMultiplier={90} color="var(--color-pop)" />
      <Diamond className="bottom-[32%] right-[14%]" size={14} delay={0.25} springX={springX} springY={springY} parallaxMultiplier={100} />

      {/* ─── Center Sides ─── */}
      <Dot className="top-[45%] left-[2%]" size={6} delay={0.6} springX={springX} springY={springY} parallaxMultiplier={130} color="var(--color-pop)" />
      <Plus className="top-[50%] right-[3%]" size={12} delay={0.55} springX={springX} springY={springY} parallaxMultiplier={75} />
      <Circle className="top-[55%] left-[18%]" size={5} delay={0.65} springX={springX} springY={springY} parallaxMultiplier={135} color="var(--color-pop)" animClass="animate-float-med" />
      <Triangle className="top-[40%] right-[20%]" size={8} delay={0.7} springX={springX} springY={springY} parallaxMultiplier={100} />
      <Dot className="top-[60%] right-[15%]" size={3} delay={0.4} springX={springX} springY={springY} parallaxMultiplier={135} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MOBILE FLOATING PARTICLES (Vertical On-Scroll Parallax)
   ═══════════════════════════════════════════════════ */

interface MobileParallaxItemProps {
  className?: string;
  scrollYProgress: MotionValue<number>;
  speed?: number;
  delay?: number;
  children: React.ReactNode;
}

function MobileParallaxItem({
  className = "",
  scrollYProgress,
  speed = 160,
  delay = 0,
  children,
}: MobileParallaxItemProps) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -speed]);

  return (
    <motion.div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{ y }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + delay, duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

export function MobileFloatingParticles({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {/* Top Left (above name) */}
      <MobileParallaxItem
        className="top-[7%] left-[6%]"
        scrollYProgress={scrollYProgress}
        speed={180}
        delay={0.1}
      >
        <div
          className="relative"
          style={{
            width: 16,
            height: 16,
            animation: "float-med 5s ease-in-out infinite",
          }}
        >
          <div className="absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 bg-[var(--color-pop)]" />
          <div className="absolute top-0 left-1/2 w-[1.5px] h-full -translate-x-1/2 bg-[var(--color-pop)]" />
        </div>
      </MobileParallaxItem>

      {/* Top Right (above name) */}
      <MobileParallaxItem
        className="top-[9%] right-[8%]"
        scrollYProgress={scrollYProgress}
        speed={130}
        delay={0.15}
      >
        <div
          className="rounded-full border-2 border-[var(--color-border)]"
          style={{
            width: 38,
            height: 38,
            animation: "pulse-soft 6s ease-in-out infinite",
          }}
        />
      </MobileParallaxItem>

      {/* Upper Right (near ausfear) */}
      <MobileParallaxItem
        className="top-[18%] right-[7%]"
        scrollYProgress={scrollYProgress}
        speed={240}
        delay={0.2}
      >
        <div
          className="rounded-full bg-[var(--color-pop)]"
          style={{
            width: 5,
            height: 5,
            animation: "pulse-soft 4s ease-in-out infinite",
          }}
        />
      </MobileParallaxItem>

      {/* Upper Left (near AUDINTA) */}
      <MobileParallaxItem
        className="top-[21%] left-[7%]"
        scrollYProgress={scrollYProgress}
        speed={150}
        delay={0.25}
      >
        <div
          className="rounded-full border-[1.5px] border-[var(--color-border)]"
          style={{
            width: 8,
            height: 8,
            animation: "float-slow 7s ease-in-out infinite",
          }}
        />
      </MobileParallaxItem>

      {/* Mid Left (beside quote) */}
      <MobileParallaxItem
        className="top-[33%] left-[5%]"
        scrollYProgress={scrollYProgress}
        speed={260}
        delay={0.3}
      >
        <div
          style={{
            width: 11,
            height: 11,
            border: "1.5px solid var(--color-pop)",
            transform: "rotate(45deg)",
            animation: "spin-slow 20s linear infinite",
          }}
        />
      </MobileParallaxItem>

      {/* Mid Right (beside quote) */}
      <MobileParallaxItem
        className="top-[35%] right-[6%]"
        scrollYProgress={scrollYProgress}
        speed={190}
        delay={0.2}
      >
        <div
          className="relative"
          style={{
            width: 14,
            height: 14,
            animation: "float-med 6s ease-in-out infinite",
          }}
        >
          <div className="absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 bg-[var(--color-text-faint)]" />
          <div className="absolute top-0 left-1/2 w-[1.5px] h-full -translate-x-1/2 bg-[var(--color-text-faint)]" />
        </div>
      </MobileParallaxItem>

      {/* Below quote / above photo */}
      <MobileParallaxItem
        className="top-[45%] left-[10%]"
        scrollYProgress={scrollYProgress}
        speed={270}
        delay={0.35}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderBottom: "11px solid var(--color-text-faint)",
            animation: "float-slow 8s ease-in-out infinite",
          }}
        />
      </MobileParallaxItem>

      {/* Photo Right Flank */}
      <MobileParallaxItem
        className="top-[54%] right-[7%]"
        scrollYProgress={scrollYProgress}
        speed={170}
        delay={0.3}
      >
        <div
          className="rounded-full border-[1.5px] border-[var(--color-border)]"
          style={{
            width: 28,
            height: 28,
            animation: "pulse-soft 5s ease-in-out infinite",
          }}
        />
      </MobileParallaxItem>

      {/* Photo Left Flank */}
      <MobileParallaxItem
        className="top-[67%] left-[6%]"
        scrollYProgress={scrollYProgress}
        speed={220}
        delay={0.4}
      >
        <div
          className="rounded-full border-[1.5px] border-[var(--color-pop)]"
          style={{
            width: 7,
            height: 7,
            animation: "float-fast 4s ease-in-out infinite",
          }}
        />
      </MobileParallaxItem>

      {/* Photo Lower Right Flank */}
      <MobileParallaxItem
        className="top-[73%] right-[8%]"
        scrollYProgress={scrollYProgress}
        speed={280}
        delay={0.45}
      >
        <div
          style={{
            width: 9,
            height: 9,
            border: "1.5px solid var(--color-border)",
            transform: "rotate(45deg)",
            animation: "spin-slow 24s linear infinite",
          }}
        />
      </MobileParallaxItem>

      {/* Bottom Center-Left */}
      <MobileParallaxItem
        className="top-[82%] left-[10%]"
        scrollYProgress={scrollYProgress}
        speed={160}
        delay={0.3}
      >
        <div
          className="rounded-full bg-[var(--color-pop)]"
          style={{
            width: 4,
            height: 4,
            animation: "pulse-soft 4s ease-in-out infinite",
          }}
        />
      </MobileParallaxItem>
    </div>
  );
}
