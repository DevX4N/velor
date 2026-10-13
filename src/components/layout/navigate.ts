"use client";

import type { SceneId } from "@/content/velor";
import { scrollFor } from "@/lib/three/director";

/** Where each scene "begins" for navigation: just after its stage locks, with its title in. */
const ENTRY: Partial<Record<SceneId, number>> = {
  awakening: 0,
  revelation: 0.2,
  anatomy: 0.15,
  essence: 0.06,
  presence: 0.3,
  desire: 0.66,
  statement: 0.6,
};

export function goToScene(id: SceneId) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = id === "awakening" ? 0 : scrollFor(id, ENTRY[id] ?? 0);
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  // Move focus for keyboard and screen-reader users without a second jump.
  const target = document.getElementById(id);
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
}
