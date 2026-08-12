# @uplus-icon/motion

Animation rules and Web Animations controls for the same icon definitions published by Uplus Icon.

```tsx
import { Icon } from '@uplus-icon/motion/react'

<Icon name="bell" motion="ring" trigger="hover" />
<Icon name="heart" motion="beat" trigger="click" />
<Icon name="user" motion="fade" trigger="mount" />
```

The package contains animation rules only. It delegates SVG rendering to `@uplus-icon/react/dynamic`, so static and animated icons always use the same generated definition. Generic rules (`fade`, `scale`, and `blur`) are shared once; semantic rules are selected by icon name.

For framework-neutral control:

```ts
import { animateIcon } from '@uplus-icon/motion'

const controls = animateIcon(svg, 'bell', 'ring')
controls.play()
```

Motion is opt-in, does not mutate source SVG files, and honors `prefers-reduced-motion` by default.

## License

MIT
