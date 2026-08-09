# @uplus-icon/react

Type-safe React components for Uplus Icon.

```tsx
import { CheckIcon } from '@uplus-icon/react'

<CheckIcon size={20} weight={1.5} aria-label="Complete" />
<CheckIcon size={48} weight={1.5} absoluteWeight />
```

For the smallest explicit import path:

```tsx
import CheckIcon from '@uplus-icon/react/icons/check'
```

The first public release exposes named and per-icon static components only.

`weight` is clamped to `0.5–2` and defaults to `2`; strokes use `weight / 2` while supported solid details use the continuous `(weight + 1) / 3` scale. `absoluteWeight` applies `24 / size` to both mappings for numeric sizes; string sizes safely use relative weight.

See the [Uplus Icon repository](https://github.com/Upper-Hank/uplus-icon) for the full API, accessibility guidance, and contribution rules.

## License

MIT
