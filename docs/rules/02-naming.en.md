---
slug: naming
order: 2
group: foundations
title: Semantic naming and public API
description: Filenames, directions, variants, component mapping, and compatible renames
locale: en
---

## Naming goal

An approved name is the stable identifier shared by the filesystem, metadata, dynamic rendering, and named components. It describes meaning rather than visual style or one product screen.

- **MUST** use kebab-case made from lowercase ASCII letters, digits, and single hyphens.
- **MUST** use short, established English terms understood by product teams.
- **SHOULD** name the action or object directly, such as `download`, `file`, or `arrow-left`.
- **MUST NOT** use pinyin, internal project abbreviations, arbitrary numbers, or export-tool names.

## Filename structure

```text
base[-state][-direction][-variant].svg
```

- **MUST** place direction after the base meaning, such as `arrow-left` and `chevron-up`.
- **SHOULD** add a state or variant only when the set contains a real distinction, such as `lock` / `unlock` or `save` / `save-alt`.
- **MUST NOT** add repository-wide defaults such as `icon`, `linear`, `outline`, `24`, or `24px`.
- **MUST NOT** create empty naming layers for hypothetical future variants.

## Size and names

The v1 `24×24` canvas is a library-wide constraint and never enters a name. `search-24`, `search-small`, and `search-large` are not valid size expressions.

- **MUST** map one canonical name to one v1 canonical SVG, component name, and metadata record.
- **MUST NOT** use names to invent unreleased optical sizes or visual weights.
- **MUST NOT** reserve empty variants for a hypothetical future size system.

## Name-to-component mapping

| SVG | Dynamic name | React component |
| --- | --- | --- |
| `arrow-left.svg` | `arrow-left` | `ArrowLeftIcon` |
| `save-alt.svg` | `save-alt` | `SaveAltIcon` |

- **MUST** let the generator derive this mapping instead of assigning a separate component name.
- **MUST NOT** generate duplicate components for one SVG under multiple approved names.

## Synonyms and aliases

- **MUST** store legacy names and common synonyms in `aliases` instead of copying SVG files.
- **SHOULD** use aliases for real search needs; for example, `remove` may find `trash`.
- **MUST NOT** conflict with any approved icon name.
- **MUST NOT** use aliases for categories, styles, or temporary campaigns.

## Renaming and compatibility

An approved rename changes the file path, dynamic name, and named component, so it is a public API change.

- **MUST** confirm the new name materially improves accuracy and audit existing consumers.
- **MUST** document migration, deprecation timing, and release notes.
- **SHOULD** preserve search compatibility through metadata aliases; component compatibility needs an explicit deprecated export.
- **MUST NOT** bulk-rename for minor wording preferences.
