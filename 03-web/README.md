# YOUNGLA — Choose Your World

Web experience for YoungLA's homepage/hero: an immersive 3D "rotunda" where
a central character — the visitor, in a YoungLA hoodie, never a franchise
character — stands on a platform surrounded by vitrines, one per
collaboration. Hovering a vitrine focuses it, turns the character toward it,
and crossfades the mark printed on his back; clicking dollies the camera
past him into that world's collection page. See
`02-documentacion/decisiones/direccion-arte-y-stack.md` (particularly the
"v2" section) for the art direction and technical decisions behind this
build, and `01-briefing/briefs-finales/03-briefing-claude.md` for the
original brief.

## Stack

Vite + TypeScript (vanilla, no UI framework) · Three.js · GSAP.

## Getting started

```bash
npm install
npm run dev
```

Multi-page app: `index.html` (the rotunda) and `collection.html` (the
per-world landing placeholder, `?world=<slug>`).

## Structure

```
src/
  worlds.ts              # single source of truth for the 7 collaborations
  main.ts                # loader, desktop/mobile branch, nav
  mobile.ts              # vertical-scroll fallback (< 861px)
  collection.ts           # collection.html logic
  scene/experience.ts     # the Three.js rotunda (desktop only, lazy-loaded)
  style.css / collection.css
```

## Known simplifications (see the decisions doc for the "why")

- **No licensed franchise art yet.** Each vitrine's "occupant" is a generic
  hooded silhouette (built by `buildHoodieFigure` in `scene/experience.ts`),
  not character artwork — both a copyright safeguard (Naruto, Batman, etc.
  are third-party IP) and a deliberate art-direction choice ("museum
  vitrine," never "anime web"). The garment and crest are the real product
  signal. Swap the occupant/garment factories once the client supplies
  licensed art or 3D models — `World` in `worlds.ts` is the only data
  surface that needs to change.
- **Scroll** does a bounded camera dolly rather than the brief's full
  multi-level navigation.
- **World-entry transition** is a camera dolly + full-screen wipe into
  `collection.html`, not a continuous 3D flythrough into a fully-3D
  collection scene (no product data/3D assets exist yet to populate one).
- **Typography** (Bebas Neue + Archivo, via Google Fonts) and the accent
  palette are placeholders pending the client's real brand type/logo in
  `04-recursos/`.
- Desktop-only WebGL: below 861px width the app renders a lighter DOM/GSAP
  vertical-scroll version instead, per the brief's own mobile spec and to
  avoid running Three.js on low-end phones.

## Manual QA notes

Verified in-browser: intro light-up sequence, horizontal cursor parallax
with inertia, per-vitrine hover focus/dim + camera nudge + vitrine scale-up,
the central character turning toward the focused world and its back-print
crossfade, click → dolly → wipe → `collection.html` navigation (including
long world names not overflowing the collection title), mobile vertical
scroll reveals (figure + crest + garment line), keyboard `Enter` on a
focused world, `prefers-reduced-motion` branches in code (camera
parallax/dolly/character-turn fully disabled, hover/click still work). Not
yet tested on a real throttled/low-end mobile device — do that before
shipping (see `frontend-performance` guidance).
