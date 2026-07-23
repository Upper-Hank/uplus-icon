---
slug: metadata
order: 7
group: governance
title: Metadata, categories, tags, and aliases
description: Semantic fields, primary grouping, search terms, and version state
locale: en
---

## Metadata responsibility

Metadata explains what an icon means, how it is found, and its lifecycle state. It never changes artwork.

- **MUST** make every `icons.json` key exactly match an icon's semantic name.
- **MUST** provide one unique metadata object per icon.
- **MUST NOT** store SVG bodies, paths, or visual correction parameters in metadata.
- **MUST NOT** format or rewrite raw SVG files when metadata changes.

## Asset relationship

Each metadata key maps one-to-one to a canonical SVG filename.

- **MUST** let generation validate names against the file set.
- **MUST NOT** declare an icon without a corresponding approved SVG.
- **MUST NOT** maintain a second availability table in the site.

## Titles

- **MUST** provide non-empty English `title` and Chinese `titleZh` values.
- **SHOULD** use object or action names a product team understands directly.
- **SHOULD** match the approved semantic name without mechanically repeating kebab-case.
- **MUST NOT** use marketing copy, temporary business terms, or unstable abbreviations.

## Categories

`categories.json` is the only registry for category IDs, order, localized names, and descriptions.

- **MUST** assign every icon to at least one registered category.
- **MUST** treat `categories[0]` as the primary site group.
- **MAY** add later categories for cross-filtering.
- **SHOULD** keep the category vocabulary stable and add one only for a durable semantic gap.
- **MUST NOT** maintain a second icon grouping list in the site.

## Tags

- **MUST** provide at least one tag with no empty or duplicate values.
- **SHOULD** cover object, action, direction, state, and common usage contexts.
- **SHOULD** keep English tags lowercase and add genuinely useful Chinese search terms.
- **MUST NOT** add unrelated trending terms, project IDs, campaign names, or ordering instructions.

## Aliases

- **MAY** add synonyms, legacy names, and common industry terms to aliases.
- **MUST** avoid conflicts with every approved icon name.
- **MUST** keep every alias globally unique so search has one deterministic owner.
- **MUST NOT** generate components, export paths, or duplicate SVG files from aliases.
- **MUST NOT** use aliases for visual style or category membership.

## References

- **MUST** make every `related`, `variants`, and motion transition target resolve to an approved icon name.
- **MUST NOT** let an icon reference itself as a relation, variant, or motion transition target.
- **MUST** reject duplicate motion capabilities and duplicate transitions during generation.

## Status and versions

| Field | Purpose |
| --- | --- |
| `deprecated` | Marks an approved name that should no longer be adopted |
| `publishedIn` | Version that first exposed the icon publicly |
| `updatedIn` | Version of the latest approved visual or semantic update |

- **MUST** track renames, deprecations, and visual replacements as explicit changes.
- **MUST** store `publishedIn` and `updatedIn` as semantic versions or `null`, and `deprecated` as a boolean.
- **SHOULD** complete version fields during public release.
- **MUST NOT** silently remove a published name without migration guidance.
