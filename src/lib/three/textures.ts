"use client";

import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace } from "three";

/**
 * Procedural textures, drawn once on a 2D canvas. Nothing here is downloaded:
 * the brushed metal, the label print, the wordmark and the contact shadow are all authored in code.
 */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { c, ctx };
}

/** Deterministic noise so the brushing never "re-rolls" between renders. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Brushed metal: fine horizontal streaks for roughness. */
export function brushedRoughness(size = 512) {
  const { c, ctx } = canvas(size, size);
  const rand = rng(7);
  ctx.fillStyle = "rgb(128,128,128)";
  ctx.fillRect(0, 0, size, size);
  // Many fine, low-contrast streaks: brushing that holds up at macro distance without banding.
  for (let i = 0; i < size * 5; i++) {
    const y = rand() * size;
    const v = 108 + rand() * 44;
    ctx.strokeStyle = `rgba(${v},${v},${v},${0.07 + rand() * 0.12})`;
    ctx.lineWidth = 0.5 + rand() * 0.8;
    ctx.beginPath();
    const x0 = rand() * size * 0.3 - size * 0.15;
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + size * (0.6 + rand() * 0.8), y + (rand() - 0.5) * 1.2);
    ctx.stroke();
  }
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = NoColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Constant anisotropy direction along U (brushing runs around the cap). */
export function anisotropyDirection() {
  const { c, ctx } = canvas(4, 4);
  ctx.fillStyle = "rgb(255,128,255)";
  ctx.fillRect(0, 0, 4, 4);
  const tex = new CanvasTexture(c);
  tex.colorSpace = NoColorSpace;
  return tex;
}

export function fontFamily(variable: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || fallback;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number) {
  // Canvas letterSpacing is not universal yet; set glyphs one by one, centred on x.
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let cx = x - total / 2;
  ctx.textAlign = "left";
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cx, y);
    cx += widths[i] + tracking;
  });
}

/** The label: gold foil printed on the front of the glass. White = foil, black = clear glass. */
export function labelAlpha(serif: string, sans: string) {
  const W = 1024;
  const H = Math.round((W * 0.5) / 0.66);
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.textBaseline = "alphabetic";

  ctx.font = `400 168px ${serif}`;
  spaced(ctx, "VÉLOR", W / 2, H * 0.4, 26);

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.36, H * 0.5);
  ctx.lineTo(W * 0.64, H * 0.5);
  ctx.stroke();

  ctx.font = `400 64px ${serif}`;
  spaced(ctx, "Nº 01", W / 2, H * 0.65, 8);

  ctx.font = `400 30px ${sans}`;
  spaced(ctx, "EXTRAIT DE PARFUM", W / 2, H * 0.79, 13);
  ctx.font = `300 24px ${sans}`;
  spaced(ctx, "50 ML  ·  1.7 FL. OZ.", W / 2, H * 0.88, 9);

  const tex = new CanvasTexture(c);
  tex.colorSpace = NoColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = LinearMipmapLinearFilter;
  return tex;
}

/** The hero wordmark. Returned with its aspect so the plane can be sized to the frame. */
export function wordmarkAlpha(serif: string) {
  const W = 2048;
  const H = 560;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 470px ${serif}`;
  spaced(ctx, "VÉLOR", W / 2, H * 0.86, 14);
  const tex = new CanvasTexture(c);
  tex.colorSpace = NoColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  return { tex, aspect: W / H };
}

/** Soft contact shadow: a blurred rounded footprint, darker at the core. */
export function contactShadow() {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  ctx.clearRect(0, 0, S, S);
  const layers: [number, number, number][] = [
    [0.86, 0.5, 0.05],
    [0.62, 0.36, 0.08],
    [0.44, 0.26, 0.16],
    [0.3, 0.18, 0.36],
  ];
  for (const [w, h, a] of layers) {
    ctx.filter = `blur(${Math.round(S * 0.035 * (w / 0.3))}px)`;
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    const rw = S * w;
    const rh = S * h;
    ctx.beginPath();
    ctx.roundRect((S - rw) / 2, (S - rh) / 2, rw, rh, rh * 0.25);
    ctx.fill();
  }
  ctx.filter = "none";
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
