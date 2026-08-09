---
slug: workflow
order: 8
group: governance
title: Asset import, review, generation, and release
description: The complete path from mature SVG to public packages
locale: en
---

## Before import

- **MUST** receive a mature SVG from the maintainer or gain explicit approval.
- **MUST** clean backgrounds, guides, non-`black`/`none` paint values, and complex structure outside the repository.
- **MUST** confirm filename and metadata semantics are accurate.
- **MUST NOT** place drafts, screenshot reconstructions, or unapproved design exports in raw.

The library accepts one `24×24` canonical SVG per name.

- **MUST** receive separate maintainer approval for every canonical SVG.
- **MUST NOT** copy or automatically derive another approved asset from an existing file.

## Acceptance review

Review combines structural and visual checks:

1. Verify the 24×24 root canvas and transparent background.
2. Inspect the 20×20 target area, stroke extents, and coordinate alignment.
3. Review the same canonical SVG at 16/20/24/32px.
4. Compare visual weight, corners, and negative space with icons in the same category.
5. Confirm metadata, categories, tags, and aliases are complete.

- **MUST** stop import and request a new file when structure cannot be resolved without visual change.
- **MUST NOT** auto-fix maintainer-approved artwork merely to pass generation.

## Generation boundary

The generator reads approved sources and produces:

```text
@uplus-icon/core
@uplus-icon/react
@uplus-icon/web
```

- **MUST** make every package share the same Core Definition.
- **MUST** separate protected fixed-black design sources from adapted release definitions; color adaptation may only replace the value `black` with `currentColor`.
- **MUST** keep color adaptation reproducible and prove through fidelity tests that it changes no other content.
- **MUST** keep output stable, reproducible, and free of manual patches.
- **MUST** make every package consume the same canonical definition.
- **MUST NOT** generate or modify source SVG files from a framework package.
- **MUST NOT** synthesize additional approved assets.
- **MUST NOT** create a second manually maintained release SVG set.

## Bundles and compatibility

- **MUST** preserve a true per-icon entry for every icon.
- **MUST** keep each per-icon entry limited to its definition and runtime.
- **SHOULD** use named components or per-icon paths for fixed-name consumers.
- **MUST NOT** expose the complete icon registry from a first-release package entry.
- **MUST** assess renames, removals, and type changes as public API changes.
- **MUST NOT** include the complete icon set when a consumer imports one icon.

## Change verification

```bash
npm run generate
npm run typecheck
npm run build
npm run check
```

At minimum:

- **MUST** pass SVG structure, metadata, and generated-count checks.
- **MUST** build Core, React, Web, and the site.
- **MUST** pass SVG fidelity, per-icon size, and installed-consumer tests.
- **MUST** confirm generation did not write to unauthorized raw SVG files.
- **SHOULD** review icon details, themes, grid, size, and stroke controls in a browser.

## Release

- **MUST** document public APIs, new assets, deprecations, and migration guidance.
- **SHOULD** release package versions, generated output, and documentation in one change.
- **MUST NOT** publish assets that are ungenerated, unverified, or inconsistent with metadata.
