"use client";

import { Color } from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setExperience } from "@/lib/store";
import { scenes, type SceneId } from "@/content/velor";
import { HERO, KEYFRAMES, POSE_KEYS, type Pose, type PoseInput, type PoseKey } from "./keyframes";

/**
 * The director turns scroll position into a camera/bottle/light pose.
 *
 * GSAP owns the DOM choreography; this owns the 3D one. Instead of several scrubbed timelines
 * fighting over the same objects, every 3D value is a sparse track sampled at the current
 * scroll offset — deterministic, reversible, and correct after a reload mid-page.
 */

type Track = { s: number[]; v: number[]; ease: ((t: number) => number)[] };
type Range = { id: SceneId; top: number; height: number };

const tmpColor = new Color();

function toPose(input: PoseInput): Partial<Pose> {
  const out: Partial<Pose> = {};
  for (const [k, v] of Object.entries(input)) {
    if (k === "bg") {
      tmpColor.set(v as string); // sRGB hex → linear working space
      out.bgR = tmpColor.r;
      out.bgG = tmpColor.g;
      out.bgB = tmpColor.b;
    } else {
      out[k as PoseKey] = v as number;
    }
  }
  return out;
}

const heroPose = toPose(HERO) as Pose;

/** Where the scene settles; GSAP-free consumers read `current`. */
export const target: Pose = { ...heroPose };
export const current: Pose = { ...heroPose };

/** Values the hero intro animates (0 → 1). Multiplied into the pose, never fighting the tracks. */
export const intro = { light: 0, sweep: 0, wordmark: 0, dolly: 0 };

/** Live inputs layered on top of the pose. */
export const live = {
  pointerX: 0,
  pointerY: 0,
  dragRot: 0,
  aspect: 16 / 9,
  portrait: false,
  reduced: false,
  timeline: 0, // seconds of "film" elapsed, for the slate
};

let tracks = new Map<PoseKey, Track>();
let ranges: Range[] = [];
let vh = 1;
let maxScroll = 1;
let invalidate: (() => void) | null = null;
let running = false;
let lastScroll = -1;
let activeId: SceneId = "awakening";
let tone: "dark" | "light" = "dark";
let slateListener: ((sceneIndex: number, seconds: number) => void) | null = null;

const FILM_SECONDS = 150; // the "runtime" the slate's timecode counts against
const DEFAULT_EASE = gsap.parseEase("sine.inOut") as (t: number) => number;

function sceneScroll(id: SceneId, p: number) {
  const r = ranges.find((x) => x.id === id);
  if (!r) return 0;
  const hold = Math.max(r.height - vh, 0);
  if (p < 0) return r.top + p * vh;
  if (p <= 1) return r.top + p * hold;
  return r.top + hold + (p - 1) * vh;
}

function buildTracks() {
  const next = new Map<PoseKey, Track>();
  const resolved = KEYFRAMES.map((k) => ({
    s: sceneScroll(k.at[0], k.at[1]),
    values: { ...toPose(k.d), ...(live.portrait && k.m ? toPose(k.m) : {}) },
    ease: k.ease ? (gsap.parseEase(k.ease) as (t: number) => number) : DEFAULT_EASE,
  })).sort((a, b) => a.s - b.s);

  for (const key of POSE_KEYS) {
    const track: Track = { s: [], v: [], ease: [] };
    for (const k of resolved) {
      const v = k.values[key];
      if (v === undefined) continue;
      track.s.push(k.s);
      track.v.push(v);
      track.ease.push(k.ease);
    }
    if (!track.s.length) {
      track.s.push(0);
      track.v.push(heroPose[key]);
      track.ease.push(DEFAULT_EASE);
    }
    next.set(key, track);
  }
  tracks = next;
}

function sampleTrack(t: Track, s: number) {
  const n = t.s.length;
  if (s <= t.s[0]) return t.v[0];
  if (s >= t.s[n - 1]) return t.v[n - 1];
  let i = 1;
  while (i < n && t.s[i] < s) i++;
  const span = t.s[i] - t.s[i - 1];
  const k = span <= 0 ? 1 : (s - t.s[i - 1]) / span;
  return t.v[i - 1] + (t.v[i] - t.v[i - 1]) * t.ease[i](k);
}

export function measure() {
  if (typeof window === "undefined") return;
  vh = window.innerHeight;
  live.aspect = window.innerWidth / Math.max(1, window.innerHeight);
  live.portrait = live.aspect < 0.9;
  const scrollY = window.scrollY;
  ranges = scenes
    .map(({ id }) => {
      const el = document.querySelector<HTMLElement>(`[data-scene="${id}"]`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { id, top: rect.top + scrollY, height: rect.height };
    })
    .filter((r): r is Range => r !== null);
  maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
  buildTracks();
  lastScroll = -1;
  invalidate?.();
}

function sample(scrollY: number) {
  for (const key of POSE_KEYS) {
    const t = tracks.get(key);
    if (t) target[key] = sampleTrack(t, scrollY);
  }

  // Scene bookkeeping: active scene, tone, slate.
  const probe = scrollY + vh * 0.5;
  let idx = 0;
  for (let i = 0; i < ranges.length; i++) if (probe >= ranges[i].top) idx = i;
  const id = ranges[idx]?.id ?? "awakening";
  if (id !== activeId) {
    activeId = id;
    setExperience({ activeScene: id });
  }
  live.timeline = (scrollY / maxScroll) * FILM_SECONDS;
  slateListener?.(scenes.findIndex((s) => s.id === id), live.timeline);
}

function damp(a: number, b: number, lambda: number, dt: number) {
  return a + (b - a) * (1 - Math.exp(-lambda * dt));
}

function tick(_time: number, deltaMs: number) {
  const dt = Math.min(deltaMs / 1000, 0.1);
  const scrollY = window.scrollY;
  if (scrollY !== lastScroll) {
    sample(scrollY);
    lastScroll = scrollY;
  }

  // Heavier things settle slower: the camera glides, light responds quickly.
  const lambda = live.reduced ? 14 : 5.5;
  let moving = false;
  for (const key of POSE_KEYS) {
    const before = current[key];
    const rate = key.startsWith("bg") || key === "env" || key === "key" || key === "rim" ? lambda * 1.25 : lambda;
    current[key] = damp(before, target[key], rate, dt);
    if (Math.abs(current[key] - target[key]) > 1e-4) moving = true;
  }

  const lum = 0.2126 * current.bgR + 0.7152 * current.bgG + 0.0722 * current.bgB;
  const nextTone = lum > 0.32 ? "light" : "dark";
  if (nextTone !== tone) {
    tone = nextTone;
    document.documentElement.dataset.tone = tone;
    setExperience({ tone });
  }

  // Render while anything moves or anything is alive on screen.
  const alive =
    !live.reduced && (current.presence > 0.02 || current.essence > 0.01);
  if (moving || alive || introRunning || Math.abs(live.dragRot) > 1e-4) invalidate?.();
}

let introRunning = false;
export function setIntroRunning(v: boolean) {
  introRunning = v;
  invalidate?.();
}

export function onSlate(fn: ((sceneIndex: number, seconds: number) => void) | null) {
  slateListener = fn;
  if (fn) fn(scenes.findIndex((s) => s.id === activeId), live.timeline);
}

export function setInvalidate(fn: (() => void) | null) {
  invalidate = fn;
}

let resizeTimer = 0;
function onResize() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(measure, 120);
}

export function startDirector() {
  if (running || typeof window === "undefined") return () => {};
  running = true;
  live.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  measure();
  sample(window.scrollY);
  Object.assign(current, target);

  const ro = new ResizeObserver(onResize);
  ro.observe(document.body);
  window.addEventListener("resize", onResize);
  ScrollTrigger.addEventListener("refresh", measure);
  document.fonts?.ready.then(measure);
  gsap.ticker.add(tick);

  return () => {
    running = false;
    ro.disconnect();
    window.removeEventListener("resize", onResize);
    ScrollTrigger.removeEventListener("refresh", measure);
    gsap.ticker.remove(tick);
  };
}

/** Scroll position (px) of a scene marker — used by navigation. */
export function scrollFor(id: SceneId, p = 0) {
  return sceneScroll(id, p);
}
