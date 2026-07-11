# Uplus Icon

Uplus Icon is a small React icon library and its documentation site.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The icon package is built to `packages/icons/dist` and the site to `apps/site/dist`.

## Package usage

```tsx
import { Icon, SearchIcon } from '@uplus/icons'

<SearchIcon size={24} />
<Icon name="search" size={24} />
```

All icons inherit `currentColor` and accept standard SVG attributes.
