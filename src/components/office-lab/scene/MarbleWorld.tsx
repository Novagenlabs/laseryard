"use client";

import { useEffect, useMemo, useState } from "react";
import { extend, useThree, type ThreeElement } from "@react-three/fiber";
import * as THREE from "three";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";

/**
 * Photoreal background from a World Labs Marble export (Gaussian splats),
 * rendered with their Spark renderer inside our Three.js scene. The box and
 * cards are ordinary lit meshes placed in front of it.
 *
 * Spark's documented React Three Fiber setup: register its classes as JSX
 * elements, memoize their `args`, and create the renderer with
 * `antialias: false` on the WebGLRenderer.
 */
extend({ SparkRenderer, SplatMesh });

declare module "@react-three/fiber" {
  interface ThreeElements {
    sparkRenderer: ThreeElement<typeof SparkRenderer>;
    splatMesh: ThreeElement<typeof SplatMesh>;
  }
}

/** Spark's renderer, once, at the scene root. */
export function SparkSetup() {
  const { gl } = useThree();
  const args = useMemo(() => [{ renderer: gl }] as const, [gl]);
  return <sparkRenderer args={args} />;
}

export function MarbleWorld({
  url,
  position,
  yawDeg,
  scale,
  flip,
  center,
}: {
  url: string;
  position: [number, number, number];
  yawDeg: number;
  scale: number;
  /** Marble exports use the OpenCV convention (+y down); flip puts them upright. */
  flip: boolean;
  /** Put the world's bounding-box centre at `position` instead of its own origin. */
  center: boolean;
}) {
  const [offset, setOffset] = useState<[number, number, number]>([0, 0, 0]);
  const [bounds, setBounds] = useState<{ center: THREE.Vector3; size: THREE.Vector3 } | null>(null);

  const args = useMemo(
    () =>
      [
        {
          url,
          onLoad: (mesh: SplatMesh) => {
            const box = mesh.getBoundingBox();
            const c = box.getCenter(new THREE.Vector3());
            const s = box.getSize(new THREE.Vector3());
            setBounds({ center: c, size: s });
            console.info("[marble] splat loaded", { center: c.toArray(), size: s.toArray(), url });
          },
        },
      ] as const,
    [url]
  );

  useEffect(() => {
    if (!bounds) return;
    setOffset(center ? [-bounds.center.x, -bounds.center.y, -bounds.center.z] : [0, 0, 0]);
  }, [bounds, center]);

  return (
    <group position={position} rotation={[flip ? Math.PI : 0, THREE.MathUtils.degToRad(yawDeg), 0]} scale={scale}>
      <splatMesh args={args} position={offset} />
    </group>
  );
}

/**
 * Lights our meshes with the world's own panorama (Marble exports a
 * 2560×1280 equirectangular PNG), so the box picks up the room's color and
 * direction of light instead of a generic studio preset.
 */
export function PanoEnvironment({ url, intensity }: { url: string; intensity: number }) {
  const { scene } = useThree();
  useEffect(() => {
    if (!url) return;
    let disposed = false;
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      scene.environment = tex;
      scene.environmentIntensity = intensity;
    });
    return () => {
      disposed = true;
      if (scene.environment) {
        scene.environment.dispose();
        scene.environment = null;
      }
    };
  }, [scene, url, intensity]);
  return null;
}
