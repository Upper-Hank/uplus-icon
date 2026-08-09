# @uplus-icon/web

Native per-icon DOM factories for Uplus Icon.

```ts
import { CheckIcon } from '@uplus-icon/web'

document.body.append(CheckIcon({ size: 20, weight: 1.5, ariaLabel: 'Complete' }))
document.body.append(CheckIcon({ size: 48, weight: 1.5, absoluteWeight: true }))
```

The first public release exposes concrete per-icon factories only.

`weight` is clamped to `0.5–2` and defaults to `2`; strokes use `weight / 2` while supported solid details use the continuous `(weight + 1) / 3` scale. `absoluteWeight` applies `24 / size` to both mappings for numeric sizes; string sizes safely use relative weight.

See the [Uplus Icon repository](https://github.com/Upper-Hank/uplus-icon) for the full API and contribution rules.

## License

MIT
