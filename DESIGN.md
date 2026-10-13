---
name: VÉLOR Nº 01
description: A perfume campaign shot as one continuous studio take; light is the narrator.
colors:
  cyclorama-black: "#080808"
  carbon: "#141414"
  graphite: "#292929"
  champagne-gold: "#c4a77d"
  daylight-ivory: "#f0e9df"
  bronze: "#6b5634"
typography:
  monument:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(5.5rem, 24vw, 30rem)"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "-0.01em"
    fontVariation: "opsz auto"
  display:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(2.9rem, 1.6rem + 5.2vw, 7.25rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "opsz auto"
  headline:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(2.2rem, 1rem + 3vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.015em"
    fontVariation: "opsz auto"
  lead:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(1.15rem, 1rem + 0.6vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(0.98rem, 0.92rem + 0.25vw, 1.0625rem)"
    fontWeight: 300
    lineHeight: 1.6
  small:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 300
    lineHeight: 1.7
  label:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.32em"
  label-micro:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.32em"
rounded:
  none: "0px"
  circle: "50%"
spacing:
  gutter: "clamp(1.25rem, 3.6vw, 3.5rem)"
  header: "4.5rem"
  block: "clamp(2.5rem, 6vh, 4rem)"
components:
  button-ink:
    backgroundColor: "transparent"
    textColor: "{colors.carbon}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 1.75rem 0 2rem"
    height: "3.5rem"
  button-ink-hover:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.daylight-ivory}"
  button-ink-active:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.daylight-ivory}"
  button-ivory:
    backgroundColor: "transparent"
    textColor: "{colors.daylight-ivory}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 1.75rem 0 2rem"
    height: "3.5rem"
  button-ivory-hover:
    backgroundColor: "{colors.daylight-ivory}"
    textColor: "{colors.carbon}"
  nav-link:
    textColor: "{colors.daylight-ivory}"
    typography: "{typography.label}"
    padding: "0.6rem 0"
  nav-bar:
    backgroundColor: "transparent"
    textColor: "{colors.daylight-ivory}"
    height: "{spacing.header}"
    padding: "0 {spacing.gutter}"
  dossier-sheet:
    backgroundColor: "{colors.daylight-ivory}"
    textColor: "{colors.carbon}"
    width: "min(42rem, 100%)"
    padding: "clamp(1.5rem, 4vw, 3.5rem) clamp(1.5rem, 4.5vw, 4rem) 3rem"
  slate:
    textColor: "{colors.champagne-gold}"
    typography: "{typography.label-micro}"
  footer:
    backgroundColor: "{colors.cyclorama-black}"
    textColor: "{colors.daylight-ivory}"
    padding: "clamp(4rem, 10vh, 7rem) {spacing.gutter} 2rem"
---

# Design System: VÉLOR Nº 01

## Overview

**Creative North Star: "The Studio Take"**

VÉLOR is shot, not laid out. The whole page is one continuous take inside a black cyclorama: a single fixed WebGL stage sits under the film, and every scene is a tall scroll track whose sticky frame holds the shot while the camera, the light and the bottle move. Light is the narrator. Gold appears where light falls; type is revealed the way light brightens on a surface, through clipping masks and hairlines that draw themselves, not through panels sliding into view. Nothing is boxed into sections, cards or grids; the bottle is the protagonist and the interface is the crew around it.

The density is low and the pace is slow. Large Didone type set against near-black does the emotional work; small, widely tracked Jost capitals do the logistical work (slate, labels, specs, navigation). Between them there is almost nothing: no fills, no shadows, no rounded containers, only 1px rules. The world has two lighting setups, the dark cyclorama and the ivory daylight set, and the chrome reads whichever one it is standing on.

Confirmed rejections, from the brand commitments and the build: no SaaS components, no shadowed cards, no loud gradients, no template sections, no decorative icon clutter, no futuristic look, no fake commerce.

**Key Characteristics:**
- One fixed 3D stage under a sticky-scene scroll film; scenes are takes, not sections.
- Near-black cyclorama with one warm accent, champagne gold, that behaves like light.
- Bodoni Moda at optical size for everything that speaks; light Jost capitals for everything that informs.
- Hairlines (1px) as the only structure; zero radius; no UI shadows.
- Motion as revelation: mask reveals, scaleX rules, clip-path fills, weighted decelerating eases.
- Tone-aware chrome that flips between dark and daylight with the set.

## Colors

A monochrome studio of three blacks and one ivory, lit by a single warm metal.

### Primary
- **Champagne Gold** (`champagne-gold`): the light itself. Rules that draw under a heading, the scroll-cue dot, anatomy leader lines and pins, the slate scene number, the Top/Heart/Base meter fill, the preloader line, focus outlines and link underlines on dark. It is the accent on dark only; on ivory it fails as text and hands off to Bronze.

### Secondary
- **Bronze** (`bronze`): gold in daylight. The small-text accent on the ivory set and in the dossier: spec lists, definition-term labels, the dossier subtitle, and the `--accent` value whenever the tone is light. Never used on dark.

### Neutral
- **Cyclorama Black** (`cyclorama-black`): the page, the preloader, the mobile menu, the footer and the 3D background at rest. Theme color.
- **Carbon** (`carbon`): ink on the ivory set: daylight headings, the ink button's text and fill, the dossier's text, the foreground when the tone is light.
- **Graphite** (`graphite`): the quiet structural dark: scrollbar thumb, the pressed state of the ink button.
- **Daylight Ivory** (`daylight-ivory`): text on dark at full strength, the dossier sheet, the daylight set the bottle is met in, the 3D wordmark's ink.

Ivory on dark is dimmed by alpha, not by new greys: `--fg-dim` at 62% and `--fg-faint` at 22% are the two named steps (66% and 20% of Carbon in light tone). Hairline dividers on dark use ivory at 10%; on ivory, carbon at 18%.

The 3D set also carries its own scene tints, driven from the keyframe palette rather than CSS: a deeper champagne (#a88f69) as the transition into daylight, and three near-black tints for the notes (bergamot #11110e, amber #060504, oud #0a0807). They are lighting, not UI colours; never use them on interface elements.

### Named Rules
**The Lit-Only Rule.** Gold appears only where light would fall: a line, a dot, a pin, a filled meter, a focus ring, and short label-type captions on dark (callout titles, material facts, the signature). It is never a fill behind text, never a surface, never a gradient wash. If an element would still need gold with the lights off, it should be ivory.

**The Daylight Hand-off Rule.** When the set turns ivory, gold steps aside for Bronze on small text and Carbon on everything else. `html[data-tone="light"]` remaps `--fg`, `--fg-dim`, `--fg-faint` and `--accent`; chrome must read those variables, never hard-code ivory or gold, so it follows the set automatically (the tone flips when background luminance crosses 0.32).

## Typography

**Display Font:** Bodoni Moda, variable with optical-size axis (with Didot, serif)
**Body Font:** Jost 300 / 400 / 500 (with ui-sans-serif, system-ui)

**Character:** A true Didone whose hairlines sharpen as it grows, set beside a geometric sans held to its lightest weights. The serif speaks; the sans takes notes.

### Hierarchy
- **Monument** (400, `clamp(5.5rem, 24vw, 30rem)`, 0.82): the VÉLOR wordmark in the final statement only. One per film.
- **Display** (400, `clamp(2.9rem, 1.6rem + 5.2vw, 7.25rem)`, 1, -0.02em): scene titles at full presence; note names scale beyond it (up to `clamp(3.6rem, 0.6rem + 11.5vw, 15rem)`, 0.88) when a note owns the frame.
- **Headline** (400, `clamp(2.2rem, 1rem + 3vw, 4.4rem)`, 0.98 to 1, -0.015 to -0.02em): scene titles that share the frame with the bottle (Revelation, Anatomy), daylight product name.
- **Lead** (400 serif, `clamp(1.15rem, 1rem + 0.6vw, 1.5rem)`, 1.25 to 1.4): one-sentence lines, note descriptions, the hero line, the dossier lede. Measure 19 to 34ch.
- **Body** (300, `clamp(0.98rem, 0.92rem + 0.25vw, 1.0625rem)`, 1.6 to 1.7): descriptive copy in ivory at 70 to 80% on dark. Measure 30 to 46ch; copy blocks never exceed ~23rem beside the bottle.
- **Small** (300, 0.8125rem, 1.7): credits, legal notes, skip link.
- **Label** (400, 0.6875rem, 0.32em tracking, uppercase): navigation, specs, button text, callout labels, the Top/Heart/Base meter, dossier term labels.
- **Label Micro** (400, 0.625rem, 0.32em tracking, uppercase): the slate, material facts, the vertical margin caption, the footer base line.

Wordmarks are spaced out wider than labels (0.22em to 0.5em) and always carry a matching negative right margin so they stay optically centred. Numbers in the slate use tabular lining figures.

### Named Rules
**The Two Voices Rule.** Serif for anything that should be felt (titles, names, quotes, ledes, menu items, footer scene links); Jost capitals for anything that should be read in passing (labels, specs, nav, buttons). Jost is never set large, and Bodoni is never set in capitals except the kinetic manifesto and the wordmark.

**The Optical Size Rule.** Every Bodoni setting keeps `font-optical-sizing: auto`. Hairline contrast must track the size; never pin the opsz axis.

## Layout

A full-bleed film, not a column. The page is a stack of scenes, each a tall scroll track (`--len`, 210vh to 520vh on desktop, roughly 25% shorter below 900px) whose stage is `position: sticky` at `100svh`; the fixed WebGL canvas sits underneath at `100lvh` so it never resizes with the mobile URL bar. Pinning is CSS sticky, never a pin-spacer, and scroll is never hijacked.

Composition is per shot, not per grid. Text is placed around the bottle: titles anchored low-left or top-left, copy blocks at the far right of a three-column `1fr / 1.25fr / 1fr` frame, callouts pinned to the bottle's parts by leader lines, each fragrance note given its own placement (high and right, centred and oversized, low and wide). The one horizontal constant is `--gutter` (`clamp(1.25rem, 3.6vw, 3.5rem)`); the one vertical constant is the 4.5rem header height that every scene clears.

Chrome is fixed and framed around the film: header at the top (three-column grid, logo / links / dossier trigger), slate at the bottom left, meter at the bottom right. Below 900px the header collapses to logo plus menu toggle, the slate hides, scene copy drops to the foot of the frame, callouts regroup into a two-column list and hit targets hold 44px minimum.

### Named Rules
**The Frame-Not-Grid Rule.** Lay text out relative to the bottle and the edges of the frame, never in a repeating card or column grid. If a scene could be swapped for another without moving its text, it has become a section.

## Elevation & Depth

The interface is completely flat. Depth belongs to the 3D stage alone: physical glass transmission, an HDR environment of rectangular light-formers (warm key strips, ivory rim strips, a faint gold floor bounce), directional rim lights and a camera that dollies through the set. UI never imitates it with shadows. Layering is achieved by z-order over the film, a fixed film-grain texture (5.5% opacity, 8% multiplied on light), and, for the dossier only, a warm translucent veil (`rgb(41 37 32 / 0.28)`) with a 6px backdrop blur that keeps the set legible behind the sheet.

### Named Rules
**The No-Shadow Rule.** No `box-shadow` on any interface element. Separation comes from hairlines, tone and z-order; the only shadows in VÉLOR are the ones light casts in 3D.

## Shapes

Square and fine. Every interface edge is a hard 0px corner: buttons, the dossier sheet, the menu, rules. The only round forms are points of light: the cursor ring and dot, the anatomy pins (7px outlined circles) and the leader-line anchors. Structure is drawn with 1px lines only (header link underline, slate progress bar, dividers, button frames, meter track), and lines enter by scaling from one end. Reveals clip rather than fade: `clip-path: inset()` for the button fill, menu and dossier sheet; `overflow: hidden` masks for type.

### Named Rules
**The Hairline Rule.** Every line in the interface is exactly 1px, and it arrives by `scaleX` (or `scaleY`) from an origin, never by fading in place.

## Components

### Buttons
The house button is a hairline frame that fills with light from below.
- **Shape:** square corners (0px), 1px `currentColor` border, 3.5rem minimum height, label type with an arrow glyph drawn as a 1px SVG stroke.
- **Ink (on ivory):** carbon text and frame on transparent; hover/focus raises a carbon fill from the baseline via `clip-path` (0.7s, velor.out) and turns the text ivory after an 80ms delay.
- **Ivory (on dark):** the mirror: ivory frame, ivory fill, carbon text on hover.
- **Hover / Focus:** the label rolls up to a duplicate copy of itself, the arrow travels 0.35rem right, and on fine pointers the whole button leans toward the cursor (magnet factor 0.28). Active presses the fill to graphite.
- **Text actions:** secondary actions are plain label-type text with a 1px gold underline or a leading 1.75rem gold rule that stretches on hover; there is no ghost or filled secondary button.

### Navigation
- **Header:** fixed, transparent, `1fr auto 1fr` grid; spaced Bodoni logo at left, label-type scene links centred, dossier trigger at right preceded by a gold rule. Links rest at `--fg-dim`, reach `--fg` on hover or when current, and a 1px accent underline wipes in from the left (0.7s). All colours are tone variables, so the header turns carbon on the ivory set. It fades out when the footer arrives.
- **Mobile:** a two-bar toggle (1px bars that tilt 18deg into a cross) opens a full-screen ink menu revealed by `clip-path` from the top, with serif scene names rising out of masks.

### Dossier
The editorial panel that replaces checkout. A full-viewport `<dialog>` whose ivory sheet (max 42rem) wipes in from the right edge over the warm veil. Inside: a display-scale serif title, a serif lede, then blocks separated by carbon hairlines at 18%, each a definition list with bronze label-type terms in a 7.5rem column and serif values. Focus outlines turn carbon inside it.

### Slate
The film's clapperboard, bottom-left: scene number in the accent colour with tabular figures, scene title in `--fg`, a running timecode, and a 1px progress bar that fills with the accent. Micro-label type, `aria-hidden`, hidden on the opening shot and on mobile. Scene numbers live here and only here.

### Essence Meter
A 1px track with a gold fill that scales from the left and three label-type ticks (Top / Heart / Base) at 55% opacity, bottom-right of the Essence scene. It is the visible carrier of note tiers; the tier also exists as screen-reader text in each note heading.

### Anatomy Callouts
Label-type gold titles with short ivory-70% body text, attached to the bottle by 1px gold polylines (non-scaling stroke) that draw via `stroke-dashoffset`, ending in a gold anchor dot and a 7px outlined pin.

### Cursor
On fine pointers only: a 36px gold ring at 70% and a 5px dot in `--fg`, lerped separately (ring 0.14, dot 0.35). The ring grows on links, collapses onto magnetic buttons, and swells into a translucent ivory disc with a label in drag mode. Disabled inside dialogs.

### Mask Reveal
The house text entrance. Each authored line sits in a block that clips (`overflow: hidden`, with 0.16em/0.14em padding pulled back by equal negative margins so Didone accents and descenders survive), and an inner span travels 130% of its own height into place. Lines are authored, never measured, so resizes never re-split a running timeline.

### Motion
Motion parameters are shared, not per-component. Three cubic eases carry the whole film: `velor.out` (0.16, 1, 0.3, 1), a weighted deceleration and the GSAP default at 1.2s; `velor.inOut` (0.7, 0, 0.2, 1) for wipes and lines; `velor.in` (0.6, 0, 0.86, 0.3) for exits. Scroll timelines scrub at 0.6. CSS transitions use the same out and in-out curves at 0.4 to 0.8s. Under `prefers-reduced-motion` grain and the cue loop stop, and the 3D stage settles faster.

## Do's and Don'ts

### Do:
- **Do** let light carry emphasis: a 1px gold rule scaling in, a gold dot, a brightening mask reveal (travel 130%, velor.out).
- **Do** pair large Bodoni Moda (opsz auto, weight 400, negative tracking at display sizes) with Jost capitals at 0.6875rem and 0.32em tracking.
- **Do** read `--fg`, `--fg-dim`, `--fg-faint` and `--accent` in any chrome that can sit over both the dark and ivory sets.
- **Do** switch small accent text to Bronze (#6B5634) on ivory; gold fails contrast there.
- **Do** keep every UI corner at 0px and every structural line at 1px.
- **Do** compose each scene around the bottle and the frame edges, clearing the 4.5rem header and the `--gutter`.
- **Do** keep scene numbering inside the slate, where it belongs to the film's apparatus.

### Don't:
- **Don't** add `box-shadow`, shadowed cards, or any container with a fill and padding to hold content on the film.
- **Don't** use gold as a background, a text fill on ivory, or inside a gradient.
- **Don't** introduce a second warm accent or any saturated colour; the scene tints are lighting, not UI.
- **Don't** put eyebrows, kickers or numbered section indices above titles; the slate already says where the visitor is.
- **Don't** slide panels or text blocks across the screen as an entrance; reveal by mask, clip or scale.
- **Don't** set Jost large or in bold, or set Bodoni in small labels.
- **Don't** build a product hero plus feature grid plus buy button, or any action that promises commerce that does not exist.
