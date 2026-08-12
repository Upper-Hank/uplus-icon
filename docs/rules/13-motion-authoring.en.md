---
slug: motion-authoring
order: 13
group: motion
title: Motion authoring
description: Whole-icon rules, data-part semantics, timing, capability registration, and motion review
locale: en
---

## Semantic parts

All initial rules target the complete SVG and require no `data-part`. Motion depends on stable `data-part` values only when a future rule genuinely moves an internal part independently. Part names use kebab-case, never global `id`, and describe structural roles such as `body`, `handle`, or `indicator`, not one animation.

- **MUST** preserve path order, layering, and part relationships.
- **MUST NOT** rename, split, or merge parts in a non-breaking release.
- **MUST** keep every part name unique within one icon so selectors and timing remain unambiguous.

`data-part` is a structural contract in the canonical SVG. `parts` is the matching validation list in `icons.json`. Prefer placing `data-part` on a `g` that contains the complete part; a single-element part may place it directly on a `path` or another graphic element. Every name must be unique within one icon.

```svg
<g data-part="body">...</g>
<path data-part="indicator" d="..." />
```

Whole-icon motion needs no part marker. Add `data-part` only when a portion needs independent movement or timing, or participates in an approved transition mapping. Adding, removing, or changing these markers on an approved SVG remains a raw asset change and requires explicit authorization for that file.

## Timing and transforms

Prefer transforms and opacity over continuous complex path rewrites. Origins, direction, and overshoot must match the represented object. Loops require an explicit stop condition and must not consume resources indefinitely in the background.

Generic `fade`, `scale`, and `blur` capabilities are global rules and are not implemented per icon. Enter or exit direction is a Motion API option. Semantic capability IDs must be registered in both metadata and the Motion rule map, such as `bell:ring`, `heart:beat`, and `refresh:rotate`. Keyframes, duration, easing, and selectors live only in the Motion package.

Adding a semantic rule requires its implementation, metadata declaration, type-map entry, English and Chinese rule documentation, site selector exposure, and tests. A partial addition is not publishable.

## Transitions

Each pair records start, end, part mapping, and incompatible fallback. If geometry cannot interpolate reliably, use a crossfade or discrete state change instead of generating an unreviewed compatibility path.

## Review matrix

Review normal playback, pause, reverse, rapid retriggering, loop cleanup, unmount cleanup, light/dark themes, and reduced motion. The final state must match the static icon, and the site preview must use the public Motion package rather than a private implementation.
