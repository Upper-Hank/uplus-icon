---
slug: motion-api
order: 12
group: motion
title: Motion public API
description: Separate package, capability declarations, animation tiers, and fallback contracts
locale: en
---

## Product boundary

Motion is an independently released, optional product layer. Static packages do not depend on its runtime and do not promise that an already rendered static SVG can be enhanced afterward.

- **MUST** share canonical SVG geometry with the static build.
- **MUST** centralize implementations while metadata declares capabilities only.
- **MUST NOT** charge static consumers for Motion code or metadata.

## Animation capabilities

Generic presentation capability IDs include `draw`, `fade`, `blur`, and `scale`; enter or exit direction is an independent API option. Semantic motion is opt-in, such as `bell:ring`, `heart:beat`, or `refresh:rotate`. Transitions are designed icon pairs; arbitrary morphing is not a product promise.

## API behavior

Unknown or unsupported animation names produce a diagnosable result and never silently substitute another meaning. Duration, easing, repetition, and playback controls remain orthogonal, with package-level defaults.

## Reduced motion

The API must honor `prefers-reduced-motion`. Presentation motion falls back to an instant state or brief opacity change, decorative loops stop, and semantic transitions preserve the final state.
