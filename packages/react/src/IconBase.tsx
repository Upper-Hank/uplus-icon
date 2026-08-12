import type { IconDefinition } from '@uplus-icon/core'
import { applyIconWeight } from '@uplus-icon/core/internal/weight'
import { forwardRef, useMemo } from 'react'
import type { IconBaseProps } from './types.js'

export const IconBase = forwardRef<SVGSVGElement, IconBaseProps & { icon: IconDefinition }>(function IconBase(
  { icon, size = 24, weight = 2, absoluteWeight = false, title, 'aria-label': ariaLabel, ...props },
  ref,
) {
  const body = useMemo(
    () => applyIconWeight(icon.body, { absoluteWeight, name: icon.name, size, weight }),
    [absoluteWeight, icon.body, icon.name, size, weight],
  )

  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={icon.viewBox} width={size} height={size}
      fill="none" aria-hidden={title || ariaLabel ? undefined : true} aria-label={ariaLabel}
      role={title || ariaLabel ? 'img' : undefined} {...props}>
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: body }} />
    </svg>
  )
})
