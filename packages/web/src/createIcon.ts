import type { IconDefinition } from '@uplus-icon/core'
import { applyIconWeight } from '@uplus-icon/core/internal/weight'
import type { IconOptions } from './types.js'

const svgNamespace = 'http://www.w3.org/2000/svg'

export function createIcon(icon: IconDefinition, options: IconOptions = {}): SVGSVGElement {
  const { size = 24, weight = 2, absoluteWeight = false, title, ariaLabel, className, attributes = {} } = options
  const svg = document.createElementNS(svgNamespace, 'svg')
  svg.setAttribute('xmlns', svgNamespace)
  svg.setAttribute('viewBox', icon.viewBox)
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('fill', 'none')

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
  body.innerHTML = applyIconWeight(icon.body, { absoluteWeight, name: icon.name, size, weight })
  svg.append(body)
  return svg
}
