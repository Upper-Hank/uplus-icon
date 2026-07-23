---
slug: api
order: 9
group: usage
title: Static public API
description: Sizing, stroke modes, color, and cross-runtime parity
locale: en
---

## v1 API

```ts
type IconProps = {
  size?: number | string
  strokeWidth?: number
  absoluteStrokeWidth?: boolean
}
```

`size` defaults to `24` and changes only the rendered width and height.

## Stroke modes

The default `strokeWidth=2` comes from the canonical SVG and scales with its 24px master: `rendered stroke = strokeWidth × size ÷ 24`. With `absoluteStrokeWidth`, the browser uses `non-scaling-stroke`, keeping the result in CSS pixels.

- **MUST** keep React, the Web factory, and the Web Component behavior aligned.
- **MUST** clamp runtime `strokeWidth` to `0.5–2`; non-finite values fall back to `2`.
- **MUST NOT** select, generate, or mutate another SVG because of size or stroke props.

## Color and attributes

Strokes and limited solid details inherit `currentColor`. React accepts standard SVG attributes and refs; the Web factory accepts an explicit attribute map. A per-icon import must not pull in the dynamic icon registry.

## Accessibility

Without a `title` or accessible name, icons default to `aria-hidden="true"`. Named graphics use `role="img"`. An icon-only button gets its action name from the button, not from the shape name.

## Compatibility

Named components, `Icon(name)`, per-icon entry points, and the Web Component render the same definition. New props require stable defaults so existing calls keep their output.
