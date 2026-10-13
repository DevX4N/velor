import type { SceneId } from "@/content/velor";

/**
 * The film, as a keyframe table. Every 3D value the camera, bottle, light and atmosphere take
 * is defined here, against scroll positions inside each scene — so timing, scale, rotation and
 * intensity can be tuned without touching a component.
 *
 * Position `p` inside a scene:
 *   -1 → the scene's top touches the bottom of the viewport (entering)
 *    0 → the scene's stage locks to the viewport (sticky start)
 *    1 → the stage releases (sticky end)
 *    2 → the scene's bottom has left through the top of the viewport
 *
 * Values are authored for a 16:9 frame. On narrower frames the director pushes the camera back
 * (FRAMING.fit) and pulls lateral offsets toward the centre (FRAMING.lateral); `m` overrides a
 * value for portrait frames where the composition itself changes.
 */

export const POSE_KEYS = [
  // camera
  "camX", "camY", "camZ", "tgtX", "tgtY",
  // bottle transform
  "posX", "posY", "posZ", "rotX", "rotY", "rotZ", "scale",
  // anatomy
  "explode",
  // light
  "key", "rim", "env", "envRot",
  // visibility of layers
  "presence", "wordmark", "essence", "note", "shadow",
  // background, linear RGB
  "bgR", "bgG", "bgB",
] as const;

export type PoseKey = (typeof POSE_KEYS)[number];
export type Pose = Record<PoseKey, number>;
export type PoseInput = Partial<Omit<Pose, "bgR" | "bgG" | "bgB">> & { bg?: string };

export type Keyframe = {
  at: [SceneId, number];
  d: PoseInput;
  /** Portrait overrides. */
  m?: PoseInput;
  /** GSAP ease used to arrive at this keyframe from the previous one on each track. */
  ease?: string;
};

export const COLORS = {
  black: "#080808",
  carbon: "#141414",
  champagne: "#C4A77D",
  champagneDeep: "#a88f69",
  ivory: "#F0E9DF",
  bergamot: "#11110e",
  amber: "#060504",
  oud: "#0a0807",
};

export const FRAMING = {
  fov: 28,
  /** Camera distance multiplier: 1 at 16:9, up to `max` on tall phones. */
  fit: (aspect: number) => Math.min(1.42, Math.max(1, 1 + (1.5 - aspect) * 0.32)),
  /** Lateral offsets shrink to the centre as the frame narrows. */
  lateral: (aspect: number) => Math.min(1, Math.max(0, (aspect - 0.62) / 1.05)),
};

/** The opening frame: the bottle alone in the dark, turned a little to show its depth. */
export const HERO: PoseInput = {
  camX: 0, camY: 0.02, camZ: 6.4, tgtX: 0, tgtY: 0.02,
  posX: 0, posY: 0, posZ: 0, rotX: 0, rotY: -0.42, rotZ: 0, scale: 1,
  explode: 0,
  key: 1, rim: 1, env: 1, envRot: 0,
  presence: 1, wordmark: 1, essence: 0, note: 0, shadow: 0,
  bg: COLORS.black,
};

export const KEYFRAMES: Keyframe[] = [
  { at: ["awakening", 0], d: HERO, m: { posY: 0.08 } },

  // ── 02 · THE REVELATION — dolly in, a jeweller's turn, light finds the cap and label ──
  { at: ["revelation", -1], d: { camZ: 6.4, rotY: -0.42, wordmark: 1, envRot: 0 }, m: { posY: 0.08 } },
  { at: ["revelation", -0.45], d: { wordmark: 0 }, ease: "sine.in" },
  { at: ["revelation", 0], d: { camZ: 5.5, camY: 0.05, tgtY: 0.05, rotY: -0.12, envRot: 0.7 }, m: { posY: -0.1, camZ: 6.2 } },
  {
    at: ["revelation", 0.36],
    d: { camX: 0.28, camY: 0.35, camZ: 4.3, tgtY: 0.3, rotY: 0.58, rotX: 0.02, envRot: 1.6, key: 1.15 },
    m: { posY: -0.08, camZ: 7.6, tgtY: 0.1 },
  },
  {
    at: ["revelation", 0.72],
    d: { camX: -0.12, camY: 0.78, camZ: 3.45, tgtY: 0.56, rotY: -0.2, rotX: 0.1, envRot: 2.35, key: 1.25, rim: 1.25 },
    m: { posY: -0.12, camZ: 6.9, camY: 0.5, tgtY: 0.3 },
  },
  {
    at: ["revelation", 1],
    d: { camX: 0, camY: 0.1, camZ: 5.8, tgtY: 0.06, rotY: 0, rotX: 0, envRot: 3, key: 1, rim: 1 },
    m: { posY: 0.1 },
  },

  // ── 03 · THE ANATOMY OF LUXURY — approach, separate, hold, rebuild ──
  { at: ["anatomy", 0], d: { camZ: 5.8, camY: 0.1, tgtY: 0.06, rotY: 0, explode: 0, envRot: 3 }, m: { posY: 0.1, tgtY: 0.06 } },
  { at: ["anatomy", 0.12], d: { camZ: 5.05, tgtY: 0.14, camY: 0.2, rotY: 0.08 } },
  {
    at: ["anatomy", 0.5],
    d: { explode: 1, rotY: 0.62, rotX: 0.07, camX: 0, camY: 0.34, camZ: 8.4, tgtY: 0.2, envRot: 3.6, key: 1.2, rim: 1.35 },
    m: { posY: 0.1, tgtY: -0.3 },
    ease: "sine.inOut",
  },
  { at: ["anatomy", 0.78], d: { explode: 1, rotY: 0.92, rotX: 0.05, camZ: 8.2, tgtY: 0.2, envRot: 3.95 }, m: { posY: 0.1, tgtY: -0.3 } },
  {
    at: ["anatomy", 0.96],
    d: { explode: 0, rotY: 0, rotX: 0, camY: 0.1, camZ: 5.6, tgtY: 0.06, envRot: 4.2, key: 1, rim: 1 },
    m: { posY: 0.1, tgtY: 0.06 },
    ease: "power2.inOut",
  },

  // ── 04 · THE ESSENCE — gold sweep, the light leaves, scent takes the frame ──
  { at: ["essence", 0], d: { presence: 1, key: 1, envRot: 4.2, essence: 0, note: 0, posZ: 0, scale: 1, camX: 0, camY: 0.1, camZ: 5.6, bg: COLORS.black } },
  { at: ["essence", 0.1], d: { envRot: 5.5, key: 1.4, rim: 1.3 }, ease: "sine.inOut" },
  {
    at: ["essence", 0.24],
    d: { presence: 0, key: 0.35, rim: 0.7, essence: 1, note: 1, posZ: -2.2, scale: 0.86, camX: -0.25, camY: 0.22, camZ: 5.2, bg: COLORS.bergamot },
  },
  { at: ["essence", 0.38], d: { note: 1, camX: -0.08 } },
  { at: ["essence", 0.5], d: { note: 2, camX: 0.22, camY: 0, camZ: 5, bg: COLORS.amber } },
  { at: ["essence", 0.64], d: { note: 2, camX: 0.3 } },
  { at: ["essence", 0.76], d: { note: 3, camX: 0.32, camY: -0.18, camZ: 5.3, bg: COLORS.oud } },
  { at: ["essence", 0.94], d: { note: 3, camX: 0.12 } },
  { at: ["essence", 1], d: { essence: 1, presence: 0 } },

  // ── 05 · THE ART OF PRESENCE — the bottle as a macro detail behind the type ──
  { at: ["presence", -1], d: { essence: 1, presence: 0, posZ: -2.2, scale: 0.86, note: 3, bg: COLORS.oud } },
  {
    at: ["presence", -0.25],
    d: { essence: 0, presence: 0.05, posZ: 0, scale: 1, rotY: 0.75, rotX: 0, camX: 0.3, camY: 0.95, camZ: 2.5, tgtX: -0.3, tgtY: 0.8, key: 0.3, rim: 1, env: 0.45, envRot: 6, bg: COLORS.black },
    // Phones: the bottle turns its printed face away so it never letters under the manifesto.
    m: { camX: 0.2, tgtX: 0, posY: 0, camY: 0.7, tgtY: 0.3, camZ: 3, rotY: 1.35, env: 0.85, key: 0.7, envRot: 6.3 },
  },
  // On phones the type sits over the cap, so the detail stays dimmer behind it.
  { at: ["presence", 0.1], d: { presence: 0.62, key: 0.35 }, m: { presence: 0.55, key: 0.7 } },
  {
    at: ["presence", 0.72],
    d: { camX: 0.2, camY: 0.35, camZ: 2.7, tgtX: -0.5, tgtY: 0.45, rotY: 0.6, key: 0.35, env: 0.42, envRot: 6.5, bg: COLORS.black },
    m: { camX: 0.2, tgtX: 0, camY: 0.3, tgtY: -0.05, camZ: 3, rotY: 1.3, env: 0.85, key: 0.7, envRot: 6.6 },
  },
  {
    at: ["presence", 1],
    d: { camX: 0.2, camY: 0.3, camZ: 3.3, tgtX: 0, tgtY: 0.2, presence: 0.95, key: 1, env: 1.25, rotY: 1.1, bg: COLORS.champagneDeep },
    m: { camZ: 3.8, tgtX: 0 },
    ease: "sine.inOut",
  },

  // ── 06 · THE OBJECT OF DESIRE — daylight; pull back, turn to face, cast a shadow ──
  { at: ["desire", 0], d: { presence: 1, bg: COLORS.champagneDeep, rotY: 1.35, camZ: 3.4, shadow: 0 } },
  { at: ["desire", 0.2], d: { bg: COLORS.ivory, env: 1.45, key: 0.9, rim: 0.7 }, ease: "sine.inOut" },
  { at: ["desire", 0.3], d: { shadow: 0 } },
  {
    at: ["desire", 0.56],
    d: { camX: 0, camY: 0.08, camZ: 5.7, tgtX: 0, tgtY: 0.08, rotY: 0, rotX: 0, posX: 0.95, posY: 0, shadow: 1, envRot: 7.5 },
    m: { camZ: 6.25, posY: 0.4, tgtY: -0.38 },
    ease: "power2.inOut",
  },
  { at: ["desire", 1], d: { posX: 0.95, rotY: 0, shadow: 1 }, m: { camZ: 6.25, posY: 0.4, tgtY: -0.38 } },

  // ── 07 · THE FINAL STATEMENT — back to black; the bottle recedes and goes out ──
  { at: ["statement", -1], d: { bg: COLORS.ivory, shadow: 1, scale: 1, presence: 1, posY: 0, rotY: 0 }, m: { posY: 0.45 } },
  { at: ["statement", -0.55], d: { bg: COLORS.black, shadow: 0, env: 1, key: 1, rim: 1 } },
  { at: ["statement", 0], d: { scale: 0.62, posX: 0, posY: 0.35, rotY: 0.7, presence: 0.55 }, m: { posY: 0.5 } },
  { at: ["statement", 0.45], d: { scale: 0.28, posY: 0.62, rotY: 1.5, presence: 0 }, ease: "power2.in" },
];
