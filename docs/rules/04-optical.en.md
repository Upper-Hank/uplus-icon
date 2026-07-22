---
slug: optical
order: 4
group: visual
title: Optical correction, spacing, and overlap
description: Visual centering, volume, negative space, and depth in the single-master system
locale: en
---

## v1 boundary

Uplus Icon v1 maintains one `24×24` canonical SVG per icon. It does not expose a `small / medium / large / auto` optical-size API. Small-size legibility is validated against the same master instead of switching assets at runtime.

- **MUST** review the same master at `16 / 20 / 24 / 32px`.
- **MUST NOT** copy or derive SVGs to complete a size matrix.
- **MAY** discuss multiple optical masters as a future proposal, but not as a v1 commitment.

## Visual volume and centering

Keylines and geometric centers are starting points. Circles, triangles, arrow tips, and diagonals may overshoot slightly. Play symbols, arrows, and asymmetric objects may move away from the mathematical center.

- **SHOULD** use side-by-side review and a blur test to judge weight.
- **MUST** keep related icons close in outer whitespace, ink, and negative space.
- **MUST NOT** add meaningless nodes or duplicate strokes to fake visual weight.

## Spacing and negative space

There is no universal minimum gap. Parallel lines, container interiors, modifiers, overlapping contours, and status dots are reviewed by pattern. Default stroke `2` is the quality baseline; the public `0.5–2` range is checked for obvious collapse.

## Intersections and occlusion

Paths intersect directly on one plane by default. Add a gap only when semantics require depth, using the current main stroke width as the initial reference. Do not use masks, clips, or runtime cropping to conceal invalid geometry.

## Consistent viewpoint

Related files, devices, and containers use the same viewpoint. Rotate the base structure first for directional variants, then apply a reviewed optical correction. The corrected result remains an independently approved canonical SVG.
