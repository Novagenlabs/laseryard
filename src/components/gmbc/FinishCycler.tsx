"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CARD_COLORS } from "@/lib/constants";
import { Arrow, WA_FINISH_URL } from "./shared";

const EVERY_MS = 3000;
const HOLD_MS = 12000;

/**
 * One large card photo that glides through all eleven finishes on its own.
 * Tapping a swatch holds that finish for a while, then the cycle resumes.
 */
export function FinishCycler() {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    if (held) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % CARD_COLORS.length), EVERY_MS);
    return () => window.clearInterval(id);
  }, [held]);

  const hold = (i: number) => {
    setIndex(i);
    setHeld(true);
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHeld(false), HOLD_MS);
  };

  const current = CARD_COLORS[index];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* The card */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ background: "var(--g-surface)" }}>
        <div className="relative aspect-[820/470] w-full overflow-hidden">
          {CARD_COLORS.map((c, i) => (
            <Image
              key={c.id}
              src={`/images/products/colors/${c.id}.webp`}
              alt={`${c.label} metal business cards`}
              fill
              sizes="(min-width: 1024px) 820px, 100vw"
              priority={i === 0}
              className="object-cover transition-opacity duration-700 ease-out"
              style={{ opacity: i === index ? 1 : 0 }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-4 lg:px-6">
          <span className="text-[17px] font-medium lg:text-[18px]">{current.label}</span>
          <span className="g-label" style={{ color: "var(--g-muted)" }}>
            {index + 1} / {CARD_COLORS.length} · {held ? "holding" : "changes every 3 s"}
          </span>
        </div>
      </div>

      {/* Swatches */}
      <div
        className="flex flex-col justify-between gap-8 p-6 lg:w-[436px] lg:shrink-0 lg:p-7"
        style={{ border: "1px solid var(--g-line)" }}
      >
        <div className="flex flex-col gap-3">
          <span className="g-label" style={{ color: "var(--g-accent)", letterSpacing: "0.14em" }}>
            Pick a finish
          </span>
          <p className="text-[15px] leading-6" style={{ color: "var(--g-muted)" }}>
            The card cycles through every finish on its own. Tap one to hold it.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6 lg:grid-cols-4" role="list">
          {CARD_COLORS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="listitem"
              onClick={() => hold(i)}
              aria-pressed={i === index}
              className="flex flex-col items-center gap-2 text-center"
              title={c.label}
            >
              <span
                className="block h-11 w-11"
                style={{
                  background: c.swatch,
                  outline: i === index ? "2px solid var(--g-text)" : "1px solid var(--g-line)",
                  outlineOffset: i === index ? 2 : 0,
                }}
              />
              <span
                className="text-[11px] leading-[14px]"
                style={{ color: i === index ? "var(--g-text)" : "var(--g-muted)" }}
              >
                {c.label.replace("Champagne Gold", "Champagne").replace("Sage Green", "Sage").replace("Cosmic Orange", "Orange")}
              </span>
            </button>
          ))}
        </div>
        <a href={WA_FINISH_URL} target="_blank" rel="noopener noreferrer" className="g-label inline-flex items-center gap-2.5">
          Not sure? Send us your logo <Arrow />
        </a>
      </div>
    </div>
  );
}
