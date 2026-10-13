"use client";

import { useRef } from "react";
import { presence } from "@/content/velor";
import { useSceneTimeline } from "@/hooks/useSceneTimeline";

/** Each line drifts at its own speed (yPercent across the scene), like layers at different depths. */
const DRIFT = [-48, -36, -25, -14];

/**
 * CENA 05 — THE ART OF PRESENCE. A manifesto in four lines. Words surface one by one through
 * their masks while the lines travel upward at different speeds; marginalia cross the frame
 * faster still. Behind it, the 3D camera holds a macro of the cap and glides down the glass.
 * At the end the set warms from black to champagne and the type follows to ink.
 */
export function KineticTypography() {
  const root = useRef<HTMLElement>(null);

  useSceneTimeline(root, (tl, ctx) => {
    const words = ctx.q(".kinetic__word > span");
    if (ctx.reduced) {
      tl.fromTo(words, { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: 0.04 }, 0.04);
    } else {
      tl.fromTo(
        words,
        { yPercent: 110, rotate: 2.5 },
        { yPercent: 0, rotate: 0, duration: 0.09, stagger: 0.045, ease: "velor.out" },
        0.04,
      );
      ctx.q(".kinetic__line").forEach((line, i) => {
        tl.fromTo(line, { yPercent: 18 }, { yPercent: DRIFT[i] ?? -30, duration: 1, ease: "none" }, 0);
      });
      ctx.q(".kinetic__margin").forEach((m, i) => {
        tl.fromTo(m, { y: "60vh" }, { y: `${-70 - i * 25}vh`, duration: 1, ease: "none" }, 0);
      });
      tl.fromTo(ctx.q(".kinetic__hair"), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "velor.out", stagger: 0.08 }, 0.1);
    }

    // "Remembered." is the one word the light finds.
    tl.fromTo(ctx.q(".kinetic__word--lit > span"), { color: "rgb(240 233 223)" }, { color: "rgb(196 167 125)", duration: 0.1 }, 0.62);

    // The set warms to champagne (3D background); the type follows to ink so it stays legible.
    tl.to(ctx.q(".kinetic__word > span, .kinetic__margin"), { color: "rgb(20 20 20)", duration: 0.12 }, 0.84);
    tl.to(ctx.q(".kinetic__hair"), { backgroundColor: "rgb(20 20 20 / 0.35)", duration: 0.12 }, 0.84);
    tl.to(ctx.q(".kinetic__lines"), ctx.reduced ? { opacity: 0, duration: 0.06 } : { opacity: 0, y: -40, duration: 0.08 }, 0.94);
  });

  return (
    <section ref={root} id="presence" data-scene="presence" className="scene scene--presence" aria-labelledby="presence-title">
      <div className="scene__stage kinetic">
        <h2 id="presence-title" className="sr-only">
          Not made to be noticed. Made to be remembered.
        </h2>
        <p className="kinetic__lines t-serif" aria-hidden="true">
          {presence.lines.map((line, i) => (
            <span key={i} className={`kinetic__line kinetic__line--${i}`}>
              {line.map((word, j) => (
                <span key={j} className={`kinetic__word${word === "remembered." ? " kinetic__word--lit" : ""}`}>
                  <span>{word}</span>
                </span>
              ))}
            </span>
          ))}
        </p>
        <span className="kinetic__hair kinetic__hair--a" aria-hidden="true" />
        <span className="kinetic__hair kinetic__hair--b" aria-hidden="true" />
        <div className="kinetic__margins" aria-hidden="true">
          {presence.marginalia.map((m, i) => (
            <span key={m} className={`kinetic__margin kinetic__margin--${i} t-label`}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
