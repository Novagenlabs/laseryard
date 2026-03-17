"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { RotateCcw, Crosshair, Eye, QrCode, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ArrowRight } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { DesignUploader, PdfUploader } from "./DesignUploader";
import type { CardSide } from "./DesignUploader";
import { ThresholdControls } from "./ThresholdControls";
import { CardPreview2D } from "./CardPreview2D";
import { StudioShot } from "./StudioShot";
import { loadImage, processDesign } from "@/lib/design-processor";

const CardPreview3D = dynamic(
  () => import("./CardPreview3D").then((mod) => ({ default: mod.CardPreview3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] rounded-2xl bg-card border border-border flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">Loading 3D preview...</p>
        </div>
      </div>
    ),
  }
);

type Step = "choose" | "upload" | "adjust" | "preview";

interface SideState {
  file: File | null;
  originalPreview: string | null;
  originalDataUrl: string | null;
  loadedImage: HTMLImageElement | null;
  engraveDataUrl: string | null;
  threshold: number;
  invert: boolean;
}

const emptySide: SideState = {
  file: null,
  originalPreview: null,
  originalDataUrl: null,
  loadedImage: null,
  engraveDataUrl: null,
  threshold: 128,
  invert: false,
};

export function DesignStudio() {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<Step>("choose");
  const [activeSide, setActiveSide] = useState<CardSide>("front");
  const [front, setFront] = useState<SideState>(emptySide);
  const [back, setBack] = useState<SideState>(emptySide);
  const [showQR, setShowQR] = useState(false);
  const [uploadMode, setUploadMode] = useState<"images" | "pdf">("images");

  const frontTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const backTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const current = activeSide === "front" ? front : back;
  const setCurrent = activeSide === "front" ? setFront : setBack;

  // Convert an HTMLImageElement to a data URL (for passing to the AI)
  const imageToDataUrl = useCallback((img: HTMLImageElement): string => {
    const canvas = document.createElement("canvas");
    // Cap at 800px wide to keep the payload small
    const maxW = 800;
    const scale = img.width > maxW ? maxW / img.width : 1;
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  // Process a file for a given side
  const processFile = useCallback(
    async (file: File, side: CardSide) => {
      const setter = side === "front" ? setFront : setBack;
      const preview = URL.createObjectURL(file);

      try {
        const img = await loadImage(file);
        const result = processDesign(img, { threshold: 128, invert: false });
        const origDataUrl = imageToDataUrl(img);
        setter({
          file,
          originalPreview: preview,
          originalDataUrl: origDataUrl,
          loadedImage: img,
          engraveDataUrl: result,
          threshold: 128,
          invert: false,
        });
        setActiveSide(side);
        setStep("adjust");
      } catch {
        URL.revokeObjectURL(preview);
      }
    },
    [imageToDataUrl]
  );

  const handleFrontSelect = useCallback(
    (file: File) => processFile(file, "front"),
    [processFile]
  );

  const handleBackSelect = useCallback(
    (file: File) => processFile(file, "back"),
    [processFile]
  );

  const handlePdfExtracted = useCallback(
    async (frontFile: File, backFile: File | null) => {
      await processFile(frontFile, "front");
      if (backFile) {
        await processFile(backFile, "back");
      }
    },
    [processFile]
  );

  const handleClear = useCallback(
    (side: CardSide) => {
      const state = side === "front" ? front : back;
      if (state.originalPreview) URL.revokeObjectURL(state.originalPreview);
      const setter = side === "front" ? setFront : setBack;
      setter(emptySide);

      const other = side === "front" ? back : front;
      if (!other.file) {
        setStep("upload");
        setShowQR(false);
      }
    },
    [front, back]
  );

  const handleClearAll = useCallback(() => {
    if (front.originalPreview) URL.revokeObjectURL(front.originalPreview);
    if (back.originalPreview) URL.revokeObjectURL(back.originalPreview);
    setFront(emptySide);
    setBack(emptySide);
    setShowQR(false);
    setStep("upload");
    setActiveSide("front");
  }, [front.originalPreview, back.originalPreview]);

  // Re-process FRONT when its threshold/invert changes
  useEffect(() => {
    if (!front.loadedImage) return;
    clearTimeout(frontTimer.current);
    frontTimer.current = setTimeout(() => {
      const result = processDesign(front.loadedImage!, {
        threshold: front.threshold,
        invert: front.invert,
      });
      setFront((prev) => ({ ...prev, engraveDataUrl: result }));
    }, 50);
    return () => clearTimeout(frontTimer.current);
  }, [front.loadedImage, front.threshold, front.invert]);

  // Re-process BACK when its threshold/invert changes
  useEffect(() => {
    if (!back.loadedImage) return;
    clearTimeout(backTimer.current);
    backTimer.current = setTimeout(() => {
      const result = processDesign(back.loadedImage!, {
        threshold: back.threshold,
        invert: back.invert,
      });
      setBack((prev) => ({ ...prev, engraveDataUrl: result }));
    }, 50);
    return () => clearTimeout(backTimer.current);
  }, [back.loadedImage, back.threshold, back.invert]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (front.originalPreview) URL.revokeObjectURL(front.originalPreview);
      if (back.originalPreview) URL.revokeObjectURL(back.originalPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeEngrave = current.engraveDataUrl;
  const hasAnyDesign = !!(front.file || back.file);
  const hasAnyEngrave = !!(front.engraveDataUrl || back.engraveDataUrl);

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10 sm:mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <p className="text-muted-foreground text-[11px] tracking-[0.35em] uppercase font-medium">
                Design Studio
              </p>
              <span className="px-2 py-0.5 rounded-full bg-foreground/10 text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                Beta
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-balance mb-4">
              See your card before you order
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto text-pretty">
              Upload your logo or design and instantly preview how it will look
              laser-engraved on a matte-black metal business card.
            </p>
          </div>
        </ScrollReveal>

        {/* Steps indicator */}
        {step !== "choose" && (
          <ScrollReveal delay={0.1}>
            <div className="flex items-center justify-center gap-2 mb-10">
              {(["upload", "adjust", "preview"] as const).map((s, i) => {
                const stepIndex = ["upload", "adjust", "preview"].indexOf(step);
                const thisIndex = i;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s
                          ? "bg-foreground text-background"
                          : thisIndex < stepIndex
                          ? "bg-foreground/20 text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < 2 && (
                      <div
                        className={`w-8 sm:w-16 h-px ${
                          thisIndex < stepIndex
                            ? "bg-foreground/40"
                            : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        )}

        {/* Choose path */}
        {step === "choose" && (
          <ScrollReveal delay={0.1}>
            <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-4 mb-10">
              <button
                onClick={() => setStep("upload")}
                className="group p-8 rounded-2xl border border-border bg-card text-left hover:border-foreground/20 transition-all"
              >
                <Upload className="size-8 text-foreground/60 mb-4" />
                <h3 className="text-lg font-semibold mb-2">I have a design</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your artwork and preview it on a metal card in 3D.
                </p>
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I need help designing my metal business card. Can your team help me create something?")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-8 rounded-2xl border border-border bg-card text-left hover:border-foreground/20 transition-all"
              >
                <Crosshair className="size-8 text-foreground/60 mb-4" />
                <h3 className="text-lg font-semibold mb-2">I need a design</h3>
                <p className="text-sm text-muted-foreground">
                  Message us on WhatsApp and we'll help create something for you.
                </p>
              </a>
            </div>
          </ScrollReveal>
        )}

        {/* Main content */}
        {step !== "choose" && (
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left panel: Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload mode toggle */}
            <ScrollReveal delay={0.15}>
              <div className="space-y-4">
                <div className="flex rounded-xl bg-muted p-1">
                  <button
                    onClick={() => setUploadMode("images")}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                      uploadMode === "images"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Upload Images
                  </button>
                  <button
                    onClick={() => setUploadMode("pdf")}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                      uploadMode === "pdf"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Upload PDF
                  </button>
                </div>

                {uploadMode === "images" ? (
                  <div className="space-y-3">
                    <DesignUploader
                      side="front"
                      label="Front Design"
                      onFileSelect={handleFrontSelect}
                      currentFile={front.file}
                      onClear={() => handleClear("front")}
                      previewUrl={front.originalPreview}
                      compact
                    />
                    <DesignUploader
                      side="back"
                      label="Back Design (optional)"
                      onFileSelect={handleBackSelect}
                      currentFile={back.file}
                      onClear={() => handleClear("back")}
                      previewUrl={back.originalPreview}
                      compact
                    />
                  </div>
                ) : (
                  <PdfUploader
                    onPagesExtracted={handlePdfExtracted}
                    disabled={hasAnyDesign}
                  />
                )}

                {hasAnyDesign && (
                  <button
                    onClick={handleClearAll}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-1"
                  >
                    <RotateCcw className="size-3" />
                    Clear all designs
                  </button>
                )}
              </div>
            </ScrollReveal>

            {/* Engrave settings — per side, with side switcher */}
            {hasAnyDesign && (
              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
                  {/* Side switcher for settings */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Crosshair className="size-4 text-foreground/60" />
                      Engrave Settings
                    </h3>
                    <button
                      onClick={() => {
                        setCurrent((prev) => ({
                          ...prev,
                          threshold: 128,
                          invert: false,
                        }));
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </button>
                  </div>

                  {/* Side tabs */}
                  {back.file && (
                    <div className="flex rounded-lg bg-muted p-0.5">
                      <button
                        onClick={() => setActiveSide("front")}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all",
                          activeSide === "front"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Front
                      </button>
                      <button
                        onClick={() => setActiveSide("back")}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all",
                          activeSide === "back"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Back
                      </button>
                    </div>
                  )}

                  {current.loadedImage ? (
                    <>
                      <ThresholdControls
                        threshold={current.threshold}
                        onThresholdChange={(v) => {
                          setCurrent((prev) => ({ ...prev, threshold: v }));
                          setStep("adjust");
                        }}
                        invert={current.invert}
                        onInvertChange={(v) => {
                          setCurrent((prev) => ({ ...prev, invert: v }));
                          setStep("adjust");
                        }}
                      />

                      {/* QR code toggle */}
                      <button
                        onClick={() => setShowQR(!showQR)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                          showQR
                            ? "bg-foreground/10 text-foreground border border-foreground/20"
                            : "bg-muted text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground"
                        }`}
                      >
                        <QrCode className="size-4" />
                        <span>Show QR Code</span>
                      </button>

                      {/* Engrave mask previews — show both if both exist */}
                      <div className={cn(
                        "gap-3",
                        front.engraveDataUrl && back.engraveDataUrl ? "grid grid-cols-2" : "grid grid-cols-1"
                      )}>
                        {front.engraveDataUrl && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1.5">
                              Front mask
                            </p>
                            <div className={cn(
                              "rounded-lg overflow-hidden bg-zinc-900 p-1.5 safari-fix-overflow border",
                              activeSide === "front" ? "border-foreground/40" : "border-transparent"
                            )}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={front.engraveDataUrl}
                                alt="Front engrave mask"
                                className="w-full opacity-90"
                              />
                            </div>
                          </div>
                        )}
                        {back.engraveDataUrl && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1.5">
                              Back mask
                            </p>
                            <div className={cn(
                              "rounded-lg overflow-hidden bg-zinc-900 p-1.5 safari-fix-overflow border",
                              activeSide === "back" ? "border-foreground/40" : "border-transparent"
                            )}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={back.engraveDataUrl}
                                alt="Back engrave mask"
                                className="w-full opacity-90"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Preview button */}
                      <button
                        onClick={() => setStep("preview")}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        <Eye className="size-4" />
                        <span>View on Card</span>
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Upload a {activeSide} design to adjust settings
                    </p>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* AI Studio Shot */}
            {step === "preview" && activeEngrave && (
              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <StudioShot
                    engraveDataUrl={activeEngrave}
                    originalImageDataUrl={current.originalDataUrl}
                    disabled={!activeEngrave}
                  />
                </div>
              </ScrollReveal>
            )}

            {/* Order CTA */}
            {step === "preview" && (
              <ScrollReveal delay={0.2}>
                <div className="rounded-2xl border border-border bg-card p-5 text-center">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Love what you see?
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Message us on WhatsApp to confirm your design and get
                    started.
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I just previewed my design in the Design Studio and I'm ready to order metal business cards. Can we get started?")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Order These Cards
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Right panel: Card preview */}
          <div className="lg:col-span-3">
            <ScrollReveal direction="none">
              <div className="sticky top-28">
                <div className="rounded-2xl border border-border bg-card overflow-hidden safari-fix-overflow">
                  {/* Preview header with front/back toggle */}
                  <div className="p-3 border-b border-border bg-card/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasAnyDesign ? (
                        <div className="flex rounded-lg bg-muted p-0.5">
                          <button
                            onClick={() => setActiveSide("front")}
                            className={cn(
                              "px-3 py-1 rounded-md text-xs font-medium transition-all",
                              activeSide === "front"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            Front
                          </button>
                          <button
                            onClick={() => setActiveSide("back")}
                            disabled={!back.file}
                            className={cn(
                              "px-3 py-1 rounded-md text-xs font-medium transition-all",
                              activeSide === "back"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                              !back.file && "opacity-40 cursor-not-allowed"
                            )}
                          >
                            Back
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Card Preview
                        </span>
                      )}
                    </div>
                    {hasAnyEngrave && (
                      <span className="text-[10px] text-muted-foreground">
                        {isMobile ? "Pinch to zoom" : "Drag to rotate"}
                      </span>
                    )}
                  </div>

                  {/* 3D preview on desktop, 2D on mobile */}
                  {!hasAnyEngrave ? (
                    <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                      <div className="text-center px-8">
                        <div className="size-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                          <Upload className="size-6 text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm">
                          Upload your design to see a live preview
                        </p>
                      </div>
                    </div>
                  ) : isMobile ? (
                    <CardPreview2D
                      engraveDataUrl={activeEngrave}
                      className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-950"
                    />
                  ) : (
                    <CardPreview3D
                      frontTextureUrl={front.engraveDataUrl}
                      backTextureUrl={back.engraveDataUrl}
                      showQR={showQR}
                      className="aspect-[4/3]"
                    />
                  )}
                </div>

                {/* Info note */}
                {hasAnyEngrave && (
                  <p className="text-[11px] text-muted-foreground text-center mt-3 px-4">
                    This preview simulates laser engraving on matte-black
                    aluminum. Actual results may vary slightly depending on
                    design complexity and material finish.
                  </p>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
