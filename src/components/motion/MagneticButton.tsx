"use client";

import { type ButtonHTMLAttributes, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/animations/config";
import { hasFinePointer, prefersReducedMotion } from "@/lib/device";

/**
 * The house button: hairline frame, a fill that rises from the baseline on hover, and a label
 * that rolls to a second copy of itself. On precise pointers it leans toward the cursor.
 */
export function MagneticButton({
  children,
  className = "",
  tone = "ink",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "ink" | "ivory" }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "velor.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "velor.out" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * MOTION.cursor.magnet);
      yTo((e.clientY - (r.top + r.height / 2)) * MOTION.cursor.magnet);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <button ref={ref} type="button" className={`mbtn mbtn--${tone} ${className}`} data-cursor="magnetic" {...rest}>
      <span className="mbtn__fill" aria-hidden="true" />
      <span className="mbtn__label">
        <span className="mbtn__roll">
          <span>{children}</span>
          <span aria-hidden="true">{children}</span>
        </span>
      </span>
      <svg className="mbtn__arrow" viewBox="0 0 24 10" aria-hidden="true">
        <path d="M0 5h22M18 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>
  );
}
