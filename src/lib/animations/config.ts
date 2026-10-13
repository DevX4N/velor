// DOM motion parameters. 3D choreography lives in lib/three/keyframes.ts.

export const MOTION = {
  preloader: {
    /** Minimum time the identity holds, so the sequence never reads as a flash. */
    minHold: 2.4,
    /** Hard ceiling: the page is revealed even if WebGL never reports ready. */
    maxWait: 5.5,
    /** Repeat visits in the same session get a short version. */
    repeatHold: 0.9,
  },
  intro: {
    /** Hero: light crossing the glass, wordmark mask, camera dolly. */
    duration: 3.6,
    wordmarkDelay: 0.9,
  },
  scrub: 0.6,
  reveal: {
    /** Mask-reveal travel for words/lines, in % of their own height. */
    yPercent: 130,
  },
  cursor: {
    dotLerp: 0.35,
    ringLerp: 0.14,
    magnet: 0.28,
  },
} as const;
