"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
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
 * How each anodized finish behaves under light. Silver and gold read as bare
 * metal. The laser exposes raw aluminum, which looks bright against dark dyes
 * and dull against pale ones, so the engraving tone follows the swatch.
 */
function surfaceFor(id: string, swatch: string) {
  const engrave = luminance(swatch) > 0.3 ? "#585858" : "#e4e4e4";
  if (id === "silver") return { metalness: 1, roughness: 0.46, engrave: "#4a4a4a" };
  if (id === "gold") return { metalness: 1, roughness: 0.5, engrave: "#5a5247" };
  if (id === "black") return { metalness: 0.9, roughness: 0.62, engrave };
  return { metalness: 0.8, roughness: 0.56, engrave };
}

/** Fine, direction-free speckle: the sandblasted grain of a matte anodized surface. */
function makeMatteGrainTexture() {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 200 + Math.floor(Math.random() * 55);
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

/** White-on-transparent artwork: everything painted here becomes bare, engraved metal. */
function makeFrontTexture() {
  const w = 2048;
  const h = Math.round((w * H) / W);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";

  // Monogram
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(312, 392, 112, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `500 96px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AC", 312, 398);

  // Name and title
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 150px ${FONT}`;
  drawSpaced(ctx, "ALEX CARTER", 196, 740, 34);
  ctx.font = `400 60px ${FONT}`;
  drawSpaced(ctx, "FOUNDER & CEO", 200, 850, 24);

  // Contact line
  ctx.font = `400 54px ${FONT}`;
  drawSpaced(ctx, "+1 415 000 0000   ·   ALEXCARTER.COM", 200, 1110, 9);

  // Mark, bottom right: four rounded squares
  const size = 86;
  const gap = 22;
  const ox = w - 200 - size * 2 - gap;
  const oy = 1000 - size;
  ctx.lineWidth = 10;
  for (let i = 0; i < 4; i++) {
    const x = ox + (i % 2) * (size + gap);
    const y = oy + Math.floor(i / 2) * (size + gap);
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 16);
    ctx.stroke();
    if (i !== 3) {
      ctx.beginPath();
      ctx.roundRect(x + 26, y + 26, size - 52, size - 52, 6);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** The back carries a single large monogram and a thin frame line. */
function makeBackTexture() {
  const w = 2048;
  const h = Math.round((w * H) / W);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 40, 230, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `500 200px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AC", w / 2, h / 2 - 30);
  ctx.font = `400 50px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  const label = "CARTER HOLDINGS";
  const lw = measureSpaced(ctx, label, 22);
  ctx.textAlign = "left";
  drawSpaced(ctx, label, w / 2 - lw / 2, h / 2 + 330, 22);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Card({ finish }: { finish: StageFinish }) {
  const sway = useRef<THREE.Group>(null);
  const body = useMemo(() => {
    const grain = makeMatteGrainTexture();
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(finish.swatch),
      metalness: 0.8,
      roughness: 0.56,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.0005,
    });
    // The material is created once; useFrame eases it toward each new finish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const engrave = useMemo(() => {
    const front = makeFrontTexture();
    const back = makeBackTexture();
    const mk = (tex: THREE.Texture) =>
      new THREE.MeshStandardMaterial({
        map: tex,
        alphaMap: tex,
        transparent: true,
        depthWrite: false,
        color: new THREE.Color("#e6e6e6"),
        metalness: 1,
        roughness: 0.22,
      });
    return { front: mk(front), back: mk(back) };
  }, []);

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

  const target = useRef({ color: new THREE.Color(finish.swatch), engrave: new THREE.Color("#e6e6e6"), metalness: 0.8, roughness: 0.56 });
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

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 5);
    const t = target.current;
    body.color.lerp(t.color, k);
    body.metalness += (t.metalness - body.metalness) * k;
    body.roughness += (t.roughness - body.roughness) * k;
    engrave.front.color.lerp(t.engrave, k);
    engrave.back.color.lerp(t.engrave, k);
    if (sway.current && reduceMotion) {
      sway.current.rotation.set(-0.12, -0.3, 0);
    } else if (sway.current) {
      const e = state.clock.elapsedTime;
      // Resting three-quarter pose so light rakes across the face, with a slow breathe.
      sway.current.rotation.y = -0.3 + Math.sin(e * 0.35) * 0.12;
      sway.current.rotation.x = -0.12 + Math.sin(e * 0.22) * 0.03;
    }
  });

  return (
    <group ref={sway}>
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
  return (
    <>
      <Card finish={finish} />
      <directionalLight position={[-4, 6, 4]} intensity={0.7} />
      <ContactShadows position={[0, -1.3, 0]} opacity={0.7} scale={9} blur={2.6} far={3} color="#000" />
      <Environment resolution={512} environmentIntensity={0.9}>
        {/* overhead softbox: the long bright band across the face */}
        <Lightformer intensity={3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} />
        {/* left and right strips give the long edges a highlight */}
        <Lightformer intensity={1.6} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer intensity={1.6} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#f6ecd6" />
        {/* soft front fill so the face is never black */}
        <Lightformer intensity={0.7} position={[0, 0.5, 7]} rotation-y={Math.PI} scale={[10, 5, 1]} />
      </Environment>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(2 * Math.PI) / 3}
        enableDamping
        dampingFactor={0.06}
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
        camera={{ position: [0, 1.1, 5.4], fov: 30 }}
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
