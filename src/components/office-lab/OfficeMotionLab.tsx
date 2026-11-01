"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { DialRoot, useDialKitController } from "dialkit";
import "dialkit/styles.css";
import { CardBox } from "./scene/CardBox";
import { JetsRoom, MadMenRoom } from "./scene/Rooms";
import { MarbleWorld, PanoEnvironment, SparkSetup } from "./scene/MarbleWorld";
import { BOX_POSITION, FINISHES, LOOK_LABEL, SAMPLE_SPLAT_URL } from "./scene/presets";

const LOOK_OPTIONS = [LOOK_LABEL.madmen, LOOK_LABEL.jets, LOOK_LABEL.marble];
const FINISH_LABELS = FINISHES.map((f) => f.label);
const ENVIRONMENTS = ["apartment", "city", "dawn", "sunset", "studio", "warehouse", "night", "lobby"] as const;
type EnvPreset = (typeof ENVIRONMENTS)[number];

export default function OfficeMotionLab() {
  const captureRef = useRef<() => void>(() => {});
  // `?look=jets` or `?look=marble` opens that look first; the panel can still switch.
  // `?world=<folder>` opens the Marble look on /worlds/<folder>/ (our generated offices).
  // `&res=full` loads the ~2M-splat export instead of the 500k preview.
  const [params] = useState(() => {
    const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const world = sp?.get("world")?.replace(/[^a-z0-9-]/gi, "") || "";
    return { look: world ? "marble" : sp?.get("look"), world, full: sp?.get("res") === "full" };
  });
  const [lookOptions] = useState(() => {
    if (params.look === "jets") return [LOOK_LABEL.jets, LOOK_LABEL.madmen, LOOK_LABEL.marble];
    if (params.look === "marble") return [LOOK_LABEL.marble, LOOK_LABEL.madmen, LOOK_LABEL.jets];
    return LOOK_OPTIONS;
  });
  const worldUrlDefault = params.world
    ? `/worlds/${params.world}/${params.full ? "world.spz" : "world-lowres.spz"}`
    : SAMPLE_SPLAT_URL;
  const panoDefault = params.world ? `/worlds/${params.world}/pano.png` : "";
  // `?post=0` starts with post-processing off (useful when debugging splats).
  const [postDefault] = useState(
    () => !(typeof window !== "undefined" && new URLSearchParams(window.location.search).get("post") === "0")
  );

  const dial = useDialKitController(
    "Office lab",
    {
      look: { type: "select", options: lookOptions },
      camera: {
        fov: [32, 18, 60, 1],
        orbit: [26, -90, 90, 1],
        height: [1.0, 0.82, 1.9, 0.01],
        distance: [1.45, 0.5, 3.5, 0.01],
        aim: [0.07, -0.15, 0.3, 0.01],
        drift: true,
      },
      box: {
        open: [1, 0, 1, 0.01],
        loop: false,
        lidAngle: [108, 60, 160, 1],
        turn: [-14, -45, 45, 1],
        outer: "#0b0b0b",
        outerRoughness: [0.9, 0.2, 1, 0.01],
        velvet: "#3b0f17",
      },
      cards: {
        finish: { type: "select", options: FINISH_LABELS },
        cycle: true,
        every: [2.6, 0.8, 8, 0.1],
        count: [5, 1, 9, 1],
        lift: [26, 0, 70, 1],
        metalness: [0.88, 0, 1, 0.01],
        roughness: [0.32, 0.02, 0.9, 0.01],
      },
      light: {
        sun: [3.2, 0, 10, 0.1],
        sunColor: "#ffd2a0",
        lamp: [0.5, 0, 3, 0.05],
        blinds: true,
        environment: { type: "select", options: [...ENVIRONMENTS] },
        envIntensity: [0.45, 0, 2, 0.01],
        exposure: [1.0, 0.3, 2.2, 0.01],
      },
      world: {
        _collapsed: true,
        url: worldUrlDefault,
        pano: panoDefault,
        flip: true,
        center: !params.world,
        scale: [params.world ? 1 : 0.6, 0.05, 6, 0.01],
        yaw: [0, -180, 180, 1],
        x: [0, -6, 6, 0.01],
        y: [params.world ? 0 : 0.8, -4, 4, 0.01],
        z: [params.world ? 0 : -0.6, -8, 8, 0.01],
      },
      post: {
        enabled: postDefault,
        depthOfField: true,
        bokeh: [2.4, 0, 6, 0.1],
        bloom: [0.12, 0, 1.5, 0.01],
        vignette: [0.55, 0, 1, 0.01],
      },
      capture: { type: "action" },
    },
    {
      id: "office-lab",
      persist: true,
      onAction: (path) => {
        if (path === "capture") captureRef.current();
      },
    }
  );
  const v = dial.values;

  // A `?world=` link always opens that world, even over values the panel
  // persisted from an earlier session.
  useEffect(() => {
    if (!params.world) return;
    dial.setValues({
      look: LOOK_LABEL.marble,
      world: { url: worldUrlDefault, pano: panoDefault, center: false, scale: 1, x: 0, y: 0, z: 0, yaw: 0 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.world]);

  const look = v.look === LOOK_LABEL.jets ? "jets" : v.look === LOOK_LABEL.marble ? "marble" : "madmen";
  const usePano = look === "marble" && v.world.pano.trim().length > 0;

  // Finish cycling: one card, colors gliding through all eleven finishes.
  const [cycleIndex, setCycleIndex] = useState(0);
  useEffect(() => {
    if (!v.cards.cycle) return;
    const id = window.setInterval(
      () => setCycleIndex((i) => (i + 1) % FINISHES.length),
      Math.max(0.5, v.cards.every) * 1000
    );
    return () => window.clearInterval(id);
  }, [v.cards.cycle, v.cards.every]);
  const finishHex = v.cards.cycle
    ? FINISHES[cycleIndex].hex
    : (FINISHES.find((f) => f.label === v.cards.finish) ?? FINISHES[0]).hex;

  // Lid loop: open, hold, close, hold.
  const [loopOpen, setLoopOpen] = useState(1);
  useEffect(() => {
    if (!v.box.loop) return;
    let open = 1;
    const id = window.setInterval(() => {
      open = open ? 0 : 1;
      setLoopOpen(open);
    }, 4200);
    return () => window.clearInterval(id);
  }, [v.box.loop]);
  const open = v.box.loop ? loopOpen : v.box.open;

  const envPreset = (ENVIRONMENTS.includes(v.light.environment as EnvPreset)
    ? v.light.environment
    : "apartment") as EnvPreset;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0a0a0a] text-[#eeede7]">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{
          // Spark (Gaussian splats) requires antialias off; the composer's
          // multisampling covers edges when post-processing is on.
          antialias: false,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: v.light.exposure,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ fov: v.camera.fov, near: 0.05, far: 120, position: [0.6, 1.1, 1.3] }}
      >
        <RendererBridge exposure={v.light.exposure} onCapture={(fn) => (captureRef.current = fn)} />
        <Rig
          fov={v.camera.fov}
          orbitDeg={v.camera.orbit}
          height={v.camera.height}
          distance={v.camera.distance}
          aim={v.camera.aim}
          drift={v.camera.drift}
        />
        <Suspense fallback={null}>
          {usePano ? (
            <PanoEnvironment url={v.world.pano.trim()} intensity={v.light.envIntensity} />
          ) : (
            <Environment preset={envPreset} environmentIntensity={v.light.envIntensity} />
          )}
          {look === "madmen" && (
            <MadMenRoom sunIntensity={v.light.sun} sunColor={v.light.sunColor} blinds={v.light.blinds} lamp={v.light.lamp} />
          )}
          {look === "jets" && <JetsRoom sunIntensity={v.light.sun} sunColor={v.light.sunColor} blinds={false} />}
          {look === "marble" && (
            <>
              <SparkSetup />
              <MarbleWorld
                url={v.world.url.trim()}
                position={[v.world.x, v.world.y, v.world.z]}
                yawDeg={v.world.yaw}
                scale={v.world.scale}
                flip={v.world.flip}
                center={v.world.center}
              />
              <directionalLight
                position={[2.5, 3.2, 1.5]}
                intensity={v.light.sun}
                color={v.light.sunColor}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0004}
                shadow-camera-left={-1.5}
                shadow-camera-right={1.5}
                shadow-camera-top={1.5}
                shadow-camera-bottom={-1.5}
                shadow-camera-near={0.5}
                shadow-camera-far={10}
              />
            </>
          )}
          <CardBox
            position={BOX_POSITION}
            open={open}
            lidAngle={v.box.lidAngle}
            rotationY={THREE.MathUtils.degToRad(v.box.turn)}
            outerColor={v.box.outer}
            outerRoughness={v.box.outerRoughness}
            velvetColor={v.box.velvet}
            finishHex={finishHex}
            cardCount={Math.round(v.cards.count)}
            lift={v.cards.lift}
            metalness={v.cards.metalness}
            roughness={v.cards.roughness}
          />
          <ContactShadows
            position={[BOX_POSITION[0], BOX_POSITION[1] + 0.002, BOX_POSITION[2]]}
            opacity={0.55}
            scale={1.4}
            blur={2.4}
            far={0.5}
            color="#000000"
          />
          {v.post.enabled && (
            <EffectComposer multisampling={4}>
              {v.post.depthOfField ? (
                <DepthOfField
                  target={[BOX_POSITION[0], BOX_POSITION[1] + 0.03, BOX_POSITION[2]]}
                  focalLength={0.018}
                  bokehScale={v.post.bokeh}
                  height={720}
                />
              ) : (
                <Vignette eskil={false} offset={0} darkness={0} />
              )}
              <Bloom intensity={v.post.bloom} luminanceThreshold={1.0} luminanceSmoothing={0.3} mipmapBlur />
              <Vignette eskil={false} offset={0.25} darkness={v.post.vignette} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-[0.16em] text-[#d1c8af]">Office motion lab</span>
        <span className="text-sm text-[#a3a49b]">{v.look}</span>
        <span className="mt-2 text-[11px] text-[#6f7069]">
          Capture saves a PNG of the current frame · Save version in the panel to compare looks
        </span>
      </div>

      <DialRoot position="top-right" theme="dark" productionEnabled />
    </div>
  );
}

/** Keeps exposure live and exposes a PNG capture of the WebGL canvas. */
function RendererBridge({ exposure, onCapture }: { exposure: number; onCapture: (fn: () => void) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);
  useEffect(() => {
    onCapture(() => {
      const url = gl.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `office-lab-${Date.now()}.png`;
      a.click();
    });
  }, [gl, onCapture]);
  return null;
}

/** Cinematic camera: orbits the box, eases to the dial values, drifts a little. */
function Rig({
  fov,
  orbitDeg,
  height,
  distance,
  aim,
  drift,
}: {
  fov: number;
  orbitDeg: number;
  height: number;
  distance: number;
  aim: number;
  drift: boolean;
}) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = THREE.MathUtils.degToRad(orbitDeg) + (drift ? Math.sin(t * 0.17) * 0.05 : 0);
    target.current.set(BOX_POSITION[0], BOX_POSITION[1] + 0.03 + aim, BOX_POSITION[2]);
    desired.current.set(
      target.current.x + Math.sin(a) * distance,
      height + (drift ? Math.sin(t * 0.21) * 0.012 : 0),
      target.current.z + Math.cos(a) * distance
    );
    camera.position.lerp(desired.current, 0.06);
    camera.lookAt(target.current);
    const pc = camera as THREE.PerspectiveCamera;
    if (Math.abs(pc.fov - fov) > 0.01) {
      pc.fov = fov;
      pc.updateProjectionMatrix();
    }
  });
  return null;
}
