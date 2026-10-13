"use client";

import { useRef } from "react";
import { essence } from "@/content/velor";
import { concealMask, focusIn, focusOut, revealMask, useSceneTimeline } from "@/hooks/useSceneTimeline";

/** Scroll windows (scene progress) for each note's copy; the 3D `note` index uses the same marks. */
const WINDOWS: [number, number][] = [
  [0.24, 0.42],
  [0.5, 0.68],
  [0.76, 0.97],
];

/**
 * CENA 04 — THE ESSENCE. The bottle's light goes out and the scent takes the frame:
 * bergamot motes in a beam, black-amber resin forms, vetiver & oud smoke (components/three/Atmosphere).
 * The DOM names each layer as the visitor passes through it.
 */
export function FragranceNotes() {
  const root = useRef<HTMLElement>(null);

  useSceneTimeline(root, (tl, ctx) => {
    const intro = ctx.q(".essence__intro [data-line]");
    revealMask(tl, intro, 0.03, ctx, { span: 0.08, stagger: 0.02 });
    focusIn(tl, ctx.q(".essence__lede"), 0.07, ctx, 0.07);
    concealMask(tl, intro, 0.17, ctx, { span: 0.06 });
    focusOut(tl, ctx.q(".essence__lede"), 0.17, ctx, 0.05);

    tl.fromTo(ctx.q(".essence__meter"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.2);
    tl.fromTo(ctx.q(".essence__meter-fill"), { scaleX: 0 }, { scaleX: 1, duration: 0.76, ease: "none" }, 0.22);
    tl.to(ctx.q(".essence__meter"), { opacity: 0, duration: 0.04 }, 0.96);

    WINDOWS.forEach(([a, b], i) => {
      const q = (s: string) => ctx.q(`[data-note="${i}"] ${s}`);
      tl.set(ctx.q(`[data-note="${i}"]`), { visibility: "visible" }, a - 0.001);
      tl.fromTo(ctx.q(`[data-tick="${i}"]`), { opacity: 0.55 }, { opacity: 1, duration: 0.03 }, a);
      revealMask(tl, q("[data-line]"), a + 0.01, ctx, { span: 0.08, stagger: 0.015 });
      focusIn(tl, q(".note__text"), a + 0.05, ctx, 0.06);
      if (i < WINDOWS.length - 1) {
        concealMask(tl, q("[data-line]"), b - 0.05, ctx, { span: 0.05 });
        focusOut(tl, q(".note__text"), b - 0.05, ctx, 0.04);
        tl.to(ctx.q(`[data-tick="${i}"]`), { opacity: 0.55, duration: 0.03 }, b - 0.02);
        tl.set(ctx.q(`[data-note="${i}"]`), { visibility: "hidden" }, b);
      }
    });
  });

  return (
    <section ref={root} id="essence" data-scene="essence" className="scene scene--essence" aria-labelledby="essence-title">
      <div className="scene__stage essence">
        <div className="essence__intro">
          <h2 id="essence-title" className="t-serif">
            <span className="mask">
              <span data-line>{essence.title}</span>
            </span>
          </h2>
          <p className="essence__lede">{essence.intro}</p>
        </div>

        <ol className="essence__notes">
          {essence.notes.map((n, i) => (
            <li key={n.name} className="note" data-note={i}>
              <h3 className="note__head">
                {/* The tier is spoken here and shown by the Top / Heart / Base meter. */}
                <span className="sr-only">{n.tier}: </span>
                <span className="note__name t-serif mask">
                  <span data-line>{n.name}</span>
                </span>
              </h3>
              <p className="note__text">{n.text}</p>
            </li>
          ))}
        </ol>

        <div className="essence__meter" aria-hidden="true">
          <span className="essence__meter-track">
            <span className="essence__meter-fill" />
          </span>
          <ul className="t-label">
            {["Top", "Heart", "Base"].map((t, i) => (
              <li key={t} data-tick={i}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
