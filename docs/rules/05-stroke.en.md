---
slug: stroke
order: 5
group: visual
title: Strokes, caps, joins, and corners
description: Stroke scale, open ends, turns, and corner consistency
locale: en
---

## Stroke scale

Linear icons preserve real centerline strokes. The default approved width is `2`; consumers adjust whole-icon weight proportionally within `0.5–2`.

- **MUST** use one width for lines at the same visual hierarchy.
- **SHOULD** use `stroke-width="2"` as the approved-source default.
- **MAY** use another source width within `0.5–2` after visual review.
- **MUST NOT** overlap identical paths to fake local weight.
- **MUST NOT** outline the entire stroke system into broad fills merely for export.

## Stroke alignment

Approved SVGs use centered strokes by default: the path is the stroke centerline and the width is distributed equally on both sides.

- **SHOULD** prefer centered strokes so open linework, closed contours, and runtime width changes remain consistent and predictable.
- **MAY** use inside or outside alignment when required to hold an outer dimension, protect interior negative space, express occlusion, or apply a necessary optical correction.
- **MUST** express inside or outside alignment through owner-approved final path placement or geometry. Sources must not depend on the inconsistently supported `stroke-alignment` property, and generators must never offset paths automatically.
- **MAY** use `fill` to freeze a contour when a real stroke cannot express the required inside or outside boundary reliably and accurately, while preserving fixed `black`, a transparent background, and the approved visual weight in the design source; the private adapter converts release definitions to `currentColor`.
- **MUST** review alignment at the approved source width. After a runtime `weight` change, inside and outside edges may move around the centerline and are not guaranteed to remain locked to one boundary.

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

## Weight and runtime API

The runtime derives artwork weight from the approved master with `scale = weight ÷ 2`.

```tsx
<CheckIcon size={24} weight={1.5} />
```

- **MUST** clamp relative consumer weight to `0.5–2`; numeric-size absolute weight may extend to `8px`.
- **MUST** multiply every source stroke width by the same scale so local ratios remain intact.
- **MUST** scale solid circles, ellipses, and rectangles around their centers, including their corner radii.
- **MUST NOT** deform solid paths or other complex fill geometry automatically; list them for design review.
- **MUST NOT** use `vector-effect="non-scaling-stroke"`.
- **MUST** implement `absoluteWeight` by scaling strokes and supported solid primitives together; numeric sizes use `24 ÷ size`, while string sizes fall back to relative weight.

## Review checklist

- Inspect contours and gaps at `0.5`, `1`, `1.5`, and `2`.
- Confirm corners and caps do not become noise at 12px.
- Check adjacent segments for unwanted overlap from round caps.
