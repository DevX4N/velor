"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import { detectTier, hasFinePointer } from "@/lib/device";
import { live, setInvalidate } from "@/lib/three/director";
import { FRAMING } from "@/lib/three/keyframes";
import { setExperience, type Tier, useExperience } from "@/lib/store";
import { fontFamily } from "@/lib/three/textures";
import { Atmosphere } from "./Atmosphere";
import { BottleLighting } from "./BottleLighting";
import { CalloutProjector } from "./CalloutProjector";
import { CameraRig } from "./CameraRig";
import { EssenceParticles } from "./EssenceParticles";
import { GLTFBottle } from "./GLTFBottle";
import { PerfumeBottle } from "./PerfumeBottle";
import { Wordmark3D } from "./Wordmark3D";

const GLB_URL = process.env.NEXT_PUBLIC_VELOR_BOTTLE_GLB;

const QUALITY: Record<Tier, { dpr: [number, number]; particles: number; env: number; transmission: number }> = {
  high: { dpr: [1, 1.75], particles: 1400, env: 512, transmission: 1 },
  mid: { dpr: [1, 1.5], particles: 900, env: 256, transmission: 0.75 },
  low: { dpr: [1, 1.25], particles: 480, env: 128, transmission: 0.5 },
};

/** Compiles every shader up front, then tells the preloader the stage can be shown. */
function ReadySignal({ fontsReady }: { fontsReady: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!fontsReady) return;
    let cancelled = false;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        invalidate();
        // Two frames: one to upload, one to draw the lit bottle.
        requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setExperience({ stageReady: true })));
      });
    return () => {
      cancelled = true;
    };
  }, [fontsReady, gl, scene, camera, invalidate]);

  return null;
}

export default function Stage() {
  const [tier] = useState<Tier>(() => detectTier());
  const q = QUALITY[tier];
  const [dpr, setDpr] = useState<number>(() => Math.min(window.devicePixelRatio || 1, q.dpr[1]));
  const [fontsReady, setFontsReady] = useState(false);
  // Product close-ups (hero, revelation, daylight) carry no particles: spend the budget on pixels.
  const scene = useExperience((s) => s.activeScene);
  const showcase = scene === "awakening" || scene === "revelation" || scene === "desire";
  const effectiveDpr = showcase && tier !== "high" ? Math.min(window.devicePixelRatio || 1, 2) : dpr;

  // Canvas textures (label, wordmark) need the real faces, not the fallback metrics.
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setFontsReady(true);
      }
    };
    const serif = fontFamily("--font-bodoni", "serif");
    const sans = fontFamily("--font-jost", "sans-serif");
    Promise.all([
      document.fonts.load(`400 120px ${serif}`),
      document.fonts.load(`300 30px ${sans}`),
      document.fonts.load(`400 30px ${sans}`),
    ]).then(finish, finish);
    const t = window.setTimeout(finish, 2500);
    return () => window.clearTimeout(t);
  }, []);

  // Pointer → a normalised offset the camera and bottle drift toward (precise pointers only).
  useEffect(() => {
    if (!hasFinePointer() || live.reduced) return;
    const onMove = (e: PointerEvent) => {
      live.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      live.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => () => setInvalidate(null), []);

  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={effectiveDpr}
        camera={{ fov: FRAMING.fov, near: 0.1, far: 40, position: [0, 0, 8] }}
        gl={{ antialias: tier !== "low", powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={({ gl, invalidate }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.transmissionResolutionScale = q.transmission;
          setInvalidate(invalidate);
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setExperience({ webglFailed: true, stageReady: true });
          });
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(q.dpr[1], d + 0.25))}
          flipflops={3}
        />
        <CameraRig />
        <BottleLighting resolution={q.env} />
        <Wordmark3D ready={fontsReady} />
        {GLB_URL ? (
          <Suspense fallback={<PerfumeBottle labelReady={fontsReady} />}>
            <GLTFBottle url={GLB_URL} />
          </Suspense>
        ) : (
          <PerfumeBottle labelReady={fontsReady} />
        )}
        <Atmosphere tier={tier} />
        <EssenceParticles count={q.particles} />
        <CalloutProjector />
        <ReadySignal fontsReady={fontsReady} />
      </Canvas>
    </div>
  );
}
