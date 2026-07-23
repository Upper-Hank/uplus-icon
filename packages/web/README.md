# @uplus-icon/web

Native DOM factories and an optional Web Component for Uplus Icon.

```ts
import { CheckIcon } from '@uplus-icon/web'

document.body.append(CheckIcon({ size: 20, ariaLabel: 'Complete' }))
```

Register the optional custom element from the browser-only entry:

```ts
import '@uplus-icon/web/element'
```

```html
<uplus-icon name="check" size="20" aria-label="Complete"></uplus-icon>
```

See the [Uplus Icon repository](https://github.com/Upper-Hank/uplus-icon) for the full API and contribution rules.

## License

MIT
