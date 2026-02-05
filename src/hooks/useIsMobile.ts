"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Optimized device detection hook.
 * - Checks once on mount (no resize listener by default to avoid re-renders)
 * - Use CSS media queries for responsive animation variants instead
 */
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once to avoid scroll-triggered re-renders
    if (!hasChecked.current) {
      hasChecked.current = true;
      setIsMobile(window.innerWidth < breakpoint);
    }
  }, [breakpoint]);

  return isMobile;
}

/**
 * For cases where you need resize updates (use sparingly).
 * Consider CSS media queries first.
 */
export function useIsMobileWithResize(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
