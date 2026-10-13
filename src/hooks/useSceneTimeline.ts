"use client";

import { type RefObject, useEffect, useLayoutEffect } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/animations/config";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type SceneContext = {
  reduced: boolean;
  mobile: boolean;
  q: (selector: string) => HTMLElement[];
};

/**
 * One scrubbed GSAP timeline per scene, normalised to a length of 1 so its positions read
 * exactly like the 3D keyframes (`p` 0 → 1 across the sticky hold). Built inside
 * gsap.matchMedia: breakpoint and reduced-motion changes revert and rebuild it cleanly,
 * and unmounting kills the ScrollTrigger, tweens and inline styles.
 */
export function useSceneTimeline(
  ref: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline, ctx: SceneContext) => void,
  options: { start?: string; end?: string } = {},
) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia(el);
    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        mobile: "(max-width: 899px)",
        desktop: "(min-width: 900px)",
      },
      (context) => {
        const { reduced = false, mobile = false } = context.conditions ?? {};
        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 0.1 },
          scrollTrigger: {
            trigger: el,
            start: options.start ?? "top top",
            end: options.end ?? "bottom bottom",
            scrub: reduced ? true : MOTION.scrub,
          },
        });
        build(tl, { reduced, mobile, q: gsap.utils.selector(el) as (s: string) => HTMLElement[] });
        // Pin the timeline's length to 1 so positions are scene progress.
        tl.set({}, {}, 1);
      },
    );
    return () => mm.revert();
    // The build function is static per scene.
  }, []);
}

/** Mask reveal of `.mask > span` children: up from below the clip line. */
export function revealMask(
  tl: gsap.core.Timeline,
  targets: HTMLElement[] | string,
  at: number,
  ctx: SceneContext,
  { span = 0.12, stagger = 0.02 } = {},
) {
  if (ctx.reduced) {
    tl.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: span, stagger }, at);
    return;
  }
  tl.fromTo(
    targets,
    { yPercent: MOTION.reveal.yPercent },
    { yPercent: 0, duration: span, stagger, ease: "velor.out" },
    at,
  );
}

/** Mask exit: the lines continue upward out of the clip. */
export function concealMask(
  tl: gsap.core.Timeline,
  targets: HTMLElement[] | string,
  at: number,
  ctx: SceneContext,
  { span = 0.08, stagger = 0.012 } = {},
) {
  if (ctx.reduced) {
    tl.to(targets, { opacity: 0, duration: span, stagger }, at);
    return;
  }
  tl.to(targets, { yPercent: -MOTION.reveal.yPercent, duration: span, stagger, ease: "velor.in" }, at);
}

/** Soft focus-pull for paragraphs: opacity, a short rise and a little blur clearing. */
export function focusIn(tl: gsap.core.Timeline, targets: HTMLElement[] | string, at: number, ctx: SceneContext, span = 0.1) {
  tl.fromTo(
    targets,
    ctx.reduced ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" },
    ctx.reduced
      ? { opacity: 1, duration: span }
      : { opacity: 1, y: 0, filter: "blur(0px)", duration: span, ease: "velor.out", stagger: 0.015 },
    at,
  );
}

export function focusOut(tl: gsap.core.Timeline, targets: HTMLElement[] | string, at: number, ctx: SceneContext, span = 0.07) {
  tl.to(
    targets,
    ctx.reduced ? { opacity: 0, duration: span } : { opacity: 0, y: -14, filter: "blur(4px)", duration: span, ease: "velor.in" },
    at,
  );
}
