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

Submitted metadata requires `title`, `titleZh`, `categories`, `subgroup`, `tags`, and `aliases`. Add `description`, `related`, `variants`, `contributors`, `deprecated`, `publishedIn`, and `updatedIn` only when applicable. Every path, `d` value, coordinate, color, stroke, and node order belongs exclusively to the canonical SVG and must not be copied into `icons.json`.

```json
{
  "bell": {
    "title": "Bell",
    "titleZh": "通知",
    "categories": ["objects"],
    "subgroup": "communication",
    "tags": ["objects", "对象", "communication", "沟通"],
    "aliases": ["notification"]
  }
}
```

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
- **MUST** use tags for stable classification and include the primary category ID and subgroup ID.
- **SHOULD** include localized category and subgroup labels for bilingual filtering and search.
- **MUST NOT** repeat formal names, aliases, or temporary search terms in tags.
- **MUST NOT** add unrelated trending terms, project IDs, campaign names, or ordering instructions.

## Aliases

- **MAY** add synonyms, legacy names, and common industry terms to aliases.
- **SHOULD** put common search names outside the formal title in aliases, not tags.
- **MUST** avoid conflicts with every approved icon name.
- **MUST** keep every alias globally unique so search has one deterministic owner.
- **MUST NOT** generate components, export paths, or duplicate SVG files from aliases.
- **MUST NOT** use aliases for visual style or category membership.

## References

- **MUST** make every `related` and `variants` target resolve to an approved icon name.
- **MUST NOT** let an icon reference itself as a relation or variant.

## Structural parts

`parts` only declares stable structural parts that already exist in the SVG; it cannot create or correct geometry. Submit `parts` only when the SVG contains `data-part`, and list every value in exact document order.

- **MUST NOT** prefill `parts` for a possible future feature.
- **MUST** make generation reject a part list that differs between SVG and metadata.

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
