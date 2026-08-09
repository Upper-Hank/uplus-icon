---
slug: motion-authoring
order: 13
group: motion
title: Motion authoring
description: data-part semantics, timing, transition pairs, and motion review
locale: en
---

## Semantic parts

Motion builds depend on stable kebab-case `data-part` values and never global `id` attributes. Parts describe structural roles such as `body`, `handle`, or `indicator`, not a particular animation.

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

Generic metadata uses base capability IDs: `fade`, `scale`, `blur`, and `draw`. Enter or exit direction is a Motion API option rather than a duplicated capability. Semantic motion uses stable action IDs such as `ring`, `beat`, and `rotate`. Keyframes, duration, easing, and selectors live only in the Motion package.

## Transitions

Each pair records start, end, part mapping, and incompatible fallback. If geometry cannot interpolate reliably, use a crossfade or discrete state change instead of generating an unreviewed compatibility path.

## Review matrix

Review normal playback, pause, reverse, rapid retriggering, light/dark themes, and reduced motion. The final state must match the static icon.
