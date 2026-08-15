import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { generateIconId, isValidIconId, validateIconIdentityMetadata } from './icon-identity.mjs'
import { validateMetadataReferences } from './validate-metadata.mjs'
import { buildCatalogOrderBySourceKey } from './catalog-order.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadata = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'icons.json'), 'utf8'))
const categories = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'categories.json'), 'utf8'))
const subgroups = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'subgroups.json'), 'utf8'))
const names = new Set(Object.keys(metadata))

test('repository metadata passes reference validation', () => {
  const { publicNameBySourceKey } = validateIconIdentityMetadata(metadata)
  assert.doesNotThrow(() => validateMetadataReferences(metadata, names, publicNameBySourceKey))
})

test('repository metadata includes stable ids and public names', () => {
  for (const [sourceKey, details] of Object.entries(metadata)) {
    assert.ok(isValidIconId(details.id), `${sourceKey} must have a valid icon id`)
    assert.equal(typeof details.name, 'string')
    assert.match(details.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  }
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

test('repository metadata has a complete catalog order', () => {
  const catalogOrder = buildCatalogOrderBySourceKey(metadata)
  assert.equal(catalogOrder.size, names.size)
  assert.equal(catalogOrder.get('arrow-up'), catalogOrder.get('arrow-down') - 1)
  assert.ok(catalogOrder.get('arrow-top-right') > catalogOrder.get('arrow-right'))
})

const entry = (overrides = {}) => ({
  id: generateIconId(),
  name: overrides.name ?? 'alpha',
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
      alpha: entry({ name: 'alpha', aliases: ['shared'] }),
      beta: entry({ name: 'beta', aliases: ['shared'] }),
    }, ['alpha', 'beta']),
    /belongs to both alpha and beta/,
  )
  assert.throws(
    () => validateMetadataReferences({ alpha: entry({ name: 'alpha', aliases: ['gamma'] }), beta: entry({ name: 'gamma' }) }, ['alpha', 'beta']),
    /conflicts with a current public name/,
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

test('reference validation rejects aliases that conflict with legacy names regardless of entry order', () => {
  const publicNames = new Map([['alpha', 'alpha'], ['beta', 'beta']])
  assert.throws(
    () => validateMetadataReferences({
      alpha: entry({ name: 'alpha', aliases: ['legacy-name'] }),
      beta: entry({ name: 'beta', legacyNames: [{ name: 'legacy-name', renamedIn: '0.2.0' }] }),
    }, ['alpha', 'beta'], publicNames),
    /conflicts with a legacy public name/,
  )
  assert.throws(
    () => validateMetadataReferences({
      beta: entry({ name: 'beta', legacyNames: [{ name: 'legacy-name', renamedIn: '0.2.0' }] }),
      alpha: entry({ name: 'alpha', aliases: ['legacy-name'] }),
    }, ['alpha', 'beta'], publicNames),
    /conflicts with a legacy public name/,
  )
})
