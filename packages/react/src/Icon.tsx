import { forwardRef } from 'react'
import type { IconName } from '@uplus-icon/core/dynamic'
import { IconBase } from './IconBase.js'
import { resolveIconByName } from './resolve-icon.js'
import type { IconBaseProps } from './types.js'

export interface IconProps extends IconBaseProps { name: IconName }

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ name, ...props }, ref) {
  const icon = resolveIconByName(name)
  if (!icon) return null
  return <IconBase ref={ref} icon={icon} {...props} />
})
