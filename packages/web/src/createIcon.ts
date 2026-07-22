import type { IconDefinition } from '@uplus-icon/core'
import type { IconOptions } from './types.js'

const svgNamespace = 'http://www.w3.org/2000/svg'
const clampStrokeWidth = (value: number) => Math.min(2, Math.max(0.5, Number.isFinite(value) ? value : 2))

export function createIcon(icon: IconDefinition, options: IconOptions = {}): SVGSVGElement {
  const { size = 24, strokeWidth, absoluteStrokeWidth = false, title, ariaLabel, className, attributes = {} } = options
  const svg = document.createElementNS(svgNamespace, 'svg')
  svg.setAttribute('xmlns', svgNamespace)
  svg.setAttribute('viewBox', icon.viewBox)
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('fill', 'none')
  if (strokeWidth !== undefined) svg.style.setProperty('--uplus-icon-stroke-width', String(clampStrokeWidth(strokeWidth)))
  if (absoluteStrokeWidth) svg.style.setProperty('--uplus-icon-vector-effect', 'non-scaling-stroke')

  if (className) svg.setAttribute('class', className)
  if (ariaLabel) svg.setAttribute('aria-label', ariaLabel)
  if (title || ariaLabel) svg.setAttribute('role', 'img')
  else svg.setAttribute('aria-hidden', 'true')

  for (const [name, value] of Object.entries(attributes)) {
    if (value === null || value === undefined || value === false) continue
    svg.setAttribute(name, value === true ? '' : String(value))
  }

  if (title) {
    const titleElement = document.createElementNS(svgNamespace, 'title')
    titleElement.textContent = title
    svg.append(titleElement)
  }

  const body = document.createElementNS(svgNamespace, 'g')
  body.innerHTML = icon.body
  svg.append(body)
  return svg
}
