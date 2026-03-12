"use client";

import { useState } from "react";
import { Camera, Loader2, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioShotProps {
  engraveDataUrl: string;
  originalImageDataUrl?: string | null;
  disabled?: boolean;
}

const SCENE_OPTIONS = [
  {
    id: "desk",
    label: "On Dark Surface",
    promptSuffix:
      "resting on a dark matte surface with soft gradient lighting",
  },
  {
    id: "marble",
    label: "Marble Desk",
    promptSuffix:
      "placed on a white marble desk surface with natural window light",
  },
  {
    id: "hand",
    label: "Held in Hand",
    promptSuffix:
      "held between two fingers of a professional hand, blurred office background",
  },
  {
    id: "wallet",
    label: "With Wallet",
    promptSuffix:
      "next to an open premium leather wallet on a wooden desk",
  },
] as const;

const MAX_GENERATIONS = 5;
const STORAGE_KEY = "design-studio-gen-count";

function getGenerationCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const today = new Date().toDateString();
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch {
    return 0;
  }
}

function incrementGenerationCount() {
  const today = new Date().toDateString();
  const current = getGenerationCount();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: today, count: current + 1 })
  );
}

export function StudioShot({ engraveDataUrl, originalImageDataUrl, disabled }: StudioShotProps) {
  const [selectedScene, setSelectedScene] = useState<string>("desk");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [genCount, setGenCount] = useState(() => getGenerationCount());

  const remainingGenerations = MAX_GENERATIONS - genCount;
  const canGenerate = remainingGenerations > 0 && !disabled && !isGenerating;

  const scene = SCENE_OPTIONS.find((s) => s.id === selectedScene)!;

  async function handleGenerate() {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError(null);

    const prompt = `Generate a professional product photograph of a laser-engraved metal business card. The card has a matte black anodized finish on brushed stainless steel. The attached image shows the EXACT engrave pattern that must appear on the card — the white areas are where the laser has removed the black coating to reveal shiny brushed metal underneath. You MUST reproduce this exact design faithfully on the card face — same layout, same text, same logo, same positions. Do not alter, simplify, or replace any part of the design. CRITICAL: UV laser engraving on aluminum is physically single-color only. The engraved areas must appear as bare brushed silver/white metal — NEVER add any color (no gold, red, blue, green, etc.) to the engraved design. The only two tones on the card are the matte black coating and the exposed silver brushed metal. The card should be ${scene.promptSuffix}. Studio lighting with soft directional light from upper left creating subtle reflections on the metal surface. Shallow depth of field. Shot on Canon EOS R5 with 100mm macro lens at f/2.8. Hyperrealistic product photography.`;

    try {
      const response = await fetch("/api/design-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          engraveImage: engraveDataUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      incrementGenerationCount();
      setGenCount((c) => c + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          AI Studio Photo
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Generate a photorealistic lifestyle shot of your card.{" "}
          <span className="text-gold tabular-nums">
            {remainingGenerations} of {MAX_GENERATIONS}
          </span>{" "}
          generations remaining today.
        </p>
      </div>

      {/* Scene selector */}
      <div className="grid grid-cols-2 gap-2">
        {SCENE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedScene(option.id)}
            className={cn(
              "py-2 px-3 rounded-xl text-xs font-medium transition-all text-center",
              selectedScene === option.id
                ? "bg-gold/15 text-gold border border-gold/30"
                : "bg-muted text-muted-foreground border border-border hover:border-gold/30"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={cn(
          "w-full btn-apple btn-apple-primary !py-3 !text-sm",
          !canGenerate && "opacity-50 cursor-not-allowed"
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Camera className="size-4" />
            <span>Generate Studio Photo</span>
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Result */}
      {imageUrl && (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="AI-generated studio photo of your metal business card"
            className="w-full rounded-2xl shadow-lg"
          />
          <a
            href={imageUrl}
            download="metal-card-studio-shot.png"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium bg-muted text-foreground border border-border hover:border-gold/30 transition-all"
          >
            <Download className="size-4" />
            <span>Download Photo</span>
          </a>
        </div>
      )}
    </div>
  );
}
