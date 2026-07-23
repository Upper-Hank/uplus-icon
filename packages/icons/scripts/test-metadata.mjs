import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { validateMetadataReferences } from './validate-metadata.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadata = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'icons.json'), 'utf8'))
const names = new Set(Object.keys(metadata))

test('repository metadata passes reference validation', () => {
  assert.doesNotThrow(() => validateMetadataReferences(metadata, names))
})

const entry = (overrides = {}) => ({
  aliases: [],
  related: [],
  variants: [],
  publishedIn: null,
  updatedIn: null,
  ...overrides,
})

test('reference validation rejects ambiguous aliases', () => {
  assert.throws(
    () => validateMetadataReferences({
      alpha: entry({ aliases: ['shared'] }),
      beta: entry({ aliases: ['shared'] }),
    }, ['alpha', 'beta']),
    /belongs to both alpha and beta/,
  )
  assert.throws(
    () => validateMetadataReferences({ alpha: entry({ aliases: ['beta'] }), beta: entry() }, ['alpha', 'beta']),
    /conflicts with an icon name/,
  )
})

test('reference validation rejects missing and self-referential icons', () => {
  assert.throws(
    () => validateMetadataReferences({ alpha: entry({ related: ['missing'] }) }, ['alpha']),
    /references missing icon "missing"/,
  )
  assert.throws(
    () => validateMetadataReferences({ alpha: entry({ variants: ['alpha'] }) }, ['alpha']),
    /must not reference itself/,
  )
  assert.throws(
    () => validateMetadataReferences({
      alpha: entry({ motion: { generic: [], semantic: [], transitions: [{ to: 'missing', name: 'swap' }] } }),
    }, ['alpha']),
    /references missing icon "missing"/,
  )
})

test('reference validation rejects invalid release state and duplicate motion entries', () => {
  assert.throws(
    () => validateMetadataReferences({ alpha: entry({ deprecated: 'yes' }) }, ['alpha']),
    /deprecated must be a boolean/,
  )
  assert.throws(
    () => validateMetadataReferences({ alpha: entry({ publishedIn: 'v1' }) }, ['alpha']),
    /publishedIn must be a semantic version or null/,
  )
  assert.throws(
    () => validateMetadataReferences({
      alpha: entry({ motion: { generic: ['fade', 'fade'], semantic: [], transitions: [] } }),
    }, ['alpha']),
    /contains duplicate capabilities/,
  )
})
