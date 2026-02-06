"use client";

import { useState, useEffect } from "react";

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    // Read from early detection script (runs before React hydrates)
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("is-mobile");
    }
    return false;
  });

  useEffect(() => {
    // Verify/correct after mount (handles edge cases like resize before load)
    const checkMobile = window.innerWidth < breakpoint;
    if (checkMobile !== isMobile) {
      setIsMobile(checkMobile);
    }
  }, [breakpoint]);

  return isMobile;
}

export function useIsMobileWithResize(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("is-mobile");
    }
    return false;
  });

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
