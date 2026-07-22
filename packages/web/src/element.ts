import type { IconName } from '@uplus-icon/core'
import { Icon } from './Icon.js'

export class UplusIconElement extends HTMLElement {
  static observedAttributes = ['name', 'size', 'stroke-width', 'absolute-stroke-width', 'title', 'aria-label']

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render()
  }

  private render() {
    const name = this.getAttribute('name') as IconName | null
    const strokeWidth = this.getAttribute('stroke-width')
    this.replaceChildren()
    if (!name) return

    const icon = Icon(name, {
      size: this.getAttribute('size') ?? 24,
      strokeWidth: strokeWidth === null ? undefined : Number(strokeWidth),
      absoluteStrokeWidth: this.hasAttribute('absolute-stroke-width'),
      title: this.getAttribute('title') ?? undefined,
      ariaLabel: this.getAttribute('aria-label') ?? undefined,
    })
    if (icon) this.append(icon)
  }
}

export function registerIconElement(tagName = 'uplus-icon') {
  if (!customElements.get(tagName)) customElements.define(tagName, UplusIconElement)
}

registerIconElement()
