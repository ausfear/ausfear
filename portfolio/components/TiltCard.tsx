"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glareEnabled?: boolean;
  onClick?: () => void;
}

export default function TiltCard({
  children,
  className = "",
  tiltAmount = 10,
  glareEnabled = false,
  onClick,
}: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Raw tilt motion values
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useMotionValue(0);

  // Smooth springs for fluid, responsive tilt physics
  const springRotateX = useSpring(rotateX, { stiffness: 220, damping: 22 });
  const springRotateY = useSpring(rotateY, { stiffness: 220, damping: 22 });
  const springGlareOpacity = useSpring(glareOpacity, { stiffness: 250, damping: 25 });

  // Dynamic glare radial gradient
  // --tilt-glare: a dark sheen on light cards, a light one on dark cards (white on white is invisible)
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, var(--tilt-glare) 0%, transparent 65%)`;

  // Listen on the card itself — a window-level listener per card ran getBoundingClientRect
  // on every mouse move anywhere on the page.
  // Mouse only: a tap on a touch screen would tilt the card and leave it stuck, since touch has no "leave".
  const handleMouseMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = x / rect.width - 0.5;
    const normalizedY = y / rect.height - 0.5;

    rotateX.set(-normalizedY * 2 * tiltAmount);
    rotateY.set(normalizedX * 2 * tiltAmount);
    glareX.set((x / rect.width) * 100);
    glareY.set((y / rect.height) * 100);
    glareOpacity.set(1);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onPointerMove={handleMouseMove}
      onPointerLeave={handleMouseLeave}
      style={{ perspective: 1100 }}
      className={`relative select-none ${className}`}
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative"
      >
        {children}

        {glareEnabled && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-20 overflow-hidden"
            style={{
              background: glareBg,
              opacity: springGlareOpacity,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
