---
slug: accessibility
order: 14
group: usage
title: Accessibility
description: Decorative icons, semantic graphics, and control names
locale: en
---

## Default semantics

Raw SVGs do not embed `title`, `role`, or ARIA. Framework layers decide per use: unnamed icons are hidden as decoration; icons carrying independent meaning require an accessible name.

- **MUST** output `aria-hidden="true"` for decorative icons.
- **MUST** use `role="img"` when `title` or `aria-label` is present.
- **MUST NOT** expose the source filename as the user-facing accessible name.

## Interactive controls

An icon-only button is named by the button, for example “Close dialog,” not “close icon.” If adjacent text already conveys the meaning, keep the icon hidden to avoid duplicate announcements.

## State and color

Never distinguish a state by color alone. Loading, error, and success need synchronized text, accessible names, or control state.
