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
 * Scroll reveal animation.
 * Mobile: lightweight opacity + gentle slide (respects iOS Safari GPU limits).
 * Desktop: full directional animations.
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
  const isInView = useInView(ref, {
    once,
    margin: isMobile ? "-20% 0px" : "-50px 0px",
  });

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  // Mobile: lightweight fade + gentle slide-up
  if (isMobile) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  // Desktop: full animations
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
 * Stagger container.
 * Mobile: enabled with safe IntersectionObserver margin.
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
  const isInView = useInView(ref, {
    once,
    margin: isMobile ? "-20% 0px" : "-30px 0px",
  });

  if (shouldReduceMotion) {
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
 * Stagger item.
 * Mobile: lighter fade + slide (y:10, 0.3s). Desktop: full (y:15, 0.4s).
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

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: isMobile ? 10 : 15 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: isMobile ? 0.3 : 0.4,
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
