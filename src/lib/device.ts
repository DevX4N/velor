"use client";

import type { Tier } from "./store";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** A coarse quality tier: decides DPR ceiling, particle count and shader octaves. */
export function detectTier(): Tier {
  if (typeof window === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  if (coarse && (small || cores <= 4 || memory <= 4)) return "low";
  if (coarse || cores <= 4) return "mid";
  return "high";
}

let webglSupport: boolean | null = null;
export function supportsWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function isPortrait() {
  return typeof window !== "undefined" && window.innerWidth / window.innerHeight < 0.9;
}
