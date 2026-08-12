import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { validateMetadataReferences } from './validate-metadata.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadata = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'icons.json'), 'utf8'))
const categories = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'categories.json'), 'utf8'))
const subgroups = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'subgroups.json'), 'utf8'))
const names = new Set(Object.keys(metadata))

test('repository metadata passes reference validation', () => {
  assert.doesNotThrow(() => validateMetadataReferences(metadata, names))
})

test('repository metadata has localized names and classification-only tags', () => {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const subgroupByKey = new Map(subgroups.map((subgroup) => [`${subgroup.categoryId}/${subgroup.id}`, subgroup]))

  for (const [name, details] of Object.entries(metadata)) {
    assert.match(details.titleZh, /[\u3400-\u9fff]/, `${name} must have a Chinese title`)

    const category = categoryById.get(details.categories[0])
    const subgroup = subgroupByKey.get(`${details.categories[0]}/${details.subgroup}`)
    assert.ok(category, `${name} must reference a registered primary category`)
    assert.ok(subgroup, `${name} must reference a registered subgroup`)

    const expectedTags = [...new Set([
      category.id,
      category.title.toLowerCase(),
      category.titleZh,
      subgroup.id,
      subgroup.title.toLowerCase(),
      subgroup.titleZh,
    ])]
    assert.deepEqual(details.tags, expectedTags, `${name} tags must describe its category and subgroup`)

    const normalizedTags = new Set(details.tags.map((tag) => tag.toLocaleLowerCase()))
    assert.ok(
      details.aliases.every((alias) => !normalizedTags.has(alias.toLocaleLowerCase())),
      `${name} aliases must not be duplicated as tags`,
    )
  }
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
      alpha: entry({ motion: { semantic: [], transitions: [{ to: 'missing', name: 'swap' }] } }),
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
      alpha: entry({ motion: { semantic: ['ring', 'ring'], transitions: [] } }),
    }, ['alpha']),
    /contains duplicate capabilities/,
  )
  assert.throws(
    () => validateMetadataReferences({
      alpha: entry({ motion: { semantic: ['Bad Name'], transitions: [] } }),
    }, ['alpha']),
    /capabilities must use kebab-case/,
  )
})
