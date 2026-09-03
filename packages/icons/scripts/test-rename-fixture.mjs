import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import {
  compareSemver,
  selectManifestVersion,
  selectPreviousManifestVersion,
} from './icon-identity.mjs'
import {
  RENAME_FIXTURE,
  readFixtureComponentsBarrel,
  setupRenameFixtureWorkspace,
} from './rename-fixture.mjs'

test('semver selection handles current releases and numeric prerelease identifiers', () => {
  assert.equal(selectPreviousManifestVersion(['0.9.0', '0.10.0', '1.0.0'], '1.0.0'), '0.10.0')
  assert.equal(selectPreviousManifestVersion(['0.1.0-beta.0', '1.0.0'], '1.0.0'), '0.1.0-beta.0')
  assert.equal(compareSemver('0.10.0', '0.9.0'), 1)
  assert.equal(compareSemver('1.0.0-beta.10', '1.0.0-beta.9'), 1)
  assert.equal(compareSemver('1.0.0-beta.1', '1.0.0-beta'), 1)
  assert.equal(compareSemver('1.0.0-alpha', '1.0.0-alpha.1'), -1)
  assert.equal(compareSemver('1.0.0+build.2', '1.0.0+build.1'), 0)
  assert.equal(
    selectPreviousManifestVersion(['1.0.0-beta.9', '1.0.0-beta.10'], '1.0.0-beta.11'),
    '1.0.0-beta.10',
  )
  assert.equal(selectManifestVersion(['1.0.0'], '1.0.0'), '1.0.0')
  assert.equal(selectPreviousManifestVersion(['1.0.0'], '1.0.0'), null)
})

test('user to account rename fixture generates valid deprecated exports and builds', async (t) => {
  const fixture = await setupRenameFixtureWorkspace()
  t.after(() => fixture.cleanup())

  const components = await readFixtureComponentsBarrel(fixture.reactRoot)
  assert.match(components, /export \{ AccountIcon \} from '\.\/icons\/account\.js'/)
  assert.match(components, /export \{ AccountIcon as UserIcon \} from '\.\/icons\/account\.js'/)
  assert.doesNotMatch(components, /export \{ AccountIcon as UserIcon \}\n/)

  const legacyCore = await readFile(join(fixture.coreRoot, 'src', 'generated', 'icons', 'user.ts'), 'utf8')
  const legacyReact = await readFile(join(fixture.reactRoot, 'src', 'generated', 'icons', 'user.tsx'), 'utf8')
  assert.match(legacyCore, /from '\.\/account\.js'/)
  assert.match(legacyReact, /from '\.\/account\.js'/)

  const { UserIcon, AccountIcon } = await import(join(fixture.reactRoot, 'dist', 'index.js'))
  const userDirect = await import(join(fixture.reactRoot, 'dist', 'generated', 'icons', 'user.js'))
  const accountDirect = await import(join(fixture.reactRoot, 'dist', 'generated', 'icons', 'account.js'))

  assert.equal(UserIcon, AccountIcon)
  assert.equal(userDirect.UserIcon, accountDirect.AccountIcon)
  assert.equal(userDirect.default, accountDirect.default)
})

test('user to account rename fixture resolves legacy dynamic names and warnings', async (t) => {
  const fixture = await setupRenameFixtureWorkspace()
  t.after(() => fixture.cleanup())

  const { iconDefinitions } = await import(join(fixture.coreRoot, 'dist', 'dynamic.js'))
  const { legacyIconNameMap } = await import(join(fixture.coreRoot, 'dist', 'generated', 'legacy-names.js'))
  const { createElement } = await import(join(fixture.fixtureWorkspace, 'node_modules', 'react', 'index.js'))
  const { renderToStaticMarkup } = await import(join(fixture.fixtureWorkspace, 'node_modules', 'react-dom', 'server.js'))

  const legacy = legacyIconNameMap.get(RENAME_FIXTURE.legacyName)
  assert.ok(legacy)
  assert.equal(legacy.currentName, RENAME_FIXTURE.currentName)
  assert.equal(legacy.id, RENAME_FIXTURE.iconId)

  const current = iconDefinitions.find((icon) => icon.name === RENAME_FIXTURE.currentName)
  assert.ok(current)
  assert.equal(current.id, RENAME_FIXTURE.iconId)

  const previousNodeEnv = process.env.NODE_ENV
  const warnings = []
  const originalWarn = console.warn
  console.warn = (message) => warnings.push(String(message))
  process.env.NODE_ENV = 'development'

  try {
    const { resolveIconByName, resetLegacyNameWarningsForTests } = await import(join(fixture.reactRoot, 'dist', 'resolve-icon.js'))
    resetLegacyNameWarningsForTests()
    resolveIconByName(RENAME_FIXTURE.legacyName)
    resolveIconByName(RENAME_FIXTURE.legacyName)
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /"user" was renamed to "account" in 0\.2\.0/)
    assert.match(warnings[0], new RegExp(RENAME_FIXTURE.iconId))
  } finally {
    console.warn = originalWarn
    process.env.NODE_ENV = previousNodeEnv
  }

  const { Icon } = await import(join(fixture.reactRoot, 'dist', 'dynamic.js'))
  const legacyMarkup = renderToStaticMarkup(createElement(Icon, { name: RENAME_FIXTURE.legacyName }))
  const currentMarkup = renderToStaticMarkup(createElement(Icon, { name: RENAME_FIXTURE.currentName }))
  assert.equal(legacyMarkup, currentMarkup)

  process.env.NODE_ENV = 'production'
  warnings.length = 0
  try {
    const { resolveIconByName, resetLegacyNameWarningsForTests } = await import(join(fixture.reactRoot, 'dist', 'resolve-icon.js'))
    resetLegacyNameWarningsForTests()
    resolveIconByName(RENAME_FIXTURE.legacyName)
    assert.equal(warnings.length, 0)
  } finally {
    process.env.NODE_ENV = previousNodeEnv
  }
})

test('identity check compares against the latest earlier manifest, not the current version', async (t) => {
  const fixture = await setupRenameFixtureWorkspace()
  t.after(() => fixture.cleanup())

  const output = execFileSync('node', ['scripts/check-icon-identity.mjs'], {
    cwd: fixture.iconsRoot,
    encoding: 'utf8',
  })
  assert.match(output, /Compared against release manifest 0\.1\.0/)
  assert.match(output, /user -> account/)
})

test('identity check ignores a current-version manifest and compares the previous release', async (t) => {
  const fixture = await setupRenameFixtureWorkspace()
  t.after(() => fixture.cleanup())

  const currentManifest = join(fixture.iconsRoot, 'metadata', 'releases', '0.2.0.json')
  await writeFile(currentManifest, `${JSON.stringify({
    schemaVersion: 1,
    packageVersion: '0.2.0',
    icons: [{
      id: 'uicon_1b16fd12-7eb5-4c45-b872-e8e372e09920',
      sourceKey: RENAME_FIXTURE.sourceKey,
      name: RENAME_FIXTURE.currentName,
      componentName: 'AccountIcon',
    }],
  }, null, 2)}\n`)

  const output = execFileSync('node', ['scripts/check-icon-identity.mjs'], {
    cwd: fixture.iconsRoot,
    encoding: 'utf8',
  })
  assert.match(output, /Compared against release manifest 0\.1\.0/)
  assert.match(output, /user -> account/)
  assert.doesNotMatch(output, /Compared against release manifest 0\.2\.0/)
})

test('create-identity-manifest refuses to overwrite an existing release file', async (t) => {
  const fixture = await setupRenameFixtureWorkspace()
  t.after(() => fixture.cleanup())

  await writeFile(join(fixture.iconsRoot, 'metadata', 'releases', '0.2.0.json'), '{}\n')
  assert.throws(
    () => execFileSync('node', ['scripts/create-identity-manifest.mjs'], {
      cwd: fixture.iconsRoot,
      stdio: 'pipe',
    }),
    /must not be overwritten/,
  )
})
