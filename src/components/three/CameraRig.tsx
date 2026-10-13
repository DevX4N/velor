"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Vector2 } from "three";
import { current, intro, live } from "@/lib/three/director";
import { FRAMING } from "@/lib/three/keyframes";

/** Applies the director's camera, background and environment state every frame. */
export function CameraRig() {
  const scene = useThree((s) => s.scene);
  const bg = useMemo(() => new Color(), []);
  const drift = useMemo(() => new Vector2(), []);

  useFrame(({ camera }) => {
    const p = current;
    const fit = FRAMING.fit(live.aspect);
    const lat = FRAMING.lateral(live.aspect);

    drift.x += (live.pointerX - drift.x) * 0.04;
    drift.y += (live.pointerY - drift.y) * 0.04;

    // The intro dolly starts the camera further back and lets it settle in.
    const dolly = (1 - intro.dolly) * 1.6;
    camera.position.set(p.camX * lat + drift.x * 0.08, p.camY - drift.y * 0.05, p.camZ * fit + dolly);
    camera.lookAt(p.tgtX * lat, p.tgtY, 0);

    // Assigned here (not in useMemo): Strict Mode may build the memo twice.
    if (scene.background !== bg) scene.background = bg;
    bg.setRGB(p.bgR, p.bgG, p.bgB);

    const lit = p.presence * (0.04 + 0.96 * intro.light);
    scene.environmentIntensity = p.env * lit;
    // The hero light sweep: the softboxes swing across the glass once.
    scene.environmentRotation.set(0, p.envRot - (1 - intro.sweep) * 2.2, 0);
  });

  return null;
}
