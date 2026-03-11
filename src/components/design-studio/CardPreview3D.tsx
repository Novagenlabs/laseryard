"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  RoundedBox,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

interface CardPreview3DProps {
  frontTextureUrl: string | null;
  backTextureUrl: string | null;
  showQR: boolean;
  className?: string;
}

/**
 * Generate a small QR-code-like pattern on a canvas.
 */
function generateQRTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);

  const moduleSize = 4;
  const modules = Math.floor(size / moduleSize);
  const padding = 2;

  ctx.fillStyle = "#ffffff";

  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3));
        if (ring === 0 || ring === 2 || ring === 3) {
          ctx.fillRect(
            (ox + x) * moduleSize,
            (oy + y) * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  };

  drawFinder(padding, padding);
  drawFinder(modules - 7 - padding, padding);
  drawFinder(padding, modules - 7 - padding);

  for (let i = 8 + padding; i < modules - 8 - padding; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * moduleSize, (6 + padding) * moduleSize, moduleSize, moduleSize);
      ctx.fillRect((6 + padding) * moduleSize, i * moduleSize, moduleSize, moduleSize);
    }
  }

  let seed = 42;
  const seededRandom = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = padding; y < modules - padding; y++) {
    for (let x = padding; x < modules - padding; x++) {
      const inFinderTL = x < 9 + padding && y < 9 + padding;
      const inFinderTR = x > modules - 9 - padding && y < 9 + padding;
      const inFinderBL = x < 9 + padding && y > modules - 9 - padding;
      if (inFinderTL || inFinderTR || inFinderBL) continue;
      if (seededRandom() > 0.5) {
        ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function useEngraveTexture(url: string | null) {
  return useMemo(() => {
    if (!url) return null;
    const tex = new THREE.TextureLoader().load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [url]);
}

const METAL_COLOR = new THREE.Color(0xc0c0c0);

function EngravePlane({
  texture,
  width,
  height,
  zOffset,
  flipX,
}: {
  texture: THREE.Texture;
  width: number;
  height: number;
  zOffset: number;
  flipX?: boolean;
}) {
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      color: METAL_COLOR,
      metalness: 1.0,
      roughness: 0.2,
      alphaMap: texture,
    });
  }, [texture]);

  return (
    <mesh
      position={[0, 0, zOffset]}
      rotation={flipX ? [0, Math.PI, 0] : [0, 0, 0]}
    >
      <planeGeometry args={[width - 0.1, height - 0.1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function MetalCard({
  frontTextureUrl,
  backTextureUrl,
  showQR,
}: {
  frontTextureUrl: string | null;
  backTextureUrl: string | null;
  showQR: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const width = 3.4;
  const height = 2.2;
  const depth = 0.016;

  const frontTexture = useEngraveTexture(frontTextureUrl);
  const backTexture = useEngraveTexture(backTextureUrl);

  const qrTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return generateQRTexture();
  }, []);

  const baseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a1a),
      metalness: 0.8,
      roughness: 0.6,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.03 - 0.1;
  });

  const qrSize = 0.55;
  const qrX = -width / 2 + 0.15 + qrSize / 2;
  const qrY = -height / 2 + 0.15 + qrSize / 2;

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {/* Card body */}
      <RoundedBox args={[width, height, depth]} radius={0.008} smoothness={4}>
        <primitive object={baseMaterial} attach="material" />
      </RoundedBox>

      {/* Front design */}
      {frontTexture && (
        <EngravePlane
          texture={frontTexture}
          width={width}
          height={height}
          zOffset={depth / 2 + 0.001}
        />
      )}

      {/* Back design — flipped on X so it reads correctly from behind */}
      {backTexture && (
        <EngravePlane
          texture={backTexture}
          width={width}
          height={height}
          zOffset={-(depth / 2 + 0.001)}
          flipX
        />
      )}

      {/* QR code — bottom-left corner of front face */}
      {showQR && qrTexture && (
        <mesh position={[qrX, qrY, depth / 2 + 0.002]}>
          <planeGeometry args={[qrSize, qrSize]} />
          <meshStandardMaterial
            map={qrTexture}
            transparent
            color={METAL_COLOR}
            metalness={1.0}
            roughness={0.2}
            alphaMap={qrTexture}
          />
        </mesh>
      )}
    </mesh>
  );
}

function CardScene({
  frontTextureUrl,
  backTextureUrl,
  showQR,
}: {
  frontTextureUrl: string | null;
  backTextureUrl: string | null;
  showQR: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} />
      <pointLight position={[0, 3, 4]} intensity={0.6} color="#fff5e0" />

      <MetalCard
        frontTextureUrl={frontTextureUrl}
        backTextureUrl={backTextureUrl}
        showQR={showQR}
      />

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.4}
        scale={8}
        blur={2}
        far={4}
      />

      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(3 * Math.PI) / 4}
        autoRotate={false}
        dampingFactor={0.05}
      />
    </>
  );
}

export function CardPreview3D({
  frontTextureUrl,
  backTextureUrl,
  showQR,
  className,
}: CardPreview3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <CardScene
            frontTextureUrl={frontTextureUrl}
            backTextureUrl={backTextureUrl}
            showQR={showQR}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
