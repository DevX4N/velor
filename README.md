# VÉLOR — Parfums · The Art of Presence

A cinematic, scroll-driven fragrance experience for **VÉLOR Nº 01, Extrait de Parfum** — a fictional luxury brand built as a Creative Development portfolio piece. One continuous studio take in seven scenes: the bottle wakes in the dark, turns for the camera, comes apart, dissolves into its three notes, returns behind a manifesto, meets daylight, and goes out.

> Marca fictícia. Não há produto à venda: o CTA abre um dossiê editorial, não um checkout.

## Run

```bash
npm install
npm run dev -- --port 3020
```

`npm run build`, `npm run lint` and `npm run typecheck` all pass.

## Stack — and why each dependency is here

| Package | Why |
| --- | --- |
| `next`, `react` | App Router shell; the page is static and prerendered. |
| `three`, `@react-three/fiber` | The bottle and the atmosphere are real-time 3D. |
| `@react-three/drei` | `Environment` + `Lightformer` (a studio lit with procedural softboxes, no HDR download), `PerformanceMonitor` (DPR backs off on slow GPUs), `useGLTF` (the GLB swap path). |
| `gsap` (+ ScrollTrigger, CustomEase) | Scrubbed DOM timelines, the preloader, the hero intro, reversible scroll choreography. |
| `tailwindcss` | Tokens and the reset; the scenes are written as plain CSS for precision. |

Not used on purpose: Lenis/smooth-scroll (no scroll-jacking — native scroll, smoothing happens in the 3D damping and the 0.6 s scrub), Framer Motion (GSAP owns all motion), postprocessing (depth is faked with particle depth-fade instead of a DOF pass).

## How the film works

```
scroll ──► director (lib/three/director.ts) ──► pose (camera, bottle, light, atmosphere, background)
   │            ▲ samples sparse keyframe tracks (lib/three/keyframes.ts)
   │            └ damps toward them every tick, invalidates the R3F canvas only while something moves
   └──► GSAP ScrollTrigger timelines per scene (DOM text, lines, masks), normalised to 0→1
```

- **One fixed WebGL stage** (`components/three/Stage.tsx`, `frameloop="demand"`) under the DOM. Each scene is a tall scroll track with a CSS-sticky stage (`.scene` / `.scene__stage`) — pinning without pin-spacers, so nothing reflows and mobile URL-bar resizes don't jump.
- **All 3D choreography is data.** `keyframes.ts` lists every camera/bottle/light value against `[scene, p]` positions (`p` 0→1 = the sticky hold, −1/2 = entering/leaving). Portrait frames get `m` overrides; narrower frames push the camera back (`FRAMING.fit`) and pull lateral offsets to the centre (`FRAMING.lateral`). Tracks are sampled deterministically from the scroll position, so the film is fully reversible and correct after a reload mid-page.
- **DOM timelines** (`hooks/useSceneTimeline.ts`) are built inside `gsap.matchMedia` (desktop / mobile / reduced-motion), normalised to a length of 1 so their positions read like the 3D keyframes, and reverted on unmount.
- **Hero intro** animates a separate `intro` object (light, sweep, wordmark mask, dolly) that is *multiplied* into the pose — it never fights the scroll tracks.
- **Text-time tuning** lives in `lib/animations/config.ts` (preloader hold/ceiling, intro duration, scrub, mask travel, cursor).

## The bottle

`components/three/PerfumeBottle.tsx` builds VÉLOR Nº 01 from primitives, dimensioned in `lib/three/bottle-spec.ts`:

- **Body** — rounded-box smoked glass (`MeshPhysicalMaterial` transmission, attenuation, clearcoat), solid glass base, the essence inside, a neck.
- **Sprayer** — gold collar, stem, actuator with nozzle, dip tube (it slides out of the essence in the anatomy scene).
- **Cap** — brushed gold (anisotropic `MeshPhysicalMaterial` + a procedural brushing roughness map), hairline seam, hollow underside.
- **Label** — gold foil printed from a canvas texture with the real webfonts.
- **Studio** — black cyclorama with Lightformer softboxes (warm key strip, cool fill, rim strips, overhead, a horizon card behind camera), plus a spot key and two rims for the metal. `presence` dims the whole rig: "the light leaves the room" is how the bottle disappears.

The hero wordmark is an opaque WebGL plane behind the bottle, so the glass actually refracts it.

### Replacing it with a real model (GLB/GLTF)

1. Export a GLB with four nodes named **`Cap`**, **`Sprayer`**, **`Body`**, **`Liquid`**, centred on the origin, ≈1.77 units tall.
2. Put it in `public/assets/models/` and set `NEXT_PUBLIC_VELOR_BOTTLE_GLB=/assets/models/<file>.glb`.
3. `GLTFBottle` mounts it into the same part groups; `useBottleMotion` drives pose and disassembly for either bottle, so no animation changes. If proportions differ, adjust `CALLOUT_ANCHORS` and `EXPLODE` in `bottle-spec.ts`.

## Scenes

| # | Scene | Component | What happens |
| --- | --- | --- | --- |
| 01 | The Awakening | `CinematicPreloader`, `HeroScene` | Gold hairline, name, tagline; holds only while shaders compile (min 2.4 s, ceiling 5.5 s, 0.9 s on repeat visits). Then the light sweeps the glass, the wordmark rises through its mask, the camera settles. |
| 02 | The Revelation | `ProductReveal` | Dolly in, a jeweller's turn, close on cap and label. |
| 03 | The Anatomy of Luxury | `ExplodedView`, `CalloutProjector` | Cap, sprayer and body separate on staggered windows; hairlines are drawn from each label to its real 3D anchor every frame; then it rebuilds. |
| 04 | The Essence | `FragranceNotes`, `Atmosphere`, `EssenceParticles` | Gold sweep, light out; bergamot motes in a beam → black-amber resin forms → vetiver & oud smoke with a wood grain. One shader set, weighted by a continuous `note` index. |
| 05 | The Art of Presence | `KineticTypography` | Manifesto words surface through masks; lines drift at different speeds; macro of the cap behind; the set warms to champagne and the type follows to ink. |
| 06 | The Object of Desire | `FinalProductReveal`, `FragrancePanel` | Ivory set, pull back, turn to face, contact shadow. Drag turns the real bottle. The CTA opens a native `<dialog>` dossier. |
| 07 | The Final Statement | `FinalStatement`, `Footer` | Back to black; the bottle recedes and goes out; monumental VÉLOR; credits. |

Chrome: `LuxuryNavigation` (active scene indicator, full-screen mobile menu with focus trap), `SceneSlate` (scene + running timecode that scrubs with the scroll), `LuxuryCursor` (mouse only; magnetic house button; "Girar" handle over the bottle in scene 06), `MagneticButton`.

## Responsiveness, accessibility, performance

- Desktop is the full cinematic cut; phones get shorter scene tracks, portrait camera framing, a 2×2 anatomy legend whose lines don't cross, fewer particles, no custom cursor.
- `prefers-reduced-motion`: no intro choreography, no idle float/drift, frozen particles, opacity-only text reveals, shorter preloader; the scroll still drives the (now direct) camera.
- Real headings per scene, skip link, focus-visible styles, native dialog semantics, keyboard-reachable nav and menu, themed selection/scrollbar/focus.
- DPR capped per tier (1.25–1.75) with `PerformanceMonitor` backing off; transmission render scale per tier; on-demand rendering that stops when nothing is visible or moving; atmosphere and particles skipped when out of the film; GSAP contexts and R3F resources disposed on unmount; static SVG fallback when WebGL is unavailable.

## Structure

```
src/
  app/                 layout (fonts, direction contract), page, global tokens
  content/velor.ts     every word on the page
  components/
    experience/        Experience shell, CinematicPreloader, SceneSlate, StaticFallback
    layout/            LuxuryNavigation, Footer, navigate()
    motion/            MagneticButton, LuxuryCursor, MaskLines
    scenes/            the seven scenes + FragrancePanel
    three/             Stage, PerfumeBottle, GLTFBottle, BottleLighting, Wordmark3D,
                       Atmosphere, EssenceParticles, CameraRig, CalloutProjector, shaders/
  hooks/               useSceneTimeline (+ reveal helpers)
  lib/
    animations/        DOM motion parameters
    three/             keyframes, director, bottle-spec, textures, registry, useBottleMotion
  styles/              scenes.css, chrome.css
```

Fonts: Bodoni Moda (optical-size Didone) and Jost, self-hosted by `next/font`. All imagery is procedural; there are no raster assets to replace.
