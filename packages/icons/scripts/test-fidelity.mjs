import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { iconDefinitions } from '../dist/generated/definitions.js'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const rawDir = join(root, 'raw')
const definitions = new Map(iconDefinitions.map((icon) => [icon.name, icon]))
const files = (await readdir(rawDir)).filter((file) => file.endsWith('.svg')).sort()

for (const file of files) {
  const source = await readFile(join(rawDir, file), 'utf8')
  const match = source.match(/^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/)
  if (!match) throw new Error(`Cannot verify malformed source: ${file}`)
  const viewBox = match[1].match(/\bviewBox\s*=\s*(["'])(.*?)\1/)?.[2]
  const definition = definitions.get(basename(file, '.svg'))
  if (!definition) throw new Error(`Missing generated definition for ${file}`)
  if (definition.viewBox !== viewBox) throw new Error(`viewBox changed during generation: ${file}`)
  if (definition.body !== match[2]) throw new Error(`SVG body changed during generation: ${file}`)
}

if (definitions.size !== files.length) throw new Error('Generated definition count does not match source SVG count')
console.log(`Verified exact SVG body and viewBox fidelity for ${files.length} icons`)
