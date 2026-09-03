---
slug: testing
order: 15
group: governance
title: Testing and quality gates
description: Visual matrices, types, builds, fidelity, size, and regression strategy
locale: en
---

## Quality promise

The supported baseline is a `24×24` master, default stroke `2`, and recommended rendering at `16–32px`. Other stroke values are tested for obvious failure but do not receive the same visual guarantee.

## Automated gates

- **MUST** verify TypeScript plus the two public packages (`@uplus-icon/core`, `@uplus-icon/react`) and the site build. `@uplus-icon/motion` is private and incubating; it is typechecked and unit-tested, but it is not a public release gate.
- **MUST** prove per-icon entries do not bundle the full registry.
- **MUST** prove generation is reproducible and never rewrites raw SVGs.
- **MUST** validate the mapping among names, categories, metadata, and routes.
- **MUST** test React accessibility defaults, stroke boundaries, and static per-icon imports.
- **MUST** test named, per-icon, and dynamic React entries.
- **MUST** inspect packed artifacts for required documentation and validate the lowest supported React peer version.
- **MUST** enforce route-level metadata, sitemap coverage, SPA fallback, and production JavaScript budgets for the site.
- **MUST** validate the consumer-side Codex plugin (`npm run test:plugin`) whenever plugin assets or search behavior change.

## Visual matrix

Review `16 / 20 / 24 / 32` sizes, representative values across the public stroke range, light and dark backgrounds, major browsers, and common pixel densities. Check recognition, volume, negative space, crossings, gaps, and filled details.

## Untrusted assets

When an asset is not owner-approved, tests may report the issue but never auto-fix the SVG. Code and documentation can be validated independently; fidelity and visual snapshots must run again before release once trusted sources return.
