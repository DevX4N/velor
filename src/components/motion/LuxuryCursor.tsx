"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/animations/config";
import { hasFinePointer, prefersReducedMotion } from "@/lib/device";

type Mode = "default" | "link" | "magnetic" | "drag";

/**
 * A hairline ring and a point, for mouse users only. Links widen the ring; the house button
 * swallows it; over the bottle in daylight it becomes a "drag" handle (the bottle really turns).
 * Touch, pen-less tablets and reduced motion keep the native cursor untouched.
 */
export function LuxuryCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const r = ring.current;
    const d = dot.current;
    if (!r || !d) return;
    document.documentElement.classList.add("has-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    const dotPos = { ...pos };
    let mode: Mode = "default";
    let visible = false;

    const setMode = (m: Mode) => {
      if (m === mode) return;
      mode = m;
      r.dataset.mode = m;
      d.dataset.mode = m;
      if (label.current) label.current.textContent = m === "drag" ? "Girar" : "";
    };

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = dotPos.x = pos.x;
        ringPos.y = dotPos.y = pos.y;
        gsap.to([r, d], { opacity: 1, duration: 0.4 });
      }
      const t = (e.target as Element | null)?.closest?.("[data-cursor], a, button");
      const kind = t?.getAttribute("data-cursor") as Mode | null;
      setMode(kind ?? (t ? "link" : "default"));
    };
    const onLeave = () => {
      visible = false;
      gsap.to([r, d], { opacity: 0, duration: 0.3 });
    };
    const onDown = () => r.classList.add("is-down");
    const onUp = () => r.classList.remove("is-down");

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * MOTION.cursor.ringLerp;
      ringPos.y += (pos.y - ringPos.y) * MOTION.cursor.ringLerp;
      dotPos.x += (pos.x - dotPos.x) * MOTION.cursor.dotLerp;
      dotPos.y += (pos.y - dotPos.y) * MOTION.cursor.dotLerp;
      r.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      d.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    gsap.ticker.add(tick);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring" data-mode="default">
        <span ref={label} className="cursor__label t-label" />
      </div>
      <div ref={dot} className="cursor__dot" data-mode="default" />
    </div>
  );
}
