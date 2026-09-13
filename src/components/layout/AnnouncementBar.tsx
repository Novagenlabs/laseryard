"use client";

import { useState, useEffect } from "react";
import { X, Zap, Truck } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

// Desktop only: on phones the bar ate a strip of a small screen and, once
// dismissed, left a gap under the header — so it neither renders nor
// reserves height there (the header reads --announcement-height).
export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const mobile = isMobile || window.innerWidth < 768;
    document.documentElement.style.setProperty(
      "--announcement-height",
      isVisible && !mobile ? "36px" : "0px"
    );
    return () => {
      document.documentElement.style.setProperty("--announcement-height", "0px");
    };
  }, [isVisible, isMobile]);

  if (!isVisible || isMobile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-9 bg-background/95 backdrop-blur-md border-b border-gold/30 hidden md:flex items-center justify-center px-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Truck className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
          Worldwide Shipping Included
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Zap className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
          Rush Production Available
        </span>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gold/10 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
      </button>
    </div>
  );
}
