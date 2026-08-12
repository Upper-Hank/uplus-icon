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
- **MAY** use fill for solid dots, play triangles, state surfaces, necessary closed regions, and inside or outside stroke contours that cannot be expressed reliably with a real stroke.
- **SHOULD** keep filled and stroked regions visually comparable in weight.
- **MUST NOT** outline the whole stroke system merely to reduce nodes or simplify export.

## Color

- **MUST** use only fixed `black` and `none` for monochrome artwork in the protected design source.
- **MUST** deterministically replace the attribute value `black` with `currentColor` in the private adaptation step while preserving `none`.
- **MUST NOT** let color adaptation change paths, coordinates, dimensions, viewBox, stroke widths, corners, node order, or any other visual or structural content.
- **MUST** make Core, React, and the site consume only adapted `currentColor` definitions so icons inherit CSS `color` by default and remain overridable through the standard `color` property.
- **MUST NOT** maintain a second manually edited set of release SVGs; adapted output must remain reproducible generated data.
- **MUST** keep the root SVG background transparent.
- **MUST NOT** use white, hex, RGB, gradients, `currentColor`, or palette references in design sources.
- **MUST NOT** embed images, fonts, or external color resources.

## Allowed elements

```text
g path circle ellipse rect line polyline polygon
```

- **SHOULD** prefer `path` for finalized geometry, especially rounded rectangles, circles, and compound contours converted by design tools, to reduce differences in how primitive parameters are interpreted across export pipelines and rendering implementations.
- **MAY** retain `circle`, `ellipse`, `rect`, `line`, `polyline`, and `polygon` when the owner has confirmed consistent rendering across target environments; they are allowed exceptions rather than the default export form.
- **MUST** preserve the approved dimensions, corners, coordinates, strokes, and visual result when geometry is converted to `path`; generators must never perform or recalculate this conversion automatically.
- **MUST NOT** use path preference as a reason to outline natural linework into filled contours. Converting a geometry element and outlining a stroke are different operations.
- **MAY** preserve necessary `fill-rule`, `opacity`, and simple rotations.
- **SHOULD** remove meaningless nested groups, empty elements, and design-tool layer structure.
- **MUST NOT** use `text`, `image`, `use`, `foreignObject`, or embedded content.

## Path merging and splitting

Minimum node count is not an authoring goal, and an icon is not required to use one combined `path`. Visual structure defines the split boundaries.

- **MUST** preserve separate elements when they need independent stroke, fill, opacity, transform, or animation timing.
- **MUST** preserve different semantic parts as separate elements or groups; paths must not be merged across part boundaries merely to reduce nodes.
- **SHOULD** keep one continuous stroke in one element and avoid fragmentation without semantic value.
- **MAY** merge geometry within one part when paint attributes match and it will always move together; merging must preserve appearance, subpath direction, and fill rules.
- **MUST NOT** let generators merge, split, or reorder owner-approved nodes.

The default is “split by semantic part, keep each part simple.” Draw animations require independently controllable continuous strokes. Whole-icon fades, scales, and rotations do not require extra path splitting.

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
