"use client";

import { motion } from "framer-motion";

interface ParticleBase {
  className?: string;
  delay?: number;
  offsetX: number;
  offsetY: number;
  parallaxMultiplier?: number;
}

/* ── Circle ── */
function Circle({
  className = "", size = 10, delay = 0,
  offsetX, offsetY, parallaxMultiplier = 100,
  color = "var(--color-border)", animClass = "animate-float-slow",
}: ParticleBase & { size?: number; color?: string; animClass?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{
        width: size, height: size,
        border: `1.5px solid ${color}`,
        transform: `translate3d(${offsetX * parallaxMultiplier}px, ${offsetY * parallaxMultiplier}px, 0)`,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
        animation: `${animClass === "animate-float-slow" ? "float-slow 7s" : animClass === "animate-float-med" ? "float-med 5s" : "float-fast 4s"} ease-in-out infinite`,
        animationDelay: `${delay * 1000}ms`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 + delay, duration: 0.6 }}
    />
  );
}

/* ── Plus Sign ── */
function Plus({
  className = "", size = 18, delay = 0,
  offsetX, offsetY, parallaxMultiplier = 90,
  color = "var(--color-text-faint)",
}: ParticleBase & { size?: number; color?: string }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        width: size, height: size,
        transform: `translate3d(${offsetX * parallaxMultiplier}px, ${offsetY * parallaxMultiplier}px, 0)`,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
        animation: "float-med 6s ease-in-out infinite",
        animationDelay: `${delay * 1000}ms`,
      }}
      initial={{ opacity: 0, rotate: -45 }}
      animate={{ opacity: 0.5, rotate: 0 }}
      transition={{ delay: 1 + delay, duration: 0.6 }}
    >
      <div className="absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2" style={{ background: color }} />
      <div className="absolute top-0 left-1/2 w-[1.5px] h-full -translate-x-1/2" style={{ background: color }} />
    </motion.div>
  );
}

/* ── Triangle ── */
function Triangle({
  className = "", size = 14, delay = 0,
  offsetX, offsetY, parallaxMultiplier = 110,
  color = "var(--color-text-faint)",
}: ParticleBase & { size?: number; color?: string }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        width: 0, height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
        opacity: 0.35,
        transform: `translate3d(${offsetX * parallaxMultiplier}px, ${offsetY * parallaxMultiplier}px, 0)`,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
        animation: "float-slow 8s ease-in-out infinite",
        animationDelay: `${delay * 1200}ms`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.35, scale: 1 }}
      transition={{ delay: 0.9 + delay, duration: 0.5 }}
    />
  );
}

/* ── Ring ── */
function Ring({
  className = "", size = 60, delay = 0,
  offsetX, offsetY, parallaxMultiplier = 50,
}: ParticleBase & { size?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full border-2 border-[var(--color-border)] ${className}`}
      style={{
        width: size, height: size,
        transform: `translate3d(${offsetX * parallaxMultiplier}px, ${offsetY * parallaxMultiplier}px, 0)`,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
        animation: "pulse-soft 5s ease-in-out infinite",
        animationDelay: `${delay * 800}ms`,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.3, scale: 1 }}
      transition={{ delay: 0.6 + delay, duration: 0.8 }}
    />
  );
}

/* ── Diamond ── */
function Diamond({
  className = "", size = 12, delay = 0,
  offsetX, offsetY, parallaxMultiplier = 120,
  color = "var(--color-pop)",
}: ParticleBase & { size?: number; color?: string }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        width: size, height: size,
        border: `1.5px solid ${color}`,
        opacity: 0.4,
        transform: `translate3d(${offsetX * parallaxMultiplier}px, ${offsetY * parallaxMultiplier}px, 0) rotate(45deg)`,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
        animation: "spin-slow 20s linear infinite",
        animationDelay: `${delay * 600}ms`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.4, scale: 1 }}
      transition={{ delay: 0.9 + delay, duration: 0.5 }}
    />
  );
}

/* ── Dot ── */
function Dot({
  className = "", size = 4, delay = 0,
  offsetX, offsetY, parallaxMultiplier = 130,
  color = "var(--color-pop)",
}: ParticleBase & { size?: number; color?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{
        width: size, height: size,
        background: color,
        transform: `translate3d(${offsetX * parallaxMultiplier}px, ${offsetY * parallaxMultiplier}px, 0)`,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
        animation: "pulse-soft 4s ease-in-out infinite",
        animationDelay: `${delay * 500}ms`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ delay: 1 + delay, duration: 0.4 }}
    />
  );
}

export default function FloatingShapes({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ─── Top Left ─── */}
      <Plus className="top-[10%] left-[6%]" size={20} delay={0} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={100} color="var(--color-pop)" />
      <Circle className="top-[18%] left-[12%]" size={8} delay={0.2} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={130} />
      <Triangle className="top-[28%] left-[8%]" size={12} delay={0.1} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={115} color="var(--color-pop)" />
      <Diamond className="top-[14%] left-[20%]" size={10} delay={0.3} offsetX={offsetX} offsetY={offsetY} />

      {/* ─── Top Right ─── */}
      <Ring className="top-[8%] right-[8%]" size={70} delay={0.15} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={40} />
      <Plus className="top-[22%] right-[5%]" size={16} delay={0.25} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={95} />
      <Dot className="top-[12%] right-[18%]" size={5} delay={0.1} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={140} />
      <Circle className="top-[30%] right-[12%]" size={6} delay={0.35} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={120} color="var(--color-pop)" animClass="animate-float-fast" />
      <Triangle className="top-[16%] right-[22%]" size={10} delay={0.4} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={105} />

      {/* ─── Bottom Left ─── */}
      <Circle className="bottom-[20%] left-[5%]" size={12} delay={0.3} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={110} animClass="animate-float-med" />
      <Plus className="bottom-[30%] left-[14%]" size={14} delay={0.2} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={80} />
      <Diamond className="bottom-[15%] left-[10%]" size={8} delay={0.45} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={135} />
      <Ring className="bottom-[35%] left-[2%]" size={45} delay={0.5} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={35} />
      <Dot className="bottom-[25%] left-[20%]" size={4} delay={0.15} offsetX={offsetX} offsetY={offsetY} />

      {/* ─── Bottom Right ─── */}
      <Plus className="bottom-[18%] right-[10%]" size={18} delay={0.35} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={90} color="var(--color-pop)" />
      <Circle className="bottom-[28%] right-[6%]" size={10} delay={0.4} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={125} animClass="animate-float-fast" />
      <Triangle className="bottom-[22%] right-[18%]" size={14} delay={0.5} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={100} color="var(--color-pop)" />
      <Diamond className="bottom-[32%] right-[14%]" size={14} delay={0.25} offsetX={offsetX} offsetY={offsetY} />

      {/* ─── Center Sides ─── */}
      <Dot className="top-[45%] left-[2%]" size={6} delay={0.6} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={140} color="var(--color-pop)" />
      <Plus className="top-[50%] right-[3%]" size={12} delay={0.55} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={85} />
      <Circle className="top-[55%] left-[18%]" size={5} delay={0.65} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={150} color="var(--color-pop)" animClass="animate-float-med" />
      <Triangle className="top-[40%] right-[20%]" size={8} delay={0.7} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={110} />
      <Dot className="top-[60%] right-[15%]" size={3} delay={0.4} offsetX={offsetX} offsetY={offsetY} parallaxMultiplier={145} />
    </div>
  );
}
