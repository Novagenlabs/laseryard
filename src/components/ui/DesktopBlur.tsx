"use client";

import { useIsMobile } from "@/hooks/useIsMobile";

interface DesktopBlurProps {
  className?: string;
}

/**
 * Decorative blur effect that only renders on desktop.
 * On mobile Safari, blur effects can cause blank screen issues.
 */
export function DesktopBlur({ className }: DesktopBlurProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  return <div className={className} />;
}
