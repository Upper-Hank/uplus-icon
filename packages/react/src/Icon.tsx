import { iconDefinitions, type IconName } from '@uplus-icon/core/dynamic'
import { forwardRef } from 'react'
import { IconBase } from './IconBase.js'
import type { IconBaseProps } from './types.js'

export interface IconProps extends IconBaseProps { name: IconName }

const iconMap = new Map(iconDefinitions.map((icon) => [icon.name, icon]))

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ name, ...props }, ref) {
  const icon = iconMap.get(name)
  if (!icon) return null
  return <IconBase ref={ref} icon={icon} {...props} />
})
