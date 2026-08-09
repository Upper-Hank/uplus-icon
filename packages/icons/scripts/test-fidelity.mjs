import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { iconDefinitions } from '../../core/dist/generated/definitions.js'
import { adaptDesignSvgBody, compileRuntimeSvgBody } from './svg-adapter.mjs'

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
  const adaptedBody = adaptDesignSvgBody(match[2])
  const restoredBody = adaptedBody.replace(/\b(fill|stroke)(\s*=\s*)(["'])currentColor\3/g, '$1$2$3black$3')
  if (restoredBody !== match[2]) throw new Error(`Design-source adaptation changed content beyond black paint values: ${file}`)
  if (/\b(?:fill|stroke)\s*=\s*(["'])black\1/.test(adaptedBody)) throw new Error(`Adapted SVG still contains fixed black: ${file}`)
  if (definition.body !== compileRuntimeSvgBody(match[2])) throw new Error(`SVG body changed beyond approved color and runtime bindings: ${file}`)
}

if (definitions.size !== files.length) throw new Error('Generated definition count does not match source SVG count')
console.log(`Verified design-source fidelity and black-to-currentColor adaptation for ${files.length} icons`)
