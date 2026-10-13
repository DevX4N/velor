"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Mesh, PlaneGeometry, ShaderMaterial, type Texture } from "three";
import { current, intro, live } from "@/lib/three/director";
import { FRAMING } from "@/lib/three/keyframes";
import { fontFamily, wordmarkAlpha } from "@/lib/three/textures";

const DEPTH = -1.7;

const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

// Opaque on purpose: the plane writes the background colour where there is no ink, so the
// glass's transmission pass "sees" the wordmark and refracts it through the smoked body.
const frag = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uBg;
uniform vec3 uInk;
uniform float uOpacity;
uniform float uReveal;
uniform float uSweep;
varying vec2 vUv;
void main(){
  // Letters rise into a vertical mask that opens from the baseline.
  float rise = (1.0 - uReveal) * 0.32;
  vec2 uv = vec2(vUv.x, vUv.y - rise);
  float ink = uv.y < 0.0 ? 0.0 : texture2D(uMap, uv).g;
  float mask = 1.0 - smoothstep(uReveal * 1.18 - 0.18, uReveal * 1.18, vUv.y);
  float sheen = exp(-pow((vUv.x - uSweep) * 5.0, 2.0)) * 0.4;
  vec3 col = mix(uBg, uInk * (0.78 + sheen), ink * mask * uOpacity);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export function Wordmark3D({ ready }: { ready: boolean }) {
  const mesh = useRef<Mesh>(null);
  const tex = useRef<Texture | null>(null);
  const aspect = useRef(3.6);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        toneMapped: false,
        uniforms: {
          uMap: { value: null },
          uBg: { value: new Color() },
          uInk: { value: new Color("#F0E9DF") },
          uOpacity: { value: 0 },
          uReveal: { value: 0 },
          uSweep: { value: -0.5 },
        },
      }),
    [],
  );
  const geometry = useMemo(() => new PlaneGeometry(1, 1), []);

  useEffect(() => {
    if (!ready) return;
    const { tex: t, aspect: a } = wordmarkAlpha(fontFamily("--font-bodoni", "serif"));
    tex.current = t;
    aspect.current = a;
    material.uniforms.uMap.value = t;
    return () => t.dispose();
  }, [ready, material]);

  useEffect(
    () => () => {
      material.dispose();
      geometry.dispose();
    },
    [material, geometry],
  );

  useFrame(({ camera }) => {
    const m = mesh.current;
    if (!m) return;
    const p = current;
    const show = p.wordmark * (ready ? 1 : 0);
    // Opaque plane: hide it entirely once the word is gone, or it would occlude the atmosphere.
    m.visible = show > 0.002;
    if (!m.visible) return;
    const u = material.uniforms;
    u.uBg.value.setRGB(p.bgR, p.bgG, p.bgB);
    u.uOpacity.value = show;
    u.uReveal.value = intro.wordmark;
    u.uSweep.value = -0.4 + intro.sweep * 1.8;

    // Fit the word to the frame at its depth: full-bleed on landscape, a masthead on portrait.
    const dist = camera.position.z - DEPTH;
    const visH = 2 * dist * Math.tan(((FRAMING.fov / 2) * Math.PI) / 180);
    const visW = visH * live.aspect;
    const w = live.portrait ? visW * 0.9 : Math.min(visW * 0.9, visH * 3.1);
    const h = w / aspect.current;
    m.scale.set(w, h, 1);
    // Portrait: a masthead whose lower half the cap rises into (so the glass still refracts it).
    const y = live.portrait ? visH * 0.245 : -h * 0.04;
    m.position.set(0, y, DEPTH);
  });

  return <mesh ref={mesh} geometry={geometry} material={material} renderOrder={0} />;
}
