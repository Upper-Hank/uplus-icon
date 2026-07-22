---
slug: package-architecture
order: 19
group: architecture
title: Package and generation architecture
description: Boundaries among Source, Core, React, Web, Motion, and the site
locale: en
---

## Layers

```text
approved raw SVG + metadata
          ↓ read-only generation
core definitions ──→ React ──→ site
       └───────────→ Web
       └───────────→ Motion (future package)
```

`@uplus-icon/source` privately owns assets and generation. `core` exposes framework-free definitions, types, and metadata. `react` provides components. `web` provides a DOM factory and Web Component. Motion ships independently, and the site consumes public outputs only.

## Entry points

- **MUST** retain per-icon entries for real on-demand loading.
- **MUST** isolate name-based rendering in explicit `dynamic` entries.
- **MUST NOT** hand-edit `src/generated` or `dist`.
- **SHOULD** keep `sideEffects: false`, except the self-registering Web Component entry.

## Dependency direction

Core is framework-free. React and Web depend only on Core; the site may consume public packages. Generation reads raw SVG and metadata and writes generated directories in one direction. Any reverse write is an architectural violation.
