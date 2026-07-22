---
slug: svg
order: 6
group: visual
title: Fill, color, SVG structure, and export
description: Allowed elements, compound geometry, cleanup, and rejected content
locale: en
---

## Boundary between stroke and fill

Linear does not mean fill is completely forbidden. Dots, states, solid closed regions, and areas that genuinely communicate through mass may use fill.

- **MUST** prefer real strokes for naturally linear contours.
- **MAY** use fill for solid dots, play triangles, state surfaces, and necessary closed regions.
- **SHOULD** keep filled and stroked regions visually comparable in weight.
- **MUST NOT** outline the whole stroke system merely to reduce nodes or simplify export.

## Color

- **MUST** use only `currentColor` and `none` for monochrome artwork.
- **MUST** keep the root SVG background transparent.
- **MUST NOT** use fixed black, white, hex, RGB, gradients, or palette references.
- **MUST NOT** embed images, fonts, or external color resources.

## Allowed elements

```text
g path circle ellipse rect line polyline polygon
```

- **MUST** construct final geometry from basic graphic elements.
- **MAY** preserve necessary `fill-rule`, `opacity`, and simple rotations.
- **SHOULD** remove meaningless nested groups, empty elements, and design-tool layer structure.
- **MUST NOT** use `text`, `image`, `use`, `foreignObject`, or embedded content.

## Boolean and compound geometry

- **MAY** preserve boolean results already baked into normal paths.
- **MAY** use `fill-rule` for stable compound paths and holes.
- **SHOULD** resolve simple masks or full-canvas clips into equivalent basic geometry before approval.
- **MUST NOT** depend on runtime `mask`, `clipPath`, `filter`, or `defs` in approved sources.
- **MUST** stop import and request a mature SVG when complex structure cannot be removed without visual change.

## Transform

- **MAY** preserve a simple rotation genuinely required by final geometry.
- **SHOULD** reduce meaningless transform chains and nested coordinate systems without changing artwork.
- **MUST NOT** let automation rewrite or recalculate maintainer-approved transforms.

## Export cleanup

Complete this cleanup before a file enters raw:

- **MUST** remove background rectangles, grids, guides, center lines, diagonals, safe areas, and comments.
- **MUST** remove scripts, event attributes, URLs, data URIs, and external references.
- **MUST** remove invisible elements, duplicate nodes, and design-tool metadata.
- **MUST NOT** let the generator auto-fix an invalid SVG; it only rejects and reports.
