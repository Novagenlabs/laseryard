"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
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

function hexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** A QR-like block: three finder squares and seeded modules. */
function qrBlock(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const n = 21;
  const m = size / n;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const finder = (fx: number, fy: number) => {
    for (let j = 0; j < 7; j++) {
      for (let i = 0; i < 7; i++) {
        const ring = Math.max(Math.abs(i - 3), Math.abs(j - 3));
        if (ring === 3 || ring <= 1) ctx.fillRect(x + (fx + i) * m, y + (fy + j) * m, m, m);
      }
    }
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const inTL = i < 8 && j < 8;
      const inTR = i >= n - 8 && j < 8;
      const inBL = i < 8 && j >= n - 8;
      if (inTL || inTR || inBL) continue;
      if (rnd() > 0.55) ctx.fillRect(x + i * m, y + j * m, m, m);
    }
  }
}

const DESIGNS: Design[] = [
  {
    name: "Alex Carter",
    front: (ctx) => {
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(312, 392, 112, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `500 96px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AC", 312, 398);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.font = `500 150px ${FONT}`;
      drawSpaced(ctx, "ALEX CARTER", 196, 740, 34);
      ctx.font = `400 60px ${FONT}`;
      drawSpaced(ctx, "FOUNDER & CEO", 200, 850, 24);
      ctx.font = `400 54px ${FONT}`;
      drawSpaced(ctx, "+1 415 000 0000   ·   ALEXCARTER.COM", 200, 1110, 9);
      const size = 86;
      const gap = 22;
      const ox = ART_W - 200 - size * 2 - gap;
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
    },
    back: (ctx) => {
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(ART_W / 2, ART_H / 2 - 40, 230, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `500 200px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AC", ART_W / 2, ART_H / 2 - 30);
      ctx.font = `400 50px ${FONT}`;
      centered(ctx, "CARTER HOLDINGS", ART_H / 2 + 330, 22);
    },
  },
  {
    name: "Nova",
    front: (ctx) => {
      ctx.font = `300 250px ${FONT}`;
      centered(ctx, "NOVA", ART_H / 2 + 50, 110);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ART_W / 2 - 280, ART_H / 2 + 150);
      ctx.lineTo(ART_W / 2 + 280, ART_H / 2 + 150);
      ctx.stroke();
      ctx.font = `400 52px ${FONT}`;
      centered(ctx, "ARCHITECTURE STUDIO", ART_H / 2 + 250, 26);
    },
    back: (ctx) => {
      ctx.font = `400 50px ${FONT}`;
      centered(ctx, "NOVA-STUDIO.COM", ART_H / 2 + 18, 22);
      ctx.font = `300 44px ${FONT}`;
      centered(ctx, "LONDON   ·   LAGOS", ART_H / 2 + 110, 16);
      ctx.lineWidth = 5;
      const L = 70;
      for (const [sx, sy] of [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ] as const) {
        const x = ART_W / 2 + sx * 800;
        const y = ART_H / 2 + sy * 450;
        ctx.beginPath();
        ctx.moveTo(x - sx * L, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y - sy * L);
        ctx.stroke();
      }
    },
  },
  {
    name: "Amara Okafor",
    front: (ctx) => {
      ctx.font = `500 104px ${FONT}`;
      drawSpaced(ctx, "DR. AMARA OKAFOR", 196, 560, 18);
      ctx.font = `400 54px ${FONT}`;
      drawSpaced(ctx, "DENTAL SURGEON", 200, 660, 22);
      ctx.font = `400 48px ${FONT}`;
      drawSpaced(ctx, "+44 20 7946 0000", 200, 1040, 8);
      drawSpaced(ctx, "OKAFORDENTAL.CO.UK", 200, 1120, 8);
      ctx.lineWidth = 10;
      hexagon(ctx, 1740, 360, 130);
      ctx.stroke();
      ctx.font = `500 90px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AO", 1740, 366);
    },
    back: (ctx) => {
      ctx.lineWidth = 10;
      hexagon(ctx, ART_W / 2, ART_H / 2, 320);
      ctx.stroke();
      ctx.lineWidth = 5;
      hexagon(ctx, ART_W / 2, ART_H / 2, 240);
      ctx.stroke();
      ctx.font = `500 150px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AO", ART_W / 2, ART_H / 2 + 8);
    },
  },
  {
    name: "Meridian",
    front: (ctx) => {
      ctx.font = `700 190px ${FONT}`;
      drawSpaced(ctx, "MERIDIAN", 190, 520, 12);
      ctx.font = `400 58px ${FONT}`;
      drawSpaced(ctx, "COFFEE ROASTERS", 196, 620, 30);
      ctx.font = `400 46px ${FONT}`;
      drawSpaced(ctx, "EST. 2019   ·   PORTLAND, OR", 196, 1110, 8);
      qrBlock(ctx, 1560, 790, 300);
    },
    back: (ctx) => {
      const cx = ART_W / 2;
      const cy = ART_H / 2 + 20;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, 330, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 400, cy);
      ctx.lineTo(cx + 400, cy);
      ctx.moveTo(cx, cy - 400);
      ctx.lineTo(cx, cy + 400);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 300);
      ctx.lineTo(cx - 40, cy - 180);
      ctx.lineTo(cx + 40, cy - 180);
      ctx.closePath();
      ctx.fill();
      ctx.font = `500 70px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText("N", cx, cy - 440);
    },
  },
];

const SPIN = 0.45; // radians per second: one full turn, one design, about every 14 s

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

function MaglevBox() {
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
        <meshStandardMaterial color="#d1c8af" emissive="#d1c8af" emissiveIntensity={0.9} roughness={0.4} metalness={0.2} />
      </mesh>
      <pointLight position={[0, DISC_TOP + 0.25, 0]} intensity={0.9} distance={2.6} decay={2} color="#d1c8af" />
    </group>
  );
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
        color: new THREE.Color("#e6e6e6"),
        metalness: 1,
        roughness: 0.22,
      });
    return { front: mk(designTextures[0].front), back: mk(designTextures[0].back) };
  }, [designTextures]);
  const designState = useRef({ index: 0, pendingFront: false, pendingBack: false, lastYaw: 0 });
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
    if (sway.current && reduceMotion) {
      sway.current.rotation.set(-0.06, -0.3, 0);
      sway.current.position.y = CARD_Y;
    } else if (sway.current) {
      const e = state.clock.elapsedTime;
      // Levitating: a slow full turn so both faces show, with a gentle float.
      const yaw = (e * SPIN) % (Math.PI * 2);
      const st = designState.current;
      if (yaw < st.lastYaw) {
        // A full turn is done: queue the next design for both faces.
        st.index = (st.index + 1) % DESIGNS.length;
        st.pendingFront = true;
        st.pendingBack = true;
      }
      st.lastYaw = yaw;
      // Each face swaps only while it is turned away from the camera, so the change is never seen.
      const frontVisible = Math.cos(yaw) > 0;
      if (st.pendingBack && frontVisible) {
        showDesign("back", st.index);
        st.pendingBack = false;
      }
      if (st.pendingFront && !frontVisible) {
        showDesign("front", st.index);
        st.pendingFront = false;
      }
      sway.current.rotation.y = yaw;
      sway.current.rotation.x = -0.06 + Math.sin(e * 0.9) * 0.015;
      sway.current.position.y = CARD_Y + Math.sin(e * 1.3) * 0.045;
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
  return (
    <>
      <Card finish={finish} />
      <MaglevBox />
      <directionalLight position={[-4, 6, 4]} intensity={0.7} />
      {/* the card's shadow on the disc, and the box's shadow on the table */}
      <ContactShadows position={[0, DISC_TOP + 0.003, 0]} opacity={0.5} scale={3.6} blur={1.8} far={2.8} color="#000" />
      <ContactShadows position={[0, 0, 0]} opacity={0.7} scale={10} blur={2.4} far={1} color="#000" />
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
        target={[0, 1.55, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={1.0}
        maxPolarAngle={1.6}
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
        camera={{ position: [0.7, 3.2, 12.2], fov: 26 }}
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
