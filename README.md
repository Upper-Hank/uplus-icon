<div align="center">

# Uplus Icon

A modern, open-source icon library for interfaces.

Consistent SVG icons, type-safe React components, and a focused browser for finding the right symbol quickly.

[![CI](https://github.com/Upper-Hank/uplus-icon/actions/workflows/ci.yml/badge.svg)](https://github.com/Upper-Hank/uplus-icon/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-111111.svg)](./LICENSE)
[![Status: Preview](https://img.shields.io/badge/status-preview-f59e0b.svg)](#project-status)

[中文文档](./README.zh-CN.md) · [Website (coming soon)](https://icon.upper.website) · [Report an issue](https://github.com/Upper-Hank/uplus-icon/issues)

</div>

## About

Uplus Icon is an open-source icon system for modern products. It brings carefully selected SVG assets, a small React API, searchable metadata, and a documentation site into one repository.

The project values clarity, visual consistency, accessibility, and predictable production behavior. Raw SVG assets are reviewed and supplied by the maintainer; the build pipeline reads them without rewriting their visual data.

## Features

- Modern, consistent SVG icons for user interfaces
- Type-safe React components with ref forwarding
- Static per-icon imports for small production bundles
- Dynamic rendering by a typed icon name
- Standard SVG props with source-faithful rendering
- Accessible decorative and labelled icon behavior
- Separate metadata for search, categories, tags, and aliases
- Light and dark documentation themes
- Open-source under the MIT License

## Project status

Uplus Icon is currently in preview. The icon set, package API, and website are under active development. The `uplus-icon` package is used internally and has not been published publicly to npm yet. The future documentation site will be available at `icon.upper.website`.

Until the first public release, install the repository locally for development:

```bash
git clone https://github.com/Upper-Hank/uplus-icon.git
cd uplus-icon
npm install
npm run build
```

The public package will use the following installation command when released:

```bash
npm install uplus-icon
```

## Usage

### React component

```tsx
import { SearchIcon } from 'uplus-icon'

export function SearchButton() {
  return (
    <button type="button">
      <SearchIcon size={20} />
      Search
    </button>
  )
}
```

### Per-icon import

Use the per-icon entry when you want the smallest explicit import path:

```tsx
import SearchIcon from 'uplus-icon/icons/search'

<SearchIcon size={24} />
```

### Dynamic icon

Use the dynamic component when an icon name comes from configuration or data:

```tsx
import { Icon, type IconName } from 'uplus-icon/dynamic'

const name: IconName = 'search'

<Icon name={name} size={24} />
```

Dynamic rendering includes the icon registry. Prefer static component imports for fixed application icons. Searchable catalog data is available separately from `uplus-icon/metadata` and does not contain SVG bodies.

## Props

Every icon accepts standard React SVG attributes in addition to the following props:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `number \| string` | `24` | Sets both width and height. |
| `title` | `string` | — | Adds an SVG title and exposes the icon as an image. |
| `color` | `string` | — | Standard SVG color prop; its effect follows the supplied SVG source. |
| `aria-label` | `string` | — | Gives a meaningful icon an accessible name. |

Refs are forwarded to the underlying `<svg>` element.

## Accessibility

Icons without `title` or `aria-label` are treated as decorative and receive `aria-hidden="true"`. If an icon carries meaning by itself, provide an accessible label:

```tsx
<SearchIcon aria-label="Search" />
```

When an icon appears beside visible button text, it should normally remain decorative.

## Repository

```text
uplus-icon/
├── apps/
│   └── site/                 Documentation and icon browser
├── packages/
│   └── icons/
│       ├── raw/              Maintainer-approved SVG sources (read-only)
│       ├── metadata/         Search and classification metadata
│       ├── scripts/          Code generation
│       └── src/              React runtime and generated components
├── .github/workflows/        Continuous integration
├── CONTRIBUTING.md
└── LICENSE
```

This is an npm workspaces monorepo. The website consumes the local icon package, so documentation and package behavior stay aligned.

## Development

Requirements: Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the documentation site. |
| `npm run generate` | Generate components from approved SVG sources. |
| `npm run typecheck` | Check the package and site with TypeScript. |
| `npm run build` | Build the package and documentation site. |
| `npm run check` | Run the complete CI validation. |

Generated files must not be edited manually. The generator may read from `packages/icons/raw`, but it must never write to or optimize those SVG files.

## Roadmap

- Expand the core interface icon set
- Add categories, aliases, and multilingual search metadata
- Improve the icon browser and copy workflows
- Add package tests and bundle-size budgets
- Publish `uplus-icon` to npm
- Launch the public documentation website
- Explore additional framework packages after the React API stabilizes

The roadmap intentionally prioritizes a small, dependable core over adding frameworks or variants prematurely.

## Contributing

Code, documentation, tests, and tooling contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Raw SVG files follow a stricter process: do not add, edit, redraw, optimize, or replace files in `packages/icons/raw` unless the maintainer has explicitly supplied or approved the final SVG. If an icon is missing or incorrect, open an issue first.

## License

The source code and icon assets are licensed under the [MIT License](./LICENSE).
