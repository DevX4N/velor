"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, type Points, ShaderMaterial } from "three";
import { current, live } from "@/lib/three/director";
import { noteWeights } from "./shaders/noise";

const vertex = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uNote;
uniform float uSize;
uniform float uPixelRatio;
uniform float uIntensity;
varying float vAlpha;
varying vec3 vColor;
uniform vec3 uBerg;
uniform vec3 uAmber;
uniform vec3 uOud;
${noteWeights}

void main(){
  vec3 w = noteWeights(uNote);
  float total = max(w.x + w.y + w.z, 1e-3);
  vec3 base = position;
  float t = uTime;

  // Bergamot: bright motes rising through the light, a little lateral sway.
  vec3 pB = base;
  pB.y = mod(base.y + t * (0.1 + aSeed.x * 0.16) + 3.0, 6.0) - 3.0;
  pB.x += sin(t * 0.35 + aSeed.y * 6.2831) * 0.18;

  // Black amber: heavy, slow orbit around the vanished bottle.
  float ang = atan(base.z, base.x) + t * (0.025 + aSeed.z * 0.04);
  float rad = length(base.xz) * 0.85;
  vec3 pA = vec3(cos(ang) * rad, base.y * 0.6 + sin(t * 0.25 + aSeed.w * 6.2831) * 0.18, sin(ang) * rad);

  // Vetiver & oud: low, horizontal, curling like smoke over wood.
  vec3 pO = base;
  pO.x = mod(base.x + t * (0.06 + aSeed.y * 0.08) + 4.5, 9.0) - 4.5;
  pO.y = base.y * 0.42 - 0.55 + sin(pO.x * 1.2 + t * 0.4 + aSeed.x * 4.0) * 0.28;
  pO.z += cos(pO.x * 0.8 + t * 0.3) * 0.25;

  vec3 p = (pB * w.x + pA * w.y + pO * w.z) / total;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // Each note shows a different share of the motes, at a different size.
  float showA = step(aSeed.w, 0.32);
  float showO = step(aSeed.w, 0.7);
  float size = (w.x * (0.7 + aSeed.z * 0.9) + w.y * showA * (2.0 + aSeed.z * 2.6) + w.z * showO * (1.0 + aSeed.z * 1.4)) / total;
  float twinkle = 0.55 + 0.45 * sin(t * (0.6 + aSeed.x * 1.4) + aSeed.y * 40.0);
  float alpha = (w.x * 0.85 * twinkle + w.y * showA * 0.42 + w.z * showO * 0.32 * (0.6 + 0.4 * twinkle)) / total;

  // Fade near the camera and in the far distance: a shallow, photographic depth.
  float depth = -mv.z;
  alpha *= smoothstep(0.6, 2.2, depth) * (1.0 - smoothstep(7.5, 11.0, depth));
  vAlpha = alpha * uIntensity;
  vColor = (uBerg * w.x + uAmber * w.y + uOud * w.z) / total;
  gl_PointSize = uSize * size * uPixelRatio * (1.0 / depth);
}
`;

const fragment = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
}
`;

export function EssenceParticles({ count }: { count: number }) {
  const ref = useRef<Points>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 4);
    let s = 1234567;
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 8;
      pos[i * 3 + 1] = (rand() - 0.5) * 5.5;
      pos[i * 3 + 2] = (rand() - 0.5) * 6 - 0.8;
      for (let k = 0; k < 4; k++) seed[i * 4 + k] = rand();
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 4));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uNote: { value: 1 },
          uSize: { value: 26 },
          uPixelRatio: { value: 1 },
          uIntensity: { value: 0 },
          uBerg: { value: new Color("#f3dcae") },
          uAmber: { value: new Color("#c0742a") },
          uOud: { value: new Color("#a89580") },
        },
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    const p = current;
    const pts = ref.current;
    if (!pts) return;
    pts.visible = p.essence > 0.002;
    if (!pts.visible) return;
    const u = material.uniforms;
    // Reduced motion: the motes hold still and only the composition changes with scroll.
    u.uTime.value = live.reduced ? 12 : state.clock.elapsedTime;
    u.uNote.value = p.note;
    u.uIntensity.value = p.essence;
    u.uPixelRatio.value = dpr;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
}
