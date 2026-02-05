"use client";

import { motion, useReducedMotion, useInView } from "motion/react";
import { ReactNode, useRef } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

/**
 * Scroll reveal animation - DISABLED on mobile for performance.
 * Mobile gets instant static content, desktop gets smooth animations.
 */
export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const isInView = useInView(ref, { once, margin: "-50px 0px" });

  // Mobile: No animations at all - just render children
  if (isMobile || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  // Desktop: Full animations
  const getOffset = () => {
    if (direction === "none") return {};
    return { y: direction === "down" ? -20 : 20 };
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...getOffset() }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, ...getOffset() }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

/**
 * Stagger container - DISABLED on mobile for performance.
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const isInView = useInView(ref, { once, margin: "-30px 0px" });

  // Mobile: No animations
  if (isMobile || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger item - DISABLED on mobile for performance.
 */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Mobile: No animations
  if (isMobile || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
