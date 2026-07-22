---
slug: web
order: 11
group: usage
title: Web usage
description: Native DOM factories, dynamic names, and custom elements
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
  strokeWidth: 1.5,
  ariaLabel: 'Complete',
})

document.body.append(icon)
```

Factories return real `SVGSVGElement` instances for native pages and applications without React.

- **MUST** use a concrete icon factory for a fixed name.
- **MAY** pass additional standard SVG attributes through `attributes`.
- **MUST NOT** register a global custom element from a regular per-icon entry.

## Dynamic names

Use dynamic `Icon` when a name comes from configuration or data. It carries the complete registry, so accept the bundle cost explicitly.

## Web Component

```html
<script type="module">
  import '@uplus-icon/web/element'
</script>

<uplus-icon
  name="check"
  size="24"
  stroke-width="1.5"
  aria-label="Complete"
></uplus-icon>
```

- **MUST** register the default custom element only through `@uplus-icon/web/element`.
- **MAY** call `registerIconElement()` to define another tag name.
- **MUST** rerender when `name`, `size`, `stroke-width`, `absolute-stroke-width`, `title`, or `aria-label` changes.

## Factory options

See the [Public API](/docs/api) for cross-framework defaults. v1 uses one `24×24` master and has no optical-size option.

| Option | Type | Purpose |
| --- | --- | --- |
| `size` | `number \| string` | Sets width and height |
| `strokeWidth` | `number` | Clamped to `0.5–2` |
| `absoluteStrokeWidth` | `boolean` | Keeps a CSS-pixel stroke |
| `title` | `string` | Creates a title node |
| `ariaLabel` | `string` | Provides an accessible name |
| `className` | `string` | Sets the SVG class |
| `attributes` | `Record` | Adds standard SVG attributes |

## Accessibility and side effects

- **MUST** default icons without title or label to `aria-hidden="true"`.
- **MUST** give SVGs with `title` or `ariaLabel` the `img` role.
- **SHOULD** import the element side-effect entry only when a Web Component is actually used.
