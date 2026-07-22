---
slug: stroke
order: 5
group: visual
title: Strokes, caps, joins, and corners
description: Stroke scale, open ends, turns, and corner consistency
locale: en
---

## Stroke scale

Linear icons preserve real centerline strokes. The default approved width is `2`, and consumers may override it within `0.5–2`.

- **MUST** use one width for lines at the same visual hierarchy.
- **SHOULD** use `stroke-width="2"` as the approved-source default.
- **MAY** use another source width within `0.5–2` after visual review.
- **MUST NOT** overlap identical paths to fake local weight.
- **MUST NOT** outline the entire stroke system into broad fills merely for export.

## Open caps

- **SHOULD** use `stroke-linecap="round"` for clearly visible open ends.
- **MAY** use `butt` for cuts, container boundaries, or explicitly flat endings.
- **MAY** use `square` when a square construction requires it.
- **MUST** choose cap behavior for semantic reasons, not because of a design-tool default.

## Joins

- **SHOULD** use `stroke-linejoin="round"` for soft turns.
- **MAY** use `miter` for an intentional point after checking its length at small sizes.
- **MAY** use `bevel` for a deliberate cut corner.
- **MUST NOT** allow accidental miter spikes to leave the canvas or distort visual weight.

## Corner consistency

- **MUST** use consistent radii for corners with the same role inside one icon.
- **SHOULD** share a corner language across related containers, panels, and rectangular outlines.
- **MAY** optically correct for size differences without creating visible randomness.
- **MUST NOT** mix several nearly identical radii to imitate a hand-drawn effect.

## Scaling and runtime API

The generator binds approved `stroke-width` values to a CSS variable and keeps the source width as fallback.

```tsx
<CheckIcon size={24} strokeWidth={1.5} />
```

- **MUST** clamp consumer stroke width to `0.5–2`.
- **MUST** scale strokes with the SVG.
- **MUST NOT** use `vector-effect="non-scaling-stroke"`.
- **MUST NOT** let the runtime stroke API alter fill-only regions.

## Review checklist

- Inspect contours and gaps at `0.5`, `1`, `1.5`, and `2`.
- Confirm corners and caps do not become noise at 12px.
- Check adjacent segments for unwanted overlap from round caps.
