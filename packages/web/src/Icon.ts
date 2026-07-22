import { iconDefinitions, type IconName } from '@uplus-icon/core/dynamic'
import { createIcon } from './createIcon.js'
import type { IconOptions } from './types.js'

const iconMap = new Map(iconDefinitions.map((icon) => [icon.name, icon]))

export function Icon(name: IconName, options: IconOptions = {}): SVGSVGElement | null {
  const icon = iconMap.get(name)
  return icon ? createIcon(icon, options) : null
}
