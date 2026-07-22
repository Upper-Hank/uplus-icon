---
slug: principles
order: 1
group: foundations
title: System principles and sources of truth
description: Boundaries for artwork, semantics, generated output, and ownership
locale: en
---

## System goal

Uplus Icon is a linear icon system for product interfaces. It must preserve visual consistency, asset traceability, stable public APIs, and efficient per-icon consumption.

- **MUST** treat the maintainer-approved single `24×24` canonical SVG at `packages/icons/raw/<name>.svg` as the sole v1 visual source.
- **MUST** keep categories, tags, aliases, and release status in `packages/icons/metadata`, never inside SVG files.
- **SHOULD** prefer simple, reproducible engineering that the build can verify.
- **MAY** add framework packages when a real consumer requires them, but every package must consume the same Core Definition.
- **MUST NOT** maintain a second hand-copied artwork set in the site, React package, or Web package.

## Rule levels

| Level | Meaning |
| --- | --- |
| **MUST** | The asset or change cannot merge when the rule is unmet. |
| **SHOULD** | Follow by default; deviations need an explicit, reviewable reason. |
| **MAY** | Allowed when no other rule is broken. |
| **MUST NOT** | Never allowed in approved sources or public output. |

## Three kinds of truth

### Visual source

Approved SVG files define paths, coordinates, strokes, fills, corners, and node order. In v1, every icon has one `24×24` canonical SVG and no optical-size matrix. The generator may read and compile these files but must never write them back or derive another asset.

### Semantic source

Metadata defines names, titles, categories, tags, aliases, deprecation, and version information. Site search and grouping must consume that data.

### Generated output

`packages/*/src/generated` and `dist` are reproducible results, not authoring surfaces.

- **MUST** change a source or generator to change generated output.
- **MUST NOT** patch generated or dist files merely to satisfy a test.

## Raw SVG protection

- **MUST** receive explicit maintainer approval for additions, replacements, and visual fixes.
- **MUST** report the exact file and failure when an approved source is inconsistent or cannot build.
- **MUST NOT** automatically optimize, format, redraw, or overwrite approved SVG files.
- **MUST NOT** create approved assets from screenshots, another icon library, or subjective reconstruction.
- **MUST NOT** let generation, testing, or documentation tools write back into raw.

## Data flow

```text
approved SVG + metadata
  → validation
  → @uplus-icon/core
  → @uplus-icon/react / @uplus-icon/web
  → documentation / product code
```

Each layer has one responsibility: sources state facts, the generator validates and compiles, runtimes expose consumption APIs, and the site provides discovery and guidance.
