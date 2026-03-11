"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardSide = "front" | "back";

interface DesignUploaderProps {
  side: CardSide;
  label: string;
  onFileSelect: (file: File) => void;
  currentFile: File | null;
  onClear: () => void;
  previewUrl: string | null;
  compact?: boolean;
}

const ACCEPTED_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/svg+xml": [".svg"],
  "image/webp": [".webp"],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function DesignUploader({
  label,
  onFileSelect,
  currentFile,
  onClear,
  previewUrl,
  compact,
}: DesignUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxSize: MAX_SIZE,
      multiple: false,
    });

  if (currentFile && previewUrl) {
    return (
      <div className="relative">
        <div className="rounded-xl border border-border bg-card overflow-hidden safari-fix-overflow">
          <div className="p-2.5 flex items-center justify-between border-b border-border bg-card/50">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="size-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-foreground truncate">
                {label}
              </span>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                ({(currentFile.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              onClick={onClear}
              className="p-1 rounded-md hover:bg-accent transition-colors flex-shrink-0"
              aria-label={`Remove ${label} design`}
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="p-3 flex items-center justify-center bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`${label} design preview`}
              className={cn("max-w-full object-contain", compact ? "max-h-28" : "max-h-40")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-xl border-2 border-dashed text-center cursor-pointer transition-all duration-200",
          compact ? "p-4 sm:p-6" : "p-6 sm:p-8",
          isDragActive
            ? "border-gold bg-gold/5 scale-[1.01]"
            : "border-border hover:border-gold/50 hover:bg-card/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "rounded-full flex items-center justify-center transition-colors",
              compact ? "size-9" : "size-11",
              isDragActive ? "bg-gold/15" : "bg-muted"
            )}
          >
            <Upload
              className={cn(
                compact ? "size-4" : "size-5",
                isDragActive ? "text-gold" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>
              {isDragActive ? `Drop ${label} design` : label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PNG, JPG, SVG, or WebP
            </p>
          </div>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <p className="text-xs text-destructive mt-1.5">
          {fileRejections[0].errors[0]?.message || "Invalid file."}
        </p>
      )}
    </div>
  );
}

/**
 * PDF uploader — extracts page 1 as front and page 2 as back.
 */
interface PdfUploaderProps {
  onPagesExtracted: (front: File, back: File | null) => Promise<void> | void;
  disabled?: boolean;
}

export function PdfUploader({ onPagesExtracted, disabled }: PdfUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setLoading(true);
      setError(null);
      try {
        const pages = await extractPdfPages(file);
        await onPagesExtracted(pages.front, pages.back);
      } catch (err) {
        console.error("PDF extraction failed:", err);
        setError(
          err instanceof Error ? err.message : "Failed to extract PDF pages."
        );
      } finally {
        setLoading(false);
      }
    },
    [onPagesExtracted]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxSize: 10 * 1024 * 1024,
      multiple: false,
      disabled: disabled || loading,
    });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-4 sm:p-6 text-center cursor-pointer transition-all duration-200",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          isDragActive
            ? "border-gold bg-gold/5 scale-[1.01]"
            : "border-border hover:border-gold/50 hover:bg-card/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "size-9 rounded-full flex items-center justify-center transition-colors",
              loading ? "bg-gold/15" : isDragActive ? "bg-gold/15" : "bg-muted"
            )}
          >
            {loading ? (
              <Loader2 className="size-4 text-gold animate-spin" />
            ) : (
              <FileText
                className={cn(
                  "size-4",
                  isDragActive ? "text-gold" : "text-muted-foreground"
                )}
              />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {loading ? "Extracting pages..." : "Upload PDF"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Page 1 = front, Page 2 = back
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive mt-1.5">{error}</p>
      )}
      {fileRejections.length > 0 && (
        <p className="text-xs text-destructive mt-1.5">
          {fileRejections[0].errors[0]?.message || "Invalid PDF."}
        </p>
      )}
    </div>
  );
}

/**
 * Extract pages from a PDF file as PNG image Files using pdf.js.
 */
async function extractPdfPages(
  pdfFile: File
): Promise<{ front: File; back: File | null }> {
  const pdfjsLib = await import("pdfjs-dist");

  // Use the worker file copied to /public (avoids CDN / CORS / bundler issues)
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const renderPage = async (pageNum: number): Promise<File> => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport } as Parameters<typeof page.render>[0]).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/png");
    });

    const side = pageNum === 1 ? "front" : "back";
    return new File([blob], `${side}-from-pdf.png`, { type: "image/png" });
  };

  const front = await renderPage(1);
  const back = pdf.numPages >= 2 ? await renderPage(2) : null;

  return { front, back };
}
