"use client";

import { useRef } from "react";
import { revelation } from "@/content/velor";
import { MaskLines } from "@/components/motion/MaskLines";
import { concealMask, focusIn, focusOut, revealMask, useSceneTimeline } from "@/hooks/useSceneTimeline";

/**
 * CENA 02 — THE REVELATION. The stage holds while the camera dollies in and the bottle makes a
 * jeweller's turn (lib/three/keyframes.ts). Title left, text right, both timed to the same scroll.
 */
export function ProductReveal() {
  const root = useRef<HTMLElement>(null);

  useSceneTimeline(root, (tl, ctx) => {
    const lines = ctx.q(".reveal__title [data-line]");
    revealMask(tl, lines, 0.04, ctx, { span: 0.16, stagger: 0.035 });
    tl.fromTo(ctx.q(".reveal__rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.14, ease: "velor.out" }, 0.12);
    focusIn(tl, ctx.q(".reveal__body"), 0.16, ctx, 0.14);
    focusIn(tl, ctx.q(".reveal__facts li"), 0.24, ctx, 0.12);

    // While the camera is on the cap and label (≈0.5–0.75) the copy steps back a little.
    if (!ctx.reduced) {
      tl.to(ctx.q(".reveal__copy"), { opacity: 0.38, duration: 0.12 }, 0.5);
      tl.to(ctx.q(".reveal__copy"), { opacity: 1, duration: 0.1 }, 0.72);
    }

    concealMask(tl, lines, 0.84, ctx, { span: 0.1, stagger: 0.02 });
    focusOut(tl, ctx.q(".reveal__body, .reveal__facts, .reveal__rule"), 0.84, ctx, 0.1);
  });

  return (
    <section ref={root} id="revelation" data-scene="revelation" className="scene scene--revelation" aria-labelledby="revelation-title">
      <div className="scene__stage reveal">
        <h2 id="revelation-title" className="reveal__title t-serif">
          <MaskLines lines={revelation.title} />
        </h2>
        <div className="reveal__copy">
          <span className="reveal__rule" aria-hidden="true" />
          <p className="reveal__body">{revelation.body}</p>
          <ul className="reveal__facts t-label" aria-label="Materiais">
            {revelation.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
