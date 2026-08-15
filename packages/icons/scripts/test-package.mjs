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

for (const name of ['core', 'react']) {
  await access(join(dist(name), 'index.js'))
  await access(join(dist(name), 'index.d.ts'))
  const packageLicense = await readFile(join(packagesRoot, name, 'LICENSE'), 'utf8')
  if (packageLicense !== rootLicense) throw new Error(`${name} package license differs from the repository license`)
}

for (const [name, files] of Object.entries({
  core: ['dynamic.js', 'dynamic.d.ts'],
  react: ['dynamic.js', 'dynamic.d.ts', 'Icon.js', 'Icon.d.ts'],
})) {
  for (const file of files) {
    await access(join(dist(name), file))
  }
}

for (const name of ['core', 'react']) {
  const manifest = JSON.parse(await readFile(join(packagesRoot, name, 'package.json'), 'utf8'))
  if (!('./dynamic' in manifest.exports)) throw new Error(`${name} must publish the explicit dynamic entry`)
}

const coreIconFiles = (await readdir(join(dist('core'), 'generated', 'icons'))).filter((file) => file.endsWith('.js'))
const reactIconFiles = (await readdir(join(dist('react'), 'generated', 'icons'))).filter((file) => file.endsWith('.js'))
if (coreIconFiles.length === 0 || coreIconFiles.length !== reactIconFiles.length) {
  throw new Error('Core and React per-icon outputs are missing or out of sync')
}

const core = await import(join(dist('core'), 'index.js'))
const metadata = await import(join(dist('core'), 'metadata.js'))
const react = await import(join(dist('react'), 'index.js'))

if (Object.keys(core).length !== 0) throw new Error('Core root should only expose TypeScript types')
if (!Array.isArray(metadata.iconMeta) || !Array.isArray(metadata.iconCategories)) throw new Error('Core metadata exports are missing')
if (metadata.iconMeta.some((icon) => icon.categories.length === 0 || icon.tags.length === 0)) throw new Error('Generated icon metadata is incomplete')
if (metadata.iconMeta.some((icon) => typeof icon.catalogOrder !== 'number')) throw new Error('Generated icon metadata is missing catalogOrder')
if (metadata.iconMeta.some((icon) => 'motion' in icon)) throw new Error('Public metadata must not expose incubating Motion capabilities')
if (typeof react.PlusIcon !== 'object') throw new Error('React static exports are missing')

const cache = await mkdtemp(join(tmpdir(), 'uplus-icon-pack-cache-'))
try {
  for (const packageName of ['@uplus-icon/core', '@uplus-icon/react']) {
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

console.log(`Verified Core and React public entries with ${coreIconFiles.length} aligned per-icon modules`)
