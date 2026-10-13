"use client";

import { useExperience } from "@/lib/store";

/**
 * Shown only when WebGL is unavailable (or the context is lost): a drawn VÉLOR Nº 01 in the
 * same light, so the film still has its protagonist. It sits where the 3D bottle would.
 */
export function StaticFallback() {
  const failed = useExperience((s) => s.webglFailed);
  const scene = useExperience((s) => s.activeScene);
  if (!failed) return null;
  const visible = scene === "awakening" || scene === "revelation" || scene === "desire" || scene === "anatomy";
  return (
    <div className="fallback" data-visible={visible} data-scene={scene} aria-hidden="true">
      <svg viewBox="0 0 220 360" className="fallback__bottle">
        <defs>
          <linearGradient id="fb-glass" x1="0" x2="1">
            <stop offset="0" stopColor="#3a3029" />
            <stop offset="0.18" stopColor="#14110e" />
            <stop offset="0.82" stopColor="#0d0b09" />
            <stop offset="1" stopColor="#4a3c2e" />
          </linearGradient>
          <linearGradient id="fb-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#8a7350" />
            <stop offset="0.35" stopColor="#e6d0a6" />
            <stop offset="0.6" stopColor="#c4a77d" />
            <stop offset="1" stopColor="#6d5a3d" />
          </linearGradient>
          <linearGradient id="fb-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a3410" stopOpacity="0.9" />
            <stop offset="1" stopColor="#2a1606" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect x="52" y="10" width="116" height="100" rx="8" fill="url(#fb-gold)" />
        <rect x="52" y="96" width="116" height="1.2" fill="#2a1f12" />
        <rect x="88" y="110" width="44" height="14" fill="url(#fb-gold)" />
        <rect x="2" y="122" width="216" height="236" rx="14" fill="url(#fb-glass)" />
        <rect x="17" y="138" width="186" height="150" rx="8" fill="url(#fb-liquid)" />
        <rect x="6" y="126" width="3" height="226" fill="#f0e9df" opacity="0.35" />
        <rect x="210" y="126" width="2" height="226" fill="#f0e9df" opacity="0.18" />
        <text x="110" y="226" textAnchor="middle" fill="#d8bc8c" fontSize="30" letterSpacing="5" fontFamily="var(--font-serif)">
          VÉLOR
        </text>
        <rect x="80" y="236" width="60" height="0.8" fill="#d8bc8c" />
        <text x="110" y="256" textAnchor="middle" fill="#d8bc8c" fontSize="11" letterSpacing="3" fontFamily="var(--font-sans)">
          Nº 01
        </text>
      </svg>
    </div>
  );
}
