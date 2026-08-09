import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ObjectAlignJustifyIcon, PlusIcon, QrCodeIcon, TextareaIcon } from '../../react/dist/index.js'
import { createIcon as createWebIcon } from '../../web/dist/createIcon.js'
import { applyIconWeight, resolveIconWeight, resolveIconWeightScale } from '../../core/dist/weight.js'
import plusDefinition from '../../core/dist/generated/icons/plus.js'
import objectAlignJustifyDefinition from '../../core/dist/generated/icons/object-align-justify.js'
import qrCodeDefinition from '../../core/dist/generated/icons/qr-code.js'
import textareaDefinition from '../../core/dist/generated/icons/textarea.js'

test('React icons preserve sizing, SVG props, and decorative defaults', () => {
  const markup = renderToStaticMarkup(createElement(PlusIcon, {
    size: 20,
    className: 'status-icon',
    color: 'rebeccapurple',
    'data-testid': 'plus',
  }))

  assert.match(markup, /width="20"/)
  assert.match(markup, /height="20"/)
  assert.match(markup, /class="status-icon"/)
  assert.match(markup, /color="rebeccapurple"/)
  assert.match(markup, /data-testid="plus"/)
  assert.match(markup, /aria-hidden="true"/)
  assert.doesNotMatch(markup, /role="img"/)
})

test('React icons expose labelled graphics and escape titles', () => {
  const labelled = renderToStaticMarkup(createElement(PlusIcon, { 'aria-label': 'Complete' }))
  assert.match(labelled, /aria-label="Complete"/)
  assert.match(labelled, /role="img"/)
  assert.doesNotMatch(labelled, /aria-hidden=/)

  const titled = renderToStaticMarkup(createElement(PlusIcon, { title: 'Ready <now>' }))
  assert.match(titled, /<title>Ready &lt;now&gt;<\/title>/)
  assert.match(titled, /role="img"/)
})

test('weight clamps invalid values and preserves source stroke ratios', () => {
  const body = '<path d="M3 4V20" stroke="currentColor" stroke-width="2"/><line x1="21" y1="4" x2="21" y2="20" stroke="currentColor" stroke-width="1.5"/>'
  assert.equal(resolveIconWeight(0), 0.5)
  assert.equal(resolveIconWeight(3), 2)
  assert.equal(resolveIconWeight(Number.NaN), 2)
  assert.equal(applyIconWeight(body, { weight: 1.5 }), '<path d="M3 4V20" stroke="currentColor" stroke-width="1.5"/><line x1="21" y1="4" x2="21" y2="20" stroke="currentColor" stroke-width="1.125"/>')
  assert.equal(applyIconWeight(body, { weight: 2 }), body)
  assert.doesNotMatch(applyIconWeight(body, { absoluteWeight: true, size: 48, weight: 1.5 }), /transform=/)
})

test('weight scales solid primitives around their centers without changing complex paths', () => {
  const body = [
    '<circle cx="12" cy="10" r="4" fill="currentColor"/>',
    '<ellipse cx="8" cy="7" rx="4" ry="2" transform="rotate(30 8 7)" fill="currentColor"/>',
    '<rect x="4" y="6" width="8" height="4" rx="2" ry="1" fill="currentColor"/>',
    '<path d="M1 1H3V3Z" fill="currentColor"/>',
  ].join('')
  assert.equal(applyIconWeight(body, { weight: 1 }), [
    '<circle cx="12" cy="10" r="2.6667" fill="currentColor"/>',
    '<ellipse cx="8" cy="7" rx="2.6667" ry="1.3333" transform="rotate(30 8 7)" fill="currentColor"/>',
    '<rect x="5.3333" y="6.6667" width="5.3333" height="2.6667" rx="1.3333" ry="0.6667" fill="currentColor"/>',
    '<path d="M1 1H3V3Z" fill="currentColor"/>',
  ].join(''))
})

test('solid geometry follows its continuous 0.5-to-1 scale while strokes remain proportional', () => {
  const body = '<path stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/>'
  assert.equal(applyIconWeight(body, { weight: 0.5 }), '<path stroke="currentColor" stroke-width="0.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/>')
  assert.equal(applyIconWeight(body, { weight: 1 }), '<path stroke="currentColor" stroke-width="1"/><circle cx="12" cy="12" r="2.6667" fill="currentColor"/>')
  assert.equal(applyIconWeight(body, { weight: 1.5 }), '<path stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3.3333" fill="currentColor"/>')
})

test('absolute weight offsets numeric size scaling and safely falls back for string sizes', () => {
  const body = '<path stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/>'
  assert.equal(resolveIconWeightScale({ absoluteWeight: true, size: 48, weight: 2 }), 0.5)
  assert.equal(applyIconWeight(body, { absoluteWeight: true, size: 48, weight: 2 }), '<path stroke="currentColor" stroke-width="1"/><circle cx="12" cy="12" r="2" fill="currentColor"/>')
  assert.equal(applyIconWeight(body, { absoluteWeight: true, size: 48, weight: 1.5 }), '<path stroke="currentColor" stroke-width="0.75"/><circle cx="12" cy="12" r="1.6667" fill="currentColor"/>')
  assert.equal(resolveIconWeightScale({ absoluteWeight: true, size: '2em', weight: 1 }), 0.5)
  assert.equal(applyIconWeight(body, { absoluteWeight: true, size: '2em', weight: 1 }), applyIconWeight(body, { weight: 1 }))
})

test('textarea solid handle scales toward its fixed bottom-right anchor without changing its path', () => {
  const body = '<path d="M15 14L19 14V17H15Z" fill="currentColor"/>'
  const weighted = applyIconWeight(body, { name: 'textarea', weight: 1 })

  assert.equal(weighted, '<path d="M15 14L19 14V17H15Z" fill="currentColor" transform="translate(19 17) scale(0.6667) translate(-19 -17)"/>')
  assert.match(weighted, /d="M15 14L19 14V17H15Z"/)
  assert.equal(applyIconWeight(body, { name: 'dial', weight: 1 }), body)
})

test('headset solid microphone dot scales around its center without changing its path', () => {
  const body = '<path d="M15.5 19.5A1.5 1.5 0 1 1 12.5 19.5A1.5 1.5 0 1 1 15.5 19.5Z" fill="currentColor"/>'
  const weighted = applyIconWeight(body, { name: 'headset', weight: 0.5 })

  assert.equal(weighted, '<path d="M15.5 19.5A1.5 1.5 0 1 1 12.5 19.5A1.5 1.5 0 1 1 15.5 19.5Z" fill="currentColor" transform="translate(14 19.5) scale(0.5) translate(-14 -19.5)"/>')
  assert.match(weighted, /d="M15.5 19.5A1.5 1.5/)
})

test('qr-code solid finder squares scale around their individual centers', () => {
  const weighted = applyIconWeight(qrCodeDefinition.body, { name: 'qr-code', weight: 0.5 })

  assert.match(weighted, /translate\(7 7\) scale\(0\.5\) translate\(-7 -7\)/)
  assert.match(weighted, /translate\(17 7\) scale\(0\.5\) translate\(-17 -7\)/)
  assert.match(weighted, /translate\(7 17\) scale\(0\.5\) translate\(-7 -17\)/)
  assert.equal((weighted.match(/transform="translate\(/g) ?? []).length, 3)
})

test('React weight renders transformed geometry and preserves caller styles', () => {
  const below = renderToStaticMarkup(createElement(PlusIcon, { weight: 0 }))
  const above = renderToStaticMarkup(createElement(PlusIcon, { weight: 3 }))
  const styled = renderToStaticMarkup(createElement(PlusIcon, { weight: 1.5, style: { color: 'red' } }))

  assert.match(below, /stroke-width="0.5"/)
  assert.match(above, /stroke-width="2"/)
  assert.match(styled, /color:red/)
  assert.match(styled, /stroke-width="1.5"/)
  assert.doesNotMatch(styled, /--uplus-icon-/)
})

test.skip('React dynamic icons render known names and ignore unknown runtime names', async () => {
  const { Icon: ReactIcon } = await import('../../react/dist/dynamic.js')
  assert.match(renderToStaticMarkup(createElement(ReactIcon, { name: 'plus' })), /<svg/)
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
  const decorative = createWebIcon(plusDefinition)
  assert.equal(decorative.getAttribute('width'), '24')
  assert.equal(decorative.getAttribute('height'), '24')
  assert.equal(decorative.getAttribute('aria-hidden'), 'true')
  assert.equal(decorative.getAttribute('role'), null)

  const labelled = createWebIcon(plusDefinition, {
    size: '1em',
    weight: 1.5,
    title: 'Complete',
    ariaLabel: 'Completion state',
    className: 'status-icon',
    attributes: { focusable: 'false', 'data-testid': 'plus' },
  })

  assert.equal(labelled.getAttribute('width'), '1em')
  assert.equal(labelled.getAttribute('height'), '1em')
  assert.equal(labelled.getAttribute('role'), 'img')
  assert.equal(labelled.getAttribute('aria-label'), 'Completion state')
  assert.equal(labelled.getAttribute('aria-hidden'), null)
  assert.equal(labelled.getAttribute('class'), 'status-icon')
  assert.equal(labelled.getAttribute('focusable'), 'false')
  assert.equal(labelled.getAttribute('data-testid'), 'plus')
  assert.equal(labelled.children[0].tagName, 'title')
  assert.equal(labelled.children[0].textContent, 'Complete')
  assert.equal(labelled.children[1].tagName, 'g')
  assert.equal(labelled.children[1].innerHTML, applyIconWeight(plusDefinition.body, { weight: 1.5 }))
  assert.match(labelled.children[1].innerHTML, /stroke-width="1.5"/)
})

test('React and Web apply identical relative and absolute weight geometry', () => {
  const reactMarkup = renderToStaticMarkup(createElement(PlusIcon, { absoluteWeight: true, size: 48, weight: 1.25 }))
  const reactBody = reactMarkup.match(/<g>([\s\S]*?)<\/g>/)?.[1]
  const webBody = createWebIcon(plusDefinition, { absoluteWeight: true, size: 48, weight: 1.25 }).children[0].innerHTML

  assert.equal(reactBody, webBody)
  assert.equal(webBody, applyIconWeight(plusDefinition.body, { absoluteWeight: true, size: 48, weight: 1.25 }))
})

test('textarea anchored handle is identical across React and Web at supported weights', () => {
  for (const weight of [0.5, 1.5, 2]) {
    const reactMarkup = renderToStaticMarkup(createElement(TextareaIcon, { weight }))
    const reactBody = reactMarkup.match(/<g>([\s\S]*?)<\/g>/)?.[1]
    const webBody = createWebIcon(textareaDefinition, { weight }).children[0].innerHTML
    const expected = applyIconWeight(textareaDefinition.body, { name: 'textarea', weight })
    assert.equal(reactBody, expected)
    assert.equal(webBody, expected)
    if (weight === 2) assert.doesNotMatch(expected, /translate\(19 17\)/)
    else {
      const solidScale = String(Number((((weight + 1) / 3)).toFixed(4)))
      assert.match(expected, new RegExp(`translate\\(19 17\\) scale\\(${solidScale}\\) translate\\(-19 -17\\)`))
    }
  }

  const options = { absoluteWeight: true, size: 48, weight: 1.5 }
  const reactMarkup = renderToStaticMarkup(createElement(TextareaIcon, options))
  const reactBody = reactMarkup.match(/<g>([\s\S]*?)<\/g>/)?.[1]
  const webBody = createWebIcon(textareaDefinition, options).children[0].innerHTML
  assert.equal(reactBody, webBody)
  assert.match(webBody, /translate\(19 17\) scale\(0.4167\) translate\(-19 -17\)/)
})

test('qr-code finder squares are identical across React and Web at supported weights', () => {
  for (const weight of [0.5, 1.5, 2]) {
    const reactMarkup = renderToStaticMarkup(createElement(QrCodeIcon, { weight }))
    const reactBody = reactMarkup.match(/<g>([\s\S]*?)<\/g>/)?.[1]
    const webBody = createWebIcon(qrCodeDefinition, { weight }).children[0].innerHTML
    const expected = applyIconWeight(qrCodeDefinition.body, { name: 'qr-code', weight })
    assert.equal(reactBody, expected)
    assert.equal(webBody, expected)
  }

  const options = { absoluteWeight: true, size: 48, weight: 1.5 }
  const reactMarkup = renderToStaticMarkup(createElement(QrCodeIcon, options))
  const reactBody = reactMarkup.match(/<g>([\s\S]*?)<\/g>/)?.[1]
  const webBody = createWebIcon(qrCodeDefinition, options).children[0].innerHTML
  assert.equal(reactBody, webBody)
  assert.match(webBody, /translate\(7 7\) scale\(0\.4167\) translate\(-7 -7\)/)
})

test('object alignment paths keep every endpoint across React and Web', () => {
  const sourcePaths = [...objectAlignJustifyDefinition.body.matchAll(/ d="([^"]+)"/g)].map((match) => match[1])

  for (const options of [
    { weight: 0.5 },
    { weight: 1.5 },
    { weight: 2 },
    { absoluteWeight: true, size: 48, weight: 1.5 },
  ]) {
    const reactMarkup = renderToStaticMarkup(createElement(ObjectAlignJustifyIcon, options))
    const reactBody = reactMarkup.match(/<g>([\s\S]*?)<\/g>/)?.[1]
    const webBody = createWebIcon(objectAlignJustifyDefinition, options).children[0].innerHTML
    const weightedPaths = [...webBody.matchAll(/ d="([^"]+)"/g)].map((match) => match[1])
    assert.equal(reactBody, webBody)
    assert.deepEqual(weightedPaths, sourcePaths)
    assert.doesNotMatch(webBody, /transform=/)
  }
})

test.skip('Web Component registration and attribute rerendering stay deterministic', async () => {
  const { UplusIconElement, registerIconElement } = await import('../../web/dist/element.js')
  assert.equal(customElements.get('uplus-icon'), UplusIconElement)

  registerIconElement('uplus-status-icon')
  registerIconElement('uplus-status-icon')
  assert.equal(customElements.get('uplus-status-icon'), UplusIconElement)

  const element = new UplusIconElement()
  element.setAttribute('name', 'plus')
  element.setAttribute('size', '18')
  element.setAttribute('weight', '0')
  element.setAttribute('aria-label', 'Complete')
  element.isConnected = true
  element.connectedCallback()

  assert.equal(element.children.length, 1)
  assert.equal(element.children[0].getAttribute('width'), '18')
  assert.equal(element.children[0].getAttribute('aria-label'), 'Complete')
  assert.match(element.children[0].children[0].innerHTML, /stroke-width="0.5"/)

  element.setAttribute('name', 'unknown-at-runtime')
  element.attributeChangedCallback()
  assert.equal(element.children.length, 0)
})
