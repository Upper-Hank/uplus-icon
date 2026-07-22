---
slug: canvas
order: 3
group: visual
title: The 24px canvas and coordinate system
description: Root canvas, target area, coordinate alignment, and boundaries
locale: en
---

## Root canvas

Every approved icon shares one coordinate space so replacement and alignment remain predictable.

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <!-- approved geometry -->
</svg>
```

- **MUST** use `width="24"`, `height="24"`, and `viewBox="0 0 24 24"`.
- **MUST** keep root `fill="none"` and express intentional fills on graphic elements.
- **MUST NOT** simulate the 24px canvas with another viewBox, a root transform, or clipping.

v1 uses one master. Rendering at 16, 20, 24, or 32px only scales the same 24×24 coordinate space.

- **MUST NOT** create size variants with 16×16, 20×20, or 32×32 viewBoxes.

## 20×20 target area

`x=2–22` and `y=2–22` define the default visual target area, not an inflexible hard boundary.

- **SHOULD** keep the main contour and visual mass inside the 20×20 target area.
- **MAY** let arrows, long lines, or optically corrected details extend beyond the target area.
- **MUST** keep final outer edges, including stroke thickness, inside the 24×24 canvas.
- **MUST NOT** rely on browser clipping to hide overflow.

## Coordinate alignment

- **SHOULD** place key horizontal lines, vertical lines, circle centers, and symmetry axes on integer or half-integer coordinates.
- **SHOULD** review crispness with the real stroke width, not only the path centerline.
- **MAY** keep necessary decimals for curve handles and optical correction.
- **MUST NOT** damage arcs, curvature, or visual balance merely to force integer coordinates.
- **MUST NOT** preserve long, meaningless decimal output from design tools.

## Boundaries and cleanup

- **MUST** remove zero-length paths, invisible nodes, off-canvas nodes, and duplicate segments.
- **MUST** confirm rotated geometry and strokes remain inside the canvas.
- **SHOULD** keep occupied area and outer whitespace comparable across related icons.
- **MAY** preserve a simple rotation when it is necessary to the final shape.

## Preview method

The site uses a real 24×24 SVG grid. Enlargement changes display size without changing geometry. Review both grid alignment and the complete silhouette with the grid hidden.
