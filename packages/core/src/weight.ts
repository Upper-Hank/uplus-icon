export const DEFAULT_ICON_WEIGHT = 2
export const MIN_ICON_WEIGHT = 0.5
export const MAX_ICON_WEIGHT = 2
export const MAX_ABSOLUTE_ICON_WEIGHT = 8

export interface IconWeightOptions {
  absoluteWeight?: boolean
  name?: string
  size?: number | string
  weight?: number
}

const numericAttribute = (name: string) => new RegExp(`(\\b${name}\\s*=\\s*)(["'])((?:-?\\d+(?:\\.\\d+)?)|(?:-?\\.\\d+))\\2`)

const formatNumber = (value: number) => String(Number(value.toFixed(4)))
const solidPathAnchors: Record<string, Array<[number, number]>> = {
  headset: [[14, 19.5]],
  'qr-code': [[7, 7], [17, 7], [7, 17]],
  textarea: [[19, 17]],
}

function readNumber(tag: string, name: string) {
  const value = tag.match(numericAttribute(name))?.[3]
  return value === undefined ? undefined : Number(value)
}

function replaceNumber(tag: string, name: string, update: (value: number) => number) {
  return tag.replace(numericAttribute(name), (_attribute, prefix: string, quote: string, value: string) => (
    `${prefix}${quote}${formatNumber(update(Number(value)))}${quote}`
  ))
}

export function resolveIconWeight(weight = DEFAULT_ICON_WEIGHT) {
  const finiteWeight = Number.isFinite(weight) ? weight : DEFAULT_ICON_WEIGHT
  return Math.min(MAX_ICON_WEIGHT, Math.max(MIN_ICON_WEIGHT, finiteWeight))
}

export function resolveAbsoluteIconWeight(weight = DEFAULT_ICON_WEIGHT) {
  const finiteWeight = Number.isFinite(weight) ? weight : DEFAULT_ICON_WEIGHT
  return Math.min(MAX_ABSOLUTE_ICON_WEIGHT, Math.max(MIN_ICON_WEIGHT, finiteWeight))
}

function hasAbsoluteSize({ absoluteWeight = false, size = 24 }: IconWeightOptions) {
  return absoluteWeight && typeof size === 'number' && Number.isFinite(size) && size > 0
}

/**
 * Applies weight to an adapted SVG body without changing paths or source assets.
 * Stroke widths retain their source ratios. Supported solid geometry uses a
 * separate continuous scale around audited anchors; complex solids stay fixed.
 */
export function resolveIconWeightScale({
  absoluteWeight = false,
  size = 24,
  weight = DEFAULT_ICON_WEIGHT,
}: IconWeightOptions = {}) {
  const isAbsolute = hasAbsoluteSize({ absoluteWeight, size })
  const relativeScale = (isAbsolute ? resolveAbsoluteIconWeight(weight) : resolveIconWeight(weight)) / DEFAULT_ICON_WEIGHT
  if (!isAbsolute) return relativeScale
  return relativeScale * (24 / (size as number))
}

function resolveIconSolidScale({
  absoluteWeight = false,
  size = 24,
  weight = DEFAULT_ICON_WEIGHT,
}: IconWeightOptions = {}) {
  const isAbsolute = hasAbsoluteSize({ absoluteWeight, size })
  const resolvedWeight = isAbsolute ? resolveAbsoluteIconWeight(weight) : resolveIconWeight(weight)
  const relativeScale = (resolvedWeight + 1) / 3
  if (!isAbsolute) return relativeScale
  return relativeScale * (24 / (size as number))
}

export function applyIconWeight(body: string, options: IconWeightOptions = {}) {
  const strokeScale = resolveIconWeightScale(options)
  const solidScale = resolveIconSolidScale(options)
  if (strokeScale === 1 && solidScale === 1) return body

  let solidPathIndex = 0

  return body.replace(/<(path|circle|ellipse|rect|line|polyline|polygon)\b[^>]*>/g, (source, element: string) => {
    let tag = replaceNumber(source, 'stroke-width', (value) => value * strokeScale)
    if (!/\bfill\s*=\s*(["'])currentColor\1/.test(tag)) return tag

    if (element === 'circle') return replaceNumber(tag, 'r', (value) => value * solidScale)
    if (element === 'ellipse') {
      tag = replaceNumber(tag, 'rx', (value) => value * solidScale)
      return replaceNumber(tag, 'ry', (value) => value * solidScale)
    }
    if (element === 'path') {
      const anchor = options.name ? solidPathAnchors[options.name]?.[solidPathIndex] : undefined
      solidPathIndex += 1
      if (!anchor) return tag

      const [anchorX, anchorY] = anchor
      return tag.replace(/\s*\/>$/, ` transform="translate(${anchorX} ${anchorY}) scale(${formatNumber(solidScale)}) translate(-${anchorX} -${anchorY})"/>`)
    }
    if (element !== 'rect') return tag

    const x = readNumber(tag, 'x')
    const y = readNumber(tag, 'y')
    const width = readNumber(tag, 'width')
    const height = readNumber(tag, 'height')
    if (x === undefined || y === undefined || width === undefined || height === undefined) return tag

    tag = replaceNumber(tag, 'x', () => x + (width * (1 - solidScale)) / 2)
    tag = replaceNumber(tag, 'width', () => width * solidScale)
    tag = replaceNumber(tag, 'rx', (value) => value * solidScale)
    tag = replaceNumber(tag, 'y', () => y + (height * (1 - solidScale)) / 2)
    tag = replaceNumber(tag, 'height', () => height * solidScale)
    return replaceNumber(tag, 'ry', (value) => value * solidScale)
  })
}
