import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CheckIcon } from '../../react/dist/index.js'
import { Icon as ReactIcon } from '../../react/dist/dynamic.js'
import { createIcon as createWebIcon } from '../../web/dist/createIcon.js'
import checkDefinition from '../../core/dist/generated/icons/check.js'

test('React icons preserve sizing, SVG props, and decorative defaults', () => {
  const markup = renderToStaticMarkup(createElement(CheckIcon, {
    size: 20,
    className: 'status-icon',
    color: 'rebeccapurple',
    'data-testid': 'check',
  }))

  assert.match(markup, /width="20"/)
  assert.match(markup, /height="20"/)
  assert.match(markup, /class="status-icon"/)
  assert.match(markup, /color="rebeccapurple"/)
  assert.match(markup, /data-testid="check"/)
  assert.match(markup, /aria-hidden="true"/)
  assert.doesNotMatch(markup, /role="img"/)
})

test('React icons expose labelled graphics and escape titles', () => {
  const labelled = renderToStaticMarkup(createElement(CheckIcon, { 'aria-label': 'Complete' }))
  assert.match(labelled, /aria-label="Complete"/)
  assert.match(labelled, /role="img"/)
  assert.doesNotMatch(labelled, /aria-hidden=/)

  const titled = renderToStaticMarkup(createElement(CheckIcon, { title: 'Ready <now>' }))
  assert.match(titled, /<title>Ready &lt;now&gt;<\/title>/)
  assert.match(titled, /role="img"/)
})

test('React stroke options clamp invalid values and preserve caller styles', () => {
  const below = renderToStaticMarkup(createElement(CheckIcon, { strokeWidth: 0 }))
  const above = renderToStaticMarkup(createElement(CheckIcon, { strokeWidth: 3 }))
  const invalid = renderToStaticMarkup(createElement(CheckIcon, { strokeWidth: Number.NaN }))
  const styled = renderToStaticMarkup(createElement(CheckIcon, {
    strokeWidth: 1.5,
    absoluteStrokeWidth: true,
    style: { color: 'red' },
  }))

  assert.match(below, /--uplus-icon-stroke-width:0.5/)
  assert.match(above, /--uplus-icon-stroke-width:2/)
  assert.match(invalid, /--uplus-icon-stroke-width:2/)
  assert.match(styled, /color:red/)
  assert.match(styled, /--uplus-icon-stroke-width:1.5/)
  assert.match(styled, /--uplus-icon-vector-effect:non-scaling-stroke/)
})

test('React dynamic icons render known names and ignore unknown runtime names', () => {
  assert.match(renderToStaticMarkup(createElement(ReactIcon, { name: 'check' })), /<svg/)
  assert.equal(renderToStaticMarkup(createElement(ReactIcon, { name: 'missing-at-runtime' })), '')
})

class FakeStyle {
  properties = new Map()

  setProperty(name, value) {
    this.properties.set(name, String(value))
  }

  getPropertyValue(name) {
    return this.properties.get(name) ?? ''
  }
}

class FakeElement {
  constructor(tagName = 'element') {
    this.tagName = tagName
  }

  attributes = new Map()
  children = []
  style = new FakeStyle()
  innerHTML = ''
  textContent = ''
  isConnected = false

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null
  }

  hasAttribute(name) {
    return this.attributes.has(name)
  }

  append(...children) {
    this.children.push(...children)
  }

  replaceChildren(...children) {
    this.children = [...children]
  }
}

class FakeHTMLElement extends FakeElement {
  constructor() {
    super('uplus-icon')
  }
}

const registeredElements = new Map()
globalThis.document = {
  createElementNS(_namespace, tagName) {
    return new FakeElement(tagName)
  },
}
globalThis.HTMLElement = FakeHTMLElement
globalThis.customElements = {
  define(name, constructor) {
    if (registeredElements.has(name)) throw new Error(`Custom element already registered: ${name}`)
    registeredElements.set(name, constructor)
  },
  get(name) {
    return registeredElements.get(name)
  },
}

test('Web factories create decorative and labelled SVG elements', () => {
  const decorative = createWebIcon(checkDefinition)
  assert.equal(decorative.getAttribute('width'), '24')
  assert.equal(decorative.getAttribute('height'), '24')
  assert.equal(decorative.getAttribute('aria-hidden'), 'true')
  assert.equal(decorative.getAttribute('role'), null)

  const labelled = createWebIcon(checkDefinition, {
    size: '1em',
    strokeWidth: 9,
    absoluteStrokeWidth: true,
    title: 'Complete',
    ariaLabel: 'Completion state',
    className: 'status-icon',
    attributes: { focusable: 'false', 'data-testid': 'check' },
  })

  assert.equal(labelled.getAttribute('width'), '1em')
  assert.equal(labelled.getAttribute('height'), '1em')
  assert.equal(labelled.getAttribute('role'), 'img')
  assert.equal(labelled.getAttribute('aria-label'), 'Completion state')
  assert.equal(labelled.getAttribute('aria-hidden'), null)
  assert.equal(labelled.getAttribute('class'), 'status-icon')
  assert.equal(labelled.getAttribute('focusable'), 'false')
  assert.equal(labelled.getAttribute('data-testid'), 'check')
  assert.equal(labelled.style.getPropertyValue('--uplus-icon-stroke-width'), '2')
  assert.equal(labelled.style.getPropertyValue('--uplus-icon-vector-effect'), 'non-scaling-stroke')
  assert.equal(labelled.children[0].tagName, 'title')
  assert.equal(labelled.children[0].textContent, 'Complete')
  assert.equal(labelled.children[1].tagName, 'g')
  assert.equal(labelled.children[1].innerHTML, checkDefinition.body)
})

test('Web Component registration and attribute rerendering stay deterministic', async () => {
  const { UplusIconElement, registerIconElement } = await import('../../web/dist/element.js')
  assert.equal(customElements.get('uplus-icon'), UplusIconElement)

  registerIconElement('uplus-status-icon')
  registerIconElement('uplus-status-icon')
  assert.equal(customElements.get('uplus-status-icon'), UplusIconElement)

  const element = new UplusIconElement()
  element.setAttribute('name', 'check')
  element.setAttribute('size', '18')
  element.setAttribute('stroke-width', '0')
  element.setAttribute('aria-label', 'Complete')
  element.isConnected = true
  element.connectedCallback()

  assert.equal(element.children.length, 1)
  assert.equal(element.children[0].getAttribute('width'), '18')
  assert.equal(element.children[0].getAttribute('aria-label'), 'Complete')
  assert.equal(element.children[0].style.getPropertyValue('--uplus-icon-stroke-width'), '0.5')

  element.setAttribute('name', 'unknown-at-runtime')
  element.attributeChangedCallback()
  assert.equal(element.children.length, 0)
})
