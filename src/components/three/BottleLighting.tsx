"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { DirectionalLight, SpotLight } from "three";
import { current, intro } from "@/lib/three/director";

/**
 * A black-cyclorama studio. The environment holds the softboxes the glass reflects
 * (a warm strip key, a cool fill, two rim strips behind, a top softbox); three direct lights
 * shape the metal. Everything is multiplied by the scene's `presence` and the hero intro,
 * so "the light leaving the room" is literally how the bottle disappears.
 */
export function BottleLighting({ resolution }: { resolution: number }) {
  const key = useRef<SpotLight>(null);
  const rimL = useRef<DirectionalLight>(null);
  const rimR = useRef<DirectionalLight>(null);

  useFrame(() => {
    const p = current;
    const lit = p.presence * (0.04 + 0.96 * intro.light);
    if (key.current) key.current.intensity = 70 * p.key * lit;
    if (rimL.current) rimL.current.intensity = 1.6 * p.rim * lit;
    if (rimR.current) rimR.current.intensity = 2.6 * p.rim * lit;
  });

  return (
    <>
      <Environment resolution={resolution} frames={1}>
        {/* key strip, warm, camera left */}
        <Lightformer form="rect" intensity={5} color="#ffd8a6" scale={[0.7, 7, 1]} position={[-4.2, 1, 2]} />
        {/* fill strip, cooler and weaker, camera right */}
        <Lightformer form="rect" intensity={1.3} color="#f0e9df" scale={[0.28, 7, 1]} position={[4.4, 0.6, 1.2]} />
        {/* a high diffusion card behind the camera: the cap's front face catches it as warm gold */}
        <Lightformer form="rect" intensity={2.2} color="#ffe0b0" scale={[7, 1.8, 1]} position={[0, 3.2, 5.5]} target={[0, 0.6, 0]} />
        {/* a broad softbox front-left: the faces turned toward camera-left glow gold, not black */}
        <Lightformer form="rect" intensity={1.5} color="#ffdcae" scale={[4.5, 2.6, 1]} position={[-3, 1.1, 4.6]} target={[0, 0.4, 0]} />
        {/* a long low card behind the camera: the classic horizon line across the glass front */}
        <Lightformer form="rect" intensity={1.1} color="#f3e6d2" scale={[12, 0.35, 1]} position={[0, -1.5, 6.5]} target={[0, -0.2, 0]} />
        {/* rim strips behind the set: they draw the glass edges */}
        <Lightformer form="rect" intensity={6} color="#fff1dc" scale={[0.22, 6, 1]} position={[-2.4, 0.4, -4.5]} />
        <Lightformer form="rect" intensity={4} color="#ffe6c4" scale={[0.22, 6, 1]} position={[2.6, 0.4, -4.5]} />
        {/* overhead softbox */}
        <Lightformer form="rect" intensity={1.4} color="#ffffff" scale={[5, 2.2, 1]} position={[0, 5.5, 0.5]} />
        {/* a low gold bounce, as if from a card on the floor */}
        <Lightformer form="rect" intensity={0.5} color="#c4a77d" scale={[6, 1.2, 1]} position={[0, -4.5, 1.5]} />
      </Environment>

      <spotLight
        ref={key}
        position={[-3.4, 3.2, 3.6]}
        angle={0.42}
        penumbra={1}
        decay={2}
        color="#ffdcae"
      />
      <directionalLight ref={rimL} position={[-3, 1.5, -4]} color="#fff3e2" />
      <directionalLight ref={rimR} position={[3.2, 2.2, -4]} color="#ffe9c9" />
    </>
  );
}
