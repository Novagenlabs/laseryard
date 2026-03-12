"use client";

import { motion, useReducedMotion, useInView } from "motion/react";
import { ReactNode, useRef } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

type RevealVariant = "clip-up" | "clip-left" | "clip-right" | "scale" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  /** New variant-based API */
  variant?: RevealVariant;
  /** Legacy direction prop, maps to variants */
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

const variantConfig = {
  "clip-up": {
    hidden: { clipPath: "inset(8% 0% 0% 0%)", opacity: 0.3 },
    visible: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
  },
  "clip-left": {
    hidden: { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 },
    visible: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
  },
  "clip-right": {
    hidden: { clipPath: "inset(0% 0% 0% 100%)", opacity: 0 },
    visible: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
  },
  scale: {
    hidden: { scale: 0.96, opacity: 0.4 },
    visible: { scale: 1, opacity: 1 },
  },
  none: {
    hidden: {},
    visible: {},
  },
};

function resolveVariant(variant?: RevealVariant, direction?: string): RevealVariant {
  if (variant) return variant;
  if (direction === "left") return "clip-left";
  if (direction === "right") return "clip-right";
  if (direction === "none") return "none";
  return "clip-up";
}

/**
 * Scroll reveal with clip-path and scale animations.
 * Uses clip-path wipes instead of generic fade-up.
 */
export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  variant,
  direction,
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const isInView = useInView(ref, {
    once,
    margin: isMobile ? "-15% 0px" : "-50px 0px",
  });

  const resolved = resolveVariant(variant, direction);

  if (shouldReduceMotion || resolved === "none") {
    return <div className={className}>{children}</div>;
  }

  const config = variantConfig[resolved];

  return (
    <motion.div
      ref={ref}
      initial={config.hidden}
      animate={isInView ? config.visible : config.hidden}
      transition={{
        duration: isMobile ? 0.4 : duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
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
 * Stagger container for grouped items.
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const isInView = useInView(ref, {
    once,
    margin: isMobile ? "-15% 0px" : "-30px 0px",
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
 * Stagger item with scale-in instead of fade-up.
 */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { scale: 0.94, opacity: 0.2 },
        visible: {
          scale: 1,
          opacity: 1,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
