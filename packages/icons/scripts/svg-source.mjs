const sharedGraphicAttributes = new Set([
  'data-part',
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

const allowedRootAttributes = new Set(['xmlns', 'width', 'height', 'viewBox', 'fill'])

export const sourceKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function parseAttributes(source, context) {
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

export function validateSvgBody(file, body, viewBox) {
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
  const parts = []
  const partNames = new Set()
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

    if (attributes['data-part'] !== undefined) {
      const part = attributes['data-part']
      if (!sourceKeyPattern.test(part)) {
        throw new Error(`${file} <${element}> data-part must use kebab-case: ${part}`)
      }
      if (partNames.has(part)) throw new Error(`${file} contains duplicate data-part: ${part}`)
      partNames.add(part)
      parts.push(part)
    }

    for (const [name, value] of Object.entries(attributes)) {
      if (/^on/i.test(name) || /(?:url\s*\(|javascript:|data:|https?:)/i.test(value)) {
        throw new Error(`${file} <${element}> contains an unsafe reference or event attribute`)
      }
      if ((name === 'fill' || name === 'stroke') && value !== 'none' && value !== 'black') {
        throw new Error(`${file} <${element}> design-source ${name} must be "none" or "black"`)
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
  return parts
}

/**
 * Validates a design-source SVG exactly as the generator does and returns its
 * structural facts. Throws on the first violation so callers never silently
 * accept an asset the generator would later reject.
 */
export function parseDesignSource(file, svg) {
  const match = svg.match(/^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/)
  if (!match) throw new Error(`${file} must contain exactly one root <svg> element`)

  const [, attributes, body] = match
  const viewBoxMatches = [...attributes.matchAll(/\bviewBox\s*=\s*(["'])(.*?)\1/g)]
  if (viewBoxMatches.length !== 1) throw new Error(`${file} must contain exactly one viewBox attribute`)

  const rootAttributes = parseAttributes(attributes, `${file} root <svg>`)
  const unsupportedRootAttributes = Object.keys(rootAttributes).filter((attribute) => !allowedRootAttributes.has(attribute))
  if (unsupportedRootAttributes.length > 0) throw new Error(`${file} uses unsupported root SVG attributes: ${unsupportedRootAttributes.join(', ')}`)
  if (rootAttributes.xmlns && rootAttributes.xmlns !== 'http://www.w3.org/2000/svg') throw new Error(`${file} uses an unsupported SVG namespace`)
  if (rootAttributes.fill && rootAttributes.fill !== 'none') throw new Error(`${file} root fill must be "none" so it can be preserved by runtimes`)

  const viewBox = viewBoxMatches[0][2]
  if (viewBox !== '0 0 24 24') throw new Error(`${file} must use viewBox="0 0 24 24"`)
  if (rootAttributes.width !== '24' || rootAttributes.height !== '24') throw new Error(`${file} root width and height must both be 24`)

  const parts = validateSvgBody(file, body, viewBox)
  return { body, parts, viewBox }
}
