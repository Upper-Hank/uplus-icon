import assert from 'node:assert/strict'
import test from 'node:test'
import { parseAttributes, parseDesignSource, validateSvgBody } from './svg-source.mjs'

const wrap = (body, attributes = 'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"') =>
  `<svg ${attributes}>${body}</svg>`

const strokePath = '<path d="M4 12h16" stroke="black" stroke-width="2" stroke-linecap="round"/>'

test('parseAttributes reads quoted values and namespaced names', () => {
  assert.deepEqual(parseAttributes('d="M0 0" stroke-width="2"', 'test'), { d: 'M0 0', 'stroke-width': '2' })
  assert.deepEqual(parseAttributes("d='M0 0'", 'test'), { d: 'M0 0' })
  assert.deepEqual(parseAttributes('', 'test'), {})
  assert.deepEqual(parseAttributes('d="M0 0" /', 'test'), { d: 'M0 0' })
})

test('parseAttributes rejects duplicate and malformed attributes', () => {
  assert.throws(() => parseAttributes('fill="none" fill="black"', 'test'), /duplicate attribute: fill/)
  assert.throws(() => parseAttributes('d="M0 0" dangling', 'test'), /malformed attributes: dangling/)
})

test('validateSvgBody returns data-part names in document order', () => {
  const body = '<path d="M1 1" data-part="handle" stroke="black" stroke-width="2"/><circle cx="12" cy="12" r="4" data-part="dial" fill="black"/>'
  assert.deepEqual(validateSvgBody('demo.svg', body, '0 0 24 24'), ['handle', 'dial'])
})

test('validateSvgBody rejects duplicate and non-kebab data-part names', () => {
  assert.throws(
    () => validateSvgBody('demo.svg', '<path d="M1 1" data-part="a"/><path d="M2 2" data-part="a"/>', '0 0 24 24'),
    /duplicate data-part: a/,
  )
  assert.throws(
    () => validateSvgBody('demo.svg', '<path d="M1 1" data-part="Handle"/>', '0 0 24 24'),
    /data-part must use kebab-case/,
  )
})

test('validateSvgBody rejects structures that cannot ship as static definitions', () => {
  const cases = [
    ['<mask id="a"><path d="M1 1"/></mask>', /unsupported <mask>/],
    ['<clipPath id="a"><path d="M1 1"/></clipPath>', /unsupported <clipPath>/],
    ['<filter id="a"/>', /unsupported <filter>/],
    ['<defs><path d="M1 1"/></defs>', /unsupported <defs>/],
    ['<use href="#a"/>', /unsupported <use>/],
    ['<image href="a.png"/>', /unsupported <image>/],
    ['<text x="1" y="1"/>', /unsupported <text>/],
    ['<text x="1" y="1">a</text>', /unsupported text content/],
    ['<foreignObject/>', /unsupported <foreignObject>/],
  ]
  for (const [body, pattern] of cases) {
    assert.throws(() => validateSvgBody('demo.svg', body, '0 0 24 24'), pattern, `expected ${body} to be rejected`)
  }
})

test('validateSvgBody rejects unsafe references and event attributes', () => {
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1" fill="url(#a)"/>', '0 0 24 24'), /unsafe reference or event attribute/)
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1" onclick="x()"/>', '0 0 24 24'), /unsupported attributes: onclick/)
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1" transform="javascript:x"/>', '0 0 24 24'), /unsafe reference or event attribute/)
})

test('validateSvgBody enforces the fixed black and none design-source palette', () => {
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1" stroke="#000"/>', '0 0 24 24'), /stroke must be "none" or "black"/)
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1" fill="currentColor"/>', '0 0 24 24'), /fill must be "none" or "black"/)
  assert.doesNotThrow(() => validateSvgBody('demo.svg', '<path d="M1 1" fill="black" stroke="none"/>', '0 0 24 24'))
})

test('validateSvgBody enforces the supported stroke-width range', () => {
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1" stroke-width="2.5"/>', '0 0 24 24'), /stroke-width must be a number from 0.5 to 2/)
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1" stroke-width="0.25"/>', '0 0 24 24'), /stroke-width must be a number from 0.5 to 2/)
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1" stroke-width="2px"/>', '0 0 24 24'), /stroke-width must be a number from 0.5 to 2/)
  assert.doesNotThrow(() => validateSvgBody('demo.svg', '<path d="M1 1" stroke-width=".5"/>', '0 0 24 24'))
})

test('validateSvgBody rejects annotations, stray text, and unbalanced markup', () => {
  assert.throws(() => validateSvgBody('demo.svg', '<!-- grid --><path d="M1 1"/>', '0 0 24 24'), /contains comments/)
  assert.throws(() => validateSvgBody('demo.svg', '<path d="M1 1"/>label', '0 0 24 24'), /unsupported text content/)
  assert.throws(() => validateSvgBody('demo.svg', '<g><path d="M1 1"/>', '0 0 24 24'), /unclosed <g> markup/)
  assert.throws(() => validateSvgBody('demo.svg', '<g><path d="M1 1"/></path></g>', '0 0 24 24'), /mismatched <path> markup/)
})

test('validateSvgBody rejects an opaque full-canvas rectangle', () => {
  assert.throws(
    () => validateSvgBody('demo.svg', '<rect x="0" y="0" width="24" height="24" fill="black"/>', '0 0 24 24'),
    /opaque full-canvas rectangle/,
  )
  assert.doesNotThrow(() => validateSvgBody('demo.svg', '<rect x="0" y="0" width="24" height="24" fill="none" stroke="black" stroke-width="2"/>', '0 0 24 24'))
})

test('validateSvgBody rejects an invalid viewBox', () => {
  assert.throws(() => validateSvgBody('demo.svg', strokePath, '0 0 24'), /invalid viewBox/)
  assert.throws(() => validateSvgBody('demo.svg', strokePath, '0 0 0 24'), /invalid viewBox/)
})

test('parseDesignSource accepts the approved root shape', () => {
  const result = parseDesignSource('demo.svg', wrap(strokePath))
  assert.equal(result.viewBox, '0 0 24 24')
  assert.equal(result.body, strokePath)
  assert.deepEqual(result.parts, [])
})

test('parseDesignSource enforces the 24px canvas contract', () => {
  assert.throws(
    () => parseDesignSource('demo.svg', wrap(strokePath, 'width="24" height="24" viewBox="0 0 32 32" fill="none"')),
    /must use viewBox="0 0 24 24"/,
  )
  assert.throws(
    () => parseDesignSource('demo.svg', wrap(strokePath, 'width="32" height="32" viewBox="0 0 24 24" fill="none"')),
    /root width and height must both be 24/,
  )
  assert.throws(
    () => parseDesignSource('demo.svg', wrap(strokePath, 'width="24" height="24" viewBox="0 0 24 24" fill="black"')),
    /root fill must be "none"/,
  )
  assert.throws(
    () => parseDesignSource('demo.svg', wrap(strokePath, 'width="24" height="24" viewBox="0 0 24 24" viewBox="0 0 24 24"')),
    /exactly one viewBox attribute/,
  )
  assert.throws(
    () => parseDesignSource('demo.svg', wrap(strokePath, 'width="24" height="24" viewBox="0 0 24 24" class="icon"')),
    /unsupported root SVG attributes: class/,
  )
  assert.throws(() => parseDesignSource('demo.svg', strokePath), /exactly one root <svg> element/)
})
