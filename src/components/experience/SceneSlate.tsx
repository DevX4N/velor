"use client";

import { useEffect, useRef } from "react";
import { scenes } from "@/content/velor";
import { onSlate } from "@/lib/three/director";
import { useExperience } from "@/lib/store";

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

/**
 * The studio slate: scene number, scene title and a running timecode that advances with the
 * scroll — the visitor is literally scrubbing the film. Updated by the director, no re-renders.
 */
export function SceneSlate() {
  const scene = useRef<HTMLSpanElement>(null);
  const title = useRef<HTMLSpanElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const revealed = useExperience((s) => s.revealed);
  const active = useExperience((s) => s.activeScene);

  useEffect(() => {
    let lastIdx = -1;
    let lastTc = "";
    onSlate((idx, seconds) => {
      if (idx !== lastIdx && idx >= 0) {
        lastIdx = idx;
        if (scene.current) scene.current.textContent = pad(idx + 1);
        if (title.current) title.current.textContent = scenes[idx].title;
      }
      const frames = Math.floor((seconds % 1) * 24);
      const next = `00:${pad(seconds / 60)}:${pad(seconds % 60)}:${pad(frames)}`;
      if (next !== lastTc && tc.current) {
        lastTc = next;
        tc.current.textContent = next;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, seconds / 150).toFixed(4)})`;
    });
    return () => onSlate(null);
  }, []);

  return (
    <div className="slate t-label" data-visible={revealed} data-scene={active} aria-hidden="true">
      <span className="slate__scene">
        Sc. <span ref={scene} className="t-num">01</span>
      </span>
      <span ref={title} className="slate__title">
        {scenes[0].title}
      </span>
      <span ref={tc} className="slate__tc t-num">
        00:00:00:00
      </span>
      <span className="slate__bar">
        <span ref={bar} />
      </span>
    </div>
  );
}
