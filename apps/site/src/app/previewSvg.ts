import type { IconDefinition } from '@uplus-icon/core'
import { applyIconWeight } from '@uplus-icon/core/internal/weight'

export type StaticPreviewMode = 'master' | 'actual' | 'motion'

interface StaticPreviewSettings {
  absoluteWeight: boolean
  size: number
  weight: number
}

interface PreviewSvgOptions extends StaticPreviewSettings {
  color?: string
  definition: IconDefinition
}

const formatNumber = (value: number) => String(Number(value.toFixed(4)))

export function resolveStaticPreviewSettings(
  mode: StaticPreviewMode,
  size: number,
  weight: number,
  absoluteWeight: boolean,
): StaticPreviewSettings {
  return {
    size: mode === 'actual' ? size : 24,
    weight,
    absoluteWeight: mode === 'actual' && absoluteWeight,
  }
}

export function createPreviewSvg({
  definition,
  size,
  weight,
  absoluteWeight,
  color,
}: PreviewSvgOptions) {
  const resolvedSize = formatNumber(size)
  const body = applyIconWeight(definition.body, { absoluteWeight, name: definition.name, size, weight }).trim()

  const colorAttribute = color ? ` color="${color}"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${definition.viewBox}" width="${resolvedSize}" height="${resolvedSize}" fill="none"${colorAttribute}>\n${body}\n</svg>`
}
