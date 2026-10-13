"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/animations/config";
import { getExperience, setExperience, useExperience } from "@/lib/store";

const WORD = "VÉLOR";

/**
 * CENA 01 — THE AWAKENING, first beat. Black; a gold hairline draws from the centre; the name
 * rises through its mask; THE ART OF PRESENCE opens its tracking. It holds only while the stage
 * compiles (with a minimum so it never flashes, and a hard ceiling so it never blocks),
 * then the line runs to the edges and the identity dissolves into the first scene.
 */
export function CinematicPreloader() {
  const root = useRef<HTMLDivElement>(null);
  const stageReady = useExperience((s) => s.stageReady);
  const entered = useRef<Promise<void> | null>(null);
  const started = useRef(0);

  // Entrance choreography (runs immediately, independent of loading).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    document.documentElement.classList.add("is-loading");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let repeat = false;
    try {
      repeat = sessionStorage.getItem("velor:seen") === "1";
      sessionStorage.setItem("velor:seen", "1");
    } catch {}
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      if (reduced) {
        tl.set(".pre__line", { scaleX: 1 }).fromTo(".pre__word span span, .pre__tag", { opacity: 0 }, { opacity: 1, duration: 0.4 });
      } else {
        tl.fromTo(".pre__line", { scaleX: 0 }, { scaleX: 1, duration: repeat ? 0.6 : 1.3, ease: "velor.inOut" })
          .fromTo(
            ".pre__word span span",
            { yPercent: 150 },
            { yPercent: 0, duration: repeat ? 0.7 : 1.2, stagger: 0.07, ease: "velor.out" },
            repeat ? 0.2 : 0.65,
          )
          .fromTo(
            ".pre__tag",
            { opacity: 0, letterSpacing: "0.18em" },
            { opacity: 1, letterSpacing: "0.52em", duration: repeat ? 0.8 : 1.6, ease: "velor.out" },
            repeat ? 0.4 : 1.15,
          );
      }
      entered.current = new Promise((resolve) => {
        tl.eventCallback("onComplete", () => resolve());
      });
    }, el);
    started.current = performance.now();
    (root.current as HTMLDivElement).dataset.repeat = repeat ? "1" : "0";
    return () => ctx.revert();
  }, []);

  // Exit: once the stage is ready and the minimum hold has passed — or at the hard ceiling.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let done = false;
    const exit = () => {
      if (done || getExperience().revealed) return;
      done = true;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = "none";
        },
      });
      tl.add(() => {
        document.documentElement.classList.remove("is-loading");
      });
      if (reduced) {
        tl.add(() => setExperience({ revealed: true })).to(el, { opacity: 0, duration: 0.5 });
        return;
      }
      tl.to(".pre__word span span", { yPercent: -150, duration: 0.8, stagger: 0.04, ease: "velor.in" }, 0)
        .to(".pre__tag", { opacity: 0, letterSpacing: "0.7em", duration: 0.8, ease: "velor.in" }, 0)
        .to(".pre__line", { scaleX: 3.2, opacity: 0, duration: 1.2, ease: "velor.inOut" }, 0.35)
        .add(() => setExperience({ revealed: true }), 0.75)
        .to(el, { opacity: 0, duration: 1.1, ease: "sine.inOut" }, 0.8);
    };

    const hold = el.dataset.repeat === "1" ? MOTION.preloader.repeatHold : MOTION.preloader.minHold;
    const ceiling = window.setTimeout(exit, MOTION.preloader.maxWait * 1000);
    let holdTimer = 0;
    if (stageReady) {
      const elapsed = (performance.now() - started.current) / 1000;
      holdTimer = window.setTimeout(() => {
        (entered.current ?? Promise.resolve()).then(exit);
      }, Math.max(0, hold - elapsed) * 1000);
    }
    return () => {
      window.clearTimeout(ceiling);
      window.clearTimeout(holdTimer);
    };
  }, [stageReady]);

  return (
    <div ref={root} className="pre" role="status" aria-label="Carregando VÉLOR">
      <p className="pre__word t-serif" aria-hidden="true">
        {[...WORD].map((ch, i) => (
          <span key={i} className="mask">
            <span>{ch}</span>
          </span>
        ))}
      </p>
      <span className="pre__line" aria-hidden="true" />
      <p className="pre__tag t-label" aria-hidden="true">
        The art of presence
      </p>
    </div>
  );
}
