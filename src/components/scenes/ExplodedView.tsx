"use client";

import { useEffect, useRef } from "react";
import { anatomy, type CalloutId } from "@/content/velor";
import { calloutStage, callouts, type Point } from "@/lib/three/registry";
import { MaskLines } from "@/components/motion/MaskLines";
import { concealMask, focusIn, focusOut, revealMask, useSceneTimeline } from "@/hooks/useSceneTimeline";

const SIDE: Record<CalloutId, "left" | "right"> = { cap: "right", glass: "right", essence: "left", volume: "left" };

/**
 * CENA 03 — THE ANATOMY OF LUXURY. The 3D parts separate (keyframes: explode 0 → 1 → 0);
 * the DOM supplies the editorial layer: labels in fixed columns and hairlines that the
 * CalloutProjector draws to the real anchor points on the moving parts.
 */
export function ExplodedView() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  // Register the lines + label anchors for the projector; cache label positions on resize.
  useEffect(() => {
    const st = stage.current;
    const s = svg.current;
    if (!st || !s) return;
    calloutStage.el = st;
    const cache = new Map<CalloutId, Point[]>();

    const measure = () => {
      const base = st.getBoundingClientRect();
      s.setAttribute("viewBox", `0 0 ${base.width} ${base.height}`);
      // Phones: the legend sits under the parts, so each leader climbs a gutter to a gap above
      // the legend before turning to its anchor — it never crosses a label.
      const phone = window.matchMedia("(max-width: 899px)").matches;
      const grid = st.querySelector<HTMLElement>(".anatomy__callouts")?.getBoundingClientRect();
      const gapY = grid ? grid.top - base.top - 16 : 0;
      anatomy.parts.forEach(({ id }) => {
        const pin = st.querySelector<HTMLElement>(`[data-callout="${id}"] [data-pin]`);
        if (!pin) return;
        const r = pin.getBoundingClientRect();
        const p = { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
        if (!phone || !grid) {
          cache.set(id, [p]);
          return;
        }
        const lowerRow = r.top - grid.top > 24;
        if (!lowerRow) cache.set(id, [p, { x: p.x, y: gapY }]);
        else {
          const lane = p.x - 8;
          cache.set(id, [p, { x: lane, y: p.y - 8 }, { x: lane, y: gapY }]);
        }
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(st);

    anatomy.parts.forEach(({ id }) => {
      const line = s.querySelector<SVGPolylineElement>(`[data-line-for="${id}"]`);
      const dot = s.querySelector<SVGCircleElement>(`[data-dot-for="${id}"]`);
      if (line && dot) callouts[id] = { line, dot, route: () => cache.get(id) ?? [{ x: 0, y: 0 }] };
    });

    return () => {
      ro.disconnect();
      calloutStage.el = null;
      anatomy.parts.forEach(({ id }) => delete callouts[id]);
    };
  }, []);

  useSceneTimeline(root, (tl, ctx) => {
    const title = ctx.q(".anatomy__title [data-line]");
    revealMask(tl, title, 0.03, ctx, { span: 0.12, stagger: 0.03 });

    // Callouts arrive while the parts are still settling apart, one after another.
    const order: CalloutId[] = ["cap", "glass", "essence", "volume"];
    order.forEach((id, i) => {
      const at = 0.4 + i * 0.045;
      const q = (s: string) => ctx.q(`[data-callout="${id}"] ${s}`);
      tl.fromTo(ctx.q(`[data-line-for="${id}"]`), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.09, ease: "velor.out" }, at);
      tl.fromTo(ctx.q(`[data-dot-for="${id}"]`), { opacity: 0 }, { opacity: 1, duration: 0.04 }, at + 0.06);
      tl.fromTo(q("[data-pin]"), { scale: 0 }, { scale: 1, duration: 0.05, ease: "velor.out" }, at);
      revealMask(tl, q("[data-line]"), at + 0.02, ctx, { span: 0.08 });
      focusIn(tl, q(".callout__text"), at + 0.05, ctx, 0.08);
    });

    // Rebuild: everything withdraws before the parts close up again.
    tl.to(ctx.q(".anatomy__lines polyline"), { strokeDashoffset: -1, duration: 0.07, ease: "velor.in", stagger: 0.01 }, 0.78);
    tl.to(ctx.q(".anatomy__lines circle"), { opacity: 0, duration: 0.04 }, 0.8);
    tl.to(ctx.q("[data-pin]"), { scale: 0, duration: 0.05, stagger: 0.01 }, 0.8);
    concealMask(tl, ctx.q(".callout [data-line]"), 0.78, ctx, { span: 0.07, stagger: 0.01 });
    focusOut(tl, ctx.q(".callout__text"), 0.78, ctx, 0.06);
    // On phones the parts rise into the title's space, so it leaves before they separate.
    concealMask(tl, title, ctx.mobile ? 0.3 : 0.9, ctx, { span: 0.08 });
  });

  return (
    <section ref={root} id="anatomy" data-scene="anatomy" className="scene scene--anatomy" aria-labelledby="anatomy-title">
      <div ref={stage} className="scene__stage anatomy">
        <h2 id="anatomy-title" className="anatomy__title t-serif">
          <MaskLines lines={anatomy.title} />
        </h2>

        <svg ref={svg} className="anatomy__lines" aria-hidden="true">
          {anatomy.parts.map(({ id }) => (
            <g key={id}>
              <polyline data-line-for={id} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} />
              <circle data-dot-for={id} r={2.5} opacity={0} />
            </g>
          ))}
        </svg>

        <ul className="anatomy__callouts">
          {anatomy.parts.map((part) => (
            <li key={part.id} className="callout" data-callout={part.id} data-side={SIDE[part.id]}>
              <span className="callout__pin" data-pin aria-hidden="true" />
              <h3 className="callout__label t-label">
                <span className="mask">
                  <span data-line>{part.label}</span>
                </span>
              </h3>
              <p className="callout__text">{part.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
