"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { live } from "@/lib/three/director";
import { setExperience } from "@/lib/store";
import { desire } from "@/content/velor";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { focusIn, revealMask, useSceneTimeline } from "@/hooks/useSceneTimeline";

/**
 * CENA 06 — THE OBJECT OF DESIRE. Daylight on the set: the camera pulls back, the bottle turns
 * to face us and lands on its own shadow. Here the visitor can take it in hand: dragging turns
 * the real 3D bottle, which eases back to its pose on release.
 */
export function FinalProductReveal() {
  const root = useRef<HTMLElement>(null);
  const handle = useRef<HTMLDivElement>(null);

  useSceneTimeline(root, (tl, ctx) => {
    revealMask(tl, ctx.q(".desire__name [data-line]"), 0.44, ctx, { span: 0.14, stagger: 0.03 });
    tl.fromTo(ctx.q(".desire__rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: "velor.out" }, 0.5);
    focusIn(tl, ctx.q(".desire__specs li"), 0.52, ctx, 0.1);
    focusIn(tl, ctx.q(".desire__quote"), 0.58, ctx, 0.12);
    focusIn(tl, ctx.q(".desire__cta, .desire__hint"), 0.64, ctx, 0.1);
  });

  // Drag to turn: horizontal pointer travel → rotation, released with a weighted ease home.
  useEffect(() => {
    const el = handle.current;
    if (!el) return;
    let startX = 0;
    let startRot = 0;
    let dragging = false;
    const down = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startRot = live.dragRot;
      gsap.killTweensOf(live, "dragRot");
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "true";
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const rot = startRot + (e.clientX - startX) * 0.012;
      live.dragRot = Math.max(-Math.PI, Math.min(Math.PI, rot));
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete el.dataset.dragging;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      gsap.to(live, { dragRot: 0, duration: live.reduced ? 0.3 : 1.8, ease: "velor.out" });
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      gsap.killTweensOf(live, "dragRot");
      live.dragRot = 0;
    };
  }, []);

  return (
    <section ref={root} id="desire" data-scene="desire" className="scene scene--desire" aria-labelledby="desire-title">
      <div className="scene__stage desire">
        <div ref={handle} className="desire__handle" data-cursor="drag" aria-hidden="true" />
        <div className="desire__copy">
          <h2 id="desire-title" className="desire__name t-serif">
            <span className="mask">
              <span data-line>VÉLOR</span>
            </span>
            <span className="mask">
              <span data-line>Nº 01</span>
            </span>
          </h2>
          <span className="desire__rule" aria-hidden="true" />
          <ul className="desire__specs t-label">
            <li>{desire.kind}</li>
            <li>{desire.volume}</li>
          </ul>
          <p className="desire__quote t-serif">“{desire.quote}”</p>
          <div className="desire__cta">
            <MagneticButton onClick={() => setExperience({ panelOpen: true })} aria-haspopup="dialog">
              {desire.cta}
            </MagneticButton>
          </div>
          <p className="desire__hint t-label">
            <span aria-hidden="true" className="desire__hint-icon">
              <svg viewBox="0 0 28 10">
                <path d="M4 1 0 5l4 4M24 1l4 4-4 4M0 5h28" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </span>
            {desire.dragHint}
          </p>
        </div>
      </div>
    </section>
  );
}
