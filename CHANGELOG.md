# Changelog

## [Unreleased]

### Added

- Added a bilingual changelog page to the documentation website.
- Added an optional 20×20 design-guide inspection layer without automatic alignment validation.

### Changed

- Limited the first public package API to named and per-icon static entries.
- Aligned the documentation navigation to a shared horizontal spacing baseline.
- Changed the desktop detail preview to a fixed-height square canvas with a wider control area.
- Moved inspection-layer controls into the preview canvas and aligned the absolute-weight switch with the standard control spacing.
- Set the master preview and actual-size upper bound to 256px, and fixed the code panel peeking after width changes.

### Known issues

- Responsive behavior is being rebuilt for narrow mobile, mobile, tablet, and desktop layouts.

## [0.1.0-dev.1] - 2026-07-23

Development preview. This snapshot has not been published to npm.

### Added

- Added searchable flat and grouped icon browsing.
- Added a bottom detail drawer with master and actual-size inspection modes, grid and skeleton overlays, rendering controls, and synchronized React, SVG, and Web Component snippets.
- Added bilingual design-rule documentation and a shared metadata-driven category system.
- Added framework-independent Core, React, and Web packages generated from the same protected SVG sources.

### Changed

- Rebuilt the documentation and showcase website around the current Uplus visual language.
- Reworked package boundaries so metadata, definitions, React components, and Web Components can be consumed independently.

### Fixed

- Fixed documentation navigation scrolling, sticky toolbar behavior, drawer transitions, and multiple control interaction states.

### Known issues

- The website still needs a complete responsive-layout pass before it can be considered production-ready.
