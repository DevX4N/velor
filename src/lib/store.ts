"use client";

import { useSyncExternalStore } from "react";
import type { SceneId } from "@/content/velor";

export type Tier = "high" | "mid" | "low";

export type ExperienceState = {
  /** WebGL compiled and drew its first frame (or failed and fell back). */
  stageReady: boolean;
  /** WebGL is unavailable: the static fallback is shown instead. */
  webglFailed: boolean;
  /** The preloader has left and the hero intro may play. */
  revealed: boolean;
  activeScene: SceneId;
  tone: "dark" | "light";
  panelOpen: boolean;
};

let state: ExperienceState = {
  stageReady: false,
  webglFailed: false,
  revealed: false,
  activeScene: "awakening",
  tone: "dark",
  panelOpen: false,
};

const listeners = new Set<() => void>();

export function getExperience() {
  return state;
}

export function setExperience(patch: Partial<ExperienceState>) {
  let changed = false;
  for (const key in patch) {
    const k = key as keyof ExperienceState;
    if (state[k] !== patch[k]) changed = true;
  }
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useExperience<T>(selector: (s: ExperienceState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}
