"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Optimized device detection hook with mobile-first approach.
 *
 * IMPORTANT: Defaults to `true` (mobile) to prevent heavy desktop animations
 * from blocking the main thread on initial page load. After hydration,
 * desktop users will get the full animation experience.
 *
 * This solves the "animation blocking on first load" issue on mobile devices.
 */
export function useIsMobile(breakpoint: number = 768) {
  // Default to TRUE (mobile) - this prevents heavy animations on first render
  // On desktop, it will switch to false after useEffect runs
  const [isMobile, setIsMobile] = useState(true);
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
