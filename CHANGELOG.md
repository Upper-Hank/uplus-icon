# Changelog

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
