"use client";

import { useRef, useEffect, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
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
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14) 0%, transparent 65%)`;

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const { clientX, clientY } = e;
      const isInside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (isInside) {
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const normalizedX = x / rect.width - 0.5;
        const normalizedY = y / rect.height - 0.5;

        rotateX.set(-normalizedY * 2 * tiltAmount);
        rotateY.set(normalizedX * 2 * tiltAmount);
        glareX.set((x / rect.width) * 100);
        glareY.set((y / rect.height) * 100);
        glareOpacity.set(1);
      } else {
        if (rotateX.get() !== 0 || rotateY.get() !== 0 || glareOpacity.get() !== 0) {
          rotateX.set(0);
          rotateY.set(0);
          glareOpacity.set(0);
          glareX.set(50);
          glareY.set(50);
        }
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [tiltAmount, rotateX, rotateY, glareX, glareY, glareOpacity]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
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
