import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateMetadataReferences } from './validate-metadata.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const workspaceRoot = dirname(dirname(sourceRoot))
const rawDir = join(sourceRoot, 'raw')
const metadataFile = join(sourceRoot, 'metadata', 'icons.json')
const categoriesFile = join(sourceRoot, 'metadata', 'categories.json')
const outputRoots = {
  core: join(workspaceRoot, 'packages', 'core', 'src', 'generated'),
  react: join(workspaceRoot, 'packages', 'react', 'src', 'generated'),
  web: join(workspaceRoot, 'packages', 'web', 'src', 'generated'),
}
const temporaryRoots = Object.fromEntries(
  Object.entries(outputRoots).map(([name, path]) => [name, `${path}.tmp`]),
)
const toPascal = (name) => name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')
const sharedGraphicAttributes = new Set([
  'fill',
  'fill-rule',
  'clip-rule',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'opacity',
  'transform',
])
const allowedElements = new Map([
  ['g', sharedGraphicAttributes],
  ['path', new Set(['d', ...sharedGraphicAttributes])],
  ['circle', new Set(['cx', 'cy', 'r', ...sharedGraphicAttributes])],
  ['ellipse', new Set(['cx', 'cy', 'rx', 'ry', ...sharedGraphicAttributes])],
  ['rect', new Set(['x', 'y', 'width', 'height', 'rx', 'ry', ...sharedGraphicAttributes])],
  ['line', new Set(['x1', 'y1', 'x2', 'y2', ...sharedGraphicAttributes])],
  ['polyline', new Set(['points', ...sharedGraphicAttributes])],
  ['polygon', new Set(['points', ...sharedGraphicAttributes])],
])

function parseAttributes(source, context) {
  const parsed = [...source.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)]
  const remaining = parsed.reduce((value, attribute) => value.replace(attribute[0], ''), source).replace(/\/$/, '').trim()
  if (remaining) throw new Error(`${context} contains malformed attributes: ${remaining}`)

  const result = {}
  for (const attribute of parsed) {
    const [, name, , value] = attribute
    if (name in result) throw new Error(`${context} contains duplicate attribute: ${name}`)
    result[name] = value
  }
  return result
}

function validateSvgBody(file, body, viewBox) {
  if (/<!--[\s\S]*?-->/.test(body)) throw new Error(`${file} contains comments; remove design annotations before approval`)

  const tags = [...body.matchAll(/<\s*(\/?)\s*([:\w-]+)\b([^>]*)>/g)]
  const remainingText = body.replace(/<\s*\/?\s*[:\w-]+\b[^>]*>/g, '').trim()
  if (remainingText) throw new Error(`${file} contains unsupported text content`)

  const viewBoxParts = viewBox.trim().split(/[\s,]+/).map(Number)
  const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = viewBoxParts
  if (viewBoxParts.length !== 4 || viewBoxParts.some((value) => !Number.isFinite(value)) || viewBoxWidth <= 0 || viewBoxHeight <= 0) {
    throw new Error(`${file} uses an invalid viewBox`)
  }

  const openElements = []
  for (const [, closing, element, attributeSource] of tags) {
    if (closing) {
      const expected = openElements.pop()
      if (expected !== element) throw new Error(`${file} contains mismatched <${element}> markup`)
      continue
    }
    const allowedAttributes = allowedElements.get(element)
    if (!allowedAttributes) throw new Error(`${file} uses unsupported <${element}>; source icons must not contain masks, clips, defs, filters, or embedded content`)

    const attributes = parseAttributes(attributeSource, `${file} <${element}>`)
    const unsupported = Object.keys(attributes).filter((name) => !allowedAttributes.has(name))
    if (unsupported.length > 0) throw new Error(`${file} <${element}> uses unsupported attributes: ${unsupported.join(', ')}`)

    for (const [name, value] of Object.entries(attributes)) {
      if (/^on/i.test(name) || /(?:url\s*\(|javascript:|data:|https?:)/i.test(value)) {
        throw new Error(`${file} <${element}> contains an unsafe reference or event attribute`)
      }
      if ((name === 'fill' || name === 'stroke') && value !== 'none' && value !== 'currentColor') {
        throw new Error(`${file} <${element}> ${name} must be "none" or "currentColor"`)
      }
      if (name === 'stroke-width') {
        const strokeWidth = Number(value)
        if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value) || !Number.isFinite(strokeWidth) || strokeWidth < 0.5 || strokeWidth > 2) {
          throw new Error(`${file} <${element}> stroke-width must be a number from 0.5 to 2`)
        }
      }
      if (name === 'stroke-linecap' && !['butt', 'round', 'square'].includes(value)) {
        throw new Error(`${file} <${element}> uses an invalid stroke-linecap: ${value}`)
      }
      if (name === 'stroke-linejoin' && !['arcs', 'bevel', 'miter', 'miter-clip', 'round'].includes(value)) {
        throw new Error(`${file} <${element}> uses an invalid stroke-linejoin: ${value}`)
      }
    }

    if (element === 'rect') {
      const x = Number(attributes.x ?? 0)
      const y = Number(attributes.y ?? 0)
      const width = Number(attributes.width)
      const height = Number(attributes.height)
      if (x === viewBoxX && y === viewBoxY && width === viewBoxWidth && height === viewBoxHeight && attributes.fill !== 'none') {
        throw new Error(`${file} contains an opaque full-canvas rectangle; approved icons must have a transparent background`)
      }
    }

    if (!attributeSource.trim().endsWith('/')) openElements.push(element)
  }
  if (openElements.length > 0) throw new Error(`${file} contains unclosed <${openElements.at(-1)}> markup`)
}

function compileSvgBody(body) {
  return body.replace(
    /\bstroke-width\s*=\s*(["'])((?:\d+(?:\.\d+)?)|(?:\.\d+))\1/g,
    (_attribute, quote, width) => `stroke-width=${quote}var(--uplus-icon-stroke-width, ${width})${quote}`,
  ).replace(
    /<(path|circle|ellipse|rect|line|polyline|polygon)\b/g,
    '<$1 vector-effect="var(--uplus-icon-vector-effect, none)"',
  )
}

const files = (await readdir(rawDir)).filter((file) => file.endsWith('.svg')).sort()
const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
const categories = JSON.parse(await readFile(categoriesFile, 'utf8'))
const names = files.map((file) => basename(file, '.svg'))
const nameSet = new Set(names)
const unknownMetadata = Object.keys(metadata).filter((name) => !nameSet.has(name))
const missingMetadata = names.filter((name) => !(name in metadata))

if (unknownMetadata.length > 0) {
  throw new Error(`Metadata references missing icons: ${unknownMetadata.join(', ')}`)
}
if (missingMetadata.length > 0) {
  throw new Error(`Icons are missing metadata: ${missingMetadata.join(', ')}`)
}
if (!Array.isArray(categories) || categories.length === 0) throw new Error('Category metadata must be a non-empty array')

const categoryIds = new Set()
for (const [index, category] of categories.entries()) {
  const allowedFields = ['id', 'title', 'titleZh', 'description']
  const unknownFields = Object.keys(category).filter((field) => !allowedFields.includes(field))
  if (unknownFields.length > 0) throw new Error(`Unsupported category fields at index ${index}: ${unknownFields.join(', ')}`)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.id)) throw new Error(`Invalid category id at index ${index}: ${category.id}`)
  if (categoryIds.has(category.id)) throw new Error(`Duplicate category id: ${category.id}`)
  for (const field of ['title', 'titleZh', 'description']) {
    if (typeof category[field] !== 'string' || !category[field].trim()) throw new Error(`Category ${category.id}.${field} must be a non-empty string`)
  }
  categoryIds.add(category.id)
}

const icons = []

for (const file of files) {
  const name = basename(file, '.svg')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid icon filename: ${file}`)

  const svg = await readFile(join(rawDir, file), 'utf8')
  const match = svg.match(/^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/)
  if (!match) throw new Error(`${file} must contain exactly one root <svg> element`)

  const [, attributes, body] = match
  const viewBoxMatches = [...attributes.matchAll(/\bviewBox\s*=\s*(["'])(.*?)\1/g)]
  if (viewBoxMatches.length !== 1) throw new Error(`${file} must contain exactly one viewBox attribute`)
  const rootAttributes = parseAttributes(attributes, `${file} root <svg>`)
  const allowedRootAttributes = new Set(['xmlns', 'width', 'height', 'viewBox', 'fill'])
  const unsupportedRootAttributes = Object.keys(rootAttributes).filter((attribute) => !allowedRootAttributes.has(attribute))
  if (unsupportedRootAttributes.length > 0) throw new Error(`${file} uses unsupported root SVG attributes: ${unsupportedRootAttributes.join(', ')}`)
  if (rootAttributes.xmlns && rootAttributes.xmlns !== 'http://www.w3.org/2000/svg') throw new Error(`${file} uses an unsupported SVG namespace`)
  if (rootAttributes.fill && rootAttributes.fill !== 'none') throw new Error(`${file} root fill must be "none" so it can be preserved by runtimes`)
  if (viewBoxMatches[0][2] !== '0 0 24 24') throw new Error(`${file} must use viewBox="0 0 24 24"`)
  if (rootAttributes.width !== '24' || rootAttributes.height !== '24') throw new Error(`${file} root width and height must both be 24`)
  validateSvgBody(file, body, viewBoxMatches[0][2])

  const details = metadata[name]
  const allowedMetadata = ['title', 'titleZh', 'description', 'categories', 'tags', 'aliases', 'related', 'variants', 'parts', 'motion', 'contributors', 'deprecated', 'publishedIn', 'updatedIn']
  const unknownFields = Object.keys(details).filter((field) => !allowedMetadata.includes(field))
  if (unknownFields.length > 0) throw new Error(`Unsupported metadata for ${name}: ${unknownFields.join(', ')}`)
  for (const field of ['categories', 'tags', 'aliases']) {
    if (!Array.isArray(details[field])) throw new Error(`Metadata field ${name}.${field} must be an array`)
    if (details[field].some((value) => typeof value !== 'string' || !value.trim())) throw new Error(`Metadata field ${name}.${field} must only contain non-empty strings`)
    if (new Set(details[field]).size !== details[field].length) throw new Error(`Metadata field ${name}.${field} contains duplicate values`)
  }
  for (const field of ['related', 'variants', 'parts', 'contributors']) {
    if (details[field] === undefined) continue
    if (!Array.isArray(details[field]) || details[field].some((value) => typeof value !== 'string' || !value.trim())) {
      throw new Error(`Metadata field ${name}.${field} must only contain non-empty strings`)
    }
    if (new Set(details[field]).size !== details[field].length) throw new Error(`Metadata field ${name}.${field} contains duplicate values`)
  }
  if (details.description !== undefined && (
    typeof details.description !== 'object' || details.description === null ||
    typeof details.description.en !== 'string' || !details.description.en.trim() ||
    typeof details.description.zh !== 'string' || !details.description.zh.trim()
  )) throw new Error(`Metadata field ${name}.description must contain non-empty en and zh strings`)
  if (details.motion !== undefined) {
    const { generic, semantic, transitions } = details.motion
    if (!Array.isArray(generic) || !Array.isArray(semantic) || !Array.isArray(transitions)) {
      throw new Error(`Metadata field ${name}.motion must contain generic, semantic, and transitions arrays`)
    }
    if ([...generic, ...semantic].some((value) => typeof value !== 'string' || !value.trim())) {
      throw new Error(`Metadata field ${name}.motion capabilities must be non-empty strings`)
    }
    if (transitions.some((entry) => typeof entry !== 'object' || entry === null || typeof entry.to !== 'string' || !entry.to || typeof entry.name !== 'string' || !entry.name)) {
      throw new Error(`Metadata field ${name}.motion.transitions contains an invalid transition`)
    }
  }
  if (typeof details.title !== 'string' || !details.title.trim()) throw new Error(`Metadata field ${name}.title must be a non-empty string`)
  if (typeof details.titleZh !== 'string' || !details.titleZh.trim()) throw new Error(`Metadata field ${name}.titleZh must be a non-empty string`)
  if (details.categories.length === 0) throw new Error(`Metadata field ${name}.categories must include a primary category`)
  if (details.tags.length === 0) throw new Error(`Metadata field ${name}.tags must not be empty`)
  const unknownCategories = details.categories.filter((category) => !categoryIds.has(category))
  if (unknownCategories.length > 0) throw new Error(`Metadata for ${name} references unknown categories: ${unknownCategories.join(', ')}`)
  icons.push({
    name,
    componentName: `${toPascal(name)}Icon`,
    viewBox: viewBoxMatches[0][2],
    body: compileSvgBody(body),
    title: details.title,
    titleZh: details.titleZh,
    categories: details.categories,
    tags: details.tags,
    aliases: details.aliases,
    ...(details.description === undefined ? {} : { description: details.description }),
    ...(details.related === undefined ? {} : { related: details.related }),
    ...(details.variants === undefined ? {} : { variants: details.variants }),
    ...(details.parts === undefined ? {} : { parts: details.parts }),
    ...(details.motion === undefined ? {} : { motion: details.motion }),
    ...(details.contributors === undefined ? {} : { contributors: details.contributors }),
    deprecated: details.deprecated ?? false,
    publishedIn: details.publishedIn ?? null,
    updatedIn: details.updatedIn ?? null,
  })
}

validateMetadataReferences(metadata, nameSet)

for (const path of Object.values(temporaryRoots)) {
  await rm(path, { recursive: true, force: true })
  await mkdir(join(path, 'icons'), { recursive: true })
}

const generatedNotice = '// Generated by packages/icons/scripts/generate.mjs. Do not edit directly.\n'
const iconNameType = names.map((name) => `  | '${name}'`).join('\n')
await writeFile(join(temporaryRoots.core, 'names.ts'), `${generatedNotice}export type IconName =\n${iconNameType}\n`)
const categoryIdType = categories.map(({ id }) => `  | '${id}'`).join('\n')
await writeFile(join(temporaryRoots.core, 'category-names.ts'), `${generatedNotice}export type IconCategoryId =\n${categoryIdType}\n`)
await writeFile(join(temporaryRoots.core, 'categories.ts'), `${generatedNotice}import type { IconCategory } from '../types.js'\n\nexport const iconCategories: readonly IconCategory[] = ${JSON.stringify(categories, null, 2)}\n`)

const definitions = icons.map(({ name, viewBox, body }) => ({ name, viewBox, body }))
await writeFile(join(temporaryRoots.core, 'definitions.ts'), `${generatedNotice}import type { IconDefinition } from '../types.js'\n\nexport const iconDefinitions: readonly IconDefinition[] = ${JSON.stringify(definitions, null, 2)}\n`)

const catalog = icons.map(({ body: _body, viewBox: _viewBox, ...entry }) => entry)
await writeFile(join(temporaryRoots.core, 'metadata.ts'), `${generatedNotice}import type { IconMeta } from '../types.js'\n\nexport const iconMeta: readonly IconMeta[] = ${JSON.stringify(catalog, null, 2)}\n`)

await writeFile(join(temporaryRoots.react, 'components.ts'), `${generatedNotice}${icons.map(({ name, componentName }) => `export { ${componentName} } from './icons/${name}.js'`).join('\n')}\n`)
await writeFile(join(temporaryRoots.web, 'components.ts'), `${generatedNotice}${icons.map(({ name, componentName }) => `export { ${componentName} } from './icons/${name}.js'`).join('\n')}\n`)

for (const { name, componentName, viewBox, body } of icons) {
  const definition = JSON.stringify({ name, viewBox, body }, null, 2)
  await writeFile(join(temporaryRoots.core, 'icons', `${name}.ts`), `${generatedNotice}import type { IconDefinition } from '../../types.js'\n\nconst icon = ${definition} as const satisfies IconDefinition\n\nexport default icon\n`)
  await writeFile(join(temporaryRoots.react, 'icons', `${name}.tsx`), `${generatedNotice}import icon from '@uplus-icon/core/icons/${name}'\nimport { createIcon } from '../../createIcon.js'\n\nexport const ${componentName} = createIcon(icon)\nexport default ${componentName}\n`)
  await writeFile(join(temporaryRoots.web, 'icons', `${name}.ts`), `${generatedNotice}import icon from '@uplus-icon/core/icons/${name}'\nimport { createIcon } from '../../createIcon.js'\nimport type { IconOptions } from '../../types.js'\n\nexport const ${componentName} = (options: IconOptions = {}) => createIcon(icon, options)\nexport default ${componentName}\n`)
}

for (const [name, path] of Object.entries(outputRoots)) {
  await rm(path, { recursive: true, force: true })
  await rename(temporaryRoots[name], path)
}

console.log(`Generated ${icons.length} icons for core, React, and Web without altering SVG sources`)
