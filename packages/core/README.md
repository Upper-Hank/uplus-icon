# @uplus-icon/core

Framework-independent icon definitions, names, categories, and searchable metadata for Uplus Icon.

```ts
import type { IconName } from '@uplus-icon/core'
import { iconMeta } from '@uplus-icon/core/metadata'
import { iconDefinitions } from '@uplus-icon/core/dynamic'
import check from '@uplus-icon/core/icons/check'
```

Use the per-icon entry when an application needs one SVG definition. The `metadata` entry contains searchable catalog data without SVG bodies. The explicit `dynamic` entry contains the complete definition registry for name-based interfaces.

See the [Uplus Icon repository](https://github.com/Upper-Hank/uplus-icon) for documentation, contribution rules, and source files.

## License

MIT
