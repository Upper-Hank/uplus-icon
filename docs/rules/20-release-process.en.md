---
slug: release-process
order: 20
group: governance
title: Release process
description: Freeze, generation, verification, changesets, publication, and rollback
locale: en
---

## Release preparation

Confirm asset approval, metadata completeness, public API changes, and document versions. Working drafts may ship on the site but must not present pending capabilities as released.

## Release order

1. Freeze the raw SVG and metadata scope.
2. Generate and confirm the raw SVG diff is empty.
3. Run types, package builds, site build, consumer, fidelity, and bundle-size tests.
4. Review changesets, changelog, and deprecation notes.
5. Publish in dependency order: Core → React/Web → Site.

- **MUST** stop when a required gate fails.
- **MUST NOT** auto-fix or overwrite SVGs to pass a gate.
- **MUST** retain reproducible versions, commands, and an artifact summary.

## Rollback

Prefer a corrective package release or withdraw the site presentation. Never overwrite the current source with an old SVG as an emergency rollback. Restore aliases or adapters when names or part contracts are involved.
