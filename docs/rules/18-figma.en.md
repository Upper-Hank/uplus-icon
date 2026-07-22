---
slug: figma
order: 18
group: architecture
title: Figma asset collaboration
description: Design workspace, canonical SVG authority, synchronization, and conflict handling
locale: en
---

## Responsibilities

Figma supports design, editing, review, component presentation, and designer distribution. Normalized canonical SVG is the sole publishing authority. If they disagree, stop synchronization and keep the approved SVG authoritative.

- **MUST** record canonical name and version state on Figma components.
- **MUST** remove backgrounds, grids, reference frames, and guides outside the repository.
- **MUST NOT** let automatic synchronization overwrite `packages/icons/raw`.

## Handoff checklist

A handoff includes the 24×24 canvas, transparent background, currentColor/none usage, part names, target-size previews, and owner approval. Motion candidates also describe part hierarchy and transition relationships.

## Conflict handling

When geometry, order, or naming conflicts appear, pause import, record both versions and their difference, and let the owner choose replacement, design revision, or no change. Tools never merge paths or guess the correct version.
