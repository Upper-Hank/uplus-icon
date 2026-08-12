---
slug: package-architecture
order: 19
group: architecture
title: Package and generation architecture
description: Boundaries among Source, Core, React, and the site
locale: en
---

## Layers

```text
approved raw SVG + metadata
          ↓ read-only generation
core definitions ──→ React ──→ site
```

`@uplus-icon/source` privately owns assets and generation. `core` exposes framework-free definitions, the name registry, types, and metadata. `react` provides static and explicit name-based components. The site consumes public outputs.

## Public and private boundaries

- **MUST** make React consume the shared Core Definition for static icons, sizing, color, weight, and accessibility.
- **MUST NOT** make `@uplus-icon/source`, design sources, metadata maintenance entries, or generation tools part of the consumer-facing public interface.
- **MUST** keep the React name-based API under the explicit `dynamic` entry while static entries remain free of full-registry dependencies.

## Entry points

- **MUST** retain per-icon entries for real on-demand loading.
- **MUST** keep the full icon registry only in explicit `dynamic` entries, never static roots or per-icon entries.
- **MUST NOT** hand-edit `src/generated` or `dist`.
- **SHOULD** keep public package entries side-effect free.

## Dependency direction

Core is framework-free. React depends only on Core, and the site consumes the public packages. Generation reads raw SVG and metadata and writes generated directories in one direction. Any reverse write is an architectural violation.
