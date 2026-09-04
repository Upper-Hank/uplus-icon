# Changelog

## [0.1.0-beta.4] - 2026-09-04

### Added

- Four icons: `signpost`, `lifebuoy`, `fire`, and `droplet`.

### Changed

- Catalog now includes 320 icons.

## [0.1.0-beta.3] - 2026-09-04

### Added

- Five icons: `paste`, `marquee`, `screenshot`, `leaf`, and `exit`.
- `history` search alias for `clock`.

### Changed

- Catalog now includes 316 icons.

## [0.1.0-beta.2] - 2026-09-04

### Added

- Seven icons: `clipboard`, `folder-plus`, `inbox`, `pet`, `trophy`, `basketball`, and `setting-alt`.
- Deprecated compatibility for the `badge` public name and `BadgeIcon` export after renaming to `medal`.

### Changed

- Updated `file`, `folder`, and `pet` artwork from the approved design source.
- Moved `inbox` into the communication subgroup.
- Catalog now includes 311 icons.

## [0.1.0-beta.1] - 2026-08-15

### Added

- Four diagonal arrow icons: `arrow-top-left`, `arrow-top-right`, `arrow-bottom-left`, and `arrow-bottom-right`.
- `catalogOrder` metadata for recommended icon browsing order on the documentation site.

### Changed

- Realigned icon categories, subgroups, and default catalog ordering with the approved Figma taxonomy.
- Refined the `lightbulb` icon geometry.
- Extended absolute-weight support for numeric CSS pixel sizes from 0.5 to 8.

## [0.1.0-beta.0] - 2026-08-12

First public beta of Uplus Icon.

### Added

- Published `@uplus-icon/core` with framework-independent SVG definitions, metadata, and dynamic name-based access for 300 icons.
- Published `@uplus-icon/react` with named components, per-icon imports, and the explicit `dynamic` entry for data-driven interfaces.
- Added TypeScript types, standard SVG prop forwarding, `ref` support, accessible titles, and decorative defaults.
- Added the `weight` and `absoluteWeight` APIs while preserving the proportions and geometry of the protected SVG sources.
- Added bilingual documentation for browsing, searching, previewing, copying, and integrating icons.

### Packaging

- Added reproducible generation from the protected SVG source and metadata registry.
- Added real consumer-install, runtime, source-fidelity, tree-shaking, and per-icon size verification.
- Published Core and React only; Motion remains private and is not part of this release.
