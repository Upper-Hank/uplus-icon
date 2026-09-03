# Accessibility

Match the icon's accessible behavior to its role in the interface.

## Decorative icons

Leave `title` and `aria-label` unset when adjacent text already communicates the meaning. Uplus Icon then renders the SVG as decorative with `aria-hidden="true"`.

```tsx
<button type="button">
  <DownloadIcon />
  Download
</button>
```

## Meaningful icons

Provide an accessible name when the icon is the only visible expression of an action or status. Prefer the interactive control's label when possible:

```tsx
<button type="button" aria-label="Download">
  <DownloadIcon />
</button>
```

If the SVG itself must be exposed as an image, pass `aria-label` or `title`; the component then uses `role="img"` and does not mark itself hidden.

Do not duplicate the same accessible name on both a button and its child SVG unless the surrounding accessibility pattern specifically requires it.
