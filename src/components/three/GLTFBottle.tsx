"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import type { Group, Object3D } from "three";
import { useBottleMotion } from "@/lib/three/useBottleMotion";

/**
 * Drop-in replacement for the procedural bottle. Export a GLB with four top-level nodes named
 * `Cap`, `Sprayer`, `Body` and `Liquid` (Liquid may live inside Body), centred on the origin,
 * ~1.77 units tall, then set NEXT_PUBLIC_VELOR_BOTTLE_GLB=/assets/models/<file>.glb.
 * The film (keyframes, anatomy, callouts) is unchanged; adjust CALLOUT_ANCHORS if the
 * proportions differ.
 */
export function GLTFBottle({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const root = useRef<Group>(null);
  const cap = useRef<Group>(null);
  const sprayer = useRef<Group>(null);
  const body = useRef<Group>(null);
  const liquid = useRef<Group>(null);

  const nodes = useMemo(() => {
    const clone = scene.clone(true);
    const find = (name: string) => clone.getObjectByName(name) ?? null;
    const n = { cap: find("Cap"), sprayer: find("Sprayer"), body: find("Body"), liquid: find("Liquid") };
    // Detach the parts so each can sit in its own animated group.
    Object.values(n).forEach((o) => o?.removeFromParent());
    return n as Record<"cap" | "sprayer" | "body" | "liquid", Object3D | null>;
  }, [scene]);

  useEffect(() => {
    if (!nodes.cap || !nodes.body) console.warn("[VÉLOR] GLB is missing Cap/Body nodes; check the export.");
  }, [nodes]);

  useBottleMotion({ root, cap, sprayer, body, liquid }, 0);

  return (
    <group ref={root}>
      <group ref={body}>
        {nodes.body && <primitive object={nodes.body} />}
        <group ref={liquid}>{nodes.liquid && <primitive object={nodes.liquid} />}</group>
      </group>
      <group ref={sprayer}>{nodes.sprayer && <primitive object={nodes.sprayer} />}</group>
      <group ref={cap}>{nodes.cap && <primitive object={nodes.cap} />}</group>
    </group>
  );
}
