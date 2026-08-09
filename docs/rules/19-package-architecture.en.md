---
slug: package-architecture
order: 19
group: architecture
title: Package and generation architecture
description: Boundaries among Source, Core, React, Web, and the site
locale: en
---

## Layers

```text
approved raw SVG + metadata
          ↓ read-only generation
core definitions ──→ React ──→ site
       └───────────→ Web
```

`@uplus-icon/source` privately owns assets and generation. `core` exposes framework-free definitions, types, and metadata. `react` provides static components. `web` provides per-icon DOM factories, and the site consumes public outputs only.

## Public and private boundaries

- **MUST** make React and Web share the same Core Definition and preserve parity for static icons, sizing, color, weight, accessibility, and platform-native extension capabilities.
- **MUST** adapt only the expression to each platform: React exposes component props; Web exposes DOM options and `attributes`.
- **MUST NOT** make `@uplus-icon/source`, design sources, metadata maintenance entries, or generation tools part of the consumer-facing public interface.
- **MUST** design any future dynamic React/Web APIs as capability-aligned, explicit independent entries while static entries remain free of full-registry dependencies.

## Entry points

- **MUST** retain per-icon entries for real on-demand loading.
- **MUST** keep full icon registries outside first-release public package exports.
- **MUST NOT** hand-edit `src/generated` or `dist`.
- **SHOULD** keep public package entries side-effect free.

## Dependency direction

Core is framework-free. React and Web depend only on Core; the site may consume public packages. Generation reads raw SVG and metadata and writes generated directories in one direction. Any reverse write is an architectural violation.
