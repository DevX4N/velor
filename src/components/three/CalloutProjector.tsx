"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { CALLOUT_ANCHORS } from "@/lib/three/bottle-spec";
import { current } from "@/lib/three/director";
import { calloutStage, callouts, parts } from "@/lib/three/registry";
import type { CalloutId } from "@/content/velor";

/**
 * Draws the anatomy callout lines from each DOM label to the real 3D point it names.
 * Anchors live in the parts' local space, so the lines follow the parts as they separate.
 */
export function CalloutProjector() {
  const size = useThree((s) => s.size);
  const v = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    const stage = calloutStage.el;
    if (!stage || current.explode < 0.02) return;
    const offset = stage.getBoundingClientRect().top;
    (Object.keys(CALLOUT_ANCHORS) as CalloutId[]).forEach((id) => {
      const dom = callouts[id];
      const anchor = CALLOUT_ANCHORS[id];
      const part = parts[anchor.part];
      if (!dom || !part) return;
      v.set(...anchor.local);
      part.localToWorld(v);
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height - offset;
      let pts = "";
      for (const pt of dom.route()) pts += `${pt.x.toFixed(1)},${pt.y.toFixed(1)} `;
      dom.line.setAttribute("points", `${pts}${x.toFixed(1)},${y.toFixed(1)}`);
      dom.dot.setAttribute("cx", x.toFixed(1));
      dom.dot.setAttribute("cy", y.toFixed(1));
    });
  });

  return null;
}
