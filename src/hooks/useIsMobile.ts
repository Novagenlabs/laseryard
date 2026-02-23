"use client";

import { useState, useEffect } from "react";

export function useIsMobile(breakpoint: number = 768) {
  // Always start false to match SSR — avoids hydration mismatch.
  // The inline script in layout.tsx sets the `is-mobile` CSS class for
  // immediate styling, but React state must match server on first render.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < breakpoint;
      setIsMobile(mobile);
      document.documentElement.classList.toggle("is-mobile", mobile);
    };

    check();

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(check, 150);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [breakpoint]);

  return isMobile;
}
