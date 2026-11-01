"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CARD_COLORS } from "@/lib/constants";
import { Arrow, WA_FINISH_URL } from "./shared";

// Three.js only runs in the browser; the panel stays a quiet dark surface until it is ready.
const CardStage3D = dynamic(() => import("./CardStage3D").then((m) => m.CardStage3D), { ssr: false });

// Left alone, the card alternates the two hero finishes; a tap holds any finish for a while.
const EVERY_MS = 4400;
const HOLD_MS = 12000;
const BLACK = CARD_COLORS.findIndex((c) => c.id === "black");
const SILVER = CARD_COLORS.findIndex((c) => c.id === "silver");

/**
 * One large card photo that glides through all eleven finishes on its own.
 * Tapping a swatch holds that finish for a while, then the cycle resumes.
 */
type Stat = [value: string, label: string];

export function FinishCycler({ stats = [] }: { stats?: Stat[] }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [ready, setReady] = useState(false);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    if (held) return;
    const id = window.setInterval(() => setIndex((i) => (i === BLACK ? SILVER : BLACK)), EVERY_MS);
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
        <div
          className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[820/470]"
          style={{ background: "radial-gradient(70% 90% at 50% 42%, #2a2a2a 0%, var(--g-surface) 72%)" }}
          role="img"
          aria-label={`${current.label} metal business card`}
        >
          <div className="absolute inset-0 transition-opacity duration-700 ease-out" style={{ opacity: ready ? 1 : 0 }}>
            <CardStage3D finish={current} onReady={() => setReady(true)} />
          </div>
          <span
            className="g-label pointer-events-none absolute right-4 top-4 rounded-sm px-2 py-1 transition-opacity duration-700 lg:right-5"
            style={{ color: "var(--g-text)", background: "rgba(10,10,10,0.55)", opacity: ready ? 1 : 0 }}
          >
            Drag to turn
          </span>
        </div>
        <div className="flex items-center px-5 py-4 lg:px-6">
          <span className="text-[17px] font-medium lg:text-[18px]">{current.label}</span>
        </div>
        {stats.length > 0 && (
          <dl className="grid grid-cols-3 gap-4 px-5 py-5 lg:px-6" style={{ borderTop: "1px solid var(--g-line)" }}>
            {stats.map(([n, l]) => (
              <div key={l} className="flex flex-col gap-1.5">
                <dt className="text-[32px] font-medium leading-none tracking-[-0.04em] lg:text-[40px]">{n}</dt>
                <dd className="text-[13px] leading-[18px]" style={{ color: "var(--g-muted)" }}>
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        )}
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
            The card alternates black and silver on its own. Tap any finish to hold it.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6 lg:grid-cols-4" role="group" aria-label="Finishes">
          {CARD_COLORS.map((c, i) => (
            <button
              key={c.id}
              type="button"
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
