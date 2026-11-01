"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, OrbitControls, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

export type StageFinish = { id: string; label: string; swatch: string };

// Card proportions: 86 × 54 × 0.8 mm, scaled so the long edge is 3.4 units.
const W = 3.4;
const H = 2.2;
const D = 0.032;
const CORNER = 0.12;
const BEVEL = 0.004;
// Engraving planes sit just above the bevelled faces, otherwise the body hides them.
const FACE = D / 2 + BEVEL + 0.002;

function luminance(hex: string) {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/**
 * How each anodized finish behaves under light. The laser cuts through the
 * dye to a white undercoat, so engraving reads white on dark finishes; on
 * light dyes and on bare silver it reads dark.
 */
function surfaceFor(id: string, swatch: string) {
  const engrave = id === "silver" || luminance(swatch) > 0.5 ? "#262626" : "#f4f4f4";
  if (id === "silver") return { metalness: 1, roughness: 0.46, engrave };
  if (id === "gold") return { metalness: 1, roughness: 0.5, engrave };
  if (id === "black") return { metalness: 0.9, roughness: 0.62, engrave };
  return { metalness: 0.8, roughness: 0.56, engrave };
}

/** Fine, direction-free speckle: the sandblasted grain of a matte anodized surface. */
function makeMatteGrainTexture() {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + Math.floor(Math.random() * 105);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.5, 0.5);
  tex.anisotropy = 8;
  return tex;
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function drawSpaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  return cx;
}

function measureSpaced(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + spacing;
  return w - spacing;
}

/**
 * Everything painted white becomes bare, engraved metal. Painters work in a
 * fixed 2048 × 1325 space; the texture is rendered at TEX_W.
 */
type Painter = (ctx: CanvasRenderingContext2D) => void;
type Design = { name: string; front: Painter; back: Painter };

const TEX_W = 1536;
const ART_W = 2048;
const ART_H = Math.round((ART_W * H) / W);

function paintTexture(paint: Painter) {
  const w = TEX_W;
  const h = Math.round((w * H) / W);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.scale(w / ART_W, w / ART_W);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  paint(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function centered(ctx: CanvasRenderingContext2D, text: string, y: number, spacing: number) {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawSpaced(ctx, text, ART_W / 2 - measureSpaced(ctx, text, spacing) / 2, y, spacing);
}

const ARABIC_FONT = "'Geeza Pro', 'Noto Naskh Arabic', 'Segoe UI', Arial, sans-serif";

/** Two squares, one turned 45°: the eight-point star of Islamic geometry. */
function eightPointStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.rect(-r, -r, 2 * r, 2 * r);
  ctx.stroke();
  ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.rect(-r, -r, 2 * r, 2 * r);
  ctx.stroke();
  ctx.restore();
}

/** An engineer's reticle: circle, four ticks, centre point. */
function reticle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.3, cy);
  ctx.lineTo(cx - r * 0.55, cy);
  ctx.moveTo(cx + r * 0.55, cy);
  ctx.lineTo(cx + r * 1.3, cy);
  ctx.moveTo(cx, cy - r * 1.3);
  ctx.lineTo(cx, cy - r * 0.55);
  ctx.moveTo(cx, cy + r * 0.55);
  ctx.lineTo(cx, cy + r * 1.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();
}

const SERIF = "Georgia, 'Times New Roman', serif";

/** Serif small caps: the first letter of each word tall, the rest smaller, all uppercase. */
function smallCaps(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, big: number, small: number, spacing: number) {
  const parts = [...text].map((ch, i) => ({ ch: ch.toUpperCase(), big: i === 0 || text[i - 1] === " " }));
  let w = -spacing;
  for (const p of parts) {
    ctx.font = `600 ${p.big ? big : small}px ${SERIF}`;
    w += ctx.measureText(p.ch).width + spacing;
  }
  let x = cx - w / 2;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  for (const p of parts) {
    ctx.font = `600 ${p.big ? big : small}px ${SERIF}`;
    ctx.fillText(p.ch, x, y);
    x += ctx.measureText(p.ch).width + spacing;
  }
}

/** A jet seen from above, nose up, about 240 units tall around the origin. */
function jet(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -120);
  ctx.quadraticCurveTo(14, -100, 14, -40);
  ctx.lineTo(14, 70);
  ctx.quadraticCurveTo(12, 100, 6, 112);
  ctx.lineTo(-6, 112);
  ctx.quadraticCurveTo(-12, 100, -14, 70);
  ctx.lineTo(-14, -40);
  ctx.quadraticCurveTo(-14, -100, 0, -120);
  ctx.fill();
  for (const side of [1, -1]) {
    ctx.beginPath();
    ctx.moveTo(side * 13, -20);
    ctx.lineTo(side * 120, 60);
    ctx.lineTo(side * 120, 78);
    ctx.lineTo(side * 13, 36);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(side * 8, 86);
    ctx.lineTo(side * 52, 112);
    ctx.lineTo(side * 52, 122);
    ctx.lineTo(side * 6, 108);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(side > 0 ? 40 : -56, 20, 16, 44, 8);
    ctx.fill();
  }
}

/** A band of chevrons pointing right: a stylised wing. */
function chevrons(ctx: CanvasRenderingContext2D, x: number, y: number, count: number, w: number, h: number, gap: number) {
  for (let i = 0; i < count; i++) {
    const x0 = x + i * (w + gap);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + w, y);
    ctx.lineTo(x0 + w + h / 2, y + h / 2);
    ctx.lineTo(x0 + w, y + h);
    ctx.lineTo(x0, y + h);
    ctx.lineTo(x0 + h / 2, y + h / 2);
    ctx.closePath();
    ctx.fill();
  }
}

/** A lightning bolt, about 300 units tall around the origin. */
function bolt(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const pts: [number, number][] = [
    [-40, -150],
    [60, -150],
    [10, -30],
    [80, -30],
    [-60, 150],
    [-20, 10],
    [-90, 10],
  ];
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(cx + px * s, cy + py * s) : ctx.lineTo(cx + px * s, cy + py * s)));
  ctx.closePath();
  ctx.fill();
}

/** Sample cards for the markets we sell into, from quiet to bold. */
/**
 * Sample cards, set the way the best minimalist typographic cards are: one
 * element carries each face, one or two lines of small tracked capitals say
 * the rest, and the metal does the talking. Coordinates are 2048 × 1325.
 */
const DESIGNS: Design[] = [
  {
    name: "Alex Carter · New York",
    front: (ctx) => {
      ctx.font = `500 76px ${FONT}`;
      centered(ctx, "ALEX CARTER", 640, 34);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ART_W / 2 - 70, 712);
      ctx.lineTo(ART_W / 2 + 70, 712);
      ctx.stroke();
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "FOUNDER & CEO   ·   CARTER HOLDINGS", 800, 12);
    },
    back: (ctx) => {
      ctx.font = `300 380px ${FONT}`;
      centered(ctx, "AC", ART_H / 2 + 120, 10);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "carterholdings.com", 1120, 6);
    },
  },
  {
    name: "Lukas Brandt · München",
    front: (ctx) => {
      ctx.lineWidth = 6;
      reticle(ctx, 1790, 320, 54);
      ctx.font = `500 124px ${FONT}`;
      drawSpaced(ctx, "Lukas Brandt", 236, 900, 6);
      ctx.font = `400 56px ${FONT}`;
      drawSpaced(ctx, "DIPL.-ING.   ·   GESCHÄFTSFÜHRER", 244, 990, 10);
    },
    back: (ctx) => {
      ctx.font = `500 88px ${FONT}`;
      centered(ctx, "BRANDT", ART_H / 2 + 20, 40);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "MASCHINENBAU GMBH   ·   MÜNCHEN", ART_H / 2 + 120, 10);
    },
  },
  {
    name: "Khalid Al-Mansouri · Dubai",
    front: (ctx) => {
      ctx.save();
      ctx.font = `500 110px ${ARABIC_FONT}`;
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.fillText("خالد المنصوري", ART_W / 2, 560);
      ctx.restore();
      ctx.font = `500 66px ${FONT}`;
      centered(ctx, "KHALID AL-MANSOURI", 690, 22);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "MANAGING PARTNER   ·   AL MANSOURI CAPITAL", 790, 10);
    },
    back: (ctx) => {
      ctx.lineWidth = 6;
      eightPointStar(ctx, ART_W / 2, ART_H / 2 - 60, 130);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "almansouri.ae", 1120, 6);
    },
  },
  {
    name: "Élodie Marchand · Paris",
    front: (ctx) => {
      ctx.font = `300 150px ${FONT}`;
      centered(ctx, "Élodie Marchand", 680, 4);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "MAISON MARCHAND   —   PARIS", 790, 20);
    },
    back: (ctx) => {
      ctx.font = `300 340px ${FONT}`;
      centered(ctx, "MM", ART_H / 2 + 110, 6);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "maisonmarchand.fr", 1120, 6);
    },
  },
  {
    name: "The Jet Business · London",
    front: (ctx) => {
      ctx.save();
      ctx.translate(ART_W / 2, 400);
      ctx.rotate(0.5);
      ctx.scale(0.7, 0.7);
      jet(ctx);
      ctx.restore();
      smallCaps(ctx, "The Jet Business", ART_W / 2, 700, 112, 86, 10);
      ctx.font = `700 54px ${FONT}`;
      centered(ctx, "STEVE VARSANO", 800, 10);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "+44 (0) 845 527 5595   ·   thejetbusiness.com", 890, 3);
    },
    back: (ctx) => {
      ctx.save();
      ctx.translate(ART_W / 2, ART_H / 2 - 40);
      ctx.rotate(0.5);
      ctx.scale(1.6, 1.6);
      jet(ctx);
      ctx.restore();
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "thejetbusiness.com", 1120, 6);
    },
  },
  {
    name: "Skybridge Aviation · Miami",
    front: (ctx) => {
      chevrons(ctx, 240, 290, 1, 38, 110, 0);
      ctx.font = `500 120px ${FONT}`;
      drawSpaced(ctx, "Skybridge Aviation", 232, 900, 4);
      ctx.font = `400 56px ${FONT}`;
      drawSpaced(ctx, "AIRCRAFT SALES & ACQUISITIONS   ·   MIAMI", 244, 990, 10);
    },
    back: (ctx) => {
      chevrons(ctx, ART_W / 2 - 160, ART_H / 2 - 160, 3, 50, 220, 60);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "skybridgeaviation.com", 1120, 6);
    },
  },
  {
    name: "Hartwell & Sons · London",
    front: (ctx) => {
      ctx.font = `600 140px ${SERIF}`;
      centered(ctx, "Hartwell & Sons", 660, 4);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "FINE JEWELLERS   ·   BOND STREET   ·   SINCE 1884", 770, 12);
    },
    back: (ctx) => {
      ctx.font = `600 420px ${SERIF}`;
      centered(ctx, "H", ART_H / 2 + 140, 0);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "hartwellandsons.co.uk", 1120, 6);
    },
  },
  {
    name: "Volt Studio · Berlin",
    front: (ctx) => {
      bolt(ctx, 268, 330, 0.36);
      ctx.font = `800 220px ${FONT}`;
      drawSpaced(ctx, "volt", 224, 900, 2);
      ctx.font = `400 56px ${FONT}`;
      drawSpaced(ctx, "STUDIO FÜR DESIGN   ·   BERLIN", 244, 990, 10);
    },
    back: (ctx) => {
      bolt(ctx, ART_W / 2, ART_H / 2 - 50, 1.3);
      ctx.font = `400 56px ${FONT}`;
      centered(ctx, "volt.studio", 1120, 6);
    },
  },
];

/**
 * Choreography. The card holds a three-quarter pose long enough to read, turns
 * half a circle on a strong S-curve, settles with a tiny overshoot, holds the
 * back, and turns again. One cycle shows one design on both faces.
 */
const BEATS = { front: 3.8, turn: 1.4, back: 2.2 } as const;
const CYCLE = BEATS.front + BEATS.turn + BEATS.back + BEATS.turn;
const POSE_YAW = -0.28;
type Phase = "front" | "turn1" | "back" | "turn2";

/** CSS-style cubic bezier easing (Newton–Raphson on the x axis). */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const dx = sampleX(t) - x;
      const d = slopeX(t);
      if (Math.abs(dx) < 1e-5 || d === 0) break;
      t = Math.min(1, Math.max(0, t - dx / d));
    }
    return sampleY(t);
  };
}
// Strong ease-in-out for on-screen movement.
const easeTurn = cubicBezier(0.77, 0, 0.175, 1);

type InteractRef = { current: { active: boolean; resumeAt: number } };
type FloatRef = { current: { lift: number } };
const _normal = new THREE.Vector3();
const _toCam = new THREE.Vector3();


// The maglev display doubles as the cards' storage box: a leather base and lid,
// a gunmetal levitation disc on top, and the card floating above it.
const BOX = { w: 3.9, d: 2.7, baseH: 0.5, lidH: 0.3, seam: 0.015 };
const BOX_TOP = BOX.baseH + BOX.seam + BOX.lidH;
const DISC_H = 0.04;
const DISC_TOP = BOX_TOP + DISC_H;
const HOVER = 0.3;
const CARD_Y = DISC_TOP + HOVER + H / 2;

/** Pebbled leather grain: soft random blobs used as a bump and roughness map. */
function makeLeatherTexture() {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  // Bright base so the roughness stays high (matte leather); blobs dip it a little.
  ctx.fillStyle = "#d4d4d4";
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 2600; i++) {
    const r = 3 + Math.random() * 7;
    const v = Math.floor(150 + Math.random() * 60);
    ctx.fillStyle = `rgba(${v},${v},${v},${0.5 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * s, Math.random() * s, r, r * (0.7 + Math.random() * 0.5), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 8;
  return tex;
}

const OFFICE_VIEW = "/images/gmbc/office-nyc-view.jpg";

/**
 * The desk the box stands on, matched to the dark lacquer desk in the panorama.
 * It mirrors the box, the card and the skyline, and its far edge lands just
 * below the panorama desk's far edge so the two read as one surface.
 */
function DeskTop() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 7.5]}>
      <planeGeometry args={[60, 25]} />
      <MeshReflectorMaterial
        blur={[320, 90]}
        resolution={768}
        mixBlur={1}
        mixStrength={2.2}
        roughness={0.55}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0a0a0b"
        metalness={0.6}
        mirror={0.55}
      />
    </mesh>
  );
}

/**
 * The office behind the card: a single sharp view of the Manhattan corner
 * office on a far plane. The camera only orbits a few degrees, so a plane
 * reads like the room, and the desk still mirrors it.
 */
function OfficeView() {
  const map = useTexture(OFFICE_VIEW);
  return (
    <mesh position={[0, -3.6, -40]}>
      <planeGeometry args={[86, 57.3]} />
      <meshBasicMaterial map={map} toneMapped={false} color="#d8d8d8" />
    </mesh>
  );
}

function MaglevBox({ float }: { float: FloatRef }) {
  const ring = useRef<THREE.MeshStandardMaterial>(null);
  const lamp = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const l = float.current.lift;
    if (ring.current) ring.current.emissiveIntensity = 0.85 + 0.35 * l;
    if (lamp.current) lamp.current.intensity = 0.9 + 0.4 * l;
  });
  const leather = useMemo(() => {
    const grain = makeLeatherTexture();
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1f1c1a"),
      roughness: 1,
      metalness: 0,
      bumpMap: grain,
      bumpScale: 0.025,
      roughnessMap: grain,
      sheen: 0.9,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#4a3f36"),
    });
  }, []);

  return (
    <group>
      {/* base */}
      <RoundedBox args={[BOX.w, BOX.baseH, BOX.d]} radius={0.07} smoothness={6} position={[0, BOX.baseH / 2, 0]} material={leather} />
      {/* lid, with a thin seam so it reads as a box that opens */}
      <RoundedBox
        args={[BOX.w, BOX.lidH, BOX.d]}
        radius={0.07}
        smoothness={6}
        position={[0, BOX.baseH + BOX.seam + BOX.lidH / 2, 0]}
        material={leather}
      />
      {/* levitation disc */}
      <mesh position={[0, BOX_TOP + DISC_H / 2, 0]}>
        <cylinderGeometry args={[0.62, 0.66, DISC_H, 64]} />
        <meshStandardMaterial color="#2c2c2e" metalness={1} roughness={0.38} />
      </mesh>
      <mesh position={[0, DISC_TOP + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.46, 0.5, 96]} />
        <meshStandardMaterial ref={ring} color="#d1c8af" emissive="#d1c8af" emissiveIntensity={0.9} roughness={0.4} metalness={0.2} />
      </mesh>
      <pointLight ref={lamp} position={[0, DISC_TOP + 0.25, 0]} intensity={0.9} distance={2.6} decay={2} color="#d1c8af" />
    </group>
  );
}

function Card({ finish, interact, float }: { finish: StageFinish; interact: InteractRef; float: FloatRef }) {
  const sway = useRef<THREE.Group>(null);
  const body = useMemo(() => {
    const grain = makeMatteGrainTexture();
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(finish.swatch),
      metalness: 0.8,
      roughness: 0.56,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.0014,
    });
    // The material is created once; useFrame eases it toward each new finish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const designTextures = useMemo(
    () => DESIGNS.map((d) => ({ front: paintTexture(d.front), back: paintTexture(d.back) })),
    [],
  );
  const engrave = useMemo(() => {
    const mk = (tex: THREE.Texture) =>
      new THREE.MeshStandardMaterial({
        map: tex,
        alphaMap: tex,
        transparent: true,
        depthWrite: false,
        color: new THREE.Color("#f4f4f4"),
        metalness: 0.1,
        roughness: 0.55,
      });
    return { front: mk(designTextures[0].front), back: mk(designTextures[0].back) };
  }, [designTextures]);
  const designState = useRef({ index: 0, next: 0, pendingFront: false, pendingBack: false, phase: "front" as Phase, time: 0 });
  const showDesign = (side: "front" | "back", index: number) => {
    const mat = engrave[side];
    const tex = designTextures[index][side];
    mat.map = tex;
    mat.alphaMap = tex;
    mat.needsUpdate = true;
  };

  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(W, H, CORNER), {
      depth: D,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 2,
      curveSegments: 24,
    });
    g.center();
    return g;
  }, []);

  const target = useRef({ color: new THREE.Color(finish.swatch), engrave: new THREE.Color("#f4f4f4"), metalness: 0.8, roughness: 0.56 });
  useEffect(() => {
    const s = surfaceFor(finish.id, finish.swatch);
    target.current.color.set(finish.swatch);
    target.current.engrave.set(s.engrave);
    target.current.metalness = s.metalness;
    target.current.roughness = s.roughness;
  }, [finish]);

  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (!reduceMotion) return;
    const id = window.setInterval(() => {
      const st = designState.current;
      st.index = (st.index + 1) % DESIGNS.length;
      for (const side of ["front", "back"] as const) {
        const tex = designTextures[st.index][side];
        engrave[side].map = tex;
        engrave[side].alphaMap = tex;
        engrave[side].needsUpdate = true;
      }
    }, 7000);
    return () => window.clearInterval(id);
  }, [reduceMotion, engrave, designTextures]);

  useEffect(
    () => () => {
      designTextures.forEach((d) => {
        d.front.dispose();
        d.back.dispose();
      });
      engrave.front.dispose();
      engrave.back.dispose();
      body.dispose();
      geometry.dispose();
    },
    [designTextures, engrave, body, geometry],
  );

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 5);
    const t = target.current;
    body.color.lerp(t.color, k);
    body.metalness += (t.metalness - body.metalness) * k;
    body.roughness += (t.roughness - body.roughness) * k;
    engrave.front.color.lerp(t.engrave, k);
    engrave.back.color.lerp(t.engrave, k);

    const g = sway.current;
    if (!g) return;
    const e = state.clock.elapsedTime;
    if (reduceMotion) {
      g.rotation.set(-0.06, POSE_YAW, 0);
      g.position.y = CARD_Y;
      float.current.lift = 0;
      return;
    }

    // The choreography clock runs only while nobody is dragging the view, and
    // resumes a beat after they let go, so grabbing the card never fights it.
    const st = designState.current;
    const io = interact.current;
    if (!io.active && performance.now() > io.resumeAt) st.time += Math.min(dt, 0.1);
    const u = st.time % CYCLE;
    let phase: Phase;
    let yaw = POSE_YAW;
    let turnEnv = 0; // 0 → 1 → 0 across a turn
    let sinceTurn = Infinity;
    if (u < BEATS.front) {
      phase = "front";
      sinceTurn = u;
    } else if (u < BEATS.front + BEATS.turn) {
      phase = "turn1";
      const p = (u - BEATS.front) / BEATS.turn;
      yaw = POSE_YAW + Math.PI * easeTurn(p);
      turnEnv = Math.sin(Math.PI * p);
    } else if (u < BEATS.front + BEATS.turn + BEATS.back) {
      phase = "back";
      yaw = POSE_YAW + Math.PI;
      sinceTurn = u - BEATS.front - BEATS.turn;
    } else {
      phase = "turn2";
      const p = (u - BEATS.front - BEATS.turn - BEATS.back) / BEATS.turn;
      yaw = POSE_YAW + Math.PI + Math.PI * easeTurn(p);
      turnEnv = Math.sin(Math.PI * p);
    }

    // Phase edges queue the design swaps: the next front goes on as the card
    // leaves the back pose; its back follows once the card faces front again.
    if (phase !== st.phase) {
      if (phase === "turn2") {
        st.next = (st.index + 1) % DESIGNS.length;
        st.pendingFront = true;
      } else if (phase === "front") {
        st.index = st.next;
        st.pendingBack = true;
      }
      st.phase = phase;
    }

    // Settle: a small damped overshoot after each turn, like a real floating object.
    const settle = sinceTurn < 1.2 ? 0.06 * Math.exp(-5 * sinceTurn) * Math.sin(12 * sinceTurn) : 0;
    // Idle float: two incommensurate sines so it never visibly repeats.
    const bob = 0.03 * Math.sin(1.1 * e) + 0.012 * Math.sin(1.9 * e + 0.7);
    const drift = 0.03 * Math.sin(0.6 * e + 1);
    const roll = 0.012 * Math.sin(0.8 * e + 2);
    // Through a turn the card lifts a little and banks into it.
    const lift = 0.1 * turnEnv;

    g.rotation.y = yaw + settle + drift;
    g.rotation.x = -0.06 - 0.04 * turnEnv;
    g.rotation.z = roll + 0.07 * turnEnv;
    g.position.y = CARD_Y + bob + lift;
    float.current.lift = Math.max(-1, Math.min(1, (bob + lift) / 0.14));

    // A face only swaps while the camera cannot see it, wherever the camera is.
    _normal.set(0, 0, 1).applyQuaternion(g.quaternion);
    _toCam.copy(state.camera.position).sub(g.position);
    const frontVisible = _normal.dot(_toCam) > 0;
    if (st.pendingBack && frontVisible) {
      showDesign("back", st.index);
      st.pendingBack = false;
    }
    if (st.pendingFront && !frontVisible) {
      showDesign("front", st.next);
      st.pendingFront = false;
    }
  });

  return (
    <group ref={sway} position={[0, CARD_Y, 0]}>
      <mesh geometry={geometry} material={body} castShadow />
      <mesh position={[0, 0, FACE]} material={engrave.front}>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh position={[0, 0, -FACE]} rotation={[0, Math.PI, 0]} material={engrave.back}>
        <planeGeometry args={[W, H]} />
      </mesh>
    </group>
  );
}

function Scene({ finish }: { finish: StageFinish }) {
  const interact = useRef({ active: false, resumeAt: 0 });
  const float = useRef({ lift: 0 });
  return (
    <>
      <OfficeView />
      <Card finish={finish} interact={interact} float={float} />
      <MaglevBox float={float} />
      <DeskTop />
      <directionalLight position={[-6, 6, 3]} intensity={1.4} color="#dfe9ff" />
      <directionalLight position={[6, 3, -4]} intensity={0.8} color="#ffd2a0" />
      <directionalLight position={[0, 4, 10]} intensity={0.8} color="#ffffff" />
      {/* the card's shadow on the disc, and the box's shadow on the desk */}
      <ContactShadows position={[0, DISC_TOP + 0.003, 0]} opacity={0.5} scale={3.6} blur={1.8} far={2.8} color="#000" />
      <ContactShadows position={[0, 0.002, 0]} opacity={0.7} scale={10} blur={2.4} far={1} color="#000" />
      <Environment resolution={512} environmentIntensity={1.35}>
        {/* floor-to-ceiling glass on the left: tall, cool daylight */}
        <Lightformer intensity={4.5} position={[-7, 3, 1]} rotation-y={Math.PI / 2} scale={[7, 9, 1]} color="#dfe9ff" />
        {/* low sun over the city, from the right and slightly behind */}
        <Lightformer intensity={2.4} position={[6, 2.5, -3]} rotation-y={-Math.PI / 2} scale={[3, 3, 1]} color="#ffd2a0" />
        {/* a modest cool ceiling so the top edges still read */}
        <Lightformer intensity={1.8} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} color="#eef2ff" />
        {/* soft front fill so the face is never black */}
        <Lightformer intensity={1.2} position={[0, 0.5, 7]} rotation-y={Math.PI} scale={[10, 5, 1]} />
      </Environment>
      <OrbitControls
        target={[0, 2.3, 0]}
        enablePan={false}
        enableZoom={false}
        // A narrow orbit keeps the box seated on the desk against the office view behind it.
        minPolarAngle={1.3}
        maxPolarAngle={1.42}
        minAzimuthAngle={-0.25}
        maxAzimuthAngle={0.35}
        enableDamping
        dampingFactor={0.06}
        onStart={() => {
          interact.current.active = true;
        }}
        onEnd={() => {
          interact.current.active = false;
          interact.current.resumeAt = performance.now() + 1200;
        }}
      />
    </>
  );
}

/** A live, draggable metal card whose finish follows the picker. */
export function CardStage3D({ finish, onReady }: { finish: StageFinish; onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);

  // Stop rendering while the panel is scrolled away; the card is still there when it comes back.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        frameloop={onScreen ? "always" : "demand"}
        camera={{ position: [0.46, 4.28, 9.3], fov: 36 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        onCreated={() => onReady?.()}
      >
        <Suspense fallback={null}>
          <Scene finish={finish} />
        </Suspense>
      </Canvas>
    </div>
  );
}
