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
- **SHOULD** avoid duplicate part names; exceptions require selector and timing tests.

## Timing and transforms

Prefer transforms and opacity over continuous complex path rewrites. Origins, direction, and overshoot must match the represented object. Loops require an explicit stop condition and must not consume resources indefinitely in the background.

## Transitions

Each pair records start, end, part mapping, and incompatible fallback. If geometry cannot interpolate reliably, use a crossfade or discrete state change instead of generating an unreviewed compatibility path.

## Review matrix

Review normal playback, pause, reverse, rapid retriggering, light/dark themes, and reduced motion. The final state must match the static icon.
