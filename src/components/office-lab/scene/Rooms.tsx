"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { panelingTexture, woodTexture } from "./textures";
import { DESK_TOP_Y } from "./presets";

export interface RoomLightProps {
  sunIntensity: number;
  sunColor: string;
  blinds: boolean;
  /** Desk lamp strength (Mad Men room only). */
  lamp?: number;
}

/** Big executive desk shared by both rooms; wood tone differs per look. */
export function Desk({ topColor, grainColor, legColor }: { topColor: string; grainColor: string; legColor: string }) {
  const wood = useMemo(() => woodTexture(topColor, grainColor, 2.4, 1.1, 11), [topColor, grainColor]);
  return (
    <group>
      <mesh position={[0, DESK_TOP_Y - 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 1.15]} />
        <meshStandardMaterial map={wood} roughness={0.42} metalness={0} />
      </mesh>
      {/* pedestals */}
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, (DESK_TOP_Y - 0.05) / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, DESK_TOP_Y - 0.05, 1.0]} />
          <meshStandardMaterial color={legColor} roughness={0.5} />
        </mesh>
      ))}
      {/* modesty panel */}
      <mesh position={[0, (DESK_TOP_Y - 0.05) / 2 + 0.1, -0.42]} receiveShadow>
        <boxGeometry args={[1.5, DESK_TOP_Y - 0.25, 0.04]} />
        <meshStandardMaterial color={legColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

/** 1962 corner office: walnut paneling, blinds, banker's lamp, leather chair. */
export function MadMenRoom({ sunIntensity, sunColor, blinds, lamp = 0.5 }: RoomLightProps) {
  const floor = useMemo(() => woodTexture("#2a1a10", "#120a05", 8, 8, 3), []);
  const paneling = useMemo(() => panelingTexture("#5a3a22", "#2b1a0e", 10), []);
  return (
    <group>
      <fog attach="fog" args={["#140d08", 3.5, 11]} />
      <color attach="background" args={["#140d08"]} />
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial map={floor} roughness={0.55} />
      </mesh>
      {/* back wall with paneling + dado rail */}
      <mesh position={[0, 1.6, -2.6]} receiveShadow>
        <planeGeometry args={[10, 3.2]} />
        <meshStandardMaterial map={paneling} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.05, -2.57]}>
        <boxGeometry args={[10, 0.06, 0.04]} />
        <meshStandardMaterial color="#3a2415" roughness={0.6} />
      </mesh>
      {/* framed picture */}
      <mesh position={[-1.4, 1.85, -2.56]}>
        <boxGeometry args={[0.9, 0.62, 0.03]} />
        <meshStandardMaterial color="#1e1a16" roughness={0.6} />
      </mesh>
      <mesh position={[-1.4, 1.85, -2.54]}>
        <planeGeometry args={[0.8, 0.52]} />
        <meshStandardMaterial color="#6b5a3f" roughness={0.9} />
      </mesh>
      {/* credenza */}
      <mesh position={[1.6, 0.38, -2.3]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.76, 0.5]} />
        <meshStandardMaterial color="#3b2616" roughness={0.5} />
      </mesh>
      {/* leather chair behind the desk */}
      <group position={[0, 0, -0.95]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.62, 0.12, 0.6]} />
          <meshStandardMaterial color="#2a1410" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.95, -0.26]} castShadow>
          <boxGeometry args={[0.62, 0.8, 0.1]} />
          <meshStandardMaterial color="#2a1410" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
      {/* banker's lamp */}
      <group position={[-0.72, DESK_TOP_Y, -0.28]}>
        <mesh position={[0, 0.012, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.1, 0.024, 24]} />
          <meshStandardMaterial color="#9a7b3d" metalness={0.9} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.38, 12]} />
          <meshStandardMaterial color="#9a7b3d" metalness={0.9} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.4, 0.04]} rotation={[0.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 24, 1, true, Math.PI, Math.PI]} />
          <meshStandardMaterial color="#1f5a3a" roughness={0.35} metalness={0.1} side={THREE.DoubleSide} emissive="#0f3a24" emissiveIntensity={0.25} />
        </mesh>
        <pointLight position={[0, 0.33, 0.12]} intensity={lamp} distance={1.6} decay={2} color="#ffd9a3" castShadow />
      </group>
      {/* window + blinds on the right, with the sun behind them */}
      <group position={[2.1, 1.7, -0.3]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial color="#fff1d6" toneMapped={false} />
        </mesh>
        {blinds &&
          Array.from({ length: 17 }).map((_, i) => (
            <mesh key={i} position={[0, 1.05 - i * 0.125, 0.04]} rotation={[0.55, 0, 0]} castShadow>
              <boxGeometry args={[2.2, 0.03, 0.09]} />
              <meshStandardMaterial color="#e9e2d3" roughness={0.7} />
            </mesh>
          ))}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[2.3, 0.05, 0.06]} />
          <meshStandardMaterial color="#3a2415" />
        </mesh>
      </group>
      <directionalLight
        position={[5.2, 3.6, -0.5]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={16}
      />
      <hemisphereLight args={["#5a4a3a", "#120a05", 0.35]} />
      <Desk topColor="#4a2d18" grainColor="#1c0f07" legColor="#2e1b0f" />
    </group>
  );
}

/** Jet broker's office: glass wall onto the apron, aircraft outside, cool daylight. */
export function JetsRoom({ sunIntensity, sunColor }: RoomLightProps) {
  const jets = useMemo(
    () => [
      { p: [-10, 0, -22] as const, r: 0.5, s: 0.9 },
      { p: [7, 0, -26] as const, r: -0.7, s: 1.0 },
      { p: [20, 0, -32] as const, r: 0.2, s: 1.2 },
      { p: [-24, 0, -36] as const, r: 1.1, s: 1.1 },
    ],
    []
  );
  return (
    <group>
      <fog attach="fog" args={["#cfd7df", 22, 90]} />
      <color attach="background" args={["#cfd7df"]} />
      {/* interior floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#8d8f90" roughness={0.28} metalness={0.05} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, -1]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#e8e6e1" roughness={0.9} />
      </mesh>
      {/* glass wall */}
      <mesh position={[0, 1.6, -2.8]}>
        <planeGeometry args={[14, 3.2]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.96} roughness={0.04} thickness={0.03} ior={1.5} transparent />
      </mesh>
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <mesh key={x} position={[x, 1.6, -2.8]}>
          <boxGeometry args={[0.06, 3.2, 0.1]} />
          <meshStandardMaterial color="#1b1d20" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* apron outside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -30]} receiveShadow>
        <planeGeometry args={[120, 60]} />
        <meshStandardMaterial color="#5e6166" roughness={0.9} />
      </mesh>
      {jets.map((j, i) => (
        <Jet key={i} position={[j.p[0], j.p[1], j.p[2]]} rotationY={j.r} scale={j.s} />
      ))}
      <directionalLight
        position={[-6, 8, 5]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <hemisphereLight args={["#dfe8f2", "#6b6e72", 0.55]} />
      <Desk topColor="#3b3a38" grainColor="#1a1918" legColor="#232323" />
    </group>
  );
}

/** Low-poly business jet silhouette, enough to read through glass. */
function Jet({ position, rotationY, scale }: { position: [number, number, number]; rotationY: number; scale: number }) {
  const white = <meshStandardMaterial color="#eef0f2" roughness={0.35} metalness={0.2} />;
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* fuselage */}
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.75, 9, 8, 16]} />
        {white}
      </mesh>
      {/* wings */}
      <mesh position={[0.4, 1.3, 0]} rotation={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[2.2, 0.12, 11]} />
        {white}
      </mesh>
      {/* tail fin + stabilizer */}
      <mesh position={[-4.6, 2.9, 0]} castShadow>
        <boxGeometry args={[1.6, 2.4, 0.12]} />
        {white}
      </mesh>
      <mesh position={[-4.9, 4.0, 0]}>
        <boxGeometry args={[1.4, 0.1, 4.4]} />
        {white}
      </mesh>
      {/* engines */}
      {[-1.1, 1.1].map((z) => (
        <mesh key={z} position={[-3.3, 2.0, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 1.8, 14]} />
          <meshStandardMaterial color="#9ea3a8" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* gear */}
      {[-3.2, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.45, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
}
