---
slug: optical
order: 4
group: visual
title: Optical correction, spacing, and overlap
description: Visual centering, volume, negative space, and depth
locale: en
---

## Multi-size review

Small-size legibility is part of the visual review for every canonical SVG.

- **MUST** review the canonical SVG at `16 / 20 / 24 / 32px`.

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
