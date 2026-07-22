---
slug: react
order: 10
group: usage
title: React usage
description: Named components, dynamic rendering, stroke width, types, and accessibility
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
<CheckIcon color="currentColor" strokeWidth={1.5} />
```

- **MUST** use a named component or per-icon path for a fixed icon.
- **SHOULD** let parent CSS `color` control icon color.
- **MUST NOT** import the complete dynamic registry for one fixed icon.

## Dynamic names

```tsx
import { Icon, type IconName } from '@uplus-icon/react/dynamic'

const name: IconName = 'check'
<Icon name={name} size={24} />
```

The dynamic entry is for names supplied by configuration, APIs, or user data. It includes the complete icon definition registry.

## Public props

See the [Public API](/docs/api) for cross-framework defaults. v1 uses one `24×24` master and has no `opticalSize` prop.

| Prop | Type | Default | Behavior |
| --- | --- | --- | --- |
| `size` | `number \| string` | `24` | Sets width and height |
| `strokeWidth` | `number` | SVG source | Clamped to `0.5–2` |
| `absoluteStrokeWidth` | `boolean` | `false` | Keeps a CSS-pixel stroke instead of scaling with size |
| `color` | `string` | inherited | Controls currentColor artwork |
| `title` | `string` | — | Adds an SVG title and image semantics |
| `ref` | `SVGSVGElement` | — | Forwards to the root SVG |

Fill-only icons do not change with `strokeWidth`. Omitting it preserves the source default; absolute stroke uses `non-scaling-stroke`.

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
