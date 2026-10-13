"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  type Group,
  IcosahedronGeometry,
  type Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { current, live } from "@/lib/three/director";
import type { Tier } from "@/lib/store";
import { noteWeights, simplex3 } from "./shaders/noise";

/**
 * The fragrance as atmosphere. Three layers, each weighted by the current note:
 *  - a haze plane behind everything (bergamot light / amber glow / oud smoke and grain),
 *  - a volumetric light shaft,
 *  - three resin forms that surface in the heart of the fragrance (black amber).
 */

const hazeFrag = (octaves: number) => /* glsl */ `
uniform float uTime;
uniform float uNote;
uniform float uIntensity;
uniform vec3 uBerg;
uniform vec3 uAmber;
uniform vec3 uOud;
varying vec2 vUv;
${simplex3}
${noteWeights}

float fbm(vec3 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < ${octaves}; i++){ s += a * snoise(p); p *= 2.03; a *= 0.5; }
  return s;
}

void main(){
  vec3 w = noteWeights(uNote);
  vec2 uv = vUv;
  vec2 c = uv - 0.5;
  float t = uTime;

  // Bergamot: a warm, high light — soft bloom from the upper left, barely moving.
  float glow = exp(-dot(c - vec2(-0.22, 0.28), c - vec2(-0.22, 0.28)) * 5.0);
  float bergamot = glow * (0.55 + 0.25 * fbm(vec3(uv * 2.0, t * 0.04)));

  // Black amber: slow resin pools of heat in the dark.
  float pools = fbm(vec3(uv * 1.4 + vec2(0.0, t * 0.01), t * 0.03));
  float amber = smoothstep(0.05, 0.75, pools) * (1.0 - smoothstep(0.2, 0.75, length(c)));

  // Vetiver & oud: domain-warped smoke, stretched sideways into a grain.
  vec2 q = vec2(uv.x * 0.55, uv.y * 1.6);
  vec2 warp = vec2(fbm(vec3(q * 1.8, t * 0.05)), fbm(vec3(q * 1.8 + 7.3, t * 0.05)));
  float smoke = fbm(vec3(q * 2.2 + warp * 1.4 + vec2(t * 0.025, 0.0), t * 0.03));
  float grain = 0.5 + 0.5 * sin((q.y + smoke * 0.35) * 70.0);
  float oud = smoothstep(-0.15, 0.7, smoke) * (0.8 + 0.2 * grain) * (1.0 - smoothstep(0.15, 0.62, abs(c.y + 0.08)));

  vec3 col = uBerg * bergamot * w.x + uAmber * amber * w.y + uOud * oud * w.z;
  float vignette = 1.0 - smoothstep(0.35, 0.78, length(c * vec2(1.0, 1.25)));
  gl_FragColor = vec4(col * vignette * uIntensity, 1.0);
}
`;

const shaftFrag = /* glsl */ `
uniform float uTime;
uniform float uStrength;
uniform vec3 uColor;
varying vec2 vUv;
${simplex3}
void main(){
  // A beam entering from the top, widening as it falls; dust drifts through it.
  float x = vUv.x - 0.5;
  float width = mix(0.04, 0.34, 1.0 - vUv.y);
  float beam = 1.0 - smoothstep(0.0, width, abs(x));
  beam *= smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
  float dust = 0.75 + 0.25 * snoise(vec3(vUv * vec2(6.0, 3.0) + vec2(0.0, uTime * 0.08), uTime * 0.05));
  gl_FragColor = vec4(uColor * beam * dust * uStrength, 1.0);
}
`;

const resinVert = /* glsl */ `
uniform float uTime;
uniform float uSeed;
varying vec3 vNormal;
varying vec3 vView;
${simplex3}
void main(){
  vec3 p = position;
  float n = snoise(normal * 1.3 + vec3(uSeed, uTime * 0.12, uSeed * 0.5));
  p += normal * n * 0.13;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const resinFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  float f = 1.0 - abs(dot(normalize(vNormal), normalize(vView)));
  // Lit edges plus an inner glow that deepens toward the centre: a body of resin, not an outline.
  float rim = pow(f, 3.2);
  float body = pow(1.0 - f, 1.3) * 0.5 + pow(f, 1.1) * 0.16;
  gl_FragColor = vec4(uColor * (rim * 0.85 + body) * uStrength, 1.0);
}
`;

const quad = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const RESINS: { pos: [number, number, number]; scale: number; seed: number }[] = [
  { pos: [-2.3, 0.55, -2.6], scale: 0.85, seed: 1.7 },
  { pos: [2.5, -0.35, -3.2], scale: 1.25, seed: 4.2 },
  { pos: [0.7, 1.45, -4.4], scale: 0.7, seed: 8.9 },
];

export function Atmosphere({ tier }: { tier: Tier }) {
  const group = useRef<Group>(null);
  const resins = useRef<(Mesh | null)[]>([]);

  const res = useMemo(() => {
    const haze = new ShaderMaterial({
      vertexShader: quad,
      fragmentShader: hazeFrag(tier === "low" ? 3 : 4),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uNote: { value: 1 },
        uIntensity: { value: 0 },
        uBerg: { value: new Color("#8f8670") },
        uAmber: { value: new Color("#4a2208") },
        uOud: { value: new Color("#7a6552") },
      },
    });
    const shaft = new ShaderMaterial({
      vertexShader: quad,
      fragmentShader: shaftFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uStrength: { value: 0 }, uColor: { value: new Color("#8a6c42") } },

    });
    const resin = Array.from(
      { length: RESINS.length },
      (_, i) =>
        new ShaderMaterial({
          vertexShader: resinVert,
          fragmentShader: resinFrag,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uSeed: { value: RESINS[i].seed },
            uStrength: { value: 0 },
            uColor: { value: new Color("#8a4512") },
          },
        }),
    );
    return {
      haze,
      shaft,
      // The beam is pale champagne-ivory for bergamot and warms toward amber with the heart.
      shaftBergamot: new Color("#c9bea6"),
      shaftWarm: new Color("#8a6c42"),
      resin,
      hazeGeo: new PlaneGeometry(16, 10),
      shaftGeo: new PlaneGeometry(3.2, 8),
      resinGeo: new IcosahedronGeometry(1, tier === "high" ? 40 : 20),
    };
  }, [tier]);

  useEffect(
    () => () => {
      res.haze.dispose();
      res.shaft.dispose();
      res.resin.forEach((m) => m.dispose());
      res.hazeGeo.dispose();
      res.shaftGeo.dispose();
      res.resinGeo.dispose();
    },
    [res],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = current;
    g.visible = p.essence > 0.002;
    if (!g.visible) return;
    const t = live.reduced ? 20 : state.clock.elapsedTime;
    const n = p.note;
    const wb = n <= 1 ? 1 : Math.max(0, 1 - Math.abs(n - 1));
    const wa = Math.max(0, 1 - Math.abs(n - 2));
    const wo = n >= 3 ? 1 : Math.max(0, 1 - Math.abs(n - 3));

    res.haze.uniforms.uTime.value = t;
    res.haze.uniforms.uNote.value = n;
    res.haze.uniforms.uIntensity.value = p.essence;

    res.shaft.uniforms.uTime.value = t;
    res.shaft.uniforms.uStrength.value = p.essence * (wb * 0.62 + wa * 0.18 + wo * 0.3);
    (res.shaft.uniforms.uColor.value as Color).lerpColors(res.shaftWarm, res.shaftBergamot, wb);

    res.resin.forEach((m, i) => {
      m.uniforms.uTime.value = t + i * 3;
      // The forms "surface" slowly: they grow into place as the heart note arrives.
      m.uniforms.uStrength.value = p.essence * wa * 0.75;
      const mesh = resins.current[i];
      if (mesh) {
        const grow = 0.6 + 0.4 * wa;
        mesh.scale.setScalar(RESINS[i].scale * grow);
        mesh.rotation.y = t * 0.05 + i;
        mesh.rotation.x = t * 0.03;
        mesh.visible = wa > 0.01;
      }
    });
  });

  return (
    <group ref={group} renderOrder={4}>
      <mesh geometry={res.hazeGeo} material={res.haze} position={[0, 0, -5.5]} />
      <mesh geometry={res.shaftGeo} material={res.shaft} position={[-1.1, 0.6, -2.4]} rotation={[0, 0, -0.32]} />
      {RESINS.map((r, i) => (
        <mesh
          key={i}
          ref={(m) => {
            resins.current[i] = m;
          }}
          geometry={res.resinGeo}
          material={res.resin[i]}
          position={r.pos}
        />
      ))}
    </group>
  );
}
