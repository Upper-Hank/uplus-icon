import { access, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(root, 'dist')
const distFiles = await readdir(dist)
const iconFiles = (await readdir(join(dist, 'icons'))).filter((file) => file.endsWith('.js'))

if (iconFiles.length === 0) throw new Error('No per-icon JavaScript entries were built')
if (distFiles.some((file) => /^chunk-/.test(file))) throw new Error('Build contains unpredictable hashed chunks')

await access(join(dist, 'index.js'))
await access(join(dist, 'index.d.ts'))

const main = await import(join(dist, 'index.js'))
const dynamic = await import(join(dist, 'dynamic.js'))
const metadata = await import(join(dist, 'metadata.js'))
const search = await import(join(dist, 'icons', 'search.js'))

if (typeof main.SearchIcon !== 'object') throw new Error('Main SearchIcon export is missing')
if ('Icon' in main || 'iconMeta' in main) throw new Error('Static entry contains dynamic or metadata exports')
if (typeof dynamic.Icon !== 'object') throw new Error('Dynamic Icon export is missing')
if (!Array.isArray(metadata.iconMeta)) throw new Error('Metadata export is missing')
if (typeof search.default !== 'object') throw new Error('Default per-icon export is missing')

console.log(`Verified package entry points and ${iconFiles.length} per-icon modules`)
