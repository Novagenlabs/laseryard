/**
 * Client-side image processing for laser engraving preview.
 * Converts multi-color designs to single-color engrave-ready format.
 *
 * How laser engraving works:
 * - A coating (e.g. matte black) covers brushed metal
 * - The laser REMOVES coating, revealing shiny metal underneath
 * - Result: dark areas = coating stays, bright areas = metal exposed
 */

export interface ProcessOptions {
  /** 0–255: pixels darker than this become "engraved" (metal shows) */
  threshold: number;
  /** Invert the result (swap engraved/coated areas) */
  invert: boolean;
  /** Output width in pixels */
  outputWidth: number;
  /** Output height in pixels */
  outputHeight: number;
}

const DEFAULT_OPTIONS: ProcessOptions = {
  threshold: 128,
  invert: false,
  outputWidth: 850,
  outputHeight: 550,
};

/**
 * Load an image file into an HTMLImageElement.
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Process an image into a laser-engravable single-color format.
 * Returns a data URL of the processed image (white on transparent).
 *
 * The output is an alpha mask:
 * - White pixels = areas where coating is removed (metal shows through)
 * - Transparent pixels = areas where coating remains
 */
export function processDesign(
  img: HTMLImageElement,
  options: Partial<ProcessOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const canvas = document.createElement("canvas");
  canvas.width = opts.outputWidth;
  canvas.height = opts.outputHeight;
  const ctx = canvas.getContext("2d")!;

  // Draw image scaled to fit card proportions (85mm x 55mm)
  const imgAspect = img.width / img.height;
  const cardAspect = opts.outputWidth / opts.outputHeight;

  let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

  if (imgAspect > cardAspect) {
    // Image is wider than card — fit by width, center vertically
    drawWidth = opts.outputWidth;
    drawHeight = opts.outputWidth / imgAspect;
    offsetX = 0;
    offsetY = (opts.outputHeight - drawHeight) / 2;
  } else {
    // Image is taller — fit by height, center horizontally
    drawHeight = opts.outputHeight;
    drawWidth = opts.outputHeight * imgAspect;
    offsetX = (opts.outputWidth - drawWidth) / 2;
    offsetY = 0;
  }

  // Clear to transparent
  ctx.clearRect(0, 0, opts.outputWidth, opts.outputHeight);
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, opts.outputWidth, opts.outputHeight);
  const data = imageData.data;

  // Convert to engrave mask
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip fully transparent pixels
    if (a < 10) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }

    // Convert to grayscale using luminance weights
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply threshold: dark areas in original become engraved (metal exposed)
    let engraved = gray < opts.threshold;
    if (opts.invert) engraved = !engraved;

    if (engraved) {
      // Engraved: white pixel with full alpha (metal shows through)
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    } else {
      // Not engraved: transparent (coating stays)
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Generate a 2D composite preview: processed design overlaid on a card template.
 * Used as a fallback when Three.js is unavailable (mobile/low-power).
 */
export function generate2DPreview(
  engraveDataUrl: string,
  cardColor: string = "#1a1a1a",
  metalColor: string = "#c0c0c0",
  cornerRadius: number = 20,
  textureStrength: number = 1,
  width: number = 850,
  height: number = 550
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Draw card base (dark coating)
    ctx.fillStyle = cardColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, cornerRadius);
    ctx.fill();

    // Add subtle brushed metal texture to the whole card
    addBrushedMetalTexture(ctx, width, height, 0.03 * textureStrength);

    // Load and composite the engrave mask
    const engraveImg = new Image();
    engraveImg.onload = () => {
      // Create temp canvas for the metal-revealed areas
      const metalCanvas = document.createElement("canvas");
      metalCanvas.width = width;
      metalCanvas.height = height;
      const metalCtx = metalCanvas.getContext("2d")!;

      // Draw metal color as base
      metalCtx.fillStyle = metalColor;
      metalCtx.fillRect(0, 0, width, height);

      // Add prominent brushed metal texture to revealed areas
      addBrushedMetalTexture(metalCtx, width, height, 0.15 * textureStrength);

      // Use engrave mask to cut out the metal
      metalCtx.globalCompositeOperation = "destination-in";
      metalCtx.drawImage(engraveImg, 0, 0);

      // Composite metal onto card
      ctx.drawImage(metalCanvas, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };
    engraveImg.src = engraveDataUrl;
  });
}

/**
 * Add a subtle horizontal brushed metal texture effect.
 */
function addBrushedMetalTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    // Create horizontal line variation
    const lineNoise = (Math.random() - 0.5) * 255 * opacity;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const pixelNoise = (Math.random() - 0.5) * 255 * opacity * 0.3;
      const noise = lineNoise + pixelNoise;

      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
