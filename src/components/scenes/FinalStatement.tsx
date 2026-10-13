"use client";

import { useRef } from "react";
import { statement } from "@/content/velor";
import { focusIn, revealMask, useSceneTimeline } from "@/hooks/useSceneTimeline";

/**
 * CENA 07 — THE FINAL STATEMENT. Back to black; the bottle recedes and its light goes out
 * (keyframes). The name returns at monumental scale, letter by letter, and the signature lands.
 */
export function FinalStatement() {
  const root = useRef<HTMLElement>(null);

  useSceneTimeline(root, (tl, ctx) => {
    const letters = ctx.q(".statement__word [data-line]");
    revealMask(tl, letters, 0.12, ctx, { span: 0.3, stagger: 0.06 });
    tl.fromTo(ctx.q(".statement__rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "velor.out" }, 0.42);
    focusIn(tl, ctx.q(".statement__signature"), 0.5, ctx, 0.18);
    // The credits rise into the last stretch of the take; the name lifts to make room.
    tl.to(ctx.q(".statement"), ctx.reduced ? { opacity: 0.6, duration: 0.2 } : { yPercent: -17, duration: 0.3, ease: "sine.inOut" }, 0.7);
    if (!ctx.reduced) {
      // The letters close ranks as they rise (transform only — no letter-spacing reflow).
      const masks = ctx.q(".statement__word .mask");
      const mid = (masks.length - 1) / 2;
      tl.fromTo(masks, { xPercent: (i) => (i - mid) * 9 }, { xPercent: 0, duration: 0.7, ease: "velor.out" }, 0.12);
    }
  });

  return (
    <section ref={root} id="statement" data-scene="statement" className="scene scene--statement" aria-labelledby="statement-title">
      <div className="scene__stage statement">
        <h2 id="statement-title" className="statement__word t-serif" aria-label={statement.word}>
          {[...statement.word].map((ch, i) => (
            <span key={i} className="mask" aria-hidden="true">
              <span data-line>{ch}</span>
            </span>
          ))}
        </h2>
        <span className="statement__rule" aria-hidden="true" />
        <p className="statement__signature t-label">{statement.signature}</p>
      </div>
    </section>
  );
}
