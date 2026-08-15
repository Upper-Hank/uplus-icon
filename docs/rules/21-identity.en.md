---
slug: identity
order: 21
group: governance
title: Stable identity and rename compatibility
description: Permanent icon IDs, source keys, legacy public names, and release checks
locale: en
---

## Stable identity

Every approved icon has a permanent `id` in `icons.json`.

- **MUST** use the `uicon_<UUID v4>` format.
- **MUST** treat the ID as the permanent identity across releases.
- **MUST NOT** regenerate, reuse, or change an ID after it has been published.
- **MUST NOT** derive IDs from SVG content hashes or package versions.

Renaming an icon, changing categories or tags, or revising artwork does not change the ID.

## Source key vs public name

The metadata object key is the stable `sourceKey`. It matches the raw SVG filename and does not change when the public name changes.

- `sourceKey` maps to `packages/icons/raw/<sourceKey>.svg`.
- `name` is the current public name used by `IconName`, component exports, and generated modules.
- On first migration, `name` equals the source key.
- Raw SVG filenames do not follow public renames.

## Aliases vs legacy names

- `aliases` are search-only terms. They are not public API compatibility guarantees.
- `legacyNames` record previously published public names and the version they were renamed in.
- A rename **MUST** add the old public name to `legacyNames` with a valid semver in `renamedIn`.
- The same public name **MUST NOT** silently point to a different ID across releases.

## Compatibility expectations

- `<Icon name="old-name" />` continues to resolve to the same ID when `legacyNames` is recorded.
- Deprecated named exports and legacy subpath modules are generated from `legacyNames`.
- Development builds warn once per legacy name; production builds stay silent.
- Release manifests under `packages/icons/metadata/releases` are immutable historical records used by identity checks.

## Release-check workflow

1. After metadata changes, run `npm run check:identity -w @uplus-icon/source`. The check uses the latest release manifest that is not newer than the current package version, so unversioned Changesets work is still compared with the currently published identity baseline.
2. After Core and React versions are updated, run `npm run create-identity-manifest -w @uplus-icon/source`.
3. The creation command validates current metadata and compares it with the latest strictly earlier manifest before writing. Identity errors **MUST** prevent creation.
4. Creation **MUST** fail when a manifest for the same version already exists; historical files must never be overwritten.

## Explicitly out of scope

This rule does not define `<Icon id="...">`, consumer lock files, automatic codemods, or consumer-project scanning. Those may be designed separately after the identity infrastructure is stable.
