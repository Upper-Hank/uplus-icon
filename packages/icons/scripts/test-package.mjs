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

const coreIconFiles = (await readdir(join(dist('core'), 'generated', 'icons'))).filter((file) => file.endsWith('.js'))
const reactIconFiles = (await readdir(join(dist('react'), 'generated', 'icons'))).filter((file) => file.endsWith('.js'))
const webIconFiles = (await readdir(join(dist('web'), 'generated', 'icons'))).filter((file) => file.endsWith('.js'))

if (coreIconFiles.length === 0 || coreIconFiles.length !== reactIconFiles.length || coreIconFiles.length !== webIconFiles.length) {
  throw new Error('Core, React, and Web per-icon outputs are missing or out of sync')
}

const core = await import(join(dist('core'), 'index.js'))
const metadata = await import(join(dist('core'), 'metadata.js'))
const react = await import(join(dist('react'), 'index.js'))
const reactDynamic = await import(join(dist('react'), 'dynamic.js'))
const web = await import(join(dist('web'), 'index.js'))
const webDynamic = await import(join(dist('web'), 'dynamic.js'))

if (Object.keys(core).length !== 0) throw new Error('Core root should only expose TypeScript types')
if (!Array.isArray(metadata.iconMeta) || !Array.isArray(metadata.iconCategories)) throw new Error('Core metadata exports are missing')
if (metadata.iconMeta.some((icon) => icon.categories.length === 0 || icon.tags.length === 0)) throw new Error('Generated icon metadata is incomplete')
if (typeof react.CheckIcon !== 'object' || typeof reactDynamic.Icon !== 'object') throw new Error('React exports are missing')
if (typeof web.CheckIcon !== 'function' || typeof webDynamic.Icon !== 'function') throw new Error('Web exports are missing')

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

console.log(`Verified three package entry-point sets and ${coreIconFiles.length} aligned per-icon modules`)
