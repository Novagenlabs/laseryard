"use client";

import { ArrowLeftRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThresholdControlsProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
  invert: boolean;
  onInvertChange: (value: boolean) => void;
}

export function ThresholdControls({
  threshold,
  onThresholdChange,
  invert,
  onInvertChange,
}: ThresholdControlsProps) {
  // When inverted, the threshold behaves in reverse (higher = more detail
  // instead of less), so flip the slider value to keep the UX consistent.
  const sliderMin = 30;
  const sliderMax = 225;
  const displayValue = invert ? sliderMin + sliderMax - threshold : threshold;

  return (
    <div className="space-y-4">
      {/* Threshold slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="threshold"
            className="text-sm font-medium text-foreground"
          >
            Detail Level
          </label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {threshold}
          </span>
        </div>
        <input
          id="threshold"
          type="range"
          min={sliderMin}
          max={sliderMax}
          value={displayValue}
          onChange={(e) => {
            const raw = Number(e.target.value);
            onThresholdChange(invert ? sliderMin + sliderMax - raw : raw);
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
            [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">Less detail</span>
          <span className="text-[10px] text-muted-foreground">More detail</span>
        </div>
      </div>

      {/* Invert toggle */}
      <div className="space-y-2">
        <button
          onClick={() => onInvertChange(!invert)}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
            invert
              ? "bg-gold/15 text-gold border border-gold/30"
              : "bg-muted text-muted-foreground border border-border hover:border-gold/30 hover:text-foreground"
          )}
        >
          <ArrowLeftRight className="size-4" />
          <span>Invert Design</span>
        </button>
        <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
          <Info className="size-3 flex-shrink-0 mt-0.5" />
          Dark designs may not be visible on the card. Use Invert Design to flip light and dark areas.
        </p>
      </div>

      {/* Detail level hint */}
      <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
        <Info className="size-3 flex-shrink-0 mt-0.5" />
        Adjust the detail slider to control how much of your design is engraved. More detail keeps finer lines; less detail simplifies the output.
      </p>
    </div>
  );
}
