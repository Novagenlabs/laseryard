import * as THREE from "three";

// Procedural textures so the lab needs no asset downloads. Everything is
// drawn on a canvas once and cached by key.

const cache = new Map<string, THREE.CanvasTexture>();

function canvasTexture(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

// Deterministic pseudo-random so the grain is stable between renders.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Wood grain: long wavy fibres over a base tone. */
export function woodTexture(base: string, grain: string, repeatX = 3, repeatY = 1.5, seed = 7) {
  const tex = canvasTexture(`wood:${base}:${grain}:${seed}`, 1024, 512, (ctx) => {
    const rand = rng(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 160; i++) {
      const y = rand() * 512;
      const amp = 2 + rand() * 6;
      const freq = 0.004 + rand() * 0.006;
      ctx.strokeStyle = grain;
      ctx.globalAlpha = 0.05 + rand() * 0.16;
      ctx.lineWidth = 0.6 + rand() * 1.8;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 8) {
        const yy = y + Math.sin(x * freq + i) * amp + Math.sin(x * 0.02 + i * 3) * 0.8;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    // fine noise
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 6000; i++) {
      ctx.fillStyle = rand() > 0.5 ? "#000" : "#fff";
      ctx.fillRect(rand() * 1024, rand() * 512, 1, 1);
    }
    ctx.globalAlpha = 1;
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

/** Wall paneling: vertical boards with slightly different tones. */
export function panelingTexture(base: string, dark: string, boards = 8) {
  const tex = canvasTexture(`panel:${base}:${dark}:${boards}`, 1024, 1024, (ctx) => {
    const rand = rng(31);
    const bw = 1024 / boards;
    for (let b = 0; b < boards; b++) {
      ctx.fillStyle = base;
      ctx.fillRect(b * bw, 0, bw, 1024);
      ctx.globalAlpha = 0.08 + rand() * 0.1;
      ctx.fillStyle = dark;
      ctx.fillRect(b * bw, 0, bw, 1024);
      ctx.globalAlpha = 1;
      ctx.fillStyle = dark;
      ctx.fillRect(b * bw, 0, 3, 1024);
      // grain
      for (let i = 0; i < 40; i++) {
        ctx.strokeStyle = dark;
        ctx.globalAlpha = 0.06 + rand() * 0.1;
        ctx.lineWidth = 1;
        const x = b * bw + rand() * bw;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + 6, 300, x - 6, 700, x + 2, 1024);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

/** The engraved face of the top card: bright aluminum on the finish color. */
export function cardFaceTexture(finishHex: string) {
  return canvasTexture(`card:${finishHex}`, 1032, 648, (ctx) => {
    ctx.fillStyle = finishHex;
    ctx.fillRect(0, 0, 1032, 648);
    const engrave = "#dcdcd8";
    ctx.fillStyle = engrave;
    ctx.strokeStyle = engrave;
    // monogram circle
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(140, 150, 56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = "600 44px Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DG", 140, 166);
    // name + title
    ctx.textAlign = "left";
    ctx.font = "600 68px Helvetica, Arial, sans-serif";
    spaced(ctx, "DANIEL GALLEGO", 90, 360, 10);
    ctx.font = "400 30px Helvetica, Arial, sans-serif";
    spaced(ctx, "SENIOR ARCHITECT", 92, 418, 8);
    ctx.fillRect(92, 468, 300, 3);
    ctx.font = "400 26px Helvetica, Arial, sans-serif";
    spaced(ctx, "+1 415 000 0000   ·   GALLEGO.STUDIO", 92, 530, 3);
  });
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}
