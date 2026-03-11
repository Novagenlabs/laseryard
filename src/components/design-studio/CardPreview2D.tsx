"use client";

import { useEffect, useState } from "react";
import { generate2DPreview } from "@/lib/design-processor";

interface CardPreview2DProps {
  engraveDataUrl: string | null;
  className?: string;
}

/**
 * 2D canvas-based card preview. Used as a fallback on mobile
 * or when Three.js/WebGL is unavailable.
 */
export function CardPreview2D({ engraveDataUrl, className }: CardPreview2DProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!engraveDataUrl) {
      return;
    }

    let cancelled = false;
    generate2DPreview(engraveDataUrl).then((url) => {
      if (!cancelled) setPreviewUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [engraveDataUrl]);

  // Derive empty state from prop, not from effect
  const showEmpty = !engraveDataUrl || !previewUrl;

  if (showEmpty) {
    return (
      <div className={className}>
        <div className="w-full aspect-[85/55] rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-border flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Upload a design to preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt="Metal business card preview with your design laser-engraved"
        className="w-full rounded-2xl shadow-lg"
      />
    </div>
  );
}
