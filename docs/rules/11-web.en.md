---
slug: web
order: 11
group: usage
title: Web usage
description: Static per-icon DOM factories and accessibility
locale: en
---

## Install

```bash
npm install @uplus-icon/web
```

## Per-icon DOM factory

```ts
import { CheckIcon } from '@uplus-icon/web'

const icon = CheckIcon({
  size: 24,
  weight: 1.5,
  ariaLabel: 'Complete',
})

document.body.append(icon)
```

Factories return real `SVGSVGElement` instances for native pages and applications without React.

- **MUST** use a concrete icon factory for a fixed name.
- **MAY** pass additional standard SVG attributes through `attributes`.
- **MUST NOT** include a full icon registry or register global elements from a public v1 entry.

The first public release exposes concrete per-icon factories only.

## Factory options

See the [Public API](/docs/api) for cross-framework defaults.

DOM options and `attributes` are the idiomatic native-Web expression of the shared public capability set, not Web-only icon capabilities. Equivalent behavior must remain expressible through React props and standard SVG attributes.

| Option | Type | Purpose |
| --- | --- | --- |
| `size` | `number \| string` | Sets width and height |
| `weight` | `number` | Proportional artwork weight, clamped to `0.5–2` |
| `absoluteWeight` | `boolean` | Keeps CSS-pixel weight for numeric sizes; string sizes use relative weight |
| `title` | `string` | Creates a title node |
| `ariaLabel` | `string` | Provides an accessible name |
| `className` | `string` | Sets the SVG class |
| `attributes` | `Record` | Adds standard SVG attributes |

## Accessibility

- **MUST** default icons without title or label to `aria-hidden="true"`.
- **MUST** give SVGs with `title` or `ariaLabel` the `img` role.
