"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cardFaceTexture } from "./textures";

export interface CardBoxProps {
  position: [number, number, number];
  /** 0 = closed, 1 = fully open (lidAngle degrees). */
  open: number;
  lidAngle: number;
  outerColor: string;
  outerRoughness: number;
  velvetColor: string;
  finishHex: string;
  cardCount: number;
  metalness: number;
  roughness: number;
  rotationY: number;
  /** Degrees the top card is lifted at its back edge, so the face reads to camera. */
  lift: number;
}

// Outer dimensions in meters.
const W = 0.27;
const D = 0.19;
const H = 0.068;
const WALL = 0.009;
const LID_T = 0.011;
const CARD_W = 0.086;
const CARD_D = 0.054;
const CARD_T = 0.0009;

export function CardBox({
  position,
  open,
  lidAngle,
  outerColor,
  outerRoughness,
  velvetColor,
  finishHex,
  cardCount,
  metalness,
  roughness,
  rotationY,
  lift,
}: CardBoxProps) {
  const lid = useRef<THREE.Group>(null);
  const topCardMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const stackMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const targetColor = useMemo(() => new THREE.Color(finishHex), [finishHex]);
  const faceTex = useMemo(() => cardFaceTexture(finishHex), [finishHex]);

  useFrame((_, dt) => {
    if (lid.current) {
      const target = -THREE.MathUtils.degToRad(lidAngle) * open;
      lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, target, 3.2, dt);
    }
    // Finish changes glide instead of snapping.
    for (const m of [topCardMat.current, stackMat.current]) {
      if (m) m.color.lerp(targetColor, 1 - Math.exp(-dt * 4));
    }
  });

  const velvet = useMemo(
    () => ({
      color: velvetColor,
      roughness: 1,
      metalness: 0,
      sheen: 1,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(velvetColor).offsetHSL(0, 0, 0.18),
    }),
    [velvetColor]
  );

  const innerW = W - WALL * 2;
  const innerD = D - WALL * 2;
  const floorY = WALL + 0.012; // velvet floor sits a little above the box floor
  const recessPad = 0.012;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Base: floor + four walls so the inside is hollow */}
      <mesh position={[0, WALL / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, WALL, D]} />
        <meshStandardMaterial color={outerColor} roughness={outerRoughness} metalness={0} />
      </mesh>
      {[
        [0, H / 2, -D / 2 + WALL / 2, W, H, WALL],
        [0, H / 2, D / 2 - WALL / 2, W, H, WALL],
        [-W / 2 + WALL / 2, H / 2, 0, WALL, H, D],
        [W / 2 - WALL / 2, H / 2, 0, WALL, H, D],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial color={outerColor} roughness={outerRoughness} metalness={0} />
        </mesh>
      ))}

      {/* Velvet floor */}
      <mesh position={[0, floorY, 0]} receiveShadow>
        <boxGeometry args={[innerW, 0.012, innerD]} />
        <meshPhysicalMaterial {...velvet} />
      </mesh>
      {/* Velvet frame around the card recess (four raised bars) */}
      {(() => {
        const rw = CARD_W + recessPad * 2;
        const rd = CARD_D + recessPad * 2;
        const barH = 0.014;
        const y = floorY + 0.006 + barH / 2;
        const bars: [number, number, number, number, number, number][] = [
          [0, y, -rd / 2 - (innerD - rd) / 4, innerW, barH, (innerD - rd) / 2],
          [0, y, rd / 2 + (innerD - rd) / 4, innerW, barH, (innerD - rd) / 2],
          [-rw / 2 - (innerW - rw) / 4, y, 0, (innerW - rw) / 2, barH, rd],
          [rw / 2 + (innerW - rw) / 4, y, 0, (innerW - rw) / 2, barH, rd],
        ];
        return bars.map(([x, yy, z, sx, sy, sz], i) => (
          <mesh key={`bar-${i}`} position={[x, yy, z]} receiveShadow castShadow>
            <boxGeometry args={[sx, sy, sz]} />
            <meshPhysicalMaterial {...velvet} />
          </mesh>
        ));
      })()}

      {/* Card stack inside the recess */}
      <group position={[0, floorY + 0.006, 0]}>
        {Array.from({ length: Math.max(1, cardCount) }).map((_, i) => {
          const isTop = i === cardCount - 1;
          const y = CARD_T / 2 + i * (CARD_T + 0.00025);
          const jitter = isTop ? 0 : (i % 2 === 0 ? 1 : -1) * 0.012 * (1 - i / cardCount);
          if (isTop) {
            // Pivot at the front edge: the back edge lifts, tilting the face
            // toward a camera that sits in front and above.
            return (
              <group key={i} position={[0, y, CARD_D / 2]} rotation={[THREE.MathUtils.degToRad(lift), 0, 0]}>
                <mesh position={[0, 0, -CARD_D / 2]} castShadow receiveShadow>
                  <boxGeometry args={[CARD_W, CARD_T, CARD_D]} />
                  <meshPhysicalMaterial
                    ref={topCardMat}
                    color={finishHex}
                    map={faceTex}
                    metalness={metalness}
                    roughness={roughness}
                    clearcoat={0.25}
                    clearcoatRoughness={0.3}
                  />
                </mesh>
              </group>
            );
          }
          return (
            <mesh key={i} position={[0, y, 0]} rotation={[0, jitter, 0]} castShadow receiveShadow>
              <boxGeometry args={[CARD_W, CARD_T, CARD_D]} />
              <meshPhysicalMaterial
                ref={i === 0 ? stackMat : undefined}
                color={finishHex}
                metalness={metalness}
                roughness={roughness + 0.1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Lid, hinged along the back edge */}
      <group ref={lid} position={[0, H, -D / 2]}>
        <mesh position={[0, LID_T / 2, D / 2]} castShadow receiveShadow>
          <boxGeometry args={[W, LID_T, D]} />
          <meshStandardMaterial color={outerColor} roughness={outerRoughness} metalness={0} />
        </mesh>
        {/* velvet lining on the underside of the lid */}
        <mesh position={[0, -0.0005, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[innerW, innerD]} />
          <meshPhysicalMaterial {...velvet} side={THREE.FrontSide} />
        </mesh>
      </group>
    </group>
  );
}
