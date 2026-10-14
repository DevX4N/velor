import type { CalloutId } from "@/content/velor";

/**
 * Physical description of VÉLOR Nº 01, in scene units (1 unit ≈ 8 cm).
 * The procedural bottle is built from these numbers; a GLB replacement only has to expose
 * the same four parts (see GLTFBottle) and, if its proportions differ, new callout anchors.
 */
export const BOTTLE = {
  body: { w: 1.08, h: 1.22, d: 0.64, radius: 0.075, base: 0.12, wall: 0.075 },
  neck: { r: 0.11, h: 0.06 },
  collar: { r: 0.136, h: 0.078 },
  stem: { r: 0.03, h: 0.075 },
  actuator: { r: 0.09, h: 0.11 },
  dipTube: { r: 0.011 },
  cap: { w: 0.58, h: 0.5, d: 0.5, radius: 0.04 },
  /** Fill level of the essence, 0..1 of the inner cavity. */
  fill: 0.93,
  /** Label centre, relative to the body centre. */
  label: { w: 0.66, h: 0.5, y: 0.02 },
} as const;

/** Derived vertical layout: the whole assembly is centred on y = 0. */
const total = BOTTLE.body.h + BOTTLE.neck.h + BOTTLE.cap.h - 0.01;
export const LAYOUT = (() => {
  const bodyBottom = -total / 2;
  const bodyTop = bodyBottom + BOTTLE.body.h;
  const neckTop = bodyTop + BOTTLE.neck.h;
  const collarBottom = bodyTop + 0.025;
  const collarTop = collarBottom + BOTTLE.collar.h;
  const stemTop = collarTop + BOTTLE.stem.h;
  const actuatorTop = stemTop + BOTTLE.actuator.h - 0.01;
  const capBottom = neckTop - 0.01;
  const innerBottom = bodyBottom + BOTTLE.body.base;
  const innerTop = bodyTop - BOTTLE.body.wall;
  const liquidTop = innerBottom + (innerTop - innerBottom) * BOTTLE.fill;
  return {
    total,
    bodyBottom,
    bodyTop,
    bodyCenter: (bodyBottom + bodyTop) / 2,
    neckTop,
    collarBottom,
    collarTop,
    stemTop,
    actuatorTop,
    capBottom,
    capCenter: capBottom + BOTTLE.cap.h / 2,
    innerBottom,
    innerTop,
    liquidTop,
  };
})();

/** How far each part travels when fully exploded, with the stagger window it moves in. */
export const EXPLODE = {
  cap: { y: 0.82, rotY: 0.42, rotZ: -0.06, window: [0, 0.62] as [number, number] },
  sprayer: { y: 0.4, rotY: -0.18, window: [0.16, 0.8] as [number, number] },
  body: { y: -0.4, rotY: 0, window: [0.26, 1] as [number, number] },
};

export type PartName = "cap" | "sprayer" | "body" | "liquid";

/** Callout anchors, in each part's local space. */
export const CALLOUT_ANCHORS: Record<CalloutId, { part: PartName; local: [number, number, number] }> = {
  // right side of the frame
  cap: { part: "cap", local: [BOTTLE.cap.w / 2, 0.08, BOTTLE.cap.d / 2] },
  glass: { part: "body", local: [BOTTLE.body.w / 2, LAYOUT.bodyCenter + 0.22, BOTTLE.body.d / 2 - 0.02] },
  // left side of the frame
  essence: { part: "liquid", local: [-0.2, 0.14, BOTTLE.body.d / 2 - BOTTLE.body.wall] },
  volume: { part: "body", local: [-BOTTLE.body.w / 2 + 0.05, LAYOUT.bodyBottom + 0.1, BOTTLE.body.d / 2] },
};

/** Material tuning, kept together so the studio look can be adjusted in one place. */
export const MATERIALS = {
  glass: {
    color: "#bdb7b0",
    attenuationColor: "#4f4842",
    attenuationDistance: 0.36,
    // Thinner optical thickness keeps the refraction offset small: the essence stays where it is.
    thickness: 0.3,
    ior: 1.52,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.35,
    specularIntensity: 1,
  },
  liquid: { color: "#6b3c12", roughness: 0.12, emissive: "#2e1605", emissiveIntensity: 0.45 },
  gold: { color: "#d6b98a", roughness: 0.36, anisotropy: 0.8, clearcoat: 0.25, clearcoatRoughness: 0.2 },
  goldPolished: { color: "#dcc193", roughness: 0.14 },
  /** Foil print: partly metallic so it still catches the softboxes, but lit from within
   *  (emissive, scaled by the scene's light) so it never drops out against the dark glass. */
  label: { color: "#dcc193", metalness: 0.55, roughness: 0.32, emissive: "#c9a978", emissiveIntensity: 0.62 },
};
