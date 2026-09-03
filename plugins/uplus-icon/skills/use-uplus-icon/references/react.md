# React integration

Use the public `@uplus-icon/react` exports and preserve the consumer project's conventions.

## Choose an import

For ordinary fixed UI, prefer a named import:

```tsx
import { CheckIcon } from '@uplus-icon/react'

<CheckIcon size={20} weight={1.5} />
```

Use the per-icon path when the project requires the smallest explicit module boundary:

```tsx
import CheckIcon from '@uplus-icon/react/icons/check'
```

Use the dynamic registry only when the icon name is genuinely data-driven:

```tsx
import { Icon } from '@uplus-icon/react/dynamic'
import type { IconName } from '@uplus-icon/react'

const name: IconName = 'check'
<Icon name={name} />
```

The dynamic entry includes the complete definition registry. Do not use it for fixed interface icons.

## Props

- Pass standard SVG props such as `className`, `style`, `color`, and event handlers normally.
- `size` accepts a number or string and defaults to `24`.
- `weight` defaults to `2` and is clamped to `0.5–2` in relative mode.
- With numeric `size`, `absoluteWeight` interprets `weight` as CSS-pixel visual weight and supports `0.5–8`.
- With string `size`, `absoluteWeight` safely falls back to relative weight.
- Icons inherit `currentColor`; prefer the surrounding component's color system over hard-coded inline colors.

Do not set `strokeWidth` directly. Use the public `weight` API so mixed stroke and supported solid details stay visually coordinated.
