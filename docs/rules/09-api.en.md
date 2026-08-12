---
slug: api
order: 9
group: usage
title: Public API
description: Static and name-based rendering, sizing, weight, color, and accessibility
locale: en
---

## Rendering paths

Use named components for fixed UI and the explicit `dynamic` entry for data-driven names. Both paths resolve the same generated Core Definition. The static root and per-icon entries never import the full registry.

```tsx
import { CheckIcon } from '@uplus-icon/react'
import { Icon } from '@uplus-icon/react/dynamic'

<CheckIcon />
<Icon name="check" />
```

## Base API

```ts
type IconProps = {
  size?: number | string
  weight?: number
  absoluteWeight?: boolean
}
```

`size` defaults to `24` and changes only the rendered width and height.

## React public behavior

The React package exposes static icons, sizing, color, weight, accessibility, standard SVG attributes, and refs.

- **MUST** use component props, standard SVG props, and refs as the public runtime interface.
- **MUST NOT** expose private design sources, import scripts, or generation tools as user APIs.
- **MUST** keep name-based rendering under the explicit `dynamic` entry so static entries never carry the full registry implicitly.

## Weight

`weight` defaults to `2` and uses `strokeScale = weight ÷ 2`. Every source stroke width is multiplied by the same `strokeScale`, preserving internal ratios, while the paths, endpoints, and geometry of ordinary stroked `path` and `line` nodes never change. Solid circles and ellipses keep their centers while radii scale; solid rectangles keep their centers while dimensions and corner radii scale. To keep solid details legible while preserving continuous change, they use `solidScale = (weight + 1) ÷ 3`: weights `0.5`, `1`, `1.5`, and `2` map to `0.5`, `2/3`, `5/6`, and `1`. Complex solid paths remain unchanged and require explicit design review.

Only audited solid paths use the same `solidScale`: the `textarea` handle scales around `(19, 17)`, the `headset` dot around `(14, 19.5)`, and the three `qr-code` modules around their own centers. Their original `d` values stay intact; other solid paths do not inherit this rule.

`absoluteWeight` defaults to `false`. With a finite positive numeric `size`, the runtime separately calculates `strokeScale = (weight ÷ 2) × (24 ÷ size)` and `solidScale = ((weight + 1) ÷ 3) × (24 ÷ size)`. Strokes and supported solid details therefore keep their CSS-pixel sizes under their respective continuous mappings. String sizes such as `em`, `%`, and `calc()` cannot be resolved deterministically during SSR and therefore safely use relative weight.

- **MUST** clamp runtime `weight` to `0.5–2`; non-finite values fall back to `2`.
- **MUST** apply absolute weight to strokes and supported solid primitives together; it must never be a stroke-only `vector-effect` shortcut.
- **MUST NOT** select, generate, or mutate another source SVG because of size or weight props.

## Color and attributes

Strokes and limited solid details inherit `currentColor`. React accepts standard SVG attributes and refs. A per-icon import must not pull in the internal icon registry.

## Accessibility

Without a `title` or accessible name, icons default to `aria-hidden="true"`. Named graphics use `role="img"`. An icon-only button gets its action name from the button, not from the shape name.

## Compatibility

Named components and per-icon entry points render the same definition. New props require stable defaults so existing calls keep their output.
