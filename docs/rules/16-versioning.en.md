---
slug: versioning
order: 16
group: governance
title: Versioning and deprecation
description: Breaking changes, alias migration, part stability, and version records
locale: en
---

## Compatibility unit

Package SemVer is the release contract. Per-icon `publishedIn`, `updatedIn`, and deprecation status provide traceability, and visual corrections remain visible in the changelog.

## Breaking changes

A major release or explicit compatibility layer is required to remove or rename exports, change a canonical name without an alias, remove or rename `data-part`, break Motion part mappings, or narrow an existing prop input.

## Deprecation process

- **MUST** state a reason, replacement, and expected removal version.
- **SHOULD** retain deprecated behavior for at least one minor cycle.
- **MUST NOT** turn search aliases into undeclared code exports automatically.

Category, tag, and description updates are normally non-breaking, but changing the primary category affects navigation and belongs in the changelog. Security and accessibility fixes may accelerate migration with an explicit impact note.
