---
slug: react
order: 10
group: usage
title: React usage
description: Named components, per-icon imports, weight, types, and accessibility
locale: en
---

## Install

```bash
npm install @uplus-icon/react
```

## Named components

Use named components for fixed icons to get autocomplete, type checks, and tree-shaking.

```tsx
import { CheckIcon } from '@uplus-icon/react'

<CheckIcon size={24} />
<CheckIcon color="currentColor" weight={1.5} />
```

- **MUST** use a named component or per-icon path for a fixed icon.
- **SHOULD** let parent CSS `color` control icon color.
- **MUST NOT** include the complete icon registry in a static icon import.

## Per-icon imports

```tsx
import CheckIcon from '@uplus-icon/react/icons/check'

<CheckIcon size={24} />
```

## Name-based rendering

Use the explicit dynamic entry when an icon name comes from navigation data, configuration, CMS content, or another runtime source.

```tsx
import { Icon } from '@uplus-icon/react/dynamic'

<Icon name="check" size={24} />
```

`name` is typed as `IconName`. This entry contains the complete definition registry, so fixed UI must continue to use a named component or per-icon import.

## Public props

See the [Public API](/docs/api) for shared defaults. v1 uses one `24×24` master and has no `opticalSize` prop.

React props, standard SVG attributes, and refs form the public rendering interface.

| Prop | Type | Default | Behavior |
| --- | --- | --- | --- |
| `size` | `number \| string` | `24` | Sets width and height |
| `weight` | `number` | `2` | Proportional artwork weight, clamped to `0.5–2` |
| `absoluteWeight` | `boolean` | `false` | Keeps CSS-pixel weight for numeric sizes; string sizes use relative weight |
| `color` | `string` | inherited | Controls currentColor artwork |
| `title` | `string` | — | Adds an SVG title and image semantics |
| `ref` | `SVGSVGElement` | — | Forwards to the root SVG |

Weight preserves source stroke ratios and scales supported solid primitives continuously around their centers using `(weight + 1) ÷ 3`. Complex filled paths are not deformed automatically. Omitting `weight` renders the approved master at weight `2`. Absolute weight adjusts strokes and supported solid geometry separately for numeric sizes.

## Accessibility

- **MUST** leave purely decorative icons without semantics; components default to `aria-hidden="true"`.
- **MUST** provide `aria-label` or `title` when an icon carries meaning by itself.
- **SHOULD** avoid a duplicate label when a button already has visible text.

```tsx
<CheckIcon aria-label="Complete" />

<button type="button">
  <CheckIcon />
  Complete
</button>
```

## Server rendering

Components do not read browser dimensions or DOM state, so they are safe for server rendering. Graphic bodies are generated at build time and are not reparsed or optimized on the client.
