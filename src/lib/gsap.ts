"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // Weighted decelerations — a camera dolly settling, not a UI tween.
  CustomEase.create("velor.out", "M0,0 C0.16,1 0.3,1 1,1");
  CustomEase.create("velor.inOut", "M0,0 C0.7,0 0.2,1 1,1");
  CustomEase.create("velor.in", "M0,0 C0.6,0 0.86,0.3 1,1");

  gsap.defaults({ ease: "velor.out", duration: 1.2 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export { gsap, ScrollTrigger };
