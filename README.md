# The Archive

A scroll-driven 3D portfolio — every real project rendered as its own
drafted technical sheet, floating in a corridor of deep cyanotype blue.
Built after looking closely at [igloo.inc](https://www.igloo.inc)'s
ice-block-per-project mechanic (built by Abeto × Bureaux) and borrowing
the *structure* of that idea — one object per project, camera drifts
between them, footer particles react to hover — while reskinning
everything in blueprint/drafting language instead of ice and crystal.

## Stack

Same proven combination as CIVION: Next.js 16 (App Router), React 19,
React Three Fiber 9 + drei + postprocessing, GSAP + ScrollTrigger, Lenis.

## Running it

```
npm install
npm run dev
```

Push to a new GitHub repo and import it in Vercel exactly like your other
apps — no environment variables needed, nothing to configure.

**One honest caveat:** this was written without a live dev server to
preview against, so consider this a strong first pass rather than a
pixel-tested one. If something looks off after your first `npm run dev`
or Vercel build — a sheet's rotation reads backwards, a color's too
loud, timing feels off — paste me what you're seeing (or the build
error, if TypeScript catches something) and I'll fix it directly.

## How the site is structured

One continuous `<Canvas>` sits `fixed` behind the page
(`ArchiveScene.tsx`), and one camera path runs through the whole thing
(`BlueprintCameraRig.tsx`) — same "one world, one camera path" choice
CIVION's `WorldScene`/`WorldCameraRig` made, for the same reason: a
single continuous path only works against a single continuous 3D world.
The HTML sections in `page.tsx` don't display much themselves (their
text is `sr-only`, for accessibility/SEO) — they exist to give the page
scroll height and to anchor the camera rig's waypoints, via
`document.getElementById("sheet-3")` etc.

```
Cover sheet (A-00)          — the title sheet, camera starts close, pulls back
  ↓ scroll
Archive corridor (A-01…A-10) — one ArchiveSheet per real project
  ↓ scroll
Instrument desk (A-11)       — contact links, particle system reacts to hover
```

### Files that matter most

- `src/data/projects.ts` — every sheet's real content. **Add a new
  project by adding one entry here** — pick a `glyph` category (see
  below), a unique `seed` (any integer), and it'll appear as the next
  sheet in the corridor automatically. No other file needs to change.
- `src/scenes/sheetLayout.ts` — pure math for where each sheet sits and
  where the camera stands to view it. `SPACING_Z` / `SIDE_OFFSET` are
  the two numbers to nudge if the corridor ever feels too cramped or too
  sparse.
- `src/scenes/glyphs.ts` — the procedural line-art per project category
  (`structural`, `molecule`, `pulse`, etc.). Each is a small pure
  function returning line segments — no external art files, so a new
  category is just a new function in the same style.
- `src/scenes/targetShapes.ts` — the four instrument silhouettes
  (compass rose, T-square, scale bar, protractor) the footer particles
  assemble into on hover.

### The seed system

Every sheet's registration marks, dimension lines, and hatch pattern are
generated from its `seed` — this is directly answering the thing
Igloo's case study flagged as a real lesson: they tried reusing one ice
block design for every project and it made the whole scroll blur
together, so they gave each block unique geometry instead. Same reason
every `ArchiveSheet` here looks like its own drawing rather than one
template with a different label.

## What's deliberately simple in this first pass

- **Click a sheet** to zoom in and see an in-place detail card (title,
  stack, live link). No separate `/project/[id]` route yet — CIVION
  grew into that over several passes too, this can follow the same path
  if you want it.
- **Text glitch/scramble effects** — Igloo renders all of its UI text in
  WebGL specifically to get cheap glitch/scramble shaders. Building that
  custom SDF-text pipeline is a real sub-project on its own; this pass
  uses drei's `<Text>` directly instead, which is far simpler and still
  reads as "technical" thanks to the title-block layout around it.
- **Particle color react to velocity** — Igloo's footer particles shift
  color based on how fast each one is moving. Here, color instead reacts
  to the assembly progress (cool → brass as it locks into shape), which
  gets a similar "warming up" feeling without needing to track
  per-particle velocity history.
- **Mobile performance** — `useQualityTier` copies CIVION's exact
  heuristic (any touch-primary device drops to the low tier: capped DPR,
  antialiasing off, no postprocessing, fewer particles). Worth checking
  on your own phone first, same as you did with CIVION.
