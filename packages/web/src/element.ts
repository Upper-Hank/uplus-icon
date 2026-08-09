import type { IconName } from '@uplus-icon/core'
import { Icon } from './Icon.js'

export class UplusIconElement extends HTMLElement {
  static observedAttributes = ['name', 'size', 'weight', 'absolute-weight', 'title', 'aria-label']

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render()
  }

  private render() {
    const name = this.getAttribute('name') as IconName | null
    const weight = this.getAttribute('weight')
    const sizeAttribute = this.getAttribute('size')
    const numericSize = sizeAttribute === null || !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(sizeAttribute)
      ? undefined
      : Number(sizeAttribute)
    this.replaceChildren()
    if (!name) return

    const icon = Icon(name, {
      size: numericSize ?? sizeAttribute ?? 24,
      weight: weight === null ? undefined : Number(weight),
      absoluteWeight: this.hasAttribute('absolute-weight'),
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
