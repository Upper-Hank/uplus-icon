import { execFileSync } from 'node:child_process'
import { access, mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const packagesRoot = dirname(sourceRoot)
const workspaceRoot = dirname(packagesRoot)
const dist = (name) => join(packagesRoot, name, 'dist')
const rootLicense = await readFile(join(workspaceRoot, 'LICENSE'), 'utf8')

for (const name of ['core', 'react', 'web']) {
  await access(join(dist(name), 'index.js'))
  await access(join(dist(name), 'index.d.ts'))
  const packageLicense = await readFile(join(packagesRoot, name, 'LICENSE'), 'utf8')
  if (packageLicense !== rootLicense) throw new Error(`${name} package license differs from the repository license`)
}

for (const [name, files] of Object.entries({
  core: ['dynamic.js', 'dynamic.d.ts'],
  react: ['dynamic.js', 'dynamic.d.ts', 'Icon.js', 'Icon.d.ts'],
  web: ['dynamic.js', 'dynamic.d.ts', 'Icon.js', 'Icon.d.ts', 'element.js', 'element.d.ts'],
})) {
  for (const file of files) {
    try {
      await access(join(dist(name), file))
      throw new Error(`${name}/dist/${file} must not ship in v1`)
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
}

for (const name of ['core', 'react', 'web']) {
  const manifest = JSON.parse(await readFile(join(packagesRoot, name, 'package.json'), 'utf8'))
  if ('./dynamic' in manifest.exports) throw new Error(`${name} must not publish the dynamic entry in v1`)
  if (name === 'web' && './element' in manifest.exports) throw new Error('web must not publish the name-based custom element in v1')
}

const coreIconFiles = (await readdir(join(dist('core'), 'generated', 'icons'))).filter((file) => file.endsWith('.js'))
const reactIconFiles = (await readdir(join(dist('react'), 'generated', 'icons'))).filter((file) => file.endsWith('.js'))
const webIconFiles = (await readdir(join(dist('web'), 'generated', 'icons'))).filter((file) => file.endsWith('.js'))

if (coreIconFiles.length === 0 || coreIconFiles.length !== reactIconFiles.length || coreIconFiles.length !== webIconFiles.length) {
  throw new Error('Core, React, and Web per-icon outputs are missing or out of sync')
}

const core = await import(join(dist('core'), 'index.js'))
const metadata = await import(join(dist('core'), 'metadata.js'))
const react = await import(join(dist('react'), 'index.js'))
const web = await import(join(dist('web'), 'index.js'))

if (Object.keys(core).length !== 0) throw new Error('Core root should only expose TypeScript types')
if (!Array.isArray(metadata.iconMeta) || !Array.isArray(metadata.iconCategories)) throw new Error('Core metadata exports are missing')
if (metadata.iconMeta.some((icon) => icon.categories.length === 0 || icon.tags.length === 0)) throw new Error('Generated icon metadata is incomplete')
if (metadata.iconMeta.some((icon) => 'motion' in icon)) throw new Error('First-release metadata must not expose Motion capabilities')
if (typeof react.PlusIcon !== 'object') throw new Error('React static exports are missing')
if (typeof web.PlusIcon !== 'function') throw new Error('Web static exports are missing')

const cache = await mkdtemp(join(tmpdir(), 'uplus-icon-pack-cache-'))
try {
  for (const packageName of ['@uplus-icon/core', '@uplus-icon/react', '@uplus-icon/web']) {
    const output = execFileSync(
      'npm',
      ['pack', '--dry-run', '--json', '--cache', cache, '-w', packageName],
      { cwd: workspaceRoot, encoding: 'utf8' },
    )
    const packed = JSON.parse(output)[0]
    const files = new Set(packed.files.map(({ path }) => path))
    for (const required of ['README.md', 'LICENSE', 'package.json']) {
      if (!files.has(required)) throw new Error(`${packageName} tarball is missing ${required}`)
    }
  }
} finally {
  await rm(cache, { recursive: true, force: true })
}

console.log(`Verified static public package entries and ${coreIconFiles.length} aligned per-icon modules`)
