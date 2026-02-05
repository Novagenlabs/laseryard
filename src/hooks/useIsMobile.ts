"use client";

import { useState, useEffect } from "react";

/**
 * Device detection hook.
 *
 * - Default: false (desktop) - shows animations
 * - After mount on mobile: switches to true - disables animations
 *
 * Desktop gets animations immediately. Mobile briefly sees animations
 * then they're disabled (better than freezing).
 */
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check immediately on mount
    const checkMobile = window.innerWidth < breakpoint;
    if (checkMobile) {
      setIsMobile(true);
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
