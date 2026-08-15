import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import {
  generateIconId,
  isValidIconId,
  validateIconIdentityMetadata,
} from './icon-identity.mjs'
import { validateMetadataReferences } from './validate-metadata.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadataFile = join(sourceRoot, 'metadata', 'icons.json')
const assignScript = join(sourceRoot, 'scripts', 'assign-icon-ids.mjs')
const identityScript = join(sourceRoot, 'scripts', 'icon-identity.mjs')
const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))

const entry = (overrides = {}) => ({
  id: generateIconId(),
  name: 'alpha',
  aliases: [],
  related: [],
  variants: [],
  publishedIn: null,
  updatedIn: null,
  ...overrides,
})

test('repository metadata ids are valid and unique', () => {
  validateIconIdentityMetadata(metadata)
  const ids = Object.values(metadata).map((details) => details.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(ids.every((id) => isValidIconId(id)))
})

test('assign-icon-ids only fills missing identity fields and is idempotent', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'uplus-icon-assign-ids-'))
  const fixtureRoot = join(root, 'icons')
  const fixtureScripts = join(fixtureRoot, 'scripts')
  const fixtureMetadata = join(fixtureRoot, 'metadata')
  t.after(() => rm(root, { recursive: true, force: true }))

  await mkdir(fixtureScripts, { recursive: true })
  await mkdir(fixtureMetadata, { recursive: true })
  await cp(assignScript, join(fixtureScripts, 'assign-icon-ids.mjs'))
  await cp(identityScript, join(fixtureScripts, 'icon-identity.mjs'))

  const existingId = 'uicon_6142ff3b-3da2-4fd1-8d0c-f3687c2bdf8e'
  await writeFile(join(fixtureMetadata, 'icons.json'), `${JSON.stringify({
    alpha: { aliases: [] },
    beta: { id: existingId, name: 'beta', aliases: [] },
  }, null, 2)}\n`)

  const runAssignment = () => execFileSync(process.execPath, ['scripts/assign-icon-ids.mjs'], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  })
  runAssignment()
  const afterFirst = JSON.parse(await readFile(join(fixtureMetadata, 'icons.json'), 'utf8'))
  runAssignment()
  const afterSecond = JSON.parse(await readFile(join(fixtureMetadata, 'icons.json'), 'utf8'))

  assert.ok(isValidIconId(afterFirst.alpha.id))
  assert.equal(afterFirst.alpha.name, 'alpha')
  assert.equal(afterFirst.beta.id, existingId)
  assert.deepEqual(afterFirst, afterSecond)
})

test('identity validation rejects duplicate ids and names', () => {
  const sharedId = generateIconId()
  assert.throws(
    () => validateIconIdentityMetadata({
      alpha: entry({ id: sharedId, name: 'alpha' }),
      beta: entry({ id: sharedId, name: 'beta' }),
    }),
    /Duplicate icon id/,
  )
  assert.throws(
    () => validateIconIdentityMetadata({
      alpha: entry({ name: 'alpha' }),
      beta: entry({ name: 'alpha', legacyNames: [{ name: 'beta', renamedIn: '0.2.0' }] }),
    }),
    /Duplicate public name/,
  )
})

test('identity validation rejects legacy name conflicts', () => {
  assert.throws(
    () => validateIconIdentityMetadata({
      alpha: entry({ name: 'alpha', legacyNames: [{ name: 'gamma', renamedIn: '0.2.0' }] }),
      beta: entry({ name: 'gamma', legacyNames: [{ name: 'beta', renamedIn: '0.2.0' }] }),
    }),
    /conflicts with current public name/,
  )
  assert.throws(
    () => validateIconIdentityMetadata({
      alpha: entry({ name: 'alpha', legacyNames: [{ name: 'shared', renamedIn: '0.2.0' }] }),
      beta: entry({ name: 'beta', legacyNames: [{ name: 'shared', renamedIn: '0.2.0' }] }),
    }),
    /belongs to both/,
  )
  assert.throws(
    () => validateIconIdentityMetadata({
      user: entry({
        name: 'account',
        legacyNames: [
          { name: 'user', renamedIn: '0.1.0' },
          { name: 'account', renamedIn: '0.2.0' },
        ],
      }),
    }),
    /must not equal the current public name/,
  )
})

test('identity validation requires legacy names when public name diverges from source key', () => {
  assert.throws(
    () => validateIconIdentityMetadata({
      user: entry({ name: 'account' }),
    }),
    /without recording "user" in legacyNames/,
  )
  assert.doesNotThrow(() => validateIconIdentityMetadata({
    user: entry({
      name: 'account',
      legacyNames: [{ name: 'user', renamedIn: '0.2.0' }],
    }),
  }))
})

test('identity validation rejects name transfer across ids', () => {
  const alphaId = generateIconId()
  const betaId = generateIconId()
  const previous = {
    schemaVersion: 1,
    packageVersion: '0.1.0',
    icons: [
      { id: alphaId, sourceKey: 'alpha', name: 'upload', componentName: 'UploadIcon' },
      { id: betaId, sourceKey: 'beta', name: 'beta', componentName: 'BetaIcon' },
    ],
  }
  const current = {
    alpha: entry({ id: betaId, name: 'upload', legacyNames: [{ name: 'alpha', renamedIn: '0.2.0' }] }),
    beta: entry({ id: alphaId, name: 'beta' }),
  }
  validateIconIdentityMetadata(current)
  const previousByName = new Map(previous.icons.map((icon) => [icon.name, icon]))
  const currentById = new Map(Object.entries(current).map(([sourceKey, details]) => [details.id, { sourceKey, publicName: details.name }]))
  const transferErrors = []
  for (const [name, previousIcon] of previousByName.entries()) {
    const currentOwner = [...currentById.entries()].find(([, icon]) => icon.publicName === name)
    if (currentOwner && currentOwner[0] !== previousIcon.id) {
      transferErrors.push(`"${name}" previously belonged to ${previousIcon.id} but now belongs to ${currentOwner[0]}`)
    }
  }
  assert.match(transferErrors.join('\n'), /upload/)
})

test('identity validation rejects alias and legacy name conflicts regardless of entry order', () => {
  const publicNames = new Map([['alpha', 'alpha'], ['beta', 'beta']])
  const alpha = entry({ name: 'alpha', aliases: ['legacy-name'] })
  const beta = entry({ name: 'beta', legacyNames: [{ name: 'legacy-name', renamedIn: '0.2.0' }] })
  assert.throws(() => validateMetadataReferences({ alpha, beta }, ['alpha', 'beta'], publicNames), /legacy public name/)
  assert.throws(() => validateMetadataReferences({ beta, alpha }, ['alpha', 'beta'], publicNames), /legacy public name/)
})
