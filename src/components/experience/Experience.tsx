"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useSyncExternalStore } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { supportsWebGL } from "@/lib/device";
import { setExperience } from "@/lib/store";
import { startDirector } from "@/lib/three/director";
import { LuxuryNavigation } from "@/components/layout/LuxuryNavigation";
import { LuxuryCursor } from "@/components/motion/LuxuryCursor";
import { FragrancePanel } from "@/components/scenes/FragrancePanel";
import { CinematicPreloader } from "./CinematicPreloader";
import { SceneSlate } from "./SceneSlate";
import { StaticFallback } from "./StaticFallback";

// three.js, R3F and the shaders load on the client only, after the critical HTML/CSS.
const Stage = dynamic(() => import("@/components/three/Stage"), { ssr: false });

const noop = () => () => {};

/** Client shell: the fixed WebGL stage, the director, and the chrome that frames every scene. */
export function Experience({ children }: { children: ReactNode }) {
  // Client-only capability check; the server render never mounts the stage.
  const webgl = useSyncExternalStore(noop, supportsWebGL, () => false);

  useEffect(() => {
    const stop = startDirector();
    if (!supportsWebGL()) setExperience({ webglFailed: true, stageReady: true });
    // Fonts change line heights; let every ScrollTrigger re-measure once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    // Credits mode: the header and slate step aside once the footer starts to rise.
    const footer = document.querySelector(".footer");
    const io = new IntersectionObserver(([entry]) => {
      document.documentElement.classList.toggle("at-credits", entry.isIntersecting);
    }, { rootMargin: "0px 0px -20% 0px" });
    if (footer) io.observe(footer);
    return () => {
      stop();
      io.disconnect();
    };
  }, []);

  return (
    <>
      {webgl && <Stage />}
      <StaticFallback />
      <div className="grain" aria-hidden="true" />
      <LuxuryNavigation />
      <main id="main" className="film">
        {children}
      </main>
      <SceneSlate />
      <FragrancePanel />
      <LuxuryCursor />
      <CinematicPreloader />
    </>
  );
}
