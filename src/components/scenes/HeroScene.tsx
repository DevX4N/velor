"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/animations/config";
import { intro, live, setIntroRunning } from "@/lib/three/director";
import { useExperience } from "@/lib/store";
import { hero } from "@/content/velor";
import { useIsoLayoutEffect } from "@/hooks/useSceneTimeline";

/**
 * CENA 01 — THE AWAKENING (after the preloader).
 * The bottle starts almost invisible; a light crosses the glass; the wordmark rises through a
 * vertical mask behind it; the camera settles in. All on the shared `intro` values the 3D reads.
 */
export function HeroScene() {
  const root = useRef<HTMLElement>(null);
  const revealed = useExperience((s) => s.revealed);

  // Before the reveal: DOM pieces wait in their start state (the preloader covers them).
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set("[data-intro]", { opacity: 0, y: 14 });
      gsap.set("[data-cue-line]", { scaleY: 0, transformOrigin: "50% 0%" });
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const el = root.current;
    if (!el) return;
    const reduced = live.reduced;
    const ctx = gsap.context(() => {
      if (reduced) {
        Object.assign(intro, { light: 1, sweep: 1, wordmark: 1, dolly: 1 });
        setIntroRunning(false);
        gsap.to("[data-intro]", { opacity: 1, y: 0, duration: 0.6, ease: "none" });
        gsap.set("[data-cue-line]", { scaleY: 1 });
        return;
      }
      const d = MOTION.intro.duration;
      setIntroRunning(true);
      const tl = gsap.timeline({ onComplete: () => setIntroRunning(false) });
      tl.to(intro, { light: 1, duration: d * 0.85, ease: "sine.inOut" }, 0)
        .to(intro, { sweep: 1, duration: d, ease: "power2.inOut" }, 0)
        .to(intro, { dolly: 1, duration: d * 1.1, ease: "velor.out" }, 0)
        .to(intro, { wordmark: 1, duration: 1.9, ease: "velor.out" }, MOTION.intro.wordmarkDelay)
        .to("[data-intro]", { opacity: 1, y: 0, duration: 1.4, stagger: 0.14, ease: "velor.out" }, d * 0.55)
        .to("[data-cue-line]", { scaleY: 1, duration: 1.2, ease: "velor.out" }, d * 0.7);
    }, el);
    return () => ctx.revert();
  }, [revealed]);

  // Scrolling away: the hero copy lifts and dims as the revelation begins.
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia(el);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(".hero__foot", {
        yPercent: -40,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "60% top", scrub: true },
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.to(".hero__foot", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "60% top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="awakening" data-scene="awakening" className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        VÉLOR Nº 01 — Extrait de Parfum. {hero.line}
      </h1>
      <div className="hero__foot">
        <p className="hero__product t-label" data-intro>
          <span className="hero__rule" aria-hidden="true" />
          {hero.product}
        </p>
        <a href="#revelation" className="hero__cue" data-intro data-cursor="link">
          <span className="t-label">{hero.cue}</span>
          <span className="hero__cue-track" aria-hidden="true">
            <span className="hero__cue-line" data-cue-line />
            <span className="hero__cue-dot" />
          </span>
        </a>
        <p className="hero__line t-serif" data-intro>
          {hero.line}
        </p>
      </div>
    </section>
  );
}
