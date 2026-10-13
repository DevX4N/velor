"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  type Group,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BOTTLE, LAYOUT, MATERIALS } from "@/lib/three/bottle-spec";
import { current } from "@/lib/three/director";
import { useBottleMotion } from "@/lib/three/useBottleMotion";
import { anisotropyDirection, brushedRoughness, contactShadow, fontFamily, labelAlpha } from "@/lib/three/textures";

/** A thin horizontal slab with the same corner radius as the cap (for the seam). */
function roundedSlab(w: number, d: number, r: number, h: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -h / 2, 0);
  return g;
}

/**
 * VÉLOR Nº 01, built from primitives: smoked glass body with a solid base, the essence inside,
 * a gold collar + actuator + dip tube (the sprayer), and a brushed gold cap.
 * Cap, sprayer and body are independent groups so the anatomy scene can take them apart.
 */
export function PerfumeBottle({ labelReady }: { labelReady: boolean }) {
  const root = useRef<Group>(null);
  const cap = useRef<Group>(null);
  const sprayer = useRef<Group>(null);
  const body = useRef<Group>(null);
  const liquid = useRef<Group>(null);
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  const geo = useMemo(() => {
    const b = BOTTLE.body;
    const innerW = b.w - b.wall * 2;
    const innerD = b.d - b.wall * 2;
    const liquidH = LAYOUT.liquidTop - LAYOUT.innerBottom;
    return {
      body: new RoundedBoxGeometry(b.w, b.h, b.d, 8, b.radius),
      liquid: new RoundedBoxGeometry(innerW, liquidH, innerD, 6, 0.045),
      neck: new CylinderGeometry(BOTTLE.neck.r, BOTTLE.neck.r * 1.08, BOTTLE.neck.h, 48),
      collar: new CylinderGeometry(BOTTLE.collar.r, BOTTLE.collar.r, BOTTLE.collar.h, 64),
      collarLip: new CylinderGeometry(BOTTLE.collar.r * 1.04, BOTTLE.collar.r * 1.04, 0.012, 64),
      stem: new CylinderGeometry(BOTTLE.stem.r, BOTTLE.stem.r, BOTTLE.stem.h, 32),
      actuator: new CylinderGeometry(BOTTLE.actuator.r, BOTTLE.actuator.r * 0.98, BOTTLE.actuator.h, 64),
      nozzle: new CylinderGeometry(0.014, 0.014, 0.02, 20),
      dipTube: new CylinderGeometry(
        BOTTLE.dipTube.r,
        BOTTLE.dipTube.r,
        LAYOUT.collarBottom - LAYOUT.innerBottom - 0.02,
        12,
      ),
      cap: new RoundedBoxGeometry(BOTTLE.cap.w, BOTTLE.cap.h, BOTTLE.cap.d, 8, BOTTLE.cap.radius),
      capSeam: roundedSlab(BOTTLE.cap.w + 0.003, BOTTLE.cap.d + 0.003, BOTTLE.cap.radius + 0.0015, 0.006),
      capHollow: new PlaneGeometry(BOTTLE.cap.w - 0.07, BOTTLE.cap.d - 0.07),
      label: new PlaneGeometry(BOTTLE.label.w, BOTTLE.label.h),
      shadow: new PlaneGeometry(2.6, 2.6),
    };
  }, []);

  const mat = useMemo(() => {
    const rough = brushedRoughness();
    rough.repeat.set(1, 1);
    const glass = new MeshPhysicalMaterial({ ...MATERIALS.glass, transmission: 1, metalness: 0 });
    const neckGlass = glass.clone();
    neckGlass.thickness = 0.2;
    const gold = new MeshPhysicalMaterial({
      color: MATERIALS.gold.color,
      metalness: 1,
      roughness: MATERIALS.gold.roughness,
      roughnessMap: rough,
      anisotropy: MATERIALS.gold.anisotropy,
      anisotropyMap: anisotropyDirection(),
      clearcoat: MATERIALS.gold.clearcoat,
      clearcoatRoughness: MATERIALS.gold.clearcoatRoughness,
    });
    const goldPolished = new MeshPhysicalMaterial({
      color: MATERIALS.goldPolished.color,
      metalness: 1,
      roughness: MATERIALS.goldPolished.roughness,
    });
    const seam = new MeshStandardMaterial({ color: "#1a140c", metalness: 0.6, roughness: 0.5 });
    const hollow = new MeshStandardMaterial({ color: "#0b0906", roughness: 0.9, side: DoubleSide });
    const liquidMat = new MeshPhysicalMaterial({
      color: MATERIALS.liquid.color,
      roughness: MATERIALS.liquid.roughness,
      emissive: MATERIALS.liquid.emissive,
      emissiveIntensity: MATERIALS.liquid.emissiveIntensity,
      // The glass in front does the reflecting; the essence itself stays matte-ish,
      // or it would mirror the softboxes through the glass.
      envMapIntensity: 0.25,
      sheen: 0.3,
      sheenColor: "#c4a77d",
    });
    const tube = new MeshStandardMaterial({ color: "#b9b1a4", roughness: 0.25, metalness: 0 });
    const nozzle = new MeshStandardMaterial({ color: "#050403", roughness: 0.6 });
    const label = new MeshPhysicalMaterial({
      color: MATERIALS.label.color,
      metalness: 1,
      roughness: MATERIALS.label.roughness,
      emissive: MATERIALS.label.emissive,
      emissiveIntensity: MATERIALS.label.emissiveIntensity,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const shadow = new MeshBasicMaterial({
      map: contactShadow(),
      transparent: true,
      depthWrite: false,
      opacity: 0,
      color: "#5b4a33",
    });
    return { glass, neckGlass, gold, goldPolished, seam, hollow, liquidMat, tube, nozzle, label, shadow };
  }, []);

  // Full anisotropic filtering on the brushing, or it shimmers into moiré on phones.
  useEffect(() => {
    const r = mat.gold.roughnessMap;
    if (r) {
      r.anisotropy = maxAnisotropy;
      r.needsUpdate = true;
    }
  }, [mat, maxAnisotropy]);

  // The label is printed once the display fonts are available (see Stage → fontsReady).
  useEffect(() => {
    if (!labelReady) return;
    const tex = labelAlpha(fontFamily("--font-bodoni", "serif"), fontFamily("--font-jost", "sans-serif"));
    mat.label.alphaMap = tex;
    mat.label.needsUpdate = true;
    return () => tex.dispose();
  }, [labelReady, mat]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mat).forEach((m) => {
        const textured = m as MeshPhysicalMaterial;
        textured.map?.dispose();
        textured.roughnessMap?.dispose();
        textured.anisotropyMap?.dispose();
        m.dispose();
      });
    },
    [geo, mat],
  );

  useBottleMotion({ root, cap, sprayer, body, liquid });

  useFrame(() => {
    // Contact shadow only exists on the daylight set.
    const p = current;
    mat.shadow.opacity = p.shadow * 0.85 * Math.min(1, p.presence * 1.2);
  });

  const b = BOTTLE.body;
  return (
    <group ref={root} dispose={null}>
      {/* BODY: smoked glass, essence, printed label */}
      <group ref={body}>
        <mesh geometry={geo.body} material={mat.glass} position-y={LAYOUT.bodyCenter} renderOrder={2} />
        <group ref={liquid} position-y={(LAYOUT.innerBottom + LAYOUT.liquidTop) / 2}>
          <mesh geometry={geo.liquid} material={mat.liquidMat} />
        </group>
        <mesh geometry={geo.neck} material={mat.neckGlass} position-y={LAYOUT.bodyTop + BOTTLE.neck.h / 2 - 0.005} />
        <mesh
          geometry={geo.label}
          material={mat.label}
          position={[0, LAYOUT.bodyCenter + BOTTLE.label.y, b.d / 2 + 0.0015]}
          renderOrder={3}
          visible={labelReady}
        />
        <mesh
          geometry={geo.shadow}
          material={mat.shadow}
          rotation-x={-Math.PI / 2}
          position-y={LAYOUT.bodyBottom - 0.004}
          renderOrder={1}
        />
      </group>

      {/* SPRAYER: collar, stem, actuator, nozzle, dip tube */}
      <group ref={sprayer}>
        <mesh geometry={geo.collar} material={mat.gold} position-y={(LAYOUT.collarBottom + LAYOUT.collarTop) / 2} />
        <mesh geometry={geo.collarLip} material={mat.goldPolished} position-y={LAYOUT.collarTop - 0.006} />
        <mesh geometry={geo.stem} material={mat.goldPolished} position-y={LAYOUT.collarTop + BOTTLE.stem.h / 2} />
        <mesh geometry={geo.actuator} material={mat.gold} position-y={LAYOUT.stemTop + BOTTLE.actuator.h / 2 - 0.01} />
        <mesh
          geometry={geo.nozzle}
          material={mat.nozzle}
          rotation-x={Math.PI / 2}
          position={[0, LAYOUT.stemTop + BOTTLE.actuator.h * 0.6, BOTTLE.actuator.r - 0.004]}
        />
        <mesh
          geometry={geo.dipTube}
          material={mat.tube}
          position-y={(LAYOUT.collarBottom + LAYOUT.innerBottom + 0.02) / 2}
        />
      </group>

      {/* CAP: brushed gold block with a hairline seam and a hollow underside */}
      <group ref={cap} position-y={LAYOUT.capCenter}>
        <mesh geometry={geo.cap} material={mat.gold} />
        <mesh geometry={geo.capSeam} material={mat.seam} position-y={-BOTTLE.cap.h / 2 + 0.07} />
        <mesh
          geometry={geo.capHollow}
          material={mat.hollow}
          rotation-x={Math.PI / 2}
          position-y={-BOTTLE.cap.h / 2 - 0.0015}
        />
      </group>
    </group>
  );
}
