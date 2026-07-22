import { access, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const packagesRoot = dirname(sourceRoot)
const dist = (name) => join(packagesRoot, name, 'dist')

for (const name of ['core', 'react', 'web']) {
  await access(join(dist(name), 'index.js'))
  await access(join(dist(name), 'index.d.ts'))
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

console.log(`Verified three package entry-point sets and ${coreIconFiles.length} aligned per-icon modules`)
