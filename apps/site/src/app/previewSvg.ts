import type { IconDefinition } from '@uplus-icon/core'

export type StaticPreviewMode = 'master' | 'actual' | 'motion'

interface StaticPreviewSettings {
  absoluteStrokeWidth: boolean
  size: number
  strokeWidth: number
}

interface PreviewSvgOptions extends StaticPreviewSettings {
  definition: IconDefinition
}

const strokeWidthVariable = /var\(\s*--uplus-icon-stroke-width\s*,\s*(?:\d+(?:\.\d+)?|\.\d+)\s*\)/g
const vectorEffectAttribute = /\s+vector-effect\s*=\s*(["'])var\(\s*--uplus-icon-vector-effect\s*,\s*none\s*\)\1/g

const formatNumber = (value: number) => String(Number(value.toFixed(4)))

export function resolveStaticPreviewSettings(
  mode: StaticPreviewMode,
  size: number,
  strokeWidth: number,
  absoluteStrokeWidth: boolean,
): StaticPreviewSettings {
  return {
    size: mode === 'actual' ? size : 24,
    strokeWidth,
    absoluteStrokeWidth: mode === 'actual' && absoluteStrokeWidth,
  }
}

export function createPreviewSvg({
  definition,
  size,
  strokeWidth,
  absoluteStrokeWidth,
}: PreviewSvgOptions) {
  const resolvedSize = formatNumber(size)
  const resolvedStrokeWidth = formatNumber(strokeWidth)
  const body = definition.body.trim()
    .replace(strokeWidthVariable, resolvedStrokeWidth)
    .replace(
      vectorEffectAttribute,
      absoluteStrokeWidth ? ' vector-effect="non-scaling-stroke"' : '',
    )

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${definition.viewBox}" width="${resolvedSize}" height="${resolvedSize}" fill="none">\n${body}\n</svg>`
}
