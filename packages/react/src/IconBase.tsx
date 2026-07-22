import type { IconDefinition } from '@uplus-icon/core'
import { forwardRef } from 'react'
import type { IconBaseProps } from './types.js'

const clampStrokeWidth = (value: number) => Math.min(2, Math.max(0.5, Number.isFinite(value) ? value : 2))

export const IconBase = forwardRef<SVGSVGElement, IconBaseProps & { icon: IconDefinition }>(function IconBase(
  { icon, size = 24, strokeWidth, absoluteStrokeWidth = false, title, style, 'aria-label': ariaLabel, ...props },
  ref,
) {
  const iconStyle = {
    ...style,
    ...(strokeWidth === undefined ? {} : { '--uplus-icon-stroke-width': clampStrokeWidth(strokeWidth) }),
    ...(absoluteStrokeWidth ? { '--uplus-icon-vector-effect': 'non-scaling-stroke' } : {}),
  }

  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={icon.viewBox} width={size} height={size}
      fill="none" aria-hidden={title || ariaLabel ? undefined : true} aria-label={ariaLabel}
      role={title || ariaLabel ? 'img' : undefined} style={iconStyle} {...props}>
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: icon.body }} />
    </svg>
  )
})
