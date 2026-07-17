"use client";

import { useState, useEffect } from "react";
import { X, Zap, Truck } from "lucide-react";
import { useFreeShipping, formatCountdown } from "@/hooks/useFreeShipping";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const { active, remainingMs } = useFreeShipping();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--announcement-height",
      isVisible ? "36px" : "0px"
    );
    return () => {
      document.documentElement.style.setProperty("--announcement-height", "0px");
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-9 bg-background/95 backdrop-blur-md border-b border-gold/30 flex items-center justify-center px-4">
      {active ? (
        <>
          {/* Campaign: free shipping countdown */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Truck className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
            <span className="text-foreground font-medium">
              Free shipping if you order in the next
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {formatCountdown(remainingMs)}
            </span>
          </div>
          <div className="flex sm:hidden items-center gap-1.5 text-xs">
            <Truck className="w-3 h-3 text-gold" aria-hidden="true" />
            <span className="text-foreground font-medium">Free shipping ends in</span>
            <span className="font-semibold text-foreground tabular-nums">
              {formatCountdown(remainingMs)}
            </span>
          </div>
        </>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Zap className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
              5-7 Day Turnaround
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-foreground">Free Design Consultation</span>
          </div>

          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-foreground">
              <Zap className="w-3 h-3 text-gold" aria-hidden="true" />
              5-7 Day Turnaround
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-foreground">Free Consultation</span>
          </div>
        </>
      )}

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
