---
slug: motion-api
order: 12
group: motion
title: Motion public API
description: Rules package, name matching, React usage, playback controls, and fallback contracts
locale: en
---

## Release status

Motion is **incubating and not yet published**. `packages/motion` is private at version `0.0.0` and is excluded from the changeset release plan, the documentation site keeps the preview behind the `motion` release flag, and generated public metadata omits every `motion` block. The rules below define the contract the package must satisfy before its first public release; they do not describe an installable package today.

## Product boundary

`@uplus-icon/motion` is an optional rules and animation-control package that will be released independently of Core and React. It owns no SVG, generates no second animated icon set, and never changes raw SVG. Static packages do not depend on Motion, so static consumers pay no animation-code cost.

- **MUST** render the same Core Definition through static, name-based, and Motion components.
- **MUST** define each generic rule once and match semantic rules by icon `name`.
- **MUST** keep metadata limited to implemented capability declarations, never keyframes, timing, easing, or selectors.
- **MUST NOT** copy, modify, or write back SVG files under `packages/icons/raw`.

## React usage

```bash
npm install @uplus-icon/react @uplus-icon/motion
```

```tsx
import { Icon } from '@uplus-icon/motion/react'

<Icon name="bell" motion="ring" trigger="hover" />
<Icon name="heart" motion="beat" trigger="click" />
<Icon name="user" motion="fade" trigger="mount" />
```

The Motion `Icon` delegates geometry to `@uplus-icon/react/dynamic`, then uses the same `name` to select a semantic rule. Unsupported pairs such as `name="heart" motion="ring"` must fail TypeScript checking. Runtime input that bypasses the type system emits a diagnostic warning and remains static.

`trigger` accepts `manual`, `mount`, `hover`, or `click` and defaults to `manual`. Omitting `motion` renders a static icon.

## Animation capabilities

Generic `fade`, `scale`, and `blur` rules are available to every icon and each rule exists only once in the package.

The initial semantic rules are `bell:ring`, `heart:beat`, and `refresh:rotate`, and each is restricted to its declared icon. Transition animation is not part of the initial public API; arbitrary morphing is not promised.

## Framework-neutral API

```ts
import { animateIcon } from '@uplus-icon/motion'

const controls = animateIcon(svg, 'bell', 'ring', {
  direction: 'in', duration: 1000, easing: 'standard', loop: false,
})
controls.play()
```

Controls expose `play`, `pause`, `reverse`, `finish`, `reset`, `cancel`, `dispose`, `seek`, `playFrom`, and `progress`. `playFrom(progress, playback)` starts from a given progress in either direction. The implementation uses the browser Web Animations API and has no public GSAP runtime dependency.

`animateIcon` also accepts `animationTarget`, an element that receives the animation instead of the icon's own `<svg>`, which lets a caller animate a wrapper without changing the icon markup. The React component accepts `onMotionReady`, called with the controls once the animation is created.

## Static appearance

- **MUST** leave an icon that has not been played visually identical to the static icon. Animations are created in the idle state so no keyframe is applied before playback.
- **MUST** restore that same static appearance on `reset`, `cancel`, and `dispose`, including any stroke presentation the animation primed.

## API behavior

Defaults are `autoplay=false`, `loop=false`, `direction='in'`, and `reducedMotion='auto'`. Rules provide default timing and easing; caller overrides remain orthogonal. Loops require explicit opt-in and stop on component cleanup or `dispose`.

`direction='out'` plays the authored entry keyframes backwards rather than reversing the keyframe list, so multi-step semantic motion reverses coherently.

## Reduced motion

The default reads `prefers-reduced-motion`. When enabled, non-fade motion becomes a 100ms fade and looping stops while the final static icon and meaning remain intact. `reducedMotion='never'` keeps the authored rule, and `reducedMotion='always'` downgrades regardless of the system preference. The React component re-evaluates the preference when the system setting changes.

## Site parity

The documentation site must call `@uplus-icon/motion` for icon previews and must not keep another keyframe, timing, or capability implementation. The preview is therefore the same public implementation consumers receive. While the `motion` release flag is off, the site must load that code lazily so a disabled feature adds nothing to the shipped bundle.
