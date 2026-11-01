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
  // Marble worlds ship `semantics_metadata` (saved next to the splat as
  // world.json by our generator): metric scale and the ground plane offset.
  // With it, the world comes in at real-world size with its floor on y = 0.
  const [metric, setMetric] = useState<{ scale: number; ground: number } | null>(null);
  // Per-world placement saved in world.json once a world is aligned with the
  // desk: { x, y, z, yaw } in metres/degrees, applied under the live dials.
  const [placement, setPlacement] = useState<{ x: number; y: number; z: number; yaw: number }>({ x: 0, y: 0, z: 0, yaw: 0 });
  useEffect(() => {
    setMetric(null);
    setPlacement({ x: 0, y: 0, z: 0, yaw: 0 });
    const dir = url.replace(/[^/]*$/, "");
    if (!dir || url.startsWith("http")) return;
    let cancelled = false;
    fetch(`${dir}world.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((meta) => {
        if (cancelled || !meta) return;
        const sm = meta.semantics_metadata;
        if (sm && typeof sm.metric_scale_factor === "number") {
          setMetric({ scale: sm.metric_scale_factor, ground: sm.ground_plane_offset ?? 0 });
        }
        const p = meta.placement;
        if (p) setPlacement({ x: p.x ?? 0, y: p.y ?? 0, z: p.z ?? 0, yaw: p.yaw ?? 0 });
        console.info("[marble] world.json", { semantics: sm, placement: p });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

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
    if (!bounds || metric) {
      setOffset([0, 0, 0]);
      return;
    }
    setOffset(center ? [-bounds.center.x, -bounds.center.y, -bounds.center.z] : [0, 0, 0]);
  }, [bounds, center, metric]);

  // metric_xyz = raw * scale; aligned = metric - (0, ground, 0), in Marble's own frame.
  const metricScale = metric ? metric.scale : 1;
  const metricOffset: [number, number, number] = metric ? [0, -metric.ground, 0] : [0, 0, 0];

  return (
    <group position={position} rotation={[0, THREE.MathUtils.degToRad(yawDeg), 0]} scale={scale}>
      <group position={[placement.x, placement.y, placement.z]} rotation={[0, THREE.MathUtils.degToRad(placement.yaw), 0]}>
        <group rotation={[flip ? Math.PI : 0, 0, 0]}>
          <group position={metricOffset} scale={metricScale}>
            <splatMesh args={args} position={offset} />
          </group>
        </group>
      </group>
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
