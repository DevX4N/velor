"use client";

import { type RefObject, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { type Object3D, Vector2 } from "three";
import { EXPLODE, LAYOUT } from "./bottle-spec";
import { current, intro, live } from "./director";
import { FRAMING } from "./keyframes";
import { parts } from "./registry";

const smoother = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const windowed = (e: number, [a, b]: [number, number]) => smoother((e - a) / (b - a));

type Refs = {
  root: RefObject<Object3D | null>;
  cap: RefObject<Object3D | null>;
  sprayer: RefObject<Object3D | null>;
  body: RefObject<Object3D | null>;
  liquid: RefObject<Object3D | null>;
};

/**
 * Pose + anatomy motion for any bottle that exposes the four part groups.
 * Shared by the procedural bottle and the GLB path, so swapping the model never touches the film.
 * Part groups are animated as offsets from their rest position (cap at LAYOUT.capCenter).
 */
export function useBottleMotion(refs: Refs, capRestY = LAYOUT.capCenter) {
  const tilt = useMemo(() => new Vector2(), []);

  useEffect(() => {
    parts.cap = refs.cap.current ?? undefined;
    parts.sprayer = refs.sprayer.current ?? undefined;
    parts.body = refs.body.current ?? undefined;
    parts.liquid = refs.liquid.current ?? undefined;
    return () => {
      delete parts.cap;
      delete parts.sprayer;
      delete parts.body;
      delete parts.liquid;
    };
  }, [refs.cap, refs.sprayer, refs.body, refs.liquid]);

  useFrame((state) => {
    const r = refs.root.current;
    const cap = refs.cap.current;
    const sprayer = refs.sprayer.current;
    const body = refs.body.current;
    if (!r || !cap || !sprayer || !body) return;
    const p = current;
    const t = state.clock.elapsedTime;
    const lat = FRAMING.lateral(live.aspect);
    const still = live.reduced;

    // Pointer parallax eases in, so the bottle notices the visitor without twitching.
    tilt.x += (live.pointerX - tilt.x) * 0.05;
    tilt.y += (live.pointerY - tilt.y) * 0.05;
    const breathe = still ? 0 : Math.sin(t * 0.55) * 0.012;
    const sway = still ? 0 : Math.sin(t * 0.32) * 0.018;

    r.position.set(p.posX * lat, p.posY + breathe, p.posZ);
    r.rotation.set(p.rotX + tilt.y * 0.05, p.rotY + live.dragRot + tilt.x * 0.14 + sway, p.rotZ);
    r.scale.setScalar(p.scale);

    // Anatomy: three parts, three overlapping windows — the cap leads, the body follows last.
    const e = p.explode;
    const kc = windowed(e, EXPLODE.cap.window);
    const ks = windowed(e, EXPLODE.sprayer.window);
    const kb = windowed(e, EXPLODE.body.window);
    const drift = still ? 0 : Math.sin(t * 0.8) * 0.012 * e;

    cap.position.y = capRestY + EXPLODE.cap.y * kc + drift;
    cap.rotation.set(0, EXPLODE.cap.rotY * kc, EXPLODE.cap.rotZ * kc);
    sprayer.position.y = EXPLODE.sprayer.y * ks - drift * 0.6;
    sprayer.rotation.y = EXPLODE.sprayer.rotY * ks;
    body.position.y = EXPLODE.body.y * kb;

    const lit = p.presence * (0.04 + 0.96 * intro.light);
    r.visible = lit > 0.003 || p.bgR > 0.2;
  });
}
