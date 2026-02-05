"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

/**
 * SSR-safe device detection using useSyncExternalStore.
 *
 * - Server: returns true (mobile-first, prevents heavy animations in SSR)
 * - Client: immediately returns correct value based on window width
 *
 * This ensures desktop users see animations immediately after hydration.
 */
export function useIsMobile(breakpoint: number = 768) {
  const isMobile = useSyncExternalStore(
    // Subscribe (no-op since we don't need resize updates)
    () => () => {},
    // Client snapshot - check actual window width
    () => window.innerWidth < breakpoint,
    // Server snapshot - assume mobile (safer for performance)
    () => true
  );

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
